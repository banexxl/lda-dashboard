'use client';

import React, { useState } from 'react';
import { FieldArray, Form, Formik } from 'formik';
import {
     TextField, Typography, Button, Box, Grid, MenuItem, IconButton, FormControl, InputLabel,
     Select, Divider, useTheme, Switch, FormControlLabel, Input, ImageListItem, ImageList, Stack
} from '@mui/material'
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2'
import DeleteIcon from '@mui/icons-material/Delete';
import AddBoxIcon from '@mui/icons-material/AddBox';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import moment from 'moment';

import { Activity, ActivityCategory, activityCategoryProps, ActivitySchema, activityStatusProps, ActivityStatusProps, initialActivity } from './activity-type';
import { DateField } from '@mui/x-date-pickers/DateField';
import { sanitizeString } from '@/utils/url-creator';
import QuillEditor from '@/components/quill-editor'

const categoryLabels: Record<ActivityCategory, string> = {
     'other': 'Ostalo',
     'eu-integrations': 'EU integracije',
     'intercultural-dialogue': 'Interkulturalni dijalog',
     'migrations': 'Migracije',
     'youth': 'Mladi',
     'culture': 'Kultura',
     'economy': 'Ekonomija',
     'democracy': 'Demokratija',
}

const statusLabels: Record<ActivityStatusProps, string> = {
     'completed': 'Završen',
     'in-progress': 'U toku',
     'to-do': 'Planiran',
}

type ActivityFormProps = {
     mode: 'create' | 'edit';
     initialValues?: Activity;
};

export const ActivityForm = ({ mode, initialValues }: ActivityFormProps) => {

     const router = useRouter();
     const theme = useTheme();
     const [loading, setLoading] = useState(false)

     const startingValues = initialValues || initialActivity

     const [useRichText, setUseRichText] = useState<boolean>(() => {
          const savedHtml = startingValues.quill_editor_data
          return typeof savedHtml === 'string' && savedHtml.trim().length > 0
     })
     const [editorHtml, setEditorHtml] = useState<string>(() => {
          const savedHtml = startingValues.quill_editor_data
          if (typeof savedHtml === 'string' && savedHtml.trim().length > 0) return savedHtml
          return (startingValues.descriptions || []).map((p: string) => `<p>${p}</p>`).join('')
     })

     const handleSubmit = async (values: Activity) => {
          setLoading(true)
          try {
               const response = await fetch('/api/activities-api', {
                    method: mode === 'create' ? 'POST' : 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                         ...values,
                         quill_editor_data: useRichText ? editorHtml : '',
                    }),
               });

               if (response.ok) {
                    Swal.fire({
                         icon: 'success',
                         title: 'Sve OK!',
                         text: mode === 'create' ? 'Aktivnost ubačena uspešno' : 'Aktivnost izmenjena :)',
                    })
                    router.push('/activities')
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
               text: "Ako želite da obrišete i slike iz baze, prvo ih obrišite iz aktivnosti!",
               icon: 'warning',
               showCancelButton: true,
               confirmButtonColor: '#3085d6',
               cancelButtonColor: '#d33',
               confirmButtonText: 'Da, obriši aktivnost, a ostavi slike u bazi!',
               cancelButtonText: 'Ne!'
          }).then((result) => {
               if (result.isConfirmed) {
                    handleDelete()
               }
          })
     }

     const handleDelete = async () => {
          setLoading(true)
          try {
               const response = await fetch('/api/activities-api', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(startingValues.id),
               })

               if (response.ok) {
                    Swal.fire({ icon: 'success', title: 'Sve OK!', text: 'Aktivnost obrisana!' })
                    router.push('/activities')
               } else {
                    Swal.fire({ icon: 'error', title: 'Greška', text: 'Aktivnost nije obrisana :(' })
               }
          } catch (err) {
               Swal.fire({ icon: 'error', title: 'Greška', text: 'Aktivnost nije obrisana :(' })
          } finally {
               setLoading(false)
          }
     }

     return (
          <Box>
               <Formik
                    initialValues={startingValues}
                    onSubmit={handleSubmit}
                    validationSchema={ActivitySchema}
               >
                    {
                         (formik) => (
                              <Form style={{ display: 'flex', flexDirection: 'column', gap: '15px', opacity: loading ? .5 : 1 }}>

                                   <Divider sx={{ borderBottomWidth: 5, borderColor: theme.palette.primary.main }} />

                                   <TextField
                                        InputLabelProps={{ shrink: true }}
                                        label="Naslov aktivnosti"
                                        name="title"
                                        disabled={loading}
                                        defaultValue={formik.values.title}
                                        onBlur={(e: any) => {
                                             formik.setFieldValue('title', e.target.value)
                                             formik.setFieldValue('activity_url', sanitizeString(e.target.value))
                                        }}
                                        error={formik.touched.title && !!formik.errors.title}
                                        helperText={formik.touched.title && formik.errors.title}
                                   />

                                   <TextField
                                        InputLabelProps={{ shrink: true }}
                                        disabled
                                        label="URL aktivnosti"
                                        name="activity_url"
                                        value={formik.values.activity_url}
                                   />

                                   <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DateField
                                             InputLabelProps={{ shrink: true }}
                                             format='MM/DD/YYYY'
                                             label="Objavljeno"
                                             disabled={loading}
                                             defaultValue={dayjs(formik.values.published_date)}
                                             onBlur={(e: any) => {
                                                  const date = moment(e.target.value).format('MM/DD/YYYY');
                                                  formik.setFieldValue('published_date', date)
                                             }}
                                        />
                                   </LocalizationProvider>

                                   <FormControl fullWidth disabled={loading}>
                                        <InputLabel id="activity-status" sx={{ backgroundColor: 'white' }}>Status</InputLabel>
                                        <Select
                                             name='status'
                                             labelId="activity-status-id"
                                             id="activity-status"
                                             value={formik.values.status}
                                             onChange={formik.handleChange}
                                             error={formik.touched.status && !!formik.errors.status}
                                        >
                                             {activityStatusProps.map((option) => (
                                                  <MenuItem key={option} value={option}>{statusLabels[option]}</MenuItem>
                                             ))}
                                        </Select>
                                   </FormControl>

                                   <FormControl fullWidth disabled={loading}>
                                        <InputLabel id="activity-category-label" sx={{ backgroundColor: 'white' }}>Kategorija</InputLabel>
                                        <Select
                                             labelId='activity-category-label'
                                             name='category'
                                             id="activity-category"
                                             disabled={loading}
                                             value={formik.values.category}
                                             onChange={formik.handleChange}
                                             error={formik.touched.category && !!formik.errors.category}
                                        >
                                             {activityCategoryProps.map((option) => (
                                                  <MenuItem key={option} value={option}>{categoryLabels[option]}</MenuItem>
                                             ))}
                                        </Select>
                                   </FormControl>

                                   <FormControl fullWidth>
                                        <InputLabel id="activity-locale" sx={{ backgroundColor: 'white' }}>Jezik</InputLabel>
                                        <Select
                                             labelId="activity-locale"
                                             id="activity-locale-id"
                                             value={formik.values.locale}
                                             label="Jezik"
                                             disabled
                                             name='locale'
                                             onChange={formik.handleChange}
                                        >
                                             <MenuItem value={'sr'}>sr</MenuItem>
                                             <MenuItem value={'en'}>en</MenuItem>
                                        </Select>
                                   </FormControl>

                                   <TextField
                                        InputLabelProps={{ shrink: true }}
                                        fullWidth
                                        disabled={loading}
                                        label="Autor"
                                        name="author"
                                        defaultValue={formik.values.author}
                                        onBlur={(e: any) => formik.setFieldValue('author', e.target.value)}
                                        error={formik.touched.author && !!formik.errors.author}
                                        helperText={formik.touched.author && formik.errors.author}
                                   />

                                   <Divider sx={{ borderBottomWidth: 5, borderColor: theme.palette.primary.main }} />

                                   {/* -------------------------------Cover image-------------------------- */}
                                   <Typography sx={{ margin: '10px' }}>Glavna slika aktivnosti:</Typography>
                                   <Box sx={{ display: 'flex', flexDirection: 'column', paddingLeft: '30px', marginBottom: '30px' }}>
                                        {formik.values.cover_url && (
                                             <ImageListItem sx={{ width: '200px', height: '300px', paddingBottom: '10px' }}>
                                                  <img
                                                       src={`${formik.values.cover_url}?w=164&h=164&fit=crop&auto=format`}
                                                       alt="cover"
                                                       loading="lazy"
                                                       style={{ cursor: 'pointer' }}
                                                       onClick={async (e: any) => {
                                                            const confirmDelete = await Swal.fire({
                                                                 title: 'Da li ste sigurni da želite da obrišete sliku?',
                                                                 icon: 'warning',
                                                                 showCancelButton: true,
                                                                 confirmButtonColor: '#3085d6',
                                                                 cancelButtonColor: '#d33',
                                                                 confirmButtonText: 'Da, obriši!',
                                                                 cancelButtonText: 'Odustani!'
                                                            })
                                                            if (!confirmDelete.isConfirmed) return
                                                            const url = e.target.currentSrc.split('?')[0]
                                                            setLoading(true)
                                                            try {
                                                                 const response = await fetch('/api/storage', {
                                                                      method: 'DELETE',
                                                                      headers: { 'Content-Type': 'application/json' },
                                                                      body: JSON.stringify(url)
                                                                 });
                                                                 if (response.ok) {
                                                                      formik.setFieldValue('cover_url', '')
                                                                 }
                                                            } finally {
                                                                 setLoading(false)
                                                            }
                                                       }}
                                                  />
                                             </ImageListItem>
                                        )}
                                        <Button component="label" variant="contained" startIcon={<CloudUploadIcon />} sx={{ maxWidth: '150px' }} disabled={loading}>
                                             Učitaj sliku
                                             <Input
                                                  type="file"
                                                  inputProps={{ accept: 'image/*' }}
                                                  sx={{ clip: 'rect(0 0 0 0)', clipPath: 'inset(50%)', height: 1, overflow: 'hidden', position: 'absolute', bottom: 0, left: 0, whiteSpace: 'nowrap', width: 1 }}
                                                  onChange={async (e: any) => {
                                                       const selectedFile = e.target.files[0];
                                                       if (!selectedFile) return;
                                                       setLoading(true)
                                                       try {
                                                            const fileExtension = selectedFile.name.split('.').pop();
                                                            const reader = new FileReader();
                                                            reader.readAsDataURL(selectedFile);
                                                            const base64Data: string = await new Promise((resolve, reject) => {
                                                                 reader.onloadend = () => resolve(reader.result as string);
                                                                 reader.onerror = (error) => reject(error);
                                                            });
                                                            const response = await fetch('/api/storage', {
                                                                 method: 'POST',
                                                                 headers: { 'Content-Type': 'application/json' },
                                                                 body: JSON.stringify({
                                                                      file: base64Data,
                                                                      title: formik.values.title || 'aktivnost',
                                                                      extension: fileExtension,
                                                                      fileName: selectedFile.name,
                                                                 }),
                                                            });
                                                            if (response.ok) {
                                                                 const result = await response.json();
                                                                 formik.setFieldValue('cover_url', result.imageUrl)
                                                            } else {
                                                                 Swal.fire({ title: 'Greška', text: 'Neuspešan upload slike!', icon: 'error' })
                                                            }
                                                       } finally {
                                                            setLoading(false)
                                                       }
                                                  }}
                                             />
                                        </Button>
                                   </Box>

                                   <Divider sx={{ borderBottomWidth: 5, borderColor: theme.palette.primary.main }} />

                                   {/* -------------------------------Links-------------------------- */}
                                   <Grid item md={6} xs={12}>
                                        <Typography sx={{ margin: '10px' }}>Linkovi za posetu:</Typography>
                                        <FieldArray
                                             name={'links'}
                                             render={arrayHelpers => (
                                                  formik.values?.links.length > 0 ?
                                                       formik.values?.links.map((link: any, index: any) => (
                                                            <Box key={index} sx={{ display: 'flex', width: '80%' }}>
                                                                 <TextField
                                                                      InputLabelProps={{ shrink: true }}
                                                                      value={formik.values.links[index]}
                                                                      onChange={formik.handleChange}
                                                                      fullWidth
                                                                      name={`links.${index}`}
                                                                      label={`Link ${index + 1}`}
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
                                   </Grid>

                                   <Divider sx={{ borderBottomWidth: 5, borderColor: theme.palette.primary.main }} />

                                   {/* -------------------------------List-------------------------- */}
                                   <TextField
                                        InputLabelProps={{ shrink: true }}
                                        fullWidth
                                        disabled={loading}
                                        label="Naslov liste"
                                        name="list_title"
                                        defaultValue={formik.values.list_title}
                                        onBlur={(e) => formik.setFieldValue('list_title', e.target.value)}
                                   />

                                   <Grid item md={6} xs={12}>
                                        <Typography sx={{ margin: '10px' }}>Lista:</Typography>
                                        <FieldArray
                                             name={'list'}
                                             render={arrayHelpers => (
                                                  formik.values?.list.length > 0 ?
                                                       formik.values?.list.map((item: any, index: any) => (
                                                            <Box key={index} sx={{ display: 'flex', width: '80%' }}>
                                                                 <TextField
                                                                      InputLabelProps={{ shrink: true }}
                                                                      value={formik.values.list[index]}
                                                                      onChange={formik.handleChange}
                                                                      fullWidth
                                                                      name={`list.${index}`}
                                                                      label={`Stavka ${index + 1}`}
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
                                   </Grid>

                                   <Divider sx={{ borderBottomWidth: 5, borderColor: theme.palette.primary.main }} />

                                   {/* -------------------------------Opisi (pasusi)-------------------------- */}
                                   <Grid item md={6} xs={12}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 2 }}>
                                             <Typography sx={{ margin: '10px' }}>Opisi (pasusi):</Typography>
                                             <FormControlLabel
                                                  control={
                                                       <Switch
                                                            checked={useRichText}
                                                            onChange={(e) => {
                                                                 const checked = e.target.checked
                                                                 setUseRichText(checked)
                                                                 if (checked) {
                                                                      const html = (formik.values.descriptions || []).map((p: string) => `<p>${p}</p>`).join('')
                                                                      setEditorHtml(editorHtml || html)
                                                                 }
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
                                                  commitMode="onBlur"
                                                  onBlur={(html) => setEditorHtml(html || '')}
                                             />
                                        ) : (
                                             <FieldArray
                                                  name={'descriptions'}
                                                  render={arrayHelpers => (
                                                       formik.values?.descriptions.length > 0 ?
                                                            formik.values?.descriptions.map((description: any, index: any) => (
                                                                 <Box key={index} sx={{ display: 'flex', width: '80%', alignItems: 'center' }}>
                                                                      <TextField
                                                                           InputLabelProps={{ shrink: true }}
                                                                           value={formik.values.descriptions[index]}
                                                                           onChange={formik.handleChange}
                                                                           fullWidth
                                                                           name={`descriptions.${index}`}
                                                                           label={`Opis ${index + 1}`}
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

                                   <Divider sx={{ borderBottomWidth: 5, borderColor: theme.palette.primary.main }} />

                                   {/* -------------------------------Gallery-------------------------- */}
                                   <Typography sx={{ margin: '10px' }}>Slike:</Typography>
                                   <Box sx={{ display: 'flex', flexDirection: 'column', paddingLeft: '30px', marginBottom: '30px', width: '100%' }}>
                                        {formik.values.gallery && formik.values.gallery.length > 0 && (
                                             <ImageList sx={{ width: '90%', height: 450 }} cols={4} rowHeight={164}>
                                                  {formik.values.gallery.map((item: string, idx: number) => (
                                                       <ImageListItem key={idx} sx={{ width: '200px', height: '300px' }}>
                                                            <img
                                                                 src={`${item}?w=164&h=164&fit=crop&auto=format`}
                                                                 alt="gallery"
                                                                 loading="lazy"
                                                                 style={{ cursor: 'pointer', borderRadius: '10px' }}
                                                                 onClick={async (e: any) => {
                                                                      const confirmDelete = await Swal.fire({
                                                                           title: 'Da li ste sigurni da želite da obrišete sliku?',
                                                                           icon: 'warning',
                                                                           showCancelButton: true,
                                                                           confirmButtonColor: '#3085d6',
                                                                           cancelButtonColor: '#d33',
                                                                           confirmButtonText: 'Da, obriši!',
                                                                           cancelButtonText: 'Odustani!'
                                                                      })
                                                                      if (!confirmDelete.isConfirmed) return
                                                                      const url = e.target.currentSrc.split('?')[0]
                                                                      setLoading(true)
                                                                      try {
                                                                           const response = await fetch('/api/storage', {
                                                                                method: 'DELETE',
                                                                                headers: { 'Content-Type': 'application/json' },
                                                                                body: JSON.stringify(url)
                                                                           });
                                                                           if (response.ok) {
                                                                                formik.setFieldValue('gallery', formik.values.gallery.filter((g: string) => g !== url))
                                                                           }
                                                                      } finally {
                                                                           setLoading(false)
                                                                      }
                                                                 }}
                                                            />
                                                       </ImageListItem>
                                                  ))}
                                             </ImageList>
                                        )}

                                        <Button component="label" variant="contained" startIcon={<CloudUploadIcon />} sx={{ maxWidth: '150px' }} disabled={loading}>
                                             Učitaj slike
                                             <Input
                                                  type="file"
                                                  inputProps={{ accept: 'image/*', multiple: true }}
                                                  sx={{ clip: 'rect(0 0 0 0)', clipPath: 'inset(50%)', height: 1, overflow: 'hidden', position: 'absolute', bottom: 0, left: 0, whiteSpace: 'nowrap', width: 1 }}
                                                  onChange={async (e: any) => {
                                                       const selectedFiles = e.target.files;
                                                       if (!selectedFiles || selectedFiles.length === 0) return;
                                                       setLoading(true)
                                                       try {
                                                            for (const file of selectedFiles) {
                                                                 const fileExtension = file.name.split('.').pop();
                                                                 const reader = new FileReader();
                                                                 reader.readAsDataURL(file);
                                                                 const base64Data: string = await new Promise((resolve, reject) => {
                                                                      reader.onloadend = () => resolve(reader.result as string);
                                                                      reader.onerror = (error) => reject(error);
                                                                 });
                                                                 const response = await fetch('/api/storage', {
                                                                      method: 'POST',
                                                                      headers: { 'Content-Type': 'application/json' },
                                                                      body: JSON.stringify({
                                                                           file: base64Data,
                                                                           title: formik.values.title || 'aktivnost',
                                                                           extension: fileExtension,
                                                                           fileName: file.name,
                                                                      }),
                                                                 });
                                                                 if (response.ok) {
                                                                      const result = await response.json();
                                                                      formik.setFieldValue('gallery', [...formik.values.gallery, result.imageUrl])
                                                                 } else {
                                                                      Swal.fire({ title: 'Greška', text: `Neuspešan upload slike za ${file.name}!`, icon: 'error' })
                                                                 }
                                                            }
                                                       } finally {
                                                            setLoading(false)
                                                       }
                                                  }}
                                             />
                                        </Button>
                                   </Box>

                                   <Divider sx={{ borderBottomWidth: 5, borderColor: theme.palette.primary.main }} />

                                   <Stack direction="row" justifyContent="space-between" sx={{ p: 2 }}>
                                        <Stack direction="row" spacing={2}>
                                             <Button type="submit" variant="contained" disabled={loading}>
                                                  {mode === 'create' ? 'Dodaj aktivnost' : 'Izmeni'}
                                             </Button>
                                             <Button color="inherit" onClick={() => router.push('/activities')} disabled={loading}>
                                                  Odustani
                                             </Button>
                                        </Stack>
                                        {mode === 'edit' && (
                                             <Button onClick={handleDeleteClick} color="error" disabled={loading}>
                                                  Obriši aktivnost
                                             </Button>
                                        )}
                                   </Stack>
                              </Form>
                         )
                    }
               </Formik>
          </Box>
     );
};
