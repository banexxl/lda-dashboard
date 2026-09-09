import React, { useEffect, useState } from 'react';
import { Box, Button, TextField, Typography, Stack } from '@mui/material';
import { useRouter } from 'next/router';
import Swal from 'sweetalert2';
import { Publication, initialPublication } from './publication-type';

const maxFileSizeBytes = 10 * 1024 * 1024;

type PublicationFormProps = {
     mode: 'create' | 'edit';
     initialValues?: Publication;
};

export const PublicationForm = ({ mode, initialValues }: PublicationFormProps) => {
     const router = useRouter();
     const [publication, setPublication] = useState<Publication>(initialValues || initialPublication)
     const [loading, setLoading] = useState(false)
     const [documentFile, setDocumentFile] = useState<File | null>(null);
     const [imageFile, setImageFile] = useState<File | null>(null);
     const [imagePreviewUrl, setImagePreviewUrl] = useState<string>('');
     const [documentUploadError, setDocumentUploadError] = useState('');
     const [imageUploadError, setImageUploadError] = useState('');
     const [isUploadingDocument, setIsUploadingDocument] = useState(false);
     const [isUploadingImage, setIsUploadingImage] = useState(false);

     useEffect(() => {
          if (!imageFile) {
               setImagePreviewUrl('');
               return;
          }
          const previewUrl = URL.createObjectURL(imageFile);
          setImagePreviewUrl(previewUrl);
          return () => URL.revokeObjectURL(previewUrl);
     }, [imageFile]);

     const readFileAsDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error('Failed to read file'));
          reader.readAsDataURL(file);
     });

     const uploadFile = async (file: File, title: string) => {
          const fileName = file.name;
          const extension = fileName.split('.').pop() || '';
          const fileDataUrl = await readFileAsDataUrl(file);

          const response = await fetch('/api/aws-s3', {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ file: fileDataUrl, title, extension, fileName }),
          });

          if (!response.ok) {
               const errorResponse = await response.json();
               throw new Error(errorResponse?.error || 'Upload failed');
          }

          const result = await response.json();
          return result.imageUrl as string;
     };

     const isSaveDisabled = !publication.publicationTitle || !publication.publicationURL || !publication.publicationImageURL;

     const handleSubmit = async () => {
          if (isSaveDisabled) {
               Swal.fire({ title: 'Greška', text: 'Naslov, dokument i slika su obavezni.', icon: 'error' })
               return;
          }

          setLoading(true)
          try {
               const response = mode === 'create'
                    ? await fetch('/api/publications-api', {
                         method: 'POST',
                         headers: { 'Content-Type': 'application/json' },
                         body: JSON.stringify(publication),
                    })
                    : await fetch('/api/publications-api', {
                         method: 'PUT',
                         headers: { 'Content-Type': 'application/json' },
                         body: JSON.stringify({ id: publication._id, updatedPublication: publication }),
                    });

               if (response.ok) {
                    Swal.fire({
                         icon: 'success',
                         title: 'Sve OK!',
                         text: mode === 'create' ? 'Publikacija uspešno dodata' : 'Publikacija uspešno izmenjena',
                    })
                    router.push('/publications')
               } else {
                    Swal.fire({ icon: 'error', title: 'Oops...', text: 'Nešto ne valja :(' })
               }
          } catch (error) {
               Swal.fire({ icon: 'error', title: 'Oops...', text: 'Nešto ne valja :(' })
          } finally {
               setLoading(false)
          }
     };

     const handleDeleteClick = () => {
          Swal.fire({
               title: 'Da li ste sigurni?',
               icon: 'warning',
               showCancelButton: true,
               confirmButtonColor: '#3085d6',
               cancelButtonColor: '#d33',
               confirmButtonText: 'Da, obriši!',
               cancelButtonText: 'Odustani!'
          }).then((result) => {
               if (result.isConfirmed) handleDelete()
          })
     }

     const handleDelete = async () => {
          setLoading(true)
          try {
               const response = await fetch(`/api/publications-api?deleteId=${publication._id}`, { method: 'DELETE' });
               if (response.ok) {
                    Swal.fire({ icon: 'success', title: 'Sve OK!', text: 'Publikacija obrisana!' })
                    router.push('/publications')
               } else {
                    Swal.fire({ icon: 'error', title: 'Greška', text: 'Publikacija nije obrisana :(' })
               }
          } catch (error) {
               Swal.fire({ icon: 'error', title: 'Greška', text: 'Publikacija nije obrisana :(' })
          } finally {
               setLoading(false)
          }
     }

     return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, opacity: loading ? .5 : 1 }}>
               <TextField
                    label="Naslov"
                    fullWidth
                    required
                    value={publication.publicationTitle}
                    disabled={loading}
                    onChange={(e) => setPublication((prev) => ({ ...prev, publicationTitle: e.target.value }))}
               />

               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="subtitle2">Dokument (PDF/DOC/DOCX/XLS/XLSX)</Typography>
                    <Button component="label" variant="outlined" sx={{ width: 300 }} disabled={loading}>
                         Izaberi dokument
                         <input
                              hidden
                              type="file"
                              accept=".pdf,.doc,.docx,.xls,.xlsx"
                              onChange={async (e) => {
                                   const selectedFile = e.target.files?.[0] || null;
                                   if (!selectedFile) {
                                        setDocumentFile(null);
                                        return;
                                   }
                                   const rawTitle = selectedFile.name.replace(/\.[^/.]+$/, '');
                                   const normalizedTitle = rawTitle.replace(/[_-]+/g, ' ').trim();
                                   if (selectedFile.size > maxFileSizeBytes) {
                                        setDocumentUploadError('Dokument prelazi 10MB.');
                                        setDocumentFile(null);
                                        return;
                                   }
                                   setDocumentUploadError('');
                                   setDocumentFile(selectedFile);
                                   setPublication((prev) => ({ ...prev, publicationTitle: prev.publicationTitle || normalizedTitle }));
                                   try {
                                        setIsUploadingDocument(true);
                                        const documentUrl = await uploadFile(selectedFile, publication.publicationTitle || normalizedTitle);
                                        setPublication((prev) => ({ ...prev, publicationURL: documentUrl }));
                                   } catch (error: any) {
                                        setDocumentUploadError(error?.message || 'Upload dokumenta neuspešan.');
                                   } finally {
                                        setIsUploadingDocument(false);
                                   }
                              }}
                         />
                    </Button>
                    {documentFile && (
                         <Typography variant="caption">
                              Izabrano: {documentFile.name} ({(documentFile.size / 1024 / 1024).toFixed(2)} MB)
                         </Typography>
                    )}
                    <Typography variant="caption">
                         {isUploadingDocument ? 'Uploadovanje dokumenta...' : 'Dokument se automatski uploaduje nakon izbora.'}
                    </Typography>
                    {publication.publicationURL && !isUploadingDocument && (
                         <Button href={publication.publicationURL} target="_blank" rel="noopener noreferrer" variant="text" sx={{ justifyContent: 'flex-start', px: 0 }}>
                              Otvori dokument
                         </Button>
                    )}
                    {documentUploadError && <Typography variant="caption" color="error.main">{documentUploadError}</Typography>}
               </Box>

               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="subtitle2">Slika</Typography>
                    <Button component="label" variant="outlined" sx={{ width: 300 }} disabled={loading}>
                         Izaberi sliku
                         <input
                              hidden
                              type="file"
                              accept="image/*"
                              onChange={async (e) => {
                                   const selectedFile = e.target.files?.[0] || null;
                                   if (!selectedFile) {
                                        setImageFile(null);
                                        return;
                                   }
                                   if (selectedFile.size > maxFileSizeBytes) {
                                        setImageUploadError('Slika prelazi 10MB.');
                                        setImageFile(null);
                                        return;
                                   }
                                   setImageUploadError('');
                                   setImageFile(selectedFile);
                                   try {
                                        setIsUploadingImage(true);
                                        const imageUrl = await uploadFile(selectedFile, publication.publicationTitle || selectedFile.name);
                                        setPublication((prev) => ({ ...prev, publicationImageURL: imageUrl }));
                                   } catch (error: any) {
                                        setImageUploadError(error?.message || 'Upload slike neuspešan.');
                                   } finally {
                                        setIsUploadingImage(false);
                                   }
                              }}
                         />
                    </Button>
                    {imageFile && (
                         <Typography variant="caption">
                              Izabrano: {imageFile.name} ({(imageFile.size / 1024 / 1024).toFixed(2)} MB)
                         </Typography>
                    )}
                    {(imagePreviewUrl || publication.publicationImageURL) && (
                         <Box component="img" src={imagePreviewUrl || publication.publicationImageURL} alt="Preview" sx={{ maxWidth: 220, borderRadius: 1, border: '1px solid #ddd' }} />
                    )}
                    <Typography variant="caption">
                         {isUploadingImage ? 'Uploadovanje slike...' : 'Slika se automatski uploaduje nakon izbora.'}
                    </Typography>
                    {imageUploadError && <Typography variant="caption" color="error.main">{imageUploadError}</Typography>}
               </Box>

               <Stack direction="row" justifyContent="space-between" sx={{ pt: 2 }}>
                    <Stack direction="row" spacing={2}>
                         <Button
                              variant="contained"
                              onClick={handleSubmit}
                              disabled={loading || isSaveDisabled || isUploadingDocument || isUploadingImage}
                         >
                              {mode === 'create' ? 'Dodaj publikaciju' : 'Izmeni'}
                         </Button>
                         <Button color="inherit" onClick={() => router.push('/publications')} disabled={loading}>
                              Odustani
                         </Button>
                    </Stack>
                    {mode === 'edit' && (
                         <Button onClick={handleDeleteClick} color="error" disabled={loading}>
                              Obriši publikaciju
                         </Button>
                    )}
               </Stack>
          </Box>
     );
};
