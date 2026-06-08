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
        {!host ? (
          <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
            <h2>App Bridge Loading Error</h2>
            <p>The <code>host</code> parameter is missing from the URL.</p>
            <p>This page cannot load outside of the Shopify Admin iframe without a host parameter.</p>
            <pre>{JSON.stringify(data, null, 2)}</pre>
            <p>Please ensure you are viewing this app from within the Shopify Admin.</p>
          </div>
        ) : (
          <Outlet />
        )}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

// Shopify needs Remix to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
