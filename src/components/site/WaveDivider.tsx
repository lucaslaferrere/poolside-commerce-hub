import { cn } from '@/lib/utils';

interface Props {
  className?: string;
  flip?: boolean;
  fillClass?: string; // tailwind text-* class for currentColor (the wave fill = next section bg)
  bgClass?: string;   // tailwind bg-* class for the div background (= current section bg)
}

export function WaveDivider({ className, flip = false, fillClass = 'text-muted', bgClass }: Props) {
  return (
    <div className={cn('w-full overflow-hidden leading-[0]', bgClass, flip && 'rotate-180', className)} aria-hidden>
      <svg
        viewBox="0 0 1440 100"
        preserveAspectRatio="none"
        className={cn('block h-[60px] w-full', fillClass)}
      >
        <path
          d="M0,40 C240,90 480,0 720,40 C960,80 1200,20 1440,50 L1440,100 L0,100 Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
}
