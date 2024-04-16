import DocIcon from '@heroicons/react/24/solid/DocumentIcon';
import { SvgIcon } from '@mui/material';

export const items = [
     {
          title: 'Projects',
          path: '/project-summaries?page=0&limit=5',
          icon: (
               <SvgIcon fontSize="small">
                    <DocIcon />
               </SvgIcon>
          )
     },
     {
          title: 'Project Activities',
          path: '/project-activities?page=0&limit=5',
          icon: (
               <SvgIcon fontSize="small">
                    <DocIcon />
               </SvgIcon>
          )
     },
     {
          title: 'Activities',
          path: '/activities?page=0&limit=5',
          icon: (
               <SvgIcon fontSize="small">
                    <DocIcon />
               </SvgIcon>
          )
     }
];
