import React, { useState } from 'react';
import { Field, FieldArray } from 'formik';
import { TextField, Typography, Button, Box, Grid, MenuItem, IconButton, FormControl, InputLabel, Select, Divider, Checkbox } from '@mui/material'
import { Form, Formik } from 'formik';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2'
import DeleteIcon from '@mui/icons-material/Delete';
import AddBoxIcon from '@mui/icons-material/AddBox';
import "@uploadthing/react/styles.css";
import { ProjectActivity, ProjectActivitySchema, projectActivityInitialValues } from './project-activity-type';
import { DateField } from '@mui/x-date-pickers/DateField';
import { sanitizeString } from '@/utils/url-creator';
import moment from 'moment';

export const AddProjectActivityForm = ({ onSubmitSuccess, onSubmitFail, projectSummaries }: any) => {

     const router = useRouter();
     const [loading, setLoading] = useState<any>(false)
     const [listEnabled, setListEnabled] = useState<any>(false)

     const handleSubmit = async (values: any) => {

          try {
               const responseValues: any = await fetch('/api/project-activities-api', {
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
                    initialValues={projectActivityInitialValues}
                    onSubmit={(values) => {
                         handleSubmit(values)
                    }}
                    validationSchema={ProjectActivitySchema}>
                    {
                         (formik) => (
                              <Form style={{ display: 'flex', flexDirection: 'column', gap: '15px', opacity: loading ? .5 : 1 }}>

                                   <Typography>
                                        {`${JSON.stringify(formik.errors)}`}
                                   </Typography>

                                   <TextField
                                        InputLabelProps={{ shrink: true }}
                                        label="Naslov projektne aktivnosti"
                                        name="title"
                                        // value={formik.values.title}
                                        disabled={loading}
                                        onBlur={(e: any) => {
                                             const sanitizedValue = e.target.value
                                                  .replace(/[^a-zA-Z0-9čćžšđČĆŽŠĐ\s]/g, '') // Keep alphanumeric, Serbian Latinic letters and spaces
                                                  .replace(/\s+/g, ' ');
                                             formik.setFieldValue('title', sanitizedValue)
                                             formik.setFieldValue('projectURL', sanitizeString(sanitizedValue))
                                        }}
                                        error={formik.touched.title && !!formik.errors.title}
                                        helperText={formik.touched.title && formik.errors.title}
                                   />

                                   <TextField
                                        InputLabelProps={{ shrink: true }}
                                        disabled
                                        label="URL projektne aktivnosti"
                                        name="projectActivityURL"
                                        multiline
                                        rows={4}
                                        value={formik.values.projectURL}
                                   />

                                   <FormControl fullWidth>
                                        <InputLabel id="project-summary" sx={{ backgroundColor: 'white' }}>Glavni projekat</InputLabel>
                                        <Select
                                             label="Glavni projekat"
                                             labelId="project-summary"
                                             name='projectSummaryURL'
                                             id="project-summary"
                                             value={formik.values.projectSummaryURL}
                                             onChange={formik.handleChange}
                                             error={formik.touched.projectSummaryURL && !!formik.errors.projectSummaryURL}
                                             sx={{ borderColor: 'white' }}
                                        >
                                             {
                                                  projectSummaries.map((projectSummary: any) => (
                                                       <MenuItem
                                                            value={projectSummary.projectSummaryURL}
                                                            key={projectSummary.projectSummaryURL}
                                                       >
                                                            {projectSummary.title}
                                                       </MenuItem>
                                                  ))
                                             }
                                        </Select>
                                   </FormControl>

                                   <FormControl fullWidth>
                                        <InputLabel id="project-summary-status" sx={{ backgroundColor: 'white' }}>Status</InputLabel>
                                        <Select
                                             id="project-summary-status-id"
                                             labelId='project-summary-status'
                                             label="Status"
                                             value={formik.values.status}
                                             onChange={(e) => {
                                                  formik.setFieldValue('status', e.target.value)
                                             }}
                                             error={formik.touched.status && !!formik.errors.status}
                                        >
                                             <MenuItem value={''}>Ponisti</MenuItem>
                                             <MenuItem value={'in-progress'}>U toku</MenuItem>
                                             <MenuItem value={'completed'}>Zavrsen</MenuItem>
                                             <MenuItem value={'to-do'}>U planu</MenuItem>
                                        </Select>
                                   </FormControl>

                                   <FormControl fullWidth>
                                        <InputLabel id="project-summary-locale" sx={{ backgroundColor: 'white' }}>Jezik</InputLabel>
                                        <Select
                                             id="project-summary-locale-id"
                                             labelId='project-summary-locale'
                                             value={formik.values.locale}
                                             label="Jezik"
                                             disabled
                                             name='locale'
                                             onChange={(e) => {
                                                  formik.setFieldValue('locale', e.target.value)
                                             }}
                                             error={formik.touched.locale && !!formik.errors.locale}
                                        >
                                             <MenuItem value={'sr'}>sr</MenuItem>
                                             <MenuItem value={'en'}>en</MenuItem>
                                        </Select>
                                   </FormControl>

                                   <DateField
                                        InputLabelProps={{ shrink: true }}
                                        label="Objavljeno"
                                        name="published"
                                        onBlur={(e) => formik.setFieldValue('published', e.target.value)}
                                   />

                                   <FormControl fullWidth>
                                        <InputLabel id="project-summary-category" sx={{ backgroundColor: 'white' }}>Kategorija</InputLabel>
                                        <Select
                                             name='category'
                                             id="demo-simple-select-id"
                                             labelId='project-summary-category'
                                             label="Kategorija"
                                             value={formik.values.category}
                                             onChange={formik.handleChange}
                                             error={formik.touched.category && !!formik.errors.category}
                                             sx={{ borderColor: 'white' }}
                                        >
                                             <MenuItem value={''}>Poništi</MenuItem>
                                             <MenuItem value={'economy'}>Ekonomija</MenuItem>
                                             <MenuItem value={'democracy'}>Demokratija</MenuItem>
                                             <MenuItem value={'eu-integrations'}>EU integracije</MenuItem>
                                             <MenuItem value={'culture'}>Kultura</MenuItem>
                                             <MenuItem value={'intercultural-dialogue'}>Interkulturalni dijalog</MenuItem>
                                             <MenuItem value={'migrations'}>Migracije</MenuItem>
                                             <MenuItem value={'youth'}>Omladina</MenuItem>
                                             <MenuItem value={'other'}>Ostalo</MenuItem>
                                        </Select>
                                   </FormControl>

                                   <FormControl sx={{ display: 'flex', flexDirection: 'column', width: '400px', height: '50px' }}>
                                        <InputLabel id="showProjectDetails">Prikazi detalje projekta</InputLabel>
                                        <Checkbox
                                             name="showProjectDetails"
                                             defaultChecked={formik.values.showProjectDetails}
                                             sx={{ width: '10px', height: '10px' }}
                                             onChange={(e) => {
                                                  setListEnabled(e.target.checked)
                                                  formik.handleChange
                                             }}
                                        />
                                   </FormControl>

                                   <TextField
                                        InputLabelProps={{ shrink: true }}
                                        label="Tekst liste"
                                        name="title"
                                        // value={formik.values.title}
                                        disabled={loading || !listEnabled}
                                        onBlur={(e: any) => {
                                             formik.setFieldValue('listTitle', e.target.value)
                                        }}
                                        error={formik.touched.listTitle && !!formik.errors.listTitle}
                                        helperText={formik.touched.listTitle && formik.errors.listTitle}
                                   />

                                   <Grid
                                        item
                                        md={6}
                                        xs={12}
                                   >
                                        <Typography sx={{ margin: '10px' }}>Lista:</Typography>
                                        <FieldArray
                                             name={'list'}
                                             render={arrayHelpers => (
                                                  formik.values?.list.length > 0 ?
                                                       formik.values?.list.map((listItem: any, index: any) => (
                                                            <Box sx={{ display: 'flex', width: '80%' }}>
                                                                 <TextField
                                                                      disabled={loading || !listEnabled}
                                                                      InputLabelProps={{ shrink: true }}
                                                                      defaultValue={listItem}
                                                                      fullWidth
                                                                      name={`list.${index}`}
                                                                      label={`Stavka ${index + 1}`}
                                                                 />
                                                                 <IconButton disabled={loading || !listEnabled} onClick={() => arrayHelpers.insert(index + 1, '')}>
                                                                      <AddBoxIcon />
                                                                 </IconButton>
                                                                 <IconButton disabled={loading || !listEnabled} onClick={() => arrayHelpers.remove(index)}>
                                                                      <DeleteIcon />
                                                                 </IconButton>
                                                            </Box>
                                                       ))
                                                       :
                                                       < IconButton disabled={loading || !listEnabled} onClick={() => arrayHelpers.push('')}>
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
                                   </Grid>

                                   <Grid
                                        item
                                        md={6}
                                        xs={12}
                                   >
                                        <TextField
                                             InputLabelProps={{ shrink: true }}
                                             fullWidth
                                             label="Lokacije (odvojeni zarezom)"
                                             name="locations"
                                             onBlur={(e) => {
                                                  const { value } = e.target;
                                                  const locations = value.split(',').map((location) => location.trim());
                                                  formik.setFieldValue('locations', locations);
                                                  formik.handleBlur(e);
                                             }}
                                             error={formik.touched.locations && !!formik.errors.locations}
                                             helperText={formik.touched.locations && formik.errors.locations}
                                        />
                                   </Grid>

                                   <Grid
                                        item
                                        md={6}
                                        xs={12}
                                   >
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
                                   </Grid>

                                   <Grid
                                        item
                                        md={6}
                                        xs={12}
                                   >
                                        <TextField
                                             InputLabelProps={{ shrink: true }}
                                             fullWidth
                                             label="Organizatori (odvojeni zarezom)"
                                             name="organizers"
                                             onBlur={(e) => {
                                                  const { value } = e.target;
                                                  const organizers = value.split(',').map((organizer: any) => organizer.trim());
                                                  formik.setFieldValue('organizers', organizers);
                                                  formik.handleBlur(e);
                                             }}
                                             error={formik.touched.organizers && !!formik.errors.organizers}
                                             helperText={formik.touched.organizers && formik.errors.organizers}
                                        />
                                   </Grid>

                                   <Grid
                                        item
                                        md={6}
                                        xs={12}
                                   >
                                        <TextField
                                             InputLabelProps={{ shrink: true }}
                                             fullWidth
                                             label="Pod Organizatori (odvojeni zarezom)"
                                             name="subOrganizers"
                                             onBlur={(e) => {
                                                  const { value } = e.target;
                                                  const subOrganizers = value.split(',').map((subOrganizer: any) => subOrganizer.trim());
                                                  formik.setFieldValue('subOrganizers', subOrganizers);
                                                  formik.handleBlur(e);
                                             }}
                                             error={formik.touched.subOrganizers && !!formik.errors.subOrganizers}
                                             helperText={formik.touched.subOrganizers && formik.errors.subOrganizers}
                                        />
                                   </Grid>

                                   <Grid
                                        item
                                        md={6}
                                        xs={12}
                                   >
                                        <TextField
                                             InputLabelProps={{ shrink: true }}
                                             fullWidth
                                             label="Donatori (odvojeni zarezom)"
                                             name="donators"
                                             onBlur={(e) => {
                                                  const { value } = e.target;
                                                  const donators = value.split(',').map((donator: any) => donator.trim());
                                                  formik.setFieldValue('donators', donators);
                                                  formik.handleBlur(e);
                                             }}
                                             error={formik.touched.donators && !!formik.errors.donators}
                                             helperText={formik.touched.donators && formik.errors.donators}
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