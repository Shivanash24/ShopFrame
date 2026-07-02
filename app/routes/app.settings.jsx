import { useLoaderData, useNavigate } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  BlockStack,
  Text,
  Button,
  InlineStack,
  List,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  try {
    const store = await prisma.store.findUnique({
      where: { shop: session.shop },
    });
    return { shop: session.shop, store };
  } catch (error) {
    console.error("Settings loader DB error:", error);
    return { shop: session.shop, store: null };
  }
};

export default function SettingsPage() {
  const { shop, store } = useLoaderData();
  const navigate = useNavigate();

  return (
    <Page title="Settings" backAction={{content: 'Dashboard', onAction: () => navigate('/app')}}>
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            <Card title="Store Profile">
              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">Store Details</Text>
                <List>
                  <List.Item>Shop Domain: {shop}</List.Item>
                  <List.Item>Brand Name: {store?.name || 'Not set'}</List.Item>
                  <List.Item>Category: {store?.category || 'Not set'}</List.Item>
                </List>
                <Button onClick={() => navigate('/app/onboarding')}>Edit Profile</Button>
              </BlockStack>
            </Card>

            <Card title="Danger Zone">
              <BlockStack gap="400">
                <Text variant="headingMd" as="h2" tone="critical">Reset Customizations</Text>
                <Text as="p">This will remove all ShopFrame layout sections from your store theme.</Text>
                <InlineStack>
                  <Button tone="critical">Remove Layout Sections</Button>
                </InlineStack>
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
