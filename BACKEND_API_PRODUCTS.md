# API de Productos - Documentación Backend

## Resumen

Este documento describe la estructura de datos y los endpoints para la gestión de productos en Poolside Commerce Hub. Incluye detalles sobre los campos esperados en las solicitudes POST y PUT.

---

## Endpoints

### POST `/admin/products`
Crear un nuevo producto.

**Tipo de contenido:** `multipart/form-data`

**Campos requeridos:**
- `name` (string) - Nombre del producto
- `category` (string) - Categoría del producto
- `base_price` (number) - Precio base en ARS

**Campos opcionales:**
- `description` (string) - Descripción del producto
- `brand` (string) - Marca del producto
- `stock` (number) - Stock total disponible (predeterminado: 0)
- `discount_percent` (number) - Porcentaje de descuento (0-100, predeterminado: 0)
- `variants` (JSON string) - Array de variantes del producto
- `specs` (JSON string) - Array de especificaciones técnicas
- `image` (file) - Imagen del producto (JPG, PNG o WebP, máx. 5 MB)

---

### PUT `/admin/products/{id}`
Actualizar un producto existente.

**Tipo de contenido:** `multipart/form-data`

**Parámetro de ruta:**
- `id` (string) - ID del producto a actualizar

**Campos actualizables:**
Todos los campos listados en POST (excepto que aquí todos son opcionales).

---

## Estructura de Datos

### Objeto Producto Completo

```javascript
{
  // Campos básicos
  "name": "Luminaria LED 12W RGB",           // string, requerido
  "description": "Luminaria sumergible RGB con control remoto",  // string, opcional
  "category": "luminarias",                   // string, requerido (ver categorías válidas)
  "brand": "Pooled",                         // string, opcional
  
  // Precios y descuentos
  "base_price": 1500.00,                     // number, requerido. Precio base en ARS
  "discount_percent": 10,                    // number, opcional (0-100). Nuevo campo - descuento aplicable
  
  // Inventario
  "stock": 50,                               // number, opcional. Stock total
  
  // Variantes
  "variants": [
    {
      "color": "Azul marino",                // string. Color de la variante
      "size": "M",                           // string. Talle/Tamaño
      "stock": 25,                           // number. Stock específico de la variante
      "price_adjustment": 100.00             // number. Ajuste de precio sobre base_price
    },
    {
      "color": "Blanco",
      "size": "L",
      "stock": 25,
      "price_adjustment": 150.00
    }
  ],
  
  // Especificaciones técnicas
  "specs": [
    {
      "key": "Potencia",                     // string. Nombre de la propiedad
      "value": "12 W"                        // string. Valor de la propiedad
    },
    {
      "key": "Material",
      "value": "Acero inoxidable 316L"
    },
    {
      "key": "Voltaje",
      "value": "12V DC"
    }
  ],
  
  // Imagen
  "image": "<File>",                         // FormData File. Imagen del producto
}
```

---

## Categorías Válidas

Las categorías válidas para el campo `category` son:

```typescript
type Category = 
  | 'luminarias'
  | 'controladores'
  | 'kits'
  | 'accesorios'
  | 'otros'
```

---

## Reglas de Validación

### Campos Requeridos
- `name` - No puede estar vacío
- `category` - Debe ser una categoría válida
- `base_price` - Debe ser un número positivo ≥ 0

### Campos Numéricos
Todos los campos numéricos se normalizan en el frontend antes de enviar:
- Se convierte la coma decimal (`,`) a punto (`.`) para compatibilidad con usuarios que escriben en español
- Los valores vacíos, NaN o indefinidos se convierten a `0`
- Los valores se envían como números reales en JSON, nunca como strings

**Ejemplo:**
- Input del usuario: `"12,5"` → Se envía: `12.5` (número)
- Input del usuario: `""` → Se envía: `0` (número)

### Descuento (discount_percent)
- Rango válido: `0` a `100`
- Tipo: número
- Comportamiento:
  - Si está vacío o es `0`: El descuento no se muestra públicamente
  - Si es `> 0`: Se aplica sobre `base_price` para mostrar el precio rebajado
  - Si es `> 100` o negativo: Se normaliza a rango válido en el frontend

### Variantes
- Cada variante debe tener al menos `color` O `size` (no necesariamente ambos)
- Si ambos están vacíos, la variante se descarta
- `stock` y `price_adjustment` se convierten a números (predeterminado: 0)
- `price_adjustment` puede ser negativo (descuento sobre el precio base)

**Ejemplo válido:**
```javascript
[
  { "color": "Azul", "size": "", "stock": 10, "price_adjustment": 0 },     // válido
  { "color": "", "size": "XL", "stock": 5, "price_adjustment": -50 },      // válido
  { "color": "", "size": "", "stock": 0, "price_adjustment": 0 }           // ❌ Se descarta
]
```

### Especificaciones Técnicas (Specs)
- Ambos campos `key` y `value` deben estar completos (no vacíos)
- Si falta alguno, la fila se descarta
- No hay límite máximo de especificaciones

**Ejemplo válido:**
```javascript
[
  { "key": "Potencia", "value": "12 W" },                    // válido
  { "key": "Material", "value": "" },                        // ❌ Se descarta
  { "key": "", "value": "Acero inoxidable" }                 // ❌ Se descarta
]
```

### Imagen
- Formatos aceptados: JPG, PNG, WebP
- Tamaño máximo: 5 MB
- Solo se envía si el usuario la selecciona o cambia
- Para actualizaciones (PUT), omitir el campo si no se desea cambiar la imagen

---

## Ejemplo de Solicitud POST (JavaScript/TypeScript)

```typescript
const form = new FormData();

// Información básica
form.append('name', 'Luminaria LED 12W RGB');
form.append('category', 'luminarias');
form.append('brand', 'Pooled');
form.append('description', 'Luminaria sumergible con control remoto');

// Precios
form.append('base_price', '1500.00');
form.append('discount_percent', '15');  // Nuevo: 15% de descuento

// Inventario
form.append('stock', '50');

// Variantes
form.append('variants', JSON.stringify([
  {
    color: 'Azul marino',
    size: 'M',
    stock: 25,
    price_adjustment: 100
  },
  {
    color: 'Blanco',
    size: 'L',
    stock: 25,
    price_adjustment: 150
  }
]));

// Especificaciones técnicas
form.append('specs', JSON.stringify([
  { key: 'Potencia', value: '12 W' },
  { key: 'Voltaje', value: '12V DC' },
  { key: 'Material', value: 'Acero inoxidable 316L' }
]));

// Imagen
form.append('image', imageFile);

// Enviar
const response = await fetch('/admin/products', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: form
});
```

---

## Ejemplo de Solicitud PUT (JavaScript/TypeScript)

```typescript
const form = new FormData();

// Solo los campos que se desean actualizar
form.append('name', 'Luminaria LED 12W RGB - Versión 2');
form.append('discount_percent', '20');  // Actualizar descuento a 20%
form.append('stock', '75');

// Si se omiten otros campos, se mantienen sin cambios en la base de datos

const response = await fetch('/admin/products/prod-123', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: form
});
```

---

## Respuesta Exitosa

### Formato
```javascript
{
  "id": "prod-123456",
  "name": "Luminaria LED 12W RGB",
  "description": "Luminaria sumergible RGB con control remoto",
  "category": "luminarias",
  "brand": "Pooled",
  "base_price": 1500.00,
  "discount_percent": 15,
  "stock": 50,
  "images": ["https://cdn.example.com/image.jpg"],
  "variants": [
    {
      "id": "var-1",
      "color": "Azul marino",
      "size": "M",
      "stock": 25,
      "price_adjustment": 100
    }
  ],
  "specs": [
    {
      "key": "Potencia",
      "value": "12 W"
    }
  ],
  "created_at": "2026-05-12T10:30:00Z",
  "updated_at": "2026-05-12T10:30:00Z"
}
```

### Códigos HTTP
- **201 Created** - Producto creado exitosamente (POST)
- **200 OK** - Producto actualizado exitosamente (PUT)
- **400 Bad Request** - Validación fallida (campos requeridos faltantes, valores inválidos)
- **401 Unauthorized** - Token no proporcionado o inválido
- **403 Forbidden** - Usuario no tiene permisos de admin
- **404 Not Found** - Producto no existe (PUT)
- **500 Internal Server Error** - Error del servidor

---

## Notas Importantes

### Descuento (Nuevo Campo)
El campo `discount_percent` es **nuevo** y fue incorporado recientemente:
- Es completamente **opcional** en POST y PUT
- Rango válido: 0-100
- Un valor de 0 o vacío indica que no hay descuento activo
- Se aplica sobre `base_price` para calcular el precio final

### Integración con Variantes
- Si el producto tiene **variantes**: cada variante puede tener su propio `price_adjustment`
- El descuento (`discount_percent`) se aplica **primero** al `base_price`
- Luego se suma el `price_adjustment` de la variante específica
- Fórmula: `precio_final = (base_price - base_price * discount_percent/100) + price_adjustment`

### Normalización de Números en Frontend
El frontend normaliza automáticamente los números antes de enviar:
```typescript
// Input del usuario → Enviado al backend
"12,5" → 12.5
"1500,00" → 1500
"" → 0
"abc" → 0
"-50" → -50 (válido para price_adjustment)
```

---

## Cambios Recientes

### Versión 2.0 - Nuevo Campo: Descuento
- ✅ Agregado campo `discount_percent` al modelo de producto
- ✅ Descuento se aplica sobre el `base_price`
- ✅ Opcional en crear y actualizar productos
- ✅ Frontend normaliza valores entre 0-100
- ✅ Se envía siempre como número en JSON, nunca como string

---

## Soporte

Para reportar problemas o sugerencias sobre esta documentación, contacta al equipo de desarrollo.

