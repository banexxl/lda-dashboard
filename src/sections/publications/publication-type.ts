import * as yup from 'yup';
import { Publication } from '@/utils/publication-services';

export type { Publication };

export const PublicationSchema = yup.object().shape({
     publicationTitle: yup.string().required('Naslov je obavezan'),
     publicationURL: yup.string().required('Dokument je obavezan'),
     publicationImageURL: yup.string().required('Slika je obavezna'),
});

export const initialPublication: Publication = {
     _id: '',
     publicationTitle: '',
     publicationURL: '',
     publicationImageURL: '',
     publicationUploadedDateTime: new Date(),
};
