import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google';
import { NextRequest } from 'next/server';

export const { handlers, auth } = NextAuth((req) => {
    console.log(req)
    return {
        providers: [
            Google({
                clientId: process.env.AUTH_GOOGLE_ID,
                clientSecret: process.env.AUTH_GOOGLE_SECRET,
            })
        ]
    }
})