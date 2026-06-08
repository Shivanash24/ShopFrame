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

export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const host = url.searchParams.get("host");

  return { 
    apiKey: process.env.SHOPIFY_API_KEY || "",
    host: host || null
  };
};

export default function App() {
  const data = useLoaderData();
  const apiKey = data?.apiKey || "";
  const host = data?.host;

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
        {apiKey && host && (
          <script src="https://cdn.shopify.com/shopifycloud/app-bridge.js"></script>
        )}
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

// Shopify needs Remix to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  const error = useRouteError();
  console.error("Root ErrorBoundary caught an error:", error);
  return (
    <html>
      <head>
        <title>Oh no!</title>
        <Meta />
        <Links />
      </head>
      <body>
        <div style={{ padding: "20px", color: "red", background: "#fee", border: "1px solid red", margin: "20px" }}>
          <h2>Root Error Boundary</h2>
          <pre style={{ whiteSpace: "pre-wrap" }}>
            {error instanceof Error ? error.stack || error.message : JSON.stringify(error)}
          </pre>
          <div style={{ display: "none" }}>
            {boundary.error(error)}
          </div>
        </div>
        <Scripts />
      </body>
    </html>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
