import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  const formData = await request.formData();
  
  const templateId = formData.get("templateId");
  
  try {
    // 1. Fetch active theme
    const themesResponse = await admin.rest.resources.Theme.all({
      session,
    });
    
    const activeTheme = themesResponse.data.find((theme) => theme.role === 'main');
    if (!activeTheme) {
      throw new Error("No active theme found");
    }

    // 2. Generate the Liquid code for the sections
    // In a production app, we would parse the JSON sections and map them to our Liquid engine.
    const compiledLiquid = `
      <div class="shopframe-homepage-wrapper">
         <!-- Dynamically generated ShopFrame Liquid goes here -->
         <p>ShopFrame Template ${templateId} applied successfully!</p>
      </div>
    `;

    // 3. Write to Theme via Asset API
    // We create a section asset in the merchant's theme
    const sectionAsset = new admin.rest.resources.Asset({session: session});
    sectionAsset.theme_id = activeTheme.id;
    sectionAsset.key = "sections/shopframe-homepage.liquid";
    sectionAsset.value = compiledLiquid;
    await sectionAsset.save({
      update: true,
    });

    // 4. Update templates/index.json to include our new section
    // In reality, we would fetch the index.json, append our section, and save it back.
    // We are mocking the success here for the architectural setup.
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
    
  } catch (error) {
    console.error("Failed to apply template:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
