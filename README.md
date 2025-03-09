# Rules API Documentation - Rules

## Overview

Rules provides a unified API endpoint for interacting with various LLM providers. It allows you to customize request parameters and apply the matching rules before proxying to the configured provider.

## Authentication

All API requests require authentication using a Bearer token:

```
Authorization: Bearer your_api_token
```

You can generate API tokens in the dashboard.

## Proxy Endpoint

### Send a Chat Completion Request

Update the `baseUrl` parameter in your OpenAI client to point to the proxy endpoint.

**Endpoint**: `POST /api/chat/completions`

**Request Format**:

```json
{
  "model": "openai::gpt-4",
  "messages": [
    { "role": "system", "content": "You are a helpful assistant." },
    { "role": "user", "content": "Tell me about parameter overrides." }
  ],
  "temperature": 0.7,
  "max_tokens": 500
}
```

**Model Name Format**:

- With provider prefix: `provider::model` (e.g., `openai::gpt-4`, `anthropic::claude-2`)
- TODO: Without prefix: Just the model name (e.g., `gpt-4`) - uses default provider

**Response**:

The response will match the format returned by the OpenAI API.

## Rules

Your request parameters will be combined with any configured provider-level or model-specific rules. Request parameters always take precedence over stored overrides.

## Best Practices

1. Use specific provider prefixes in multi-provider setups
2. Configure sensible defaults at the provider and model level
3. Override parameters only when needed for specific requests
4. Use streaming for real-time responses
5. Monitor token usage to avoid rate limits

## Error Handling

Possible error responses:

- 400: Bad Request (invalid parameters)
- 401: Unauthorized (missing or invalid token)
- 404: Not Found (unknown route or model)
- 429: Too Many Requests (rate limit exceeded)
- 500: Internal Server Error
