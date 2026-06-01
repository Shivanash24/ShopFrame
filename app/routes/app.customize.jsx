import { useState } from "react";
import { useLoaderData, useNavigate, useSubmit, useActionData } from "@remix-run/react";
import {
  Page,
  Text,
  Card,
  Button,
  BlockStack,
  InlineStack,
  TextField,
  Box,
  Icon,
  ButtonGroup,
  Banner,
  Grid,
  Collapsible,
} from "@shopify/polaris";
import { DragHandleIcon, ChevronDownIcon, ChevronUpIcon } from "@shopify/polaris-icons";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { templates } from "../data/templates";

// Customization Components
import BackgroundSettings from "../components/customize/BackgroundSettings";
import TypographySettings from "../components/customize/TypographySettings";
import ButtonSettings from "../components/customize/ButtonSettings";
import GridSettings from "../components/customize/GridSettings";
import LivePreviewPanel from "../components/customize/LivePreviewPanel";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const url = new URL(request.url);
  const templateId = url.searchParams.get("template") || "aesthetic-clothing";

  const template = templates.find(t => t.id === templateId) || templates[0];
  
  const customization = await prisma.customization.findUnique({
    where: { shop_templateId: { shop: session.shop, templateId: template.id } }
  });

  return { 
    template, 
    customization: customization || {
      sections: JSON.stringify(template.sections),
      colors: JSON.stringify({ primary: '#000000', background: '#ffffff' }),
      fonts: JSON.stringify({ heading: 'Inter', body: 'Inter' }),
    }
  };
};

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  
  const intent = formData.get("intent");
  const templateId = formData.get("templateId");
  const sections = formData.get("sections");
  
  if (intent === "save" || intent === "apply") {
    await prisma.customization.upsert({
      where: { shop_templateId: { shop: session.shop, templateId } },
      update: {
        sections: sections,
        colors: formData.get("colors") || "{}",
        fonts: formData.get("fonts") || "{}",
      },
      create: {
        shop: session.shop,
        templateId,
        sections: sections,
        colors: formData.get("colors") || "{}",
        fonts: formData.get("fonts") || "{}",
      }
    });
    
    if (intent === "apply") {
      return { success: true, message: "Template and design applied to your store!" };
    }
    return { success: true, message: "Draft saved successfully." };
  }
  
  return null;
};

export default function CustomizePage() {
  const { template, customization } = useLoaderData();
  const actionData = useActionData();
  const submit = useSubmit();
  const navigate = useNavigate();

  const [sections, setSections] = useState(JSON.parse(customization.sections));
  const [selectedSection, setSelectedSection] = useState(null);
  const [viewMode, setViewMode] = useState("desktop");

  // Collapsible states
  const [openPanels, setOpenPanels] = useState({
    content: true,
    background: false,
    typography: false,
    button: false,
    grid: false,
  });

  const togglePanel = (panel) => {
    setOpenPanels(prev => ({ ...prev, [panel]: !prev[panel] }));
  };

  const moveSection = (index, direction) => {
    const newSections = [...sections];
    if (direction === "up" && index > 0) {
      const temp = newSections[index - 1];
      newSections[index - 1] = newSections[index];
      newSections[index] = temp;
    } else if (direction === "down" && index < newSections.length - 1) {
      const temp = newSections[index + 1];
      newSections[index + 1] = newSections[index];
      newSections[index] = temp;
    }
    setSections(newSections);
  };

  const handleSave = () => {
    submit({
      intent: "save",
      templateId: template.id,
      sections: JSON.stringify(sections),
      colors: customization.colors,
      fonts: customization.fonts,
    }, { method: "post" });
  };

  const handleApply = () => {
    submit({
      intent: "apply",
      templateId: template.id,
      sections: JSON.stringify(sections),
      colors: customization.colors,
      fonts: customization.fonts,
    }, { method: "post" });
  };

  const handleSettingChange = (category, updatedSettings) => {
    if (!selectedSection) return;
    const newSettings = { 
      ...(selectedSection.settings || {}), 
      [category]: updatedSettings 
    };
    
    const newSections = sections.map(s => 
      s.id === selectedSection.id ? { ...s, settings: newSettings } : s
    );
    
    setSections(newSections);
    setSelectedSection({...selectedSection, settings: newSettings});
  };

  const handleContentChange = (key, val) => {
    const newSections = sections.map(s => s.id === selectedSection.id ? {...s, [key]: val} : s);
    setSections(newSections);
    setSelectedSection({...selectedSection, [key]: val});
  };

  return (
    <Page 
      title={`Customize: ${template.name}`} 
      backAction={{content: 'Templates', onAction: () => navigate('/app/templates')}}
      primaryAction={{content: 'Apply Design', onAction: handleApply}}
      secondaryActions={[{content: 'Save Draft', onAction: handleSave}]}
    >
      {actionData?.success && (
        <Box paddingBlockEnd="400">
          <Banner tone="success">{actionData.message}</Banner>
        </Box>
      )}

      <Grid>
        {/* LEFT SIDEBAR: EDITOR */}
        <Grid.Cell columnSpan={{xs: 6, sm: 6, md: 2, lg: 3, xl: 3}}>
          <BlockStack gap="400">
            
            {!selectedSection ? (
              <Card title="Sections" sectioned>
                <BlockStack gap="200">
                  <Text variant="headingSm" as="h3">Homepage Sections</Text>
                  <Text variant="bodySm" tone="subdued">Reorder sections or click to edit.</Text>
                  
                  <div style={{ marginTop: '10px' }}>
                    {sections.map((section, index) => (
                      <Box key={section.id} padding="200" background="bg-surface" borderWidth="025" borderColor="border" borderRadius="100" style={{ marginBottom: '8px', cursor: 'pointer' }} onClick={() => setSelectedSection(section)}>
                        <InlineStack align="space-between" blockAlign="center">
                          <InlineStack gap="200" blockAlign="center">
                            <Icon source={DragHandleIcon} tone="subdued" />
                            <Text variant="bodyMd">{section.title || section.type}</Text>
                          </InlineStack>
                          <ButtonGroup segmented>
                            <Button size="micro" disabled={index === 0} onClick={(e) => { e.stopPropagation(); moveSection(index, "up"); }}>↑</Button>
                            <Button size="micro" disabled={index === sections.length - 1} onClick={(e) => { e.stopPropagation(); moveSection(index, "down"); }}>↓</Button>
                          </ButtonGroup>
                        </InlineStack>
                      </Box>
                    ))}
                  </div>
                </BlockStack>
              </Card>
            ) : (
              <BlockStack gap="400">
                <Box background="bg-surface" padding="300" borderRadius="200" borderWidth="025" borderColor="border">
                  <InlineStack align="space-between" blockAlign="center">
                    <Text variant="headingMd" as="h2">Editing: {selectedSection.title || selectedSection.type}</Text>
                    <Button variant="plain" onClick={() => setSelectedSection(null)}>Back to Sections</Button>
                  </InlineStack>
                </Box>

                {/* Content Settings */}
                <Card padding="0">
                  <Box padding="300" onClick={() => togglePanel('content')} style={{ cursor: 'pointer' }}>
                    <InlineStack align="space-between">
                      <Text variant="headingSm" as="h3">Content</Text>
                      <Icon source={openPanels.content ? ChevronUpIcon : ChevronDownIcon} />
                    </InlineStack>
                  </Box>
                  <Collapsible open={openPanels.content} id="content-panel">
                    <Box padding="300" borderBlockStartWidth="025" borderColor="border">
                      <BlockStack gap="400">
                        {selectedSection.title !== undefined && (
                          <TextField label="Heading" value={selectedSection.title} onChange={(val) => handleContentChange('title', val)} autoComplete="off" />
                        )}
                        {selectedSection.description !== undefined && (
                          <TextField label="Description" value={selectedSection.description} multiline={3} onChange={(val) => handleContentChange('description', val)} autoComplete="off" />
                        )}
                        {selectedSection.buttonText !== undefined && (
                          <TextField label="Button Text" value={selectedSection.buttonText} onChange={(val) => handleContentChange('buttonText', val)} autoComplete="off" />
                        )}
                      </BlockStack>
                    </Box>
                  </Collapsible>
                </Card>

                {/* Background Settings */}
                <Card padding="0">
                  <Box padding="300" onClick={() => togglePanel('background')} style={{ cursor: 'pointer' }}>
                    <InlineStack align="space-between">
                      <Text variant="headingSm" as="h3">Background & Spacing</Text>
                      <Icon source={openPanels.background ? ChevronUpIcon : ChevronDownIcon} />
                    </InlineStack>
                  </Box>
                  <Collapsible open={openPanels.background} id="background-panel">
                    <Box padding="300" borderBlockStartWidth="025" borderColor="border">
                      <BackgroundSettings 
                        value={selectedSection.settings?.background || {}} 
                        onChange={(val) => handleSettingChange('background', val)} 
                      />
                    </Box>
                  </Collapsible>
                </Card>

                {/* Typography Settings */}
                <Card padding="0">
                  <Box padding="300" onClick={() => togglePanel('typography')} style={{ cursor: 'pointer' }}>
                    <InlineStack align="space-between">
                      <Text variant="headingSm" as="h3">Typography</Text>
                      <Icon source={openPanels.typography ? ChevronUpIcon : ChevronDownIcon} />
                    </InlineStack>
                  </Box>
                  <Collapsible open={openPanels.typography} id="typography-panel">
                    <Box padding="300" borderBlockStartWidth="025" borderColor="border">
                      <TypographySettings 
                        value={selectedSection.settings?.typography || {}} 
                        onChange={(val) => handleSettingChange('typography', val)} 
                      />
                    </Box>
                  </Collapsible>
                </Card>

                {/* Button Settings */}
                {selectedSection.buttonText !== undefined && (
                  <Card padding="0">
                    <Box padding="300" onClick={() => togglePanel('button')} style={{ cursor: 'pointer' }}>
                      <InlineStack align="space-between">
                        <Text variant="headingSm" as="h3">Button Styles</Text>
                        <Icon source={openPanels.button ? ChevronUpIcon : ChevronDownIcon} />
                      </InlineStack>
                    </Box>
                    <Collapsible open={openPanels.button} id="button-panel">
                      <Box padding="300" borderBlockStartWidth="025" borderColor="border">
                        <ButtonSettings 
                          value={selectedSection.settings?.button || {}} 
                          onChange={(val) => handleSettingChange('button', val)} 
                        />
                      </Box>
                    </Collapsible>
                  </Card>
                )}

                {/* Grid Settings */}
                {(selectedSection.type === 'collection' || selectedSection.type === 'grid') && (
                  <Card padding="0">
                    <Box padding="300" onClick={() => togglePanel('grid')} style={{ cursor: 'pointer' }}>
                      <InlineStack align="space-between">
                        <Text variant="headingSm" as="h3">Grid Layout & Cards</Text>
                        <Icon source={openPanels.grid ? ChevronUpIcon : ChevronDownIcon} />
                      </InlineStack>
                    </Box>
                    <Collapsible open={openPanels.grid} id="grid-panel">
                      <Box padding="300" borderBlockStartWidth="025" borderColor="border">
                        <GridSettings 
                          value={selectedSection.settings?.grid || {}} 
                          onChange={(val) => handleSettingChange('grid', val)} 
                        />
                      </Box>
                    </Collapsible>
                  </Card>
                )}

              </BlockStack>
            )}
          </BlockStack>
        </Grid.Cell>

        {/* RIGHT SIDEBAR: SIMULATOR */}
        <Grid.Cell columnSpan={{xs: 6, sm: 6, md: 4, lg: 9, xl: 9}}>
          <LivePreviewPanel 
            sections={sections}
            selectedSection={selectedSection}
            setSelectedSection={setSelectedSection}
            viewMode={viewMode}
            setViewMode={setViewMode}
          />
        </Grid.Cell>
      </Grid>
    </Page>
  );
}
