import { Link, Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider } from "@shopify/shopify-app-remix/react";

import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import { authenticate } from "../shopify.server";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }) => {
  await authenticate.admin(request);

  return { apiKey: process.env.SHOPIFY_API_KEY || "" };
};

export default function App() {
  const { apiKey } = useLoaderData();

  return (
    <AppProvider isEmbeddedApp apiKey={apiKey}>
      <ui-nav-menu>
        <Link to="/app" rel="home">Dashboard</Link>
        <Link to="/app/templates">Templates</Link>
        <Link to="/app/customize">Customize</Link>
        <Link to="/app/pricing">Pricing</Link>
        <Link to="/app/settings">Settings</Link>
        <Link to="/app/support">Support</Link>
      </ui-nav-menu>
      <Outlet />
    </AppProvider>
  );
}

// Shopify needs Remix to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  const error = useRouteError();
  console.error("ErrorBoundary caught an error:", error);
  // In development or if we want to debug the blank screen, render the error on screen.
  return (
    <div style={{ padding: "20px", color: "red", background: "#fee", border: "1px solid red", margin: "20px" }}>
      <script src="https://cdn.shopify.com/shopifycloud/app-bridge.js"></script>
      <h2>App Bridge Error Boundary</h2>
      <pre style={{ whiteSpace: "pre-wrap" }}>
        {error instanceof Error ? error.stack || error.message : JSON.stringify(error)}
      </pre>
      <div style={{ display: "none" }}>
        {boundary.error(error)}
      </div>
    </div>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
