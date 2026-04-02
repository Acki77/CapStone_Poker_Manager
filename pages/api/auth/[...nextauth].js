import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// Liste der Google-Accounts die Admin-Rechte haben
const ADMIN_EMAILS = [
  "acki1977@googlemail.com", // deine Google-Email hier eintragen
  "andreas-email@gmail.com", // Andreas' Email hier eintragen
];

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async session({ session }) {
      // Prüft ob der eingeloggte User Admin ist und speichert es in der Session
      session.user.isAdmin = ADMIN_EMAILS.includes(session.user.email);
      return session;
    },
  },
});
