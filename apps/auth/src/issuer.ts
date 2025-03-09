import { issuer } from "@openauthjs/openauth";
import { CloudflareStorage } from "@openauthjs/openauth/storage/cloudflare";
import { ExportedHandler } from "@cloudflare/workers-types";
import { GithubProvider } from "@openauthjs/openauth/provider/github";
import { Database, createConnection, schema } from "@exectx/db";
import { subjects, SubjectShapeSchema } from "@exectx/schema/openauth_session";
import * as v from "valibot";

const envSchema = v.object({
  GITHUB_CLIENT_ID: v.string(),
  GITHUB_CLIENT_SECRET: v.string(),
  DATABASE_URL: v.string(),
});

function getUserByEmail(
  db: Database,
  email: string
): Promise<SubjectShapeSchema | undefined> {
  return db.query.user.findFirst({
    where: (t, { eq }) => eq(t.email, email),
    columns: {
      createdAt: false,
      updatedAt: false,
      deletedAt: false,
      name: false,
      email: false,
    },
  });
}

async function createUserByEmail(
  db: Database,
  email: string
): Promise<SubjectShapeSchema> {
  const name =
    email.lastIndexOf("@") > 0 ? email.slice(0, email.lastIndexOf("@")) : email;
  const [user] = await db
    .insert(schema.user)
    .values({ email, name, tokenVersion: 0 })
    .returning();
  return { id: user.id, tokenVersion: user.tokenVersion };
}

export default {
  async fetch(request, env, ctx) {
    const { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, DATABASE_URL } = v.parse(
      envSchema,
      env
    );

    console.log(new Date().toISOString());

    const cloudflareStorage = CloudflareStorage({
      namespace: env.AuthKV,
    });

    return issuer({
      storage: cloudflareStorage,
      subjects: subjects,
      ttl: {
        access: 60 * 5,
        // refresh: 60 * 10,
      },
      providers: {
        github: GithubProvider({
          clientID: GITHUB_CLIENT_ID,
          clientSecret: GITHUB_CLIENT_SECRET,
          scopes: ["user:email"],
        }),
      },

      success: async (ctx, value) => {
        if (value.provider === "github") {
          const access = value.tokenset.access;
          console.log({ access });
          const response = await fetch("https://api.github.com/user/emails", {
            headers: {
              "User-Agent": "model-rules-auth",
              Authorization: `token ${access}`,
              Accept: "application/vnd.github.v3+json",
            },
          });
          const emails = (await response.json()) as any[];
          const primary = emails.find((email: any) => email.primary);
          console.log(primary);
          if (!primary.verified) {
            throw new Error("GitHub email not verified");
          }
          const db = createConnection(DATABASE_URL);
          let user = await getUserByEmail(db, primary.email);
          user ??= await createUserByEmail(db, primary.email);
          console.log({ subject: user });
          return ctx.subject("user", user);
        }
        throw new Error("Invalid provider");
      },
    }).fetch(request, env, ctx);
  },
} satisfies ExportedHandler<Env>;
