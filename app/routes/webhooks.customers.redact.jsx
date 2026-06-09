import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {
  const { topic, shop, webhookId } = await authenticate.webhook(request);

  console.log(`Received CUSTOMERS_REDACT webhook for ${shop}`);

  // This app doesn't store customer PII, but we acknowledge the request
  // and return HTTP 200 so Shopify knows we processed it.

  return new Response("Webhook processed", { status: 200 });
};
