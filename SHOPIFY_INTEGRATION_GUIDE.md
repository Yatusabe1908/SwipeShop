# 🛍️ SwipeShop + Shopify Integration Guide

## 📋 Pasos Completos para Integrar tu SwipeShop con Shopify

### **🎯 OPCIÓN 1: Dashboard Analytics como App de Shopify (Recomendado para Analytics)**

#### **Paso 1: Preparar tu App para Shopify**

1. **Instalar Shopify CLI:**

   ```bash
   npm install -g @shopify/cli @shopify/theme
   ```

2. **Crear App de Shopify:**

   ```bash
   shopify app init swipeshop-analytics
   cd swipeshop-analytics
   ```

3. **Configurar package.json:**
   ```bash
   npm install @shopify/app-bridge @shopify/app-bridge-react @shopify/polaris
   ```

#### **Paso 2: Deploy del Dashboard**

1. **Build tu aplicación:**

   ```bash
   npm run build
   ```

2. **Subir a hosting (Vercel/Netlify):**

   ```bash
   # Para Vercel
   npx vercel --prod

   # Para Netlify
   npx netlify deploy --prod --dir=dist
   ```

3. **Configurar dominios:**
   - Tu dashboard estará en: `https://tu-dominio.com/analytics-dashboard-full`
   - Solo tú tendrás acceso via URL secreta

#### **Paso 3: Registrar App en Shopify**

1. **Ve a tu Shopify Partners Dashboard:**

   - https://partners.shopify.com

2. **Crear nueva app:**

   - Nombre: "SwipeShop Analytics"
   - URL de la app: `https://tu-dominio.com`
   - Callback URL: `https://tu-dominio.com/auth/callback`

3. **Configurar permisos:**
   - `read_products` - Para leer productos
   - `read_orders` - Para analizar órdenes
   - `read_analytics` - Para métricas adicionales

---

### **🎯 OPCIÓN 2: SwipeShop Widget en Productos (Para Clientes)**

#### **Paso 1: Preparar Widget**

1. **Copia estos archivos a tu tema:**

   ```
   assets/swipeshop-widget.js
   sections/swipeshop-section.liquid
   ```

2. **En tu tema de Shopify, edita theme.liquid:**
   ```liquid
   <!-- Antes de </head> -->
   {{ 'swipeshop-widget.js' | asset_url | script_tag }}
   ```

#### **Paso 2: Agregar Widget a Productos**

1. **En el admin de Shopify:**

   - Ve a "Online Store" > "Themes"
   - Click "Customize"
   - Agregar sección "SwipeShop Widget"

2. **Configurar el widget:**
   - Selecciona la colección de productos
   - Configura título y opciones
   - Guarda cambios

#### **Paso 3: Integrar con tu App**

1. **Tu SwipeShop debe estar disponible en:**

   ```
   https://tu-dominio.com/widget
   ```

2. **El widget se comunicará via postMessage:**
   ```javascript
   // Enviar a tu app
   window.parent.postMessage(
     {
       type: "SWIPESHOP_ADD_TO_CART",
       productId: "gid://shopify/Product/123",
       variantId: "gid://shopify/ProductVariant/456",
     },
     "*",
   );
   ```

---

### **🎯 OPCIÓN 3: Página Completa de SwipeShop**

#### **Paso 1: Crear Página en Shopify**

1. **En tu admin de Shopify:**

   - Ve a "Online Store" > "Pages"
   - Click "Add page"
   - Título: "Discover Products"
   - Handle: "swipeshop"
   - Template: "page.swipeshop"

2. **Sube el template:**
   - Copia `page.swipeshop.liquid` a `templates/page.swipeshop.liquid`

#### **Paso 2: Configurar Datos**

1. **Tu página estará en:**

   ```
   https://tu-tienda.myshopify.com/pages/swipeshop
   ```

2. **Los productos se cargan automáticamente**
3. **Admin analytics solo para usuarios con tag 'admin'**

---

## 🔧 **Configuración Técnica Detallada**

### **A. Setup de Hosting**

1. **Compilar para producción:**

   ```bash
   npm run build
   ```

2. **Variables de entorno necesarias:**
   ```env
   SHOPIFY_API_KEY=tu_api_key
   SHOPIFY_API_SECRET=tu_api_secret
   SHOPIFY_SCOPES=read_products,read_orders
   SHOPIFY_APP_URL=https://tu-dominio.com
   ```

### **B. Configuración de CORS**

En tu `vite.config.ts`:

```typescript
export default defineConfig({
  // ... otras configuraciones
  server: {
    cors: {
      origin: [
        "https://admin.shopify.com",
        "https://*.myshopify.com",
        "https://tu-tienda.myshopify.com",
      ],
    },
  },
});
```

### **C. Webhook para Sync de Productos**

Crea endpoint para sincronizar productos:

```typescript
// api/webhooks/products.ts
app.post("/api/webhooks/products/update", (req, res) => {
  const product = req.body;
  // Actualizar tu base de datos/mockData
  updateProductInMockData(product);
  res.status(200).send("OK");
});
```

### **D. Autenticación con Shopify**

```typescript
// api/auth/shopify.ts
import { Shopify } from "@shopify/shopify-api";

app.get("/auth", async (req, res) => {
  const authRoute = await Shopify.Auth.beginAuth(
    req,
    res,
    req.query.shop,
    "/auth/callback",
    false,
  );
  return res.redirect(authRoute);
});
```

---

## 🚀 **Pasos de Deployment**

### **1. Preparar Build:**

```bash
# 1. Instalar dependencias
npm install

# 2. Build para producción
npm run build

# 3. Test local
npm run preview
```

### **2. Deploy a Hosting:**

**Vercel (Recomendado):**

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Configurar dominio personalizado (opcional)
vercel domains add tu-dominio.com
```

**Netlify:**

```bash
# Instalar Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist

# Configurar dominio
netlify domains:add tu-dominio.com
```

### **3. Configurar DNS:**

- Apunta tu dominio al hosting
- Configura SSL (automático en Vercel/Netlify)

### **4. Testing:**

- Dashboard: `https://tu-dominio.com/analytics-dashboard-full`
- Widget: `https://tu-dominio.com/widget`
- App principal: `https://tu-dominio.com/`

---

## 📊 **URLs Finales**

Una vez completado, tendrás:

### **Para ti (Admin):**

- **Dashboard completo:** `https://tu-dominio.com/analytics-dashboard-full`
- **Shopify App:** Acceso desde admin de Shopify

### **Para clientes:**

- **Widget en productos:** Integrado en páginas de producto
- **Página completa:** `https://tu-tienda.myshopify.com/pages/swipeshop`

### **API Endpoints:**

- **Productos:** `https://tu-dominio.com/api/products`
- **Analytics:** `https://tu-dominio.com/api/analytics`
- **Webhooks:** `https://tu-dominio.com/api/webhooks/*`

---

## ✅ **Checklist Final**

- [ ] App buildeada y deployadaen hosting
- [ ] Dominio configurado con SSL
- [ ] Shopify App registrada (para dashboard)
- [ ] Widget instalado en tema (para clientes)
- [ ] URLs de dashboard probadas
- [ ] Webhooks configurados para sync
- [ ] Variables de entorno configuradas
- [ ] CORS configurado para Shopify
- [ ] Testing completo

¡Tu SwipeShop estará completamente integrado con Shopify! 🎉

---

## 🆘 **Soporte**

Si necesitas ayuda:

1. Verifica que todas las URLs respondan correctamente
2. Checa que los CORS permitan el dominio de Shopify
3. Confirma que las variables de entorno estén configuradas
4. Testea el widget en modo preview antes de publicar

¡Éxito con tu integración! 🚀
