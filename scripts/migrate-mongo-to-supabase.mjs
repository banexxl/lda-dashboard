#!/usr/bin/env node
// One-time cutover script: copies existing content from MongoDB (LDA_DB) into the new
// Supabase Postgres schema (supabase/migrations/0001_init.sql), and re-uploads every
// referenced S3 file into Supabase Storage.
//
// Usage:
//   node scripts/migrate-mongo-to-supabase.mjs --dry-run   (reads Mongo, writes nothing)
//   node scripts/migrate-mongo-to-supabase.mjs             (live run)
//   node scripts/migrate-mongo-to-supabase.mjs --force     (re-run even if a target table already has rows)
//
// Requires in .env: MONGODB_URI (source), NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY.
// `mongodb` and `dotenv` are devDependencies used only by this script -- not imported
// by the app, so they don't affect the production bundle.

import 'dotenv/config';
import dns from 'node:dns';
import crypto from 'node:crypto';
import { MongoClient } from 'mongodb';
import { createClient } from '@supabase/supabase-js';
import https from 'node:https';

// Node's own resolver (used internally for mongodb+srv:// SRV/TXT lookups) can fail
// with ECONNREFUSED on some Windows/VPN setups even when the OS resolver (nslookup)
// works fine. Forcing a public DNS server here works around that.
dns.setServers(['8.8.8.8', '1.1.1.1']);

const DRY_RUN = process.argv.includes('--dry-run');
const FORCE = process.argv.includes('--force');

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'LDA_DB';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;
const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'lda-media';

if (!MONGODB_URI) {
     console.error('Missing MONGODB_URI in .env (the real production connection string, not the localhost placeholder).');
     process.exit(1);
}
if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
     console.error('Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SECRET_KEY in .env.');
     process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
     auth: { autoRefreshToken: false, persistSession: false },
});

// ---------------------------------------------------------------------------
// File re-upload (S3 -> Supabase Storage), with in-memory caching so the same
// URL referenced from multiple rows (e.g. a publication linked from both a
// project activity and the publications list) is only downloaded/uploaded once.
// ---------------------------------------------------------------------------
const urlCache = new Map();

function extractKeyFromUrl(url) {
     const idx = url.indexOf('.com/');
     if (idx === -1) return null;
     return decodeURIComponent(url.slice(idx + 5).split('?')[0]);
}

// Supabase Storage keys are much stricter than S3's -- spaces, diacritics, colons,
// parens, and non-Latin scripts (which S3 tolerated fine) get rejected as "Invalid
// key". Sanitize every path segment to a safe slug; fall back to a short hash if a
// segment (e.g. an all-Cyrillic folder name) sanitizes down to nothing. Must match
// sanitizeKeySegment() in src/app/api/storage/route.ts.
const DIACRITIC_MAP = {
     'č': 'c', 'ć': 'c', 'ž': 'z', 'š': 's', 'đ': 'd',
     'Č': 'C', 'Ć': 'C', 'Ž': 'Z', 'Š': 'S', 'Đ': 'D',
};

function sanitizeKeySegment(segment) {
     let s = segment.replace(/[čćžšđČĆŽŠĐ]/g, (ch) => DIACRITIC_MAP[ch] ?? ch);
     s = s.normalize('NFKD').replace(/[̀-ͯ]/g, '');
     s = s.replace(/[^A-Za-z0-9._-]+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
     if (!s) {
          s = crypto.createHash('md5').update(segment).digest('hex').slice(0, 10);
     }
     return s;
}

function sanitizeKey(key) {
     return key.split('/').map(sanitizeKeySegment).join('/');
}

const CONTENT_TYPES = {
     png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp',
     mp4: 'video/mp4', webm: 'video/webm', mov: 'video/quicktime', avi: 'video/x-msvideo',
     pdf: 'application/pdf', doc: 'application/msword',
     docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
     xls: 'application/vnd.ms-excel',
     xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};

function guessContentType(key) {
     const ext = key.split('.').pop()?.toLowerCase() || '';
     return CONTENT_TYPES[ext] || 'application/octet-stream';
}

function fetchBuffer(url, redirects = 0) {
     return new Promise((resolve, reject) => {
          if (redirects > 5) return reject(new Error('Too many redirects'));
          https.get(url, (res) => {
               if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                    res.resume();
                    return fetchBuffer(res.headers.location, redirects + 1).then(resolve, reject);
               }
               if (res.statusCode !== 200) {
                    res.resume();
                    return reject(new Error(`GET ${url} -> HTTP ${res.statusCode}`));
               }
               const chunks = [];
               res.on('data', (c) => chunks.push(c));
               res.on('end', () => resolve(Buffer.concat(chunks)));
               res.on('error', reject);
          }).on('error', reject);
     });
}

async function migrateFile(url) {
     if (!url) return url || '';
     if (urlCache.has(url)) return urlCache.get(url);

     const key = extractKeyFromUrl(url);
     if (!key) {
          console.warn(`  ! could not parse a storage key from URL, leaving as-is: ${url}`);
          urlCache.set(url, url);
          return url;
     }

     if (DRY_RUN) {
          urlCache.set(url, url);
          return url;
     }

     try {
          const buffer = await fetchBuffer(url);
          const safeKey = sanitizeKey(key);
          const contentType = guessContentType(safeKey);
          const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(safeKey, buffer, { contentType, upsert: true });
          if (error) throw error;
          const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(safeKey);
          urlCache.set(url, data.publicUrl);
          return data.publicUrl;
     } catch (err) {
          console.warn(`  ! failed to migrate file (${err.message}), leaving original URL: ${url}`);
          urlCache.set(url, url);
          return url;
     }
}

async function migrateFileArray(urls) {
     if (!Array.isArray(urls)) return [];
     const out = [];
     for (const u of urls) out.push(await migrateFile(u));
     return out;
}

// ---------------------------------------------------------------------------
// Guard: skip a target table if it already has rows, unless --force.
// ---------------------------------------------------------------------------
async function shouldMigrate(table) {
     if (FORCE) return true;
     const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
     if (error) throw error;
     const empty = (count ?? 0) === 0;
     if (!empty) console.log(`- ${table}: already has rows, skipping (pass --force to add anyway)`);
     return empty;
}

async function main() {
     console.log(DRY_RUN ? 'DRY RUN -- reading Mongo only, no Supabase writes, no file uploads.\n' : 'LIVE RUN.\n');

     const mongoClient = new MongoClient(MONGODB_URI);
     await mongoClient.connect();
     const db = mongoClient.db(MONGODB_DB_NAME);

     // Maps the old ProjectSummaries slug (bare, no "/pregled-projekta/" prefix) to
     // the newly-inserted project_summaries.id, so project_activities can resolve its
     // real FK.
     const summaryUrlToNewId = new Map();

     // 1. admin_allowlist <- Auth
     if (await shouldMigrate('admin_allowlist')) {
          const authDocs = await db.collection('Auth').find({}).toArray();
          console.log(`Auth: ${authDocs.length} docs`);
          for (const doc of authDocs) {
               if (!doc.email) continue;
               if (!DRY_RUN) {
                    const { error } = await supabase.from('admin_allowlist').upsert({ email: doc.email }, { onConflict: 'email' });
                    if (error) console.warn(`  ! admin_allowlist upsert failed for ${doc.email}: ${error.message}`);
               }
          }
     }

     // 2. project_summaries <- ProjectSummaries (+ project_summary_entries from the old
     //    parallel-array $push fields)
     if (await shouldMigrate('project_summaries')) {
          const docs = await db.collection('ProjectSummaries').find({}).toArray();
          console.log(`ProjectSummaries: ${docs.length} docs`);
          for (const doc of docs) {
               const row = {
                    title: doc.title || '',
                    project_summary_url: doc.projectSummaryURL || '',
                    project_summary_cover_url: await migrateFile(doc.projectSummaryCoverURL),
                    status: doc.status || 'to-do',
                    category: doc.category || 'other',
                    project_start_date_time: doc.projectStartDateTime ? new Date(doc.projectStartDateTime).toISOString() : null,
                    project_end_date_time: doc.projectEndDateTime ? new Date(doc.projectEndDateTime).toISOString() : null,
                    organizers: doc.organizers || [],
                    locations: doc.locations || [],
                    applicants: doc.applicants || [],
                    donators: doc.donators || [],
                    publications: await migrateFileArray(doc.publications),
                    links: doc.links || [],
                    gallery: await migrateFileArray(doc.gallery),
                    locale: doc.locale || 'sr',
               };

               if (!row.project_summary_url) {
                    console.warn(`  ! ProjectSummary "${row.title}" has no projectSummaryURL, skipping`);
                    continue;
               }

               let newId;
               if (!DRY_RUN) {
                    const { data, error } = await supabase.from('project_summaries').insert(row).select('id').single();
                    if (error) {
                         console.warn(`  ! insert failed for project summary ${row.project_summary_url}: ${error.message}`);
                         continue;
                    }
                    newId = data.id;
               } else {
                    newId = `dry-run:${row.project_summary_url}`;
               }
               summaryUrlToNewId.set(row.project_summary_url, newId);

               // $push always produced an array, regardless of the (buggy, singular)
               // field name -- projectSummaryDateTime is an array here despite the name.
               const descriptions = doc.projectSummaryDescriptions || [];
               const subtitleUrls = doc.projectSummarySubtitleURLs || [];
               const dateTimes = doc.projectSummaryDateTime || [];
               const subtitles = doc.projectSummarySubtitles || [];
               const entryCount = Math.max(descriptions.length, subtitleUrls.length, dateTimes.length, subtitles.length);

               for (let i = 0; i < entryCount; i++) {
                    const entry = {
                         project_summary_id: newId,
                         description: descriptions[i] ?? null,
                         subtitle_url: subtitleUrls[i] ?? null,
                         entry_date_time: dateTimes[i] ? new Date(dateTimes[i]).toISOString() : null,
                         subtitle: subtitles[i] ?? null,
                         sort_order: i,
                    };
                    if (!DRY_RUN) {
                         const { error } = await supabase.from('project_summary_entries').insert(entry);
                         if (error) console.warn(`  ! entry insert failed for ${row.project_summary_url}[${i}]: ${error.message}`);
                    }
               }
          }
     } else {
          // project_summaries already populated (or --dry-run skipped writes on a prior
          // attempt) -- still need the slug -> id map for project_activities below.
          const { data } = await supabase.from('project_summaries').select('id, project_summary_url');
          for (const row of data || []) summaryUrlToNewId.set(row.project_summary_url, row.id);
     }

     // 3. project_activities <- Projects
     if (await shouldMigrate('project_activities')) {
          const docs = await db.collection('Projects').find({}).toArray();
          console.log(`Projects: ${docs.length} docs`);
          // Same story as Activities: a couple of old docs share a projectURL slug.
          const seenProjectUrls = new Set();
          for (const doc of docs) {
               const cleanSummaryUrl = (doc.projectSummaryURL || '').replace('/pregled-projekta/', '');
               const projectSummaryId = summaryUrlToNewId.get(cleanSummaryUrl) || null;
               if (!projectSummaryId) {
                    console.warn(`  ! could not resolve parent project summary for "${doc.title}" (looked up: "${cleanSummaryUrl}")`);
               }

               let projectUrl = doc.projectURL || '';
               if (projectUrl && seenProjectUrls.has(projectUrl)) {
                    let n = 2;
                    while (seenProjectUrls.has(`${projectUrl}-${n}`)) n++;
                    console.warn(`  ! duplicate projectURL "${projectUrl}", renaming to "${projectUrl}-${n}"`);
                    projectUrl = `${projectUrl}-${n}`;
               }
               if (projectUrl) seenProjectUrls.add(projectUrl);

               const row = {
                    project_summary_id: projectSummaryId,
                    title: doc.title || '',
                    sub_title: doc.subTitle || '',
                    title_eng: doc.title_eng || '',
                    sub_title_eng: doc.subTitle_eng || '',
                    has_translation: !!doc.hasTranslation,
                    paragraphs: doc.paragraphs || [],
                    paragraphs_eng: doc.paragraphs_eng || [],
                    quill_editor_data: doc.quillEditorData || '',
                    content_html: doc.contentHtml || '',
                    content_html_eng: doc.contentHtmlEng || '',
                    project_url: projectUrl,
                    published: doc.published ? new Date(doc.published).toISOString() : null,
                    status: doc.status || 'to-do',
                    // A handful of old docs have category "/" -- junk data, not a real value.
                    category: (!doc.category || doc.category === '/') ? 'other' : doc.category,
                    gallery: await migrateFileArray(doc.gallery),
                    links: doc.links || [],
                    list: doc.list || [],
                    list_title: doc.listTitle || '',
                    favorited: !!doc.favorited,
                    favorited_number: doc.favoritedNumber ?? null,
                    organizers: doc.organizers || [],
                    sub_organizers: doc.subOrganizers || [],
                    applicants: doc.applicants || [],
                    donators: doc.donators || [],
                    locations: doc.locations || [],
                    publications: await migrateFileArray(doc.publications),
                    show_project_details: !!doc.showProjectDetails,
                    show_list: !!doc.showList,
                    show_list_on_bottom: !!doc.showListOnBottom,
                    locale: doc.locale || 'sr',
               };

               if (!row.project_url) {
                    console.warn(`  ! Project "${row.title}" has no projectURL, skipping`);
                    continue;
               }

               if (!DRY_RUN) {
                    const { error } = await supabase.from('project_activities').insert(row);
                    if (error) console.warn(`  ! insert failed for project activity ${row.project_url}: ${error.message}`);
               }
          }
     }

     // 4. activities <- Activities
     if (await shouldMigrate('activities')) {
          const docs = await db.collection('Activities').find({}).toArray();
          console.log(`Activities: ${docs.length} docs`);
          // A handful of old docs genuinely share the same activityURL slug (editorial
          // duplication over 2008-2018). activity_url is unique, so rather than silently
          // dropping the collision, suffix it to keep both.
          const seenActivityUrls = new Set();
          for (const doc of docs) {
               let activityUrl = doc.activityURL || '';
               if (activityUrl && seenActivityUrls.has(activityUrl)) {
                    let n = 2;
                    while (seenActivityUrls.has(`${activityUrl}-${n}`)) n++;
                    console.warn(`  ! duplicate activityURL "${activityUrl}", renaming to "${activityUrl}-${n}"`);
                    activityUrl = `${activityUrl}-${n}`;
               }
               if (activityUrl) seenActivityUrls.add(activityUrl);

               const row = {
                    title: doc.title || '',
                    activity_url: activityUrl,
                    author: doc.author || '',
                    published_date: doc.publishedDate ? new Date(doc.publishedDate).toISOString() : null,
                    status: doc.status || 'to-do',
                    category: doc.category || 'other',
                    descriptions: doc.descriptions || [],
                    quill_editor_data: doc.quillEditorData || '',
                    gallery: await migrateFileArray(doc.gallery),
                    cover_url: await migrateFile(doc.coverURL),
                    links: doc.links || [],
                    list: doc.list || [],
                    list_title: doc.listTitle || '',
                    favorited: !!doc.favorited,
                    favorited_number: doc.favoritedNumber ?? null,
                    locale: doc.locale || 'sr',
               };
               if (!row.activity_url) {
                    console.warn(`  ! Activity "${row.title}" has no activityURL, skipping`);
                    continue;
               }
               if (!DRY_RUN) {
                    const { error } = await supabase.from('activities').insert(row);
                    if (error) console.warn(`  ! insert failed for activity ${row.activity_url}: ${error.message}`);
               }
          }
     }

     // 5. publications <- Publications
     if (await shouldMigrate('publications')) {
          const docs = await db.collection('Publications').find({}).toArray();
          console.log(`Publications: ${docs.length} docs`);
          for (const doc of docs) {
               const row = {
                    publication_title: doc.publicationTitle || '',
                    publication_url: await migrateFile(doc.publicationURL),
                    publication_image_url: (await migrateFile(doc.publicationImageURL)) || '',
                    publication_uploaded_date_time: doc.publicationUploadedDateTime
                         ? new Date(doc.publicationUploadedDateTime).toISOString()
                         : new Date().toISOString(),
               };
               if (!DRY_RUN) {
                    const { error } = await supabase.from('publications').insert(row);
                    if (error) console.warn(`  ! insert failed for publication "${row.publication_title}": ${error.message}`);
               }
          }
     }

     // 6. questions <- Q&A (archived: old numeric 0/1 -> boolean)
     if (await shouldMigrate('questions')) {
          const docs = await db.collection('Q&A').find({}).toArray();
          console.log(`Q&A: ${docs.length} docs`);
          for (const doc of docs) {
               const row = {
                    full_name: doc.fullName || '',
                    email: doc.email || '',
                    question: doc.question || '',
                    answer: doc.answer || '',
                    question_date_time: doc.questionDateTime ? new Date(doc.questionDateTime).toISOString() : null,
                    answer_date_time: doc.answerDateTime ? new Date(doc.answerDateTime).toISOString() : null,
                    archived: !!doc.archived,
               };
               if (!DRY_RUN) {
                    const { error } = await supabase.from('questions').insert(row);
                    if (error) console.warn(`  ! insert failed for question from ${row.email}: ${error.message}`);
               }
          }
     }

     await mongoClient.close();
     console.log(DRY_RUN ? '\nDry run complete -- nothing was written.' : '\nMigration complete.');
}

main().catch((err) => {
     console.error(err);
     process.exit(1);
});
