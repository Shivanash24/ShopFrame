import { useState } from "react";
import { useLoaderData, useNavigate } from "@remix-run/react";
import {
  Page,
  Text,
  Card,
  BlockStack,
  InlineStack,
  Grid,
  Select,
  Filters,
  Button,
  Icon,
  Modal,
  Banner,
} from "@shopify/polaris";
import { LockIcon, EditIcon, ViewIcon } from "@shopify/polaris-icons";
import { authenticate } from "../shopify.server";
import { canAccessTier } from "../plans.js";
import prisma from "../db.server";
import { templates, templateCategories } from "../data/templates";
import LivePreviewPanel from "../components/customize/LivePreviewPanel";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { shop: session.shop },
    });
    return { subscription };
  } catch (error) {
    console.error("Templates loader DB error:", error);
    return { subscription: null };
  }
};

export default function TemplatesPage() {
  const { subscription } = useLoaderData();
  const navigate = useNavigate();

  const [queryValue, setQueryValue] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [previewViewMode, setPreviewViewMode] = useState("desktop");
  
  const handleQueryValueChange = (value) => setQueryValue(value);
  const handleQueryValueRemove = () => setQueryValue("");
  const handleClearAll = () => {
    handleQueryValueRemove();
    setSelectedCategory("All");
  };

  const filteredTemplates = templates.filter((template) => {
    if (selectedCategory !== "All" && template.category !== selectedCategory) return false;
    if (queryValue && !template.name.toLowerCase().includes(queryValue.toLowerCase())) return false;
    return true;
  });

  const getTierLabel = (tier) => {
    switch (tier) {
      case 'FREE': return 'Free';
      case 'PLAN_BASIC': return 'Basic';
      case 'PLAN_PRO': return 'Pro';
      case 'PLAN_PLATINUM': return 'Platinum';
      default: return tier;
    }
  };

  const getUpgradeButtonText = (tier) => {
    if (tier === 'PLAN_BASIC') return "Upgrade to Basic";
    if (tier === 'PLAN_PRO') return "Unlock Pro Templates";
    if (tier === 'PLAN_PLATINUM') return "Get Platinum Access";
    return "Upgrade Plan";
  };

  // Access is granted only if:
  // 1. The subscription exists and status is ACTIVE
  // 2. The plan level covers the required tier
  // FREE templates are always accessible regardless of subscription.
  const activePlan =
    subscription?.status === "ACTIVE" ? subscription?.plan : "FREE";

  const canAccess = (tier) => {
    if (tier === "FREE") return true; // FREE always accessible
    return canAccessTier(activePlan, tier);
  };

  // CSS inside the component for custom styling
  const customStyles = `
    .template-card {
      position: relative;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
      background: white;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      height: 100%;
      border: 1px solid #e1e3e5;
    }
    .template-card:hover {
      transform: translateY(-6px) scale(1.02);
      box-shadow: 0 16px 32px rgba(0,0,0,0.1);
      border-color: transparent;
    }
    
    /* Dark Theme Platinum */
    .template-card.dark-theme {
      background: #0d0d0d;
      border: 1px solid rgba(255,255,255,0.1);
      color: #fff;
    }
    .template-card.dark-theme:hover {
      box-shadow: 0 16px 32px rgba(0,255,150,0.15);
      border: 1px solid rgba(0,255,150,0.3);
    }

    .preview-wrapper {
      position: relative;
      height: 220px;
      overflow: hidden;
      background: #f9fafb;
    }
    .dark-theme .preview-wrapper {
      background: #1a1a1a;
    }

    .preview-mockup {
      width: 100%;
      height: 100%;
      padding: 20px;
      transition: all 0.4s ease;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    
    /* Skeleton Layouts */
    .skel-header { height: 12px; border-radius: 6px; width: 40%; background: #e5e7eb; }
    .skel-hero { height: 80px; border-radius: 8px; width: 100%; background: linear-gradient(135deg, #e5e7eb, #d1d5db); }
    .skel-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
    .skel-card { height: 50px; border-radius: 6px; background: #f3f4f6; }
    
    .dark-theme .skel-header { background: #333; }
    .dark-theme .skel-hero { background: linear-gradient(135deg, #333, #222); border: 1px solid #444; }
    .dark-theme .skel-card { background: #222; border: 1px solid #333; }
    
    /* Blurred State */
    .locked-preview {
      filter: blur(5px);
      opacity: 0.8;
    }
    
    .template-card:hover .locked-preview {
      filter: blur(3px) scale(1.05);
    }
    .template-card:hover .preview-mockup:not(.locked-preview) {
      transform: scale(1.05);
    }

    .locked-overlay {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.4);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 10;
      transition: background 0.3s ease;
    }
    .template-card:hover .locked-overlay {
      background: rgba(0, 0, 0, 0.3);
    }
    
    .lock-icon-wrapper {
      background: rgba(255,255,255,0.2);
      backdrop-filter: blur(4px);
      padding: 12px;
      border-radius: 50%;
      margin-bottom: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      color: white;
    }

    /* Badges */
    .premium-badge {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      display: inline-block;
    }
    .badge-FREE { background: #e3f1df; color: #2b6a22; }
    .badge-PLAN_BASIC { background: linear-gradient(135deg, #007bff, #00d2ff); color: white; }
    .badge-PLAN_PRO { background: linear-gradient(135deg, #8e2de2, #4a00e0); color: white; }
    .badge-PLAN_PLATINUM { background: linear-gradient(135deg, #f6d365, #fda085); color: #5c3a00; }
    .dark-theme .badge-PLAN_PLATINUM { background: linear-gradient(135deg, #ffdf00, #d4af37); color: #000; }

    .card-content {
      padding: 20px;
      display: flex;
      flex-direction: column;
      flex-grow: 1;
      justify-content: space-between;
    }
    
    .dark-theme-text {
      color: #fff;
    }
    .dark-theme-subtext {
      color: #aaa;
    }
  `;

  return (
    <Page title="Homepage Templates">
      <style>{customStyles}</style>
      
      <BlockStack gap="500">
        <Card>
          <InlineStack gap="400" align="start">
            <div style={{ flex: 1 }}>
              <Select
                label="Category"
                options={["All", ...templateCategories]}
                value={selectedCategory}
                onChange={setSelectedCategory}
              />
            </div>
            <div style={{ flex: 2 }}>
              <Filters
                queryValue={queryValue}
                filters={[]}
                onQueryChange={handleQueryValueChange}
                onQueryClear={handleQueryValueRemove}
                onClearAll={handleClearAll}
              />
            </div>
          </InlineStack>
        </Card>

        <Grid>
          {filteredTemplates.map((template) => {
            const hasAccess = canAccess(template.tier);
            const isDarkTheme = template.id === 'luxury';

            return (
              <Grid.Cell key={template.id} columnSpan={{xs: 12, sm: 6, md: 4, lg: 4, xl: 4}}>
                <div className={`template-card ${isDarkTheme ? 'dark-theme' : ''}`}>
                  
                  {/* PREVIEW AREA */}
                  <div className="preview-wrapper">
                    <div className={`preview-mockup ${!hasAccess ? 'locked-preview' : ''}`}>
                      <div className="skel-header"></div>
                      <div className="skel-hero"></div>
                      <div className="skel-grid">
                        <div className="skel-card"></div>
                        <div className="skel-card"></div>
                        <div className="skel-card"></div>
                      </div>
                    </div>
                    
                    {!hasAccess && (
                      <div className="locked-overlay">
                        <div className="lock-icon-wrapper">
                          <Icon source={LockIcon} tone="base" />
                        </div>
                        <span style={{ color: 'white', fontWeight: '600', fontSize: '14px', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                          Premium Design
                        </span>
                      </div>
                    )}
                  </div>

                  {/* CONTENT AREA */}
                  <div className="card-content">
                    <BlockStack gap="400">
                      <InlineStack align="space-between" blockAlign="center">
                        <BlockStack gap="100">
                          <Text variant="headingMd" as="h3">
                            <span className={isDarkTheme ? 'dark-theme-text' : ''}>{template.name}</span>
                          </Text>
                          <Text variant="bodySm" tone={isDarkTheme ? undefined : "subdued"}>
                            <span className={isDarkTheme ? 'dark-theme-subtext' : ''}>{template.category}</span>
                          </Text>
                        </BlockStack>
                        <span className={`premium-badge badge-${template.tier}`}>
                          {getTierLabel(template.tier)}
                        </span>
                      </InlineStack>

                      {/* CALL TO ACTION */}
                      {hasAccess ? (
                        <InlineStack gap="200" align="space-between">
                          <div style={{ flex: 1 }}>
                            <Button fullWidth onClick={() => setPreviewTemplate(template)} icon={ViewIcon}>Live Preview</Button>
                          </div>
                          <div style={{ flex: 1 }}>
                            <Button fullWidth variant="primary" onClick={() => navigate(`/app/customize?template=${template.id}`)} icon={EditIcon}>Customize</Button>
                          </div>
                        </InlineStack>
                      ) : (
                        <InlineStack gap="200" align="space-between">
                          <div style={{ flex: 1 }}>
                            <Button fullWidth onClick={() => setPreviewTemplate(template)} icon={ViewIcon}>Live Preview</Button>
                          </div>
                          <div style={{ flex: 1 }}>
                            <Button 
                              fullWidth 
                              variant="primary" 
                              tone="success"
                              onClick={() => navigate('/app/pricing')}
                            >
                              {getUpgradeButtonText(template.tier)}
                            </Button>
                          </div>
                        </InlineStack>
                      )}
                    </BlockStack>
                  </div>

                </div>
              </Grid.Cell>
            );
          })}
        </Grid>
      </BlockStack>

      {/* LIVE PREVIEW MODAL */}
      <Modal
        open={!!previewTemplate}
        onClose={() => setPreviewTemplate(null)}
        title={previewTemplate ? `Live Preview: ${previewTemplate.name}` : 'Live Preview'}
        large
      >
        <Modal.Section>
          {previewTemplate && (
            <LivePreviewPanel
              sections={previewTemplate.sections}
              selectedSection={null}
              setSelectedSection={() => {}}
              viewMode={previewViewMode}
              setViewMode={setPreviewViewMode}
            />
          )}
        </Modal.Section>
      </Modal>
    </Page>
  );
}
