import ChevronRightIcon from '@untitled-ui/icons-react/build/esm/ChevronRight';
import ChevronDownIcon from '@untitled-ui/icons-react/build/esm/ChevronDown';
import {
     Box, Button, Card, Checkbox, Divider, FormControl, Grid, IconButton, ImageList, ImageListItem, Input, MenuItem,
     Stack, SvgIcon, Table, TableBody, TableCell, TableHead, TableRow, TextField, Tooltip, Typography, useTheme
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import AddBoxIcon from '@mui/icons-material/AddBox';
import { Fragment, useState } from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';
import "@uploadthing/react/styles.css";
import dayjs from 'dayjs';
import { ProjectActivity, ProjectCategory, ProjectStatus, projectActivityInitialValues } from './project-activity-type';
import { DateField } from '@mui/x-date-pickers/DateField';
import moment from 'moment';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ArticleIcon from '@mui/icons-material/Article';
import { extractFileName, getThumbnail } from '../project-summaries/project-summary-table';
import { set } from 'nprogress';

const projectStatus: ProjectStatus[] = ['completed', 'in-progress', 'to-do'];

export const projectCategory: ProjectCategory[] = ['economy', 'democracy', 'eu-integrations', 'culture', 'intercultural-dialogue', 'migrations', 'youth', 'other'];

export type ArrayKeys = keyof Pick<ProjectActivity,
     "title" |
     "projectSummaryURL" |
     "projectURL" |
     "links" |
     "subTitle" |
     "paragraphs" |
     "category" |
     "gallery" |
     "locations" |
     "published" |
     "organizers" |
     "applicants" |
     "donators" |
     "publications" |
     "status" |
     "showProjectDetails" |
     "listTitle" |
     "list" |
     "locale"
>;

type ProjectLocale = {
     value: string;
     name: string;
}

const locales: ProjectLocale[] = [{ value: 'en', name: 'Engleski' }, { value: 'sr', name: 'Srpski' }]

export const ProjectActivityTable = (props: any) => {

     const { items, projectActivitiesCount, page, rowsPerPage, selected } = props;
     const [currentProjectID, setCurrentProjectID] = useState(null);
     const [currentProjectObject, setCurrentProjectObject] = useState<ProjectActivity | null | undefined>(projectActivityInitialValues);
     const [listEnabled, setListEnabled] = useState<any>(false)
     const [listOnBottom, setListOnBottom] = useState<any>(false)

     const router = useRouter();
     const theme = useTheme()
     const [loading, setLoading] = useState(false)
     const [selectedImage, setSelectedImage] = useState(null);

     const getObjectById = (_id: any, arrayToSearch: any) => {
          for (const obj of arrayToSearch) {
               if (obj._id === _id) {
                    return obj;  // Found the object with the desired ID
               }
          }
          return null;  // Object with the desired ID not found
     }

     const getProjectSummaryByTitle = (title: string, arrayToSearch: any) => {
          for (const obj of arrayToSearch) {
               if (obj.title === title) {
                    return obj;  // Found the object with the desired ID
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
          });
     }

     const handleProjectClose = () => {
          setCurrentProjectID(null);
     }

     const handleProjectUpdateClick = () => {

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
               const response = await fetch('/api/project-activities-api', {
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
               const response = await fetch('/api/project-activities-api', {
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

     // const handleAddToProjectObjectArray = (arrayName: ArrayKeys, newArray: string[]) => {
     //      setCurrentProjectObject(prevProject => {
     //           if (!prevProject) {
     //                console.error('Project object is null.');
     //                return null;
     //           }

     //           const updatedProject: ProjectActivity = { ...prevProject };
     //           updatedProject[arrayName] = newArray;
     //           return updatedProject;
     //      });
     // };

     const onAddNewOrganizer = (index: number, text: string) => {
          setCurrentProjectObject((prevProject: ProjectActivity | null | undefined) => {
               if (prevProject) {
                    const newOrganizers = [...prevProject.organizers];
                    newOrganizers[index] = text; // Update the subtitle at the clicked index
                    return {
                         ...prevProject,
                         organizers: newOrganizers,
                    };
               }
               return prevProject;
          });
     };

     const onDeleteOrganizer = (index: number) => {
          setCurrentProjectObject((prevProject: ProjectActivity | null | undefined) => {
               if (prevProject) {
                    const newOrganizers = [...prevProject.organizers];
                    newOrganizers.splice(index, 1); // Remove the subtitle at the specified index
                    return {
                         ...prevProject,
                         organizers: newOrganizers,
                    };
               }
               return prevProject;
          });
     };

     const onAddNewParagraph = (index: number, text: string) => {
          setCurrentProjectObject((prevProject: ProjectActivity | null | undefined) => {
               if (prevProject) {
                    const newParagraphs = [...prevProject.paragraphs];
                    newParagraphs[index] = text; // Update the subtitle at the clicked index
                    return {
                         ...prevProject,
                         paragraphs: newParagraphs,
                    };
               }
               return prevProject;
          });
     }

     const onDeleteParagraph = (index: number) => {
          setCurrentProjectObject((prevProject: ProjectActivity | null | undefined) => {
               if (prevProject) {
                    const newParagraphs = [...prevProject.paragraphs];
                    newParagraphs.splice(index, 1); // Remove the subtitle at the specified index
                    return {
                         ...prevProject,
                         paragraphs: newParagraphs,
                    };
               }
               return prevProject;
          });
     }

     const onAddNewApplicant = (index: number, text: string) => {
          setCurrentProjectObject((prevProject: ProjectActivity | null | undefined) => {
               if (prevProject) {
                    const newApplicants = [...prevProject.applicants];
                    newApplicants[index] = text; // Update the subtitle at the clicked index
                    return {
                         ...prevProject,
                         applicants: newApplicants,
                    };
               }
               return prevProject;
          });
     }

     const onDeleteApplicant = (index: number) => {
          setCurrentProjectObject((prevProject: ProjectActivity | null | undefined) => {
               if (prevProject) {
                    const newApplicants = [...prevProject.applicants];
                    newApplicants.splice(index, 1); // Remove the subtitle at the specified index
                    return {
                         ...prevProject,
                         applicants: newApplicants,
                    };
               }
               return prevProject;
          });
     }

     const onAddNewDonator = (index: number, text: string) => {
          setCurrentProjectObject((prevProject: ProjectActivity | null | undefined) => {
               if (prevProject) {
                    const newDonators = [...prevProject.donators];
                    newDonators[index] = text; // Update the subtitle at the clicked index
                    return {
                         ...prevProject,
                         donators: newDonators,
                    };
               }
               return prevProject;
          });
     }

     const onDeleteDonator = (index: number) => {
          setCurrentProjectObject((prevProject: ProjectActivity | null | undefined) => {
               if (prevProject) {
                    const newDonators = [...prevProject.donators];
                    newDonators.splice(index, 1); // Remove the subtitle at the specified index
                    return {
                         ...prevProject,
                         donators: newDonators,
                    };
               }
               return prevProject;
          });
     }

     const onAddNewLocation = (index: number, text: string) => {
          setCurrentProjectObject((prevProject: ProjectActivity | null | undefined) => {
               if (prevProject) {
                    const newLocations = [...prevProject.locations];
                    newLocations[index] = text; // Update the subtitle at the clicked index
                    return {
                         ...prevProject,
                         locations: newLocations,
                    };
               }
               return prevProject;
          });
     }

     const onDeleteLocation = (index: number) => {
          setCurrentProjectObject((prevProject: ProjectActivity | null | undefined) => {
               if (prevProject) {
                    const newLocations = [...prevProject.locations];
                    newLocations.splice(index, 1); // Remove the subtitle at the specified index
                    return {
                         ...prevProject,
                         locations: newLocations,
                    };
               }
               return prevProject;
          });
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
                    setCurrentProjectObject((prevProject: ProjectActivity | null | undefined) => {
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

          setCurrentProjectObject((prevProject: ProjectActivity | null | undefined) => {
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

     const onAddNewList = (index: number, text: string) => {
          setCurrentProjectObject((prevActivity: ProjectActivity | null | undefined) => {
               if (prevActivity) {
                    const newList = [...prevActivity.list];
                    newList[index] = text; // Update the subtitle at the clicked index
                    return {
                         ...prevActivity,
                         list: newList,
                    };
               }
               return prevActivity;
          });
     };

     const onDeleteList = (index: number) => {
          setCurrentProjectObject((prevActivity: ProjectActivity | null | undefined) => {
               if (prevActivity) {
                    const newList = [...prevActivity.list];
                    newList.splice(index, 1); // Remove the subtitle at the specified index
                    return {
                         ...prevActivity,
                         list: newList,
                    };
               }
               return prevActivity;
          });
     };

     const onAddNewLink = (index: number, text: string) => {
          setCurrentProjectObject((prevProject: ProjectActivity | null | undefined) => {
               if (prevProject) {
                    const newLinks = [...prevProject.links];
                    newLinks[index] = text; // Update the subtitle at the clicked index
                    return {
                         ...prevProject,
                         links: newLinks,
                    };
               }
               return prevProject;
          });
     }

     const onDeleteLink = (index: number) => {
          setCurrentProjectObject((prevProject: ProjectActivity | null | undefined) => {
               if (prevProject) {
                    const newLinks = [...prevProject.links];
                    newLinks.splice(index, 1); // Remove the subtitle at the specified index
                    return {
                         ...prevProject,
                         links: newLinks,
                    };
               }
               return prevProject;
          });
     }

     ////////////////////////////////////////////////////////

     const onAddNewImage = (imageURL: string) => {
          setCurrentProjectObject((prevProject: ProjectActivity | null | undefined) => {
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

     const onDeleteImage = async (imageURL: any) => {

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
                         didClose() {
                              handleProjectClose()
                         }
                    })
               } else {
                    setCurrentProjectObject((prevProject: ProjectActivity | null | undefined) => {
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

     const handleFileChange = async (event: any) => {

          const selectedFile = event.target.files[0];

          if (!selectedFile) {
               return;
          }

          setLoading(true);
          setSelectedImage(selectedFile);

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
                         onAddNewImage(imageUrl);
                    }
               }
          } catch (error) {
               console.error('Error uploading image:', error);
          } finally {
               setLoading(false);
          }
     };

     const onImageClick = (imageURL: any) => {

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
                    onDeleteImage(imageURL)
               } else {
                    handleProjectClose()
               }
          })
     }

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
                                             items.map((project: ProjectActivity) => {
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
                                                                                <Divider sx={{ borderBottomWidth: 5, borderColor: theme.palette.primary.main }} />
                                                                                {/* ------------------------Title------------------------ */}
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
                                                                                          onBlur={(e: any) =>
                                                                                               setCurrentProjectObject((previousObject: any) => ({
                                                                                                    ...previousObject,
                                                                                                    name: e.target.value

                                                                                               }))
                                                                                          }
                                                                                     />
                                                                                </Grid>
                                                                                {/* ------------------------Project activity url------------------------ */}
                                                                                <Grid
                                                                                     item
                                                                                     md={6}
                                                                                     xs={12}
                                                                                >
                                                                                     <TextField
                                                                                          defaultValue={project.projectURL}
                                                                                          fullWidth
                                                                                          label="URL projektne aktivnosti"
                                                                                          name="projectURL"
                                                                                          disabled
                                                                                          onBlur={(e: any) =>
                                                                                               setCurrentProjectObject((previousObject: any) => ({
                                                                                                    ...previousObject,
                                                                                                    projectURL: e.target.value

                                                                                               }))
                                                                                          }
                                                                                     />
                                                                                </Grid>
                                                                                {/* ------------------------Sub title, main project------------------------ */}
                                                                                <Grid
                                                                                     item
                                                                                     md={6}
                                                                                     xs={12}
                                                                                >
                                                                                     <TextField
                                                                                          fullWidth
                                                                                          label="Glavni projekat"
                                                                                          disabled
                                                                                          defaultValue={currentProjectObject?.subTitle}
                                                                                     >
                                                                                     </TextField>
                                                                                </Grid>
                                                                                {/* ------------------------Main project url------------------------ */}
                                                                                <Grid
                                                                                     item
                                                                                     md={6}
                                                                                     xs={12}
                                                                                >
                                                                                     <TextField
                                                                                          defaultValue={currentProjectObject?.projectSummaryURL}
                                                                                          fullWidth
                                                                                          label="Link ka glavnom projektu"
                                                                                          name="projectSummaryURL"
                                                                                          disabled
                                                                                     />
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
                                                                                {/* ------------------------Status------------------------ */}
                                                                                <FormControl fullWidth>
                                                                                     <TextField
                                                                                          select
                                                                                          label="Status"
                                                                                          defaultValue={currentProjectObject?.status}
                                                                                          onChange={(e: any) =>
                                                                                               setCurrentProjectObject((previousObject: any) => ({
                                                                                                    ...previousObject,
                                                                                                    status: e.target.value
                                                                                               }))
                                                                                          }
                                                                                     >
                                                                                          {projectStatus.map((status: ProjectStatus) => (
                                                                                               <MenuItem
                                                                                                    key={status}
                                                                                                    value={status}
                                                                                               >
                                                                                                    {status == 'completed' ? 'Završen' :
                                                                                                         status == 'in-progress' ? 'U toku' :
                                                                                                              status == 'to-do' ? 'Za uraditi' :
                                                                                                                   ''
                                                                                                    }
                                                                                               </MenuItem>
                                                                                          ))}
                                                                                     </TextField>
                                                                                </FormControl>
                                                                                {/* ------------------------Published date------------------------ */}
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
                                                                                               label={`Datum objave`}
                                                                                               defaultValue={dayjs(currentProjectObject?.published)}
                                                                                               onBlur={(newValue: any) => {
                                                                                                    const date = moment(newValue.target.value).format('MM/DD/YYYY');
                                                                                                    setCurrentProjectObject((previousObject: any) => ({
                                                                                                         ...previousObject,
                                                                                                         published: date
                                                                                                    }))
                                                                                               }}
                                                                                          />
                                                                                     </LocalizationProvider>
                                                                                </Grid>
                                                                                <Divider sx={{ borderBottomWidth: 5, borderColor: theme.palette.primary.main }} />
                                                                                {/* ------------------------Lists------------------------ */}
                                                                                <Grid
                                                                                     item
                                                                                     md={6}
                                                                                     xs={12}
                                                                                     sx={{ padding: '10px' }}
                                                                                >
                                                                                     <FormControl sx={{ display: 'flex', flexDirection: 'column', width: '400px', height: '50px' }}>
                                                                                          <Typography id="showProjectDetails">Prikazi detalje glavnog projekta</Typography>
                                                                                          <Checkbox
                                                                                               name="showProjectDetails"
                                                                                               defaultChecked={currentProjectObject?.showProjectDetails}
                                                                                               sx={{ width: '10px', height: '10px' }}
                                                                                               onChange={(e) => {
                                                                                                    setCurrentProjectObject((previousObject: any) => ({
                                                                                                         ...previousObject,
                                                                                                         showProjectDetails: e.target.checked
                                                                                                    }))
                                                                                               }}
                                                                                          />
                                                                                     </FormControl>
                                                                                </Grid>
                                                                                <Divider sx={{ borderBottomWidth: 5, borderColor: theme.palette.primary.main }} />
                                                                                <Box sx={{ display: 'flex', flexDirection: 'column', padding: '10px' }}>
                                                                                     <Box sx={{ display: 'flex' }}>
                                                                                          <FormControl sx={{ display: 'flex', flexDirection: 'column', width: '400px', height: '50px' }}>
                                                                                               <Typography id="showList">Prikaži listu</Typography>
                                                                                               <Checkbox
                                                                                                    name="showList"
                                                                                                    defaultChecked={currentProjectObject?.showList == true || (currentProjectObject?.list?.length ?? 0) > 0}
                                                                                                    sx={{ width: '10px', height: '10px' }}
                                                                                                    onChange={(e) => {
                                                                                                         setCurrentProjectObject((previousObject: any) => ({
                                                                                                              ...previousObject,
                                                                                                              showList: e.target.checked
                                                                                                         }))

                                                                                                    }}
                                                                                               />
                                                                                          </FormControl>

                                                                                          <FormControl sx={{ display: 'flex', flexDirection: 'column', width: '400px', height: '50px' }}>
                                                                                               <Typography id="showListOnBottom">Prikaži listu na dnu</Typography>
                                                                                               <Checkbox
                                                                                                    name="showListOnBottom"
                                                                                                    defaultChecked={currentProjectObject?.showListOnBottom}
                                                                                                    sx={{ width: '10px', height: '10px' }}
                                                                                                    onChange={(e) => {
                                                                                                         setCurrentProjectObject((previousObject: any) => ({
                                                                                                              ...previousObject,
                                                                                                              showListOnBottom: e.target.checked
                                                                                                         }))
                                                                                                         setListOnBottom(e.target.checked)
                                                                                                    }}
                                                                                               />
                                                                                          </FormControl>
                                                                                     </Box>
                                                                                     <FormControl

                                                                                     >
                                                                                          <Typography sx={{ margin: '10px' }}>Lista:</Typography>
                                                                                          {
                                                                                               currentProjectObject?.list.length == 0 && currentProjectObject.showList &&
                                                                                               <Box >
                                                                                                    <IconButton onClick={() => onAddNewList(0, '')}>
                                                                                                         <AddBoxIcon />
                                                                                                    </IconButton>
                                                                                                    <IconButton onClick={() => onDeleteList(0)}>
                                                                                                         <DeleteIcon />
                                                                                                    </IconButton>
                                                                                               </Box>
                                                                                          }

                                                                                          {
                                                                                               currentProjectObject?.list.length != 0 &&
                                                                                               currentProjectObject?.list?.map((subtitle: any, index: any) =>
                                                                                                    <Box key={Math.floor(Math.random() * 1000000)} sx={{ display: 'flex', width: '80%' }}>
                                                                                                         <TextField
                                                                                                              defaultValue={currentProjectObject.list[index]}
                                                                                                              fullWidth
                                                                                                              label={`List pasus ${index + 1}`}
                                                                                                              disabled={loading}
                                                                                                              // name={activity.description}
                                                                                                              onBlur={(e: any) => {
                                                                                                                   setCurrentProjectObject((prevActivity: ProjectActivity | null | undefined) => {
                                                                                                                        if (prevActivity) {
                                                                                                                             const newList = [...prevActivity.list];
                                                                                                                             newList[index] = e.target.value; // Update the subtitle at the clicked index
                                                                                                                             return {
                                                                                                                                  ...prevActivity,
                                                                                                                                  list: newList,
                                                                                                                             };
                                                                                                                        }
                                                                                                                        return prevActivity;
                                                                                                                   });
                                                                                                              }}
                                                                                                         />
                                                                                                         <IconButton onClick={() => onAddNewList(index + 1, '')}>
                                                                                                              <AddBoxIcon />
                                                                                                         </IconButton>
                                                                                                         <IconButton onClick={() => onDeleteList(index)}>
                                                                                                              <DeleteIcon />
                                                                                                         </IconButton>
                                                                                                    </Box>
                                                                                               )
                                                                                          }

                                                                                     </FormControl>
                                                                                </Box>

                                                                                {/* ------------------------Locations------------------------ */}
                                                                                <Divider sx={{ borderBottomWidth: 5, borderColor: theme.palette.primary.main }} />
                                                                                <Grid
                                                                                     item
                                                                                     md={6}
                                                                                     xs={12}
                                                                                >
                                                                                     <Typography sx={{ margin: '10px' }}>Lokacije:</Typography>
                                                                                     {
                                                                                          currentProjectObject?.locations.length == 0 &&
                                                                                          <Box>
                                                                                               <IconButton onClick={() => onAddNewLocation(0, '')}>
                                                                                                    <AddBoxIcon />
                                                                                               </IconButton>
                                                                                               <IconButton onClick={() => onDeleteLocation(0)}>
                                                                                                    <DeleteIcon />
                                                                                               </IconButton>
                                                                                          </Box>
                                                                                     }

                                                                                     {
                                                                                          currentProjectObject?.locations.length != 0 &&
                                                                                          currentProjectObject?.locations?.map((location: any, index: any) =>
                                                                                               <Box key={Math.floor(Math.random() * 1000000)} sx={{ display: 'flex', width: '80%' }}>
                                                                                                    <TextField
                                                                                                         defaultValue={currentProjectObject.locations[index]}
                                                                                                         fullWidth
                                                                                                         label={`Lokacija ${index + 1}`}
                                                                                                         disabled={loading}
                                                                                                         // name={activity.description}
                                                                                                         onBlur={(e: any) => {
                                                                                                              setCurrentProjectObject((prevProjectActivity: ProjectActivity | null | undefined) => {
                                                                                                                   if (prevProjectActivity) {
                                                                                                                        const newLocations = [...prevProjectActivity.locations];
                                                                                                                        newLocations[index] = e.target.value; // Update the subtitle at the clicked index
                                                                                                                        return {
                                                                                                                             ...prevProjectActivity,
                                                                                                                             locations: newLocations,
                                                                                                                        };
                                                                                                                   }
                                                                                                                   return prevProjectActivity;
                                                                                                              });
                                                                                                         }}
                                                                                                    />
                                                                                                    <IconButton onClick={() => onAddNewLocation(index + 1, '')}>
                                                                                                         <AddBoxIcon />
                                                                                                    </IconButton>
                                                                                                    <IconButton onClick={() => onDeleteLocation(index)}>
                                                                                                         <DeleteIcon />
                                                                                                    </IconButton>
                                                                                               </Box>
                                                                                          )
                                                                                     }

                                                                                </Grid>
                                                                                {/* ------------------------Organizers------------------------ */}
                                                                                <Grid
                                                                                     item
                                                                                     md={6}
                                                                                     xs={12}
                                                                                >
                                                                                     <Typography sx={{ margin: '10px' }}>Organizatori:</Typography>
                                                                                     {
                                                                                          currentProjectObject?.organizers.length == 0 &&
                                                                                          <Box>
                                                                                               <IconButton onClick={() => onAddNewOrganizer(0, '')}>
                                                                                                    <AddBoxIcon />
                                                                                               </IconButton>
                                                                                               <IconButton onClick={() => onDeleteOrganizer(0)}>
                                                                                                    <DeleteIcon />
                                                                                               </IconButton>
                                                                                          </Box>
                                                                                     }

                                                                                     {
                                                                                          currentProjectObject?.organizers.length != 0 &&
                                                                                          currentProjectObject?.organizers?.map((organizer: any, index: any) =>
                                                                                               <Box key={Math.floor(Math.random() * 1000000)} sx={{ display: 'flex', width: '80%' }}>
                                                                                                    <TextField
                                                                                                         defaultValue={currentProjectObject.organizers[index]}
                                                                                                         fullWidth
                                                                                                         label={`Organizer ${index + 1}`}
                                                                                                         disabled={loading}
                                                                                                         // name={activity.description}
                                                                                                         onBlur={(e: any) => {
                                                                                                              setCurrentProjectObject((prevProjectActivity: ProjectActivity | null | undefined) => {
                                                                                                                   if (prevProjectActivity) {
                                                                                                                        const newOrganizers = [...prevProjectActivity.organizers];
                                                                                                                        newOrganizers[index] = e.target.value; // Update the subtitle at the clicked index
                                                                                                                        return {
                                                                                                                             ...prevProjectActivity,
                                                                                                                             organizers: newOrganizers,
                                                                                                                        };
                                                                                                                   }
                                                                                                                   return prevProjectActivity;
                                                                                                              });
                                                                                                         }}
                                                                                                    />
                                                                                                    <IconButton onClick={() => onAddNewOrganizer(index + 1, '')}>
                                                                                                         <AddBoxIcon />
                                                                                                    </IconButton>
                                                                                                    <IconButton onClick={() => onDeleteOrganizer(index)}>
                                                                                                         <DeleteIcon />
                                                                                                    </IconButton>
                                                                                               </Box>
                                                                                          )
                                                                                     }

                                                                                </Grid>

                                                                                {/* ------------------------Applicants------------------------ */}
                                                                                <Grid
                                                                                     item
                                                                                     md={6}
                                                                                     xs={12}
                                                                                >
                                                                                     <Typography sx={{ margin: '10px' }}>Aplikanti:</Typography>
                                                                                     {
                                                                                          currentProjectObject?.applicants.length == 0 &&
                                                                                          <Box>
                                                                                               <IconButton onClick={() => onAddNewApplicant(0, '')}>
                                                                                                    <AddBoxIcon />
                                                                                               </IconButton>
                                                                                               <IconButton onClick={() => onDeleteApplicant(0)}>
                                                                                                    <DeleteIcon />
                                                                                               </IconButton>
                                                                                          </Box>
                                                                                     }

                                                                                     {
                                                                                          currentProjectObject?.applicants.length != 0 &&
                                                                                          currentProjectObject?.applicants?.map((applicant: any, index: any) =>
                                                                                               <Box key={Math.floor(Math.random() * 1000000)} sx={{ display: 'flex', width: '80%' }}>
                                                                                                    <TextField
                                                                                                         defaultValue={currentProjectObject.applicants[index]}
                                                                                                         fullWidth
                                                                                                         label={`Aplikant ${index + 1}`}
                                                                                                         disabled={loading}
                                                                                                         // name={activity.description}
                                                                                                         onBlur={(e: any) => {
                                                                                                              setCurrentProjectObject((prevProjectActivity: ProjectActivity | null | undefined) => {
                                                                                                                   if (prevProjectActivity) {
                                                                                                                        const newApplicants = [...prevProjectActivity.applicants];
                                                                                                                        newApplicants[index] = e.target.value; // Update the subtitle at the clicked index
                                                                                                                        return {
                                                                                                                             ...prevProjectActivity,
                                                                                                                             applicants: newApplicants,
                                                                                                                        };
                                                                                                                   }
                                                                                                                   return prevProjectActivity;
                                                                                                              });
                                                                                                         }}
                                                                                                    />
                                                                                                    <IconButton onClick={() => onAddNewApplicant(index + 1, '')}>
                                                                                                         <AddBoxIcon />
                                                                                                    </IconButton>
                                                                                                    <IconButton onClick={() => onDeleteApplicant(index)}>
                                                                                                         <DeleteIcon />
                                                                                                    </IconButton>
                                                                                               </Box>
                                                                                          )
                                                                                     }
                                                                                </Grid>
                                                                                {/* ------------------------Donators------------------------ */}
                                                                                <Grid
                                                                                     item
                                                                                     md={6}
                                                                                     xs={12}
                                                                                >
                                                                                     <Typography sx={{ margin: '10px' }}>Donatori:</Typography>
                                                                                     {
                                                                                          currentProjectObject?.donators.length == 0 &&
                                                                                          <Box>
                                                                                               <IconButton onClick={() => onAddNewDonator(0, '')}>
                                                                                                    <AddBoxIcon />
                                                                                               </IconButton>
                                                                                               <IconButton onClick={() => onDeleteDonator(0)}>
                                                                                                    <DeleteIcon />
                                                                                               </IconButton>
                                                                                          </Box>
                                                                                     }

                                                                                     {
                                                                                          currentProjectObject?.donators.length != 0 &&
                                                                                          currentProjectObject?.donators?.map((donator: any, index: any) =>
                                                                                               <Box key={Math.floor(Math.random() * 1000000)} sx={{ display: 'flex', width: '80%' }}>
                                                                                                    <TextField
                                                                                                         defaultValue={currentProjectObject.donators[index]}
                                                                                                         fullWidth
                                                                                                         label={`Donator ${index + 1}`}
                                                                                                         disabled={loading}
                                                                                                         // name={activity.description}
                                                                                                         onBlur={(e: any) => {
                                                                                                              setCurrentProjectObject((prevProjectActivity: ProjectActivity | null | undefined) => {
                                                                                                                   if (prevProjectActivity) {
                                                                                                                        const newDonators = [...prevProjectActivity.donators];
                                                                                                                        newDonators[index] = e.target.value; // Update the subtitle at the clicked index
                                                                                                                        return {
                                                                                                                             ...prevProjectActivity,
                                                                                                                             donators: newDonators,
                                                                                                                        };
                                                                                                                   }
                                                                                                                   return prevProjectActivity;
                                                                                                              });
                                                                                                         }}
                                                                                                    />
                                                                                                    <IconButton onClick={() => onAddNewDonator(index + 1, '')}>
                                                                                                         <AddBoxIcon />
                                                                                                    </IconButton>
                                                                                                    <IconButton onClick={() => onDeleteDonator(index)}>
                                                                                                         <DeleteIcon />
                                                                                                    </IconButton>
                                                                                               </Box>
                                                                                          )
                                                                                     }
                                                                                </Grid>
                                                                                {/* ------------------------Paragraphs------------------------ */}
                                                                                <Grid
                                                                                     item
                                                                                     md={6}
                                                                                     xs={12}
                                                                                >
                                                                                     <Typography sx={{ margin: '10px' }}>Pasusi:</Typography>
                                                                                     {
                                                                                          currentProjectObject?.paragraphs.length == 0 &&
                                                                                          <Box>
                                                                                               <IconButton onClick={() => onAddNewParagraph(0, '')}>
                                                                                                    <AddBoxIcon />
                                                                                               </IconButton>
                                                                                               <IconButton onClick={() => onDeleteParagraph(0)}>
                                                                                                    <DeleteIcon />
                                                                                               </IconButton>
                                                                                          </Box>
                                                                                     }

                                                                                     {
                                                                                          currentProjectObject?.paragraphs.length != 0 &&
                                                                                          currentProjectObject?.paragraphs?.map((paragraph: any, index: any) =>
                                                                                               <Box key={Math.floor(Math.random() * 1000000)} sx={{ display: 'flex', width: '80%' }}>
                                                                                                    <TextField
                                                                                                         defaultValue={currentProjectObject.paragraphs[index]}
                                                                                                         fullWidth
                                                                                                         label={`Pasus ${index + 1}`}
                                                                                                         disabled={loading}
                                                                                                         // name={activity.description}
                                                                                                         onBlur={(e: any) => {
                                                                                                              setCurrentProjectObject((prevProjectActivity: ProjectActivity | null | undefined) => {
                                                                                                                   if (prevProjectActivity) {
                                                                                                                        const newParagraphs = [...prevProjectActivity.paragraphs];
                                                                                                                        newParagraphs[index] = e.target.value; // Update the subtitle at the clicked index
                                                                                                                        return {
                                                                                                                             ...prevProjectActivity,
                                                                                                                             paragraphs: newParagraphs,
                                                                                                                        };
                                                                                                                   }
                                                                                                                   return prevProjectActivity;
                                                                                                              });
                                                                                                         }}
                                                                                                    />
                                                                                                    <IconButton onClick={() => onAddNewParagraph(index + 1, '')}>
                                                                                                         <AddBoxIcon />
                                                                                                    </IconButton>
                                                                                                    <IconButton onClick={() => onDeleteParagraph(index)}>
                                                                                                         <DeleteIcon />
                                                                                                    </IconButton>
                                                                                               </Box>
                                                                                          )
                                                                                     }
                                                                                </Grid>
                                                                                <Divider sx={{ borderBottomWidth: 5, borderColor: theme.palette.primary.main }} />
                                                                                {/* ------------------------Paragraphs------------------------ */}
                                                                                <Grid
                                                                                     item
                                                                                     md={6}
                                                                                     xs={12}
                                                                                >
                                                                                     <Typography sx={{ margin: '10px' }}>Linkovi:</Typography>
                                                                                     {
                                                                                          currentProjectObject?.links.length == 0 &&
                                                                                          <Box>
                                                                                               <IconButton onClick={() => onAddNewLink(0, '')}>
                                                                                                    <AddBoxIcon />
                                                                                               </IconButton>
                                                                                               <IconButton onClick={() => onDeleteLink(0)}>
                                                                                                    <DeleteIcon />
                                                                                               </IconButton>
                                                                                          </Box>
                                                                                     }

                                                                                     {
                                                                                          currentProjectObject?.links.length != 0 &&
                                                                                          currentProjectObject?.links?.map((link: any, index: any) =>
                                                                                               <Box key={Math.floor(Math.random() * 1000000)} sx={{ display: 'flex', width: '80%' }}>
                                                                                                    <TextField
                                                                                                         defaultValue={currentProjectObject.links[index]}
                                                                                                         fullWidth
                                                                                                         label={`Link ${index + 1}`}
                                                                                                         disabled={loading}
                                                                                                         // name={activity.description}
                                                                                                         onBlur={(e: any) => {
                                                                                                              setCurrentProjectObject((prevProjectActivity: ProjectActivity | null | undefined) => {
                                                                                                                   if (prevProjectActivity) {
                                                                                                                        const newLinks = [...prevProjectActivity.links];
                                                                                                                        newLinks[index] = e.target.value; // Update the subtitle at the clicked index
                                                                                                                        return {
                                                                                                                             ...prevProjectActivity,
                                                                                                                             links: newLinks,
                                                                                                                        };
                                                                                                                   }
                                                                                                                   return prevProjectActivity;
                                                                                                              });
                                                                                                         }}
                                                                                                    />
                                                                                                    <IconButton onClick={() => onAddNewLink(index + 1, '')}>
                                                                                                         <AddBoxIcon />
                                                                                                    </IconButton>
                                                                                                    <IconButton onClick={() => onDeleteLink(index)}>
                                                                                                         <DeleteIcon />
                                                                                                    </IconButton>
                                                                                               </Box>
                                                                                          )
                                                                                     }
                                                                                </Grid>
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

                                                                                {/* ------------------------Gallery------------------------ */}
                                                                                <Grid
                                                                                     item
                                                                                     md={6}
                                                                                     xs={12}
                                                                                >
                                                                                     <Typography sx={{ margin: '10px' }}>Galerija:</Typography>
                                                                                     <Box sx={{ display: 'flex', flexDirection: 'column', paddingLeft: '30px', marginBottom: '30px' }}>
                                                                                          {/* -------------------------slike------------------------------------------ */}
                                                                                          {
                                                                                               currentProjectObject?.gallery && currentProjectObject.gallery.length > 0 && (
                                                                                                    <ImageList sx={{ width: '90%', height: 450 }} cols={4} rowHeight={164}>
                                                                                                         {currentProjectObject.gallery.map((item: any) => (
                                                                                                              <ImageListItem key={Math.floor(Math.random() * 1000000)}>
                                                                                                                   <img
                                                                                                                        // srcSet={`${item.img}?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}
                                                                                                                        src={`${item}?w=164&h=164&fit=crop&auto=format`}
                                                                                                                        alt={'image'}
                                                                                                                        loading="lazy"
                                                                                                                        style={{ cursor: 'pointer', borderRadius: '10px' }}
                                                                                                                        onClick={(e: any) => onImageClick(e)}
                                                                                                                   />
                                                                                                              </ImageListItem>
                                                                                                         ))}
                                                                                                    </ImageList>
                                                                                               )
                                                                                          }

                                                                                          <Button component="label"
                                                                                               variant="contained"
                                                                                               startIcon={<CloudUploadIcon />}
                                                                                               sx={{ maxWidth: '150px' }}
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
                                                                                                    onChange={async (e: any) => await handleFileChange(e)}
                                                                                               />
                                                                                          </Button>

                                                                                     </Box>
                                                                                </Grid>

                                                                                <Divider />
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
                                                                                               Obriši projektnu aktivnost
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
