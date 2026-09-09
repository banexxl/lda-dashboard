import type { Metadata } from 'next';
import { projectSummaryServices } from '@/utils/project-summary-services';
import { ProjectSummaryList } from '@/sections/project-summaries/project-summary-list';

export const metadata: Metadata = { title: 'Projekti' };

export default async function Page() {
     const projects = await projectSummaryServices().getAllProjectSummaries();
     return <ProjectSummaryList projects={Array.isArray(projects) ? projects : []} />;
}
