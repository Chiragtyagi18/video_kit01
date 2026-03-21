import NextAuth from "next-auth"

declare module "next-auth" {
  
  interface Session {
    user: {
      id: string;
     
    };default: DefaultSession["user"]
  }
}