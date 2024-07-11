import * as yup from 'yup';

export type Locale = 'sr' | 'en'

export type ProjectCategory = 'economy'
     | 'democracy'
     | 'eu-integrations'
     | 'culture'
     | 'intercultural-dialogue'
     | 'migrations'
     | 'youth'
     | 'other'

export type ProjectStatus = 'completed' | 'in-progress' | 'to-do'

export type ProjectActivity = {
     _id?: string;
     projectSummaryURL: string;
     projectURL: string;
     links: string[];
     title: string;
     subTitle: string,
     paragraphs: string[];
     category: ProjectCategory;
     status: ProjectStatus;
     locations: string[];
     published: Date;
     favorited?: boolean;
     favoritedNumber?: number;
     organizers: string[];
     subOrganizers: string[];
     applicants: string[];
     donators: string[];
     publications: string[];
     gallery: string[];
     showProjectDetails: boolean;
     listTitle: string;
     list: string[];
     locale: Locale
};

export const ProjectActivitySchema = yup.object().shape({
     title: yup.string().required('Title is required'),
     subTitle: yup.string(),
     projectURL: yup.string().required('Project URL is required'),
     projectSummaryURL: yup.string().required('Project summary URL is required'),
     status: yup.string().required('Status is required'),
     locale: yup.string().required('Locale is required'),
     list: yup.array().of(yup.string()),
     listTitle: yup.string(),
     links: yup.array().of(yup.string()),
     paragraphs: yup.array().of(yup.string()),
     locations: yup.array().of(yup.string().required('Location is required')),
     applicants: yup.array().of(yup.string()),
     organizers: yup.array().of(yup.string()),
     subOrganizers: yup.array().of(yup.string()),
     donators: yup.array().of(yup.string()),
     category: yup.string().required('Category is required'),
     published: yup.date().required('Published date is required'),
     showProjectDetails: yup.boolean(),
});

export const projectActivityInitialValues: ProjectActivity = {
     title: '',
     subTitle: '',
     projectSummaryURL: '',
     projectURL: '',
     category: 'other',
     status: 'to-do',
     published: new Date(),
     applicants: [],
     organizers: [],
     subOrganizers: [],
     donators: [],
     paragraphs: [],
     links: [],
     publications: [],
     locations: [],
     gallery: [],
     showProjectDetails: true,
     listTitle: '',
     list: [],
     locale: 'sr'
};