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
     descriptions: yup
          .array()
          .of(yup.string())
          .test(
               'descriptions-or-quill',
               'Bar jedan pasus ili sadržaj iz editora je obavezan',
               function (value) {
                    const quill = (this.parent as any)?.quillEditorData
                    const hasParagraph = Array.isArray(value) && value.some((v) => (typeof v === 'string' ? v.trim().length > 0 : false))
                    const hasHtml = typeof quill === 'string' && quill.trim().length > 0
                    return hasParagraph || hasHtml
               }
          ),
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
     quillEditorData?: string;
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
     quillEditorData: '',
     author: '',
     status: 'to-do',
     list: [],
     listTitle: '',
     locale: 'sr',
};
