import * as yup from 'yup';
import { ProjectCategory, ProjectStatus } from '../project-activities/project-activity-type';

export const ProjectSummarySchema = yup.object().shape({
     projectSummaryURL: yup.string(),
     projectSummaryCoverURL: yup.string(),
     status: yup.string().required('Status projekta je obavezno polje.'),
     gallery: yup.array().of(yup.string()),
     projectEndDateTime: yup.date().typeError('Vreme završetka projekta mora biti u formatu DD/MM/YYYY.').required('Vreme završetka projekta je obavezno polje.'),
     projectStartDateTime: yup.date().typeError('Vreme kraja projekta mora biti u formatu DD/MM/YYYY.').required('Vreme početka projekta je obavezno polje.'),
     organizers: yup.array().of(yup.string()),
     locations: yup.array().of(yup.string()),
     applicants: yup.array().of(yup.string()),
     donators: yup.array().of(yup.string()),
     publications: yup.array().of(yup.string()),
     category: yup.string(),
     // projectSummaryDescriptions: yup.array().of(yup.string()),
     // projectSummarySubtitleURLs: yup.array().of(yup.string()),
     // projectSummaryDateTime: yup.array().of(yup.date()),
     // projectSummarySubtitles: yup.array().of(yup.string()),
     links: yup.array().of(yup.string()),
     title: yup.string().required('Naslov projekta je obavezno polje.'),
     locale: yup.string().required('Jezik projekta je obavezno polje.'),
});

export interface ProjectSummary {
     _id?: string;
     title: string;
     projectSummaryURL: string;
     projectSummaryCoverURL: string;
     status: ProjectStatus;
     locale: string;
     organizers: string[];
     locations: string[];
     applicants: string[];
     donators: string[];
     publications: string[];
     links: string[];
     category: ProjectCategory;
     // projectSummaryDescriptions: string[];
     // projectSummarySubtitleURLs: string[];
     // projectSummaryDateTime: string[];
     // projectSummarySubtitles: string[];

     gallery: string[];
     projectEndDateTime: Date;
     projectStartDateTime: Date;
}

export const initialProjectSummary: ProjectSummary = {
     projectSummaryURL: "",
     projectSummaryCoverURL: "",
     status: "to-do",
     gallery: [],
     projectEndDateTime: new Date(),
     projectStartDateTime: new Date(),
     organizers: [],
     locations: [],
     applicants: [],
     donators: [],
     publications: [],
     category: "other",
     // projectSummaryDescriptions: [],
     // projectSummarySubtitleURLs: [],
     // projectSummaryDateTime: [],
     // projectSummarySubtitles: [],
     links: [],
     title: "",
     locale: "sr"
};