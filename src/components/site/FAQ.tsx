import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const FAQS = [
  {
    q: '¿Cómo sé qué luminaria necesita mi piscina?',
    a: 'Depende de las medidas de la piscina, el material, los sectores a iluminar y si se trata de una obra nueva o un recambio. Enviándonos esos datos podemos recomendarte la luminaria, la cantidad y el sistema de control adecuados para tu proyecto.',
  },
  {
    q: '¿Cuántas luminarias necesito?',
    a: 'La cantidad depende principalmente del largo, ancho y distribución de la piscina. Como referencia, las líneas de 12V suelen instalarse con una separación de hasta 2 metros, mientras que OSIRE, gracias a su mayor rendimiento lumínico, permite separaciones de hasta 3 metros. Playas húmedas, escalones y otros sectores especiales se calculan por separado.',
  },
  {
    q: '¿Más luminarias significa mejor iluminación?',
    a: 'No necesariamente. Una buena iluminación depende de la distribución, no solo de la cantidad. Buscamos lograr una luz pareja, evitando zonas oscuras y también el exceso de iluminación o encandilamiento.',
  },
  {
    q: '¿Las luminarias incluyen fuente y controlador?',
    a: 'Depende del producto o kit elegido. POOLED ofrece sistemas completos que combinan luminarias, controlador y accesorios compatibles. Nuestros controladores integran alimentación y control en un mismo equipo, simplificando la instalación.',
  },
  {
    q: '¿Necesito un controlador?',
    a: 'Sí. El controlador reduce los 220V de la red a la baja tensión que utilizan las luminarias —12V o 24V según la línea— y administra su funcionamiento. Además, según el modelo, permite controlar colores, intensidad, escenas y funciones inteligentes.',
  },
  {
    q: '¿Sirven para una piscina ya construida?',
    a: 'Sí. Podemos trabajar tanto sobre piscinas nuevas como existentes. Si ya tenés luminarias o nichos instalados, analizamos la instalación para recomendarte la alternativa de recambio o adaptación más conveniente.',
  },
  {
    q: '¿Se pueden instalar en piscinas de material o de fibra?',
    a: 'Sí. Contamos con sistemas de fijación específicos para piscinas de hormigón/revestidas y para piscinas de fibra de vidrio. El accesorio utilizado cambia según el tipo de estructura para garantizar una instalación correcta y estanca.',
  },
  {
    q: '¿Tienen luz blanca y de colores? ¿Qué diferencia hay entre RGB y RGBW?',
    a: 'Sí. Contamos con alternativas en blanco y RGBW. A diferencia del RGB convencional, el RGBW incorpora un canal LED blanco independiente, logrando un blanco real además de los colores. También contamos con Horus White & White, que permite regular entre blanco cálido y frío.',
  },
  {
    q: '¿Qué diferencia hay entre OSIRE, Horus, Nazar y Poolight?',
    a: 'OSIRE Ultimate es nuestra línea de mayor tecnología y prestaciones. Combina alto rendimiento lumínico, 24V, protección térmica activa, tecnología propia y 3 años de garantía. Además, es la línea recomendada para piscinas con agua salada.',
  },
  {
    q: '¿Cuánto tarda el envío?',
    a: 'Despachamos en 24-48hs hábiles. La entrega varía entre 2 y 7 días según tu ubicación. Trabajamos con Andreani, OCA y Correo Argentino.',
  },
  {
    q: '¿Las luminarias resisten el cloro y la sal?',
    a: 'Todas nuestras luminarias cuentan con protección IP68 y son resistentes al agua con cloro. Para piscinas con sistema de agua salada, recomendamos la línea OSIRE Ultimate, diseñada específicamente para resistir este tipo de condiciones..',
  },
  {
    q: '¿Tienen garantía?',
    a: 'Las luminarias Nazar, Horus y Poolight cuentan con 1 año de garantía oficial, mientras que la línea OSIRE incluye una garantía extendida de 3 años. Todos nuestros controladores también cuentan con 1 año de garantía. El resto de los productos está cubierto ante posibles defectos de fabricación.',
  },
  {
    q: '¿Necesito un instalador profesional?',
    a: 'Recomendamos instalación profesional. Igualmente, en cada producto incluimos manual con diagrama y videos paso a paso.',
  },
  {
    q: '¿Puedo controlar colores y programar escenas?',
    a: 'Sí, las luminarias RGBW tienen 16 colores y múltiples escenas preprogramadas. Con el control Smart WiFi podés crear las propias.',
  },
  {
    q: '¿Aceptan transferencia bancaria?',
    a: 'Sí, aceptamos MercadoPago (todos los medios) y transferencia bancaria con 3.5% de descuento.',
  },
  {
    q: '¿Tienen precios para distribuidores y profesionales?',
    a: 'Sí, con condiciones especiales para comercios, distribuidores, pileteros, constructores de piscinas, arquitectos y profesionales que trabajan habitualmente con nuestros productos. Se accede completando el formulario comercial y acreditando la actividad..',
  },
  {
    q: '¿Cuál es el precio de un juego de dos o tres luminarias?',
    a: 'Depende del modelo, del tipo de iluminación y de si necesitás fuente y controlador. Para cotizar necesitamos: medidas de la piscina, revestimiento, cantidad, luz blanca o RGBW, localidad y si es obra puntual o compra profesional recurrente.',
  },
];

export function FAQ() {
  return (
    <section
      id="faq"
      className="faq-section relative overflow-hidden py-20 md:py-24 bg-[linear-gradient(180deg,#DEE7EE_0%,#EAF1F6_35%,#F4F7FA_70%,#FFFFFF_100%)]"
    >
      {/* Rising bubbles */}
      <div aria-hidden="true" className="faq-bubbles pointer-events-none absolute inset-0">
        <span className="faq-bubble" style={{ left: '8%',  width: 14, height: 14, animationDelay: '0s',   animationDuration: '14s' }} />
        <span className="faq-bubble" style={{ left: '17%', width: 8,  height: 8,  animationDelay: '3s',   animationDuration: '11s' }} />
        <span className="faq-bubble" style={{ left: '27%', width: 18, height: 18, animationDelay: '6s',   animationDuration: '16s' }} />
        <span className="faq-bubble" style={{ left: '38%', width: 6,  height: 6,  animationDelay: '1s',   animationDuration: '10s' }} />
        <span className="faq-bubble" style={{ left: '52%', width: 12, height: 12, animationDelay: '5s',   animationDuration: '13s' }} />
        <span className="faq-bubble" style={{ left: '64%', width: 9,  height: 9,  animationDelay: '8s',   animationDuration: '12s' }} />
        <span className="faq-bubble" style={{ left: '76%', width: 16, height: 16, animationDelay: '2s',   animationDuration: '15s' }} />
        <span className="faq-bubble" style={{ left: '85%', width: 7,  height: 7,  animationDelay: '7s',   animationDuration: '11s' }} />
        <span className="faq-bubble" style={{ left: '93%', width: 11, height: 11, animationDelay: '4s',   animationDuration: '13s' }} />
      </div>
      {/* Brand glow at the bottom (toward the surface) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 left-1/2 -translate-x-1/2 h-[520px] w-[680px] rounded-full bg-[radial-gradient(ellipse,hsl(var(--brand)/0.10),transparent_65%)] blur-3xl"
      />
      <style>{`
        .faq-bubble {
          position: absolute;
          bottom: -40px;
          border-radius: 9999px;
          background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.95), rgba(180,228,255,0.55) 55%, rgba(0,163,214,0.10) 100%);
          box-shadow: inset 0 0 6px rgba(255,255,255,0.6), 0 0 8px rgba(0,163,214,0.18);
          opacity: 0;
          animation: faq-bubble-rise linear infinite;
        }
        @keyframes faq-bubble-rise {
          0%   { transform: translateY(0)     scale(0.85); opacity: 0;   }
          15%  { opacity: 0.7; }
          70%  { opacity: 0.6; }
          100% { transform: translateY(-92vh) scale(1.1);  opacity: 0;   }
        }
        @media (prefers-reduced-motion: reduce) {
          .faq-bubble { animation: none; opacity: 0; }
        }
      `}</style>
      <div className="relative container max-w-3xl">
        <div className="text-center mb-12">
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">Preguntas frecuentes</span>
          <h2 className="font-display text-3xl md:text-5xl font-bold mt-2 text-balance">
            Resolvé tus dudas
          </h2>
        </div>

        <Accordion type="single" collapsible className="space-y-3">
          {FAQS.map((f, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="bg-white border border-gray-100 rounded-lg px-5 shadow-sm hover:shadow-md transition-shadow duration-300 ease-out"
            >
              <AccordionTrigger className="font-display font-semibold text-left hover:no-underline">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
