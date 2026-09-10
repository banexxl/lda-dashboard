import { NextRequest, NextResponse } from 'next/server';
import { projectSummaryServices } from '@/utils/project-summary-services';

const services = projectSummaryServices();

function extractGeneralFields(body: any) {
     return {
          project_summary_url: body.project_summary_url,
          project_summary_cover_url: body.project_summary_cover_url,
          status: body.status,
          category: body.category,
          gallery: body.gallery,
          project_end_date_time: body.project_end_date_time ? new Date(body.project_end_date_time).toISOString() : undefined,
          project_start_date_time: body.project_start_date_time ? new Date(body.project_start_date_time).toISOString() : undefined,
          organizers: body.organizers,
          locations: body.locations,
          applicants: body.applicants,
          donators: body.donators,
          publications: body.publications,
          links: body.links,
          title: body.title,
          locale: body.locale,
     };
}

function hasAnyValue(obj: Record<string, any>) {
     return Object.values(obj).some((v) => v !== undefined);
}

export async function GET() {
     const projects = await services.getAllProjectSummaries();
     return NextResponse.json({ message: 'Projects found!', data: projects });
}

export async function POST(request: NextRequest) {
     try {
          const body = await request.json();
          const generalFields = extractGeneralFields(body);
          const newProject = {
               ...generalFields,
               project_start_date_time: body.project_start_date_time ? new Date(body.project_start_date_time).toISOString() : null,
               project_end_date_time: body.project_end_date_time ? new Date(body.project_end_date_time).toISOString() : null,
          };
          const created = await services.addProjectSummary(newProject);
          if (!created) return NextResponse.json({ error: 'Failed to add project' }, { status: 500 });
          return NextResponse.json({ message: 'Project successfully added!' });
     } catch (error) {
          return NextResponse.json({ error: 'Internal server error!' }, { status: 500 });
     }
}

export async function DELETE(request: NextRequest) {
     try {
          const id = await request.json();
          const deleted = await services.deleteProjectSummary(id);
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
          const generalFields = extractGeneralFields(body);

          if (!hasAnyValue(generalFields)) {
               return NextResponse.json({ message: 'Nothing to update', status: 'Bad Request' }, { status: 400 });
          }

          const cleaned = Object.fromEntries(Object.entries(generalFields).filter(([, v]) => v !== undefined));
          const updated = await services.updateProjectSummary(body.id, cleaned);
          return updated
               ? NextResponse.json({ message: 'Project successfully updated!', status: 'OK' })
               : NextResponse.json({ message: 'Project not updated!', status: 'Bad Request' }, { status: 400 });
     } catch (error) {
          return NextResponse.json({ message: 'Internal Server Error', status: 'Error' }, { status: 500 });
     }
}
