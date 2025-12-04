'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export function SiteWorkflowPill() {
  const router = useRouter();

  const handleClick = () => {
    router.push('/site-workflow');
  };

  return (
    <Button
      onClick={handleClick}
      variant="outline"
      role="button"
      aria-label="Open Site Team Workflow"
      className="bg-white hover:bg-slate-50 text-slate-700 border-slate-300 text-sm font-medium px-5 py-3 rounded-full shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
    >
      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
      Site Team Workflow
    </Button>
  );
}
