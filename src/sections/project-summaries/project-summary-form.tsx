import React, { useState } from 'react';
import { TextField, Typography, Button, Box, Grid, MenuItem, IconButton, FormControl, InputLabel, Select, Divider, FormHelperText } from '@mui/material'
import { Form, Formik } from 'formik';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2'
import "@uploadthing/react/styles.css";
import ProjectSummarySchema, { initialProjectSummary } from './project-summary-type';
import { DateField } from '@mui/x-date-pickers/DateField';
import { sanitizeString } from '@/utils/url-creator';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker/DesktopDatePicker';
import moment from 'moment';
import dayjs from 'dayjs';

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


                                   {/* <Typography>
                                        {`${JSON.stringify(formik.errors)}`}
                                   </Typography> */}


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
                                             formik.setFieldValue('projectSummaryURL', sanitizeString(sanitizedValue))
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
                                        label="Početak projekta"
                                        name="projectStartDateTime"
                                        value={formik.values.projectStartDateTime}
                                        onChange={(value) => formik.setFieldValue('projectStartDateTime', value)}
                                        onBlur={() => formik.setFieldTouched('projectStartDateTime', true)}
                                        helperText={
                                             formik.touched.projectStartDateTime && formik.errors.projectStartDateTime ? String(formik.errors.projectStartDateTime) : null
                                        }
                                        FormHelperTextProps={{
                                             sx: {
                                                  color: formik.touched.projectStartDateTime && formik.errors.projectStartDateTime ? 'red' : 'inherit',
                                             },
                                        }}
                                        // You can use the sx prop directly if available
                                        sx={{
                                             '& .MuiFormHelperText-root': {
                                                  color: formik.touched.projectStartDateTime && formik.errors.projectStartDateTime ? 'red' : 'inherit',
                                             },
                                        }}
                                   />

                                   <DateField
                                        InputLabelProps={{ shrink: true }}
                                        label="Kraj projekta"
                                        name="projectEndDateTime"
                                        value={formik.values.projectEndDateTime}
                                        onChange={(value) => formik.setFieldValue('projectEndDateTime', value)}
                                        onBlur={() => formik.setFieldTouched('projectEndDateTime', true)}
                                        helperText={
                                             formik.touched.projectEndDateTime && formik.errors.projectEndDateTime ? String(formik.errors.projectEndDateTime) : null
                                        }
                                        FormHelperTextProps={{
                                             sx: {
                                                  color: formik.touched.projectEndDateTime && formik.errors.projectEndDateTime ? 'red' : 'inherit',
                                             },
                                        }}
                                        // You can use the sx prop directly if available
                                        sx={{
                                             '& .MuiFormHelperText-root': {
                                                  color: formik.touched.projectEndDateTime && formik.errors.projectEndDateTime ? 'red' : 'inherit',
                                             },
                                        }}
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
                                        label="Organizatori (odvojeni zarezom)"
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
                                        label="Lokacije (odvojeni zarezom)"
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
                                        label="Aplikanti (odvojeni zarezom)"
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
                                        label="Donatori (odvojeni zarezom)"
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

                                   {/* <TextField
                                        InputLabelProps={{ shrink: true }}
                                        fullWidth
                                        label="Publikacije (odvojeni zarezom)"
                                        name="publications"
                                        onBlur={(e) => {
                                             const { value } = e.target;
                                             const publications = value.split(',').map((publication) => publication.trim());
                                             formik.setFieldValue('publications', publications);
                                             formik.handleBlur(e);
                                        }}
                                        error={formik.touched.publications && !!formik.errors.publications}
                                        helperText={formik.touched.publications && formik.errors.publications}
                                   /> */}

                                   <TextField
                                        InputLabelProps={{ shrink: true }}
                                        fullWidth
                                        label="Linkovi (odvojeni zarezom)"
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