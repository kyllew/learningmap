'use client';

import { DndContext } from '@dnd-kit/core';
import { ReactNode } from 'react';

interface DndProviderProps {
  children: ReactNode;
}

export default function DndProvider({ children }: DndProviderProps) {
  return (
    <DndContext>
      {children}
    </DndContext>
  );
} 