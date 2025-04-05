'use client';

import React, { ReactNode } from 'react';
import { 
  DndContext, 
  DragEndEvent,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
  defaultDropAnimation,
  DragOverlay,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core';

interface DndProviderProps {
  children: ReactNode;
  onDragStart?: (event: DragStartEvent) => void;
  onDragEnd?: (event: DragEndEvent) => void;
  activeId?: string | null;
  activeItem?: any;
}

const DndProvider: React.FC<DndProviderProps> = ({ 
  children, 
  onDragStart, 
  onDragEnd,
  activeId,
  activeItem
}) => {
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 10,
    },
  });
  
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 250,
      tolerance: 5,
    },
  });

  const sensors = useSensors(mouseSensor, touchSensor);

  const dropAnimation = {
    ...defaultDropAnimation,
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.5',
        },
      },
    }),
    duration: 0,
  };

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      {children}
      <DragOverlay 
        dropAnimation={dropAnimation}
        style={{
          position: 'fixed',
          zIndex: 100,
          pointerEvents: 'none',
        }}
      >
        {activeId && activeItem && (
          <div 
            className="bg-white px-4 py-2 rounded-md border border-blue-200 text-base font-medium text-gray-700"
            style={{
              position: 'relative',
              zIndex: 100,
              pointerEvents: 'none',
              maxWidth: '300px',
              minWidth: '200px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {activeItem.title}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
};

export default DndProvider; 