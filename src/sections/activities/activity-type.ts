import * as yup from 'yup';

export type ActivityCategory = 'economy' | 'democracy' | 'eu-integrations' | 'culture' | 'intercultural-dialogue' | 'migrations' | 'youth' | 'other'
export const activityCategoryProps: ActivityCategory[] = ['economy', 'democracy', 'eu-integrations', 'culture', 'intercultural-dialogue', 'migrations', 'youth', 'other']

export type ActivityStatusProps = 'completed' | 'in-progress' | 'to-do'
export const activityStatusProps: ActivityStatusProps[] = ['completed', 'in-progress', 'to-do'];

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
     category: ActivityCategory;
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