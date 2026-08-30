import { cn } from '@/lib/utils';

type MockupVariant = 'landing' | 'store' | 'dashboard';

interface BrowserMockupProps {
  /** Tailwind gradient classes for accent surfaces, e.g. "from-emerald-500 to-amber-400" */
  gradient: string;
  variant?: MockupVariant;
  domain?: string;
  className?: string;
}

function Chrome({ domain }: { domain: string }) {
  return (
    <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-4 py-2.5">
      <span className="size-2.5 rounded-full bg-red-400" />
      <span className="size-2.5 rounded-full bg-amber-400" />
      <span className="size-2.5 rounded-full bg-lime-400" />
      <span className="ml-2 flex h-5 min-w-0 flex-1 items-center gap-1.5 rounded-full bg-white px-2.5 ring-1 ring-gray-200">
        <span className="size-1.5 shrink-0 rounded-full bg-lime-500" />
        <span className="truncate text-[9px] font-medium text-gray-400">{domain}</span>
      </span>
    </div>
  );
}

function FakeNav({ gradient }: { gradient: string }) {
  return (
    <div className="flex items-center justify-between px-1 pb-2.5">
      <div className="flex items-center gap-1.5">
        <span className={cn('size-3 rounded-full bg-gradient-to-br', gradient)} />
        <span className="h-1.5 w-10 rounded-full bg-gray-200" />
      </div>
      <div className="hidden gap-2 sm:flex">
        <span className="h-1.5 w-6 rounded-full bg-gray-100" />
        <span className="h-1.5 w-6 rounded-full bg-gray-100" />
        <span className="h-1.5 w-6 rounded-full bg-gray-100" />
      </div>
      <span className={cn('h-4 w-12 rounded-full bg-gradient-to-r', gradient)} />
    </div>
  );
}

function LandingBody({ gradient }: { gradient: string }) {
  return (
    <div className="flex h-full flex-col p-3">
      <FakeNav gradient={gradient} />
      <div className={cn('relative flex-1 overflow-hidden rounded-xl bg-gradient-to-br p-4', gradient)}>
        <div className="absolute -right-4 -top-6 size-20 rounded-full bg-white/25 blur-xl" />
        <div className="max-w-[62%] space-y-2">
          <span className="block h-2.5 w-3/4 rounded-full bg-white/90" />
          <span className="block h-2.5 w-1/2 rounded-full bg-white/70" />
          <span className="mt-2.5 block h-1.5 w-2/3 rounded-full bg-white/50" />
          <span className="mt-3 inline-block h-5 w-16 rounded-full bg-white shadow-sm" />
        </div>
        <div className="absolute bottom-3 right-3 h-14 w-16 rounded-lg bg-white/20 ring-1 ring-white/30 backdrop-blur-sm" />
      </div>
      <div className="grid grid-cols-3 gap-2 pt-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="space-y-1.5 rounded-lg border border-gray-100 p-2">
            <span className={cn('block size-4 rounded-md', i === 1 ? cn('bg-gradient-to-br', gradient) : 'bg-gray-100')} />
            <span className="block h-1.5 w-full rounded-full bg-gray-100" />
          </div>
        ))}
      </div>
    </div>
  );
}

function StoreBody({ gradient }: { gradient: string }) {
  return (
    <div className="flex h-full flex-col gap-2 p-3">
      <FakeNav gradient={gradient} />
      <div className={cn('h-12 shrink-0 rounded-xl bg-gradient-to-r p-2.5 md:h-14', gradient)}>
        <span className="block h-2 w-1/3 rounded-full bg-white/90" />
        <span className="mt-1.5 block h-1.5 w-1/2 rounded-full bg-white/60" />
      </div>
      <div className="grid flex-1 grid-cols-3 gap-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex flex-col overflow-hidden rounded-lg border border-gray-100">
            <div className={cn('flex-1', i === 1 ? cn('bg-gradient-to-br', gradient) : 'bg-gray-100')} />
            <div className="space-y-1 p-1.5">
              <span className="block h-1.5 w-4/5 rounded-full bg-gray-200" />
              <span className="block h-1.5 w-1/3 rounded-full bg-gray-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DashboardBody({ gradient }: { gradient: string }) {
  const bars = [42, 68, 52, 82, 60, 92, 72];
  return (
    <div className="flex h-full gap-2 p-3">
      <div className="w-11 shrink-0 space-y-1.5 rounded-lg bg-gray-50 p-2 ring-1 ring-gray-100 md:w-12">
        <span className={cn('mb-2 block size-5 rounded-md bg-gradient-to-br', gradient)} />
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="block h-1.5 w-full rounded-full bg-gray-200/80" />
        ))}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="grid grid-cols-3 gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="space-y-1 rounded-lg border border-gray-100 p-2">
              <span className="block h-1 w-2/3 rounded-full bg-gray-100" />
              <span className={cn('block h-2 w-1/2 rounded-full bg-gradient-to-r', gradient)} />
            </div>
          ))}
        </div>
        <div className="flex flex-1 items-end gap-1.5 rounded-lg border border-gray-100 p-2">
          {bars.map((h, i) => (
            <span
              key={i}
              style={{ height: `${h}%` }}
              className={cn('flex-1 rounded-t bg-gradient-to-t', gradient, i % 2 === 1 ? 'opacity-45' : 'opacity-90')}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Pure-CSS browser-window mockup used for hero collages and project art.
 * Zero images, fully responsive, crisp at any size.
 */
export function BrowserMockup({ gradient, variant = 'landing', domain = 'example.com', className }: BrowserMockupProps) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_10px_40px_rgba(0,0,0,0.08)]',
        className
      )}
    >
      <Chrome domain={domain} />
      <div className="h-44 md:h-52">
        {variant === 'landing' ? <LandingBody gradient={gradient} /> : null}
        {variant === 'store' ? <StoreBody gradient={gradient} /> : null}
        {variant === 'dashboard' ? <DashboardBody gradient={gradient} /> : null}
      </div>
    </div>
  );
}
