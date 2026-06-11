import { PassThrough } from "stream";
import { renderToPipeableStream } from "react-dom/server";
import { RemixServer } from "@remix-run/react";
import { createReadableStreamFromReadable } from "@remix-run/node";
import { isbot } from "isbot";
import { addDocumentResponseHeaders } from "./shopify.server";

export const streamTimeout = 5000;


export default async function handleRequest(
  request,
  responseStatusCode,
  responseHeaders,
  remixContext,
) {
  addDocumentResponseHeaders(request, responseHeaders);

  // Ensure CORS and CSP headers are set for Shopify embedded app iframe context.
  // These prevent net::ERR_FAILED when the app is loaded inside the Shopify Admin.
  responseHeaders.set("Content-Security-Policy", "frame-ancestors https://admin.shopify.com https://*.myshopify.com;");
  responseHeaders.delete("X-Frame-Options");

  // Explicit CORS headers for all document responses
  if (!responseHeaders.has("Access-Control-Allow-Origin")) {
    responseHeaders.set("Access-Control-Allow-Origin", "*");
  }
  if (!responseHeaders.has("Access-Control-Allow-Methods")) {
    responseHeaders.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
  }
  if (!responseHeaders.has("Access-Control-Allow-Headers")) {
    responseHeaders.set("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Shopify-Access-Token");
  }
  const userAgent = request.headers.get("user-agent");
  const callbackName = isbot(userAgent ?? "") ? "onAllReady" : "onShellReady";

  return new Promise((resolve, reject) => {
    const { pipe, abort } = renderToPipeableStream(
      <RemixServer context={remixContext} url={request.url} />,
      {
        [callbackName]: () => {
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);

          responseHeaders.set("Content-Type", "text/html");
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode,
            }),
          );
          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          console.error(error);
        },
      },
    );

    // Automatically timeout the React renderer after 6 seconds, which ensures
    // React has enough time to flush down the rejected boundary contents
    setTimeout(abort, streamTimeout + 1000);
  });
}
