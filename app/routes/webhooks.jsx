import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {
  const { topic, shop, webhookId } = await authenticate.webhook(request);
  console.log(`Received generic webhook ${topic} for ${shop}`);
  return new Response(null, { status: 200 });
};
