import * as yup from 'yup';

const ProjectSummarySchema = yup.object().shape({
     _id: yup.string().required(),
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
