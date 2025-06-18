// SwipeShop Widget for Shopify Themes
// Add this to your theme's assets folder and include in product pages

class SwipeShopWidget {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.options = {
      products: options.products || [],
      shopDomain: options.shopDomain || window.Shopify.shop,
      apiKey: options.apiKey || "",
      theme: options.theme || "light",
      ...options,
    };

    this.init();
  }

  init() {
    if (!this.container) {
      console.error("SwipeShop: Container not found");
      return;
    }

    this.loadReactApp();
    this.injectStyles();
  }

  loadReactApp() {
    // Create iframe to contain the React app
    const iframe = document.createElement("iframe");
    iframe.id = "swipeshop-iframe";
    iframe.src = `https://your-swipeshop-domain.com/widget?shop=${this.options.shopDomain}&products=${encodeURIComponent(JSON.stringify(this.options.products))}`;
    iframe.style.cssText = `
      width: 100%;
      height: 600px;
      border: none;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    `;

    this.container.appendChild(iframe);

    // Listen for messages from the iframe
    window.addEventListener("message", (event) => {
      if (event.origin !== "https://your-swipeshop-domain.com") return;

      if (event.data.type === "SWIPESHOP_ADD_TO_CART") {
        this.addToShopifyCart(event.data.productId, event.data.variantId);
      }

      if (event.data.type === "SWIPESHOP_VIEW_PRODUCT") {
        this.viewProduct(event.data.productId);
      }
    });
  }

  injectStyles() {
    const styles = `
      .swipeshop-widget {
        margin: 20px 0;
        padding: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 12px;
        position: relative;
        overflow: hidden;
      }
      
      .swipeshop-widget::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="2" fill="white" opacity="0.1"/><circle cx="80" cy="40" r="1" fill="white" opacity="0.1"/><circle cx="40" cy="80" r="1.5" fill="white" opacity="0.1"/></svg>');
        pointer-events: none;
      }
      
      .swipeshop-header {
        text-align: center;
        margin-bottom: 20px;
        position: relative;
        z-index: 1;
      }
      
      .swipeshop-title {
        color: white;
        font-size: 24px;
        font-weight: bold;
        margin: 0 0 8px 0;
        text-shadow: 0 2px 4px rgba(0,0,0,0.3);
      }
      
      .swipeshop-subtitle {
        color: rgba(255,255,255,0.9);
        font-size: 14px;
        margin: 0;
      }
    `;

    const styleSheet = document.createElement("style");
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
  }

  async addToShopifyCart(productId, variantId) {
    try {
      const response = await fetch("/cart/add.js", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: variantId,
          quantity: 1,
        }),
      });

      if (response.ok) {
        // Update cart drawer or redirect to cart
        if (window.theme && window.theme.cart) {
          window.theme.cart.refresh();
        } else {
          window.location.href = "/cart";
        }
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  }

  viewProduct(productId) {
    // Navigate to product page
    window.location.href = `/products/${productId}`;
  }
}

// Auto-initialize if container exists
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("swipeshop-widget");
  if (container && window.SwipeShopConfig) {
    new SwipeShopWidget("swipeshop-widget", window.SwipeShopConfig);
  }
});

// Global export
window.SwipeShopWidget = SwipeShopWidget;
