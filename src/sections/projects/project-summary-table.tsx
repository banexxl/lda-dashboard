import ChevronRightIcon from '@untitled-ui/icons-react/build/esm/ChevronRight';
import ChevronDownIcon from '@untitled-ui/icons-react/build/esm/ChevronDown';
import {
     Avatar, Box, Button, Card, CardContent, Checkbox, Divider, Grid, IconButton, ImageList, ImageListItem, Input, InputAdornment, LinearProgress, MenuItem,
     Stack, SvgIcon, Switch, Table, TableBody, TableCell, TableHead, TableRow, TextField, TextFieldProps, Typography, useTheme
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import Image from 'next/image';
import numeral from 'numeral';
import DeleteIcon from '@mui/icons-material/Delete';
import AddBoxIcon from '@mui/icons-material/AddBox';
import { Fragment, JSXElementConstructor, ReactElement, useCallback, useEffect, useState } from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';
import "@uploadthing/react/styles.css";
import dayjs from 'dayjs';
import { ProjectSummary, initialProjectSummary } from './project-summary-type';

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
     'publications' | 'projectSummaryDescriptions' | 'projectSummarySubtitleURLs' |
     'projectSummaryDateTime' | 'projectSummarySubtitles' | 'links'
>;

type ProjectLocale = {
     value: string;
     name: string;
}

const locales = [{ value: 'en', name: 'Engleski' }, { value: 'sr', name: 'Srpski' }]

export const ProjectSummaryTable = ({ items }: any) => {

     const [currentProjectID, setCurrentProjectID] = useState(null);
     const [currentProjectObject, setCurrentProjectObject] = useState<ProjectSummary | null | undefined>(initialProjectSummary);
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

     const handleProjectToggle = (ProjectId: any) => {
          setCurrentProjectID((prevProjectId: any) => {
               if (prevProjectId === ProjectId) {
                    setCurrentProjectObject(null)
                    return null;
               } ``
               setCurrentProjectObject(getObjectById(ProjectId, items))
               return ProjectId;
          });
     }

     const handleProjectClose = () => {
          setCurrentProjectID(null);
     }

     const handleFileRemove = () => {
          setCurrentProjectObject((previousObject: any) => ({
               ...previousObject,
               imageURL: ""
          }))
     }

     const handleProjectUpdateClick = () => {
          console.log(currentProjectObject);

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
               title: 'Are you sure?',
               text: "You won't be able to revert this!",
               icon: 'warning',
               showCancelButton: true,
               confirmButtonColor: '#3085d6',
               cancelButtonColor: '#d33',
               confirmButtonText: 'Yes, delete it!'
          }).then((result) => {
               if (result.isConfirmed) {
                    handleDeleteProject(currentProjectID)
               }
          })
     }

     const handleDeleteProject = async (currentProjectID: any) => {

          const currentProjectObject = getObjectById(currentProjectID, items)

          try {

               const response = await fetch('/api/project-api', {
                    method: 'DELETE',
                    headers: {
                         'Content-Type': 'application/json',
                         'Access-Control-Allow-Origin': 'https://dar-pharmacy-dashboard.vercel.app/api/project-api, http://localhost:3000/api/project-api',
                         'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS' // Set the content type to JSON
                    },
                    body: JSON.stringify({ currentProjectID: currentProjectID, imageID: currentProjectObject.imageURL }), // Convert your data to JSON
               })

               if (response.ok) {
                    Swal.fire({
                         icon: 'success',
                         title: 'Sve OK!',
                         text: 'Artikl obrisan!',
                    })
                    router.refresh()
               } else {
                    const errorData = await response.json(); // Parse the error response
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

     const onAddNewSubtitle = (index: number, text: string) => {
          setCurrentProjectObject((prevProject: ProjectSummary | null | undefined) => {
               if (prevProject) {
                    const newSubtitles = [...prevProject.projectSummarySubtitles];
                    newSubtitles[index] = text; // Update the subtitle at the clicked index
                    return {
                         ...prevProject,
                         projectSummarySubtitles: newSubtitles,
                    };
               }
               return prevProject;
          });
     };

     const onDeleteSubtitle = (index: number) => {
          setCurrentProjectObject((prevProject: ProjectSummary | null | undefined) => {
               if (prevProject) {
                    const newSubtitles = [...prevProject.projectSummarySubtitles];
                    newSubtitles.splice(index, 1); // Remove the subtitle at the specified index
                    return {
                         ...prevProject,
                         projectSummarySubtitles: newSubtitles,
                    };
               }
               return prevProject;
          });
     };

     const onAddNewSubtitleURL = (index: number, text: string) => {
          setCurrentProjectObject((prevProject: ProjectSummary | null | undefined) => {
               if (prevProject) {
                    const newSubtitlesURLs = [...prevProject.projectSummarySubtitleURLs];
                    newSubtitlesURLs[index] = text; // Update the subtitle at the clicked index
                    return {
                         ...prevProject,
                         projectSummarySubtitleURLs: newSubtitlesURLs,
                    };
               }
               return prevProject;
          });
     };

     const onDeleteSubtitleURL = (index: number) => {
          setCurrentProjectObject((prevProject: ProjectSummary | null | undefined) => {
               if (prevProject) {
                    const newSubtitlesURLs = [...prevProject.projectSummarySubtitleURLs];
                    newSubtitlesURLs.splice(index, 1); // Remove the subtitle at the specified index
                    return {
                         ...prevProject,
                         projectSummarySubtitleURLs: newSubtitlesURLs,
                    };
               }
               return prevProject;
          });
     };

     const onAddNewDescription = (index: number, text: string) => {
          setCurrentProjectObject((prevProject: ProjectSummary | null | undefined) => {
               if (prevProject) {
                    const newDescriptions = [...prevProject.projectSummaryDescriptions];
                    newDescriptions[index] = text; // Update the subtitle at the clicked index
                    return {
                         ...prevProject,
                         projectSummaryDescriptions: newDescriptions,
                    };
               }
               return prevProject;
          });
     };

     const onDeleteDescription = (index: number) => {
          setCurrentProjectObject((prevProject: ProjectSummary | null | undefined) => {
               if (prevProject) {
                    const newDescription = [...prevProject.projectSummaryDescriptions];
                    newDescription.splice(index, 1); // Remove the subtitle at the specified index
                    return {
                         ...prevProject,
                         projectSummaryDescriptions: newDescription,
                    };
               }
               return prevProject;
          });
     };

     const onAddNewSubtitleDateTime = (index: number, text: string) => {
          setCurrentProjectObject((prevProject: ProjectSummary | null | undefined) => {
               if (prevProject) {
                    const newDateTimes = [...prevProject.projectSummaryDateTime];
                    newDateTimes[index] = text; // Update the subtitle at the clicked index
                    return {
                         ...prevProject,
                         projectSummaryDateTime: newDateTimes,
                    };
               }
               return prevProject;
          });
     };

     const onDeleteSubtitleDateTime = (index: number) => {
          setCurrentProjectObject((prevProject: ProjectSummary | null | undefined) => {
               if (prevProject) {
                    const newDateTimes = [...prevProject.projectSummaryDateTime];
                    newDateTimes.splice(index, 1); // Remove the subtitle at the specified index
                    return {
                         ...prevProject,
                         projectSummaryDateTime: newDateTimes,
                    };
               }
               return prevProject;
          });
     };

     const onAddNewImage = (imageURL: string) => {
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

     const handleFileChange = async (event: any) => {
          console.log(currentProjectObject);

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

          const apiUrl = 'http://localhost:3000/api/aws-s3';

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
                         throw new Error('Failed to upload image');
                    } else {
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
                                                  const statusColor = project.status === 'in-progress' ? 'success' : 'info';

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
                                                                                          disabled={loading}
                                                                                          onBlur={(e: any) =>
                                                                                               setCurrentProjectObject((previousObject: any) => ({
                                                                                                    ...previousObject,
                                                                                                    name: e.target.value

                                                                                               }))
                                                                                          }
                                                                                     />
                                                                                </Grid>
                                                                                <Grid
                                                                                     item
                                                                                     md={6}
                                                                                     xs={12}
                                                                                >
                                                                                     <TextField
                                                                                          defaultValue={project.projectStartDateTime}
                                                                                          fullWidth
                                                                                          label="Datum pocetka projekta"
                                                                                          name="name"
                                                                                          disabled={loading}
                                                                                          onBlur={(e: any) =>
                                                                                               setCurrentProjectObject((previousObject: any) => ({
                                                                                                    ...previousObject,
                                                                                                    projectStartDateTime: e.target.value

                                                                                               }))
                                                                                          }
                                                                                     />
                                                                                </Grid>
                                                                                <Grid
                                                                                     item
                                                                                     md={6}
                                                                                     xs={12}
                                                                                >
                                                                                     <TextField
                                                                                          defaultValue={project.projectEndDateTime}
                                                                                          fullWidth
                                                                                          label="Datum kraja projekta"
                                                                                          name="name"
                                                                                          disabled={loading}
                                                                                          onBlur={(e: any) =>
                                                                                               setCurrentProjectObject((previousObject: any) => ({
                                                                                                    ...previousObject,
                                                                                                    projectEndDateTime: e.target.value

                                                                                               }))
                                                                                          }
                                                                                     />
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
                                                                                          disabled={loading}
                                                                                          onBlur={(e: any) =>
                                                                                               setCurrentProjectObject((previousObject: any) => ({
                                                                                                    ...previousObject,
                                                                                                    locale: e.target.value
                                                                                               }))
                                                                                          }
                                                                                     >
                                                                                          {locales.map((option: ProjectLocale) => (
                                                                                               <MenuItem

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
                                                                                          defaultValue={project.projectSummaryURL}
                                                                                          fullWidth
                                                                                          label="URL projekta"
                                                                                          name="name"
                                                                                          disabled={loading}
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
                                                                                     <TextField
                                                                                          defaultValue={project.projectSummaryCoverURL}
                                                                                          fullWidth
                                                                                          label="Glavna slika projekta"
                                                                                          name="name"
                                                                                          disabled={loading}
                                                                                          onBlur={(e: any) =>
                                                                                               setCurrentProjectObject((previousObject: any) => ({
                                                                                                    ...previousObject,
                                                                                                    projectSummaryCoverURL: e.target.value

                                                                                               }))
                                                                                          }
                                                                                     />
                                                                                </Grid>
                                                                                <Grid
                                                                                     item
                                                                                     md={6}
                                                                                     xs={12}
                                                                                >
                                                                                     <TextField
                                                                                          defaultValue={project.status}
                                                                                          fullWidth
                                                                                          label="Status projekta"
                                                                                          select
                                                                                          disabled={loading}
                                                                                          onBlur={(e: any) =>
                                                                                               setCurrentProjectObject((previousObject: any) => ({
                                                                                                    ...previousObject,
                                                                                                    status: e.target.value
                                                                                               }))
                                                                                          }
                                                                                     >
                                                                                          {projectStatus.map((option: ProjectStatus) => (
                                                                                               <MenuItem

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
                                                                                          defaultValue={project.organizers.join(',')}
                                                                                          fullWidth
                                                                                          label={`Organizatori projekta`}
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
                                                                                          label={`Lokacije projekta`}
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
                                                                                          label={`Aplikanti projekta`}
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
                                                                                          label={`Donatori projekta`}
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
                                                                                          defaultValue={project.publications}
                                                                                          fullWidth
                                                                                          label={`Publikacije projekta`}
                                                                                          name="name"
                                                                                          disabled={loading}
                                                                                          onBlur={(e: any) => {
                                                                                               const newArray = e.target.value.split(',').map((value: string) => value.trim());
                                                                                               handleAddToProjectObjectArray('publications', newArray)
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
                                                                                          label={`Linkovi`}
                                                                                          name="name"
                                                                                          disabled={loading}
                                                                                          onBlur={(e: any) => {
                                                                                               const newArray = e.target.value.split(',').map((value: string) => value.trim());
                                                                                               handleAddToProjectObjectArray('links', newArray)
                                                                                          }}
                                                                                     />
                                                                                </Grid>

/////////////////////////////////////////////////////////////////////////
                                                                                <Grid
                                                                                     item
                                                                                     md={6}
                                                                                     xs={12}
                                                                                >
                                                                                     <Typography sx={{ margin: '10px' }}>Podnaslovi:</Typography>
                                                                                     {
                                                                                          currentProjectObject?.projectSummarySubtitles.length == 0 &&
                                                                                          <Box>
                                                                                               <IconButton onClick={() => onAddNewSubtitle(0, '')}>
                                                                                                    <AddBoxIcon />
                                                                                               </IconButton>
                                                                                               <IconButton onClick={() => onDeleteSubtitle(0)}>
                                                                                                    <DeleteIcon />
                                                                                               </IconButton>
                                                                                          </Box>
                                                                                     }

                                                                                     {
                                                                                          currentProjectObject?.projectSummarySubtitles.length != 0 &&
                                                                                          currentProjectObject?.projectSummarySubtitles?.map((subtitle: any, index: any) =>
                                                                                               <Box sx={{ display: 'flex', width: '80%' }}>
                                                                                                    <TextField
                                                                                                         defaultValue={subtitle}
                                                                                                         fullWidth
                                                                                                         label={`Podnaslov ${index + 1}`}
                                                                                                         disabled={loading}
                                                                                                         // name={project.description}
                                                                                                         onBlur={(e: any) => {
                                                                                                              setCurrentProjectObject((prevProject: ProjectSummary | null | undefined) => {
                                                                                                                   if (prevProject) {
                                                                                                                        const newSubtitles = [...prevProject.projectSummarySubtitles];
                                                                                                                        newSubtitles[index] = e.target.value; // Update the subtitle at the clicked index
                                                                                                                        return {
                                                                                                                             ...prevProject,
                                                                                                                             projectSummarySubtitles: newSubtitles,
                                                                                                                        };
                                                                                                                   }
                                                                                                                   return prevProject;
                                                                                                              });
                                                                                                         }}
                                                                                                    />
                                                                                                    <IconButton onClick={() => onAddNewSubtitle(index + 1, '')}>
                                                                                                         <AddBoxIcon />
                                                                                                    </IconButton>
                                                                                                    <IconButton onClick={() => onDeleteSubtitle(index)}>
                                                                                                         <DeleteIcon />
                                                                                                    </IconButton>
                                                                                               </Box>
                                                                                          )
                                                                                     }

                                                                                </Grid>

                                                                                <Grid
                                                                                     item
                                                                                     md={6}
                                                                                     xs={12}
                                                                                >
                                                                                     <Typography sx={{ margin: '10px' }}>Opisi:</Typography>
                                                                                     {
                                                                                          currentProjectObject?.projectSummaryDescriptions.length == 0 &&
                                                                                          <Box>
                                                                                               <IconButton onClick={() => onAddNewDescription(0, '')}>
                                                                                                    <AddBoxIcon />
                                                                                               </IconButton>
                                                                                               <IconButton onClick={() => onDeleteDescription(0)}>
                                                                                                    <DeleteIcon />
                                                                                               </IconButton>
                                                                                          </Box>
                                                                                     }

                                                                                     {
                                                                                          currentProjectObject?.projectSummaryDescriptions.map((description: any, index: any) =>
                                                                                               <Box sx={{ display: 'flex', width: '80%' }}>
                                                                                                    <TextField
                                                                                                         defaultValue={description}
                                                                                                         fullWidth
                                                                                                         label={`Opis ${index + 1}`}
                                                                                                         disabled={loading}
                                                                                                         // name={project.description}
                                                                                                         onBlur={(e: any) =>
                                                                                                              setCurrentProjectObject((prevProject: ProjectSummary | null | undefined) => {
                                                                                                                   if (prevProject) {
                                                                                                                        const newDescriptions = [...prevProject.projectSummaryDescriptions];
                                                                                                                        newDescriptions[index] = e.target.value; // Update the subtitle at the clicked index
                                                                                                                        return {
                                                                                                                             ...prevProject,
                                                                                                                             projectSummaryDescriptions: newDescriptions,
                                                                                                                        };
                                                                                                                   }
                                                                                                                   return prevProject;
                                                                                                              })
                                                                                                         }
                                                                                                    />
                                                                                                    <IconButton onClick={() => onAddNewDescription(index + 1, '')}>
                                                                                                         <AddBoxIcon />
                                                                                                    </IconButton>
                                                                                                    <IconButton onClick={() => onDeleteDescription(index)}>
                                                                                                         <DeleteIcon />
                                                                                                    </IconButton>

                                                                                               </Box>
                                                                                          )
                                                                                     }
                                                                                </Grid>

                                                                                <Grid
                                                                                     item
                                                                                     md={6}
                                                                                     xs={12}
                                                                                >
                                                                                     <Typography sx={{ margin: '10px' }}>URL-ovi podnaslova:</Typography>
                                                                                     {
                                                                                          currentProjectObject?.projectSummarySubtitleURLs.length == 0 &&
                                                                                          <Box>
                                                                                               <IconButton onClick={() => onAddNewSubtitleURL(0, '')}>
                                                                                                    <AddBoxIcon />
                                                                                               </IconButton>
                                                                                               <IconButton onClick={() => onDeleteSubtitleURL(0)}>
                                                                                                    <DeleteIcon />
                                                                                               </IconButton>
                                                                                          </Box>
                                                                                     }

                                                                                     {
                                                                                          currentProjectObject?.projectSummarySubtitleURLs.map((url: any, index: any) =>
                                                                                               <Box sx={{ display: 'flex', width: '80%' }}>
                                                                                                    <TextField
                                                                                                         defaultValue={url}
                                                                                                         fullWidth
                                                                                                         label={`URL ${index + 1}`}
                                                                                                         disabled={loading}
                                                                                                         // name={project.description}
                                                                                                         onBlur={(e: any) =>
                                                                                                              setCurrentProjectObject((prevProject: ProjectSummary | null | undefined) => {
                                                                                                                   if (prevProject) {
                                                                                                                        const newSubtitlesURLs = [...prevProject.projectSummarySubtitleURLs];
                                                                                                                        newSubtitlesURLs[index] = e.target.value; // Update the subtitle at the clicked index
                                                                                                                        return {
                                                                                                                             ...prevProject,
                                                                                                                             projectSummarySubtitleURLs: newSubtitlesURLs,
                                                                                                                        };
                                                                                                                   }
                                                                                                                   return prevProject;
                                                                                                              })
                                                                                                         }
                                                                                                    />
                                                                                                    <IconButton onClick={() => onAddNewSubtitleURL(index + 1, '')}>
                                                                                                         <AddBoxIcon />
                                                                                                    </IconButton>
                                                                                                    <IconButton onClick={() => onDeleteSubtitleURL(index)}>
                                                                                                         <DeleteIcon />
                                                                                                    </IconButton>
                                                                                               </Box>
                                                                                          )
                                                                                     }
                                                                                </Grid>

                                                                                <Grid
                                                                                     item
                                                                                     md={6}
                                                                                     xs={12}
                                                                                >
                                                                                     <Typography sx={{ margin: '10px' }}>Vremena odrzavanja projektnih aktivnosti (obavezno):</Typography>
                                                                                     {
                                                                                          currentProjectObject?.projectSummaryDateTime.length == 0 &&
                                                                                          <Box>
                                                                                               <IconButton onClick={() => onAddNewSubtitleDateTime(0, '')}>
                                                                                                    <AddBoxIcon />
                                                                                               </IconButton>
                                                                                               <IconButton onClick={() => onDeleteSubtitleDateTime(0)}>
                                                                                                    <DeleteIcon />
                                                                                               </IconButton>
                                                                                          </Box>
                                                                                     }

                                                                                     {
                                                                                          currentProjectObject?.projectSummaryDateTime.map((date: any, index: any) =>
                                                                                               <Box sx={{ display: 'flex', width: '80%' }}>
                                                                                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                                                                         <DatePicker
                                                                                                              disabled={loading}
                                                                                                              label={`Datum ${index + 1}`}
                                                                                                              value={date}
                                                                                                              onChange={(newValue: any) => {
                                                                                                                   const formattedDate = dayjs(newValue).format('YYYY-MM-DDTHH:mm:ss');
                                                                                                                   onAddNewSubtitleDateTime(index, formattedDate)
                                                                                                              }}

                                                                                                         />
                                                                                                    </LocalizationProvider>


                                                                                                    <IconButton onClick={() => onAddNewSubtitleDateTime(index + 1, '')}>
                                                                                                         <AddBoxIcon />
                                                                                                    </IconButton>
                                                                                                    <IconButton onClick={() => onDeleteSubtitleDateTime(index)}>
                                                                                                         <DeleteIcon />
                                                                                                    </IconButton>
                                                                                               </Box>
                                                                                          )
                                                                                     },
                                                                                </Grid>

                                                                                <Typography sx={{ margin: '10px' }}>Slike:</Typography>
                                                                                <Box sx={{ display: 'flex', flexDirection: 'column', paddingLeft: '30px', marginBottom: '30px' }}>
                                                                                     {/* -------------------------slike------------------------------------------ */}
                                                                                     {
                                                                                          currentProjectObject?.gallery && currentProjectObject.gallery.length > 0 && (
                                                                                               <ImageList sx={{ width: 500, height: 450 }} cols={3} rowHeight={164}>
                                                                                                    {currentProjectObject.gallery.map((item: any) => (
                                                                                                         <ImageListItem key={item}>
                                                                                                              <img
                                                                                                                   // srcSet={`${item.img}?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}
                                                                                                                   src={`${item}?w=164&h=164&fit=crop&auto=format`}
                                                                                                                   alt={'image'}
                                                                                                                   loading="lazy"
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
                                                                                          Ucitaj sliku
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
                                                                                               Obrisi proizvod
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
