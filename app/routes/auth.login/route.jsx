import { useState } from "react";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import {
  AppProvider as PolarisAppProvider,
  Button,
  Card,
  FormLayout,
  Page,
  Text,
  TextField,
} from "@shopify/polaris";
import polarisTranslations from "@shopify/polaris/locales/en.json";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import { login, sessionStorage } from "../../shopify.server";
import { loginErrorMessage } from "./error.server";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }) => {
  const errors = loginErrorMessage(await login(request));

  return { errors, polarisTranslations };
};

export const action = async ({ request }) => {
  const formData = await request.clone().formData();
  const shop = formData.get("shop");
  console.log(`[OAuth] Starting login/install flow for shop: ${shop}`);
  
  if (shop) {
    try {
      // FIX: Force a fresh install by clearing any stale sessions in the DB for this shop.
      // If a session exists, `login()` silently redirects to the admin dashboard instead of showing the install screen.
      const sessions = await sessionStorage.findSessionsByShop(shop);
      if (sessions && sessions.length > 0) {
        for (const session of sessions) {
          await sessionStorage.deleteSession(session.id);
        }
        console.log(`[OAuth] Cleared ${sessions.length} stale sessions for ${shop} to force re-install.`);
      }
    } catch (e) {
      console.error("[OAuth] Failed to clear stale sessions:", e);
    }
  }

  const errors = loginErrorMessage(await login(request));

  return {
    errors,
  };
};

export default function Auth() {
  const loaderData = useLoaderData();

  return (
    <PolarisAppProvider i18n={loaderData.polarisTranslations}>
      <Page>
        <Card>
          <FormLayout>
            <Text variant="headingMd" as="h2">
              Authenticating...
            </Text>
            <Text>
              If you are seeing this page, your session may have expired or the app needs to re-authenticate. 
              Please <b>refresh the page</b> or access the app again from your Shopify Admin dashboard.
            </Text>
          </FormLayout>
        </Card>
      </Page>
    </PolarisAppProvider>
  );
}
