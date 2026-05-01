import SourceIcon from '@mui/icons-material/Source';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PostAddIcon from '@mui/icons-material/PostAdd';
import { SvgIcon } from '@mui/material';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

export const items = [
     {
          title: 'Projects',
          path: '/project-summaries',
          icon: (
               <SvgIcon fontSize="small">
                    <SourceIcon />
               </SvgIcon>
          )
     },
     {
          title: 'Project Activities',
          path: '/project-activities',
          icon: (
               <SvgIcon fontSize="small">
                    <AssignmentIcon />
               </SvgIcon>
          )
     },
     {
          title: 'Activities',
          path: '/activities',
          icon: (
               <SvgIcon fontSize="small">
                    <PostAddIcon />
               </SvgIcon>
          )
     },
     {
          title: 'Publications',
          path: '/publications',
          icon: (
               <SvgIcon fontSize="small">
                    <PictureAsPdfIcon />
               </SvgIcon>
          )
     },
     {
          title: 'Q&A',
          path: '/questions',
          icon: (
               <SvgIcon fontSize="small">
                    <QuestionAnswerIcon />
               </SvgIcon>
          )
     }
];
