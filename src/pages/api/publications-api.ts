import { PublicationsServices } from '@/utils/publication-services';
import { NextApiRequest, NextApiResponse } from 'next';

const publicationServices = PublicationsServices();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
     try {
          switch (req.method) {
               case 'POST':
                    // Add publication
                    const { publicationTitle, publicationURL, publicationImageURL, publicationUploadedDateTime } = req.body;

                    if (!publicationTitle || !publicationURL || !publicationImageURL || !publicationUploadedDateTime) {
                         return res.status(400).json({ error: 'Missing publication data' });
                    }

                    const parsedUploadedDate = new Date(publicationUploadedDateTime);
                    if (isNaN(parsedUploadedDate.getTime())) {
                         return res.status(400).json({ error: 'Invalid publicationUploadedDateTime' });
                    }

                    const publication = await publicationServices.addPublication({
                         publicationTitle,
                         publicationURL,
                         publicationImageURL,
                         publicationUploadedDateTime: parsedUploadedDate,
                    });

                    if (publication) {
                         return res.status(200).json({ message: 'Publication added successfully', publication });
                    } else {
                         return res.status(500).json({ error: 'Failed to add publication' });
                    }
               case 'GET':
                    // Fetch all publications
                    const allPublications = await publicationServices.getAllPublications();
                    return res.status(200).json(allPublications);

               case 'PUT':
                    // Update publication
                    const { id, updatedPublication } = req.body;

                    if (!id || !updatedPublication) {
                         return res.status(400).json({ error: 'Missing publication id or data' });
                    }

                    const normalizedUpdate = {
                         ...updatedPublication,
                         publicationUploadedDateTime: updatedPublication.publicationUploadedDateTime
                              ? new Date(updatedPublication.publicationUploadedDateTime)
                              : updatedPublication.publicationUploadedDateTime,
                    };

                    if (
                         normalizedUpdate.publicationUploadedDateTime &&
                         isNaN(new Date(normalizedUpdate.publicationUploadedDateTime).getTime())
                    ) {
                         return res.status(400).json({ error: 'Invalid publicationUploadedDateTime' });
                    }

                    const updated = await publicationServices.updatePublication(id, normalizedUpdate);

                    if (updated) {
                         return res.status(200).json({ message: 'Publication updated successfully' });
                    } else {
                         return res.status(500).json({ error: 'Failed to update publication' });
                    }

               case 'DELETE':
                    // Delete publication
                    const { deleteId } = req.query;

                    if (!deleteId) {
                         return res.status(400).json({ error: 'Missing publication id for deletion' });
                    }

                    const deleted = await publicationServices.deletePublication(deleteId as string);

                    if (deleted) {
                         return res.status(200).json({ message: 'Publication deleted successfully' });
                    } else {
                         return res.status(500).json({ error: 'Failed to delete publication' });
                    }

               default:
                    return res.status(405).json({ error: 'Method Not Allowed' });
          }
     } catch (error) {
          console.error('Error handling publications API:', error);
          return res.status(500).json({ error: 'Internal Server Error' });
     }
}
