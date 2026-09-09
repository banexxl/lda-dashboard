import * as yup from 'yup';
import { Publication } from '@/utils/publication-services';

export type { Publication };

export const PublicationSchema = yup.object().shape({
     publication_title: yup.string().required('Naslov je obavezan'),
     publication_url: yup.string().required('Dokument je obavezan'),
     publication_image_url: yup.string().required('Slika je obavezna'),
});

export const initialPublication: Publication = {
     id: '',
     publication_title: '',
     publication_url: '',
     publication_image_url: '',
     publication_uploaded_date_time: new Date().toISOString(),
};
