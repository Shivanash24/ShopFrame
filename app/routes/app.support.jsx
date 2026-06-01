import { useNavigate } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  BlockStack,
  Text,
  Button,
  FormLayout,
  TextField,
} from "@shopify/polaris";

export default function SupportPage() {
  const navigate = useNavigate();

  return (
    <Page title="Support" backAction={{content: 'Dashboard', onAction: () => navigate('/app')}}>
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            <Card>
              <BlockStack gap="400">
                <Text variant="headingLg" as="h2">How can we help?</Text>
                <Text as="p">Have a question about a template or need help customizing? Send us a message.</Text>
                
                <FormLayout>
                  <TextField label="Subject" autoComplete="off" />
                  <TextField label="Message" multiline={4} autoComplete="off" />
                  <Button variant="primary">Send Message</Button>
                </FormLayout>
              </BlockStack>
            </Card>
            
            <Card title="FAQs">
              <BlockStack gap="400">
                <Text variant="headingMd" as="h3">Frequently Asked Questions</Text>
                <BlockStack gap="200">
                  <Text fontWeight="bold" as="p">How do I apply a template?</Text>
                  <Text as="p">Go to the Templates page, select a template, and click "Apply". This will sync the design to your active theme.</Text>
                  
                  <Text fontWeight="bold" as="p">Can I change colors and fonts?</Text>
                  <Text as="p">Yes! The Customize page allows you to edit branding, text, and reorder sections.</Text>
                </BlockStack>
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
