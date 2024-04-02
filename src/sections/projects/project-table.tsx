import ChevronRightIcon from '@untitled-ui/icons-react/build/esm/ChevronRight';
import ChevronDownIcon from '@untitled-ui/icons-react/build/esm/ChevronDown';
import {
     Avatar, Box, Button, Card, CardContent, Checkbox, Divider, Grid, IconButton, Input, InputAdornment, LinearProgress, MenuItem,
     Stack, SvgIcon, Switch, Table, TableBody, TableCell, TableHead, TablePagination, TableRow, TextField, Typography, useTheme
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import Image from 'next/image';
import numeral from 'numeral';
import { Fragment, useCallback, useEffect, useState } from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import { SeverityPill } from '@/components/severity-pill';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';
import "@uploadthing/react/styles.css";
import { UploadButton } from "../../utils/image-upload-components";

export interface Project {
     _id: string;
     projectSummaryURL: string;
     projectSummaryCoverURL: string;
     status: string;
     gallery: string[];
     projectEndDateTime: Date
     projectStartDateTime: Date;
     organizers: string[];
     locations: string[];
     applicants: string[];
     donators: string[];
     publications: string[];
     projectSummaryDescriptions: string[];
     projectSummarySubtitleURLs: string[];
     projectSummaryDateTime: string[];
     projectSummarySubtitles: string[];
     links: string[];
     title: string;
     locale: string;
}

type ProjectStatus = {
     value: string;
     name: string;
}
const projectStatus: ProjectStatus[] = [
     { value: 'in-progress', name: 'U toku' },
     { value: 'completed', name: 'Zavrsen' },
];

type ArrayKeys = keyof Pick<Project,
     'gallery' | 'organizers' | 'locations' | 'applicants' | 'donators' |
     'publications' | 'projectSummaryDescriptions' | 'projectSummarySubtitleURLs' |
     'projectSummaryDateTime' | 'projectSummarySubtitles' | 'links'
>;

type ProjectLocale = {
     value: string;
     name: string;
}

const locales = [{ value: 'en', name: 'Engleski' }, { value: 'sr', name: 'Srpski' }]

export const ProjectsTable = ({ items, page, rowsPerPage, }: any) => {

     const [currentProjectID, setCurrentProjectID] = useState(null);
     const [currentProjectObject, setCurrentProjectObject] = useState<Project | null>();
     const router = useRouter();
     const theme = useTheme()
     const [fileURL, setFileURL] = useState("")
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

     const handleFileRemove = () => {
          setCurrentProjectObject((previousObject: any) => ({
               ...previousObject,
               imageURL: ""
          }))
     }

     const handleProjectClose = () => {
          setCurrentProjectID(null);
     }

     const handleProjectUpdateClick = () => {
          console.log(currentProjectObject);

          Swal.fire({
               title: 'Da li ste sigurni?',
               text: "Možete izmeniti artikl u svakom momentu...",
               icon: 'warning',
               showCancelButton: true,
               confirmButtonColor: '#3085d6',
               cancelButtonColor: '#d33',
               confirmButtonText: 'Da, izmeni!',
               cancelButtonText: 'Odustani!'
          }).then((result) => {
               if (result.isConfirmed) {
                    handleUpdateProject(currentProjectObject)
               }
          })
     }

     const handleUpdateProject = async (currentProjectObject: any) => {
          try {
               //API CALL
               const response = await fetch('/api/project-api', {
                    method: 'PUT',
                    headers: {
                         'Content-Type': 'application/json',
                         'Access-Control-Allow-Origin': 'https://dar-pharmacy-dashboard.vercel.app/api/project-api, http://localhost:3000/api/project-api',
                         'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS' // Set the content type to JSON
                    },
                    body: JSON.stringify(currentProjectObject)
               });

               if (response.ok) {
                    handleProjectClose()
                    setCurrentProjectObject(null)
                    Swal.fire({
                         icon: 'success',
                         title: 'Sve OK!',
                         text: 'Artikl izmenjen :)',
                    })
                    router.refresh()
               } else {
                    const errorData = await response.json(); // Parse the error response
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

               const updatedProject: Project = { ...prevProject };
               updatedProject[arrayName] = newArray;
               return updatedProject;
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
                                             items.map((project: Project) => {
                                                  //const isSelected = selected.includes(project._id);
                                                  const isCurrent = project._id === currentProjectID;
                                                  const statusColor = project.status === 'in-progress' ? 'success' : 'info';

                                                  return (
                                                       <Fragment >
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
                                                                                     backgroundColor: 'primary.main',
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
                                                                      <TableRow >
                                                                           <TableCell

                                                                                colSpan={7}
                                                                                sx={{
                                                                                     p: 0,
                                                                                     position: 'relative',
                                                                                     '&:after': {
                                                                                          position: 'absolute',
                                                                                          content: '" "',
                                                                                          top: 0,
                                                                                          left: 0,
                                                                                          backgroundColor: 'primary.main',
                                                                                          width: 3,
                                                                                          height: 'calc(100% + 1px)',
                                                                                     },
                                                                                }}
                                                                           >
                                                                                <CardContent >
                                                                                     <Grid
                                                                                          container
                                                                                          spacing={3}
                                                                                     >
                                                                                          <Grid
                                                                                               item
                                                                                               md={6}
                                                                                               xs={12}
                                                                                          >
                                                                                               <Typography variant="h6">Detalji projekta</Typography>
                                                                                               <Divider sx={{ my: 2 }} />
                                                                                               <Grid
                                                                                                    container
                                                                                                    spacing={3}
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
                                                                                                    <Grid
                                                                                                         item
                                                                                                         md={6}
                                                                                                         xs={12}
                                                                                                    >
                                                                                                         <TextField
                                                                                                              defaultValue={project.projectSummarySubtitleURLs}
                                                                                                              fullWidth
                                                                                                              label={`URL titlova`}
                                                                                                              name="name"
                                                                                                              disabled={loading}
                                                                                                              onBlur={(e: any) => {
                                                                                                                   const newArray = e.target.value.split(',').map((value: string) => value.trim());
                                                                                                                   handleAddToProjectObjectArray('projectSummarySubtitleURLs', newArray)
                                                                                                              }}
                                                                                                         />
                                                                                                    </Grid>

                                                                                                    {
                                                                                                         project.projectSummarySubtitles.map((description: any, index: any) =>
                                                                                                              <Grid
                                                                                                                   item
                                                                                                                   md={6}
                                                                                                                   xs={12}
                                                                                                              >
                                                                                                                   <TextField
                                                                                                                        defaultValue={description}
                                                                                                                        fullWidth
                                                                                                                        label={`Subtitle ${index + 1}`}
                                                                                                                        disabled={loading}
                                                                                                                        // name={project.description}
                                                                                                                        onBlur={(e: any) =>
                                                                                                                             setCurrentProjectObject((previousObject: any) => ({
                                                                                                                                  ...previousObject,
                                                                                                                                  projectSummarySubtitles: e.target.value

                                                                                                                             }))
                                                                                                                        }
                                                                                                                   />
                                                                                                              </Grid>
                                                                                                         )
                                                                                                    }

                                                                                                    {
                                                                                                         project.projectSummaryDescriptions.map((description: any, index: any) =>
                                                                                                              <Grid
                                                                                                                   item
                                                                                                                   md={6}
                                                                                                                   xs={12}
                                                                                                              >
                                                                                                                   <TextField
                                                                                                                        defaultValue={description}
                                                                                                                        fullWidth
                                                                                                                        label={`Opis ${index + 1}`}
                                                                                                                        disabled={loading}
                                                                                                                        // name={project.description}
                                                                                                                        onBlur={(e: any) =>
                                                                                                                             setCurrentProjectObject((previousObject: any) => ({
                                                                                                                                  ...previousObject,
                                                                                                                                  description: e.target.value

                                                                                                                             }))
                                                                                                                        }
                                                                                                                   />
                                                                                                              </Grid>
                                                                                                         )
                                                                                                    }

                                                                                               </Grid>
                                                                                          </Grid>

                                                                                     </Grid>
                                                                                     <Card sx={{ width: '50%', marginTop: '20px' }}>
                                                                                          <CardContent>
                                                                                               <Box
                                                                                                    sx={{
                                                                                                         display: 'flex',
                                                                                                         flexDirection: 'column',
                                                                                                         alignItems: 'center',
                                                                                                         gap: '10px'
                                                                                                    }}
                                                                                               >
                                                                                                    {/* {
                                                                                                    currentProjectObject?.imageURL ?
                                                                                                         <Image src={currentProjectObject.imageURL}
                                                                                                              alt='sds'
                                                                                                              width={300}
                                                                                                              height={300}
                                                                                                              style={{
                                                                                                                   borderRadius: '10px',
                                                                                                                   cursor: 'pointer'
                                                                                                              }}
                                                                                                              onClick={() => handleFileRemove()}
                                                                                                         />
                                                                                                         :
                                                                                                         <InsertPhotoIcon
                                                                                                              color='primary'
                                                                                                              sx={{ width: '300px', height: '300px' }}
                                                                                                         />
                                                                                               }

                                                                                               <Button component="label"
                                                                                                    variant="contained"
                                                                                                    startIcon={<CloudUploadIcon />}
                                                                                                    sx={{
                                                                                                         maxWidth: '150px'
                                                                                                    }}

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
                                                                                                         onInput={(e: any) => {

                                                                                                              const file = e.target.files[0]; // Get the first selected file
                                                                                                              if (file) {
                                                                                                                   const reader = new FileReader();
                                                                                                                   reader.onload = (e: any) => {
                                                                                                                        // setSelectedImage(e.target.result);
                                                                                                                        setCurrentProjectObject((previousObject: any) => ({
                                                                                                                             ...previousObject,
                                                                                                                             imageURL: e.target.result

                                                                                                                        }))
                                                                                                                   }
                                                                                                                   reader.readAsDataURL(file);
                                                                                                              }
                                                                                                         }
                                                                                                         }
                                                                                                    />
                                                                                               </Button> */}

                                                                                                    {/* <UploadButton
                                                                                                         endpoint="imageUploader"
                                                                                                         onUploadProgress={() => setLoading(true)}
                                                                                                         onClientUploadComplete={(res) => {
                                                                                                              setFileURL(res[0].url)
                                                                                                              setLoading(false)
                                                                                                              setCurrentProjectObject((previousObject: any) => ({
                                                                                                                   ...previousObject,
                                                                                                                   imageURL: res[0].url
                                                                                                              }))
                                                                                                              Swal.fire({
                                                                                                                   icon: 'success',
                                                                                                                   title: 'Jeeej',
                                                                                                                   text: 'Slika je uspešno sačuvana! Nastavi sa izmenama i sačuvaj proizvod...',
                                                                                                              })
                                                                                                         }}
                                                                                                         onUploadError={(error) => {
                                                                                                              Swal.fire({
                                                                                                                   icon: 'success',
                                                                                                                   title: 'Noooo',
                                                                                                                   text: 'Nešto je pošlo po zlu! Proveri format fajla koji upload-uješ!',
                                                                                                              })
                                                                                                              console.log(error);
                                                                                                         }}
                                                                                                         content={{
                                                                                                              button({ ready }: any) {
                                                                                                                   if (ready) return <Typography sx={{ color: theme.palette.divider }}>Pronadji sliku...</Typography>;
                                                                                                                   return "Getting ready...";
                                                                                                              },
                                                                                                              allowedContent({ ready, fileTypes }) {
                                                                                                                   if (!ready) return "Checking what you allow";
                                                                                                                   if (loading) return "Upload slike u toku!";
                                                                                                                   return `Tip datoteke: ${fileTypes.join(", ")}`;
                                                                                                              },
                                                                                                         }}
                                                                                                         appearance={{
                                                                                                              button({ ready }: any) {
                                                                                                                   return {
                                                                                                                        fontSize: "1.6rem",
                                                                                                                        backgroundColor: theme.palette.primary.main,
                                                                                                                        color: "black",
                                                                                                                        ...(ready && { color: theme.palette.primary.main, }),
                                                                                                                        ...(loading && { color: theme.palette.primary.main, }),
                                                                                                                        borderRadius: "10px",
                                                                                                                        cursor: 'pointer'
                                                                                                                   };
                                                                                                              },
                                                                                                              allowedContent: {
                                                                                                                   color: theme.palette.primary.main,
                                                                                                              },
                                                                                                         }}
                                                                                                    />
                                                                                                    {currentProjectObject?.imageURL.length ? (
                                                                                                         <Image

                                                                                                              src={currentProjectObject!.imageURL}
                                                                                                              alt='Uploaded Image'
                                                                                                              width={300}
                                                                                                              height={300}
                                                                                                              style={{
                                                                                                                   borderRadius: '10px',
                                                                                                                   cursor: 'pointer'
                                                                                                              }}
                                                                                                              onClick={handleFileRemove}
                                                                                                         />
                                                                                                    ) : (
                                                                                                         <InsertPhotoIcon
                                                                                                              color='primary'
                                                                                                              sx={{ width: '300px', height: '300px' }}
                                                                                                         />
                                                                                                    )} */}

                                                                                               </Box>
                                                                                          </CardContent>
                                                                                     </Card>
                                                                                </CardContent>
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
