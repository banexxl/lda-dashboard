"use client"
import React, { useState } from 'react';
import { useFormik } from 'formik';
import { TextField, Typography, Button, Checkbox, FormControlLabel, Box, Input, Card, CardContent, Grid, MenuItem, Stack, Container, IconButton, CardActionArea } from '@mui/material';
import { Form, Formik, FormikErrors, FormikTouched } from 'formik';
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import { newProjectSchema } from './new-project-schema'
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

const initialValues = {
     name: '',
     description: '',
     mainCategory: '',
     midCategory: '',
     subCategory: '',
     availableStock: '',
     ingredients: '',
     instructions: '',
     quantity: '',
     manufacturer: '',
     warning: '',
     imageURL: '',
     price: '',
     newArrival: false,
     bestSeller: false,
     discount: false,
     discountAmount: 0,
};

export const AddProductForm = ({ onSubmitSuccess, onSubmitFail }: any) => {

     const theme = useTheme()
     const router = useRouter();
     //const [selectedFile, setSelectedFile] = useState(null);
     const [fileURL, setFileURL] = useState("")
     const [loading, setLoading] = useState<any>(false)
     const [subCategoryOptions, setSubCategoryOptions] = useState([]);
     const [isSubCategoryEnabled, setIsSubCategoryEnabled] = useState(false);


     const handleFileRemove = () => {
          setFileURL(""); // Remove the selected file
     };

     const handleSubmit = async (values: any) => {

          try {
               const responseValues: any = await fetch('/api/project-api', {
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
                    initialValues={initialValues}
                    onSubmit={(values) => {
                         handleSubmit(values)
                    }}
                    validationSchema={newProjectSchema()}>
                    {
                         (formik) => (
                              <Form style={{ display: 'flex', flexDirection: 'column', gap: '15px', opacity: loading ? .5 : 1, }}>
                                   {/* <Typography>
                                        {`${ JSON.stringify(formik.errors) }`}
                                   </Typography> */}
                                   <TextField
                                        label="Naziv"
                                        name="name"
                                        value={formik.values.name}
                                        disabled={loading}
                                        onChange={formik.handleChange}
                                        error={formik.touched.name && !!formik.errors.name}
                                        helperText={formik.touched.name && formik.errors.name}
                                   />
                                   <TextField
                                        label="Opis"
                                        name="description"
                                        multiline
                                        disabled={loading}
                                        rows={4}
                                        value={formik.values.description}
                                        onChange={formik.handleChange}
                                        error={formik.touched.description && !!formik.errors.description}
                                        helperText={formik.touched.description && formik.errors.description}
                                   />

                                   {/* <TextField
                                        fullWidth
                                        label="Glavna kategorija"
                                        name="mainCategory"
                                        onBlur={formik.handleBlur}
                                        disabled={loading}
                                        onChange={formik.handleChange}
                                        select
                                        error={formik.touched.mainCategory && !!formik.errors.mainCategory}
                                        helperText={formik.touched.mainCategory && formik.errors.mainCategory}
                                        value={formik.values.mainCategory}
                                   >
                                        {mainCategoryOptions.map((option: any) => (
                                             <MenuItem
                                                  key={option.value}
                                                  value={option.value}
                                             >
                                                  {option.label}
                                             </MenuItem>
                                        ))}
                                   </TextField> */}

                                   <TextField
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
                                   </TextField>

                                   <TextField
                                        label="Na stanju komada"
                                        name="availableStock"
                                        value={formik.values.availableStock}
                                        disabled={loading}
                                        onChange={formik.handleChange}
                                        error={formik.touched.availableStock && !!formik.errors.availableStock}
                                        helperText={formik.touched.availableStock && formik.errors.availableStock}
                                   />

                                   <TextField
                                        label="Sastojci"
                                        name="ingredients"
                                        value={formik.values.ingredients}
                                        onChange={formik.handleChange}
                                        disabled={loading}
                                        error={formik.touched.ingredients && !!formik.errors.ingredients}
                                        helperText={formik.touched.ingredients && formik.errors.ingredients}
                                   />

                                   <TextField
                                        label="Instrukcije"
                                        name="instructions"
                                        disabled={loading}
                                        value={formik.values.instructions}
                                        onChange={formik.handleChange}
                                        error={formik.touched.instructions && !!formik.errors.instructions}
                                        helperText={formik.touched.instructions && formik.errors.instructions}
                                   />

                                   <TextField
                                        label="Kolicina"
                                        name="quantity"
                                        disabled={loading}
                                        value={formik.values.quantity}
                                        onChange={formik.handleChange}
                                        error={formik.touched.quantity && !!formik.errors.quantity}
                                        helperText={formik.touched.quantity && formik.errors.quantity}
                                   />

                                   <TextField
                                        label="Upozorenje"
                                        name="warning"
                                        disabled={loading}
                                        value={formik.values.warning}
                                        onChange={formik.handleChange}
                                        error={formik.touched.warning && !!formik.errors.warning}
                                        helperText={formik.touched.warning && formik.errors.warning}
                                   />

                                   <Card>
                                        <CardContent sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', ":disabled": loading }}>
                                             <UploadButton
                                                  endpoint="imageUploader"
                                                  onUploadBegin={() => setLoading(true)}
                                                  onClientUploadComplete={(res) => {
                                                       setFileURL(res[0].url)
                                                       formik.setFieldValue("imageURL", res[0].url)
                                                       alert('Slika je uspešno poslata na server!')
                                                       // Swal.fire({
                                                       //      icon: 'success',
                                                       //      title: 'Jeeej',
                                                       //      text: 'Slika je uspešno poslata na server!',
                                                       // })
                                                       setLoading(false)
                                                  }}
                                                  onUploadError={(error) => {
                                                       Swal.fire({
                                                            icon: 'success',
                                                            title: 'Noooo',
                                                            text: 'Nešto je pošlo po zlu :(',
                                                       })
                                                       console.log(error);
                                                  }}
                                                  content={{
                                                       button({ ready }: any) {
                                                            if (ready) return <Button sx={{ color: theme.palette.divider }}>Pronadji sliku...</Button>;
                                                            return "Getting ready...";
                                                       },
                                                       allowedContent({ ready, fileTypes }) {
                                                            if (!ready) return "Checking what you allow";
                                                            if (loading) return "Seems like stuff is uploading";
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
                                             {fileURL.length ? (
                                                  <Image
                                                       src={fileURL}
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
                                             )}
                                             <UploadButton
                                                  endpoint="imageUploader"
                                                  onUploadBegin={() => setLoading(true)}
                                                  onClientUploadComplete={(res) => {
                                                       setFileURL(res[0].url)
                                                       formik.setFieldValue("imageURL", res[0].url)
                                                       alert('Slika je uspešno poslata na server!')
                                                       // Swal.fire({
                                                       //      icon: 'success',
                                                       //      title: 'Jeeej',
                                                       //      text: 'Slika je uspešno poslata na server!',
                                                       // })
                                                       setLoading(false)
                                                  }}
                                                  onUploadError={(error) => {
                                                       Swal.fire({
                                                            icon: 'success',
                                                            title: 'Noooo',
                                                            text: 'Nešto je pošlo po zlu :(',
                                                       })
                                                       console.log(error);
                                                  }}
                                                  content={{
                                                       button({ ready }: any) {
                                                            if (ready) return <Button sx={{ color: theme.palette.divider }}>Pronadji sliku...</Button>;
                                                            return "Getting ready...";
                                                       },
                                                       allowedContent({ ready, fileTypes }) {
                                                            if (!ready) return "Checking what you allow";
                                                            if (loading) return "Seems like stuff is uploading";
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
                                             {fileURL.length ? (
                                                  <Image
                                                       src={fileURL}
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
                                             )}
                                        </CardContent>
                                   </Card>
                                   <TextField
                                        label="Cena"
                                        name="price"
                                        value={formik.values.price}
                                        onChange={formik.handleChange}
                                        error={formik.touched.price && !!formik.errors.price}
                                        helperText={formik.touched.price && formik.errors.price}
                                   />

                                   <FormControlLabel
                                        control={
                                             <Checkbox
                                                  name="newArrival"
                                                  checked={formik.values.newArrival}
                                                  onChange={formik.handleChange}
                                             />
                                        }
                                        disabled={loading}
                                        label="Novi proizvod"
                                   />

                                   <FormControlLabel
                                        control={
                                             <Checkbox
                                                  name="bestSeller"
                                                  checked={formik.values.bestSeller}
                                                  onChange={formik.handleChange}
                                             />
                                        }
                                        disabled={loading}
                                        label="Najprodavaniji"
                                   />

                                   <FormControlLabel
                                        control={
                                             <Checkbox
                                                  name="discount"
                                                  checked={formik.values.discount}
                                                  onChange={formik.handleChange}
                                             />
                                        }
                                        disabled={loading}
                                        label="Popust"
                                   />

                                   <TextField
                                        label="Iznos popusta"
                                        name="discountAmount"
                                        value={formik.values.discountAmount}
                                        onChange={formik.handleChange}
                                        disabled={loading}
                                   />

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