import { authenticate } from "../shopify.server";
import db from "../db.server";

export const action = async ({ request }) => {
  const { topic, shop, webhookId } = await authenticate.webhook(request);

  console.log(`Received SHOP_REDACT webhook for ${shop}`);

  // When a shop is redacted (usually 48 hours after uninstalling), 
  // delete their shop data from our database to comply with GDPR.
  try {
    // Delete session
    await db.session.deleteMany({ where: { shop } });
    
    // Delete store record
    await db.store.deleteMany({ where: { shop } });
    
    // Delete subscription record
    await db.subscription.deleteMany({ where: { shop } });

    console.log(`Successfully redacted data for ${shop}`);
  } catch (err) {
    console.error(`Error during SHOP_REDACT for ${shop}:`, err);
  }

  return new Response("Webhook processed", { status: 200 });
};
