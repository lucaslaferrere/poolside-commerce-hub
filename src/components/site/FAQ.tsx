import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const FAQS = [
  {
    q: '¿Cuánto tarda el envío?',
    a: 'Despachamos en 24-48hs hábiles. La entrega varía entre 2 y 7 días según tu ubicación. Trabajamos con Andreani, OCA y Correo Argentino.',
  },
  {
    q: '¿Las luminarias son aptas para piletas con cloro o sal?',
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
    a: 'Sí, aceptamos MercadoPago (todos los medios), transferencia bancaria con 5% de descuento y efectivo.',
  },
  {
    q: '¿Trabajan con instaladores y tiendas?',
    a: 'Sí, tenemos un programa de distribuidores con precios mayoristas. Completá el formulario en la sección "Distribuidores".',
  },
];

export function FAQ() {
  return (
    <section id="faq" className="py-16 md:py-24 gradient-light">
      <div className="container max-w-3xl">
        <div className="text-center mb-10">
          <span className="text-sm font-semibold text-secondary uppercase tracking-wider">Preguntas frecuentes</span>
          <h2 className="font-display text-3xl md:text-5xl font-bold mt-2 text-balance">
            Resolvé tus dudas
          </h2>
        </div>

        <Accordion type="single" collapsible className="space-y-3">
          {FAQS.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="bg-card border rounded-lg px-5 shadow-card">
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
