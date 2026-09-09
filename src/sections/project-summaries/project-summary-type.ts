import * as yup from 'yup';
import { Category, Status } from '@/types/content-enums';

export const ProjectSummarySchema = yup.object().shape({
     project_summary_url: yup.string(),
     project_summary_cover_url: yup.string(),
     status: yup.string().required('Status projekta je obavezno polje.'),
     gallery: yup.array().of(yup.string()),
     project_end_date_time: yup.date().typeError('Vreme završetka projekta mora biti u formatu DD/MM/YYYY.').required('Vreme završetka projekta je obavezno polje.'),
     project_start_date_time: yup.date().typeError('Vreme kraja projekta mora biti u formatu DD/MM/YYYY.').required('Vreme početka projekta je obavezno polje.'),
     organizers: yup.array().of(yup.string()),
     locations: yup.array().of(yup.string()),
     applicants: yup.array().of(yup.string()),
     donators: yup.array().of(yup.string()),
     publications: yup.array().of(yup.string()),
     category: yup.string(),
     links: yup.array().of(yup.string()),
     title: yup.string().required('Naslov projekta je obavezno polje.'),
     locale: yup.string().required('Jezik projekta je obavezno polje.'),
});

export interface ProjectSummary {
     id?: string;
     title: string;
     project_summary_url: string;
     project_summary_cover_url: string;
     status: Status;
     locale: string;
     organizers: string[];
     locations: string[];
     applicants: string[];
     donators: string[];
     publications: string[];
     links: string[];
     category: Category;
     gallery: string[];
     project_end_date_time: Date;
     project_start_date_time: Date;
}

export const initialProjectSummary: ProjectSummary = {
     project_summary_url: "",
     project_summary_cover_url: "",
     status: "to-do",
     gallery: [],
     project_end_date_time: new Date(),
     project_start_date_time: new Date(),
     organizers: [],
     locations: [],
     applicants: [],
     donators: [],
     publications: [],
     category: "other",
     links: [],
     title: "",
     locale: "sr"
};
