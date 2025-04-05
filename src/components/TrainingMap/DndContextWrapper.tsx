import React, { ReactNode } from 'react';
import { DndContext } from '@dnd-kit/core';

interface DndContextWrapperProps {
  children: ReactNode;
}

const DndContextWrapper: React.FC<DndContextWrapperProps> = ({ children }) => {
  return (
    <DndContext>
      {children}
    </DndContext>
  );
};

export default DndContextWrapper; 