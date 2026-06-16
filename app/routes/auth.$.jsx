import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");
  console.log(`[OAuth] Handling callback/begin for shop: ${shop}, url: ${request.url}`);
  try {
    await authenticate.admin(request);
    console.log(`[OAuth] Token exchange completed successfully for shop: ${shop}`);
  } catch (error) {
    if (error instanceof Response) {
      console.log(`[OAuth] OAuth flow progressing (Redirect response thrown).`);
      throw error;
    }
    console.error(`[OAuth] CRITICAL ERROR: Token exchange failed for shop: ${shop}!`);
    console.error(`[OAuth] Request Headers:`, Object.fromEntries(request.headers.entries()));
    console.error(`[OAuth] Error Details:`, error);
    throw error;
  }
  return null;
};
