import type { Metadata } from 'next';
import { PublicationsServices } from '@/utils/publication-services';
import { PublicationList } from '@/sections/publications/publication-list';

export const metadata: Metadata = { title: 'Publications' };

export default async function Page() {
     const publications = await PublicationsServices().getAllPublications();
     return <PublicationList publications={Array.isArray(publications) ? publications : []} />;
}
