/**
 * Global OPTIONS (CORS preflight) handler.
 * Shopify's embedded app iframe and App Bridge fire preflight requests
 * before every API call. Without this, the browser receives no CORS headers
 * and blocks the request with net::ERR_FAILED.
 */
export const loader = async ({ request }) => {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
        "Access-Control-Allow-Headers":
          "Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Shopify-Access-Token",
        "Access-Control-Max-Age": "86400",
      },
    });
  }
  return new Response(null, { status: 404 });
};

export const action = loader;
