import { CircularProgress } from "@mui/material";
import { useSession } from "next-auth/react";

export const withAuthGuard = (Component: any) => (props: any) => {
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      window.location.href = '/auth/login';
    }
  });

  if (status === "loading") {
    return <CircularProgress sx={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      marginTop: '-20px',
      marginLeft: '-20px'
    }} />;
  }

  return (
    <Component {...props} />
  );
};
