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
     title: yup.string().required('Naslov je obavezan'),
     subTitle: yup.string(),
     projectURL: yup.string().required('URL projektne aktivnost je obavezan'),
     projectSummaryURL: yup.string().required('URL glavnog projekta je obavezan'),
     status: yup.string().required('Status je obavezan'),
     locale: yup.string().required('Jezik je obavezan'),
     list: yup.array().of(yup.string()),
     listTitle: yup.string(),
     links: yup.array().of(yup.string()),
     paragraphs: yup.array().min(1, 'Bar jedan pasus je obavezan').of(yup.string().required('Bar jedan pasus je obavezan')),
     locations: yup.array().min(1, 'Bar jedna lokacija je obavezna').of(yup.string().required('Bar jedna lokacija je obavezan')),
     applicants: yup.array().of(yup.string()),
     organizers: yup.array().of(yup.string()),
     subOrganizers: yup.array().of(yup.string()),
     donators: yup.array().of(yup.string()),
     category: yup.string().required('Kategorija je obavezna'),
     published: yup.date().typeError('Datum mora biti u odgovarajućem formatu!').required('Datum za objavu je obavezan!'),
     showProjectDetails: yup.boolean(),
});

export const projectActivityInitialValues: ProjectActivity = {
     title: '',
     subTitle: '',
     projectSummaryURL: '',
     projectURL: '',
     category: 'other',
     status: 'to-do',
     published: new Date('2000-01-01'),
     applicants: [],
     organizers: [],
     subOrganizers: [],
     donators: [],
     paragraphs: [],
     links: [],
     publications: [],
     locations: [],
     gallery: [],
     showProjectDetails: false,
     listTitle: '',
     list: [],
     locale: 'sr'
};