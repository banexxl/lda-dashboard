'use client';

import React, { useState } from 'react';
import {
     TextField, Typography, Button, Box, MenuItem, FormControl, InputLabel, Select, Divider,
     useTheme, Stack, Input, ImageListItem, ImageList, Tooltip
} from '@mui/material'
import { Form, Formik } from 'formik';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2'
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ArticleIcon from '@mui/icons-material/Article';

import { ProjectSummary, ProjectSummarySchema, initialProjectSummary } from './project-summary-type';
import { DateField } from '@mui/x-date-pickers/DateField';
import { sanitizeString } from '@/utils/url-creator';
import { CATEGORY_LABELS, CATEGORY_VALUES } from '@/types/content-enums';
import { getThumbnail, extractFileName } from '@/utils/file-helpers';

const arrayFieldLabels: Record<string, string> = {
     organizers: 'Organizatori projekta',
     locations: 'Lokacije projekta',
     applicants: 'Aplikanti projekta',
     donators: 'Donatori projekta',
     links: 'Linkovi',
}

type ProjectSummaryFormProps = {
     mode: 'create' | 'edit';
     initialValues?: ProjectSummary;
};

export const ProjectSummaryForm = ({ mode, initialValues }: ProjectSummaryFormProps) => {

     const router = useRouter();
     const [loading, setLoading] = useState<any>(false)
     const theme = useTheme()

     const startingValues = initialValues || initialProjectSummary

     const handleSubmit = async (values: ProjectSummary) => {
          setLoading(true)
          try {
               const response = await fetch('/api/project-summaries-api', {
                    method: mode === 'create' ? 'POST' : 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(values),
               });

               if (response.ok) {
                    Swal.fire({
                         icon: 'success',
                         title: 'Sve OK!',
                         text: mode === 'create' ? 'Projekat ubačen uspešno' : 'Projekat izmenjen :)',
                    })
                    router.push('/project-summaries')
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
               confirmButtonText: 'Da, obriši projekat, a ostavi slike u bazi!',
               cancelButtonText: 'Ne!'
          }).then((result) => {
               if (result.isConfirmed) handleDelete()
          })
     }

     const handleDelete = async () => {
          setLoading(true)
          try {
               const response = await fetch('/api/project-summaries-api', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(startingValues.id),
               })
               if (response.ok) {
                    Swal.fire({ icon: 'success', title: 'Sve OK!', text: 'Projekat obrisan!' })
                    router.push('/project-summaries')
               } else {
                    Swal.fire({ icon: 'error', title: 'Greška', text: 'Projekat nije obrisan :(' })
               }
          } catch (err) {
               Swal.fire({ icon: 'error', title: 'Greška', text: 'Projekat nije obrisan :(' })
          } finally {
               setLoading(false)
          }
     }

     const confirmThenDeleteAsset = async (url: string, onDeleted: () => void) => {
          const confirmDelete = await Swal.fire({
               title: 'Da li ste sigurni da želite da obrišete sliku?',
               text: "Možete obrisati samo sliku koju ste uploadovali!",
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
               const response = await fetch('/api/storage', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(url)
               });
               if (response.ok) {
                    onDeleted()
                    Swal.fire({ title: 'OK', text: 'Uspešno brisanje!', icon: 'success', confirmButtonColor: '#3085d6', confirmButtonText: 'OK' })
               } else {
                    Swal.fire({ title: 'Greška', text: 'Neuspešno brisanje!', icon: 'error', confirmButtonColor: '#3085d6', confirmButtonText: 'OK' })
               }
          } finally {
               setLoading(false)
          }
     }

     return (
          <Box>
               <Formik
                    initialValues={startingValues}
                    onSubmit={handleSubmit}
                    validationSchema={ProjectSummarySchema}>
                    {
                         (formik) => (
                              <Form style={{ display: 'flex', flexDirection: 'column', gap: '15px', opacity: loading ? .5 : 1 }}>

                                   <Divider sx={{ borderBottomWidth: 5, borderColor: theme.palette.primary.main }} />

                                   <TextField
                                        InputLabelProps={{ shrink: true }}
                                        label="Naslov projekta"
                                        name="title"
                                        disabled={loading}
                                        defaultValue={formik.values.title}
                                        onBlur={(e: any) => {
                                             const sanitizedValue = e.target.value
                                                  .replace(/[^a-zA-Z0-9čćžšđČĆŽŠĐ\s]/g, '')
                                                  .replace(/\s+/g, ' ');
                                             formik.setFieldValue('title', sanitizedValue)
                                             formik.setFieldValue('project_summary_url', sanitizeString(sanitizedValue))
                                        }}
                                        error={formik.touched.title && !!formik.errors.title}
                                        helperText={formik.touched.title && formik.errors.title}
                                   />

                                   <TextField
                                        InputLabelProps={{ shrink: true }}
                                        disabled
                                        label="URL projekta"
                                        value={formik.values.project_summary_url}
                                   />

                                   <DateField
                                        InputLabelProps={{ shrink: true }}
                                        label="Početak projekta"
                                        value={formik.values.project_start_date_time}
                                        onChange={(value) => formik.setFieldValue('project_start_date_time', value)}
                                        onBlur={() => formik.setFieldTouched('project_start_date_time', true)}
                                        helperText={formik.touched.project_start_date_time && formik.errors.project_start_date_time ? String(formik.errors.project_start_date_time) : null}
                                        FormHelperTextProps={{ sx: { color: formik.touched.project_start_date_time && formik.errors.project_start_date_time ? 'red' : 'inherit' } }}
                                        sx={{ '& .MuiFormHelperText-root': { color: formik.touched.project_start_date_time && formik.errors.project_start_date_time ? 'red' : 'inherit' } }}
                                   />

                                   <DateField
                                        InputLabelProps={{ shrink: true }}
                                        label="Kraj projekta"
                                        value={formik.values.project_end_date_time}
                                        onChange={(value) => formik.setFieldValue('project_end_date_time', value)}
                                        onBlur={() => formik.setFieldTouched('project_end_date_time', true)}
                                        helperText={formik.touched.project_end_date_time && formik.errors.project_end_date_time ? String(formik.errors.project_end_date_time) : null}
                                        FormHelperTextProps={{ sx: { color: formik.touched.project_end_date_time && formik.errors.project_end_date_time ? 'red' : 'inherit' } }}
                                        sx={{ '& .MuiFormHelperText-root': { color: formik.touched.project_end_date_time && formik.errors.project_end_date_time ? 'red' : 'inherit' } }}
                                   />

                                   <FormControl fullWidth>
                                        <InputLabel id="project-summary-status" sx={{ backgroundColor: 'white' }}>Status</InputLabel>
                                        <Select
                                             labelId="project-summary-status"
                                             label="Status"
                                             name='status'
                                             value={formik.values.status}
                                             onChange={formik.handleChange}
                                             error={formik.touched.status && !!formik.errors.status}
                                        >
                                             <MenuItem value={'in-progress'}>U toku</MenuItem>
                                             <MenuItem value={'completed'}>Zavrsen</MenuItem>
                                        </Select>
                                   </FormControl>

                                   <FormControl fullWidth>
                                        <InputLabel id="project-summary-category" sx={{ backgroundColor: 'white' }}>Kategorija</InputLabel>
                                        <Select
                                             label="Kategorija"
                                             labelId="project-summary-category"
                                             name='category'
                                             value={formik.values.category}
                                             onChange={(e) => formik.setFieldValue('category', e.target.value)}
                                             error={formik.touched.category && !!formik.errors.category}
                                        >
                                             {CATEGORY_VALUES.map((category) => (
                                                  <MenuItem value={category} key={category}>{CATEGORY_LABELS[category]}</MenuItem>
                                             ))}
                                        </Select>
                                   </FormControl>

                                   <FormControl fullWidth>
                                        <InputLabel id="project-summary-locale" sx={{ backgroundColor: 'white' }}>Jezik</InputLabel>
                                        <Select
                                             labelId="project-summary-locale"
                                             value={'sr'}
                                             label="Jezik"
                                             disabled
                                             name='locale'
                                        >
                                             <MenuItem value={'sr'}>sr</MenuItem>
                                             <MenuItem value={'en'}>en</MenuItem>
                                        </Select>
                                   </FormControl>

                                   <Divider sx={{ borderBottomWidth: 5, borderColor: theme.palette.primary.main }} />

                                   {(['organizers', 'locations', 'applicants', 'donators', 'links'] as const).map((field) => (
                                        <TextField
                                             key={field}
                                             InputLabelProps={{ shrink: true }}
                                             fullWidth
                                             label={`${arrayFieldLabels[field]} (odvojeni zarezom)`}
                                             disabled={loading}
                                             defaultValue={(formik.values[field] || []).join(', ')}
                                             onBlur={(e) => {
                                                  const values = e.target.value.split(',').map((v) => v.trim()).filter(Boolean);
                                                  formik.setFieldValue(field, values);
                                             }}
                                             error={!!(formik.touched as any)[field] && !!(formik.errors as any)[field]}
                                             helperText={(formik.touched as any)[field] && (formik.errors as any)[field]}
                                        />
                                   ))}

                                   <Divider sx={{ borderBottomWidth: 5, borderColor: theme.palette.primary.main }} />

                                   {/* -------------------------------Cover image-------------------------- */}
                                   <Tooltip placement='bottom-start' title={'Ovde se dodaje slika koja predstavlja naslovnu sliku projekta. Može biti samo jedna.'}>
                                        <Typography sx={{ margin: '10px' }}>Glavna slika projekta:</Typography>
                                   </Tooltip>
                                   <Box sx={{ display: 'flex', flexDirection: 'column', paddingLeft: '30px', marginBottom: '30px' }}>
                                        {formik.values.project_summary_cover_url && (
                                             <ImageListItem sx={{ width: '200px', height: '300px', paddingBottom: '10px' }}>
                                                  <img
                                                       src={`${formik.values.project_summary_cover_url}?w=164&h=164&fit=crop&auto=format`}
                                                       alt="cover"
                                                       loading="lazy"
                                                       style={{ cursor: 'pointer' }}
                                                       onClick={() => confirmThenDeleteAsset(formik.values.project_summary_cover_url, () => {
                                                            formik.setFieldValue('project_summary_cover_url', '')
                                                       })}
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
                                                                      title: formik.values.title || 'projekat',
                                                                      extension: fileExtension,
                                                                      fileName: selectedFile.name,
                                                                 }),
                                                            });
                                                            if (response.ok) {
                                                                 const result = await response.json();
                                                                 formik.setFieldValue('project_summary_cover_url', result.imageUrl)
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
                                                                 onClick={() => confirmThenDeleteAsset(item, () => {
                                                                      formik.setFieldValue('gallery', formik.values.gallery.filter((g: string) => g !== item))
                                                                 })}
                                                            />
                                                       </ImageListItem>
                                                  ))}
                                             </ImageList>
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
                                                                      title: formik.values.title || 'projekat',
                                                                      extension: fileExtension,
                                                                      fileName: selectedFile.name,
                                                                 }),
                                                            });
                                                            if (response.ok) {
                                                                 const result = await response.json();
                                                                 formik.setFieldValue('gallery', [...formik.values.gallery, result.imageUrl])
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

                                   {/* -------------------------------Publications-------------------------- */}
                                   <Tooltip placement='bottom-start' title={'Ovde možemo samo da brišemo publikacije za sad. Ako želimo da pregledamo, moramo otići na lda-subotica.org'}>
                                        <Typography sx={{ margin: '10px' }}>Publikacije:</Typography>
                                   </Tooltip>
                                   <Box sx={{ display: 'flex', flexDirection: 'column', paddingLeft: '30px', width: '90%', marginBottom: '20px' }}>
                                        {formik.values.publications && formik.values.publications.length > 0 && (
                                             <Box sx={{ width: '90%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 3, alignItems: 'start' }}>
                                                  {formik.values.publications.map((item: string, index: number) => (
                                                       <Box
                                                            key={index}
                                                            sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100px', cursor: 'pointer' }}
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
                                                       const validExtensions = ['pdf', 'docx', 'doc'];
                                                       const fileExtension = selectedFile.name.split('.').pop().toLowerCase();
                                                       if (!validExtensions.includes(fileExtension)) {
                                                            Swal.fire({ title: 'Greška', text: 'Dozvoljeni su samo PDF i Word dokumenti!', icon: 'error' })
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
                                                            const response = await fetch('/api/storage', {
                                                                 method: 'PUT',
                                                                 headers: { 'Content-Type': 'application/json' },
                                                                 body: JSON.stringify({
                                                                      file: base64Data,
                                                                      title: formik.values.title || 'projekat',
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
                                   </Box>

                                   <Divider sx={{ borderBottomWidth: 5, borderColor: theme.palette.primary.main }} />
                                   <Stack direction="row" justifyContent="space-between" sx={{ p: 2 }}>
                                        <Stack direction="row" spacing={2}>
                                             <Button type="submit" variant="contained" disabled={loading}>
                                                  {mode === 'create' ? 'Dodaj projekat' : 'Izmeni'}
                                             </Button>
                                             <Button color="inherit" onClick={() => router.push('/project-summaries')} disabled={loading}>
                                                  Odustani
                                             </Button>
                                        </Stack>
                                        {mode === 'edit' && (
                                             <Button onClick={handleDeleteClick} color="error" disabled={loading}>
                                                  Obriši projekat
                                             </Button>
                                        )}
                                   </Stack>
                              </Form>
                         )
                    }
               </Formik >
          </Box >
     );
};
