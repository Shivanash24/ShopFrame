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
      if (error.status === 400) {
        const text = await error.text();
        console.error(`[OAuth] 400 Error thrown by authenticate.admin: ${text}`);
        return new Response(
          `<html><body style="font-family: sans-serif; padding: 2rem;">
            <h2>Shopify OAuth Failed (400 Bad Request)</h2>
            <p><strong>Error Details:</strong> ${text}</p>
            <p><strong>Common Fixes:</strong></p>
            <ul>
              <li>Ensure <code>SHOPIFY_API_SECRET</code> in Vercel exactly matches your Shopify Partner Dashboard.</li>
              <li>Ensure <code>SHOPIFY_APP_URL</code> in Vercel is exactly <code>https://shopframe.karvocrm.store</code> (no trailing slash).</li>
              <li>Ensure you are not blocking third-party cookies.</li>
            </ul>
          </body></html>`,
          { status: 400, headers: { "Content-Type": "text/html" } }
        );
      }
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
