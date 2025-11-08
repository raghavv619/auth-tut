import type { NextAuthConfig } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

import bcrypt from "bcryptjs"
import { db } from "~/server/db"
import { users } from "~/server/db/schema"
import { eq } from "drizzle-orm"

export const authOptions: NextAuthConfig = {
    providers: [
        CredentialsProvider({
            id: "credentials",
            name: "Credentials",
            credentials: {
                username: { label: "Email", type: "text", placeholder: "jsmith" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials: any): Promise<any> {
                try {
                    const user = await db.query.users.findFirst({
                        where: eq(users.email, credentials.email)
                    });
                    if(!user){
                        throw new Error("No user found");
                    }
                    if(!user.emailVerified){
                        throw new Error("Please verify your account first");
                    }
                    await bcrypt.compare(credentials.password, user.password)
                }
                catch (err: any) {
                    throw new Error(err);
                }

            }
        })
    ]
}