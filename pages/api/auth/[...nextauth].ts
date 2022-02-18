import { compare } from "bcrypt";
import { Session } from "inspector";
import NextAuth, { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { decode } from "punycode";
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
              "email": credentials?.email
            });

            if (user && credentials?.password) {
              if (await compare(credentials?.password,user.password)) {
                return { 
                  //variable global rendu pour l'utilisateur
                  id: user.id,
                  email: user.email,
                  nom: user.nom,
                  prenom: user.prenom
                } 
              }
            }
          
            return null;
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
    async session({ session, token }) {
      session.id = (token as any).id;
      session.nom = (token as any).nom;
      session.prenom = (token as any).prenom;
      session.email = (token as any).email;

      return session
    },
    async jwt({ token, user, account, profile, isNewUser }) {
      if (user) {
        token.id = user.id;
        token.nom = user.nom;
        token.prenom = user.prenom;
        token.email = user.email;
      }

      return token
    }
  },
  events: {},
  debug: false,
})
