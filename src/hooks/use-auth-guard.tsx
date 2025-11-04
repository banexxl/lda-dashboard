import { CircularProgress } from "@mui/material";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";

export const withAuthGuard = (Component: any) => (props: any) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push('/auth/login');
    }
  }, [status, router]);

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
    return null; // Don't render anything while redirecting
  }

  return (
    <Component {...props} />
  );
};
