'use client'

import { CircularProgress } from "@mui/material";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";


export const withAuthGuard = (Component: any) => (props: any) => {

  const { data: session, status } = useSession();
  const router = useRouter();

  //circular process in the middle screen
  if (status === "loading") {
    return <CircularProgress sx={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      marginTop: '-20px',
      marginLeft: '-20px'
    }} />;
  }

  if (status === "unauthenticated") {
    router.push('/auth/login');
  }

  return (
    <Component {...props} />
  );
};
