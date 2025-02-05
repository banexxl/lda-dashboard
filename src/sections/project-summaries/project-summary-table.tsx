import ChevronRightIcon from '@untitled-ui/icons-react/build/esm/ChevronRight';
import ChevronDownIcon from '@untitled-ui/icons-react/build/esm/ChevronDown';
import {
     Box, Button, Card, Divider, Grid, IconButton, ImageList, ImageListItem, Input, MenuItem,
     Stack, SvgIcon, Table, TableBody, TableCell, TableHead, TableRow, TextField, Tooltip, Typography, useTheme
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { Fragment, useState } from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';
import "@uploadthing/react/styles.css";
import dayjs from 'dayjs';
import { ProjectSummary, initialProjectSummary } from './project-summary-type';
import { DateField } from '@mui/x-date-pickers/DateField';
import moment from 'moment';

import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ArticleIcon from '@mui/icons-material/Article';
import { projectCategory } from '../project-activities/project-activity-table';
import { ProjectCategory } from '../project-activities/project-activity-type';


type ProjectStatus = {
     value: string;
     name: string;
}
const projectStatus: ProjectStatus[] = [
     { value: 'in-progress', name: 'U toku' },
     { value: 'completed', name: 'Zavrsen' },
];

export type ArrayKeys = keyof Pick<ProjectSummary,
     'gallery' | 'organizers' | 'locations' | 'applicants' | 'donators' |
     'publications' | 'links'
>;

type ProjectLocale = {
     value: string;
     name: string;
}

export const getThumbnail = (fileName: any) => {

     const fileExtension = fileName ? fileName.split('.').pop().toLowerCase() : '';
     if (fileExtension === 'pdf') {
          return 'pdf'
     } else if (fileExtension === 'doc' || fileExtension === 'docx') {
          return 'doc'
     } else {
          return '';
     }
};

export const extractFileName = (url: string) => {
     // Extract the file name
     const fileName = url.split('/').pop();

     // Decode the file name
     const decodedFileName = decodeURIComponent(fileName!);

     return decodedFileName;
}

const locales = [{ value: 'en', name: 'Engleski' }, { value: 'sr', name: 'Srpski' }]

export const ProjectSummaryTable = ({ items }: any) => {

     const [currentProjectID, setCurrentProjectID] = useState(null);
     const [currentProjectObject, setCurrentProjectObject] = useState<ProjectSummary | null | undefined>(initialProjectSummary || {});

     const router = useRouter();
     const theme = useTheme()
     const [loading, setLoading] = useState(false)



     const getObjectById = (_id: any, arrayToSearch: any) => {
          for (const obj of arrayToSearch) {
               if (obj._id === _id) {
                    // Destructure to exclude the specified keys
                    const {
                         projectSummaryDescriptions,
                         projectSummarySubtitleURLs,
                         projectSummaryDateTime,
                         projectSummarySubtitles,
                         ...filteredObj
                    } = obj;
                    console.log('filteredObj', filteredObj);

                    return filteredObj;
               }
          }
          return null;  // Object with the desired ID not found
     }

     const handleProjectToggle = (ProjectId: any) => {
          setCurrentProjectID((prevProjectId: any) => {
               if (prevProjectId === ProjectId) {
                    setCurrentProjectObject(null)
                    return null;
               }
               setCurrentProjectObject(getObjectById(ProjectId, items))
               return ProjectId;
          })
          console.log('currentProjectObject', currentProjectObject);

     }

     const handleProjectClose = () => {
          setCurrentProjectID(null);
     }

     const handleProjectUpdateClick = () => {
          console.log('currentProjectObject', currentProjectObject);
          Swal.fire({
               title: 'Da li ste sigurni?',
               text: "Možete izmeniti pojekat u svakom momentu...",
               icon: 'warning',
               showCancelButton: true,
               confirmButtonColor: '#3085d6',
               cancelButtonColor: '#d33',
               confirmButtonText: 'Da, izmeni!',
               cancelButtonText: 'Odustani!'
          }).then((result) => {
               if (result.isConfirmed) {
                    handleUpdateProject(currentProjectObject)
               } else {
                    handleProjectClose()
               }
          })
     }

     const handleUpdateProject = async (currentProjectObject: any) => {
          setLoading(true)

          try {
               //API CALL
               const response = await fetch('/api/project-summaries-api', {
                    method: 'PUT',
                    headers: {
                         'Content-Type': 'application/json',
                         'Access-Control-Allow-Origin': 'https://lda-dashboard.vercel.app/api/project-api, http://localhost:3000/api/project-api',
                         'Access-Control-Allow-Methods': 'PUT' // Set the content type to JSON
                    },
                    body: JSON.stringify(currentProjectObject)
               });

               if (response.ok) {
                    handleProjectClose()
                    setCurrentProjectObject(null)
                    Swal.fire({
                         icon: 'success',
                         title: 'Sve OK!',
                         text: 'Projekat izmenjen :)',
                    })
                    router.refresh()
               } else {
                    Swal.fire({
                         icon: 'error',
                         title: 'Update nije prosao!',
                         text: 'Projekat nije izmenjen :(',
                         didClose() {
                              handleProjectClose()
                         }
                    })
                    const errorData = await response.json()
                    console.log(errorData);
               }

          } catch (err) {
               alert(err);
          }
     }

     const handleDeleteButtonClick = () => {
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
               if (result.isConfirmed) {
                    handleDeleteProject()
               }
          })
     }

     const handleDeleteProject = async () => {

          try {
               const response = await fetch('/api/project-summaries-api', {
                    method: 'DELETE',
                    headers: {
                         'Content-Type': 'application/json',
                         'Access-Control-Allow-Origin': 'https://lda-dashboard.vercel.app/api/project-api, http://localhost:3000/api/project-api',
                         'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS' // Set the content type to JSON
                    },
                    body: JSON.stringify(currentProjectID), // Convert your data to JSON
               })

               if (response.ok) {
                    Swal.fire({
                         icon: 'success',
                         title: 'Sve OK!',
                         text: 'Projekat obrisan!',
                    })
                    router.refresh()
               } else {
                    console.log(await response.json())
               }

          } catch (err) {
               alert(err);
          }
     }

     const handleAddToProjectObjectArray = (arrayName: ArrayKeys, newArray: string[]) => {
          setCurrentProjectObject(prevProject => {
               if (!prevProject) {
                    console.error('Project object is null.');
                    return null;
               }

               const updatedProject: ProjectSummary = { ...prevProject };
               updatedProject[arrayName] = newArray;
               return updatedProject;
          });
     };

     const onAddNewGalleryImage = (imageURL: string) => {
          setCurrentProjectObject((prevProject: ProjectSummary | null | undefined) => {
               if (prevProject) {
                    const newGallery = [...prevProject.gallery, imageURL]; // Adding imageURL to the end of the array
                    return {
                         ...prevProject,
                         gallery: newGallery,
                    };
               }
               return prevProject;
          });
     };

     const onAddNewCoverImage = (imageURL: string) => {
          setCurrentProjectObject((prevProject: ProjectSummary | null | undefined) => {
               if (prevProject) {
                    return {
                         ...prevProject,
                         projectSummaryCoverURL: imageURL
                    };
               }
               return prevProject;
          });
     }

     const onDeleteGalleryImage = async (imageURL: any) => {

          const url = imageURL.target.currentSrc.split('?')[0]

          if (!imageURL) {
               return;
          }

          setLoading(true);
          //use process env
          const apiUrl = '/api/aws-s3';

          try {
               const response = await fetch(apiUrl, {
                    method: 'DELETE',
                    headers: {
                         'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(imageURL.target.currentSrc)
               });

               if (!response.ok) {
                    Swal.fire({
                         title: 'Greška, neuspešno brisanje slike!',
                         text: "Ako niste uploadovali novu sliku, ne možete je ni obrisati!",
                         icon: 'error',
                         confirmButtonColor: '#3085d6',
                         confirmButtonText: 'OK',
                         // didClose() {
                         //      handleProjectClose()
                         // }
                    })
               } else {
                    setCurrentProjectObject((prevProject: ProjectSummary | null | undefined) => {
                         if (prevProject) {
                              const newGallery: string[] = prevProject.gallery.filter((image: string) => image !== url); // Remove the specified imageURL from the array
                              return {
                                   ...prevProject,
                                   gallery: newGallery,
                              };
                         }
                         return prevProject;
                    })
                    Swal.fire({
                         title: 'OK',
                         text: "Uspešno brisanje slike! Potrebno je sad da se uradi izmena projekta!",
                         icon: 'success',
                         confirmButtonColor: '#3085d6',
                         confirmButtonText: 'OK',
                    })

               }

          } catch (error) {
               console.error('Error uploading image:', error);
          } finally {
               setLoading(false);
          }
     }

     const onDeleteCoverImage = async (imageURL: any) => {
          const url = imageURL.target.currentSrc.split('?')[0]

          if (!imageURL) {
               return;
          }

          setLoading(true);

          const apiUrl = '/api/aws-s3';

          try {
               const response = await fetch(apiUrl, {
                    method: 'DELETE',
                    headers: {
                         'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(imageURL.target.currentSrc)
               });

               if (!response.ok) {
                    Swal.fire({
                         title: 'Greška, neuspešno brisanje slike!',
                         text: "Ako niste uploadovali novu sliku, ne možete je ni obrisati!",
                         icon: 'error',
                         confirmButtonColor: '#3085d6',
                         confirmButtonText: 'OK',
                         // didClose() {
                         //      handleProjectClose()
                         // }
                    })
               } else {
                    setCurrentProjectObject((prevProject: ProjectSummary | null | undefined) => {
                         if (prevProject) {
                              return {
                                   ...prevProject,
                                   projectSummaryCoverURL: ''
                              };
                         }
                         return prevProject;
                    })
                    Swal.fire({
                         title: 'OK',
                         text: "Uspešno brisanje slike! Potrebno je sad da se uradi izmena projekta!",
                         icon: 'success',
                         confirmButtonColor: '#3085d6',
                         confirmButtonText: 'OK',
                    })

               }

          } catch (error) {
               console.error('Error uploading image:', error);
          } finally {
               setLoading(false);
          }
     }

     const handleGalleryChange = async (event: any) => {

          const selectedFile = event.target.files[0];

          if (!selectedFile) {
               return;
          }

          setLoading(true);

          // Extract file extension
          const fileExtension = selectedFile.name.split('.')[1]

          // Assuming you have a title for the image
          const title = currentProjectObject?.title!

          const apiUrl = '/api/aws-s3';

          try {
               const reader = new FileReader();
               reader.readAsDataURL(selectedFile);
               reader.onloadend = async () => {
                    const base64Data = reader.result;
                    const data = {
                         file: base64Data,
                         title: title,
                         extension: fileExtension,
                         fileName: selectedFile.name
                    };

                    const response = await fetch(apiUrl, {
                         method: 'POST',
                         headers: {
                              'Content-Type': 'application/json'
                         },
                         body: JSON.stringify(data),
                    });

                    if (!response.ok) {
                         Swal.fire({
                              title: 'Greška',
                              text: "Neuspešan upload slike!",
                              icon: 'error',
                              confirmButtonColor: '#3085d6',
                              confirmButtonText: 'OK',
                         })
                    } else {
                         Swal.fire({
                              title: 'OK',
                              text: "Uspešan upload slike!",
                              icon: 'success',
                              confirmButtonColor: '#3085d6',
                              confirmButtonText: 'OK',
                         })
                         const result = await response.json();
                         const imageUrl = result.imageUrl;
                         onAddNewGalleryImage(imageUrl);
                    }
               }
          } catch (error) {
               console.error('Error uploading image:', error);
          } finally {
               setLoading(false);
          }
     };

     const handleCoverChange = async (event: any) => {

          const selectedFile = event.target.files[0];

          if (!selectedFile) {
               return;
          }

          setLoading(true);

          // Extract file extension
          const fileExtension = selectedFile.name.split('.')[1]

          // Assuming you have a title for the image
          const title = currentProjectObject?.title!

          const apiUrl = '/api/aws-s3';

          try {
               const reader = new FileReader();
               reader.readAsDataURL(selectedFile);
               reader.onloadend = async () => {
                    const base64Data = reader.result;
                    const data = {
                         file: base64Data,
                         title: title,
                         extension: fileExtension,
                         fileName: selectedFile.name
                    };

                    const response = await fetch(apiUrl, {
                         method: 'POST',
                         headers: {
                              'Content-Type': 'application/json'
                         },
                         body: JSON.stringify(data),
                    });

                    if (!response.ok) {
                         Swal.fire({
                              title: 'Greška',
                              text: "Neuspešan upload slike!",
                              icon: 'error',
                              confirmButtonColor: '#3085d6',
                              confirmButtonText: 'OK',
                         })
                    } else {
                         Swal.fire({
                              title: 'OK',
                              text: "Uspešan upload slike!",
                              icon: 'success',
                              confirmButtonColor: '#3085d6',
                              confirmButtonText: 'OK',
                         })
                         const result = await response.json();
                         const imageUrl = result.imageUrl;
                         onAddNewCoverImage(imageUrl);
                    }
               }
          } catch (error) {
               console.error('Error uploading image:', error);
          } finally {
               setLoading(false);
          }
     };

     const onGalleryImageClick = (imageURL: any) => {

          Swal.fire({
               title: 'Da li ste sigurni da želite da obrišete sliku?',
               text: "Možete obrisati samo sliku koju ste uploadovali!",
               icon: 'warning',
               showCancelButton: true,
               confirmButtonColor: '#3085d6',
               cancelButtonColor: '#d33',
               confirmButtonText: 'Da, obriši!',
               cancelButtonText: 'Odustani!'
          }).then((result) => {
               if (result.isConfirmed) {
                    onDeleteGalleryImage(imageURL)
               } else {
                    // handleProjectClose()
               }
          })
     }

     const onCoverImageClick = (imageURL: any) => {

          Swal.fire({
               title: 'Da li ste sigurni da želite da obrišete sliku?',
               text: "Možete obrisati samo sliku koju ste uploadovali!",
               icon: 'warning',
               showCancelButton: true,
               confirmButtonColor: '#3085d6',
               cancelButtonColor: '#d33',
               confirmButtonText: 'Da, obriši!',
               cancelButtonText: 'Odustani!'
          }).then((result) => {
               if (result.isConfirmed) {
                    onDeleteCoverImage(imageURL)
               } else {
                    // handleProjectClose()
               }
          })
     }

     const handlePublicationsChange = async (event: any) => {

          const selectedFile = event.target.files[0];

          if (!selectedFile) {
               return;
          }

          // Validate file type
          const validExtensions = ['pdf', 'docx', 'doc'];
          const fileExtension = selectedFile.name.split('.').pop().toLowerCase();

          if (!validExtensions.includes(fileExtension)) {
               Swal.fire({
                    title: 'Greška',
                    text: "Dozvoljeni su samo PDF i Word dokumenti!",
                    icon: 'error',
                    confirmButtonColor: '#3085d6',
                    confirmButtonText: 'OK',
               });
               return;
          }

          setLoading(true);

          // Assuming you have a title for the publication
          const title = currentProjectObject?.title;

          const apiUrl = '/api/aws-s3';

          try {
               const reader = new FileReader();

               reader.readAsDataURL(selectedFile);
               reader.onloadend = async () => {
                    const base64Data = reader.result;
                    const data = {
                         file: base64Data,
                         title: title,
                         extension: fileExtension,
                         fileName: selectedFile.name
                    };

                    const response = await fetch(apiUrl, {
                         method: 'POST',
                         headers: {
                              'Content-Type': 'application/json'
                         },
                         body: JSON.stringify(data),
                    });

                    if (!response.ok) {
                         Swal.fire({
                              title: 'Greška',
                              text: "Neuspešan upload publikacije!",
                              icon: 'error',
                              confirmButtonColor: '#3085d6',
                              confirmButtonText: 'OK',
                         });
                    } else {
                         const result = await response.json();

                         onAddNewPublication(result.imageUrl);

                         Swal.fire({
                              title: 'OK',
                              text: "Uspešan upload publikacije!",
                              icon: 'success',
                              confirmButtonColor: '#3085d6',
                              confirmButtonText: 'OK',
                         });
                    }
               }
          } catch (error) {
               console.error('Error uploading publication:', error);
               Swal.fire({
                    title: 'Greška',
                    text: "Došlo je do greške prilikom učitavanja publikacije!",
                    icon: 'error',
                    confirmButtonColor: '#3085d6',
                    confirmButtonText: 'OK',
               });
          } finally {
               setLoading(false);
          }
     }

     const handleDeletePublication = async (publicationURL: any) => {

          if (!publicationURL) {
               return;
          }

          setLoading(true);

          const apiUrl = '/api/aws-s3';

          try {
               const response = await fetch(apiUrl, {
                    method: 'DELETE',
                    headers: {
                         'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(publicationURL)
               });

               if (!response.ok) {
                    Swal.fire({
                         title: 'Greška, neuspešno brisanje publikacije!',
                         text: "Ako niste uploadovali publikaciju, ne možete je ni obrisati!",
                         icon: 'error',
                         confirmButtonColor: '#3085d6',
                         confirmButtonText: 'OK',
                         // didClose() {
                         //      handleProjectClose()
                         // }
                    })
               } else {
                    setCurrentProjectObject((prevProject: ProjectSummary | null | undefined) => {
                         if (prevProject) {
                              const newPublications: string[] = prevProject.publications.filter((image: string) => image !== publicationURL); // Remove the specified imageURL from the array
                              return {
                                   ...prevProject,
                                   publications: newPublications,
                              };
                         }
                         return prevProject;
                    })
                    Swal.fire({
                         title: 'OK',
                         text: "Uspešno brisanje publikacije! Potrebno je sad da se uradi izmena projekta!",
                         icon: 'success',
                         confirmButtonColor: '#3085d6',
                         confirmButtonText: 'OK',
                    })

               }

          } catch (error) {
               console.error('Error uploading image:', error);
          } finally {
               setLoading(false);
          }
     }

     const onPublicationClick = (publicationURL: string) => {
          Swal.fire({
               title: 'Da li ste sigurni da želite da obrišete publikaciju?',
               text: "Možete obrisati samo publikaciju koju ste uploadovali!",
               icon: 'warning',
               showCancelButton: true,
               confirmButtonColor: '#3085d6',
               cancelButtonColor: '#d33',
               confirmButtonText: 'Da, obriši!',
               cancelButtonText: 'Odustani!'
          }).then((result) => {
               if (result.isConfirmed) {
                    handleDeletePublication(publicationURL)
               } else {
                    // handleProjectClose()
               }
          })
     }

     const onAddNewPublication = (publicationURL: string) => {

          setCurrentProjectObject((prevProject: ProjectSummary | null | undefined) => {
               if (prevProject) {
                    const newPublications = [...prevProject.publications, publicationURL]; // Adding imageURL to the end of the array
                    return {
                         ...prevProject,
                         publications: newPublications,
                    };
               }
               return prevProject;
          });
     };

     return (
          <Card>
               <Scrollbar>
                    <Box sx={{ minWidth: 800 }}>
                         <Table>
                              <TableHead>
                                   <TableRow>
                                        <TableCell>

                                        </TableCell>
                                        <TableCell>
                                             Projekat
                                        </TableCell>

                                   </TableRow>
                              </TableHead>
                              <TableBody>
                                   {
                                        items.length > 0 ?
                                             items.map((project: ProjectSummary) => {
                                                  //const isSelected = selected.includes(project._id);
                                                  const isCurrent = project._id === currentProjectID;

                                                  return (
                                                       <Fragment key={Math.floor(Math.random() * 1000000)}>
                                                            <TableRow
                                                                 hover
                                                            >
                                                                 <TableCell

                                                                      padding="checkbox"
                                                                      sx={{
                                                                           ...(isCurrent && {
                                                                                position: 'relative',
                                                                                '&:after': {
                                                                                     position: 'absolute',
                                                                                     content: '" "',
                                                                                     top: 0,
                                                                                     left: 0,
                                                                                     width: 3,
                                                                                     height: 'calc(100% + 1px)',
                                                                                },
                                                                           }),
                                                                      }}
                                                                      width="25%"
                                                                 >
                                                                      <IconButton onClick={() => handleProjectToggle(project._id)}>
                                                                           <SvgIcon >{isCurrent ? <ChevronDownIcon /> : <ChevronRightIcon />}</SvgIcon >
                                                                      </IconButton>
                                                                 </TableCell>

                                                                 <TableCell >
                                                                      <Typography>{project.title}</Typography>
                                                                 </TableCell>
                                                            </TableRow>
                                                            {
                                                                 isCurrent && (
                                                                      <TableRow key={Math.floor(Math.random() * 1000000)}>
                                                                           <TableCell
                                                                                colSpan={7}
                                                                                sx={{
                                                                                     margin: '20px',
                                                                                     p: 0,
                                                                                     position: 'relative',
                                                                                     '&:after': {
                                                                                          position: 'absolute',
                                                                                          content: '" "',
                                                                                          top: 0,
                                                                                          left: 0,
                                                                                          width: 3,
                                                                                          height: 'calc(100% + 1px)',

                                                                                     },
                                                                                }}
                                                                           >

                                                                                <Grid
                                                                                     item
                                                                                     md={6}
                                                                                     xs={12}
                                                                                >
                                                                                     <TextField
                                                                                          defaultValue={project.title}
                                                                                          fullWidth
                                                                                          label="Naziv projekta"
                                                                                          name="name"
                                                                                          disabled
                                                                                     />
                                                                                </Grid>
                                                                                <Grid
                                                                                     item
                                                                                     md={6}
                                                                                     xs={12}
                                                                                >
                                                                                     <TextField
                                                                                          defaultValue={project.projectSummaryURL}
                                                                                          fullWidth
                                                                                          label="URL projekta"
                                                                                          name="name"
                                                                                          disabled
                                                                                          onBlur={(e: any) =>
                                                                                               setCurrentProjectObject((previousObject: any) => ({
                                                                                                    ...previousObject,
                                                                                                    projectSummaryURL: e.target.value

                                                                                               }))
                                                                                          }
                                                                                     />
                                                                                </Grid>
                                                                                <Grid
                                                                                     item
                                                                                     md={6}
                                                                                     xs={12}
                                                                                >
                                                                                     <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                                                          <DateField

                                                                                               format='MM/DD/YYYY'
                                                                                               InputLabelProps={{ shrink: true }}
                                                                                               fullWidth
                                                                                               disabled={loading}
                                                                                               label={`Datum pocetka projekta`}
                                                                                               defaultValue={dayjs(currentProjectObject?.projectStartDateTime)}
                                                                                               onBlur={(newValue: any) => {
                                                                                                    const date = moment(newValue.target.value).format('MM/DD/YYYY');
                                                                                                    setCurrentProjectObject((previousObject: any) => ({
                                                                                                         ...previousObject,
                                                                                                         projectStartDateTime: date
                                                                                                    }))
                                                                                               }}
                                                                                          />
                                                                                     </LocalizationProvider>
                                                                                </Grid>
                                                                                <Grid
                                                                                     item
                                                                                     md={6}
                                                                                     xs={12}
                                                                                >
                                                                                     <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                                                          <DateField
                                                                                               format='MM/DD/YYYY'
                                                                                               InputLabelProps={{ shrink: true }}
                                                                                               fullWidth
                                                                                               disabled={loading}
                                                                                               label={`Datum kraja projekta`}
                                                                                               defaultValue={dayjs(currentProjectObject?.projectEndDateTime)}
                                                                                               onBlur={(newValue: any) => {
                                                                                                    const date = moment(newValue.target.value).format('MM/DD/YYYY');
                                                                                                    setCurrentProjectObject((previousObject: any) => ({
                                                                                                         ...previousObject,
                                                                                                         projectEndDateTime: date
                                                                                                    }))
                                                                                               }}
                                                                                          />
                                                                                     </LocalizationProvider>
                                                                                </Grid>
                                                                                {/* ------------------------Category------------------------ */}
                                                                                <Grid
                                                                                     item
                                                                                     md={6}
                                                                                     xs={12}
                                                                                >
                                                                                     <TextField
                                                                                          defaultValue={currentProjectObject?.category}
                                                                                          fullWidth
                                                                                          label="Kategorija aktivnosti"
                                                                                          select
                                                                                          disabled={loading}
                                                                                          onBlur={(e: any) =>
                                                                                               setCurrentProjectObject((previousObject: any) => ({
                                                                                                    ...previousObject,
                                                                                                    category: e.target.value
                                                                                               }))
                                                                                          }
                                                                                     >
                                                                                          {projectCategory.map((option: ProjectCategory) => (
                                                                                               <MenuItem
                                                                                                    key={Math.floor(Math.random() * 1000000)}
                                                                                                    value={option}
                                                                                               >
                                                                                                    {
                                                                                                         option == 'other' ? 'Ostalo' :
                                                                                                              option == 'eu-integrations' ? 'EU integracije' :
                                                                                                                   option == 'intercultural-dialogue' ? 'Interkulturalni dijalog' :
                                                                                                                        option == 'migrations' ? 'Migracije' :
                                                                                                                             option == 'youth' ? 'Mladi' :
                                                                                                                                  option == 'culture' ? 'Kultura' :
                                                                                                                                       option == 'economy' ? 'Ekonomija' :
                                                                                                                                            option == 'democracy' ? 'Demokratija' : ''
                                                                                                    }
                                                                                               </MenuItem>
                                                                                          ))}
                                                                                     </TextField>
                                                                                </Grid>
                                                                                <Grid
                                                                                     item
                                                                                     md={6}
                                                                                     xs={12}
                                                                                >
                                                                                     <TextField
                                                                                          defaultValue={currentProjectObject?.status}
                                                                                          fullWidth
                                                                                          label="Status projekta"
                                                                                          select
                                                                                          disabled={loading}
                                                                                          onChange={(e: any) =>
                                                                                               setCurrentProjectObject((previousObject: any) => ({
                                                                                                    ...previousObject,
                                                                                                    status: e.target.value
                                                                                               }))
                                                                                          }
                                                                                     >
                                                                                          {projectStatus.map((option: ProjectStatus) => (
                                                                                               <MenuItem
                                                                                                    key={Math.floor(Math.random() * 1000000)}
                                                                                                    value={option.value}
                                                                                               >
                                                                                                    {option.name}
                                                                                               </MenuItem>
                                                                                          ))}
                                                                                     </TextField>
                                                                                </Grid>
                                                                                <Grid
                                                                                     item
                                                                                     md={6}
                                                                                     xs={12}
                                                                                >
                                                                                     <TextField
                                                                                          defaultValue={project.locale}
                                                                                          fullWidth
                                                                                          label="Jezik projekta"
                                                                                          select
                                                                                          disabled
                                                                                          onBlur={(e: any) =>
                                                                                               setCurrentProjectObject((previousObject: any) => ({
                                                                                                    ...previousObject,
                                                                                                    locale: e.target.value
                                                                                               }))
                                                                                          }
                                                                                     >
                                                                                          {locales.map((option: ProjectLocale) => (
                                                                                               <MenuItem
                                                                                                    key={Math.floor(Math.random() * 1000000)}
                                                                                                    value={option.value}
                                                                                               >
                                                                                                    {option.name}
                                                                                               </MenuItem>
                                                                                          ))}
                                                                                     </TextField>
                                                                                </Grid>

                                                                                <Grid
                                                                                     item
                                                                                     md={6}
                                                                                     xs={12}
                                                                                >
                                                                                     <TextField
                                                                                          defaultValue={project.organizers}
                                                                                          fullWidth
                                                                                          label={`Organizatori projekta (odvojiti zarezom)`}
                                                                                          name="name"
                                                                                          disabled={loading}
                                                                                          onBlur={(e: any) => {
                                                                                               const newArray = e.target.value.split(',').map((value: string) => value.trim());
                                                                                               handleAddToProjectObjectArray('organizers', newArray)
                                                                                          }}
                                                                                     />
                                                                                </Grid>
                                                                                <Grid
                                                                                     item
                                                                                     md={6}
                                                                                     xs={12}
                                                                                >
                                                                                     <TextField
                                                                                          defaultValue={project.locations}
                                                                                          fullWidth
                                                                                          label={`Lokacije projekta (odvojiti zarezom)`}
                                                                                          name="name"
                                                                                          disabled={loading}
                                                                                          onBlur={(e: any) => {
                                                                                               const newArray = e.target.value.split(',').map((value: string) => value.trim());
                                                                                               handleAddToProjectObjectArray('locations', newArray)
                                                                                          }}
                                                                                     />
                                                                                </Grid>
                                                                                <Grid
                                                                                     item
                                                                                     md={6}
                                                                                     xs={12}
                                                                                >
                                                                                     <TextField
                                                                                          defaultValue={project.applicants}
                                                                                          fullWidth
                                                                                          label={`Aplikanti projekta (odvojiti zarezom)`}
                                                                                          name="name"
                                                                                          disabled={loading}
                                                                                          onBlur={(e: any) => {
                                                                                               const newArray = e.target.value.split(',').map((value: string) => value.trim());
                                                                                               handleAddToProjectObjectArray('applicants', newArray)
                                                                                          }}
                                                                                     />
                                                                                </Grid>
                                                                                <Grid
                                                                                     item
                                                                                     md={6}
                                                                                     xs={12}
                                                                                >
                                                                                     <TextField
                                                                                          defaultValue={project.donators}
                                                                                          fullWidth
                                                                                          label={`Donatori projekta (odvojiti zarezom)`}
                                                                                          name="name"
                                                                                          disabled={loading}
                                                                                          onBlur={(e: any) => {
                                                                                               const newArray = e.target.value.split(',').map((value: string) => value.trim());
                                                                                               handleAddToProjectObjectArray('donators', newArray)
                                                                                          }}
                                                                                     />
                                                                                </Grid>
                                                                                <Grid
                                                                                     item
                                                                                     md={6}
                                                                                     xs={12}
                                                                                >
                                                                                     <TextField
                                                                                          defaultValue={project.links}
                                                                                          fullWidth
                                                                                          label={`Linkovi (odvojiti zarezom)`}
                                                                                          name="name"
                                                                                          disabled={loading}
                                                                                          onBlur={(e: any) => {
                                                                                               const newArray = e.target.value.split(',').map((value: string) => value.trim());
                                                                                               handleAddToProjectObjectArray('links', newArray)
                                                                                          }}
                                                                                     />
                                                                                </Grid>
                                                                                <Divider sx={{ borderBottomWidth: 5, borderColor: theme.palette.primary.main }} />
                                                                                <Grid
                                                                                     item
                                                                                     md={6}
                                                                                     xs={12}
                                                                                >
                                                                                     <Tooltip placement='bottom-start' title={'Ovde se dodaje slika koja predstavlja naslovnu sliku aktivnosti. Može biti samo jedna.'}>
                                                                                          <Typography sx={{ margin: '10px' }}>Glavna slika projekta:</Typography>
                                                                                     </Tooltip>
                                                                                     <Box sx={{ display: 'flex', flexDirection: 'column', paddingLeft: '30px', marginBottom: '30px' }}>
                                                                                          {/* -------------------------slike------------------------------------------ */}
                                                                                          {
                                                                                               currentProjectObject?.projectSummaryCoverURL && (
                                                                                                    <ImageListItem key={Math.floor(Math.random() * 1000000)}>
                                                                                                         <img
                                                                                                              src={`${currentProjectObject?.projectSummaryCoverURL.toString()}`}
                                                                                                              alt={'image'}
                                                                                                              loading="lazy"
                                                                                                              onClick={(e: any) => onCoverImageClick(e)}
                                                                                                              style={{ cursor: 'pointer', width: '100px', height: '200px', borderRadius: '10px', marginBottom: '10px' }}
                                                                                                         />
                                                                                                    </ImageListItem>
                                                                                               )
                                                                                          }

                                                                                          <Button component="label"
                                                                                               variant="contained"
                                                                                               startIcon={<CloudUploadIcon />}
                                                                                               sx={{ maxWidth: '200px' }}
                                                                                          >
                                                                                               {
                                                                                                    currentProjectObject?.projectSummaryCoverURL != "" ? 'Promeni sliku' : 'Učitaj sliku'
                                                                                               }
                                                                                               <Input
                                                                                                    type="file"
                                                                                                    inputProps={{ accept: 'image/*' }}
                                                                                                    sx={{
                                                                                                         clip: 'rect(0 0 0 0)',
                                                                                                         clipPath: 'inset(50%)',
                                                                                                         height: 1,
                                                                                                         overflow: 'hidden',
                                                                                                         position: 'absolute',
                                                                                                         bottom: 0,
                                                                                                         left: 0,
                                                                                                         whiteSpace: 'nowrap',
                                                                                                         width: 1,
                                                                                                    }}
                                                                                                    onChange={async (e: any) => await handleCoverChange(e)}
                                                                                               />
                                                                                          </Button>

                                                                                     </Box>
                                                                                </Grid>
                                                                                <Divider sx={{ borderBottomWidth: 5, borderColor: theme.palette.primary.main }} />
                                                                                <Tooltip placement='bottom-start' title={'Ovde možemo samo da brišemo slike. Nakon brisanja slike, obavezno uraditi izmenu dokumenta!'}>
                                                                                     <Typography sx={{ margin: '10px' }}>Slike:</Typography>
                                                                                </Tooltip>
                                                                                <Box sx={{ display: 'flex', flexDirection: 'column', paddingLeft: '30px', marginBottom: '20px', width: '90%' }}>
                                                                                     {/* -------------------------slike------------------------------------------ */}
                                                                                     {
                                                                                          currentProjectObject?.gallery && currentProjectObject.gallery.length > 0 && (
                                                                                               <ImageList sx={{ width: '90%' }} cols={theme.breakpoints.down('sm') ? 4 : 1} rowHeight={164}>
                                                                                                    {currentProjectObject.gallery.map((item: any) => (
                                                                                                         <ImageListItem key={Math.floor(Math.random() * 1000000)} sx={{ margin: '20px 10px 10px 0' }}>
                                                                                                              <img
                                                                                                                   // srcSet={`${item.img}?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}
                                                                                                                   src={`${item}`}
                                                                                                                   alt={'image'}
                                                                                                                   loading="lazy"
                                                                                                                   onClick={(e: any) => onGalleryImageClick(e)}
                                                                                                                   style={{ cursor: 'pointer', width: '200px', height: '400px', borderRadius: '10px' }}
                                                                                                              />

                                                                                                         </ImageListItem>
                                                                                                    ))}
                                                                                               </ImageList>
                                                                                          )
                                                                                     }

                                                                                     <Button component="label"
                                                                                          variant="contained"
                                                                                          startIcon={<CloudUploadIcon />}
                                                                                          sx={{ maxWidth: '150px', marginTop: '40px' }}
                                                                                     >
                                                                                          Učitaj sliku
                                                                                          <Input
                                                                                               type="file"
                                                                                               inputProps={{ accept: 'image/*' }}
                                                                                               sx={{
                                                                                                    clip: 'rect(0 0 0 0)',
                                                                                                    clipPath: 'inset(50%)',
                                                                                                    height: 1,
                                                                                                    overflow: 'hidden',
                                                                                                    position: 'absolute',
                                                                                                    bottom: 0,
                                                                                                    left: 0,
                                                                                                    whiteSpace: 'nowrap',
                                                                                                    width: 1,
                                                                                               }}
                                                                                               onChange={async (e: any) => await handleGalleryChange(e)}
                                                                                          />
                                                                                     </Button>

                                                                                </Box>
                                                                                <Divider sx={{ borderBottomWidth: 5, borderColor: theme.palette.primary.main }} />
                                                                                <Tooltip placement='bottom-start' title={'Ovde možemo samo da brišemo publikacije za sad. Ako želimo da pregledamo, moramo otići na lda-subotica.org'}>

                                                                                     <Typography sx={{ margin: '10px' }}>Publikacije:</Typography>
                                                                                </Tooltip>
                                                                                <Box sx={{ display: 'flex', flexDirection: 'column', paddingLeft: '30px', width: '90%', marginBottom: '20px' }}>
                                                                                     {/* -------------------------publikacije------------------------------------------ */}
                                                                                     {
                                                                                          currentProjectObject?.publications && currentProjectObject.publications.length > 0 && (
                                                                                               <Box sx={{ width: '90%', display: 'flex' }}
                                                                                               >
                                                                                                    {currentProjectObject.publications.map((item: string, index: number) => (
                                                                                                         <Box
                                                                                                              key={index}
                                                                                                              sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-around', marginRight: '40px' }}
                                                                                                         >
                                                                                                              {getThumbnail(item) === 'pdf' ? (


                                                                                                                   <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '100px' }}>
                                                                                                                        <PictureAsPdfIcon
                                                                                                                             sx={{ color: theme.palette.primary.dark, cursor: 'pointer', width: '50px', alignItems: 'center', height: '50px' }}
                                                                                                                             onClick={() => onPublicationClick(item)}
                                                                                                                        />
                                                                                                                        <Tooltip title={extractFileName(item)}>
                                                                                                                             <Typography
                                                                                                                                  sx={{
                                                                                                                                       overflow: 'hidden',
                                                                                                                                       textOverflow: 'ellipsis',
                                                                                                                                       whiteSpace: 'nowrap',
                                                                                                                                       maxWidth: '100px', // Adjust the width as needed
                                                                                                                                  }}
                                                                                                                             >
                                                                                                                                  {extractFileName(item)}
                                                                                                                             </Typography>
                                                                                                                        </Tooltip>
                                                                                                                   </Box>

                                                                                                              ) : getThumbnail(item) === 'doc' ? (

                                                                                                                   <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100px' }}>
                                                                                                                        <ArticleIcon
                                                                                                                             sx={{ color: theme.palette.primary.dark, cursor: 'pointer', width: '50px', height: '50px' }}
                                                                                                                             onClick={() => onPublicationClick(item)}
                                                                                                                        />
                                                                                                                        <Tooltip title={extractFileName(item)}>
                                                                                                                             <Typography
                                                                                                                                  sx={{
                                                                                                                                       overflow: 'hidden',
                                                                                                                                       textOverflow: 'ellipsis',
                                                                                                                                       whiteSpace: 'nowrap',
                                                                                                                                       maxWidth: '100px', // Adjust the width as needed
                                                                                                                                  }}
                                                                                                                             >
                                                                                                                                  {extractFileName(item)}
                                                                                                                             </Typography>
                                                                                                                        </Tooltip>
                                                                                                                   </Box>
                                                                                                              ) : null}
                                                                                                         </Box>
                                                                                                    ))}
                                                                                               </Box>
                                                                                          )
                                                                                     }


                                                                                     <Button component="label"
                                                                                          variant="contained"
                                                                                          startIcon={<CloudUploadIcon />}
                                                                                          sx={{ maxWidth: '150px', marginTop: '40px' }}
                                                                                     >
                                                                                          Učitaj dokument
                                                                                          <Input
                                                                                               type="file"
                                                                                               inputProps={{ accept: '.pdf, .docx, .doc' }}
                                                                                               sx={{
                                                                                                    clip: 'rect(0 0 0 0)',
                                                                                                    clipPath: 'inset(50%)',
                                                                                                    height: 1,
                                                                                                    overflow: 'hidden',
                                                                                                    position: 'absolute',
                                                                                                    bottom: 0,
                                                                                                    left: 0,
                                                                                                    whiteSpace: 'nowrap',
                                                                                                    width: 1,
                                                                                               }}
                                                                                               onChange={(e: any) => handlePublicationsChange(e)}
                                                                                          />
                                                                                     </Button>

                                                                                </Box>

                                                                                <Divider sx={{ borderBottomWidth: 5, borderColor: theme.palette.primary.main }} />
                                                                                <Stack
                                                                                     alignItems="center"
                                                                                     direction="row"
                                                                                     justifyContent="space-between"
                                                                                     sx={{ p: 2 }}
                                                                                >
                                                                                     <Stack
                                                                                          alignItems="center"
                                                                                          direction="row"
                                                                                          spacing={2}
                                                                                     >
                                                                                          <Button
                                                                                               onClick={handleProjectUpdateClick}
                                                                                               type="submit"
                                                                                               variant="contained"
                                                                                               disabled={loading}
                                                                                          >
                                                                                               Izmeni
                                                                                          </Button>
                                                                                          <Button
                                                                                               color="inherit"
                                                                                               onClick={handleProjectClose}
                                                                                               disabled={loading}
                                                                                          >
                                                                                               Odustani
                                                                                          </Button>
                                                                                     </Stack>
                                                                                     <div>
                                                                                          <Button
                                                                                               onClick={handleDeleteButtonClick}
                                                                                               color="error"
                                                                                               disabled={loading}
                                                                                          >
                                                                                               Obriši projekat
                                                                                          </Button>
                                                                                     </div>
                                                                                </Stack>
                                                                           </TableCell>
                                                                      </TableRow>
                                                                 )
                                                            }
                                                       </Fragment>
                                                  );
                                             })
                                             :
                                             null
                                   }
                              </TableBody>
                         </Table>
                    </Box>
               </Scrollbar>
          </Card >
     );
};



// ProjectsTable.propTypes = {
//           count: PropTypes.number,
//           items: PropTypes.array,
//           onDeselectAll: PropTypes.func,
//           onDeselectOne: PropTypes.func,
//           onPageChange: PropTypes.func,
//           onRowsPerPageChange: PropTypes.func,
//           onSelectAll: PropTypes.func,
//           onSelectOne: PropTypes.func,
//           page: PropTypes.number,
//           rowsPerPage: PropTypes.number,
//           selected: PropTypes.array
// };
