import React, { useState } from 'react';
import { Field, FieldArray } from 'formik';
import { TextField, Typography, Button, Box, Grid, MenuItem, IconButton, FormControl, InputLabel, Select, Divider } from '@mui/material'
import { Form, Formik } from 'formik';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2'
import DeleteIcon from '@mui/icons-material/Delete';
import AddBoxIcon from '@mui/icons-material/AddBox';
import "@uploadthing/react/styles.css";
import { ActivitySchema, initialActivity } from './activity-type';
import { DateField } from '@mui/x-date-pickers/DateField';
import { stringWithHyphens } from '@/utils/url-creator';
import moment from 'moment';

export const AddActivityForm = ({ onSubmitSuccess, onSubmitFail }: any) => {

     const router = useRouter();
     const [loading, setLoading] = useState<any>(false)

     const handleSubmit = async (values: any) => {

          try {
               const responseValues: any = await fetch('/api/activities-api', {
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
                         text: 'Aktivnost ubačena uspešno',
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

                    initialValues={initialActivity}
                    onSubmit={(values) => {
                         handleSubmit(values)
                    }}
                    validationSchema={ActivitySchema}>
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
                                        disabled={loading}
                                        onBlur={(e: any) => {
                                             formik.setFieldValue('title', e.target.value)
                                             formik.setFieldValue('activityURL', stringWithHyphens(e.target.value))
                                        }}
                                        error={formik.touched.title && !!formik.errors.title}
                                        helperText={formik.touched.title && formik.errors.title}
                                   />

                                   <TextField
                                        InputLabelProps={{ shrink: true }}
                                        disabled
                                        label="URL projekta"
                                        name="activityURL"
                                        multiline
                                        rows={4}
                                        value={formik.values.activityURL}
                                   />

                                   <DateField
                                        InputLabelProps={{ shrink: true }}
                                        label="Objavljeno"
                                        name="publishedDate"
                                        disabled={loading}
                                        onBlur={(e) => formik.setFieldValue('publishedDate', e.target.value)}
                                   />

                                   <FormControl fullWidth disabled={loading}>
                                        <InputLabel id="demo-simple-select-label">Status</InputLabel>
                                        <Select
                                             name='status'
                                             id="demo-simple-select"
                                             disabled={loading}
                                             value={formik.values.status}
                                             onChange={formik.handleChange}
                                             error={formik.touched.status && !!formik.errors.status}
                                             variant='outlined'
                                             sx={{ borderColor: 'white' }}
                                        >
                                             <MenuItem value={''}>Ponisti</MenuItem>
                                             <MenuItem value={'in-progress'}>U toku</MenuItem>
                                             <MenuItem value={'completed'}>Zavrsen</MenuItem>
                                             <MenuItem value={'to-do'}>U planu</MenuItem>
                                        </Select>
                                   </FormControl>

                                   <FormControl fullWidth>
                                        <InputLabel id="demo-simple-select-label">Jezik</InputLabel>
                                        <Select
                                             labelId="demo-simple-select-label"
                                             id="demo-simple-select"
                                             value={formik.values.locale}
                                             label="Jezik"
                                             disabled={loading}
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
                                        disabled={loading}
                                        label="Autor"
                                        name="author"
                                        onBlur={(e) => {
                                             formik.setFieldValue('author', e.target.value)
                                        }}
                                        error={formik.touched.author && !!formik.errors.author}
                                        helperText={formik.touched.author && formik.errors.author}
                                   />

                                   <TextField
                                        InputLabelProps={{ shrink: true }}
                                        fullWidth
                                        disabled={loading}
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

                                   <TextField
                                        InputLabelProps={{ shrink: true }}
                                        fullWidth
                                        disabled={loading}
                                        label="Naslov liste"
                                        name="listTitle"
                                        onBlur={(e) => {
                                             formik.setFieldValue('listTitle', e.target.value)
                                        }}
                                        error={formik.touched.listTitle && !!formik.errors.listTitle}
                                        helperText={formik.touched.listTitle && formik.errors.listTitle}
                                   />

                                   <TextField
                                        InputLabelProps={{ shrink: true }}
                                        fullWidth
                                        disabled={loading}
                                        label="Naslov liste"
                                        name="listTitle"
                                        onBlur={(e) => {
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
                                                       formik.values?.list.map((list: any, index: any) => (
                                                            <Box sx={{ display: 'flex', width: '80%' }}>
                                                                 <Field
                                                                      InputLabelProps={{ shrink: true }}
                                                                      defaultValue={list}
                                                                      fullWidth
                                                                      name={`list.${index}`}
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

                                   <FormControl fullWidth disabled={loading}>
                                        <InputLabel id="activityCategory">Kategorija aktivnosti</InputLabel>
                                        <Select
                                             name='category'
                                             id="category"
                                             disabled={loading}
                                             value={formik.values.category}
                                             onChange={formik.handleChange}
                                             error={formik.touched.category && !!formik.errors.category}
                                             variant='outlined'
                                             sx={{ borderColor: 'white' }}
                                        >
                                             <MenuItem value={''}>Poništi</MenuItem>
                                             <MenuItem value={'economy'}>Ekonomija</MenuItem>
                                             <MenuItem value={'democracy'}>Demokratija</MenuItem>
                                             <MenuItem value={'eu-integrations'}>EU integracije</MenuItem>
                                             <MenuItem value={'culture'}>Kultura</MenuItem>
                                             <MenuItem value={'intercultural-dialogue'}>Interkulturalni dijalog</MenuItem>
                                             <MenuItem value={'migrations'}>Migracije</MenuItem>
                                             <MenuItem value={'youth'}>Mladi</MenuItem>
                                             <MenuItem value={'other'}>Ostalo</MenuItem>
                                        </Select>
                                   </FormControl>

                                   <Divider />

                                   <Grid
                                        item
                                        md={6}
                                        xs={12}
                                   >
                                        <Typography sx={{ margin: '10px' }}>Pasusi:</Typography>
                                        <FieldArray
                                             name={'descriptions'}
                                             render={arrayHelpers => (
                                                  formik.values?.descriptions.length > 0 ?
                                                       formik.values?.descriptions.map((description: any, index: any) => (
                                                            <Box sx={{ display: 'flex', width: '80%' }}>
                                                                 <Field
                                                                      InputLabelProps={{ shrink: true }}
                                                                      defaultValue={description}
                                                                      fullWidth
                                                                      name={`description.${index}`}
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
                                                                      name={`link.${index}`}
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