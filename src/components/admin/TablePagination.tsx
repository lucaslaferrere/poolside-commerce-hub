import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Props {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  /** How many numbered buttons to render around the current page (siblings each side). */
  siblings?: number;
}

/**
 * Compact pagination control. Produces a list of page numbers with ellipses
 * (e.g. 1 … 4 5 6 … 24) plus prev/next chevrons. Stateless — the parent owns
 * `page` and reacts to `onChange`.
 */
export function TablePagination({ page, totalPages, onChange, siblings = 1 }: Props) {
  if (totalPages <= 1) return null;

  const pages = buildPageList(page, totalPages, siblings);

  return (
    <nav
      role="navigation"
      aria-label="Paginación de la tabla"
      className="inline-flex items-center gap-1"
    >
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page <= 1}
        aria-label="Página anterior"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {pages.map((p, i) =>
        p === 'ellipsis' ? (
          <span
            key={`e-${i}`}
            className="grid place-items-center h-8 w-8 text-neutral-400 text-sm select-none"
            aria-hidden="true"
          >
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            aria-current={p === page ? 'page' : undefined}
            className={cn(
              'h-8 min-w-[2rem] px-2 rounded-md text-sm font-medium tabular-nums transition-colors',
              p === page
                ? 'bg-brand text-brand-foreground'
                : 'text-neutral-700 hover:bg-neutral-100',
            )}
          >
            {p}
          </button>
        ),
      )}

      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page >= totalPages}
        aria-label="Página siguiente"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
}

type Slot = number | 'ellipsis';

function buildPageList(page: number, total: number, siblings: number): Slot[] {
  const first = 1;
  const last = total;
  const left = Math.max(first + 1, page - siblings);
  const right = Math.min(last - 1, page + siblings);

  const slots: Slot[] = [first];
  if (left > first + 1) slots.push('ellipsis');
  for (let i = left; i <= right; i++) slots.push(i);
  if (right < last - 1) slots.push('ellipsis');
  if (last > first) slots.push(last);

  return slots;
}
