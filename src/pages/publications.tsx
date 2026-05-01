import React, { useEffect, useMemo, useState } from 'react';
import { GetServerSideProps } from 'next';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Button, Paper, Pagination, Box, Typography, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Publication } from '@/utils/publication-services';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { SessionProvider } from 'next-auth/react';

// Define the interface for your page props
interface PublicationsPageProps {
     publications: Publication[];
     error?: string;
}

const PublicationTable: React.FC<{ publications: Publication[] }> = ({
     publications
}) => {
     const maxFileSizeBytes = 10 * 1024 * 1024;
     const [page, setPage] = useState(1);
     const [rowsPerPage, setRowsPerPage] = useState(10);
     const totalPages = Math.max(1, Math.ceil(publications.length / rowsPerPage));
     const [editableRows, setEditableRows] = useState<Publication[]>(publications);
     const [dirtyRows, setDirtyRows] = useState<Record<string, boolean>>({});
     const [newPublication, setNewPublication] = useState<Publication>({
          _id: '', // Will be filled after saving to the DB
          publicationTitle: '',
          publicationURL: '',
          publicationImageURL: '',
          publicationUploadedDateTime: new Date(),
     });
     const [documentFile, setDocumentFile] = useState<File | null>(null);
     const [imageFile, setImageFile] = useState<File | null>(null);
     const [imagePreviewUrl, setImagePreviewUrl] = useState<string>('');
     const [documentUploadError, setDocumentUploadError] = useState<string>('');
     const [imageUploadError, setImageUploadError] = useState<string>('');
     const [showDocumentSuccess, setShowDocumentSuccess] = useState(false);
     const [showImageSuccess, setShowImageSuccess] = useState(false);
     const [isUploadingDocument, setIsUploadingDocument] = useState(false);
     const [isUploadingImage, setIsUploadingImage] = useState(false);
     const [isAddModalOpen, setIsAddModalOpen] = useState(false);

     const isAddDisabled = useMemo(() => {
          return !newPublication.publicationTitle || !newPublication.publicationURL || !newPublication.publicationImageURL;
     }, [newPublication.publicationTitle, newPublication.publicationURL, newPublication.publicationImageURL]);

     const handleEditChange = (index: number, field: keyof Publication, value: string) => {
          const updatedRows = [...editableRows];
          updatedRows[index] = {
               ...updatedRows[index],
               [field]: value,
          };
          setEditableRows(updatedRows);
          const rowId = updatedRows[index]?._id;
          if (rowId) {
               setDirtyRows((prev) => ({ ...prev, [rowId]: true }));
          }
     };

     const handleSave = async (index: number) => {
          const publicationToSave = editableRows[index];
          const response = await fetch(`/api/publications-api`, {
               method: 'PUT',
               headers: {
                    'Content-Type': 'application/json',
               },
               body: JSON.stringify({
                    id: publicationToSave._id,
                    updatedPublication: publicationToSave,
               }),
          });

          const result = await response.json();
          if (result.message === 'Publication updated successfully') {
               alert('Publication updated successfully');
               setDirtyRows((prev) => ({ ...prev, [publicationToSave._id]: false }));
          } else {
               alert('Failed to save publication');
          }
     };

     const handleDelete = async (id: string) => {
          const response = await fetch(`/api/publications-api?deleteId=${id}`, {
               method: 'DELETE',
          });

          const result = await response.json();
          if (result.message === 'Publication deleted successfully') {
               alert('Publication deleted successfully');
               // Remove the deleted publication from the table
               setEditableRows(editableRows.filter((row) => row._id !== id));
               setDirtyRows((prev) => {
                    const next = { ...prev };
                    delete next[id];
                    return next;
               });
          } else {
               alert('Failed to delete publication');
          }
     };

     const handleNewPublicationChange = (field: keyof Publication, value: string) => {
          setNewPublication({ ...newPublication, [field]: value });
     };

     useEffect(() => {
          if (!imageFile) {
               setImagePreviewUrl('');
               return;
          }

          const previewUrl = URL.createObjectURL(imageFile);
          setImagePreviewUrl(previewUrl);

          return () => {
               URL.revokeObjectURL(previewUrl);
          };
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
               headers: {
                    'Content-Type': 'application/json',
               },
               body: JSON.stringify({
                    file: fileDataUrl,
                    title,
                    extension,
                    fileName,
               }),
          });

          if (!response.ok) {
               const errorResponse = await response.json();
               throw new Error(errorResponse?.error || 'Upload failed');
          }

          const result = await response.json();
          return result.imageUrl as string;
     };

     const handleAddPublication = async () => {
          if (isAddDisabled) {
               setDocumentUploadError('Title, document, and image are required.');
               setImageUploadError('');
               return;
          }

          const response = await fetch(`/api/publications-api`, {
               method: 'POST',
               headers: {
                    'Content-Type': 'application/json',
               },
               body: JSON.stringify(newPublication),
          });

          const result = await response.json();
          if (result.message === 'Publication added successfully') {
               alert('Publication added successfully');
               // Add the newly created publication with the correct data (including _id) to the table
               setEditableRows([...editableRows, result.publication]);

               // Clear the form for adding a new publication
               setNewPublication({
                    _id: '',
                    publicationTitle: '',
                    publicationURL: '',
                    publicationImageURL: '',
                    publicationUploadedDateTime: new Date()
               });
               setDocumentFile(null);
               setImageFile(null);
               setImagePreviewUrl('');
               setShowDocumentSuccess(false);
               setShowImageSuccess(false);
          } else {
               alert('Failed to add publication');
          }
     };

     const pagedRows = useMemo(() => {
          const startIndex = (page - 1) * rowsPerPage;
          return editableRows.slice(startIndex, startIndex + rowsPerPage);
     }, [editableRows, page, rowsPerPage]);

     return (
          <SessionProvider>
               <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
                    <Typography variant="h6">Publications</Typography>
                    <Button
                         variant="contained"
                         color="primary"
                         onClick={() => setIsAddModalOpen(true)}
                         sx={{
                              borderRadius: 2,
                              textTransform: 'none',
                              fontWeight: 700,
                              px: 3,
                              py: 1.2,
                              boxShadow: '0 10px 24px rgba(0,0,0,0.16)',
                              '&:hover': {
                                   boxShadow: '0 12px 28px rgba(0,0,0,0.22)'
                              }
                         }}
                    >
                         Add Publication
                    </Button>
               </Box>
               <TableContainer component={Paper} sx={{ mt: 3 }}>
                    <Table>
                         <TableHead>
                              <TableRow>
                                   <TableCell>Title</TableCell>
                                   <TableCell>Document</TableCell>
                                   <TableCell>Image</TableCell>
                                   <TableCell>Uploaded Date</TableCell>
                                   <TableCell>Actions</TableCell>
                              </TableRow>
                         </TableHead>
                         <TableBody>
                              {pagedRows.map((publication, index) => (
                                   <TableRow key={publication._id}>
                                        <TableCell>
                                             <TextField
                                                  fullWidth
                                                  value={publication.publicationTitle}
                                                  onChange={(e) =>
                                                       handleEditChange(
                                                            editableRows.findIndex((row) => row._id === publication._id),
                                                            'publicationTitle',
                                                            e.target.value
                                                       )
                                                  }
                                             />
                                        </TableCell>
                                        <TableCell>
                                             {publication.publicationURL && (
                                                  <Button
                                                       href={publication.publicationURL}
                                                       target="_blank"
                                                       rel="noopener noreferrer"
                                                       variant="outlined"
                                                       sx={{
                                                            borderRadius: 2,
                                                            textTransform: 'none',
                                                            fontWeight: 600,
                                                            px: 2.5,
                                                            borderWidth: 2,
                                                            '&:hover': { borderWidth: 2 }
                                                       }}
                                                  >
                                                       Open Document
                                                  </Button>
                                             )}
                                        </TableCell>
                                        <TableCell>
                                             {publication.publicationImageURL && (
                                                  <Box
                                                       component="img"
                                                       src={publication.publicationImageURL}
                                                       alt={publication.publicationTitle}
                                                       sx={{ maxWidth: 120, borderRadius: 1, border: '1px solid #ddd' }}
                                                  />
                                             )}
                                        </TableCell>
                                        <TableCell>
                                             {publication.publicationUploadedDateTime && !isNaN(new Date(publication.publicationUploadedDateTime).getTime())
                                                  ? new Date(publication.publicationUploadedDateTime).toISOString()
                                                  : 'Invalid Date'}
                                        </TableCell>
                                        <TableCell>
                                             <Button
                                                  onClick={() => handleSave(editableRows.findIndex((row) => row._id === publication._id))}
                                                  variant="contained"
                                                  disabled={!dirtyRows[publication._id]}
                                                  sx={{
                                                       borderRadius: 2,
                                                       textTransform: 'none',
                                                       fontWeight: 600,
                                                       px: 2.5,
                                                       boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
                                                       '&:hover': {
                                                            boxShadow: '0 8px 20px rgba(0,0,0,0.18)'
                                                       }
                                                  }}
                                             >
                                                  Save
                                             </Button>
                                             <Button
                                                  onClick={() => handleDelete(publication._id)}
                                                  variant="contained"
                                                  color="error"
                                                  sx={{
                                                       borderRadius: 2,
                                                       textTransform: 'none',
                                                       fontWeight: 600,
                                                       px: 2.5,
                                                       ml: 1,
                                                       boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
                                                       '&:hover': {
                                                            boxShadow: '0 8px 20px rgba(0,0,0,0.18)'
                                                       }
                                                  }}
                                             >
                                                  Delete
                                             </Button>
                                        </TableCell>
                                   </TableRow>
                              ))}
                         </TableBody>
                    </Table>
               </TableContainer>

               <Dialog
                    open={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    fullWidth
                    maxWidth="md"
               >
                    <DialogTitle>Add New Publication</DialogTitle>
                    <DialogContent dividers>
                         <Box sx={{ gap: 2, display: 'flex', flexDirection: 'column' }}>
                              <TextField
                                   label="Title"
                                   fullWidth
                                   required
                                   value={newPublication.publicationTitle}
                                   onChange={(e) => handleNewPublicationChange('publicationTitle', e.target.value)}
                              />
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                   <Typography variant="subtitle2">Upload Document (PDF/DOC/DOCX/XLS/XLSX)</Typography>
                                   <Button
                                        component="label"
                                        variant="outlined"
                                        onClick={() => {
                                             setDocumentUploadError('');
                                             setShowDocumentSuccess(false);
                                        }}
                                        sx={{
                                             width: 300,
                                             borderRadius: 2,
                                             textTransform: 'none',
                                             fontWeight: 600,
                                             px: 2.5,
                                             borderWidth: 2,
                                             '&:hover': { borderWidth: 2 }
                                        }}
                                   >
                                        Choose Document
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
                                                       setDocumentUploadError('Document exceeds 10MB size limit.');
                                                       setDocumentFile(null);
                                                       return;
                                                  }
                                                  setDocumentUploadError('');
                                                  setDocumentFile(selectedFile);
                                                  setNewPublication((prev) => ({
                                                       ...prev,
                                                       publicationTitle: normalizedTitle
                                                  }));
                                                  try {
                                                       setIsUploadingDocument(true);
                                                       const documentUrl = await uploadFile(selectedFile, normalizedTitle);
                                                       setNewPublication((prev) => ({
                                                            ...prev,
                                                            publicationURL: documentUrl
                                                       }));
                                                       setDocumentUploadError('');
                                                       setShowDocumentSuccess(true);
                                                  } catch (error: any) {
                                                       setShowDocumentSuccess(false);
                                                       setDocumentUploadError(error?.message || 'Failed to upload document.');
                                                  } finally {
                                                       setIsUploadingDocument(false);
                                                  }
                                             }}
                                        />
                                   </Button>
                                   {documentFile && (
                                        <Typography variant="caption">
                                             Selected: {documentFile.name} ({(documentFile.size / 1024 / 1024).toFixed(2)} MB)
                                        </Typography>
                                   )}
                                   <Typography variant="caption">
                                        {isUploadingDocument ? 'Uploading document...' : 'Document uploads automatically after selection.'}
                                   </Typography>
                                   {showDocumentSuccess && newPublication.publicationURL && (
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                             <Typography variant="caption" sx={{ color: 'success.main' }}>
                                                  Document uploaded successfully.
                                             </Typography>
                                             <Button
                                                  href={newPublication.publicationURL}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  variant="text"
                                                  sx={{
                                                       textTransform: 'none',
                                                       fontWeight: 600,
                                                       px: 0,
                                                       justifyContent: 'flex-start'
                                                  }}
                                             >
                                                  View uploaded document
                                             </Button>
                                        </Box>
                                   )}
                                   {documentUploadError && (
                                        <Typography variant="caption" sx={{ color: 'error.main' }}>
                                             {documentUploadError}
                                        </Typography>
                                   )}
                              </Box>
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                   <Typography variant="subtitle2">Upload Image</Typography>
                                   <Button
                                        component="label"
                                        variant="outlined"
                                        onClick={() => {
                                             setImageUploadError('');
                                             setShowImageSuccess(false);
                                        }}
                                        sx={{
                                             width: 300,
                                             borderRadius: 2,
                                             textTransform: 'none',
                                             fontWeight: 600,
                                             px: 2.5,
                                             borderWidth: 2,
                                             '&:hover': { borderWidth: 2 }
                                        }}
                                   >
                                        Choose Image
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
                                                       setImageUploadError('Image exceeds 10MB size limit.');
                                                       setImageFile(null);
                                                       return;
                                                  }
                                                  setImageUploadError('');
                                                  setImageFile(selectedFile);
                                                  try {
                                                       setIsUploadingImage(true);
                                                       const imageUrl = await uploadFile(selectedFile, newPublication.publicationTitle || selectedFile.name);
                                                       setNewPublication((prev) => ({
                                                            ...prev,
                                                            publicationImageURL: imageUrl
                                                       }));
                                                       setImageUploadError('');
                                                       setShowImageSuccess(true);
                                                  } catch (error: any) {
                                                       setShowImageSuccess(false);
                                                       setImageUploadError(error?.message || 'Failed to upload image.');
                                                  } finally {
                                                       setIsUploadingImage(false);
                                                  }
                                             }}
                                        />
                                   </Button>
                                   {imageFile && (
                                        <Typography variant="caption">
                                             Selected: {imageFile.name} ({(imageFile.size / 1024 / 1024).toFixed(2)} MB)
                                        </Typography>
                                   )}
                                   {imagePreviewUrl && (
                                        <Box
                                             component="img"
                                             src={imagePreviewUrl}
                                             alt="Preview"
                                             sx={{ maxWidth: 220, borderRadius: 1, border: '1px solid #ddd' }}
                                        />
                                   )}
                                   <Typography variant="caption">
                                        {isUploadingImage ? 'Uploading image...' : 'Image uploads automatically after selection.'}
                                   </Typography>
                                   {showImageSuccess && (
                                        <Typography variant="caption" sx={{ color: 'success.main' }}>
                                             Image uploaded successfully.
                                        </Typography>
                                   )}
                                   {imageUploadError && (
                                        <Typography variant="caption" sx={{ color: 'error.main' }}>
                                             {imageUploadError}
                                        </Typography>
                                   )}
                              </Box>
                         </Box>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, py: 2 }}>
                         <Button onClick={() => setIsAddModalOpen(false)} variant="text">
                              Cancel
                         </Button>
                         <Button
                              onClick={handleAddPublication}
                              variant="contained"
                              color="primary"
                              disabled={isAddDisabled}
                              sx={{
                                   borderRadius: 2,
                                   textTransform: 'none',
                                   fontWeight: 700,
                                   px: 3,
                                   py: 1.2,
                                   boxShadow: '0 10px 24px rgba(0,0,0,0.16)',
                                   '&:hover': {
                                        boxShadow: '0 12px 28px rgba(0,0,0,0.22)'
                                   }
                              }}
                         >
                              Add Publication
                         </Button>
                    </DialogActions>
               </Dialog>

               {/* Pagination Controls */}
               <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                    <Pagination
                         count={totalPages}
                         page={page}
                         onChange={(event, value) => setPage(value)}
                         variant="outlined"
                         shape="rounded"
                         color="primary"
                    />
                    <TextField
                         select
                         label="Rows"
                         value={rowsPerPage}
                         onChange={(event) => {
                              const nextRows = parseInt(event.target.value, 10) || 10;
                              setRowsPerPage(nextRows);
                              setPage(1);
                         }}
                         sx={{ width: 120 }}
                    >
                         {[5, 10, 25].map((value) => (
                              <MenuItem key={value} value={value}>
                                   {value}
                              </MenuItem>
                         ))}
                    </TextField>
               </Box>
          </SessionProvider>
     );

};

const PublicationsPage: React.FC<PublicationsPageProps> = ({
     publications,
     error,
}) => {
     if (error) {
          return <div>{error}</div>;
     }

     return (
          <DashboardLayout>
               <PublicationTable
                    publications={publications}
               />
          </DashboardLayout>
     );
};

// Server-side data fetching
// Server-side data fetching
export const getServerSideProps: GetServerSideProps = async (context) => {
     try {
          const response = await fetch(`${process.env.BASE_URL}/api/publications-api`);
          const data = await response.json();

          const rawPublications = Array.isArray(data) ? data : data.publications || [];
          const publications = rawPublications.map((publication: any) => ({
               ...publication,
               _id: typeof publication._id === 'string'
                    ? publication._id
                    : publication._id?.toString?.() || '',
          }));

          return {
               props: {
                    publications,
               },
          };
     } catch (error) {
          console.error('Error fetching publications:', error);
          return {
               props: {
                    publications: [],
                    error: 'Failed to fetch publications. Please try again later.',
               },
          };
     }
};


export default PublicationsPage;
