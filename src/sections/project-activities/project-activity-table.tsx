import {
     Box, Card, Table, TableBody, TableCell, TableHead, TableRow, Typography
} from '@mui/material';
import { useRouter } from 'next/router';
import { Scrollbar } from 'src/components/scrollbar';
import { SeverityPill } from 'src/components/severity-pill';
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

const categoryLabels: Record<string, string> = {
     'other': 'Ostalo',
     'eu-integrations': 'EU integracije',
     'intercultural-dialogue': 'Interkulturalni dijalog',
     'migrations': 'Migracije',
     'youth': 'Mladi',
     'culture': 'Kultura',
     'economy': 'Ekonomija',
     'democracy': 'Demokratija',
}

type ProjectActivityTableProps = {
     items: ProjectActivity[];
     projectSummaries: ProjectSummary[];
};

export const ProjectActivityTable = ({ items, projectSummaries }: ProjectActivityTableProps) => {
     const router = useRouter();

     const getParentTitle = (projectSummaryURL: string) => {
          const cleanUrl = (projectSummaryURL || '').replace('/pregled-projekta/', '')
          const parent = projectSummaries.find((summary) => summary.projectSummaryURL === cleanUrl)
          return parent?.title || '-'
     }

     return (
          <Card>
               <Scrollbar>
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
                                             key={activity._id}
                                             onClick={() => router.push(`/project-activities/${activity._id}`)}
                                             sx={{ cursor: 'pointer' }}
                                        >
                                             <TableCell>
                                                  <Typography variant="subtitle2">{activity.title}</Typography>
                                             </TableCell>
                                             <TableCell>{getParentTitle(activity.projectSummaryURL)}</TableCell>
                                             <TableCell>{categoryLabels[activity.category] || activity.category}</TableCell>
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
               </Scrollbar>
          </Card>
     );
};
