import { useLoaderData, useNavigate } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Button,
  BlockStack,
  InlineStack,
  Badge,
  Grid,
  Icon,
} from "@shopify/polaris";
import {
  EditIcon,
  SettingsIcon,
  ChatIcon,
  ViewIcon,
  ReceiptIcon,
  ThemeStoreIcon,
  StarIcon,
} from "@shopify/polaris-icons";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  
  try {
    // Fetch store and subscription data
    const store = await prisma.store.findUnique({
      where: { shop: session.shop },
    });

    const subscription = await prisma.subscription.findUnique({
      where: { shop: session.shop },
    });

    return { store, subscription };
  } catch (error) {
    console.error("Dashboard loader DB error:", error);
    // Return safe defaults so the UI still renders instead of crashing
    return { store: null, subscription: null };
  }
};

export default function Dashboard() {
  const { store, subscription } = useLoaderData();
  const navigate = useNavigate();

  const planName = subscription?.plan || "FREE";
  const isOnboarded = store?.isOnboarded || false;

  const getPlanBadgeClass = (plan) => {
    switch (plan) {
      case 'FREE': return 'badge-FREE';
      case 'PLAN_BASIC': return 'badge-PLAN_BASIC';
      case 'PLAN_PRO': return 'badge-PLAN_PRO';
      case 'PLAN_PLATINUM': return 'badge-PLAN_PLATINUM';
      default: return 'badge-FREE';
    }
  };

  const getPlanDisplayString = (plan) => {
    switch (plan) {
      case 'FREE': return 'Free';
      case 'PLAN_BASIC': return 'Basic';
      case 'PLAN_PRO': return 'Pro';
      case 'PLAN_PLATINUM': return 'Platinum';
      default: return 'Free';
    }
  };

  const customStyles = `
    .premium-card {
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.03), 0 1px 3px rgba(0,0,0,0.02);
      border: 1px solid #f0f0f0;
      padding: 24px;
      transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    }
    .premium-card:hover {
      box-shadow: 0 12px 24px rgba(0,0,0,0.06);
    }

    /* Hero Section */
    .hero-section {
      background: linear-gradient(135deg, #f0f7ff 0%, #e0e7ff 100%);
      border-radius: 16px;
      padding: 32px;
      position: relative;
      overflow: hidden;
      border: 1px solid #d0dfff;
    }
    .hero-glow {
      position: absolute;
      top: -50%;
      right: -10%;
      width: 400px;
      height: 400px;
      background: radial-gradient(circle, rgba(100,200,255,0.4) 0%, rgba(255,255,255,0) 70%);
      border-radius: 50%;
      pointer-events: none;
    }

    /* Stat Cards */
    .stat-card {
      background: #ffffff;
      border-radius: 12px;
      padding: 20px;
      border: 1px solid #e1e3e5;
      display: flex;
      flex-direction: column;
      gap: 8px;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0,0,0,0.05);
      border-color: transparent;
    }
    .stat-value {
      font-size: 28px;
      font-weight: 700;
      color: #111;
      line-height: 1.2;
    }

    /* Active Design Mockup */
    .mockup-wrapper {
      background: #f4f6f8;
      border-radius: 12px;
      padding: 20px;
      position: relative;
      overflow: hidden;
    }
    .mockup-content {
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .skel-nav { display: flex; justify-content: space-between; align-items: center; }
    .skel-logo { width: 30%; height: 12px; background: #dfe3e8; border-radius: 4px; }
    .skel-menu { width: 40%; height: 12px; background: #dfe3e8; border-radius: 4px; }
    .skel-hero { width: 100%; height: 80px; background: linear-gradient(135deg, #f4f6f8, #dfe3e8); border-radius: 6px; }
    .skel-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .skel-box { height: 40px; background: #f4f6f8; border-radius: 4px; }

    /* Quick Action Cards */
    .action-card {
      background: #fafbfc;
      border: 1px solid #e1e3e5;
      border-radius: 12px;
      padding: 16px;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      gap: 12px;
      transition: all 0.2s ease;
    }
    .action-card:hover {
      background: #ffffff;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      border-color: #c4cdd5;
    }
    .action-icon-wrapper {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f0f2f4;
    }

    /* Category Cards */
    .category-card {
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid #e1e3e5;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    .category-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0,0,0,0.08);
    }
    .category-image {
      height: 80px;
      background: linear-gradient(135deg, #f4f6f8, #dfe3e8);
      position: relative;
    }
    .category-content {
      padding: 12px;
      background: white;
      text-align: center;
    }

    /* Timeline */
    .timeline-item {
      display: flex;
      gap: 16px;
      position: relative;
      padding-bottom: 24px;
    }
    .timeline-item:last-child {
      padding-bottom: 0;
    }
    .timeline-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #005bd3;
      position: relative;
      z-index: 2;
      margin-top: 4px;
    }
    .timeline-line {
      position: absolute;
      top: 16px;
      bottom: 0;
      left: 5px;
      width: 2px;
      background: #e1e3e5;
      z-index: 1;
    }
    .timeline-item:last-child .timeline-line {
      display: none;
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
  `;

  return (
    <Page fullWidth>
      <style>{customStyles}</style>

      <BlockStack gap="600">
        
        {/* HERO SECTION */}
        <div className="hero-section">
          <div className="hero-glow"></div>
          <BlockStack gap="400">
            <div style={{ maxWidth: '600px', position: 'relative', zIndex: 2 }}>
              <Text as="h1" variant="heading3xl" tone="base">
                Welcome to ShopFrame
              </Text>
              <div style={{ marginTop: '12px' }}>
                <Text variant="bodyLg" tone="subdued">
                  Build a premium, high-converting storefront in minutes. Discover world-class layout sections, customize effortlessly, and scale your business.
                </Text>
              </div>
            </div>

            {!isOnboarded ? (
              <InlineStack gap="300" align="start">
                <Button size="large" variant="primary" onClick={() => navigate('/app/onboarding')}>
                  Complete Setup (2 mins)
                </Button>
                <Button size="large" onClick={() => navigate('/app/templates')}>
                  Watch Demo
                </Button>
              </InlineStack>
            ) : (
              <InlineStack gap="300" align="start">
                <Button size="large" variant="primary" onClick={() => navigate('/app/templates')}>
                  Browse Layouts
                </Button>
                <Button size="large" onClick={() => navigate('/app/customize')}>
                  Customize Layout Sections
                </Button>
              </InlineStack>
            )}
          </BlockStack>
        </div>

        {/* STATS GRID */}
        <Grid>
          <Grid.Cell columnSpan={{xs: 6, sm: 3, md: 3, lg: 3, xl: 3}}>
            <div className="stat-card">
              <Text variant="headingSm" tone="subdued">Current Theme</Text>
              <div className="stat-value">None</div>
            </div>
          </Grid.Cell>
          <Grid.Cell columnSpan={{xs: 6, sm: 3, md: 3, lg: 3, xl: 3}}>
            <div className="stat-card">
              <Text variant="headingSm" tone="subdued">Subscription Tier</Text>
              <div style={{ marginTop: '4px' }}>
                <span className={`premium-badge ${getPlanBadgeClass(planName)}`}>
                  {getPlanDisplayString(planName)}
                </span>
              </div>
            </div>
          </Grid.Cell>
          <Grid.Cell columnSpan={{xs: 6, sm: 3, md: 3, lg: 3, xl: 3}}>
            <div className="stat-card">
              <Text variant="headingSm" tone="subdued">Layouts Available</Text>
              <div className="stat-value">10+</div>
            </div>
          </Grid.Cell>
          <Grid.Cell columnSpan={{xs: 6, sm: 3, md: 3, lg: 3, xl: 3}}>
            <div className="stat-card">
              <Text variant="headingSm" tone="subdued">Customizations</Text>
              <div className="stat-value">0</div>
            </div>
          </Grid.Cell>
        </Grid>

        <Layout>
          {/* MAIN LEFT COLUMN */}
          <Layout.Section>
            <BlockStack gap="600">
              
              {/* ACTIVE LAYOUT */}
              <div className="premium-card">
                <BlockStack gap="400">
                  <InlineStack align="space-between" blockAlign="center">
                    <Text as="h2" variant="headingLg">Homepage Layout</Text>
                    <Badge tone="success">Live</Badge>
                  </InlineStack>
                  
                  <Grid>
                    <Grid.Cell columnSpan={{xs: 12, sm: 5, md: 5, lg: 5, xl: 5}}>
                      <div className="mockup-wrapper">
                        <div className="mockup-content">
                          <div className="skel-nav">
                            <div className="skel-logo"></div>
                            <div className="skel-menu"></div>
                          </div>
                          <div className="skel-hero"></div>
                          <div className="skel-grid">
                            <div className="skel-box"></div>
                            <div className="skel-box"></div>
                          </div>
                        </div>
                      </div>
                    </Grid.Cell>
                    <Grid.Cell columnSpan={{xs: 12, sm: 7, md: 7, lg: 7, xl: 7}}>
                      <BlockStack gap="300">
                        <div>
                          <Text as="h3" variant="headingXl">No layout added</Text>
                          <div style={{ marginTop: '8px' }}>
                            <Text variant="bodyLg" tone="subdued">
                              You haven't added a ShopFrame layout section to your current theme yet. Choose a layout to get started.
                            </Text>
                          </div>
                        </div>
                        <div style={{ marginTop: '16px' }}>
                          <InlineStack gap="300">
                            <Button size="large" variant="primary" onClick={() => navigate('/app/templates')} icon={ThemeStoreIcon}>
                              Browse Layouts
                            </Button>
                            <Button size="large" onClick={() => navigate('/app/customize')} icon={ViewIcon}>
                              Live Preview
                            </Button>
                          </InlineStack>
                        </div>
                      </BlockStack>
                    </Grid.Cell>
                  </Grid>
                </BlockStack>
              </div>

              {/* RECOMMENDED CATEGORIES */}
              <div className="premium-card">
                <BlockStack gap="400">
                  <InlineStack align="space-between" blockAlign="center">
                    <Text as="h2" variant="headingLg">Recommended Categories</Text>
                    <Button variant="plain" onClick={() => navigate('/app/templates')}>View all layouts</Button>
                  </InlineStack>
                  <Grid>
                    {['Jewellery', 'Fashion', 'Footwear', 'Beauty'].map(category => (
                      <Grid.Cell key={category} columnSpan={{xs: 6, sm: 3, md: 3, lg: 3, xl: 3}}>
                        <div className="category-card" onClick={() => navigate(`/app/templates?category=${category}`)}>
                          <div className="category-image"></div>
                          <div className="category-content">
                            <Text variant="headingSm">{category}</Text>
                            <div style={{ marginTop: '4px' }}>
                              <Text variant="bodySm" tone="subdued">Explore &rarr;</Text>
                            </div>
                          </div>
                        </div>
                      </Grid.Cell>
                    ))}
                  </Grid>
                </BlockStack>
              </div>

            </BlockStack>
          </Layout.Section>
          
          {/* SIDEBAR RIGHT COLUMN */}
          <Layout.Section variant="oneThird">
            <BlockStack gap="600">
              
              {/* QUICK ACTIONS */}
              <div className="premium-card">
                <BlockStack gap="400">
                  <Text as="h2" variant="headingLg">Quick Actions</Text>
                  <Grid>
                    <Grid.Cell columnSpan={{xs: 6, sm: 6, md: 6, lg: 6, xl: 6}}>
                      <div className="action-card" onClick={() => navigate('/app/customize')}>
                        <div className="action-icon-wrapper" style={{ color: '#005bd3' }}>
                          <Icon source={EditIcon} />
                        </div>
                        <Text variant="headingSm">Customize</Text>
                      </div>
                    </Grid.Cell>
                    <Grid.Cell columnSpan={{xs: 6, sm: 6, md: 6, lg: 6, xl: 6}}>
                      <div className="action-card" onClick={() => navigate('/app/templates')}>
                        <div className="action-icon-wrapper" style={{ color: '#8e2de2' }}>
                          <Icon source={ThemeStoreIcon} />
                        </div>
                        <Text variant="headingSm">Layouts</Text>
                      </div>
                    </Grid.Cell>
                    <Grid.Cell columnSpan={{xs: 6, sm: 6, md: 6, lg: 6, xl: 6}}>
                      <div className="action-card" onClick={() => navigate('/app/settings')}>
                        <div className="action-icon-wrapper" style={{ color: '#47c1bf' }}>
                          <Icon source={SettingsIcon} />
                        </div>
                        <Text variant="headingSm">Settings</Text>
                      </div>
                    </Grid.Cell>
                    <Grid.Cell columnSpan={{xs: 6, sm: 6, md: 6, lg: 6, xl: 6}}>
                      <div className="action-card" onClick={() => navigate('/app/support')}>
                        <div className="action-icon-wrapper" style={{ color: '#e57373' }}>
                          <Icon source={ChatIcon} />
                        </div>
                        <Text variant="headingSm">Support</Text>
                      </div>
                    </Grid.Cell>
                  </Grid>
                </BlockStack>
              </div>

              {/* SUBSCRIPTION CARD */}
              <div className="premium-card">
                <BlockStack gap="400">
                  <InlineStack align="space-between" blockAlign="center">
                    <Text as="h2" variant="headingLg">Subscription</Text>
                    <span className={`premium-badge ${getPlanBadgeClass(planName)}`}>
                      {getPlanDisplayString(planName)}
                    </span>
                  </InlineStack>
                  
                  <BlockStack gap="200">
                    <div style={{ padding: '16px', background: '#fafbfc', borderRadius: '8px', border: '1px solid #e1e3e5' }}>
                      <BlockStack gap="100">
                        <InlineStack gap="200" align="start" wrap={false}>
                          <Icon source={StarIcon} tone="magic" />
                          <Text variant="bodyMd">Unlock premium glassmorphism layouts and unlimited sections.</Text>
                        </InlineStack>
                      </BlockStack>
                    </div>
                  </BlockStack>

                  <Button size="large" variant="primary" fullWidth onClick={() => navigate('/app/pricing')} icon={ReceiptIcon}>
                    Manage Billing & Upgrade
                  </Button>
                </BlockStack>
              </div>
                    
              {/* RECENT ACTIVITY */}
              <div className="premium-card">
                <BlockStack gap="400">
                  <Text as="h2" variant="headingLg">Recent Activity</Text>
                  
                  <div style={{ marginTop: '10px' }}>
                    <div className="timeline-item">
                      <div className="timeline-dot"></div>
                      <div className="timeline-line"></div>
                      <BlockStack gap="100">
                        <Text variant="headingSm">ShopFrame Installed</Text>
                        <Text variant="bodySm" tone="subdued">Welcome to your new design hub.</Text>
                      </BlockStack>
                    </div>
                    
                    <div className="timeline-item">
                      <div className="timeline-dot" style={{ background: '#8e2de2' }}></div>
                      <div className="timeline-line"></div>
                      <BlockStack gap="100">
                        <Text variant="headingSm">Account Setup</Text>
                        <Text variant="bodySm" tone="subdued">Basic store details initialized.</Text>
                      </BlockStack>
                    </div>
                  </div>
                </BlockStack>
              </div>

            </BlockStack>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
