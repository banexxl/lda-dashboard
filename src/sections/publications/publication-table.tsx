import { Box, Card, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { Scrollbar } from 'src/components/scrollbar';
import { Publication } from './publication-type';

export const PublicationTable = ({ items }: { items: Publication[] }) => {
     const router = useRouter();

     return (
          <Card>
               <Scrollbar>
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
                                             key={publication._id}
                                             onClick={() => router.push(`/publications/${publication._id}`)}
                                             sx={{ cursor: 'pointer' }}
                                        >
                                             <TableCell>
                                                  <Typography variant="subtitle2">{publication.publicationTitle}</Typography>
                                             </TableCell>
                                             <TableCell>
                                                  {publication.publicationImageURL && (
                                                       <Box component="img" src={publication.publicationImageURL} alt={publication.publicationTitle} sx={{ maxWidth: 60, maxHeight: 60, borderRadius: 1 }} />
                                                  )}
                                             </TableCell>
                                             <TableCell>
                                                  {publication.publicationURL && (
                                                       <a href={publication.publicationURL} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                                                            Otvori
                                                       </a>
                                                  )}
                                             </TableCell>
                                             <TableCell>
                                                  {publication.publicationUploadedDateTime && !isNaN(new Date(publication.publicationUploadedDateTime).getTime())
                                                       ? new Date(publication.publicationUploadedDateTime).toLocaleDateString()
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
               </Scrollbar>
          </Card>
     );
};
