import * as yup from 'yup';
import { ProjectStatus } from '../project-activities/project-activity-type';

export const ProjectSummarySchema = yup.object().shape({
     projectSummaryURL: yup.string().required(),
     projectSummaryCoverURL: yup.string(),
     status: yup.string().required(),
     gallery: yup.array().of(yup.string()),
     projectEndDateTime: yup.date().required(),
     projectStartDateTime: yup.date().required(),
     organizers: yup.array().of(yup.string()),
     locations: yup.array().of(yup.string()),
     applicants: yup.array().of(yup.string()),
     donators: yup.array().of(yup.string()),
     publications: yup.array().of(yup.string()),
     projectSummaryDescriptions: yup.array().of(yup.string()),
     projectSummarySubtitleURLs: yup.array().of(yup.string()),
     projectSummaryDateTime: yup.array().of(yup.date()),
     projectSummarySubtitles: yup.array().of(yup.string()),
     links: yup.array().of(yup.string()),
     title: yup.string().required(),
     locale: yup.string().required(),
});

export default ProjectSummarySchema;

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

     projectSummaryDescriptions: string[];
     projectSummarySubtitleURLs: string[];
     projectSummaryDateTime: string[];
     projectSummarySubtitles: string[];

     gallery: string[];
     projectEndDateTime: string;
     projectStartDateTime: string;
}

export const initialProjectSummary: ProjectSummary = {
     projectSummaryURL: "",
     projectSummaryCoverURL: "",
     status: { key: 'to-do', value: 'To Do' },
     gallery: [],
     projectEndDateTime: "",
     projectStartDateTime: "",
     organizers: [],
     locations: [],
     applicants: [],
     donators: [],
     publications: [],
     projectSummaryDescriptions: [],
     projectSummarySubtitleURLs: [],
     projectSummaryDateTime: [],
     projectSummarySubtitles: [],
     links: [],
     title: "",
     locale: "sr"
};