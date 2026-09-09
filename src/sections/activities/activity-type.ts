import * as yup from 'yup';
import { CATEGORY_VALUES, Category, STATUS_VALUES, Status } from '@/types/content-enums';

export type ActivityCategory = Category;
export const activityCategoryProps = CATEGORY_VALUES;

export type ActivityStatusProps = Status;
export const activityStatusProps = STATUS_VALUES;

export const ActivitySchema = yup.object().shape({
     id: yup.string().optional(),
     activity_url: yup.string().required('Activity URL is required'),
     title: yup.string().required('Title is required'),
     gallery: yup.array(),
     cover_url: yup.string(),
     links: yup.array(),
     published_date: yup.date().required('Published date is required'),
     category: yup.string().required('Category is required'),
     favorited: yup.boolean(),
     favorited_number: yup.number(),
     descriptions: yup
          .array()
          .of(yup.string())
          .test(
               'descriptions-or-quill',
               'Bar jedan pasus ili sadržaj iz editora je obavezan',
               function (value) {
                    const quill = (this.parent as any)?.quill_editor_data
                    const hasParagraph = Array.isArray(value) && value.some((v) => (typeof v === 'string' ? v.trim().length > 0 : false))
                    const hasHtml = typeof quill === 'string' && quill.trim().length > 0
                    return hasParagraph || hasHtml
               }
          ),
     author: yup.string().required('Author is required'),
     status: yup.mixed().oneOf(activityStatusProps, 'Status must be one of: completed, in-progress, to-do').required('Status is required'),
     list: yup.array(),
     list_title: yup.string(),
});



export type Activity = {
     id?: string;
     activity_url: string;
     title: string;
     published_date: Date;
     locale?: string;
     status: ActivityStatusProps;
     author: string;
     links: string[];
     list: string[];
     list_title: string;
     category: ActivityCategory;
     favorited?: boolean;
     favorited_number?: number;
     descriptions: string[];
     quill_editor_data?: string;
     gallery: string[];
     cover_url: string;
};

export const initialActivity: Activity = {
     activity_url: '',
     title: '',
     gallery: [],
     cover_url: '',
     links: [],
     published_date: new Date(),
     category: 'youth',
     favorited: true,
     favorited_number: 150,
     descriptions: [],
     quill_editor_data: '',
     author: '',
     status: 'to-do',
     list: [],
     list_title: '',
     locale: 'sr',
};
