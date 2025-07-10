import React, { useState } from 'react';
import { GetServerSideProps } from 'next';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Button, Paper, Pagination, Box, Typography } from '@mui/material';
import { Publication } from '@/utils/publication-services';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';

// Define the interface for your page props
interface PublicationsPageProps {
     publications: Publication[];
     publicationsCount: number;
     page: number;
     limit: number;
     error?: string;
}

const PublicationTable: React.FC<{ publications: Publication[], publicationsCount: number, page: number, limit: number }> = ({
     publications,
     publicationsCount,
     page,
     limit
}) => {
     const [editableRows, setEditableRows] = useState<Publication[]>(publications);
     const [newPublication, setNewPublication] = useState<Publication>({
          _id: '', // Will be filled after saving to the DB
          publicationTitle: '',
          publicationURL: '',
          publicationImageURL: '',
          publicationUploadedDateTime: new Date(),
     });
     const handleEditChange = (index: number, field: keyof Publication, value: string) => {
          const updatedRows = [...editableRows];
          updatedRows[index] = {
               ...updatedRows[index],
               [field]: value,
          };
          setEditableRows(updatedRows);
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
          } else {
               alert('Failed to delete publication');
          }
     };

     const handleNewPublicationChange = (field: keyof Publication, value: string) => {
          setNewPublication({ ...newPublication, [field]: value });
     };

     const handleAddPublication = async () => {
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
               // Optionally, add the new publication to the table without re-fetching
               setEditableRows([...editableRows, result.publication]);
               // Clear the form for adding a new publication
               setNewPublication({
                    _id: '',
                    publicationTitle: '',
                    publicationURL: '',
                    publicationImageURL: '',
                    publicationUploadedDateTime: new Date()
               });
          } else {
               alert('Failed to add publication');
          }
     };

     return (
          <>
               <TableContainer component={Paper} sx={{ mt: 3 }}>
                    <Table>
                         <TableHead>
                              <TableRow>
                                   <TableCell>Title</TableCell>
                                   <TableCell>URL</TableCell>
                                   <TableCell>Image URL</TableCell>
                                   <TableCell>Uploaded Date</TableCell>
                                   <TableCell>Actions</TableCell>
                              </TableRow>
                         </TableHead>
                         <TableBody>
                              {editableRows.map((publication, index) => (
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
                                             <TextField
                                                  fullWidth
                                                  value={publication.publicationURL}
                                                  onChange={(e) =>
                                                       handleEditChange(
                                                            editableRows.findIndex((row) => row._id === publication._id),
                                                            'publicationURL',
                                                            e.target.value
                                                       )
                                                  }
                                             />
                                        </TableCell>
                                        <TableCell>
                                             <TextField
                                                  fullWidth
                                                  value={publication.publicationImageURL || ''}
                                                  onChange={(e) =>
                                                       handleEditChange(
                                                            editableRows.findIndex((row) => row._id === publication._id),
                                                            'publicationImageURL',
                                                            e.target.value
                                                       )
                                                  }
                                             />
                                        </TableCell>
                                        <TableCell>
                                             {publication.publicationUploadedDateTime && !isNaN(new Date(publication.publicationUploadedDateTime).getTime())
                                                  ? new Date(publication.publicationUploadedDateTime).toISOString()
                                                  : 'Invalid Date'}
                                        </TableCell>
                                        <TableCell>
                                             <Button onClick={() => handleSave(editableRows.findIndex((row) => row._id === publication._id))} variant="contained">
                                                  Save
                                             </Button>
                                             <Button onClick={() => handleDelete(publication._id)} variant="contained" color="error">
                                                  Delete
                                             </Button>
                                        </TableCell>
                                   </TableRow>
                              ))}
                         </TableBody>
                    </Table>
               </TableContainer>

               {/* Add New Publication Form */}
               <Box sx={{ m: 4, gap: 2, display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="h6" gutterBottom   >Add New Publication</Typography>
                    <TextField
                         label="Title"
                         fullWidth
                         value={newPublication.publicationTitle}
                         onChange={(e) => handleNewPublicationChange('publicationTitle', e.target.value)}
                    />
                    <TextField
                         label="URL"
                         fullWidth
                         value={newPublication.publicationURL}
                         onChange={(e) => handleNewPublicationChange('publicationURL', e.target.value)}
                    />
                    <TextField
                         label="Image URL"
                         fullWidth
                         value={newPublication.publicationImageURL}
                         onChange={(e) => handleNewPublicationChange('publicationImageURL', e.target.value)}
                    />
                    <Button onClick={handleAddPublication} variant="contained" color="primary">
                         Add Publication
                    </Button>
               </Box>

               {/* Pagination Controls */}
               <Pagination
                    count={Math.ceil(publicationsCount / limit)} // Total pages
                    page={page}
                    onChange={(event, value) => window.location.href = `/publications?page=${value}&limit=${limit}`} // Navigate to the selected page
                    variant="outlined"
                    shape="rounded"
                    color="primary"
               />
          </>
     );

};

const PublicationsPage: React.FC<PublicationsPageProps> = ({
     publications,
     publicationsCount,
     page,
     limit,
     error,
}) => {
     if (error) {
          return <div>{error}</div>;
     }

     return (
          <DashboardLayout>
               <PublicationTable
                    publications={publications}
                    publicationsCount={publicationsCount}  // Pass publicationsCount here
                    page={page}                           // Pass page here
                    limit={limit}
               />
          </DashboardLayout>
     );
};

// Server-side data fetching
// Server-side data fetching
export const getServerSideProps: GetServerSideProps = async (context) => {
     try {
          const page = parseInt(context.query.page as string) || 1;
          const limit = parseInt(context.query.limit as string) || 5;

          const response = await fetch(`${process.env.BASE_URL}/api/publications-api?page=${page}&limit=${limit}`);
          const data = await response.json();

          const publications = data.publications || [];
          const publicationsCount = data.publicationsCount || 0;

          return {
               props: {
                    publications,
                    publicationsCount,  // Ensure this is passed
                    page,               // Ensure this is passed
                    limit,
               },
          };
     } catch (error) {
          console.error('Error fetching publications:', error);
          return {
               props: {
                    publications: [],
                    publicationsCount: 0,
                    page: 1,
                    limit: 5,
                    error: 'Failed to fetch publications. Please try again later.',
               },
          };
     }
};


export default PublicationsPage;
