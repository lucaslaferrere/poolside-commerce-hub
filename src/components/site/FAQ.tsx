import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const FAQS = [
  {
    q: '¿Cuánto tarda el envío?',
    a: 'Despachamos en 24-48hs hábiles. La entrega varía entre 2 y 7 días según tu ubicación. Trabajamos con Andreani, OCA y Correo Argentino.',
  },
  {
    q: '¿Las luminarias son aptas para piscinas con cloro o sal?',
    a: 'Sí, todas nuestras luminarias tienen certificación IP68 y materiales resistentes al cloro y al agua salada.',
  },
  {
    q: '¿Tienen garantía?',
    a: 'Todos los productos tienen garantía oficial de 2 años. La línea Osire incluye garantía extendida de 5 años.',
  },
  {
    q: '¿Necesito un electricista para instalar?',
    a: 'Recomendamos instalación profesional. Igualmente, en cada producto incluimos manual con diagrama y videos paso a paso.',
  },
  {
    q: '¿Puedo elegir colores y escenas?',
    a: 'Sí, las luminarias RGB tienen 16 colores y múltiples escenas preprogramadas. Con el control Smart WiFi podés crear las propias.',
  },
  {
    q: '¿Aceptan transferencia bancaria?',
    a: 'Sí, aceptamos MercadoPago (todos los medios) y transferencia bancaria con 5% de descuento.',
  },
  {
    q: '¿Trabajan con instaladores y tiendas?',
    a: 'Sí, tenemos un programa de distribuidores con precios mayoristas. Completá el formulario en la sección "Distribuidores".',
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
