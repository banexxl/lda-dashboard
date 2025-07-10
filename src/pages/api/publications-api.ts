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

                    const publication = await publicationServices.addPublication({ publicationTitle, publicationURL, publicationImageURL, publicationUploadedDateTime });

                    if (publication) {
                         return res.status(200).json({ message: 'Publication added successfully', publication });
                    } else {
                         return res.status(500).json({ error: 'Failed to add publication' });
                    }
               case 'GET':
                    // Fetch all publications with pagination
                    if (req.query.page && req.query.limit) {
                         const page = parseInt(req.query.page as string, 10);
                         const limit = parseInt(req.query.limit as string, 10);

                         const publications = await publicationServices.getPublicationsByPage(page, limit);
                         const publicationsCount = await publicationServices.getPublicationsCount();

                         return res.status(200).json({ publications, publicationsCount });
                    }
                    // Default fetch all publications if no page or limit is provided
                    const allPublications = await publicationServices.getAllPublications();
                    return res.status(200).json(allPublications);

               case 'PUT':
                    // Update publication
                    const { id, updatedPublication } = req.body;

                    if (!id || !updatedPublication) {
                         return res.status(400).json({ error: 'Missing publication id or data' });
                    }

                    const updated = await publicationServices.updatePublication(id, updatedPublication);

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
