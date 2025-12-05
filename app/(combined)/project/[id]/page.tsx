'use client';

import { use } from 'react';
import { MaterialTable } from '@/components/material/MaterialTable';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProjectDetailPage({ params }: PageProps) {
  const { id } = use(params);

  return <MaterialTable projectId={id} />;
}
