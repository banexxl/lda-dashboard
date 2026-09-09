import { NextRequest, NextResponse } from 'next/server';
import { ActivitiesServices } from '@/utils/activity-services';

const services = ActivitiesServices();

export async function GET() {
     const activities = await services.getAllActivities();
     return NextResponse.json({ message: 'activity s found!', data: activities });
}

export async function POST(request: NextRequest) {
     try {
          const body = await request.json();
          const created = await services.addActivity({
               ...body,
               published_date: new Date(body.published_date).toISOString(),
          });
          if (!created) return NextResponse.json({ error: 'Failed to add activity' }, { status: 500 });
          return NextResponse.json({ message: 'activity successfully added!', data: created });
     } catch (error) {
          return NextResponse.json({ error: 'Internal server error!' }, { status: 500 });
     }
}

export async function DELETE(request: NextRequest) {
     try {
          const id = await request.json();
          const deleted = await services.deleteActivity(id);
          return deleted
               ? NextResponse.json({ message: 'Aktivnost uspesno obrisana' })
               : NextResponse.json({ message: 'Aktivnost nije obrisana' }, { status: 400 });
     } catch (error) {
          return NextResponse.json({ error: 'Internal server error!' }, { status: 500 });
     }
}

export async function PUT(request: NextRequest) {
     try {
          const body = await request.json();
          const { id, ...activityWithoutId } = body;
          const updated = await services.updateActivity(id, {
               ...activityWithoutId,
               published_date: new Date(body.published_date).toISOString(),
          });
          return updated
               ? NextResponse.json({ message: 'Activity successfully updated!', status: 'OK' })
               : NextResponse.json({ message: 'Activity not updated!', status: 'Bad Request' }, { status: 400 });
     } catch (error) {
          return NextResponse.json({ error: 'Internal server error!' }, { status: 500 });
     }
}
