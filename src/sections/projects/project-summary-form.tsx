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
                         text: 'Artikl ubačen uspešno',
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

                                   {/* 
<Typography>
    {`${JSON.stringify(formik.errors)}`}
</Typography> 
*/}

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
                                                       formik.values?.projectSummaryDateTime.map((date: any, index: any) => (
                                                            <Box key={Math.floor(Math.random() * 1000000)} sx={{ display: 'flex', width: '80%' }}>
                                                                 <DateField
                                                                      format='dd/MM/yyyy'
                                                                      InputLabelProps={{ shrink: true }}
                                                                      defaultValue={new Date(date)} // Convert string to Date object
                                                                      fullWidth
                                                                      onBlur={(e: any) => formik.setFieldValue(`projectSummaryDateTime.${index}`, e.target.value)}
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
                                                       <IconButton onClick={() => arrayHelpers.push(moment().format('dd/MM/yyyy'))}>
                                                            <AddBoxIcon />
                                                       </IconButton>
                                             )}
                                        />
                                   </Grid>

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