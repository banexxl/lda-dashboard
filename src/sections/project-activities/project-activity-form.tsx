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

export const AddProjectActivityForm = ({ onSubmitSuccess, onSubmitFail }: any) => {

     const router = useRouter();
     const [loading, setLoading] = useState<any>(false)
     const [listEnabled, setListEnabled] = useState<any>(false)

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
                                        value={'/projektna-aktivnost/' + formik.values.projectURL}
                                   />

                                   <FormControl fullWidth>
                                        <TextField
                                             id="demo-simple-select"
                                             label="Status"
                                             select
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
                                        </TextField>
                                   </FormControl>

                                   <FormControl fullWidth>
                                        <TextField
                                             id="demo-simple-select"
                                             value={formik.values.locale}
                                             select
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
                                        </TextField>
                                   </FormControl>

                                   <DateField
                                        InputLabelProps={{ shrink: true }}
                                        label="Objavljeno"
                                        name="published"
                                        onBlur={(e) => formik.setFieldValue('published', e.target.value)}
                                   />

                                   <FormControl fullWidth>

                                        <TextField
                                             name='category'
                                             id="demo-simple-select"
                                             label="Kategorija"
                                             value={formik.values.category}
                                             select
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
                                        </TextField>
                                   </FormControl>

                                   <InputLabel id="showProjectDetails">Prikazi detalje projekta</InputLabel>
                                   <Checkbox
                                        name="showProjectDetails"
                                        defaultChecked={formik.values.showProjectDetails}
                                        onChange={(e) => {
                                             setListEnabled(e.target.checked)
                                             formik.handleChange
                                        }}
                                   />

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
                                                                 <Field
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
                                        <Typography sx={{ margin: '10px' }}>Linkovi:</Typography>
                                        <FieldArray
                                             name={'links'}
                                             render={arrayHelpers => (
                                                  formik.values?.links.length > 0 ?
                                                       formik.values?.links.map((link: any, index: any) => (
                                                            <Box sx={{ display: 'flex', width: '80%' }}>
                                                                 <Field
                                                                      InputLabelProps={{ shrink: true }}
                                                                      defaultValue={link}
                                                                      fullWidth
                                                                      name={`links.${index}`}
                                                                      label={`Link ${index + 1}`}
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
                                        <Typography sx={{ margin: '10px' }}>Pasusi:</Typography>
                                        <FieldArray
                                             name={'paragraphs'}
                                             render={arrayHelpers => (
                                                  formik.values?.paragraphs.length > 0 ?
                                                       formik.values?.paragraphs.map((paragraph: any, index: any) => (
                                                            <Box sx={{ display: 'flex', width: '80%' }}>
                                                                 <Field
                                                                      InputLabelProps={{ shrink: true }}
                                                                      defaultValue={paragraph}
                                                                      fullWidth
                                                                      name={`paragraphs.${index}`}
                                                                      label={`Paragraf ${index + 1}`}
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
                                        <Typography sx={{ margin: '10px' }}>Lokacije:</Typography>
                                        <FieldArray
                                             name={'locations'}
                                             render={arrayHelpers => (
                                                  formik.values?.locations.length > 0 ?
                                                       formik.values?.locations.map((location: any, index: any) => (
                                                            <Box sx={{ display: 'flex', width: '80%' }}>
                                                                 <Field
                                                                      InputLabelProps={{ shrink: true }}
                                                                      defaultValue={location}
                                                                      fullWidth
                                                                      name={`locations.${index}`}
                                                                      label={`Lokacije ${index + 1}`}
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
                                        <Typography sx={{ margin: '10px' }}>Aplikanti:</Typography>
                                        <FieldArray
                                             name={'applicants'}
                                             render={arrayHelpers => (
                                                  formik.values?.applicants.length > 0 ?
                                                       formik.values?.applicants.map((applicant: any, index: any) => (
                                                            <Box sx={{ display: 'flex', width: '80%' }}>
                                                                 <Field
                                                                      InputLabelProps={{ shrink: true }}
                                                                      defaultValue={applicant}
                                                                      fullWidth
                                                                      name={`applicants.${index}`}
                                                                      label={`Aplikanti ${index + 1}`}
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
                                        <Typography sx={{ margin: '10px' }}>Organizatori:</Typography>
                                        <FieldArray
                                             name={'organizers'}
                                             render={arrayHelpers => (
                                                  formik.values?.organizers.length > 0 ?
                                                       formik.values?.organizers.map((organizer: any, index: any) => (
                                                            <Box sx={{ display: 'flex', width: '80%' }}>
                                                                 <Field
                                                                      InputLabelProps={{ shrink: true }}
                                                                      defaultValue={organizer}
                                                                      fullWidth
                                                                      name={`organizers.${index}`}
                                                                      label={`Organizator ${index + 1}`}
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
                                        <Typography sx={{ margin: '10px' }}>Pod Organizatori:</Typography>
                                        <FieldArray
                                             name={'subOrganizers'}
                                             render={arrayHelpers => (
                                                  formik.values?.subOrganizers.length > 0 ?
                                                       formik.values?.subOrganizers.map((subOrganizer: any, index: any) => (
                                                            <Box sx={{ display: 'flex', width: '80%' }}>
                                                                 <Field
                                                                      InputLabelProps={{ shrink: true }}
                                                                      defaultValue={subOrganizer}
                                                                      fullWidth
                                                                      name={`subOrganizers.${index}`}
                                                                      label={`Pod Organizator ${index + 1}`}
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
                                        <Typography sx={{ margin: '10px' }}>Donatori:</Typography>
                                        <FieldArray
                                             name={'donators'}
                                             render={arrayHelpers => (
                                                  formik.values?.donators.length > 0 ?
                                                       formik.values?.donators.map((donator: any, index: any) => (
                                                            <Box sx={{ display: 'flex', width: '80%' }}>
                                                                 <Field
                                                                      InputLabelProps={{ shrink: true }}
                                                                      defaultValue={donator}
                                                                      fullWidth
                                                                      name={`donators.${index}`}
                                                                      label={`Donatori ${index + 1}`}
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
                                        <Typography sx={{ margin: '10px' }}>Publikacije:</Typography>
                                        <FieldArray
                                             name={'publications'}
                                             render={arrayHelpers => (
                                                  formik.values?.publications.length > 0 ?
                                                       formik.values?.publications.map((publication: any, index: any) => (
                                                            <Box sx={{ display: 'flex', width: '80%' }}>
                                                                 <Field
                                                                      InputLabelProps={{ shrink: true }}
                                                                      defaultValue={publication}
                                                                      fullWidth
                                                                      name={`publications.${index}`}
                                                                      label={`Publikacija ${index + 1}`}
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