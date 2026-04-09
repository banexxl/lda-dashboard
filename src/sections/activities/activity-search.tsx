import MagnifyingGlassIcon from '@heroicons/react/24/solid/MagnifyingGlassIcon';
import { Card, InputAdornment, OutlinedInput, SvgIcon } from '@mui/material';

type ActivitySearchProps = {
     value: string;
     onChange: (value: string) => void;
};

export const ActivitySearch = ({ value, onChange }: ActivitySearchProps) => (
     <Card sx={{ p: 2 }}>
          <OutlinedInput
               value={value}
               onChange={(event) => onChange(event.target.value)}
               fullWidth
               placeholder="Search activity"
               startAdornment={(
                    <InputAdornment position="start">
                         <SvgIcon
                              color="action"
                              fontSize="small"
                         >
                              <MagnifyingGlassIcon />
                         </SvgIcon>
                    </InputAdornment>
               )}
               sx={{ maxWidth: 500 }}
          />
     </Card>
);
