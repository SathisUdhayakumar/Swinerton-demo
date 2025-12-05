'use client';

import { usePathname } from 'next/navigation';
import { SidebarNav } from './SidebarNav';
import { ProjectSidebar } from '@/components/project/ProjectSidebar';

export function ConditionalSidebar() {
  const pathname = usePathname();
  const isProjectPage = pathname?.startsWith('/project/');

  if (isProjectPage) {
    return <ProjectSidebar />;
  }

  return <SidebarNav />;
}

