import { UserServices } from "@/utils/user-services";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// Define the User type
type User = {
     _id: string;
     email: string;
     // other user properties
}

export const authOptions = {
     // Configure one or more authentication providers
     providers: [
          GoogleProvider({
               clientId: process.env.GOOGLE_CLIENT_ID!,
               clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          }),
          // ...add more providers here
     ],
     callbacks: {
          async signIn({ account, profile }: any) {
               // Check if account exists on MongoDB and if so, return true
               if (account.provider === "google") {
                    const user = await UserServices().getUserByEmail(profile.email)
                    console.log('user', user[0]);
                    console.log(profile.email_verified)
                    console.log(profile.email.endsWith("@gmail.com"))
                    console.log(user[0].email ? true : false)

                    return profile.email_verified && profile.email.endsWith("@gmail.com") && user[0].email ? true : false;
               }
               return false; // Do different verification for other providers that don't have `email_verified`
          },
          async session({ session, token, user }: any) {
               const sessionUser = await UserServices().getUserByEmail(user.email);
               if (sessionUser.length > 0) {
                    session.user.id = sessionUser[0]._id;
               }
               return session;
          },
     }
}
export default NextAuth(authOptions);
