import type { Metadata } from 'next';
import { projectActivitiesServices } from '@/utils/project-activity-services';
import { projectSummaryServices } from '@/utils/project-summary-services';
import { ProjectActivityList } from '@/sections/project-activities/project-activity-list';

export const metadata: Metadata = { title: 'Projektne aktivnosti' };

export default async function Page() {
     const [projectActivities, projectSummaries] = await Promise.all([
          projectActivitiesServices().getAllProjectActivities(),
          projectSummaryServices().getAllProjectSummaries(),
     ]);

     return (
          <ProjectActivityList
               projectActivities={Array.isArray(projectActivities) ? projectActivities : []}
               projectSummaries={Array.isArray(projectSummaries) ? projectSummaries : []}
          />
     );
}
