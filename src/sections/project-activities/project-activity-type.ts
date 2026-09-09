import * as yup from 'yup';
import { CATEGORY_VALUES, Category, Locale, Status } from '@/types/content-enums';

export type ProjectCategory = Category;
export type ProjectStatus = Status;
export const projectCategory = CATEGORY_VALUES;

export type ProjectActivity = {
     id?: string;
     project_summary_id: string | null;
     project_url: string;
     links: string[];
     title: string;
     sub_title: string,
     paragraphs: string[];
     quill_editor_data?: string;
     content_html?: string;
     has_translation: boolean;
     title_eng: string;
     sub_title_eng: string,
     paragraphs_eng: string[];
     content_html_eng?: string;
     category: ProjectCategory;
     status: ProjectStatus;
     locations: string[];
     published: Date;
     favorited?: boolean;
     favorited_number?: number;
     organizers: string[];
     sub_organizers: string[];
     applicants: string[];
     donators: string[];
     publications: string[];
     gallery: string[];
     show_project_details: boolean;
     show_list: boolean;
     show_list_on_bottom: boolean;
     list_title: string;
     list: string[];
     locale: Locale
};

export const ProjectActivitySchema = yup.object().shape({
     title: yup.string().required('Naslov je obavezan'),
     sub_title: yup.string(),
     project_url: yup.string().required('URL projektne aktivnost je obavezan'),
     project_summary_id: yup.string().required('Glavni projekat je obavezan'),
     status: yup.string().required('Status je obavezan'),
     locale: yup.string().required('Jezik je obavezan'),
     list: yup.array().of(yup.string()),
     list_title: yup.string(),
     links: yup.array().of(yup.string()),
     paragraphs: yup
          .array()
          .of(yup.string())
          .test(
               'paragraphs-or-quill',
               'Bar jedan pasus ili sadržaj iz editora je obavezan',
               function (value) {
                    const contentHtml = (this.parent as any)?.quill_editor_data
                    const hasParagraph = Array.isArray(value) && value.some((v) => (typeof v === 'string' ? v.trim().length > 0 : false))
                    const hasHtml = typeof contentHtml === 'string' && contentHtml.trim().length > 0
                    return hasParagraph || hasHtml
               }
          ),
     locations: yup.array().min(1, 'Bar jedna lokacija je obavezna').of(yup.string().required('Bar jedna lokacija je obavezan')),
     applicants: yup.array().of(yup.string()),
     organizers: yup.array().of(yup.string()),
     sub_organizers: yup.array().of(yup.string()),
     donators: yup.array().of(yup.string()),
     category: yup.string().required('Kategorija je obavezna'),
     published: yup.date().typeError('Datum mora biti u odgovarajućem formatu!').required('Datum za objavu je obavezan!'),
     show_project_details: yup.boolean(),
     show_list: yup.boolean(),
     show_list_on_bottom: yup.boolean(),
});

export const projectActivityInitialValues: ProjectActivity = {
     title_eng: '',
     sub_title_eng: '',
     paragraphs_eng: [],
     content_html_eng: '',
     has_translation: false,
     title: '',
     sub_title: '',
     project_summary_id: null,
     project_url: '',
     category: 'other',
     status: 'to-do',
     published: new Date(),
     applicants: [],
     organizers: [],
     sub_organizers: [],
     donators: [],
     paragraphs: [],
     quill_editor_data: '',
     content_html: '',
     links: [],
     publications: [],
     locations: [],
     gallery: [],
     show_project_details: false,
     show_list: false,
     show_list_on_bottom: false,
     list_title: '',
     list: [],
     locale: 'sr'
};
