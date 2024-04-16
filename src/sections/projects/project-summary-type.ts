export type Status = 'completed' | 'in-progress' | 'todo';

export interface ProjectSummary {
     _id: string;
     projectSummaryURL: string;
     projectSummaryCoverURL: string;
     status: Status;
     gallery: string[];
     projectEndDateTime: Date
     projectStartDateTime: Date;
     organizers: string[];
     locations: string[];
     applicants: string[];
     donators: string[];
     publications: string[];
     projectSummaryDescriptions: string[];
     projectSummarySubtitleURLs: string[];
     projectSummaryDateTime: string[];
     projectSummarySubtitles: string[];
     links: string[];
     title: string;
     locale: string;
}

export const initialProjectSummary: ProjectSummary = {
     _id: "",
     projectSummaryURL: "",
     projectSummaryCoverURL: "",
     status: 'in-progress',
     gallery: [],
     projectEndDateTime: new Date("2024-12-31T23:59:59"),
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