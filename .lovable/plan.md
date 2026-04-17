
# E-commerce de Accesorios para Piletas — Plan v1

## Stack
React + Vite + Tailwind + shadcn/ui + Lucide + Framer Motion + **Lovable Cloud** (Supabase) para leads, pedidos y catálogo administrable.

## Identidad visual
- **Paleta acuática**: azul profundo `#0A2A43`, turquesa `#1FB8CD`, celeste claro `#E6F7FB`, blanco, acento dorado suave para CTAs premium.
- **Tipografía**: Poppins (display) + Inter (body).
- **Tono**: comercial, fresco, simple. Microcopy vendedor.
- **Animaciones**: Framer Motion para wave dividers, fade-in en scroll, carrusel y transiciones del wizard.

## Estructura del Home (una sola página, scroll vertical)

1. **Header sticky** — logo izq., menú hamburguesa lateral (Sheet) en mobile, links inline en desktop (Inicio, Tienda, Kits, Guía, Distribuidores, FAQ), íconos de perfil y carrito con badge de cantidad.
2. **Hero full-screen** — contenedor para video (autoplay, loop, muted, playsInline) con placeholder mientras pasás el archivo. Overlay con headline vendedor, subtítulo y CTA "Ver Catálogo" + CTA secundario "Asesoría por WhatsApp".
3. **Wave divider** azul animado.
4. **Productos Destacados** — carrusel horizontal con tarjetas (imagen, nombre, badge categoría, precio, botón "Agregar"). Datos de ejemplo: ~14 productos en categorías Luminarias, Controladores, Kits, Línea Osire.
5. **Guía de Compra Inteligente (Wizard 4 pasos)**:
   - Paso 1: Tamaño de pileta (chica <30m³, mediana 30-60m³, grande >60m³)
   - Paso 2: Tipo (fibra / hormigón / revestida)
   - Paso 3: Uso (residencial / comercial-hotel)
   - Paso 4: Control preferido (manual / control remoto / app/automatización)
   - Resultado: kit recomendado con productos sugeridos, botón "Agregar kit al carrito" y "Consultar por WhatsApp".
6. **Sección Kits prearmados** — 3-4 kits destacados con descuento.
7. **Banner Distribuidores** — CTA al formulario de leads.
8. **Instagram Feed** — grilla de 6-8 imágenes mockeadas con overlay hover.
9. **FAQ** — Accordion con 6-8 preguntas frecuentes.
10. **Footer** — datos de contacto, redes, métodos de pago, links útiles.

## Funcionalidades transversales

- **Carrito drawer lateral** (Sheet derecho): items editables, subtotal, dos CTAs: "Finalizar compra" y "Consultar por WhatsApp" (arma mensaje con detalle del carrito).
- **Checkout simulado** (modal/página): datos de envío, cálculo de envío por código postal (mock con tabla de zonas), selector de método de pago: MercadoPago (placeholder) o "Pago a convenir" (transferencia/efectivo). Al confirmar se guarda el pedido en la base.
- **Botón flotante de WhatsApp** siempre visible (bottom-right), con tooltip.
- **Formulario de Distribuidores** (sección dedicada + modal): nombre, empresa, ciudad, teléfono, email, mensaje. Validación con Zod. Guarda el lead en la base; deja preparado el envío a CRM Kommo (lo activamos cuando me pases la API key).
- **Notificaciones toast** en acciones clave (agregar al carrito, enviar formulario, etc.).

## Backend (Lovable Cloud)

Tablas:
- `products` — id, nombre, categoría, precio, imagen, descripción, destacado, stock.
- `kits` — id, nombre, descripción, precio, productos asociados.
- `orders` — datos cliente, items (JSON), total, método de pago, estado, código postal, costo envío.
- `distributor_leads` — datos del formulario, estado, fecha, flag `synced_to_crm`.
- `wizard_recommendations` (opcional) — log anónimo de qué eligió la gente para insights.

Seed inicial con los ~14 productos y 4 kits de ejemplo. RLS pública de lectura para `products`/`kits`, inserts públicos validados para `orders` y `distributor_leads`.

## Responsive
Mobile-first. Hamburger menu, carrusel swipeable, wizard en pasos full-width en mobile, carrito drawer adaptado.

## Lo que queda fuera de esta v1 (para próximas iteraciones)
- Integración real con MercadoPago (requiere credenciales y webhook).
- Integración real con Kommo CRM vía API (requiere endpoint y token; lead ya queda guardado en la base lista para sincronizar).
- Login de usuarios y panel "Mi cuenta".
- Panel admin para editar productos desde UI.
- Video real del Hero (lo reemplazo cuando lo pases).

Una vez aprobado, lo construyo de corrido y lo dejamos andando para que lo recorras.
