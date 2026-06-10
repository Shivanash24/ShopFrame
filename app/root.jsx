import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
  useLoaderData,
} from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";

import { addDocumentResponseHeaders } from "./shopify.server";

import { json } from "@remix-run/node";

export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const host = url.searchParams.get("host");

  return json({ 
    apiKey: process.env.SHOPIFY_API_KEY || "",
    host: host || null
  }, {
    headers: addDocumentResponseHeaders(request, new Headers()),
  });
};

export default function App() {
  const data = useLoaderData();
  const apiKey = data?.apiKey || "";

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="preconnect" href="https://cdn.shopify.com/" />
        <link
          rel="stylesheet"
          href="https://cdn.shopify.com/static/fonts/inter/v4/styles.css"
        />
        {apiKey && <meta name="shopify-api-key" content={apiKey} />}
        <script src="https://cdn.shopify.com/shopifycloud/app-bridge.js"></script>
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  return (
    <html lang="en">
      <head>
        <title>Oh no!</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <script src="https://cdn.shopify.com/shopifycloud/app-bridge.js"></script>
        <Meta />
        <Links />
      </head>
      <body>
        {/* We still call boundary.error(error) to handle Shopify's OAuth redirects and headers, while maintaining a valid HTML structure for other app errors */}
        <div style={{ padding: "20px" }}>
          {boundary.error(error)}
        </div>
        <Scripts />
      </body>
    </html>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
