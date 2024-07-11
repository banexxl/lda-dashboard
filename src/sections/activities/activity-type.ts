import * as yup from 'yup';
import { ProjectCategory } from '../project-activities/project-activity-type';

const activityStatusProps: ActivityStatusProps[] = ['completed', 'in-progress', 'to-do'];

export const ActivitySchema = yup.object().shape({
     _id: yup.string().optional(),
     activityURL: yup.string().required('Activity URL is required'),
     title: yup.string().required('Title is required'),
     gallery: yup.array(),
     coverURL: yup.string(),
     links: yup.array(),
     publishedDate: yup.date().required('Published date is required'),
     category: yup.string().required('Category is required'),
     favorited: yup.boolean(),
     favoritedNumber: yup.number(),
     descriptions: yup.array(),
     author: yup.string().required('Author is required'),
     status: yup.mixed().oneOf(activityStatusProps, 'Status must be one of: completed, in-progress, to-do').required('Status is required'),
     list: yup.array(),
     listTitle: yup.string(),
});

export type ActivityCategoryProps = {
     label: string;
     path: string;
};

export type ActivityStatusProps = 'completed' | 'in-progress' | 'to-do'

export type Activity = {
     _id?: string;
     activityURL: string;
     title: string;
     publishedDate: Date;
     locale?: string;
     status: ActivityStatusProps;
     author: string;
     links: string[];
     list: string[];
     listTitle: string;
     category: ProjectCategory;
     favorited?: boolean;
     favoritedNumber?: number;
     descriptions: string[];
     gallery: string[];
     coverURL: string;
};

export const initialActivity: Activity = {
     activityURL: '',
     title: '',
     gallery: [],
     coverURL: '',
     links: [],
     publishedDate: new Date(),
     category: 'youth',
     favorited: true,
     favoritedNumber: 150,
     descriptions: [],
     author: '',
     status: 'to-do',
     list: [],
     listTitle: '',
     locale: 'sr',
};