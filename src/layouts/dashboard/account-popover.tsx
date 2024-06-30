import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import PropTypes from 'prop-types';
import { Box, Divider, MenuItem, MenuList, Popover, Typography } from '@mui/material';
import { useSession } from 'next-auth/react';

export const AccountPopover = (props: any) => {
     const { anchorEl, onClose, open } = props;
     const router = useRouter();
     const auth: any = useSession()

     const handleSignOut = useCallback(
          () => {
               onClose?.();
               auth.signOut();
               window.sessionStorage.setItem('authenticated', 'false')
               router.push('/auth/login');
          },
          [onClose, auth, router]
     );

     return (
          <Popover
               anchorEl={anchorEl}
               anchorOrigin={{
                    horizontal: 'left',
                    vertical: 'bottom'
               }}
               onClose={onClose}
               open={open}
               PaperProps={{ sx: { width: 200 } }}
          >
               <Box
                    sx={{
                         py: 1.5,
                         px: 2
                    }}
               >
                    <Typography variant="overline">
                         Account
                    </Typography>
                    <Typography
                         color="text.secondary"
                         variant="body2"
                    >
                         {auth.user?.name}

                    </Typography>
                    <Typography
                         color="text.secondary"
                         variant="body2"
                    >
                         {auth.user?.email}
                    </Typography>
               </Box>
               <Divider />
               <MenuList
                    disablePadding
                    dense
                    sx={{
                         p: '8px',
                         '& > *': {
                              borderRadius: 1
                         }
                    }}
               >
                    <MenuItem onClick={handleSignOut}>
                         Sign out
                    </MenuItem>
               </MenuList>
          </Popover>
     );
};

AccountPopover.propTypes = {
     anchorEl: PropTypes.any,
     onClose: PropTypes.func,
     open: PropTypes.bool.isRequired
};
