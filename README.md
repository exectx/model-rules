# Modelrules

![Modelrules Hero Image](hero.png)

Modelrules is a rules engine for LLM APIs. It provides a simple way to override any API parameters for OpenAI-compatible LLM providers. It's ideal for environments where LLM clients are constrained to specific parameters or can't offer flexible customization.

All configuration rules are applied server-side, and you can securely store your LLM provider credentials.

## How it Works

1.  **Create a Virtual API Key**: Generate a new API key within the Modelrules application.
2.  **Define a Ruleset**: Create a ruleset for a specific LLM provider or model. In the ruleset, you can override API parameters (like `temperature`, `top_p`, etc.) and securely provide the credentials for the target LLM provider.
3.  **Make a Request**: Send a request to the Modelrules API as you would to the OpenAI API. To specify which ruleset to use, prepend its name and two colons to the model name. For example, with a ruleset named "my-ruleset" and the "gpt-3.5-turbo" model, set the model to `"my-ruleset::gpt-3.5-turbo"`.

## Example Usage

Here's how you can make a request:

### cURL

```bash
curl -X POST https://rules.exectx.run/api/chat/completions \
-H "Authorization: Bearer $RULES_API_KEY" \
-H "Content-Type: application/json" \
-d '{
  "model": "my-ruleset::o4-mini",
  "messages": [{
    "role": "user",
    "content": "What is the capital of France?"
  }]
}'
```

## Local Development

For detailed instructions on how to run the project locally, please see the [local development guide](./apps/rules/README.md#local-development).
