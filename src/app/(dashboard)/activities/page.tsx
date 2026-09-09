import type { Metadata } from 'next';
import { ActivitiesServices } from '@/utils/activity-services';
import { ActivityList } from '@/sections/activities/activity-list';

export const metadata: Metadata = { title: 'Aktivnosti' };

export default async function Page() {
     const activities = await ActivitiesServices().getAllActivities();
     return <ActivityList activities={Array.isArray(activities) ? activities : []} />;
}
