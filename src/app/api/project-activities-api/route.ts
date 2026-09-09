import { NextRequest, NextResponse } from 'next/server';
import { projectActivitiesServices } from '@/utils/project-activity-services';

const services = projectActivitiesServices();

export async function GET() {
     const projectActivities = await services.getAllProjectActivities();
     return NextResponse.json({ message: 'Project s found!', data: projectActivities });
}

export async function POST(request: NextRequest) {
     try {
          const body = await request.json();
          const created = await services.addProjectActivity({
               ...body,
               published: new Date(body.published).toISOString(),
          });
          if (!created) return NextResponse.json({ error: 'Failed to add project activity' }, { status: 500 });
          return NextResponse.json({ message: 'Project successfully added!', data: created });
     } catch (error) {
          return NextResponse.json({ error: 'Internal server error!' }, { status: 500 });
     }
}

export async function DELETE(request: NextRequest) {
     try {
          const id = await request.json();
          const deleted = await services.deleteProjectActivity(id);
          return deleted
               ? NextResponse.json({ message: 'Projekat uspesno obrisan' })
               : NextResponse.json({ message: 'Projekat nije obrisan' }, { status: 400 });
     } catch (error) {
          return NextResponse.json({ error: 'Internal server error!' }, { status: 500 });
     }
}

export async function PUT(request: NextRequest) {
     try {
          const body = await request.json();
          const { id, ...projectWithoutId } = body;
          const updated = await services.updateProjectActivity(id, {
               ...projectWithoutId,
               published: new Date(body.published).toISOString(),
          });
          return updated
               ? NextResponse.json({ message: 'Project successfully updated!', status: 'OK' })
               : NextResponse.json({ message: 'Project not updated!', status: 'Bad Request' }, { status: 400 });
     } catch (error) {
          return NextResponse.json({ error: 'Internal server error!' }, { status: 500 });
     }
}
