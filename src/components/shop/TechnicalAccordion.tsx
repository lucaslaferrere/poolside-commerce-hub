import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';

export interface SpecRow {
  label: string;
  value: string;
}

export interface AccordionSection {
  id: string;
  title: string;
  /** Render either a list of spec rows (table-style) or freeform content. */
  rows?: SpecRow[];
  content?: React.ReactNode;
}

interface TechnicalAccordionProps {
  sections: AccordionSection[];
  defaultOpen?: string;
  className?: string;
}

export function TechnicalAccordion({
  sections,
  defaultOpen,
  className,
}: TechnicalAccordionProps) {
  if (sections.length === 0) return null;
  const initial = defaultOpen ?? sections[0]?.id;

  return (
    <Accordion
      type="single"
      collapsible
      defaultValue={initial}
      className={cn('border-t border-slate-100', className)}
    >
      {sections.map((section, idx) => (
        <AccordionItem
          key={section.id}
          value={section.id}
          className={cn(
            idx === sections.length - 1 ? 'border-0' : 'border-slate-100',
          )}
        >
          <AccordionTrigger className="text-sm font-semibold text-primary hover:text-secondary hover:no-underline py-4">
            {section.title}
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            {section.rows ? (
              <dl className="text-sm">
                {section.rows.map(({ label, value }) => (
                  <div
                    key={label}
                    className="flex items-start justify-between gap-4 py-2.5 border-b border-slate-50 last:border-0"
                  >
                    <dt className="text-muted-foreground shrink-0">{label}</dt>
                    <dd className="font-medium text-primary capitalize text-right">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : (
              <div className="text-sm text-muted-foreground leading-relaxed space-y-2">
                {section.content}
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
