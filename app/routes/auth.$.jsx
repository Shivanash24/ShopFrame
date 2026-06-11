import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  console.log(`[OAuth] Handling callback for ${request.url}`);
  try {
    await authenticate.admin(request);
    console.log(`[OAuth] Token exchange completed successfully for ${request.url}`);
  } catch (error) {
    if (error instanceof Response) {
      console.log(`[OAuth] Token exchange completed. Redirecting to Shopify Admin.`);
      throw error;
    }
    console.error(`[OAuth] Token exchange failed! Error:`, error);
    throw error;
  }
  return null;
};
