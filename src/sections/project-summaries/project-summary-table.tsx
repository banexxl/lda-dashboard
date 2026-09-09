'use client';

import {
     Box, Card, Table, TableBody, TableCell, TableHead, TableRow, Typography
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { Scrollbar } from 'src/components/scrollbar';
import { SeverityPill } from 'src/components/severity-pill';
import { CATEGORY_LABELS, STATUS_LABELS } from '@/types/content-enums';
import { ProjectSummary } from './project-summary-type';

const statusColors: Record<string, 'success' | 'warning' | 'info'> = {
     'completed': 'success',
     'in-progress': 'warning',
     'to-do': 'info',
}

export const ProjectSummaryTable = ({ items }: { items: ProjectSummary[] }) => {
     const router = useRouter();

     return (
          <Card>
               <Scrollbar>
                    <Box sx={{ minWidth: 800 }}>
                         <Table>
                              <TableHead>
                                   <TableRow>
                                        <TableCell>Naziv</TableCell>
                                        <TableCell>Kategorija</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Početak</TableCell>
                                        <TableCell>Kraj</TableCell>
                                   </TableRow>
                              </TableHead>
                              <TableBody>
                                   {items.length > 0 ? items.map((project) => (
                                        <TableRow
                                             hover
                                             key={project.id}
                                             onClick={() => router.push(`/project-summaries/${project.id}`)}
                                             sx={{ cursor: 'pointer' }}
                                        >
                                             <TableCell>
                                                  <Typography variant="subtitle2">{project.title}</Typography>
                                             </TableCell>
                                             <TableCell>{CATEGORY_LABELS[project.category] || project.category}</TableCell>
                                             <TableCell>
                                                  <SeverityPill color={statusColors[project.status] || 'info'}>
                                                       {STATUS_LABELS[project.status] || project.status}
                                                  </SeverityPill>
                                             </TableCell>
                                             <TableCell>
                                                  {project.project_start_date_time ? new Date(project.project_start_date_time).toLocaleDateString() : '-'}
                                             </TableCell>
                                             <TableCell>
                                                  {project.project_end_date_time ? new Date(project.project_end_date_time).toLocaleDateString() : '-'}
                                             </TableCell>
                                        </TableRow>
                                   )) : (
                                        <TableRow>
                                             <TableCell colSpan={5}>
                                                  <Typography>Nema pronađenih projekata.</Typography>
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
