import NextAuth, {AuthOptions} from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions : AuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
            clientSecret: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET,
        }),
    ],
    session: { strategy: "jwt"},
    callbacks: {
        async jwt({ token, account }) {
            if (account) {
                token.google_id_token = account.id_token;
                console.log("jwt");
            }
            return token;
        },
        async redirect({baseUrl}) {
            console.log("@@@@@@@redirect");
            const target = new URL("auth/loading?next=/", baseUrl);
            return target.toString();
        }
    }
}

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };