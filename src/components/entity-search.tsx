import MagnifyingGlassIcon from '@heroicons/react/24/solid/MagnifyingGlassIcon';
import { Card, InputAdornment, OutlinedInput, SvgIcon } from '@mui/material';

type EntitySearchProps = {
     value: string;
     onChange: (value: string) => void;
     placeholder?: string;
};

export const EntitySearch = ({ value, onChange, placeholder = 'Search' }: EntitySearchProps) => (
     <Card sx={{ p: 2 }}>
          <OutlinedInput
               value={value}
               onChange={(event) => onChange(event.target.value)}
               fullWidth
               placeholder={placeholder}
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
