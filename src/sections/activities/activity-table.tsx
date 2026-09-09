'use client';

import {
     Box, Card, Table, TableBody, TableCell, TableHead, TableRow, Typography
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { Scrollbar } from 'src/components/scrollbar';
import { SeverityPill } from 'src/components/severity-pill';
import { CATEGORY_LABELS, LEGACY_CATEGORY_LABELS } from '@/types/content-enums';
import { Activity, ActivityStatusProps } from './activity-type';

const statusLabels: Record<ActivityStatusProps, string> = {
     'completed': 'Završen',
     'in-progress': 'U toku',
     'to-do': 'Planiran',
}

const statusColors: Record<ActivityStatusProps, 'success' | 'warning' | 'info'> = {
     'completed': 'success',
     'in-progress': 'warning',
     'to-do': 'info',
}

export const ActivityTable = ({ items }: { items: Activity[] }) => {
     const router = useRouter();

     return (
          <Card>
               <Scrollbar>
                    <Box sx={{ minWidth: 800 }}>
                         <Table>
                              <TableHead>
                                   <TableRow>
                                        <TableCell>Aktivnost</TableCell>
                                        <TableCell>Kategorija</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Autor</TableCell>
                                        <TableCell>Datum objave</TableCell>
                                   </TableRow>
                              </TableHead>
                              <TableBody>
                                   {items.length > 0 ? items.map((activity) => (
                                        <TableRow
                                             hover
                                             key={activity.id}
                                             onClick={() => router.push(`/activities/${activity.id}`)}
                                             sx={{ cursor: 'pointer' }}
                                        >
                                             <TableCell>
                                                  <Typography variant="subtitle2">{activity.title}</Typography>
                                             </TableCell>
                                             <TableCell>{CATEGORY_LABELS[activity.category] || LEGACY_CATEGORY_LABELS[activity.category] || activity.category}</TableCell>
                                             <TableCell>
                                                  <SeverityPill color={statusColors[activity.status]}>
                                                       {statusLabels[activity.status] || activity.status}
                                                  </SeverityPill>
                                             </TableCell>
                                             <TableCell>{activity.author}</TableCell>
                                             <TableCell>
                                                  {activity.published_date ? new Date(activity.published_date).toLocaleDateString() : '-'}
                                             </TableCell>
                                        </TableRow>
                                   )) : (
                                        <TableRow>
                                             <TableCell colSpan={5}>
                                                  <Typography>Nema pronađenih aktivnosti.</Typography>
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
