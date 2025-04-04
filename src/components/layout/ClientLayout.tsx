'use client';

import { DndContext } from '@dnd-kit/core';
import { ReactNode } from 'react';

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <DndContext>
      {children}
    </DndContext>
  );
} 