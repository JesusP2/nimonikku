import { env } from "cloudflare:workers";
import { createUploadConfig } from "pushduck/server";

const { s3, config } = createUploadConfig()
  .provider("cloudflareR2", {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    region: env.R2_REGION,
    endpoint: env.R2_ENDPOINT,
    bucket: env.R2_BUCKET,
    accountId: env.R2_ACCOUNT_ID!,
  })
  .build();

export const uploadRouter = s3.createRouter({
  imageUpload: s3.image().max("5MB"),
  documentUpload: s3.file().max("10MB"),
});

export type AppUploadRouter = typeof uploadRouter;
