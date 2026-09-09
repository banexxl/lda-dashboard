import { NextResponse } from 'next/server';
import moment from 'moment';
import { createAdminClient } from '@/utils/supabase/admin';
import { PublicationsServices } from '@/utils/publication-services';

// Replaces src/pages/api/aws-s3.ts. Same contract: base64 file in the JSON body, server
// decodes and uploads. Object key convention preserved: year/month/day/title/fileName.
export const runtime = 'nodejs';

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'lda-media';

const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'webp'];
const VIDEO_EXTENSIONS = ['mp4', 'webm', 'mov', 'avi'];
const DOC_CONTENT_TYPES: Record<string, string> = {
     pdf: 'application/pdf',
     doc: 'application/msword',
     docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
     xls: 'application/vnd.ms-excel',
     xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};

const contentTypeForUpload = (extension: string): string | null => {
     const normalized = extension.toLowerCase();
     if (IMAGE_EXTENSIONS.includes(normalized)) return `image/${normalized}`;
     if (VIDEO_EXTENSIONS.includes(normalized)) return `video/${normalized}`;
     if (DOC_CONTENT_TYPES[normalized]) return DOC_CONTENT_TYPES[normalized];
     return null;
};

const decodeBase64File = (file: string, contentType: string) => {
     const base64Prefix = contentType.startsWith('image')
          ? /^data:image\/\w+;base64,/
          : contentType.startsWith('video')
               ? /^data:video\/\w+;base64,/
               : /^data:application\/[^;]+;base64,/;
     return Buffer.from(file.replace(base64Prefix, ''), 'base64');
};

const buildKey = (title: string, fileName: string, extension: string) => {
     const now = moment();
     const year = now.year().toString();
     const month = (now.month() + 1).toString().padStart(2, '0');
     const day = now.format('DD');
     return `${year}/${month}/${day}/${title}/${fileName.split('.')[0]}.${extension}`;
};

const extractStorageKey = (url: string): string | null => {
     const marker = `/object/public/${BUCKET}/`;
     const idx = url.indexOf(marker);
     if (idx === -1) return null;
     return decodeURIComponent(url.slice(idx + marker.length).split('?')[0]);
};

export async function POST(request: Request) {
     try {
          const { file, title, extension, fileName } = await request.json();
          if (!file || !title || !extension) {
               return NextResponse.json({ error: 'Missing file, title, or extension' }, { status: 400 });
          }

          const contentType = contentTypeForUpload(extension);
          if (!contentType) {
               return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
          }

          const decodedFile = decodeBase64File(file, contentType);
          const key = buildKey(title, fileName, extension);

          const supabase = createAdminClient();
          const { error } = await supabase.storage.from(BUCKET).upload(key, decodedFile, { contentType, upsert: false });
          if (error) throw error;

          const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(key);
          return NextResponse.json({ imageUrl: publicUrlData.publicUrl });
     } catch (error) {
          console.error('Error uploading file:', error);
          return NextResponse.json({ error: 'Failed to upload file to storage' }, { status: 500 });
     }
}

export async function DELETE(request: Request) {
     try {
          const url = await request.json();
          const key = typeof url === 'string' ? extractStorageKey(url) : null;
          if (!key) {
               return NextResponse.json({ error: 'Missing key' }, { status: 400 });
          }

          const supabase = createAdminClient();
          const { error } = await supabase.storage.from(BUCKET).remove([key]);
          if (error) throw error;

          return NextResponse.json({ message: 'Image deleted successfully' });
     } catch (error) {
          console.error('Error deleting image:', error);
          return NextResponse.json({ error: 'Failed to delete image from storage' }, { status: 500 });
     }
}

export async function PUT(request: Request) {
     try {
          const { file, title, extension, fileName } = await request.json();
          if (!file || !title || !extension) {
               return NextResponse.json({ error: 'Missing file, title, or extension' }, { status: 400 });
          }

          const contentType = DOC_CONTENT_TYPES[extension.toLowerCase()];
          if (!contentType) {
               return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
          }

          const decodedFile = decodeBase64File(file, contentType);
          const key = buildKey(title, fileName, extension);

          const supabase = createAdminClient();
          const { error } = await supabase.storage.from(BUCKET).upload(key, decodedFile, { contentType, upsert: false });
          if (error) throw error;

          const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(key);

          await PublicationsServices().addPublication({
               publication_title: title,
               publication_url: publicUrlData.publicUrl,
               publication_image_url: '',
               publication_uploaded_date_time: new Date().toISOString(),
          });

          return NextResponse.json({ imageUrl: publicUrlData.publicUrl });
     } catch (error) {
          console.error('Error uploading file:', error);
          return NextResponse.json({ error: 'Failed to upload file to storage' }, { status: 500 });
     }
}
