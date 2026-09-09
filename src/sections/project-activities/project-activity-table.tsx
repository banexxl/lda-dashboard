'use client';

import {
     Box, Table, TableBody, TableCell, TableHead, TableRow, Typography
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { SeverityPill } from 'src/components/severity-pill';
import { CATEGORY_LABELS } from '@/types/content-enums';
import { ProjectActivity, ProjectStatus } from './project-activity-type';
import { ProjectSummary } from '../project-summaries/project-summary-type';

const statusLabels: Record<ProjectStatus, string> = {
     'completed': 'Zavrsen',
     'in-progress': 'U toku',
     'to-do': 'U planu',
}

const statusColors: Record<ProjectStatus, 'success' | 'warning' | 'info'> = {
     'completed': 'success',
     'in-progress': 'warning',
     'to-do': 'info',
}

type ProjectActivityTableProps = {
     items: ProjectActivity[];
     projectSummaries: ProjectSummary[];
};

export const ProjectActivityTable = ({ items, projectSummaries }: ProjectActivityTableProps) => {
     const router = useRouter();

     const getParentTitle = (projectSummaryId: string | null) => {
          const parent = projectSummaries.find((summary) => summary.id === projectSummaryId)
          return parent?.title || '-'
     }

     return (
          <Box sx={{ overflowX: 'auto' }}>
               <Box sx={{ minWidth: 800 }}>
                    <Table>
                         <TableHead>
                              <TableRow>
                                   <TableCell>Naziv</TableCell>
                                   <TableCell>Projekat</TableCell>
                                   <TableCell>Kategorija</TableCell>
                                   <TableCell>Status</TableCell>
                                   <TableCell>Datum objave</TableCell>
                              </TableRow>
                         </TableHead>
                         <TableBody>
                              {items.length > 0 ? items.map((activity) => (
                                   <TableRow
                                        hover
                                        key={activity.id}
                                        onClick={() => router.push(`/project-activities/${activity.id}`)}
                                        sx={{ cursor: 'pointer' }}
                                   >
                                        <TableCell>
                                             <Typography variant="subtitle2">{activity.title}</Typography>
                                        </TableCell>
                                        <TableCell>{getParentTitle(activity.project_summary_id)}</TableCell>
                                        <TableCell>{CATEGORY_LABELS[activity.category] || activity.category}</TableCell>
                                        <TableCell>
                                             <SeverityPill color={statusColors[activity.status]}>
                                                  {statusLabels[activity.status] || activity.status}
                                             </SeverityPill>
                                        </TableCell>
                                        <TableCell>
                                             {activity.published ? new Date(activity.published).toLocaleDateString() : '-'}
                                        </TableCell>
                                   </TableRow>
                              )) : (
                                   <TableRow>
                                        <TableCell colSpan={5}>
                                             <Typography>Nema pronađenih projektnih aktivnosti.</Typography>
                                        </TableCell>
                                   </TableRow>
                              )}
                         </TableBody>
                    </Table>
               </Box>
          </Box>
     );
};
