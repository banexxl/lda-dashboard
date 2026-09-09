'use client';

import { Box, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import { Publication } from './publication-type';

export const PublicationTable = ({ items }: { items: Publication[] }) => {
     const router = useRouter();

     return (
          <Box sx={{ overflowX: 'auto' }}>
               <Box sx={{ minWidth: 800 }}>
                    <Table>
                         <TableHead>
                              <TableRow>
                                   <TableCell>Naslov</TableCell>
                                   <TableCell>Slika</TableCell>
                                   <TableCell>Dokument</TableCell>
                                   <TableCell>Datum uploada</TableCell>
                              </TableRow>
                         </TableHead>
                         <TableBody>
                              {items.length > 0 ? items.map((publication) => (
                                   <TableRow
                                        hover
                                        key={publication.id}
                                        onClick={() => router.push(`/publications/${publication.id}`)}
                                        sx={{ cursor: 'pointer' }}
                                   >
                                        <TableCell>
                                             <Typography variant="subtitle2">{publication.publication_title}</Typography>
                                        </TableCell>
                                        <TableCell>
                                             {publication.publication_image_url && (
                                                  <Box component="img" src={publication.publication_image_url} alt={publication.publication_title} sx={{ maxWidth: 60, maxHeight: 60, borderRadius: 1 }} />
                                             )}
                                        </TableCell>
                                        <TableCell>
                                             {publication.publication_url && (
                                                  <a href={publication.publication_url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                                                       Otvori
                                                  </a>
                                             )}
                                        </TableCell>
                                        <TableCell>
                                             {publication.publication_uploaded_date_time && !isNaN(new Date(publication.publication_uploaded_date_time).getTime())
                                                  ? new Date(publication.publication_uploaded_date_time).toLocaleDateString()
                                                  : '-'}
                                        </TableCell>
                                   </TableRow>
                              )) : (
                                   <TableRow>
                                        <TableCell colSpan={4}>
                                             <Typography>Nema pronađenih publikacija.</Typography>
                                        </TableCell>
                                   </TableRow>
                              )}
                         </TableBody>
                    </Table>
               </Box>
          </Box>
     );
};
