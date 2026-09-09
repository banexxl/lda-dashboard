import { NextRequest, NextResponse } from 'next/server';
import { PublicationsServices } from '@/utils/publication-services';

const publicationServices = PublicationsServices();

export async function GET() {
     try {
          const allPublications = await publicationServices.getAllPublications();
          return NextResponse.json(allPublications);
     } catch (error) {
          console.error('Error handling publications API:', error);
          return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
     }
}

export async function POST(request: NextRequest) {
     try {
          const { publication_title, publication_url, publication_image_url, publication_uploaded_date_time } = await request.json();

          if (!publication_title || !publication_url || !publication_image_url || !publication_uploaded_date_time) {
               return NextResponse.json({ error: 'Missing publication data' }, { status: 400 });
          }

          const parsedUploadedDate = new Date(publication_uploaded_date_time);
          if (isNaN(parsedUploadedDate.getTime())) {
               return NextResponse.json({ error: 'Invalid publication_uploaded_date_time' }, { status: 400 });
          }

          const publication = await publicationServices.addPublication({
               publication_title,
               publication_url,
               publication_image_url,
               publication_uploaded_date_time: parsedUploadedDate.toISOString(),
          });

          if (publication) {
               return NextResponse.json({ message: 'Publication added successfully', publication });
          }
          return NextResponse.json({ error: 'Failed to add publication' }, { status: 500 });
     } catch (error) {
          console.error('Error handling publications API:', error);
          return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
     }
}

export async function PUT(request: NextRequest) {
     try {
          const { id, updatedPublication } = await request.json();
          if (!id || !updatedPublication) {
               return NextResponse.json({ error: 'Missing publication id or data' }, { status: 400 });
          }

          const normalizedUpdate = {
               ...updatedPublication,
               publication_uploaded_date_time: updatedPublication.publication_uploaded_date_time
                    ? new Date(updatedPublication.publication_uploaded_date_time).toISOString()
                    : updatedPublication.publication_uploaded_date_time,
          };

          if (
               normalizedUpdate.publication_uploaded_date_time &&
               isNaN(new Date(normalizedUpdate.publication_uploaded_date_time).getTime())
          ) {
               return NextResponse.json({ error: 'Invalid publication_uploaded_date_time' }, { status: 400 });
          }

          const updated = await publicationServices.updatePublication(id, normalizedUpdate);
          if (updated) {
               return NextResponse.json({ message: 'Publication updated successfully' });
          }
          return NextResponse.json({ error: 'Failed to update publication' }, { status: 500 });
     } catch (error) {
          console.error('Error handling publications API:', error);
          return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
     }
}

export async function DELETE(request: NextRequest) {
     try {
          const deleteId = request.nextUrl.searchParams.get('deleteId');
          if (!deleteId) {
               return NextResponse.json({ error: 'Missing publication id for deletion' }, { status: 400 });
          }

          const deleted = await publicationServices.deletePublication(deleteId);
          if (deleted) {
               return NextResponse.json({ message: 'Publication deleted successfully' });
          }
          return NextResponse.json({ error: 'Failed to delete publication' }, { status: 500 });
     } catch (error) {
          console.error('Error handling publications API:', error);
          return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
     }
}
