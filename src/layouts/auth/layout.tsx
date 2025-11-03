'use client'

import PropTypes from 'prop-types';
import { Box, Unstable_Grid2 as Grid } from '@mui/material';
import { useSession } from 'next-auth/react';

// TODO: Change subtitle text

export const Layout = (props: any) => {
     const { children } = props;
     const session = useSession();
     console.log('session', session);

     return (
          <Box
               component="main"
               sx={{
                    display: 'flex',
                    flex: '1 1 auto'
               }}
          >
               <Grid
                    container
                    sx={{ flex: '1 1 auto' }}
               >
                    <Grid
                         xs={12}
                         lg={6}
                         sx={{
                              display: 'flex',
                              flexDirection: 'column',
                              position: 'relative'
                         }}
                    >
                         {children}
                    </Grid>
               </Grid>
          </Box>
     );
};

Layout.prototypes = {
     children: PropTypes.node
};