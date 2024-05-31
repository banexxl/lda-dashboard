import * as yup from 'yup';

export type Locale = 'sr' | 'en'

export type ProjectCategory = { key: 'economy', value: 'Economy' }
     | { key: 'democracy', value: 'Democracy' }
     | { key: 'eu-integrations', value: 'EU Integrations' }
     | { key: 'culture', value: 'Culture' }
     | { key: 'intercultural-dialogue', value: 'Intercultural Dialogue' }
     | { key: 'migrations', value: 'Migrations' }
     | { key: 'youth', value: 'Youth' }
     | { key: 'other', value: 'Other' }

export type ProjectStatus = { key: 'completed', value: 'Completed' }
     | { key: 'in-progress', value: 'In Progress' }
     | { key: 'to-do', value: 'To Do' }

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
     subTitle: yup.string().required('Sub title is required'),
     projectURL: yup.string().required('Project URL is required'),
     projectSummaryURL: yup.string().required('Project summary URL is required'),
     status: yup.string().required('Status is required'),
     locale: yup.string().required('Locale is required'),
     list: yup.array().of(yup.string().required('List item is required')),
     listTitle: yup.string().required('List title is required'),
     links: yup.array().of(yup.string().required('Link is required')),
     paragraphs: yup.array().of(yup.string().required('Paragraph is required')),
     locations: yup.array().of(yup.string().required('Location is required')),
     applicants: yup.array().of(yup.string().required('Applicant is required')),
     organizers: yup.array().of(yup.string().required('Organizer is required')),
     subOrganizers: yup.array().of(yup.string().required('Sub organizer is required')),
     donators: yup.array().of(yup.string().required('Donator is required')),
     publications: yup.array().of(yup.string().required('Publication is required')),
     category: yup.string().required('Category is required'),
     gallery: yup.array().of(yup.string().required('Gallery image is required')),
     published: yup.date().required('Published date is required'),
     showProjectDetails: yup.boolean().required('Show project details is required'),
});

export const projectActivityInitialValues: ProjectActivity = {
     title: '',
     subTitle: '',
     projectSummaryURL: '',
     projectURL: '',
     category: { key: 'other', value: 'Other' },
     status: { key: 'to-do', value: 'To Do' },
     published: new Date(),
     applicants: [''],
     organizers: [''],
     subOrganizers: [''],
     donators: [''],
     paragraphs: [''],
     links: [''],
     publications: [''],
     locations: [''],
     gallery: [''],
     showProjectDetails: true,
     listTitle: '',
     list: [''],
     locale: 'sr'
};