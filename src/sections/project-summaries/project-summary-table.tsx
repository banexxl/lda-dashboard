import {
     Box, Card, Table, TableBody, TableCell, TableHead, TableRow, Typography
} from '@mui/material';
import { useRouter } from 'next/router';
import { Scrollbar } from 'src/components/scrollbar';
import { SeverityPill } from 'src/components/severity-pill';
import { ProjectSummary } from './project-summary-type';

const statusLabels: Record<string, string> = {
     'completed': 'Zavrsen',
     'in-progress': 'U toku',
     'to-do': 'U planu',
}

const statusColors: Record<string, 'success' | 'warning' | 'info'> = {
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
                                             key={project._id}
                                             onClick={() => router.push(`/project-summaries/${project._id}`)}
                                             sx={{ cursor: 'pointer' }}
                                        >
                                             <TableCell>
                                                  <Typography variant="subtitle2">{project.title}</Typography>
                                             </TableCell>
                                             <TableCell>{categoryLabels[project.category] || project.category}</TableCell>
                                             <TableCell>
                                                  <SeverityPill color={statusColors[project.status] || 'info'}>
                                                       {statusLabels[project.status] || project.status}
                                                  </SeverityPill>
                                             </TableCell>
                                             <TableCell>
                                                  {project.projectStartDateTime ? new Date(project.projectStartDateTime).toLocaleDateString() : '-'}
                                             </TableCell>
                                             <TableCell>
                                                  {project.projectEndDateTime ? new Date(project.projectEndDateTime).toLocaleDateString() : '-'}
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
