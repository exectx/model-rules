# Modelrules API

Modelrules is a rules engine for LLM APIs. It provides a simple way to override any API parameters for OpenAI-compatible LLM providers. It's ideal for environments where LLM clients are constrained to specific parameters or can't offer flexible customization.

All configuration rules are applied server-side, and you can securely store your LLM provider credentials.

## Features

- **Customizable Rules**: Create custom rules to overwrite your LLM API parameters and apply them per model or provider.
- **Secure Credential Storage**: Securely store provider API keys and credentials.
- **Access Token Management**: Create and revoke access tokens for your applications.
- **OpenAI-Compatible**: Drop-in replacement for any OpenAI-compatible API.
- **Built with Modern Tech**: Server-side rendering with React Router, Vite for fast development, and TailwindCSS for styling.

## How it Works

1.  **Create a Virtual API Key**: Generate a new API key within the Modelrules application.
2.  **Define a Ruleset**: Create a ruleset for a specific LLM provider or model. In the ruleset, you can override API parameters (like `temperature`, `top_p`, etc.) and securely provide the credentials for the target LLM provider.
3.  **Make a Request**: Send a request to the Modelrules API as you would to the OpenAI API. To specify which ruleset to use, prepend its name and two colons to the model name. For example, with a ruleset named "my-ruleset" and the "gpt-3.5-turbo" model, set the model to `"my-ruleset::gpt-3.5-turbo"`.

## Example Usage

Here's how you can make a request using different languages:

### cURL

```bash
curl -X POST http://localhost:5173/api/chat/completions \
-H "Authorization: Bearer $RULES_API_KEY" \
-H "Content-Type: application/json" \
-d '{
  "model": "my-ruleset::gpt-3.5-turbo",
  "messages": [{
    "role": "user",
    "content": "What is the capital of France?"
  }]
}'
```

### JavaScript

```javascript
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.RULES_API_KEY,
  baseURL: "http://localhost:5173/api",
});

async function main() {
  const chatCompletion = await openai.chat.completions.create({
    model: "my-ruleset::gpt-3.5-turbo",
    messages: [
      {
        role: "user",
        content: "What is the capital of France?",
      },
    ],
  });

  console.log(chatCompletion.choices[0].message.content);
}

main();
```

### Python

```python
import os
from openai import OpenAI

client = OpenAI(
    api_key=os.environ.get("RULES_API_KEY"),
    base_url="http://localhost:5173/api",
)

chat_completion = client.chat.completions.create(
    model="my-ruleset::gpt-3.5-turbo",
    messages=[
        {
            "role": "user",
            "content": "What is the capital of France?",
        }
    ],
)

print(chat_completion.choices[0].message.content)
```

## Local Development

To run the project locally, follow these steps:

### Installation

Install the dependencies:

```bash
pnpm install
```

### Development

Start the development server with HMR:

```bash
pnpm run dev
```

Your application will be available at `http://localhost:5173`.

### Clerk Setup

This project uses Clerk for authentication. To run it locally, you'll need to set up the following environment variables and bindings.

**1. Environment Variables:**

Create a `.dev.vars` file in the `apps/rules` directory and add the following secrets. You can get the Clerk keys from your Clerk dashboard and the database credentials from your Turso dashboard.

```
CLERK_SECRET_KEY="<YOUR_CLERK_SECRET_KEY>"
VITE_CLERK_PUBLISHABLE_KEY="<YOUR_CLERK_PUBLISHABLE_KEY>"
ENCRYPTION_KEY="<YOUR_ENCRYPTION_KEY>"
DATABASE_URL="<YOUR_TURSO_DATABASE_URL>"
```

**2. Cloudflare KV Binding:**

This project uses Cloudflare KV for caching. You'll need to create a new KV namespace in your Cloudflare dashboard.

Once created, open the `wrangler.jsonc` file and replace the placeholder IDs in the `kv_namespaces` section with your new namespace's `id` and `preview_id`.

## Building for Production

Create a production build:

```bash
pnpm run build
```

## Previewing the Production Build

Preview the production build locally:

```bash
pnpm run preview
```

## Deployment

This project is configured for deployment on Cloudflare Pages.

If you don't have a Cloudflare account, [create one here](https://dash.cloudflare.com/sign-up)! Go to your [Workers dashboard](https://dash.cloudflare.com/?to=%2F%3Aaccount%2Fworkers-and-pages) to see your [free custom Cloudflare Workers subdomain](https://developers.cloudflare.com/workers/configuration/routing/workers-dev/) on `*.workers.dev`.

Once that's done, you can deploy your app:

```sh
pnpm run deploy
```

To deploy a preview URL:

```sh
pnpm wrangler versions upload
```

You can then promote a version to production after verification or roll it out progressively.

```sh
pnpm wrangler versions deploy
```

---

Built with ❤️ using React Router.
