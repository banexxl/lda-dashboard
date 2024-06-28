import React, { useState } from 'react';
import { Field, FieldArray } from 'formik';
import { TextField, Typography, Button, Box, Grid, MenuItem, IconButton, FormControl, InputLabel, Select, Divider } from '@mui/material'
import { Form, Formik } from 'formik';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2'
import DeleteIcon from '@mui/icons-material/Delete';
import AddBoxIcon from '@mui/icons-material/AddBox';
import "@uploadthing/react/styles.css";
import ProjectSummarySchema, { initialProjectSummary } from './project-summary-type';
import { DateField } from '@mui/x-date-pickers/DateField';
import { stringWithHyphens } from '@/utils/url-creator';
import moment from 'moment';

export const AddProjectSummaryForm = ({ onSubmitSuccess, onSubmitFail }: any) => {

     const router = useRouter();
     const [loading, setLoading] = useState<any>(false)
     const [projectSummarySubtitleURLs, setProjectSummarySubtitleURLs] = useState<any>([])
     const [subtitles, setSubtitles] = useState<string[]>([]);
     const [disabledAddButtons, setDisabledAddButtons] = useState(Array(subtitles.length).fill(false)); // New state variable
     const [error, setError] = useState("");

     const handleSubmit = async (values: any) => {

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
                         text: 'Projekat ubačen uspešno',
                    })
                    router.refresh()
               } else {

                    onSubmitFail()

                    Swal.fire({
                         icon: 'error',
                         title: 'Oops...',
                         text: 'Nešto ne valja :(',
                    })
               }

          } catch (err) {
               onSubmitFail()
               Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Nešto ne valja :(',
               })
          }

     }

     const handleAddSubtitle = (arrayHelpers: any) => {
          arrayHelpers.push('');
          setSubtitles([...subtitles, '']);
          setDisabledAddButtons([...disabledAddButtons, false]);
     };

     const handleAddUrl = (index: any) => {
          const sanitizedValue = subtitles[index]
               .replace(/[^a-zA-Z0-9čćžšđČĆŽŠĐ\s]/g, '') // Keep alphanumeric, Serbian Latinic letters and spaces
               .replace(/\s+/g, ' '); // Replace multiple spaces with a single space
          const newUrl = stringWithHyphens(sanitizedValue);
          const updatedURLs = [...projectSummarySubtitleURLs];
          updatedURLs[index] = newUrl;
          setProjectSummarySubtitleURLs(updatedURLs);
          //formik.setFieldValue('projectSummarySubtitleURLs', updatedURLs);
          setDisabledAddButtons((prev: any) => {
               const updatedDisabledButtons = [...prev];
               updatedDisabledButtons[index] = true;
               return updatedDisabledButtons;
          });
     };

     const handleRemoveSubtitle = (arrayHelpers: any, index: number) => {
          arrayHelpers.remove(index);
          const updatedURLs = [...projectSummarySubtitleURLs];
          updatedURLs.splice(index, 1);
          setProjectSummarySubtitleURLs(updatedURLs);
          setSubtitles((prev) => {
               const updatedSubtitles = [...prev];
               updatedSubtitles.splice(index, 1);
               return updatedSubtitles;
          });
          setDisabledAddButtons((prev) => {
               const updatedDisabledButtons = [...prev];
               updatedDisabledButtons.splice(index, 1);
               return updatedDisabledButtons;
          });
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
                                             const sanitizedValue = e.target.value
                                                  .replace(/[^a-zA-Z0-9čćžšđČĆŽŠĐ\s]/g, '') // Keep alphanumeric, Serbian Latinic letters and spaces
                                                  .replace(/\s+/g, ' ');
                                             formik.setFieldValue('title', sanitizedValue)
                                             formik.setFieldValue('projectSummaryURL', stringWithHyphens(sanitizedValue))
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

                                   <DateField
                                        InputLabelProps={{ shrink: true }}
                                        label="Pocetak projekta"
                                        name="projectSummaryStartDateTime"
                                        onBlur={(e) => formik.setFieldValue('projectStartDateTime', e.target.value)}
                                   />

                                   <DateField
                                        InputLabelProps={{ shrink: true }}
                                        label="Kraj projekta"
                                        name="projectSummaryEndDateTime"
                                        onBlur={(e) => formik.setFieldValue('projectEndDateTime', e.target.value)}
                                   />

                                   <FormControl fullWidth>
                                        <TextField
                                             select
                                             label="Status projekta"
                                             name='status'
                                             id="demo-simple-select"
                                             value={formik.values.status}
                                             onChange={formik.handleChange}
                                             error={formik.touched.status && !!formik.errors.status}
                                             sx={{ borderColor: 'white' }}
                                        >
                                             <MenuItem value={''}>Ponisti</MenuItem>
                                             <MenuItem value={'in-progress'}>U toku</MenuItem>
                                             <MenuItem value={'completed'}>Zavrsen</MenuItem>
                                             <MenuItem value={'todo'}>U planu</MenuItem>
                                        </TextField>
                                   </FormControl>

                                   <FormControl fullWidth>
                                        <TextField
                                             select
                                             label="Jezik"
                                             id="demo-simple-select"
                                             value={'sr'}
                                             name='locale'
                                             disabled
                                             onChange={formik.handleChange}
                                             error={formik.touched.locale && !!formik.errors.locale}
                                        >
                                             <MenuItem value={'sr'}>sr</MenuItem>
                                             <MenuItem value={'en'}>en</MenuItem>
                                        </TextField>
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
                                             formik.setFieldValue('donators', donators);
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
                                             formik.setFieldValue('publications', publications);
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
                                             Dodaj projekat
                                        </Button>
                                   </Box>
                              </Form>
                         )
                    }
               </Formik >
          </Box >
     );
};