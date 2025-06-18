// SwipeShop Widget for Shopify Themes
// Add this to your theme's assets folder and include in product pages

class SwipeShopWidget {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.options = {
      products: options.products || [],
      shopDomain:
        options.shopDomain || (window.Shopify ? window.Shopify.shop : ""),
      apiKey: options.apiKey || "",
      theme: options.theme || "light",
      widgetUrl:
        options.widgetUrl || "https://your-swipeshop-domain.com/widget",
      title: options.title || "Discover Products with SwipeShop",
      subtitle: options.subtitle || "Swipe to find products you'll love",
      ...options,
    };

    this.init();
  }

  init() {
    if (!this.container) {
      console.error("SwipeShop: Container not found");
      return;
    }

    this.createHeader();
    this.loadWidget();
    this.injectStyles();
    this.setupMessageListener();
  }

  createHeader() {
    const header = document.createElement("div");
    header.className = "swipeshop-header";
    header.innerHTML = `
      <h3 class="swipeshop-title">${this.options.title}</h3>
      <p class="swipeshop-subtitle">${this.options.subtitle}</p>
    `;
    this.container.appendChild(header);
  }

  loadWidget() {
    // Create iframe to contain the React app
    const iframe = document.createElement("iframe");
    iframe.id = "swipeshop-iframe";

    // Build URL with parameters
    const params = new URLSearchParams({
      shop: this.options.shopDomain,
      theme: this.options.theme,
      embedded: "true",
    });

    if (this.options.products.length > 0) {
      params.set("products", JSON.stringify(this.options.products));
    }

    iframe.src = `${this.options.widgetUrl}?${params.toString()}`;
    iframe.style.cssText = `
      width: 100%;
      height: 600px;
      border: none;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    `;

    // Add loading state
    iframe.onload = () => {
      iframe.style.background = "transparent";
    };

    this.container.appendChild(iframe);
    this.iframe = iframe;
  }

  setupMessageListener() {
    // Listen for messages from the iframe
    window.addEventListener("message", (event) => {
      // Verify origin for security
      const allowedOrigins = [
        this.options.widgetUrl.replace(/\/widget.*$/, ""),
        "https://your-swipeshop-domain.com",
      ];

      if (!allowedOrigins.some((origin) => event.origin.startsWith(origin))) {
        return;
      }

      switch (event.data.type) {
        case "SWIPESHOP_ADD_TO_CART":
          this.addToShopifyCart(event.data.variantId, event.data.product);
          break;

        case "SWIPESHOP_ADD_TO_FAVORITES":
          this.handleFavorite(event.data.product);
          break;

        case "SWIPESHOP_VIEW_PRODUCT":
          this.viewProduct(event.data.productId);
          break;

        case "SWIPESHOP_CONTINUE_SHOPPING":
          this.continueShopping();
          break;

        default:
          console.log("SwipeShop message:", event.data);
      }
    });
  }

  async addToShopifyCart(variantId, product) {
    try {
      // Show loading feedback
      this.showNotification("Adding to cart...", "loading");

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
        const result = await response.json();

        // Show success notification
        this.showNotification(`${product.title} added to cart!`, "success");

        // Update cart drawer or counter if available
        if (window.theme && window.theme.cart) {
          window.theme.cart.refresh();
        } else if (document.querySelector(".cart-count")) {
          // Update cart count if element exists
          const cartCount = document.querySelector(".cart-count");
          const currentCount = parseInt(cartCount.textContent) || 0;
          cartCount.textContent = currentCount + 1;
        }

        // Trigger custom event for other scripts
        window.dispatchEvent(
          new CustomEvent("swipeshop:cart:add", {
            detail: { product, variantId, result },
          }),
        );
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      this.showNotification("Error adding to cart. Please try again.", "error");
    }
  }

  handleFavorite(product) {
    // Store in localStorage for persistence
    const favorites = JSON.parse(
      localStorage.getItem("swipeshop_favorites") || "[]",
    );
    if (!favorites.find((fav) => fav.id === product.id)) {
      favorites.push(product);
      localStorage.setItem("swipeshop_favorites", JSON.stringify(favorites));
    }

    this.showNotification(`${product.title} added to favorites!`, "success");

    // Trigger custom event
    window.dispatchEvent(
      new CustomEvent("swipeshop:favorite:add", {
        detail: { product },
      }),
    );
  }

  viewProduct(productHandle) {
    // Navigate to product page
    window.location.href = `/products/${productHandle}`;
  }

  continueShopping() {
    // Scroll to top or navigate to collections
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  showNotification(message, type = "info") {
    // Create notification element
    const notification = document.createElement("div");
    notification.className = `swipeshop-notification swipeshop-notification--${type}`;
    notification.textContent = message;

    // Add to page
    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.classList.add("swipeshop-notification--visible");
    }, 10);

    // Remove after delay
    setTimeout(() => {
      notification.classList.remove("swipeshop-notification--visible");
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
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

      .swipeshop-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        color: #333;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        font-size: 14px;
        font-weight: 500;
        max-width: 300px;
      }

      .swipeshop-notification--visible {
        transform: translateX(0);
      }

      .swipeshop-notification--success {
        background: #10b981;
        color: white;
      }

      .swipeshop-notification--error {
        background: #ef4444;
        color: white;
      }

      .swipeshop-notification--loading {
        background: #6366f1;
        color: white;
      }

      @media (max-width: 768px) {
        .swipeshop-notification {
          right: 10px;
          left: 10px;
          max-width: none;
          transform: translateY(-100px);
        }

        .swipeshop-notification--visible {
          transform: translateY(0);
        }
      }
    `;

    const styleSheet = document.createElement("style");
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
  }

  // Public methods for external control
  refresh() {
    if (this.iframe) {
      this.iframe.contentWindow.location.reload();
    }
  }

  updateProducts(products) {
    this.options.products = products;
    // Send message to iframe to update products
    if (this.iframe && this.iframe.contentWindow) {
      this.iframe.contentWindow.postMessage(
        {
          type: "UPDATE_PRODUCTS",
          products: products,
        },
        "*",
      );
    }
  }

  destroy() {
    if (this.container) {
      this.container.innerHTML = "";
    }
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

// Export for module systems
if (typeof module !== "undefined" && module.exports) {
  module.exports = SwipeShopWidget;
}
