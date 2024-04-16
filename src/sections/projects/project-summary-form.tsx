"use client"
import React, { useState } from 'react';
import { useFormik } from 'formik';
import { TextField, Typography, Button, Checkbox, FormControlLabel, Box, Input, Card, CardContent, Grid, MenuItem, Stack, Container, IconButton, CardActionArea, FormControl, InputLabel, Select } from '@mui/material';
import { Form, Formik, FormikErrors, FormikTouched } from 'formik';
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import ProjectSummarySchema from './new-project-schema'
import { useRouter } from 'next/navigation';
import CircularProgress from '@mui/material/CircularProgress';
import Swal from 'sweetalert2'
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import Image from 'next/image';
import { LoadingButton } from '@mui/lab';
import "@uploadthing/react/styles.css";
import { useTheme } from '@mui/material/styles';
import { UploadButton, UploadDropzone } from "../../utils/image-upload-components";
import { initialProjectSummary } from './project-summary-type';

export const AddProjectSummaryForm = ({ onSubmitSuccess, onSubmitFail }: any) => {

     const theme = useTheme()
     const router = useRouter();
     //const [selectedFile, setSelectedFile] = useState(null);
     const [fileURL, setFileURL] = useState("")
     const [loading, setLoading] = useState<any>(false)

     const handleFileRemove = () => {
          setFileURL(""); // Remove the selected file
     };

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
               console.error(err);
               Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Nešto ne valja :(',
               })
          }
     }

     // const handleFileChange = (e) => {
     //      const file = e.target.files?.[0] ?? null
     //      setSelectedFile(file)
     //      if (fileURL) {
     //           URL.revokeObjectURL(fileURL)
     //      }
     //      if (file) {
     //           const url = URL.createObjectURL(file)
     //           setFileURL(url)
     //      } else {
     //           setFileURL(null)
     //      }
     // };



     return (
          <Box>
               <Formik
                    initialValues={initialProjectSummary}
                    onSubmit={(values) => {
                         handleSubmit(values)
                    }}
                    validationSchema={ProjectSummarySchema}>
                    {
                         (formik) => (
                              <Form style={{ display: 'flex', flexDirection: 'column', gap: '15px', opacity: loading ? .5 : 1, }}>
                                   {/* <Typography>
                                        {`${ JSON.stringify(formik.errors) }`}
                                   </Typography> */}
                                   <TextField
                                        label="Naslov projekta"
                                        name="title"
                                        value={formik.values.title}
                                        disabled={loading}
                                        onChange={formik.handleChange}
                                        error={formik.touched.title && !!formik.errors.title}
                                        helperText={formik.touched.title && formik.errors.title}
                                   />

                                   <TextField
                                        label="URL projekta"
                                        name="projectSummaryURL"
                                        multiline
                                        disabled={loading}
                                        rows={4}
                                        value={formik.values.projectSummaryURL}
                                        onChange={formik.handleChange}
                                        error={formik.touched.projectSummaryURL && !!formik.errors.projectSummaryURL}
                                        helperText={formik.touched.projectSummaryURL && formik.errors.projectSummaryURL}
                                   />

                                   <TextField
                                        label=""
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
                                             labelId="demo-simple-select-label"
                                             id="demo-simple-select"
                                             value={formik.values.status}
                                             label="Status"
                                             onChange={formik.handleChange}
                                             error={formik.touched.status && !!formik.errors.status}
                                        >
                                             <MenuItem value={'in-progress'}>U toku</MenuItem>
                                             <MenuItem value={'completed'}>Zavrsen</MenuItem>
                                             <MenuItem value={'todo'}>U planu</MenuItem>
                                        </Select>
                                   </FormControl>


                                   {/* <TextField
                                        fullWidth
                                        label="Sub kategorija"
                                        name="subCategory"
                                        onBlur={formik.handleBlur}
                                        onChange={formik.handleChange}
                                        select
                                        error={formik.touched.subCategory && !!formik.errors.subCategory}
                                        helperText={formik.touched.subCategory && formik.errors.subCategory}
                                        value={formik.values.subCategory}
                                        disabled={!isSubCategoryEnabled || loading}
                                   >
                                        {subCategoryOptions ?
                                             subCategoryOptions.map((option: any) =>
                                             (
                                                  <MenuItem key={option.value} value={option.value}>
                                                       {option.label}
                                                  </MenuItem>
                                             ))
                                             :
                                             <MenuItem key={'no-category'}>
                                                  Nema sub kategorije
                                             </MenuItem>
                                        }
                                   </TextField> */}


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