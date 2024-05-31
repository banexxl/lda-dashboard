import * as yup from 'yup';
import { ProjectCategory } from '../project-activities/project-activity-type';

const activityStatusProps: ActivityStatusProps[] = ['completed', 'in-progress', 'to-do'];

export const ActivitySchema = yup.object().shape({
     _id: yup.string().required('ID is required'),
     activityURL: yup.string().url('Must be a valid URL').required('Activity URL is required'),
     title: yup.string().required('Title is required'),
     gallery: yup.array().of(yup.string().url('Each gallery item must be a valid URL')).required('Gallery is required'),
     coverURL: yup.string().url('Must be a valid URL').required('Cover URL is required'),
     links: yup.array().of(yup.string().url('Each link must be a valid URL')).required('Links are required'),
     publishedDate: yup.date().required('Published date is required'),
     category: yup.string().required('Category is required'),
     favorited: yup.boolean().required('Favorited is required'),
     favoritedNumber: yup.number().integer().min(0, 'Favorited number must be a non-negative integer').required('Favorited number is required'),
     descriptions: yup.string().required('Descriptions are required'),
     author: yup.string().required('Author is required'),
     status: yup.mixed().oneOf(activityStatusProps, 'Status must be one of: completed, in-progress, to-do').required('Status is required'),
     list: yup.array().of(yup.string().required('Each item in the list must be a string')).required('List is required'),
     listTitle: yup.string().required('List title is required'),
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
     activityURL: 'https://example.com/activity/abc123',
     title: 'Nature Hike Adventure',
     gallery: ['https://example.com/images/hike1.jpg'],
     coverURL: 'https://example.com/images/cover.jpg',
     links: ['https://example.com/details'],
     publishedDate: new Date(),
     category: { key: 'culture', value: 'Culture' },
     favorited: true,
     favoritedNumber: 150,
     descriptions: [''],
     author: 'John Doe',
     status: 'to-do',
     list: ['Bring water and snacks'],
     listTitle: 'Preparation Checklist',
     locale: 'sr',
};