"use client"
import React, { useState } from 'react';
import { Field, FieldArray, useFormik } from 'formik';
import { TextField, Typography, Button, Checkbox, FormControlLabel, Box, Input, Card, CardContent, Grid, MenuItem, Stack, Container, IconButton, CardActionArea, FormControl, InputLabel, Select, Divider, ImageList, ImageListItem } from '@mui/material'
import { Form, Formik, FormikErrors, FormikTouched } from 'formik';
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2'
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import Image from 'next/image';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import DeleteIcon from '@mui/icons-material/Delete';
import AddBoxIcon from '@mui/icons-material/AddBox';
import "@uploadthing/react/styles.css";
import { useTheme } from '@mui/material/styles';
import ProjectSummarySchema, { ProjectSummary, initialProjectSummary } from './project-summary-type';
import { ArrayKeys } from './project-summary-table';
import { DateField } from '@mui/x-date-pickers/DateField';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { stringWithHyphens } from '@/utils/url-creator';
import zIndex from '@mui/material/styles/zIndex';
import { tr } from 'date-fns/locale';
import { log } from 'console';
import moment from 'moment';

export const AddProjectSummaryForm = ({ onSubmitSuccess, onSubmitFail }: any) => {

     const theme = useTheme()
     const router = useRouter();
     //const [selectedFile, setSelectedFile] = useState(null);
     const [fileURL, setFileURL] = useState("")
     const [loading, setLoading] = useState<any>(false)
     const [initialProjectSummaryObject, setInitialProjectSummary] = useState<ProjectSummary | null>(initialProjectSummary)
     const [selectedImage, setSelectedImage] = useState(null);
     const [showForm, setShowForm] = useState(true);

     const handleFileRemove = () => {
          setFileURL(""); // Remove the selected file
     };

     const handleSubmit = async (values: any) => {
          console.log(values);

          try {
               const responseValues: any = await fetch('/api/project-summaries-api', {
                    method: 'POST',
                    headers: {
                         'Content-Type': 'application/json',
                         'Access-Control-Allow-Origin': '*',
                         'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS' // Set the content type to JSON
                    },
                    body: JSON.stringify(values),
               });

               if (responseValues.ok) {

                    onSubmitSuccess();

                    Swal.fire({
                         icon: 'success',
                         title: 'Jeeej',
                         text: 'Artikl ubačen uspešno',
                    })
                    router.refresh()
               } else {

                    setShowForm(true)

                    Swal.fire({
                         icon: 'error',
                         title: 'Oops...',
                         text: 'Nešto ne valja :(',
                    })
               }

          } catch (err) {
               setShowForm(true)
               Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Nešto ne valja :(',
               })
          }

     }

     const onAddNewSubtitle = (index: number, text: string) => {
          setInitialProjectSummary((prevProject: ProjectSummary | null) => {
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
          setInitialProjectSummary((prevProject: ProjectSummary | null) => {
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
          setInitialProjectSummary((prevProject: ProjectSummary | null) => {
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
          setInitialProjectSummary((prevProject: ProjectSummary | null) => {
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
          setInitialProjectSummary((prevProject: ProjectSummary | null) => {
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
          setInitialProjectSummary((prevProject: ProjectSummary | null) => {
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

     const onAddNewSubtitleDateTime = (index: number, date: string) => {

          setInitialProjectSummary((prevProject: ProjectSummary | null) => {
               if (prevProject) {
                    const newDateTimes = [...prevProject.projectSummaryDateTime];
                    newDateTimes[index] = date; // Update the subtitle at the clicked index
                    return {
                         ...prevProject,
                         projectSummaryDateTime: newDateTimes,
                    };
               }
               return prevProject;
          });
     };

     const onDeleteSubtitleDateTime = (index: number) => {
          setInitialProjectSummary((prevProject: ProjectSummary | null) => {
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
          setInitialProjectSummary((prevProject: ProjectSummary | null) => {
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
          console.log(initialProjectSummaryObject);

          const selectedFile = event.target.files[0];

          if (!selectedFile) {
               return;
          }

          setLoading(true);
          setSelectedImage(selectedFile);

          // Extract file extension
          const fileExtension = selectedFile.name.split('.')[1]

          // Assuming you have a title for the image
          const title = initialProjectSummaryObject?.title!

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
          <Box >
               <Formik

                    initialValues={initialProjectSummary}
                    onSubmit={(values) => {
                         handleSubmit(values)
                    }}
                    validationSchema={ProjectSummarySchema}>
                    {
                         (formik) => (
                              <Form style={{ display: 'flex', flexDirection: 'column', gap: '15px', opacity: loading ? .5 : 1 }}>

                                   <Typography>
                                        {`${JSON.stringify(formik.errors)}`}
                                   </Typography>

                                   <TextField
                                        InputLabelProps={{ shrink: true }}
                                        label="Naslov projekta"
                                        name="title"
                                        // value={formik.values.title}
                                        disabled={loading}
                                        onBlur={(e: any) => {
                                             formik.setFieldValue('title', e.target.value)
                                             formik.setFieldValue('projectSummaryURL', stringWithHyphens(e.target.value))
                                        }}
                                        error={formik.touched.title && !!formik.errors.title}
                                        helperText={formik.touched.title && formik.errors.title}
                                   />

                                   <TextField
                                        InputLabelProps={{ shrink: true }}
                                        disabled
                                        label="URL projekta"
                                        name="projectSummaryURL"
                                        multiline
                                        rows={4}
                                        value={formik.values.projectSummaryURL}
                                   />

                                   <TextField
                                        InputLabelProps={{ shrink: true }}
                                        label="Thumbnail URL slike"
                                        name="projectSummaryCoverURL"
                                        value={formik.values.projectSummaryCoverURL}
                                        disabled={loading}
                                        onChange={formik.handleChange}
                                        error={formik.touched.projectSummaryCoverURL && !!formik.errors.projectSummaryCoverURL}
                                        helperText={formik.touched.projectSummaryCoverURL && formik.errors.projectSummaryCoverURL}
                                   />

                                   <FormControl fullWidth>
                                        <InputLabel id="demo-simple-select-label">Status</InputLabel>
                                        <Select
                                             name='status'
                                             id="demo-simple-select"
                                             value={formik.values.status}
                                             onChange={formik.handleChange}
                                             error={formik.touched.status && !!formik.errors.status}
                                             variant='outlined'
                                             sx={{ borderColor: 'white' }}
                                        >
                                             <MenuItem value={''}>Ponisti</MenuItem>
                                             <MenuItem value={'in-progress'}>U toku</MenuItem>
                                             <MenuItem value={'completed'}>Zavrsen</MenuItem>
                                             <MenuItem value={'todo'}>U planu</MenuItem>
                                        </Select>
                                   </FormControl>

                                   <FormControl fullWidth>
                                        <InputLabel id="demo-simple-select-label">Jezik</InputLabel>
                                        <Select
                                             labelId="demo-simple-select-label"
                                             id="demo-simple-select"
                                             value={formik.values.locale}
                                             label="Jezik"
                                             name='locale'
                                             onChange={formik.handleChange}
                                             error={formik.touched.locale && !!formik.errors.locale}
                                        >
                                             <MenuItem value={'sr'}>sr</MenuItem>
                                             <MenuItem value={'en'}>en</MenuItem>
                                        </Select>
                                   </FormControl>

                                   <TextField
                                        InputLabelProps={{ shrink: true }}
                                        fullWidth
                                        label="Organizatori"
                                        name="organizers"
                                        onBlur={(e) => {
                                             const { value } = e.target;
                                             const organizersArray = value.split(',').map((organizer) => organizer.trim());
                                             formik.setFieldValue('organizers', organizersArray);
                                             formik.handleBlur(e);
                                        }}
                                        error={formik.touched.organizers && !!formik.errors.organizers}
                                        helperText={formik.touched.organizers && formik.errors.organizers}
                                   />

                                   <TextField
                                        InputLabelProps={{ shrink: true }}
                                        fullWidth
                                        label="Lokacije"
                                        name="locations"
                                        onBlur={(e) => {
                                             const { value } = e.target;
                                             const locations = value.split(',').map((locations) => locations.trim());
                                             formik.setFieldValue('locations', locations);
                                             formik.handleBlur(e);
                                        }}
                                        error={formik.touched.locations && !!formik.errors.locations}
                                        helperText={formik.touched.locations && formik.errors.locations}
                                   />

                                   <TextField
                                        InputLabelProps={{ shrink: true }}
                                        fullWidth
                                        label="Aplikanti"
                                        name="applicants"
                                        onBlur={(e) => {
                                             const { value } = e.target;
                                             const applicants = value.split(',').map((applicant) => applicant.trim());
                                             formik.setFieldValue('applicants', applicants);
                                             formik.handleBlur(e);
                                        }}
                                        error={formik.touched.applicants && !!formik.errors.applicants}
                                        helperText={formik.touched.applicants && formik.errors.applicants}
                                   />

                                   <TextField
                                        InputLabelProps={{ shrink: true }}
                                        fullWidth
                                        label="Donatori"
                                        name="donators"
                                        onBlur={(e) => {
                                             const { value } = e.target;
                                             const donators = value.split(',').map((donator) => donator.trim());
                                             formik.setFieldValue('applicants', donators);
                                             formik.handleBlur(e);
                                        }}
                                        error={formik.touched.donators && !!formik.errors.donators}
                                        helperText={formik.touched.donators && formik.errors.donators}
                                   />

                                   <TextField
                                        InputLabelProps={{ shrink: true }}
                                        fullWidth
                                        label="Publikacije"
                                        name="publications"
                                        onBlur={(e) => {
                                             const { value } = e.target;
                                             const publications = value.split(',').map((publication) => publication.trim());
                                             formik.setFieldValue('applicants', publications);
                                             formik.handleBlur(e);
                                        }}
                                        error={formik.touched.publications && !!formik.errors.publications}
                                        helperText={formik.touched.publications && formik.errors.publications}
                                   />

                                   <TextField
                                        InputLabelProps={{ shrink: true }}
                                        fullWidth
                                        label="Linkovi"
                                        name="links"
                                        onBlur={(e) => {
                                             const { value } = e.target;
                                             const links = value.split(',').map((link) => link.trim());
                                             formik.setFieldValue('links', links);
                                             formik.handleBlur(e);
                                        }}
                                        error={formik.touched.links && !!formik.errors.links}
                                        helperText={formik.touched.links && formik.errors.links}
                                   />

                                   /////////////////////////////////////////////////////////////////////////////
                                   <Divider />
                                   <Grid
                                        item
                                        md={6}
                                        xs={12}
                                   >
                                        <Typography sx={{ margin: '10px' }}>Podnaslovi:</Typography>
                                        <FieldArray
                                             name={'projectSummarySubtitles'}
                                             render={arrayHelpers => (
                                                  formik.values?.projectSummarySubtitles.length > 0 ?
                                                       formik.values?.projectSummarySubtitles.map((description: any, index: any) => (
                                                            <Box sx={{ display: 'flex', width: '80%' }}>
                                                                 <Field
                                                                      InputLabelProps={{ shrink: true }}
                                                                      defaultValue={description}
                                                                      fullWidth
                                                                      name={`projectSummarySubtitles.${index}`}
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
                                   </Grid>

                                   <Grid
                                        item
                                        md={6}
                                        xs={12}
                                   >
                                        <Typography sx={{ margin: '10px' }}>Opisi:</Typography>
                                        <FieldArray
                                             name={'projectSummaryDescriptions'}
                                             render={arrayHelpers => (
                                                  formik.values?.projectSummaryDescriptions.length > 0 ?
                                                       formik.values?.projectSummaryDescriptions.map((description: any, index: any) => (
                                                            <Box sx={{ display: 'flex', width: '80%' }}>
                                                                 <Field
                                                                      InputLabelProps={{ shrink: true }}
                                                                      defaultValue={description}
                                                                      fullWidth
                                                                      name={`projectSummaryDescriptions.${index}`}
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
                                   </Grid>

                                   <Grid
                                        item
                                        md={6}
                                        xs={12}
                                   >
                                        <Typography sx={{ margin: '10px' }}>URL-ovi podnaslova:</Typography>
                                        <FieldArray
                                             name={'projectSummarySubtitleURLs'}
                                             render={arrayHelpers => (
                                                  formik.values?.projectSummarySubtitleURLs.length > 0 ?
                                                       formik.values?.projectSummarySubtitleURLs.map((description: any, index: any) => (
                                                            <Box sx={{ display: 'flex', width: '80%' }}>
                                                                 <Field
                                                                      InputLabelProps={{ shrink: true }}
                                                                      defaultValue={description}
                                                                      fullWidth
                                                                      name={`projectSummarySubtitleURLs.${index}`}
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
                                   </Grid>

                                   <Grid
                                        item
                                        md={6}
                                        xs={12}
                                   >
                                        <Typography sx={{ margin: '10px' }}>Vremena odrzavanja projektnih aktivnosti (obavezno):</Typography>
                                        <FieldArray
                                             name={'projectSummaryDateTime'}
                                             render={arrayHelpers => (
                                                  formik.values?.projectSummaryDateTime.length > 0 ?
                                                       formik.values?.projectSummaryDateTime.map((description: any, index: any) => (
                                                            <Box sx={{ display: 'flex', width: '80%' }}>
                                                                 <Field
                                                                      as={DateField}
                                                                      InputLabelProps={{ shrink: true }}
                                                                      defaultValue={description}
                                                                      fullWidth
                                                                      name={`projectSummaryDateTime.${index}`}
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
                                   </Grid>

                                   <Typography sx={{ margin: '10px' }}>Slike:</Typography>
                                   <Box sx={{ display: 'flex', flexDirection: 'column', paddingLeft: '30px', marginBottom: '30px' }}>
                                        {/* -------------------------slike------------------------------------------ */}
                                        {
                                             formik.values?.gallery && formik.values.gallery.length > 0 && (
                                                  <ImageList sx={{ width: 500, height: 450 }} cols={3} rowHeight={164}>
                                                       {formik.values.gallery.map((item: any) => (
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
                                   <Box sx={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>
                                        <Button
                                             variant="contained"
                                             color="primary"
                                             onClick={() => onSubmitFail()}
                                             disabled={loading}
                                        >
                                             Odustani
                                        </Button>
                                        <Button type="submit"
                                             variant="contained"
                                             color="primary"
                                             disabled={Object.keys(formik.errors).length != 0 && loading}
                                        >
                                             Dodaj proizvod
                                        </Button>
                                   </Box>
                              </Form>
                         )
                    }
               </Formik >
          </Box >
     );
};