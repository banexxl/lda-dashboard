import * as yup from 'yup';

export const ProjectSummarySchema = yup.object().shape({
     projectSummaryURL: yup.string().required(),
     projectSummaryCoverURL: yup.string().required(),
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
     projectSummaryDateTime: yup.array().of(yup.string()),
     projectSummarySubtitles: yup.array().of(yup.string()),
     links: yup.array().of(yup.string()),
     title: yup.string().required(),
     locale: yup.string().required(),
});

export default ProjectSummarySchema;


export type Status = 'completed' | 'in-progress' | 'todo';

export interface ProjectSummary {
     _id?: string;
     title: string;
     projectSummaryURL: string;
     projectSummaryCoverURL: string;
     status: Status;
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
     projectEndDateTime: Date
     projectStartDateTime: Date;
}

export const initialProjectSummary: ProjectSummary = {
     projectSummaryURL: "",
     projectSummaryCoverURL: "",
     status: 'in-progress',
     gallery: [],
     projectEndDateTime: new Date("2024-12-31T01:00:00"),
     projectStartDateTime: new Date("2024-01-01T00:00:00"),
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