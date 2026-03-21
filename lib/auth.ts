import NextAuth, { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";


export const authOptions:NextAuthOptions={
    providers:[
        // Add your authentication providers here (e.g., Google, GitHub, etc.)
        CredentialsProvider({
            name:"Credentials",
            credentials:{
                email:{label:"Email", type:"text", placeholder:"Enter your email"},
                password:{label:"Password", type:"password", placeholder:"Enter your password"}

            }, 
            async authorize(credentials){
                if(!credentials?.email || !credentials?.password){
                    throw new Error("Email and password are required");
                }
                try {
                    await connectToDatabase();
                    const user = await User.findOne({email:credentials.email});
                    if(!user || user.password == credentials.password){
                        throw new Error("Invalid email or password");
                    }
                    return {id:user._id.toString(), email:user.email};
                } catch (error) {
                    console.error("Error during authentication:", error);
                    throw new Error("Internal Server Error");
                }
            },

        }),
    ],
    callbacks:{
        async jwt({token, user}){
            if(user){
                token.sub = user.id;
            }
            return token;

        },
        async session({session, token}) {
            if (session.user) {
                session.user.id = token.sub || "";
            }
            
            return session;
        }   
    },
    pages:{
        signIn:"/login",
        error:"/login",


    },
    session:{
        strategy:"jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    secret: process.env.NEXTAUTH_SECRET,
}
    
