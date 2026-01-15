import NextAuth, { NextAuthOptions } from "next-auth"
import CognitoProvider from "next-auth/providers/cognito"

export const authOptions: NextAuthOptions = {
    providers: [
        CognitoProvider({
            clientId: process.env.COGNITO_CLIENT_ID as string,
            clientSecret: process.env.COGNITO_CLIENT_SECRET as string,
            issuer: process.env.COGNITO_ISSUER as string,
            checks: ['nonce']
        }),
    ],
    callbacks: {
        async jwt({ token, account }) {
            // Persist the OAuth access_token and id_token to the token right after signin
            if (account) {
                token.accessToken = account.access_token;
                token.id_token = account.id_token;
            }
            return token;
        },
        async session({ session, token }) {
            // Send properties to the client
            (session as any).accessToken = token.accessToken;
            (session as any).id_token = token.id_token;
            return session;
        },
    },
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
4
