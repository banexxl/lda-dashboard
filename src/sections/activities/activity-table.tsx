import ChevronRightIcon from '@untitled-ui/icons-react/build/esm/ChevronRight';
import ChevronDownIcon from '@untitled-ui/icons-react/build/esm/ChevronDown';
import {
     Avatar, Box, Button, Card, Divider, Grid, IconButton, ImageList, ImageListItem, Input, MenuItem,
     Stack, SvgIcon, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography, useTheme
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import AddBoxIcon from '@mui/icons-material/AddBox';
import { Fragment, useState } from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';
import "@uploadthing/react/styles.css";
import dayjs from 'dayjs';
import { Activity, ActivityCategory, activityCategoryProps, activityStatusProps, ActivityStatusProps, initialActivity } from './activity-type';
import { DateField } from '@mui/x-date-pickers/DateField';
import moment from 'moment';
import { sanitizeString } from '@/utils/url-creator';
import { set } from 'nprogress';

export type ArrayKeys = keyof Pick<Activity,
     'activityURL' | 'author' | 'category' | 'coverURL' | 'descriptions' | 'favorited' | 'favoritedNumber' |
     'gallery' | 'links' | 'list' | 'listTitle' | 'publishedDate' | 'status' | 'title'
>;

type ActivityLocale = {
     value: string;
     name: string;
}

const locales = [{ value: 'en', name: 'Engleski' }, { value: 'sr', name: 'Srpski' }]

export const ActivityTable = ({ items }: any) => {

     const [currentActivityID, setCurrentActivityID] = useState(null);
     const [currentActivityObject, setCurrentActivityObject] = useState<Activity | null | undefined>(initialActivity);
     const router = useRouter();
     const theme = useTheme()
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

     const handleActivityToggle = (ActivityId: any) => {
          setCurrentActivityID((prevActivityId: any) => {
               if (prevActivityId === ActivityId) {
                    setCurrentActivityObject(null)
                    return null;
               }
               setCurrentActivityObject(getObjectById(ActivityId, items))
               return ActivityId;
          });
     }

     const handleActivityClose = () => {
          setCurrentActivityID(null);
     }

     const handleActivityUpdateClick = () => {
          Swal.fire({
               title: 'Da li ste sigurni?',
               text: "Možete izmeniti pojekat u svakom momentu...",
               icon: 'warning',
               showCancelButton: true,
               confirmButtonColor: '#3085d6',
               cancelButtonColor: '#d33',
               confirmButtonText: 'Da, izmeni!',
               cancelButtonText: 'Odustani!'
          }).then((result) => {
               if (result.isConfirmed) {
                    handleUpdateActivity(currentActivityObject)
               } else {
                    handleActivityClose()
               }
          })
     }

     const handleUpdateActivity = async (currentActivityObject: any) => {
          setLoading(true)
          try {
               //API CALL
               const response = await fetch('/api/activities-api', {
                    method: 'PUT',
                    headers: {
                         'Content-Type': 'application/json',
                         'Access-Control-Allow-Origin': 'https://lda-dashboard.vercel.app/api/activity-api, http://localhost:3000/api/activity-api',
                         'Access-Control-Allow-Methods': 'PUT' // Set the content type to JSON
                    },
                    body: JSON.stringify(currentActivityObject)
               });

               if (response.ok) {
                    handleActivityClose()
                    setCurrentActivityObject(null)
                    Swal.fire({
                         icon: 'success',
                         title: 'Sve OK!',
                         text: 'Aktivnost izmenjena :)',
                    })
                    router.refresh()
               } else {
                    Swal.fire({
                         icon: 'error',
                         title: 'Update nije prosao!',
                         text: 'Aktivnost nije izmenjena :(',
                         didClose() {
                              handleActivityClose()
                         }
                    })
                    const errorData = await response.json()
                    console.log(errorData);
               }

          } catch (err) {
               alert(err);
          }
     }

     const handleDeleteButtonClick = () => {
          Swal.fire({
               title: 'Da li ste sigurni?',
               text: "Ako želite da obrišete i slike iz baze, prvo ih obrišite iz projekta!",
               icon: 'warning',
               showCancelButton: true,
               confirmButtonColor: '#3085d6',
               cancelButtonColor: '#d33',
               confirmButtonText: 'Da, obriši aktivnost, a ostavi slike u bazi!',
               cancelButtonText: 'Ne!'
          }).then((result) => {
               if (result.isConfirmed) {
                    handleDeleteActivity()
               }
          })
     }

     const handleDeleteActivity = async () => {

          try {
               const response = await fetch('/api/activities-api', {
                    method: 'DELETE',
                    headers: {
                         'Content-Type': 'application/json',
                         'Access-Control-Allow-Origin': 'https://lda-dashboard.vercel.app/, http://localhost:3000/api/activity-api',
                         'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS' // Set the content type to JSON
                    },
                    body: JSON.stringify(currentActivityID), // Convert your data to JSON
               })

               if (response.ok) {
                    Swal.fire({
                         icon: 'success',
                         title: 'Sve OK!',
                         text: 'Aktivnost obrisan!',
                    })
                    router.refresh()
               } else {
                    console.log(await response.json())
               }

          } catch (err) {
               alert(err);
          }
     }

     // const handleAddToActivityObjectArray = (arrayName: ArrayKeys, newArray: string[]) => {
     //      setCurrentActivityObject(prevActivity => {
     //           if (!prevActivity) {
     //                console.error('Activity object is null.');
     //                return null;
     //           }

     //           const updatedActivity: Activity = { ...prevActivity };
     //           updatedActivity[arrayName] = newArray;
     //           return updatedActivity;
     //      });
     // };

     const onAddNewList = (index: number, text: string) => {
          setCurrentActivityObject((prevActivity: Activity | null | undefined) => {
               if (prevActivity) {
                    const newList = [...prevActivity.list];
                    newList[index] = text; // Update the subtitle at the clicked index
                    return {
                         ...prevActivity,
                         list: newList,
                    };
               }
               return prevActivity;
          });
     };

     const onDeleteList = (index: number) => {
          setCurrentActivityObject((prevActivity: Activity | null | undefined) => {
               if (prevActivity) {
                    const newList = [...prevActivity.list];
                    newList.splice(index, 1); // Remove the subtitle at the specified index
                    return {
                         ...prevActivity,
                         list: newList,
                    };
               }
               return prevActivity;
          });
     };

     const onAddNewDescription = (index: number, text: string) => {
          setCurrentActivityObject((prevActivity: Activity | null | undefined) => {
               if (prevActivity) {
                    const newDescriptions = [...prevActivity.descriptions];
                    newDescriptions[index] = text; // Update the subtitle at the clicked index
                    return {
                         ...prevActivity,
                         descriptions: newDescriptions,
                    };
               }
               return prevActivity;
          });
     };

     const onDeleteDescription = (index: number) => {
          setCurrentActivityObject((prevActivity: Activity | null | undefined) => {
               if (prevActivity) {
                    const newDescription = [...prevActivity.descriptions];
                    newDescription.splice(index, 1); // Remove the subtitle at the specified index
                    return {
                         ...prevActivity,
                         descriptions: newDescription,
                    };
               }
               return prevActivity;
          });
     };

     const onAddNewLink = (index: number, text: string) => {
          setCurrentActivityObject((prevActivity: Activity | null | undefined) => {
               if (prevActivity) {
                    const newLinks = [...prevActivity.links];
                    newLinks[index] = text; // Update the subtitle at the clicked index
                    return {
                         ...prevActivity,
                         links: newLinks,
                    };
               }
               return prevActivity;
          });
     };

     const onDeleteLink = (index: number) => {
          setCurrentActivityObject((prevActivity: Activity | null | undefined) => {
               if (prevActivity) {
                    const newLinks = [...prevActivity.links];
                    newLinks.splice(index, 1); // Remove the subtitle at the specified index
                    return {
                         ...prevActivity,
                         links: newLinks,
                    };
               }
               return prevActivity;
          });
     };

     const onAddNewGalleryImage = (imageURL: string) => {
          setCurrentActivityObject((prevProject: Activity | null | undefined) => {
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

     const onAddNewCoverImage = (imageURL: string) => {
          setCurrentActivityObject((prevProject: Activity | null | undefined) => {
               if (prevProject) {
                    return {
                         ...prevProject,
                         coverURL: imageURL
                    };
               }
               return prevProject;
          });
     }

     const onDeleteGalleryImage = async (imageURL: any) => {

          const url = imageURL.target.currentSrc.split('?')[0]

          if (!imageURL) {
               return;
          }

          setLoading(true);
          //use process env
          const apiUrl = '/api/aws-s3';

          try {
               const response = await fetch(apiUrl, {
                    method: 'DELETE',
                    headers: {
                         'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(imageURL.target.currentSrc)
               });

               if (!response.ok) {
                    Swal.fire({
                         title: 'Greška, neuspešno brisanje slike!',
                         text: "Ako niste uploadovali novu sliku, ne možete je ni obrisati!",
                         icon: 'error',
                         confirmButtonColor: '#3085d6',
                         confirmButtonText: 'OK',
                         // didClose() {
                         //      handleProjectClose()
                         // }
                    })
               } else {
                    setCurrentActivityObject((prevProject: Activity | null | undefined) => {
                         if (prevProject) {
                              const newGallery: string[] = prevProject.gallery.filter((image: string) => image !== url); // Remove the specified imageURL from the array
                              return {
                                   ...prevProject,
                                   gallery: newGallery,
                              };
                         }
                         return prevProject;
                    })
                    Swal.fire({
                         title: 'OK',
                         text: "Uspešno brisanje slike! Potrebno je sad da se uradi izmena projekta!",
                         icon: 'success',
                         confirmButtonColor: '#3085d6',
                         confirmButtonText: 'OK',
                    })

               }

          } catch (error) {
               console.error('Error uploading image:', error);
          } finally {
               setLoading(false);
          }
     }

     const onDeleteCoverImage = async (imageURL: any) => {
          const url = imageURL.target.currentSrc.split('?')[0]

          if (!imageURL) {
               return;
          }

          setLoading(true);

          const apiUrl = '/api/aws-s3';

          try {
               const response = await fetch(apiUrl, {
                    method: 'DELETE',
                    headers: {
                         'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(imageURL.target.currentSrc)
               });

               if (!response.ok) {
                    Swal.fire({
                         title: 'Greška, neuspešno brisanje slike!',
                         text: "Ako niste uploadovali novu sliku, ne možete je ni obrisati!",
                         icon: 'error',
                         confirmButtonColor: '#3085d6',
                         confirmButtonText: 'OK',
                         // didClose() {
                         //      handleProjectClose()
                         // }
                    })
               } else {
                    setCurrentActivityObject((prevProject: Activity | null | undefined) => {
                         if (prevProject) {
                              return {
                                   ...prevProject,
                                   coverURL: ''
                              };
                         }
                         return prevProject;
                    })
                    Swal.fire({
                         title: 'OK',
                         text: "Uspešno brisanje slike! Potrebno je sad da se uradi izmena projekta!",
                         icon: 'success',
                         confirmButtonColor: '#3085d6',
                         confirmButtonText: 'OK',
                    })

               }

          } catch (error) {
               console.error('Error uploading image:', error);
          } finally {
               setLoading(false);
          }
     }

     const handleGalleryChange = async (event: any) => {
          const selectedFiles = event.target.files;

          if (!selectedFiles || selectedFiles.length === 0) {
               return;
          }

          setLoading(true);

          // Assuming you have a title for the images
          const title = currentActivityObject?.title!;

          const apiUrl = '/api/aws-s3';

          try {
               for (const file of selectedFiles) {
                    // Extract file extension
                    const fileExtension = file.name.split('.').pop();

                    const reader = new FileReader();
                    reader.readAsDataURL(file);

                    // Wrap the file reader in a Promise
                    const base64Data: string = await new Promise((resolve, reject) => {
                         reader.onloadend = () => resolve(reader.result as string);
                         reader.onerror = (error) => reject(error);
                    });

                    const data = {
                         file: base64Data,
                         title: title,
                         extension: fileExtension,
                         fileName: file.name
                    };

                    const response = await fetch(apiUrl, {
                         method: 'POST',
                         headers: {
                              'Content-Type': 'application/json',
                         },
                         body: JSON.stringify(data),
                    });

                    if (!response.ok) {
                         Swal.fire({
                              title: 'Greška',
                              text: `Neuspešan upload slike za ${file.name}!`,
                              icon: 'error',
                              confirmButtonColor: '#3085d6',
                              confirmButtonText: 'OK',
                         });
                    } else {
                         const result = await response.json();
                         const imageUrl = result.imageUrl;
                         onAddNewGalleryImage(imageUrl);
                    }
               }

               Swal.fire({
                    title: 'OK',
                    text: 'Sve slike su uspešno uploadovane!',
                    icon: 'success',
                    confirmButtonColor: '#3085d6',
                    confirmButtonText: 'OK',
               });
          } catch (error) {
               console.error('Error uploading images:', error);
               Swal.fire({
                    title: 'Greška',
                    text: 'Došlo je do greške tokom upload-a!',
                    icon: 'error',
                    confirmButtonColor: '#3085d6',
                    confirmButtonText: 'OK',
               });
          } finally {
               setLoading(false);
          }
     };


     const handleCoverChange = async (event: any) => {

          const selectedFile = event.target.files[0];

          if (!selectedFile) {
               return;
          }

          setLoading(true);

          // Extract file extension
          const fileExtension = selectedFile.name.split('.')[1]

          // Assuming you have a title for the image
          const title = currentActivityObject?.title!

          const apiUrl = '/api/aws-s3';

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
                         Swal.fire({
                              title: 'Greška',
                              text: "Neuspešan upload slike!",
                              icon: 'error',
                              confirmButtonColor: '#3085d6',
                              confirmButtonText: 'OK',
                         })
                    } else {
                         Swal.fire({
                              title: 'OK',
                              text: "Uspešan upload slike!",
                              icon: 'success',
                              confirmButtonColor: '#3085d6',
                              confirmButtonText: 'OK',
                         })
                         const result = await response.json();
                         const imageUrl = result.imageUrl;
                         onAddNewCoverImage(imageUrl);
                    }
               }
          } catch (error) {
               console.error('Error uploading image:', error);
          } finally {
               setLoading(false);
          }
     };

     const onGalleryImageClick = (imageURL: any) => {

          Swal.fire({
               title: 'Da li ste sigurni da želite da obrišete sliku?',
               text: "Možete obrisati samo sliku koju ste uploadovali!",
               icon: 'warning',
               showCancelButton: true,
               confirmButtonColor: '#3085d6',
               cancelButtonColor: '#d33',
               confirmButtonText: 'Da, obriši!',
               cancelButtonText: 'Odustani!'
          }).then((result) => {
               if (result.isConfirmed) {
                    onDeleteGalleryImage(imageURL)
               } else {
                    // handleProjectClose()
               }
          })
     }

     const onCoverImageClick = (imageURL: any) => {

          Swal.fire({
               title: 'Da li ste sigurni da želite da obrišete sliku?',
               text: "Možete obrisati samo sliku koju ste uploadovali!",
               icon: 'warning',
               showCancelButton: true,
               confirmButtonColor: '#3085d6',
               cancelButtonColor: '#d33',
               confirmButtonText: 'Da, obriši!',
               cancelButtonText: 'Odustani!'
          }).then((result) => {
               if (result.isConfirmed) {
                    onDeleteCoverImage(imageURL)
               } else {
                    // handleProjectClose()
               }
          })
     }

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
                                             Aktivnost
                                        </TableCell>

                                   </TableRow>
                              </TableHead>
                              <TableBody>
                                   {
                                        items.length > 0 ?
                                             items.map((activity: Activity) => {
                                                  //const isSelected = selected.includes(activity._id);
                                                  const isCurrent = activity._id === currentActivityID;

                                                  return (
                                                       <Fragment key={Math.floor(Math.random() * 1000000)}>
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
                                                                                     width: 3,
                                                                                     height: 'calc(100% + 1px)',
                                                                                },
                                                                           }),
                                                                      }}
                                                                      width="25%"
                                                                 >
                                                                      <IconButton onClick={() => handleActivityToggle(activity._id)}>
                                                                           <SvgIcon >{isCurrent ? <ChevronDownIcon /> : <ChevronRightIcon />}</SvgIcon >
                                                                      </IconButton>
                                                                 </TableCell>

                                                                 <TableCell >
                                                                      <Typography>{activity.title}</Typography>
                                                                 </TableCell>
                                                            </TableRow>
                                                            {
                                                                 isCurrent && (
                                                                      <TableRow key={Math.floor(Math.random() * 1000000)}>
                                                                           <TableCell
                                                                                colSpan={7}
                                                                                sx={{
                                                                                     margin: '20px',
                                                                                     p: 0,
                                                                                     position: 'relative',
                                                                                     '&:after': {
                                                                                          position: 'absolute',
                                                                                          content: '" "',
                                                                                          top: 0,
                                                                                          left: 0,
                                                                                          width: 3,
                                                                                          height: 'calc(100% + 1px)',

                                                                                     },
                                                                                }}
                                                                           >
                                                                                <Divider sx={{ borderBottomWidth: 5, borderColor: theme.palette.primary.main }} />
                                                                                {/* -------------------------------Title-------------------------- */}
                                                                                <Grid
                                                                                     item
                                                                                     md={6}
                                                                                     xs={12}
                                                                                >
                                                                                     <TextField
                                                                                          defaultValue={activity.title}
                                                                                          fullWidth
                                                                                          label="Naziv projekta"
                                                                                          name="name"
                                                                                          disabled={loading}
                                                                                          onBlur={(e: any) =>
                                                                                               setCurrentActivityObject((previousObject: any) => ({
                                                                                                    ...previousObject,
                                                                                                    title: e.target.value,
                                                                                                    activityURL: sanitizeString(e.target.value)
                                                                                               }))
                                                                                          }
                                                                                     />
                                                                                </Grid>
                                                                                {/* -------------------------------Activity url-------------------------- */}
                                                                                <Grid
                                                                                     item
                                                                                     md={6}
                                                                                     xs={12}
                                                                                >
                                                                                     <TextField
                                                                                          defaultValue={activity.activityURL}
                                                                                          fullWidth
                                                                                          disabled
                                                                                          label="URL aktivnosti"
                                                                                          name="activityURL"
                                                                                     />
                                                                                </Grid>
                                                                                {/* -------------------------------Published-------------------------- */}
                                                                                <Grid
                                                                                     item
                                                                                     md={6}
                                                                                     xs={12}
                                                                                >
                                                                                     <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                                                          <DateField

                                                                                               format='MM/DD/YYYY'
                                                                                               InputLabelProps={{ shrink: true }}
                                                                                               fullWidth
                                                                                               disabled={loading}
                                                                                               label={`Datum objave aktivnosti`}
                                                                                               defaultValue={dayjs(currentActivityObject?.publishedDate)}
                                                                                               onBlur={(newValue: any) => {
                                                                                                    const date = moment(newValue.target.value).format('MM/DD/YYYY');
                                                                                                    setCurrentActivityObject((previousObject: any) => ({
                                                                                                         ...previousObject,
                                                                                                         publishedDate: date
                                                                                                    }))
                                                                                               }}
                                                                                          />
                                                                                     </LocalizationProvider>
                                                                                </Grid>
                                                                                {/* -------------------------------Locale-------------------------- */}
                                                                                <Grid
                                                                                     item
                                                                                     md={6}
                                                                                     xs={12}
                                                                                >
                                                                                     <TextField
                                                                                          defaultValue={activity.locale}
                                                                                          fullWidth
                                                                                          label="Jezik projekta"
                                                                                          select
                                                                                          disabled
                                                                                          onBlur={(e: any) =>
                                                                                               setCurrentActivityObject((previousObject: any) => ({
                                                                                                    ...previousObject,
                                                                                                    locale: e.target.value
                                                                                               }))
                                                                                          }
                                                                                     >
                                                                                          {locales.map((option: ActivityLocale) => (
                                                                                               <MenuItem
                                                                                                    key={Math.floor(Math.random() * 1000000)}
                                                                                                    value={option.value}
                                                                                               >
                                                                                                    {option.name}
                                                                                               </MenuItem>
                                                                                          ))}
                                                                                     </TextField>
                                                                                </Grid>
                                                                                {/* -------------------------------Status-------------------------- */}
                                                                                <Grid
                                                                                     item
                                                                                     md={6}
                                                                                     xs={12}
                                                                                >
                                                                                     <TextField
                                                                                          defaultValue={currentActivityObject?.status}
                                                                                          fullWidth
                                                                                          label="Status projekta"
                                                                                          select
                                                                                          disabled={loading}
                                                                                          onBlur={(e: any) =>
                                                                                               setCurrentActivityObject((previousObject: any) => ({
                                                                                                    ...previousObject,
                                                                                                    status: e.target.value
                                                                                               }))
                                                                                          }
                                                                                     >
                                                                                          {activityStatusProps.map((option: ActivityStatusProps) => (
                                                                                               <MenuItem
                                                                                                    key={Math.floor(Math.random() * 1000000)}
                                                                                                    value={option}
                                                                                               >
                                                                                                    {
                                                                                                         option == 'completed' ? 'Završen' :
                                                                                                              option == 'in-progress' ? 'U toku' :
                                                                                                                   option == 'to-do' ? 'Planiran' : ''
                                                                                                    }
                                                                                               </MenuItem>
                                                                                          ))}
                                                                                     </TextField>
                                                                                </Grid>
                                                                                {/* -------------------------------Category-------------------------- */}
                                                                                <Grid
                                                                                     item
                                                                                     md={6}
                                                                                     xs={12}
                                                                                >
                                                                                     <TextField
                                                                                          defaultValue={currentActivityObject?.category}
                                                                                          fullWidth
                                                                                          label="Kategorija aktivnosti"
                                                                                          select
                                                                                          disabled={loading}
                                                                                          onBlur={(e: any) =>
                                                                                               setCurrentActivityObject((previousObject: any) => ({
                                                                                                    ...previousObject,
                                                                                                    category: e.target.value
                                                                                               }))
                                                                                          }
                                                                                     >
                                                                                          {activityCategoryProps.map((option: ActivityCategory) => (
                                                                                               <MenuItem
                                                                                                    key={Math.floor(Math.random() * 1000000)}
                                                                                                    value={option}
                                                                                               >
                                                                                                    {
                                                                                                         option == 'other' ? 'Ostalo' :
                                                                                                              option == 'eu-integrations' ? 'EU integracije' :
                                                                                                                   option == 'intercultural-dialogue' ? 'Interkulturalni dijalog' :
                                                                                                                        option == 'migrations' ? 'Migracije' :
                                                                                                                             option == 'youth' ? 'Mladi' :
                                                                                                                                  option == 'culture' ? 'Kultura' :
                                                                                                                                       option == 'economy' ? 'Ekonomija' :
                                                                                                                                            option == 'democracy' ? 'Demokratija' : ''
                                                                                                    }
                                                                                               </MenuItem>
                                                                                          ))}
                                                                                     </TextField>
                                                                                </Grid>
                                                                                {/* -------------------------------Author-------------------------- */}
                                                                                <Grid
                                                                                     item
                                                                                     md={6}
                                                                                     xs={12}
                                                                                >
                                                                                     <TextField
                                                                                          defaultValue={activity.author}
                                                                                          fullWidth
                                                                                          label={`Autor`}
                                                                                          name="author"
                                                                                          disabled={loading}
                                                                                          onBlur={(e: any) =>
                                                                                               setCurrentActivityObject((previousObject: any) => ({
                                                                                                    ...previousObject,
                                                                                                    author: e.target.value
                                                                                               }))
                                                                                          }
                                                                                     />
                                                                                </Grid>

                                                                                <Divider sx={{ borderBottomWidth: 5, borderColor: theme.palette.primary.main }} />
                                                                                {/* -------------------------------Cover url-------------------------- */}
                                                                                <Grid
                                                                                     item
                                                                                     md={6}
                                                                                     xs={12}
                                                                                >
                                                                                     <Typography sx={{ margin: '10px' }}>Glavna slika aktivnosti:</Typography>
                                                                                     <Box sx={{ display: 'flex', flexDirection: 'column', paddingLeft: '30px', marginBottom: '30px' }}>
                                                                                          {/* -------------------------slike------------------------------------------ */}
                                                                                          {
                                                                                               currentActivityObject?.coverURL && (
                                                                                                    <ImageListItem key={Math.floor(Math.random() * 1000000)} sx={{ width: '200px', height: '300px', paddingBottom: '10px' }}>
                                                                                                         <img
                                                                                                              // srcSet={`${item.img}?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}
                                                                                                              src={`${currentActivityObject?.coverURL}?w=164&h=164&fit=crop&auto=format`}
                                                                                                              alt={'image'}
                                                                                                              loading="lazy"
                                                                                                              onClick={(e: any) => onCoverImageClick(e)}
                                                                                                         />
                                                                                                    </ImageListItem>
                                                                                               )
                                                                                          }

                                                                                          <Button component="label"
                                                                                               variant="contained"
                                                                                               startIcon={<CloudUploadIcon />}
                                                                                               sx={{ maxWidth: '150px' }}
                                                                                          >
                                                                                               Učitaj sliku
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
                                                                                                    onChange={async (e: any) => await handleCoverChange(e)}
                                                                                               />
                                                                                          </Button>

                                                                                     </Box>
                                                                                </Grid>
                                                                                <Divider sx={{ borderBottomWidth: 5, borderColor: theme.palette.primary.main }} />

                                                                                {/* -------------------------------Links-------------------------- */}
                                                                                <Grid
                                                                                     item
                                                                                     md={6}
                                                                                     xs={12}
                                                                                >
                                                                                     <Typography sx={{ margin: '10px' }}>Linkovi za posetu:</Typography>
                                                                                     {
                                                                                          currentActivityObject?.links.length == 0 &&
                                                                                          <Box>
                                                                                               <IconButton onClick={() => onAddNewLink(0, '')}>
                                                                                                    <AddBoxIcon />
                                                                                               </IconButton>
                                                                                               <IconButton onClick={() => onDeleteLink(0)}>
                                                                                                    <DeleteIcon />
                                                                                               </IconButton>
                                                                                          </Box>
                                                                                     }

                                                                                     {
                                                                                          currentActivityObject?.links.length != 0 &&
                                                                                          currentActivityObject?.links?.map((subtitle: any, index: any) =>
                                                                                               <Box key={Math.floor(Math.random() * 1000000)} sx={{ display: 'flex', width: '80%' }}>
                                                                                                    <TextField
                                                                                                         defaultValue={currentActivityObject.links[index]}
                                                                                                         fullWidth
                                                                                                         label={`Link ${index + 1}`}
                                                                                                         disabled={loading}
                                                                                                         // name={activity.description}
                                                                                                         onBlur={(e: any) => {
                                                                                                              setCurrentActivityObject((prevActivity: Activity | null | undefined) => {
                                                                                                                   if (prevActivity) {
                                                                                                                        const newLinks = [...prevActivity.links];
                                                                                                                        newLinks[index] = e.target.value; // Update the subtitle at the clicked index
                                                                                                                        return {
                                                                                                                             ...prevActivity,
                                                                                                                             links: newLinks,
                                                                                                                        };
                                                                                                                   }
                                                                                                                   return prevActivity;
                                                                                                              });
                                                                                                         }}
                                                                                                    />
                                                                                                    <IconButton onClick={() => onAddNewLink(index + 1, '')}>
                                                                                                         <AddBoxIcon />
                                                                                                    </IconButton>
                                                                                                    <IconButton onClick={() => onDeleteLink(index)}>
                                                                                                         <DeleteIcon />
                                                                                                    </IconButton>
                                                                                               </Box>
                                                                                          )
                                                                                     }

                                                                                </Grid>
                                                                                <Divider sx={{ borderBottomWidth: 5, borderColor: theme.palette.primary.main }} />
                                                                                {/* -------------------------------List Title-------------------------- */}
                                                                                <Grid
                                                                                     item
                                                                                     md={6}
                                                                                     xs={12}
                                                                                >
                                                                                     <TextField
                                                                                          defaultValue={activity.listTitle}
                                                                                          fullWidth
                                                                                          label={`Opis liste`}
                                                                                          name="listTitle"
                                                                                          disabled={loading}
                                                                                          onBlur={(e: any) =>
                                                                                               setCurrentActivityObject((previousObject: any) => ({
                                                                                                    ...previousObject,
                                                                                                    listTitle: e.target.value
                                                                                               }))
                                                                                          }
                                                                                     />
                                                                                </Grid>
                                                                                {/* -------------------------------List-------------------------- */}
                                                                                <Grid
                                                                                     item
                                                                                     md={6}
                                                                                     xs={12}
                                                                                >
                                                                                     <Typography sx={{ margin: '10px' }}>Lista:</Typography>
                                                                                     {
                                                                                          currentActivityObject?.list.length == 0 &&
                                                                                          <Box>
                                                                                               <IconButton onClick={() => onAddNewList(0, '')}>
                                                                                                    <AddBoxIcon />
                                                                                               </IconButton>
                                                                                               <IconButton onClick={() => onDeleteList(0)}>
                                                                                                    <DeleteIcon />
                                                                                               </IconButton>
                                                                                          </Box>
                                                                                     }

                                                                                     {
                                                                                          currentActivityObject?.list.length != 0 &&
                                                                                          currentActivityObject?.list?.map((subtitle: any, index: any) =>
                                                                                               <Box key={Math.floor(Math.random() * 1000000)} sx={{ display: 'flex', width: '80%' }}>
                                                                                                    <TextField
                                                                                                         defaultValue={currentActivityObject.list[index]}
                                                                                                         fullWidth
                                                                                                         label={`List pasus ${index + 1}`}
                                                                                                         disabled={loading}
                                                                                                         // name={activity.description}
                                                                                                         onBlur={(e: any) => {
                                                                                                              setCurrentActivityObject((prevActivity: Activity | null | undefined) => {
                                                                                                                   if (prevActivity) {
                                                                                                                        const newList = [...prevActivity.list];
                                                                                                                        newList[index] = e.target.value; // Update the subtitle at the clicked index
                                                                                                                        return {
                                                                                                                             ...prevActivity,
                                                                                                                             list: newList,
                                                                                                                        };
                                                                                                                   }
                                                                                                                   return prevActivity;
                                                                                                              });
                                                                                                         }}
                                                                                                    />
                                                                                                    <IconButton onClick={() => onAddNewList(index + 1, '')}>
                                                                                                         <AddBoxIcon />
                                                                                                    </IconButton>
                                                                                                    <IconButton onClick={() => onDeleteList(index)}>
                                                                                                         <DeleteIcon />
                                                                                                    </IconButton>
                                                                                               </Box>
                                                                                          )
                                                                                     }

                                                                                </Grid>
                                                                                <Divider sx={{ borderBottomWidth: 5, borderColor: theme.palette.primary.main }} />

                                                                                {/* -------------------------------Opisi (pasusi)-------------------------- */}
                                                                                <Grid
                                                                                     item
                                                                                     md={6}
                                                                                     xs={12}
                                                                                >
                                                                                     <Typography sx={{ margin: '10px' }}>Opisi (pasusi):</Typography>
                                                                                     {
                                                                                          currentActivityObject?.descriptions.length == 0 &&
                                                                                          <Box>
                                                                                               <IconButton onClick={() => onAddNewDescription(0, '')}>
                                                                                                    <AddBoxIcon />
                                                                                               </IconButton>
                                                                                               <IconButton onClick={() => onDeleteDescription(0)}>
                                                                                                    <DeleteIcon />
                                                                                               </IconButton>
                                                                                          </Box>
                                                                                     }

                                                                                     {
                                                                                          currentActivityObject?.descriptions.map((description: any, index: any) =>
                                                                                               <Box key={Math.floor(Math.random() * 1000000)} sx={{ display: 'flex', width: '80%' }}>
                                                                                                    <TextField
                                                                                                         defaultValue={description}
                                                                                                         fullWidth
                                                                                                         label={`Opis ${index + 1}`}
                                                                                                         disabled={loading}
                                                                                                         // name={activity.description}
                                                                                                         onBlur={(e: any) =>
                                                                                                              setCurrentActivityObject((prevActivity: Activity | null | undefined) => {
                                                                                                                   if (prevActivity) {
                                                                                                                        const newDescriptions = [...prevActivity.descriptions];
                                                                                                                        newDescriptions[index] = e.target.value; // Update the subtitle at the clicked index
                                                                                                                        return {
                                                                                                                             ...prevActivity,
                                                                                                                             descriptions: newDescriptions,
                                                                                                                        };
                                                                                                                   }
                                                                                                                   return prevActivity;
                                                                                                              })
                                                                                                         }
                                                                                                    />
                                                                                                    <IconButton onClick={() => onAddNewDescription(index + 1, '')}>
                                                                                                         <AddBoxIcon />
                                                                                                    </IconButton>
                                                                                                    <IconButton onClick={() => onDeleteDescription(index)}>
                                                                                                         <DeleteIcon />
                                                                                                    </IconButton>

                                                                                               </Box>
                                                                                          )
                                                                                     }
                                                                                </Grid>
                                                                                {/* -------------------------------Gallery-------------------------- */}
                                                                                <Typography sx={{ margin: '10px' }}>Slike:</Typography>
                                                                                <Box sx={{ display: 'flex', flexDirection: 'column', paddingLeft: '30px', marginBottom: '30px', width: '100%' }}>
                                                                                     {/* -------------------------slike------------------------------------------ */}
                                                                                     {
                                                                                          currentActivityObject?.gallery && currentActivityObject.gallery.length > 0 && (
                                                                                               <ImageList sx={{ width: '90%', height: 450 }} cols={4} rowHeight={164}>
                                                                                                    {currentActivityObject.gallery.map((item: any) => (
                                                                                                         <ImageListItem key={Math.floor(Math.random() * 1000000)} sx={{ width: '200px', height: '300px' }}>
                                                                                                              <img
                                                                                                                   // srcSet={`${item.img}?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}
                                                                                                                   src={`${item}?w=164&h=164&fit=crop&auto=format`}
                                                                                                                   alt={'image'}
                                                                                                                   loading="lazy"
                                                                                                                   style={{ cursor: 'pointer', borderRadius: '10px' }}
                                                                                                                   onClick={(e: any) => onGalleryImageClick(e)}
                                                                                                              />
                                                                                                         </ImageListItem>
                                                                                                    ))}
                                                                                               </ImageList>
                                                                                          )
                                                                                     }

                                                                                     <Button
                                                                                          component="label"
                                                                                          variant="contained"
                                                                                          startIcon={<CloudUploadIcon />}
                                                                                          sx={{ maxWidth: '150px' }}
                                                                                     >
                                                                                          Učitaj slike
                                                                                          <Input
                                                                                               type="file"
                                                                                               inputProps={{ accept: 'image/*', multiple: true }}
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
                                                                                               onChange={handleGalleryChange}
                                                                                          />
                                                                                     </Button>


                                                                                </Box>
                                                                                {/* ------------------------------------------------------------------------ */}
                                                                                <Divider sx={{ borderBottomWidth: 5, borderColor: theme.palette.primary.main }} />
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
                                                                                               onClick={handleActivityUpdateClick}
                                                                                               type="submit"
                                                                                               variant="contained"
                                                                                               disabled={loading}
                                                                                          >
                                                                                               Izmeni
                                                                                          </Button>
                                                                                          <Button
                                                                                               color="inherit"
                                                                                               onClick={handleActivityClose}
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
                                                                                               Obriši aktivnost
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



// ActivitysTable.propTypes = {
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
