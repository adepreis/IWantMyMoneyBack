import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getConnection } from "typeorm";
import { User } from "../../../entity/user.entity";
import { prepareConnection } from "../database";

export default NextAuth({
  providers: [
    CredentialsProvider({
        name: 'Credentials',
        credentials: {
          email: { label: "Email", type: "text"},
          password: {  label: "Password", type: "password" }
        },
        async authorize(credentials, req) {
          try {
            await prepareConnection();
            const conn = getConnection();
            const usersRepo = conn.getRepository(User);

            const user = await usersRepo.findOne({
              "email": credentials?.email,
              // Must be hashed :)
              "password": credentials?.password
            });
            return user ? { 
              email: credentials?.email
            } : null;
          }
          catch (e) {
            console.log(e);
          }
          return null;
        }
      })
  ],
  secret: process.env.SECRET,
  session: {
    strategy: "jwt"
  },
  jwt: {
    secret: process.env.SECRET,
  },
  pages: {
    signIn: '/auth/signin',  // Displays signin buttons
    // signOut: '/auth/signout', // Displays form with sign out button
    // error: '/auth/error', // Error code passed in query string as ?error=
    // verifyRequest: '/auth/verify-request', // Used for check email page
    // newUser: null // If set, new users will be directed here on first sign in
  },
  callbacks: {
    // async signIn({ user, account, profile, email, credentials }) {
    //   return true 
    // },
    // // async redirect({ url, baseUrl }) { return baseUrl },
    // async session({ session, token, user }) {
    //   return session
    // },
    // async jwt({ token, user, account, profile, isNewUser }) { return token }
  },
  events: {},
  debug: false,
})
