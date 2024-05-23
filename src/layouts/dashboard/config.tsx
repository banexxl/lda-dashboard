import DocIcon from '@heroicons/react/24/solid/DocumentIcon';
import { SvgIcon } from '@mui/material';

export const items = [
     {
          title: 'Projects',
          path: '/project-summaries',
          icon: (
               <SvgIcon fontSize="small">
                    <DocIcon />
               </SvgIcon>
          )
     },
     {
          title: 'Project Activities',
          path: '/project-activities',
          icon: (
               <SvgIcon fontSize="small">
                    <DocIcon />
               </SvgIcon>
          )
     },
     {
          title: 'Activities',
          path: '/activities',
          icon: (
               <SvgIcon fontSize="small">
                    <DocIcon />
               </SvgIcon>
          )
     }
];
