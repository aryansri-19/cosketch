import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import { UserModel } from './lib/models/user.model';
import { insertUser } from './lib/actions/user.action';

export const { handlers: { GET, POST }, signIn, signOut, auth } = NextAuth({
    providers: [
        Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
        })
    ],
    callbacks: {
        async session({ session }) {
            if (session) {
                const user = await UserModel.findOne({
                    email: session.user.email
                });
                session.user.id = user.id;
                session.user.name = user.name;
                session.user.image = user.image;
            }
            return session;
        },
        async signIn ({ user, profile }) {
            if( user.email && profile ) {
                await insertUser({
                    name: profile.name!,
                    email: profile.email!,
                    image: profile.picture!
                });
                return true;
            }
            return false;
        },
    }
});