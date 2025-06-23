import { env } from "cloudflare:workers";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/server/db";
import * as schema from "./db/schema/auth";
import {
  oneTimeToken,
  anonymous,
  magicLink,
  oneTap,
  admin,
} from "better-auth/plugins";
import { passkey } from "better-auth/plugins/passkey";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",

    schema: schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    oneTimeToken(),
    anonymous(),
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        console.log("sendMagicLink", { email, url });
        // await resend.emails.send({
        //   from: "no-reply@omokage.app",
        //   to: email,
        //   subject: "Magic link",
        //   react: magicLinkTemplate(url, env.VITE_CLIENT_APP_URL),
        // });
      },
    }),
    oneTap(),
    admin(),
    passkey(),
  ],
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.VITE_SERVER_URL,
});
