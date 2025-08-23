import { env } from "cloudflare:workers";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, anonymous, magicLink, oneTimeToken } from "better-auth/plugins";
import { passkey } from "better-auth/plugins/passkey";
import { Resend } from "resend";
import { db } from "@/server/db";
import * as schema from "../db/schema/auth";
import { magicLinkTemplate } from "./emails/magic-link";
import { forgotPasswordTemplate } from "./emails/otp";

const resend = new Resend(env.RESEND_API_KEY);
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",

    schema: schema,
  }),
  plugins: [
    oneTimeToken(),
    anonymous(),
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        await resend.emails.send({
          from: "no-reply@omokage.app",
          to: email,
          subject: "Magic link",
          react: magicLinkTemplate(url, env.VITE_SERVER_URL),
        });
      },
    }),
    // oneTap(),
    admin(),
    passkey(),
  ],
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      await resend.emails.send({
        from: "no-reply@omokage.app",
        to: user.email,
        subject: "Reset password",
        react: forgotPasswordTemplate(url, env.VITE_SERVER_URL),
      });
    },
  },
  socialProviders: {
    google: {
      enabled: true,
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.VITE_SERVER_URL,
});
