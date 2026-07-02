import { useState } from "react";
import { useLoaderData, useNavigate, useSubmit } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  TextField,
  Select,
  FormLayout,
  ProgressBar,
  InlineStack,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const store = await prisma.store.findUnique({
    where: { shop: session.shop },
  });
  
  if (store?.isOnboarded) {
    // Optional: redirect to dashboard if already onboarded
  }

  return { store, shopDomain: session.shop };
};

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  
  const name = formData.get("name");
  const category = formData.get("category");
  const themeStyle = formData.get("themeStyle");

  await prisma.store.upsert({
    where: { shop: session.shop },
    update: {
      name,
      category,
      themeStyle,
      isOnboarded: true,
    },
    create: {
      shop: session.shop,
      name,
      category,
      themeStyle,
      isOnboarded: true,
    }
  });

  return { success: true };
};

export default function OnboardingPage() {
  const { store, shopDomain } = useLoaderData();
  const submit = useSubmit();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [name, setName] = useState(store?.name || shopDomain.replace(".myshopify.com", ""));
  const [category, setCategory] = useState(store?.category || "Fashion");
  const [themeStyle, setThemeStyle] = useState(store?.themeStyle || "Minimalist");

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleComplete = () => {
    submit({ name, category, themeStyle }, { method: "post" });
    navigate('/app');
  };

  const progress = (step / 3) * 100;

  return (
    <Page title="Welcome to ShopFrame">
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            <ProgressBar progress={progress} size="small" tone="primary" />
            
            <Card>
              {step === 1 && (
                <BlockStack gap="400">
                  <Text variant="headingLg" as="h2">Let's set up your store</Text>
                  <Text as="p">Tell us a bit about your brand so we can recommend the perfect layouts.</Text>
                  
                  <FormLayout>
                    <TextField label="Brand Name" value={name} onChange={setName} autoComplete="off" />
                    <Button variant="primary" onClick={handleNext}>Continue</Button>
                  </FormLayout>
                </BlockStack>
              )}

              {step === 2 && (
                <BlockStack gap="400">
                  <Text variant="headingLg" as="h2">What's your business category?</Text>
                  <FormLayout>
                    <Select
                      label="Category"
                      options={["Jewellery", "Fashion", "Footwear", "Streetwear", "Aesthetic Clothing", "Beauty", "Luxury", "Electronics", "Lifestyle", "Modern Minimal"]}
                      value={category}
                      onChange={setCategory}
                    />
                    <InlineStack gap="300">
                      <Button onClick={handleBack}>Back</Button>
                      <Button variant="primary" onClick={handleNext}>Continue</Button>
                    </InlineStack>
                  </FormLayout>
                </BlockStack>
              )}

              {step === 3 && (
                <BlockStack gap="400">
                  <Text variant="headingLg" as="h2">Choose your preferred style</Text>
                  <FormLayout>
                    <Select
                      label="Theme Style"
                      options={["Minimalist", "Bold & Dynamic", "Elegant & Luxury", "Clean & Tech"]}
                      value={themeStyle}
                      onChange={setThemeStyle}
                    />
                    <InlineStack gap="300">
                      <Button onClick={handleBack}>Back</Button>
                      <Button variant="primary" onClick={handleComplete}>Complete Setup</Button>
                    </InlineStack>
                  </FormLayout>
                </BlockStack>
              )}
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
