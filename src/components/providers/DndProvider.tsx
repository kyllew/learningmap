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
      <DragOverlay dropAnimation={dropAnimation}>
        {activeId && activeItem && (
          <div className="bg-white p-4 rounded-lg shadow-lg border border-blue-200 transform scale-105">
            <div className="font-medium">{activeItem.title}</div>
            <div className="text-sm text-gray-500">{activeItem.duration}</div>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
};

export default DndProvider; 