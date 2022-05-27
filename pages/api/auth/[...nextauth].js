import NextAuth from 'next-auth';
import GithubProvider from 'next-auth/providers/github';
import OsuProvider from "next-auth/providers/osu";

import { db } from '../../../lib/firebase';
import { setDoc, getDoc, collection, doc } from 'firebase/firestore';

export default NextAuth({
    // Configure one or more authentication providers
    providers: [
        GithubProvider({
            clientId: process.env.GITHUB_ID,
            clientSecret: process.env.GITHUB_SECRET,
        }),
        /*OsuProvider({
            clientId: process.env.OSU_CLIENT_ID,
            clientSecret: process.env.OSU_CLIENT_SECRET,
        }),*/
        // ...add more providers here
    ],
    callbacks: {
        async signIn({ user, account, profile, email, credentials }) {
            const users = collection(db, 'users');

            const q = await getDoc(doc(users, user.id.toString()));
            if (!q.exists()) {
                try {
                    // create data if it doesn't exist yet
                    await setDoc(doc(users, user.id.toString()), {
                        name: user.name,
                        id: user.id,
                        balance: 100,
                        wallet: {},
                    });
                } catch (e) {
                    console.error('Error adding document: ', e);
                }
            }
            return true;
        },
        async jwt({ token, account }) {
            // Persist the OAuth access_token to the token right after signin
            /*if (account) {
                token.accessToken = account.access_token;
            }*/

            return token;
        },
        async session({ session, token }) {
            // Send properties to the client, like an access_token from a provider.
            return session;
        },
    },
});
