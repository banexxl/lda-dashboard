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
import { Fragment, HtmlHTMLAttributes, JSXElementConstructor, ReactElement, useCallback, useEffect, useRef, useState } from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';
import "@uploadthing/react/styles.css";
import dayjs from 'dayjs';
import { ProjectSummary, initialProjectSummary } from './project-summary-type';
import { DateField } from '@mui/x-date-pickers/DateField';
import moment from 'moment';
import { get } from 'http';
import { da } from 'date-fns/locale';
import { extractInfoFromUrl } from '@/pages/api/aws-s3';
import { sanitizeString } from '@/utils/url-creator';
import { set } from 'nprogress';
import { log } from 'console';

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
     const [currentProjectObject, setCurrentProjectObject] = useState<ProjectSummary | null | undefined>(initialProjectSummary || {});
     console.log(currentProjectObject);
     const [disabledFields, setDisabledFields] = useState<boolean[]>([]);
     const [disabledDescriptions, setDisabledDescriptions] = useState<boolean[]>([]);
     const [disabledDateTime, setDisabledDateTime] = useState<boolean[]>([]);

     const router = useRouter();
     const theme = useTheme()
     const [loading, setLoading] = useState(false)
     const [selectedImage, setSelectedImage] = useState(null);
     const textFieldSubtitleRefs = useRef<HTMLInputElement[]>([]);
     const textFieldDescriptionRefs = useRef<HTMLInputElement[]>([]);
     const textFieldDateTimeRefs = useRef<HTMLInputElement[]>([]);

     const getSubtitleInputValue = (index: number) => {
          if (textFieldSubtitleRefs.current[index]) {
               console.log(textFieldSubtitleRefs.current[index].value);

               return textFieldSubtitleRefs.current[index].value;
          }
          return '';
     };

     const getDescriptionInputValue = (index: number) => {
          if (textFieldDescriptionRefs.current[index]) {
               return textFieldDescriptionRefs.current[index].value;
          }
          return '';
     }

     const getDateTimeInputValue = (index: number) => {
          if (textFieldDateTimeRefs.current[index]) {
               return textFieldDateTimeRefs.current[index].value;
          }
          return '';
     }

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
                         'Access-Control-Allow-Origin': 'https://dar-pharmacy-dashboard.vercel.app/api/project-api, http://localhost:3000/api/project-api',
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

     const insertNewSubtitleField = () => {
          setCurrentProjectObject((prevProject: ProjectSummary | null | undefined) => {
               if (prevProject) {
                    const newSubtitles = [...prevProject.projectSummarySubtitles, ''];
                    const newSubtitlesURLs = [...prevProject.projectSummarySubtitleURLs, ''];

                    return {
                         ...prevProject,
                         projectSummarySubtitles: newSubtitles,
                         projectSummarySubtitleURLs: newSubtitlesURLs,
                    };
               }
               return prevProject;
          });
     }

     const insertNewDescriptionField = () => {
          setCurrentProjectObject((prevProject: ProjectSummary | null | undefined) => {
               if (prevProject) {
                    const newDescriptions = [...prevProject.projectSummaryDescriptions, ''];
                    return {
                         ...prevProject,
                         projectSummaryDescriptions: newDescriptions,
                    };
               }
               return prevProject;
          });
     }

     const insertNewDateTimeField = () => {
          setCurrentProjectObject((prevProject: ProjectSummary | null | undefined) => {
               if (prevProject) {
                    const newDateTimes = [...prevProject.projectSummaryDateTime, ''];
                    return {
                         ...prevProject,
                         projectSummaryDateTime: newDateTimes,
                    };
               }
               return prevProject;
          });
     }

     const handleAddSubtitle = (index: number, subtitle: string) => {
          console.log('Adding subtitle at index:', index, 'with value:', subtitle);

          if (currentProjectObject) {
               const newSubtitles = [...currentProjectObject.projectSummarySubtitles];
               const newSubtitlesURLs = [...currentProjectObject.projectSummarySubtitleURLs];

               // Update the empty string with the actual subtitle
               newSubtitles[index] = subtitle;
               newSubtitlesURLs[index] = sanitizeString(subtitle);
               setCurrentProjectObject({
                    ...currentProjectObject,
                    projectSummarySubtitles: newSubtitles,
                    projectSummarySubtitleURLs: newSubtitlesURLs,
               });

               setDisabledFields((prev) => {
                    const newDisabledFields = [...prev];
                    newDisabledFields[index] = true;
                    return newDisabledFields;
               });
          }
     };

     const handleRemoveSubtitle = (index: number) => {
          if (currentProjectObject) {
               const newSubtitles = [...currentProjectObject.projectSummarySubtitles];
               newSubtitles.splice(index, 1); // Remove the subtitle at the current index
               const newSubtitlesURLs = [...currentProjectObject.projectSummarySubtitleURLs]
               newSubtitlesURLs.splice(index, 1);
               setCurrentProjectObject({
                    ...currentProjectObject,
                    projectSummarySubtitles: newSubtitles,
                    projectSummarySubtitleURLs: newSubtitlesURLs
               });

               setDisabledFields((prev) => {
                    const newDisabledFields = [...prev];
                    newDisabledFields[index] = false;
                    return newDisabledFields;
               });
          }
     };

     const handleAddNewDescription = (index: number, text: string) => {
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
          setDisabledDescriptions((prev) => {
               const newDisabledFields = [...prev];
               newDisabledFields[index] = true;
               return newDisabledFields;
          })
     };

     const handleDeleteDescription = (index: number) => {
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
          setDisabledDescriptions((prev) => {
               const newDisabledFields = [...prev];
               newDisabledFields[index] = false;
               return newDisabledFields;
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
          setDisabledDateTime((prev) => {
               const newDisabledFields = [...prev];
               newDisabledFields[index] = true;
               return newDisabledFields;
          })
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

          setDisabledDateTime((prev) => {
               const newDisabledFields = [...prev];
               newDisabledFields[index] = false;
               return newDisabledFields;
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
                                                  const statusColor = project.status.key === 'in-progress' ? 'success' : 'info';

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
                                                                                               label={`Datum pocetka projekta`}
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
                                                                                     <Typography sx={{ margin: '10px' }}>Glavna slika projekta:</Typography>
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
                                                                                                    onChange={async (e: any) => await handleCoverChange(e)}
                                                                                               />
                                                                                          </Button>

                                                                                     </Box>
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
                                                                                          defaultValue={project.publications}
                                                                                          fullWidth
                                                                                          label={`Publikacije projekta (odvojiti zarezom)`}
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
                                                                                          label={`Linkovi (odvojiti zarezom)`}
                                                                                          name="name"
                                                                                          disabled={loading}
                                                                                          onBlur={(e: any) => {
                                                                                               const newArray = e.target.value.split(',').map((value: string) => value.trim());
                                                                                               handleAddToProjectObjectArray('links', newArray)
                                                                                          }}
                                                                                     />
                                                                                </Grid>
                                                                                <Divider />
                                                                                <Grid item md={6} xs={12}>
                                                                                     <Typography sx={{ margin: '10px' }}>Podnaslovi:</Typography>
                                                                                     {currentProjectObject?.projectSummarySubtitles.map((subtitle, index) => (
                                                                                          <Box sx={{ display: 'flex', width: '80%' }} key={index}>
                                                                                               <TextField
                                                                                                    InputLabelProps={{ shrink: true }}
                                                                                                    fullWidth
                                                                                                    defaultValue={subtitle}
                                                                                                    name={`projectSummarySubtitles.${index}`}
                                                                                                    label={`Podnaslov ${index + 1}`}
                                                                                                    disabled={disabledFields[index]} // Disable based on state
                                                                                                    inputRef={(el: any) => textFieldSubtitleRefs.current[index] = el}
                                                                                                    InputProps={{
                                                                                                         endAdornment: (
                                                                                                              <InputAdornment position="end">
                                                                                                                   <IconButton
                                                                                                                        onClick={() => {
                                                                                                                             const currentValue = getSubtitleInputValue(index);
                                                                                                                             currentValue === '' ?
                                                                                                                                  Swal.fire('Greška', 'Morate uneti podnaslov!', 'error')
                                                                                                                                  :
                                                                                                                                  handleAddSubtitle(index, currentValue);
                                                                                                                        }}
                                                                                                                        disabled={disabledFields[index]} // Disable based on state
                                                                                                                   >
                                                                                                                        <AddBoxIcon />
                                                                                                                   </IconButton>
                                                                                                                   <IconButton
                                                                                                                        onClick={() => handleRemoveSubtitle(index)}
                                                                                                                   >
                                                                                                                        <DeleteIcon />
                                                                                                                   </IconButton>
                                                                                                              </InputAdornment>
                                                                                                         ),
                                                                                                    }}
                                                                                               />
                                                                                          </Box>
                                                                                     ))}
                                                                                     <IconButton onClick={insertNewSubtitleField} >
                                                                                          <AddBoxIcon />
                                                                                     </IconButton>

                                                                                     <Grid item md={6} xs={12}>
                                                                                          <Typography sx={{ margin: '10px' }}>URL-ovi podnaslova:</Typography>
                                                                                          {currentProjectObject?.projectSummarySubtitleURLs.map((projectSummarySubtitleURL, index) => (
                                                                                               <Box sx={{ display: 'flex' }} key={index}>
                                                                                                    <TextField
                                                                                                         InputLabelProps={{ shrink: true }}
                                                                                                         defaultValue={projectSummarySubtitleURL}
                                                                                                         fullWidth
                                                                                                         name={`projectSummarySubtitleURLs.${index}`}
                                                                                                         label={`URL projekta ${index + 1}`}
                                                                                                         disabled
                                                                                                    />
                                                                                               </Box>
                                                                                          ))}
                                                                                     </Grid>
                                                                                </Grid>
                                                                                <Divider variant='fullWidth' />
                                                                                <Grid
                                                                                     item
                                                                                     md={6}
                                                                                     xs={12}
                                                                                >
                                                                                     <Typography sx={{ margin: '10px' }}>Pasusi (broj pasusa treba da bude jednak broju podnaslova):</Typography>
                                                                                     {
                                                                                          currentProjectObject?.projectSummaryDescriptions.map((description: any, index: any) => (
                                                                                               <Box key={Math.floor(Math.random() * 1000000)} sx={{ display: 'flex', width: '80%' }}>
                                                                                                    <TextField
                                                                                                         InputLabelProps={{ shrink: true }}
                                                                                                         fullWidth
                                                                                                         defaultValue={description}
                                                                                                         name={`projectSummaryDescriptions.${index}`}
                                                                                                         label={`Prvi pasus iz teksta ${index + 1}`}
                                                                                                         disabled={disabledDescriptions[index]} // Disable based on state
                                                                                                         inputRef={(el: any) => textFieldDescriptionRefs.current[index] = el}
                                                                                                         InputProps={{
                                                                                                              endAdornment: (
                                                                                                                   <InputAdornment position="end">
                                                                                                                        <IconButton
                                                                                                                             onClick={() => {
                                                                                                                                  const currentValue = getDescriptionInputValue(index);
                                                                                                                                  handleAddNewDescription(index, currentValue);
                                                                                                                             }}
                                                                                                                             disabled={disabledDescriptions[index]} // Disable based on state
                                                                                                                        >
                                                                                                                             <AddBoxIcon />
                                                                                                                        </IconButton>
                                                                                                                        <IconButton
                                                                                                                             onClick={() => handleDeleteDescription(index)}
                                                                                                                        >
                                                                                                                             <DeleteIcon />
                                                                                                                        </IconButton>
                                                                                                                   </InputAdornment>
                                                                                                              ),
                                                                                                         }}
                                                                                                    />
                                                                                               </Box>
                                                                                          ))
                                                                                     }
                                                                                     <IconButton onClick={insertNewDescriptionField} >
                                                                                          <AddBoxIcon />
                                                                                     </IconButton>
                                                                                </Grid>

                                                                                <Grid
                                                                                     item
                                                                                     md={6}
                                                                                     xs={12}
                                                                                >
                                                                                     <Typography sx={{ margin: '10px' }}>Vremena odrzavanja projektnih aktivnosti (MM/DD/YYYY):</Typography>
                                                                                     <Typography sx={{ margin: '10px' }}>Broj vremena treba da bude jednak broju podnaslova</Typography>
                                                                                     {

                                                                                          currentProjectObject?.projectSummaryDateTime.map((date: any, index: any) => (
                                                                                               <Box key={Math.floor(Math.random() * 1000000)} sx={{ display: 'flex', width: '80%' }}>
                                                                                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                                                                         <DateField
                                                                                                              format='MM/DD/YYYY'
                                                                                                              InputLabelProps={{ shrink: true }}
                                                                                                              fullWidth
                                                                                                              disabled={disabledDateTime[index]}
                                                                                                              label={`Datum ${index + 1}`}
                                                                                                              defaultValue={dayjs(currentProjectObject.projectSummaryDateTime[index])}
                                                                                                              inputRef={(el) => (textFieldDateTimeRefs.current[index] = el)}
                                                                                                              onBlur={(newValue: any) => {
                                                                                                                   const date = moment(newValue.target.value).format('MM/DD/YYYY');
                                                                                                                   onAddNewSubtitleDateTime(index, date)
                                                                                                              }}
                                                                                                              InputProps={{
                                                                                                                   endAdornment: (
                                                                                                                        <InputAdornment position="end">
                                                                                                                             <IconButton
                                                                                                                                  onClick={() => {
                                                                                                                                       const currentValue = getDateTimeInputValue(index);
                                                                                                                                       onAddNewSubtitleDateTime(index, currentValue);
                                                                                                                                  }}
                                                                                                                                  disabled={disabledDateTime[index]} // Disable based on state
                                                                                                                             >
                                                                                                                                  <AddBoxIcon />
                                                                                                                             </IconButton>
                                                                                                                             <IconButton
                                                                                                                                  onClick={() => onDeleteSubtitleDateTime(index)}
                                                                                                                             >
                                                                                                                                  <DeleteIcon />
                                                                                                                             </IconButton>
                                                                                                                        </InputAdornment>
                                                                                                                   ),
                                                                                                              }}
                                                                                                         />
                                                                                                    </LocalizationProvider>
                                                                                               </Box>
                                                                                          ))}
                                                                                     <IconButton onClick={insertNewDateTimeField} >
                                                                                          <AddBoxIcon />
                                                                                     </IconButton>
                                                                                </Grid>
                                                                                <Divider />
                                                                                <Typography sx={{ margin: '10px' }}>Slike:</Typography>
                                                                                <Box sx={{ display: 'flex', flexDirection: 'column', paddingLeft: '30px', marginBottom: '50px', width: '90%' }}>
                                                                                     {/* -------------------------slike------------------------------------------ */}
                                                                                     {
                                                                                          currentProjectObject?.gallery && currentProjectObject.gallery.length > 0 && (
                                                                                               <ImageList sx={{ width: '90%', height: 450 }} cols={theme.breakpoints.down('sm') ? 4 : 1} rowHeight={164}>
                                                                                                    {currentProjectObject.gallery.map((item: any) => (
                                                                                                         <ImageListItem key={Math.floor(Math.random() * 1000000)} sx={{ margin: '20px 10px 150px 0' }}>
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
                                                                                               onChange={async (e: any) => await handleGalleryChange(e)}
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
                                                                                               Obrisi projekat
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
