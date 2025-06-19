#!/usr/bin/env node

/**
 * Script to prepare Shopify integration files
 * Copies templates and updates URLs with actual domain
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, "..");

// Configuration
const config = {
  // This should be updated with your actual domain after deployment
  swipeShopDomain:
    process.env.VITE_APP_URL || "https://your-swipeshop-domain.com",
  shopifyTemplatesDir: path.join(rootDir, "shopify-templates"),
  outputDir: path.join(rootDir, "shopify-output"),
};

console.log("🚀 Preparing Shopify integration files...");

// Create output directory
if (!fs.existsSync(config.outputDir)) {
  fs.mkdirSync(config.outputDir, { recursive: true });
}

// Files to process
const files = [
  {
    source: path.join(config.shopifyTemplatesDir, "page.swipeshop.liquid"),
    dest: path.join(config.outputDir, "page.swipeshop.liquid"),
  },
  {
    source: path.join(config.shopifyTemplatesDir, "swipeshop-section.liquid"),
    dest: path.join(config.outputDir, "swipeshop-section.liquid"),
  },
  {
    source: path.join(rootDir, "shopify-widget.js"),
    dest: path.join(config.outputDir, "swipeshop-widget.js"),
  },
];

// Process each file
files.forEach(({ source, dest }) => {
  if (!fs.existsSync(source)) {
    console.warn(`⚠️  Source file not found: ${source}`);
    return;
  }

  let content = fs.readFileSync(source, "utf8");

  // Replace placeholder URLs with actual domain
  content = content.replace(
    /https:\/\/your-swipeshop-domain\.com/g,
    config.swipeShopDomain,
  );

  // Write processed file
  fs.writeFileSync(dest, content);
  console.log(`✅ Processed: ${path.basename(dest)}`);
});

// Create installation instructions
const instructions = `
# 📋 SwipeShop + Shopify Integration Instructions

Your SwipeShop files have been prepared! Follow these steps to integrate with your Shopify store:

## 🏪 For Store Owners (Integration in Shopify Admin)

### Option 1: Full Page Experience
1. Copy \`page.swipeshop.liquid\` to your theme's \`templates/\` folder
2. In Shopify Admin → Online Store → Pages → Add page
3. Set template to "page.swipeshop"
4. Your SwipeShop page will be available at: \`yourstore.myshopify.com/pages/swipeshop\`

### Option 2: Widget in Product Pages
1. Copy \`swipeshop-section.liquid\` to your theme's \`sections/\` folder
2. Copy \`swipeshop-widget.js\` to your theme's \`assets/\` folder
3. In Theme Customizer → Add Section → Select "SwipeShop Widget"
4. Configure collection and styling options
5. Place in product pages, homepage, or collection pages

## 🔧 Technical Configuration

### Update Domain URLs
Before using the files, update these URLs in the files:
- Current placeholder: \`https://your-swipeshop-domain.com\`
- Replace with your actual domain: \`${config.swipeShopDomain}\`

### Environment Variables Needed:
- \`VITE_SHOPIFY_DOMAIN\`: Your Shopify store domain (e.g., store.myshopify.com)
- \`VITE_SHOPIFY_STOREFRONT_TOKEN\`: Your Storefront API access token
- \`VITE_APP_URL\`: Your SwipeShop domain

### Shopify API Setup:
1. Go to your Shopify Admin → Apps → Private apps
2. Create a new private app or use existing one
3. Enable Storefront API with these permissions:
   - \`unauthenticated_read_product_listings\`
   - \`unauthenticated_read_product_inventory\`
   - \`unauthenticated_read_product_pickup_locations\`

## 📱 URLs After Setup:

### Customer-facing:
- **Widget**: Embedded in your theme sections
- **Full Page**: \`yourstore.myshopify.com/pages/swipeshop\`

### Admin-only:
- **Analytics Dashboard**: \`${config.swipeShopDomain}/analytics-dashboard-full\`
- **Main App**: \`${config.swipeShopDomain}/\`

## 🚀 Deployment Checklist:

- [ ] Deploy SwipeShop to hosting (Vercel/Netlify)
- [ ] Update domain URLs in Shopify files
- [ ] Copy Liquid files to Shopify theme
- [ ] Configure Shopify API tokens
- [ ] Test widget functionality
- [ ] Test cart integration
- [ ] Test analytics tracking

## 🆘 Support:

If you need help:
1. Check browser console for errors
2. Verify CORS settings allow Shopify domains
3. Confirm API tokens have correct permissions
4. Test the widget iframe loads correctly

Good luck! 🎉
`;

fs.writeFileSync(
  path.join(config.outputDir, "INSTALLATION_INSTRUCTIONS.md"),
  instructions,
);

console.log(`✅ Installation instructions created`);
console.log(`\n📁 All files ready in: ${config.outputDir}`);
console.log(`\n🔗 Current SwipeShop URL: ${config.swipeShopDomain}`);
console.log(`\n📖 See INSTALLATION_INSTRUCTIONS.md for next steps`);
