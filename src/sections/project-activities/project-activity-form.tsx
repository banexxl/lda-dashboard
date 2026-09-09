import React, { useEffect, useState } from 'react';
import { FieldArray, Form, Formik } from 'formik';
import {
     TextField, Typography, Button, Box, Grid, MenuItem, IconButton, FormControl, InputLabel, Select,
     Divider, Checkbox, useTheme, Switch, FormControlLabel, Stack, Input, ImageList, ImageListItem,
     Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, Tooltip
} from '@mui/material'
import { useRouter } from 'next/router';
import Swal from 'sweetalert2'
import DeleteIcon from '@mui/icons-material/Delete';
import AddBoxIcon from '@mui/icons-material/AddBox';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ArticleIcon from '@mui/icons-material/Article';

import { ProjectActivity, ProjectActivitySchema, projectActivityInitialValues, projectCategory } from './project-activity-type';
import { DateField } from '@mui/x-date-pickers/DateField';
import { sanitizeString } from '@/utils/url-creator';
import { ProjectSummary } from '../project-summaries/project-summary-type';
import { getThumbnail, extractFileName } from '@/utils/file-helpers';
import moment from 'moment';
import QuillEditor from '@/components/quill-editor'

const categoryLabels: Record<string, string> = {
     'other': 'Ostalo',
     'eu-integrations': 'EU integracije',
     'intercultural-dialogue': 'Interkulturalni dijalog',
     'migrations': 'Migracije',
     'youth': 'Mladi',
     'culture': 'Kultura',
     'economy': 'Ekonomija',
     'democracy': 'Demokratija',
}

type PublicationItem = {
     _id: string;
     publicationTitle: string;
     publicationURL: string;
     publicationImageURL?: string;
     publicationUploadedDateTime?: string | Date;
}

const paragraphsToHtml = (paras: string[]) => (paras && paras.length ? paras.map((p) => `<p>${p}</p>`).join('') : '')

type ProjectActivityFormProps = {
     mode: 'create' | 'edit';
     initialValues?: ProjectActivity;
     projectSummaries: ProjectSummary[];
};

export const ProjectActivityForm = ({ mode, initialValues, projectSummaries }: ProjectActivityFormProps) => {

     const router = useRouter();
     const theme = useTheme()
     const [loading, setLoading] = useState(false)
     const [listEnabled, setListEnabled] = useState<boolean>(!!initialValues?.showList)

     const startingValues = initialValues || projectActivityInitialValues

     const [useRichText, setUseRichText] = useState<boolean>(() => {
          const savedHtml = startingValues.quillEditorData
          return typeof savedHtml === 'string' && savedHtml.trim().length > 0
     })
     const [editorHtml, setEditorHtml] = useState<string>(() => {
          const savedHtml = startingValues.quillEditorData
          if (typeof savedHtml === 'string' && savedHtml.trim().length > 0) return savedHtml
          return paragraphsToHtml(startingValues.paragraphs || [])
     })

     const [useRichTextEng, setUseRichTextEng] = useState<boolean>(() => {
          const savedHtml = startingValues.contentHtmlEng
          return typeof savedHtml === 'string' && savedHtml.trim().length > 0
     })
     const [editorHtmlEng, setEditorHtmlEng] = useState<string>(() => {
          const savedHtml = startingValues.contentHtmlEng
          if (typeof savedHtml === 'string' && savedHtml.trim().length > 0) return savedHtml
          return paragraphsToHtml(startingValues.paragraphs_eng || [])
     })

     const [isPublicationModalOpen, setIsPublicationModalOpen] = useState(false)
     const [publicationsCatalog, setPublicationsCatalog] = useState<PublicationItem[]>([])
     const [publicationsCatalogLoading, setPublicationsCatalogLoading] = useState(false)
     const [publicationsCatalogError, setPublicationsCatalogError] = useState('')

     useEffect(() => {
          if (!isPublicationModalOpen || publicationsCatalog.length > 0 || publicationsCatalogLoading) return

          const fetchPublications = async () => {
               try {
                    setPublicationsCatalogLoading(true)
                    setPublicationsCatalogError('')
                    const response = await fetch('/api/publications-api')
                    if (!response.ok) throw new Error('Failed to load publications')
                    const data = await response.json()
                    setPublicationsCatalog(Array.isArray(data) ? data : data.publications || [])
               } catch (error: any) {
                    setPublicationsCatalogError(error?.message || 'Failed to load publications')
               } finally {
                    setPublicationsCatalogLoading(false)
               }
          }

          fetchPublications()
     }, [isPublicationModalOpen, publicationsCatalog.length, publicationsCatalogLoading])

     const handleSubmit = async (values: ProjectActivity) => {
          setLoading(true)
          try {
               const response = await fetch('/api/project-activities-api', {
                    method: mode === 'create' ? 'POST' : 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                         ...values,
                         quillEditorData: useRichText ? editorHtml : '',
                         contentHtmlEng: useRichTextEng ? editorHtmlEng : '',
                    }),
               });

               if (mode === 'create' && response.ok) {
                    const selectedSummary = projectSummaries.find((summary) => summary.projectSummaryURL === values.projectSummaryURL.replace('/pregled-projekta/', ''))
                    if (selectedSummary?._id) {
                         await fetch('/api/project-summaries-api', {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                   _id: selectedSummary._id,
                                   projectSummaryDescription: (values.paragraphs || [])[0] || '',
                                   projectSummarySubtitleURL: '/projektna-aktivnost/' + values.projectURL,
                                   projectSummaryDateTime: moment(values.published).format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
                                   projectSummarySubtitle: values.title,
                              }),
                         });
                    }
               }

               if (response.ok) {
                    Swal.fire({
                         icon: 'success',
                         title: 'Sve OK!',
                         text: mode === 'create' ? 'Projektna aktivnost ubačena uspešno' : 'Projektna aktivnost izmenjena :)',
                    })
                    router.push('/project-activities')
               } else {
                    Swal.fire({ icon: 'error', title: 'Oops...', text: 'Nešto ne valja :(' })
               }
          } catch (err) {
               Swal.fire({ icon: 'error', title: 'Oops...', text: 'Nešto ne valja :(' })
          } finally {
               setLoading(false)
          }
     }

     const handleDeleteClick = () => {
          Swal.fire({
               title: 'Da li ste sigurni?',
               text: "Ako želite da obrišete i slike iz baze, prvo ih obrišite iz projekta!",
               icon: 'warning',
               showCancelButton: true,
               confirmButtonColor: '#3085d6',
               cancelButtonColor: '#d33',
               confirmButtonText: 'Da, obriši projektnu aktivnost, a ostavi slike u bazi!',
               cancelButtonText: 'Ne!'
          }).then((result) => {
               if (result.isConfirmed) handleDelete()
          })
     }

     const handleDelete = async () => {
          setLoading(true)
          try {
               const response = await fetch('/api/project-activities-api', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(startingValues._id),
               })
               if (response.ok) {
                    Swal.fire({ icon: 'success', title: 'Sve OK!', text: 'Projektna aktivnost obrisana!' })
                    router.push('/project-activities')
               } else {
                    Swal.fire({ icon: 'error', title: 'Greška', text: 'Projektna aktivnost nije obrisana :(' })
               }
          } catch (err) {
               Swal.fire({ icon: 'error', title: 'Greška', text: 'Projektna aktivnost nije obrisana :(' })
          } finally {
               setLoading(false)
          }
     }

     const confirmThenDeleteAsset = async (url: string, onDeleted: () => void) => {
          const confirmDelete = await Swal.fire({
               title: 'Da li ste sigurni da želite da obrišete?',
               icon: 'warning',
               showCancelButton: true,
               confirmButtonColor: '#3085d6',
               cancelButtonColor: '#d33',
               confirmButtonText: 'Da, obriši!',
               cancelButtonText: 'Odustani!'
          })
          if (!confirmDelete.isConfirmed) return
          setLoading(true)
          try {
               const response = await fetch('/api/aws-s3', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(url)
               });
               if (response.ok) onDeleted()
          } finally {
               setLoading(false)
          }
     }

     return (
          <Box sx={{ width: '100%' }}>
               <Formik
                    initialValues={startingValues}
                    onSubmit={handleSubmit}
                    validationSchema={ProjectActivitySchema}>
                    {
                         (formik) => (
                              <Form style={{ display: 'flex', flexDirection: 'column', gap: '15px', opacity: loading ? .5 : 1 }} aria-busy={loading || formik.isSubmitting}>
                                   <fieldset disabled={loading || formik.isSubmitting} style={{ border: 0, padding: 0, margin: 0, gap: 2 }}>
                                        <Grid container rowSpacing={2} columnSpacing={0}>
                                             <Grid item xs={12} md={8}>
                                                  <Divider sx={{ borderBottomWidth: 5, borderColor: theme.palette.primary.main }} />
                                             </Grid>
                                             <Grid item xs={12} md={8}>
                                                  <TextField
                                                       InputLabelProps={{ shrink: true }}
                                                       label="Naslov projektne aktivnosti"
                                                       name="title"
                                                       defaultValue={formik.values.title}
                                                       disabled={loading}
                                                       fullWidth
                                                       onBlur={(e: any) => {
                                                            const sanitizedValue = e.target.value
                                                                 .replace(/[^a-zA-Z0-9čćžšđČĆŽŠĐ\s]/g, '')
                                                                 .replace(/\s+/g, ' ');
                                                            formik.setFieldValue('title', sanitizedValue)
                                                            formik.setFieldValue('projectURL', sanitizeString(sanitizedValue))
                                                       }}
                                                       error={formik.touched.title && !!formik.errors.title}
                                                       helperText={formik.touched.title && formik.errors.title}
                                                  />
                                             </Grid>

                                             <Grid item xs={12} md={8}>
                                                  <TextField
                                                       InputLabelProps={{ shrink: true }}
                                                       disabled
                                                       label="URL projektne aktivnosti"
                                                       rows={4}
                                                       value={formik.values.projectURL}
                                                       fullWidth
                                                  />
                                             </Grid>

                                             <Grid item xs={12} md={8}>
                                                  <FormControl fullWidth>
                                                       <InputLabel id="subtitle-label" sx={{ backgroundColor: 'white' }}>Glavni projekat</InputLabel>
                                                       <Select
                                                            label="Glavni projekat"
                                                            labelId="project-summary-label"
                                                            name='projectSummaryURL'
                                                            id="project-summary"
                                                            value={formik.values.subTitle}
                                                            onChange={(e) => {
                                                                 const selectedSummary = projectSummaries.find((summary: any) => summary.title === e.target.value);
                                                                 if (!selectedSummary) return
                                                                 formik.setFieldValue('projectSummaryURL', '/pregled-projekta/' + selectedSummary.projectSummaryURL);
                                                                 formik.setFieldValue('subTitle', selectedSummary?.title);
                                                            }}
                                                            error={formik.touched.projectSummaryURL && !!formik.errors.projectSummaryURL}
                                                            sx={{ borderColor: 'white' }}
                                                       >
                                                            {projectSummaries.map((summary: any) => (
                                                                 <MenuItem value={summary.title} key={summary.title}>{summary.title}</MenuItem>
                                                            ))}
                                                       </Select>
                                                  </FormControl>
                                             </Grid>

                                             <Grid item xs={12} md={8}>
                                                  <TextField
                                                       disabled
                                                       fullWidth
                                                       label="URL glavnog projekta"
                                                       value={formik.values.projectSummaryURL}
                                                  />
                                             </Grid>

                                             <Grid item xs={12} md={8}>
                                                  <FormControl fullWidth>
                                                       <InputLabel id="project-summary-category" sx={{ backgroundColor: 'white' }}>Kategorija</InputLabel>
                                                       <Select
                                                            labelId="project-summary-category"
                                                            name='category'
                                                            value={formik.values.category}
                                                            onChange={(e) => formik.setFieldValue('category', e.target.value)}
                                                            error={formik.touched.category && !!formik.errors.category}
                                                            sx={{ borderColor: 'white' }}
                                                       >
                                                            {projectCategory.map((category) => (
                                                                 <MenuItem value={category} key={category}>{categoryLabels[category]}</MenuItem>
                                                            ))}
                                                       </Select>
                                                  </FormControl>
                                             </Grid>

                                             <Grid item xs={12} md={8}>
                                                  <FormControl fullWidth>
                                                       <InputLabel id="project-summary-status" sx={{ backgroundColor: 'white' }}>Status</InputLabel>
                                                       <Select
                                                            labelId='project-summary-status'
                                                            label="Status"
                                                            value={formik.values.status}
                                                            onChange={(e) => formik.setFieldValue('status', e.target.value)}
                                                            error={formik.touched.status && !!formik.errors.status}
                                                       >
                                                            <MenuItem value={'in-progress'}>U toku</MenuItem>
                                                            <MenuItem value={'completed'}>Zavrsen</MenuItem>
                                                            <MenuItem value={'to-do'}>U planu</MenuItem>
                                                       </Select>
                                                  </FormControl>
                                             </Grid>

                                             <Grid item xs={12} md={8}>
                                                  <FormControl fullWidth>
                                                       <InputLabel id="project-summary-locale" sx={{ backgroundColor: 'white' }}>Jezik</InputLabel>
                                                       <Select
                                                            labelId='project-summary-locale'
                                                            value={formik.values.locale}
                                                            label="Jezik"
                                                            disabled
                                                            name='locale'
                                                            onChange={(e) => formik.setFieldValue('locale', e.target.value)}
                                                       >
                                                            <MenuItem value={'sr'}>sr</MenuItem>
                                                            <MenuItem value={'en'}>en</MenuItem>
                                                       </Select>
                                                  </FormControl>
                                             </Grid>

                                             <Grid item xs={12} md={8}>
                                                  <LocalizationDateField formik={formik} />
                                             </Grid>

                                             <Grid item xs={12} md={8}><Divider sx={{ borderBottomWidth: 5, borderColor: theme.palette.primary.main }} /></Grid>

                                             <Grid item xs={12} md={8}>
                                                  <FormControl sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                                                       <Typography id="showProjectDetails">Prikazi detalje glavnog projekta</Typography>
                                                       <Checkbox
                                                            name="showProjectDetails"
                                                            defaultChecked={formik.values.showProjectDetails}
                                                            sx={{ width: '10px', height: '10px' }}
                                                            onChange={(e) => formik.setFieldValue('showProjectDetails', e.target.checked)}
                                                       />
                                                  </FormControl>
                                             </Grid>

                                             <Grid item xs={12} md={8}><Divider sx={{ borderBottomWidth: 5, borderColor: theme.palette.primary.main }} /></Grid>

                                             <Grid item xs={12} md={8}>
                                                  <Box sx={{ display: 'flex', width: '100%' }}>
                                                       <FormControl sx={{ display: 'flex', flexDirection: 'column', width: '400px', height: '50px' }}>
                                                            <Typography id="showList">Prikaži listu</Typography>
                                                            <Checkbox
                                                                 name="showList"
                                                                 defaultChecked={formik.values.showList}
                                                                 sx={{ width: '10px', height: '10px' }}
                                                                 onChange={(e) => {
                                                                      setListEnabled(e.target.checked)
                                                                      formik.setFieldValue('showList', e.target.checked)
                                                                 }}
                                                            />
                                                       </FormControl>

                                                       <FormControl sx={{ display: 'flex', flexDirection: 'column', width: '400px', height: '50px' }}>
                                                            <Typography id="showListOnBottom">Prikaži listu na dnu</Typography>
                                                            <Checkbox
                                                                 name="showListOnBottom"
                                                                 defaultChecked={formik.values.showListOnBottom}
                                                                 sx={{ width: '10px', height: '10px' }}
                                                                 onChange={(e) => formik.setFieldValue('showListOnBottom', e.target.checked)}
                                                            />
                                                       </FormControl>
                                                  </Box>
                                             </Grid>
                                             <Grid item xs={12} md={8}>
                                                  <TextField
                                                       InputLabelProps={{ shrink: true }}
                                                       label="Tekst liste"
                                                       defaultValue={formik.values.listTitle}
                                                       disabled={loading || !listEnabled}
                                                       fullWidth
                                                       onBlur={(e: any) => formik.setFieldValue('listTitle', e.target.value)}
                                                  />
                                             </Grid>

                                             <Grid item md={8} xs={12}>
                                                  <Typography sx={{ margin: '10px' }}>Lista:</Typography>
                                                  <FieldArray
                                                       name={'list'}
                                                       render={arrayHelpers => (
                                                            formik.values?.list.length > 0 ?
                                                                 formik.values?.list.map((listItem: any, index: any) => (
                                                                      <Box key={index} sx={{ display: 'flex', width: '100%' }}>
                                                                           <TextField
                                                                                disabled={loading || !listEnabled}
                                                                                InputLabelProps={{ shrink: true }}
                                                                                value={formik.values.list[index]}
                                                                                onChange={formik.handleChange}
                                                                                fullWidth
                                                                                name={`list.${index}`}
                                                                                label={`Stavka ${index + 1}`}
                                                                           />
                                                                           <IconButton disabled={loading || !listEnabled} onClick={() => arrayHelpers.insert(index + 1, '')}>
                                                                                <AddBoxIcon />
                                                                           </IconButton>
                                                                           <IconButton disabled={loading || !listEnabled} onClick={() => arrayHelpers.remove(index)}>
                                                                                <DeleteIcon />
                                                                           </IconButton>
                                                                      </Box>
                                                                 ))
                                                                 :
                                                                 <IconButton disabled={loading || !listEnabled} onClick={() => arrayHelpers.push('')}>
                                                                      <AddBoxIcon />
                                                                 </IconButton>
                                                       )}
                                                  />
                                             </Grid>

                                             <Grid item xs={12} md={8}><Divider sx={{ borderBottomWidth: 5, borderColor: theme.palette.primary.main }} /></Grid>

                                             <Grid item md={8} xs={12}>
                                                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 2 }}>
                                                       <Typography sx={{ margin: '10px' }}>Pasusi:</Typography>
                                                       <FormControlLabel
                                                            control={
                                                                 <Switch
                                                                      checked={useRichText}
                                                                      onChange={(e) => {
                                                                           const checked = e.target.checked
                                                                           setUseRichText(checked)
                                                                           if (checked) setEditorHtml(editorHtml || paragraphsToHtml(formik.values.paragraphs || []))
                                                                      }}
                                                                      disabled={loading}
                                                                 />
                                                            }
                                                            label={useRichText ? 'Editor' : 'Lista'}
                                                       />
                                                  </Box>

                                                  {useRichText ? (
                                                       <QuillEditor
                                                            initialValue={editorHtml}
                                                            commitMode='onBlur'
                                                            onBlur={(html) => setEditorHtml(html || '')}
                                                       />
                                                  ) : (
                                                       <FieldArray
                                                            name={'paragraphs'}
                                                            render={arrayHelpers => (
                                                                 formik.values?.paragraphs.length > 0 ?
                                                                      formik.values?.paragraphs.map((paragraph: any, index: any) => (
                                                                           <Box key={index} sx={{ display: 'flex', width: '100%' }}>
                                                                                <TextField
                                                                                     disabled={loading}
                                                                                     InputLabelProps={{ shrink: true }}
                                                                                     value={formik.values.paragraphs[index]}
                                                                                     onChange={formik.handleChange}
                                                                                     fullWidth
                                                                                     name={`paragraphs.${index}`}
                                                                                     label={`Paragraf ${index + 1}`}
                                                                                />
                                                                                <IconButton disabled={loading} onClick={() => arrayHelpers.insert(index + 1, '')}>
                                                                                     <AddBoxIcon />
                                                                                </IconButton>
                                                                                <IconButton disabled={loading} onClick={() => arrayHelpers.remove(index)}>
                                                                                     <DeleteIcon />
                                                                                </IconButton>
                                                                           </Box>
                                                                      ))
                                                                      :
                                                                      <IconButton disabled={loading} onClick={() => arrayHelpers.push('')}>
                                                                           <AddBoxIcon />
                                                                      </IconButton>
                                                            )}
                                                       />
                                                  )}
                                             </Grid>

                                             <Divider sx={{ borderBottomWidth: 5, borderColor: theme.palette.primary.main, width: '100%' }} />

                                             {/* -------------------------------English translation-------------------------- */}
                                             <Grid item md={6} xs={12} sx={{ padding: '10px' }}>
                                                  <FormControl sx={{ display: 'flex', flexDirection: 'column', width: '400px', height: '50px' }}>
                                                       <Typography id="hasTranslation">Prikazi Prevod</Typography>
                                                       <Checkbox
                                                            name="hasTranslation"
                                                            defaultChecked={formik.values.hasTranslation}
                                                            sx={{ width: '10px', height: '10px' }}
                                                            onChange={(e) => formik.setFieldValue('hasTranslation', e.target.checked)}
                                                       />
                                                  </FormControl>
                                             </Grid>
                                             <Grid item md={6} xs={12} display={formik.values.hasTranslation ? 'block' : 'none'} sx={{ width: '80%' }}>
                                                  <Grid item md={6} xs={12}>
                                                       <TextField
                                                            defaultValue={formik.values.title_eng}
                                                            fullWidth
                                                            label="Prevod Naslova Projekta"
                                                            onBlur={(e: any) => formik.setFieldValue('title_eng', e.target.value)}
                                                       />
                                                  </Grid>
                                                  <Grid item md={6} xs={12}>
                                                       <TextField
                                                            defaultValue={formik.values.subTitle_eng}
                                                            fullWidth
                                                            label="Prevod Podnaslova Projekta"
                                                            onBlur={(e: any) => formik.setFieldValue('subTitle_eng', e.target.value)}
                                                       />
                                                  </Grid>
                                                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 2, pr: 2 }}>
                                                       <FormControlLabel
                                                            control={
                                                                 <Switch
                                                                      checked={useRichTextEng}
                                                                      onChange={(e) => {
                                                                           const checked = e.target.checked
                                                                           setUseRichTextEng(checked)
                                                                           if (checked) setEditorHtmlEng(editorHtmlEng || paragraphsToHtml(formik.values.paragraphs_eng || []))
                                                                      }}
                                                                      disabled={loading}
                                                                 />
                                                            }
                                                            label={useRichTextEng ? 'Editor' : 'Lista'}
                                                       />
                                                       <Typography sx={{ margin: '10px' }}>Pasusi Prevedeni:</Typography>
                                                  </Box>

                                                  {useRichTextEng ? (
                                                       <QuillEditor
                                                            initialValue={editorHtmlEng}
                                                            commitMode="onBlur"
                                                            onBlur={(html) => setEditorHtmlEng(html || '')}
                                                       />
                                                  ) : (
                                                       <FieldArray
                                                            name={'paragraphs_eng'}
                                                            render={arrayHelpers => (
                                                                 formik.values?.paragraphs_eng.length > 0 ?
                                                                      formik.values?.paragraphs_eng.map((paragraph: any, index: any) => (
                                                                           <Box key={index} sx={{ display: 'flex', width: '80%' }}>
                                                                                <TextField
                                                                                     value={formik.values.paragraphs_eng[index]}
                                                                                     onChange={formik.handleChange}
                                                                                     fullWidth
                                                                                     name={`paragraphs_eng.${index}`}
                                                                                     label={`Pasus ${index + 1}`}
                                                                                     disabled={loading}
                                                                                />
                                                                                <IconButton onClick={() => arrayHelpers.insert(index + 1, '')}>
                                                                                     <AddBoxIcon />
                                                                                </IconButton>
                                                                                <IconButton onClick={() => arrayHelpers.remove(index)}>
                                                                                     <DeleteIcon />
                                                                                </IconButton>
                                                                           </Box>
                                                                      ))
                                                                      :
                                                                      <IconButton onClick={() => arrayHelpers.push('')}>
                                                                           <AddBoxIcon />
                                                                      </IconButton>
                                                            )}
                                                       />
                                                  )}
                                             </Grid>

                                             <Grid item xs={12} md={8}><Divider sx={{ borderBottomWidth: 5, borderColor: theme.palette.primary.main }} /></Grid>

                                             {(['links', 'locations', 'applicants', 'organizers', 'subOrganizers', 'donators'] as const).map((field) => (
                                                  <Grid item md={8} xs={12} key={field}>
                                                       <TextField
                                                            InputLabelProps={{ shrink: true }}
                                                            fullWidth
                                                            label={fieldLabels[field] + ' (odvojeni zarezom)'}
                                                            defaultValue={(formik.values[field] || []).join(', ')}
                                                            onBlur={(e) => {
                                                                 const values = e.target.value.split(',').map((v) => v.trim()).filter(Boolean);
                                                                 formik.setFieldValue(field, values);
                                                            }}
                                                            error={!!(formik.touched as any)[field] && !!(formik.errors as any)[field]}
                                                            helperText={(formik.touched as any)[field] && (formik.errors as any)[field]}
                                                       />
                                                  </Grid>
                                             ))}

                                             <Grid item xs={12} md={8}><Divider sx={{ borderBottomWidth: 5, borderColor: theme.palette.primary.main }} /></Grid>

                                             {/* -------------------------------Publications-------------------------- */}
                                             <Grid item md={8} xs={12}>
                                                  <Typography sx={{ margin: '10px' }}>Publikacije:</Typography>
                                                  {formik.values.publications && formik.values.publications.length > 0 && (
                                                       <Box sx={{ width: '90%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 3, alignItems: 'start' }}>
                                                            {formik.values.publications.map((item: string, index: number) => (
                                                                 <Box key={index} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                                      <Box
                                                                           sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100px', cursor: 'pointer' }}
                                                                           onClick={() => confirmThenDeleteAsset(item, () => {
                                                                                formik.setFieldValue('publications', formik.values.publications.filter((p: string) => p !== item))
                                                                           })}
                                                                      >
                                                                           {getThumbnail(item) === 'pdf' ? (
                                                                                <PictureAsPdfIcon sx={{ color: theme.palette.primary.dark, width: '50px', height: '50px' }} />
                                                                           ) : (
                                                                                <ArticleIcon sx={{ color: theme.palette.primary.dark, width: '50px', height: '50px' }} />
                                                                           )}
                                                                           <Tooltip title={extractFileName(item)}>
                                                                                <Typography sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100px' }}>
                                                                                     {extractFileName(item)}
                                                                                </Typography>
                                                                           </Tooltip>
                                                                      </Box>
                                                                 </Box>
                                                            ))}
                                                       </Box>
                                                  )}

                                                  <Button component="label" variant="contained" startIcon={<CloudUploadIcon />} sx={{ maxWidth: '150px', marginTop: '20px' }} disabled={loading}>
                                                       Učitaj dokument
                                                       <Input
                                                            type="file"
                                                            inputProps={{ accept: '.pdf, .docx, .doc' }}
                                                            sx={{ clip: 'rect(0 0 0 0)', clipPath: 'inset(50%)', height: 1, overflow: 'hidden', position: 'absolute', bottom: 0, left: 0, whiteSpace: 'nowrap', width: 1 }}
                                                            onChange={async (e: any) => {
                                                                 const selectedFile = e.target.files[0];
                                                                 if (!selectedFile) return;
                                                                 const validExtensions = ['pdf', 'docx', 'doc', 'xlsx', 'xls'];
                                                                 const fileExtension = selectedFile.name.split('.').pop().toLowerCase();
                                                                 if (!validExtensions.includes(fileExtension)) {
                                                                      Swal.fire({ title: 'Greška', text: 'Dozvoljeni su samo PDF, Word i Excel dokumenti!', icon: 'error' })
                                                                      return;
                                                                 }
                                                                 setLoading(true)
                                                                 try {
                                                                      const reader = new FileReader();
                                                                      reader.readAsDataURL(selectedFile);
                                                                      const base64Data: string = await new Promise((resolve, reject) => {
                                                                           reader.onloadend = () => resolve(reader.result as string);
                                                                           reader.onerror = (error) => reject(error);
                                                                      });
                                                                      const response = await fetch('/api/aws-s3', {
                                                                           method: 'PUT',
                                                                           headers: { 'Content-Type': 'application/json' },
                                                                           body: JSON.stringify({
                                                                                file: base64Data,
                                                                                title: formik.values.title || 'projektna-aktivnost',
                                                                                extension: fileExtension,
                                                                                fileName: selectedFile.name,
                                                                           }),
                                                                      });
                                                                      if (response.ok) {
                                                                           const result = await response.json();
                                                                           formik.setFieldValue('publications', [...formik.values.publications, result.imageUrl])
                                                                      } else {
                                                                           Swal.fire({ title: 'Greška', text: 'Neuspešan upload publikacije!', icon: 'error' })
                                                                      }
                                                                 } finally {
                                                                      setLoading(false)
                                                                 }
                                                            }}
                                                       />
                                                  </Button>

                                                  <Button
                                                       variant="outlined"
                                                       sx={{ maxWidth: '200px', marginTop: '16px', marginLeft: '10px' }}
                                                       onClick={() => setIsPublicationModalOpen(true)}
                                                       disabled={loading}
                                                  >
                                                       Dodaj postojecu publikaciju
                                                  </Button>

                                                  <Dialog open={isPublicationModalOpen} onClose={() => setIsPublicationModalOpen(false)} fullWidth maxWidth="md">
                                                       <DialogTitle>Izaberite publikaciju</DialogTitle>
                                                       <DialogContent dividers>
                                                            {publicationsCatalogLoading && (
                                                                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2 }}>
                                                                      <CircularProgress size={20} />
                                                                      <Typography>Ucitavanje publikacija...</Typography>
                                                                 </Box>
                                                            )}
                                                            {publicationsCatalogError && (
                                                                 <Typography color="error.main">{publicationsCatalogError}</Typography>
                                                            )}
                                                            {!publicationsCatalogLoading && !publicationsCatalogError && publicationsCatalog.length === 0 && (
                                                                 <Typography>Nema sacuvanih publikacija.</Typography>
                                                            )}
                                                            {!publicationsCatalogLoading && !publicationsCatalogError && publicationsCatalog.length > 0 && (
                                                                 <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 2 }}>
                                                                      {publicationsCatalog.map((publication) => (
                                                                           <Box key={publication._id} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, p: 2, display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center' }}>
                                                                                {getThumbnail(publication.publicationURL) === 'pdf' ? (
                                                                                     <PictureAsPdfIcon sx={{ color: theme.palette.primary.dark, width: 48, height: 48 }} />
                                                                                ) : (
                                                                                     <ArticleIcon sx={{ color: theme.palette.primary.dark, width: 48, height: 48 }} />
                                                                                )}
                                                                                <Typography sx={{ textAlign: 'center', whiteSpace: 'normal', wordBreak: 'break-word', maxWidth: '160px' }}>
                                                                                     {publication.publicationTitle || extractFileName(publication.publicationURL)}
                                                                                </Typography>
                                                                                <Button
                                                                                     size="small"
                                                                                     variant="outlined"
                                                                                     onClick={() => {
                                                                                          const existing = formik.values.publications || []
                                                                                          if (!existing.includes(publication.publicationURL)) {
                                                                                               formik.setFieldValue('publications', [...existing, publication.publicationURL])
                                                                                          }
                                                                                          setIsPublicationModalOpen(false)
                                                                                     }}
                                                                                >
                                                                                     Izaberi
                                                                                </Button>
                                                                           </Box>
                                                                      ))}
                                                                 </Box>
                                                            )}
                                                       </DialogContent>
                                                       <DialogActions>
                                                            <Button onClick={() => setIsPublicationModalOpen(false)} variant="text">Zatvori</Button>
                                                       </DialogActions>
                                                  </Dialog>
                                             </Grid>

                                             <Grid item xs={12} md={8}><Divider sx={{ borderBottomWidth: 5, borderColor: theme.palette.primary.main }} /></Grid>

                                             {/* -------------------------------Gallery-------------------------- */}
                                             <Grid item md={8} xs={12}>
                                                  <Typography sx={{ margin: '10px' }}>Galerija:</Typography>
                                                  <Box sx={{ display: 'flex', flexDirection: 'column', paddingLeft: '30px', marginBottom: '30px' }}>
                                                       {formik.values.gallery && formik.values.gallery.length > 0 && (
                                                            <ImageList sx={{ width: '90%', height: 450 }} cols={4} rowHeight={164}>
                                                                 {formik.values.gallery.map((item: string, idx: number) => (
                                                                      <ImageListItem key={idx}>
                                                                           <img
                                                                                src={`${item}?w=164&h=164&fit=crop&auto=format`}
                                                                                alt="gallery"
                                                                                loading="lazy"
                                                                                style={{ cursor: 'pointer', borderRadius: '10px' }}
                                                                                onClick={() => confirmThenDeleteAsset(item, () => {
                                                                                     formik.setFieldValue('gallery', formik.values.gallery.filter((g: string) => g !== item))
                                                                                })}
                                                                           />
                                                                      </ImageListItem>
                                                                 ))}
                                                            </ImageList>
                                                       )}

                                                       <Button component="label" variant="contained" startIcon={<CloudUploadIcon />} sx={{ maxWidth: '150px' }} disabled={loading}>
                                                            Učitaj slike
                                                            <Input
                                                                 type="file"
                                                                 inputProps={{ accept: 'image/*,video/*', multiple: true }}
                                                                 sx={{ clip: 'rect(0 0 0 0)', clipPath: 'inset(50%)', height: 1, overflow: 'hidden', position: 'absolute', bottom: 0, left: 0, whiteSpace: 'nowrap', width: 1 }}
                                                                 onChange={async (e: any) => {
                                                                      const selectedFiles = e.target.files;
                                                                      if (!selectedFiles || selectedFiles.length === 0) return;
                                                                      setLoading(true)
                                                                      try {
                                                                           for (const file of selectedFiles) {
                                                                                const fileExtension = file.name.split('.').pop();
                                                                                if (!fileExtension) continue;
                                                                                const reader = new FileReader();
                                                                                reader.readAsDataURL(file);
                                                                                const base64Data: string = await new Promise((resolve, reject) => {
                                                                                     reader.onloadend = () => resolve(reader.result as string);
                                                                                     reader.onerror = (error) => reject(error);
                                                                                });
                                                                                const response = await fetch('/api/aws-s3', {
                                                                                     method: 'POST',
                                                                                     headers: { 'Content-Type': 'application/json' },
                                                                                     body: JSON.stringify({
                                                                                          file: base64Data,
                                                                                          title: formik.values.title || 'projektna-aktivnost',
                                                                                          extension: fileExtension,
                                                                                          fileName: file.name,
                                                                                     }),
                                                                                });
                                                                                if (response.ok) {
                                                                                     const result = await response.json();
                                                                                     formik.setFieldValue('gallery', [...formik.values.gallery, result.imageUrl])
                                                                                } else {
                                                                                     Swal.fire({ title: 'Greška', text: `Neuspešan upload slike: ${file.name}!`, icon: 'error' })
                                                                                }
                                                                           }
                                                                      } finally {
                                                                           setLoading(false)
                                                                      }
                                                                 }}
                                                            />
                                                       </Button>
                                                  </Box>
                                             </Grid>

                                             <Divider sx={{ borderBottomWidth: 5, borderColor: theme.palette.primary.main, width: '100%' }} />

                                             <Grid item xs={12} md={8}>
                                                  <Stack direction="row" justifyContent="space-between" sx={{ p: 2 }}>
                                                       <Stack direction="row" spacing={2}>
                                                            <Button type="submit" variant="contained" disabled={loading}>
                                                                 {mode === 'create' ? 'Dodaj projektnu aktivnost' : 'Izmeni'}
                                                            </Button>
                                                            <Button color="inherit" onClick={() => router.push('/project-activities')} disabled={loading}>
                                                                 Odustani
                                                            </Button>
                                                       </Stack>
                                                       {mode === 'edit' && (
                                                            <Button onClick={handleDeleteClick} color="error" disabled={loading}>
                                                                 Obriši projektnu aktivnost
                                                            </Button>
                                                       )}
                                                  </Stack>
                                             </Grid>
                                        </Grid>
                                   </fieldset>
                              </Form>
                         )
                    }
               </Formik>
          </Box>
     );
};

const fieldLabels: Record<string, string> = {
     links: 'Linkovi',
     locations: 'Lokacije',
     applicants: 'Aplikanti',
     organizers: 'Organizatori',
     subOrganizers: 'Pod Organizatori',
     donators: 'Donatori',
}

const LocalizationDateField = ({ formik }: { formik: any }) => (
     <DateField
          InputLabelProps={{ shrink: true }}
          label="Objavljeno"
          value={formik.values.published}
          onChange={(value: any) => formik.setFieldValue('published', value)}
          onBlur={() => formik.setFieldTouched('published', true)}
          helperText={formik.touched.published && formik.errors.published ? String(formik.errors.published) : null}
          FormHelperTextProps={{ sx: { color: formik.touched.published && formik.errors.published ? 'red' : 'inherit' } }}
          sx={{ '& .MuiFormHelperText-root': { color: formik.touched.published && formik.errors.published ? 'red' : 'inherit' } }}
          fullWidth
     />
)
