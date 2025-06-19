# 🛍️ Guía Completa: SwipeShop + Shopify Integration

## 🎯 **LO QUE HEMOS CONSTRUIDO**

Tu aplicación SwipeShop ahora está **completamente integrada** con Shopify:

### ✅ **Funcionalidades Implementadas:**

- **🔄 Carga automática de productos** desde tu tienda Shopify
- **🛒 Integración directa con carrito** de Shopify
- **📊 Analytics completo** con tracking de eventos
- **📱 Widget embebible** para páginas de productos
- **🏪 Página completa** para experiencia inmersiva
- **⚡ Dashboard de analytics** solo para administradores

---

## 🚀 **PASO A PASO: IMPLEMENTACIÓN COMPLETA**

### **📋 FASE 1: Preparar y Deployar tu App**

#### **1.1 Configurar Variables de Entorno**

```bash
# Crea archivo .env en la raíz del proyecto
cp .env.example .env
```

Edita tu `.env` con estos valores:

```env
# Tu tienda Shopify
VITE_SHOPIFY_DOMAIN=tu-tienda.myshopify.com

# Token de Storefront API (obtener en paso 1.3)
VITE_SHOPIFY_STOREFRONT_TOKEN=shpat_xxxxxxxxxxxxxxxx

# Tu dominio donde hospedarás SwipeShop
VITE_APP_URL=https://tu-dominio-swipeshop.com

# Analytics (opcional)
VITE_GA_TRACKING_ID=G-XXXXXXXXXX
```

#### **1.2 Crear API Token en Shopify**

1. **Ve a tu Admin de Shopify**: `tu-tienda.myshopify.com/admin`
2. **Configuración → Apps and sales channels → Develop apps**
3. **Create app** → Nombra: "SwipeShop Integration"
4. **Configure Storefront API scopes**:
   ```
   ✅ unauthenticated_read_product_listings
   ✅ unauthenticated_read_product_inventory
   ✅ unauthenticated_read_product_pickup_locations
   ```
5. **Install app** → Copiar **Storefront access token**

#### **1.3 Build y Deploy**

```bash
# Instalar dependencias
npm install

# Preparar archivos para Shopify
npm run build:shopify

# Deploy a Vercel (recomendado)
npm run deploy:vercel

# O deploy a Netlify
npm run deploy:netlify
```

#### **1.4 Configurar Dominio**

- Apunta tu dominio a Vercel/Netlify
- Asegúrate que SSL esté activo
- Actualiza `VITE_APP_URL` en `.env`

---

### **📋 FASE 2: Integrar en tu Tienda Shopify**

Después del deploy, encontrarás archivos listos en `shopify-output/`:

#### **2.1 Opción A: Widget en Páginas de Producto**

_Para que los clientes usen SwipeShop mientras navegan_

1. **Subir archivos al tema:**

   ```
   shopify-output/swipeshop-section.liquid → sections/swipeshop-section.liquid
   shopify-output/swipeshop-widget.js → assets/swipeshop-widget.js
   ```

2. **En Theme Customizer:**
   - Ir a página de producto
   - **Add section** → "SwipeShop Widget"
   - Configurar:
     - **Collection**: Featured/All
     - **Height**: 600px
     - **Title**: "Discover Similar Products"

#### **2.2 Opción B: Página Completa SwipeShop**

_Para experiencia completa tipo Tinder_

1. **Subir template:**

   ```
   shopify-output/page.swipeshop.liquid → templates/page.swipeshop.liquid
   ```

2. **Crear página en Shopify:**

   - **Online Store → Pages → Add page**
   - **Title**: "Discover Products"
   - **Search engine listing preview → URL handle**: `swipeshop`
   - **Theme template**: `page.swipeshop`
   - **Save**

3. **Tu página estará en:**
   ```
   https://tu-tienda.myshopify.com/pages/swipeshop
   ```

#### **2.3 Agregar Navegación (Opcional)**

En tu menú principal, agregar:

- **Text**: "Discover"
- **Link**: `/pages/swipeshop`

---

### **📋 FASE 3: Testing y Verificación**

#### **3.1 URLs de Testing:**

```
🏠 App Principal: https://tu-dominio.com/
📱 Widget: https://tu-dominio.com/widget
📊 Analytics: https://tu-dominio.com/analytics-dashboard-full
🛍️ Shopify Page: https://tu-tienda.myshopify.com/pages/swipeshop
```

#### **3.2 Checklist de Funcionalidad:**

- [ ] **Productos cargan** desde Shopify (no mock data)
- [ ] **Swipe "Love It"** agrega al carrito de Shopify
- [ ] **Swipe "Like"** agrega a favoritos
- [ ] **Carrito actualiza** contador en Shopify
- [ ] **Analytics dashboard** solo accesible via URL secreta
- [ ] **Widget embebido** funciona en páginas de producto
- [ ] **Mobile responsive** en todos los tamaños

---

## 🔧 **CONFIGURACIÓN AVANZADA**

### **Analytics y Tracking**

Tu dashboard incluye métricas de:

- **Swipes por producto** (Like/Dislike/Love It)
- **Conversión a carrito** por producto
- **Productos más populares**
- **Patrones de comportamiento**

Acceso: `https://tu-dominio.com/analytics-dashboard-full`

### **Personalización del Widget**

En el Theme Customizer puedes configurar:

- **Altura del widget**
- **Colección de productos**
- **Límite de productos**
- **Colores y estilos**
- **Títulos y subtítulos**

### **API Endpoints Disponibles**

```
GET  /                                 - App principal
GET  /widget                          - Widget para embed
GET  /analytics-dashboard-full        - Dashboard admin
POST /api/analytics                   - Eventos de analytics
```

---

## 🚨 **SOLUCIÓN DE PROBLEMAS**

### **Productos no cargan:**

1. Verificar `VITE_SHOPIFY_DOMAIN` en `.env`
2. Confirmar Storefront token válido
3. Revisar permisos de API en Shopify

### **Widget no aparece:**

1. Verificar archivos subidos al tema
2. Comprobar CORS en hosting
3. Revisar dominio en widget config

### **Carrito no actualiza:**

1. Confirmar `/cart/add.js` funciona en tu tema
2. Verificar formato de variant IDs
3. Chequear eventos postMessage

### **Analytics no funciona:**

1. URL debe ser exacta: `/analytics-dashboard-full`
2. Solo accesible vía enlace directo
3. Revibar dominio en configuración

---

## 💡 **MEJORES PRÁCTICAS**

### **Para Store Owners:**

- **Promociona** la página SwipeShop en redes sociales
- **Agrega** al menú principal para mayor descubrimiento
- **Usa analytics** para identificar productos populares
- **Optimiza colecciones** basado en métricas

### **Para Developers:**

- **Monitor** analytics para performance
- **Actualiza** productos regularmente vía API
- **Implementa** A/B testing en UI
- **Optimiza** para mobile experience

---

## 🎉 **¡FELICIDADES!**

**Tu SwipeShop está completamente integrado con Shopify.**

### **Lo que tienes ahora:**

✅ **App completa** con productos reales de tu tienda  
✅ **Widget embebible** en páginas de producto  
✅ **Página dedicada** para experiencia completa  
✅ **Dashboard de analytics** con métricas reales  
✅ **Integración directa** con carrito de Shopify  
✅ **Mobile optimized** para todos los dispositivos

### **Próximos pasos:**

1. **Promocionar** la nueva experiencia a tus clientes
2. **Analizar métricas** para optimizar catálogo
3. **Iterar** basado en feedback de usuarios
4. **Expandir** funcionalidades según necesidades

---

## 📞 **Soporte Técnico**

Si necesitas ayuda:

### **Logs importantes:**

```bash
# Ver errores de build
npm run build

# Ver errores de tipo
npm run typecheck

# Ver errores en browser console
F12 → Console tab
```

### **Enlaces útiles:**

- **Shopify API Docs**: https://shopify.dev/docs/api
- **Vite Config**: https://vitejs.dev/config/
- **React Router**: https://reactrouter.com/

**¡Tu SwipeShop + Shopify está listo para conquistar el e-commerce! 🚀**
