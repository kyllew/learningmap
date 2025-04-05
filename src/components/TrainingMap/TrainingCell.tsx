import React from 'react';
import { useDroppable, useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { TrackItem } from '@/types/TrainingMap';
import Box from "@cloudscape-design/components/box";
import Link from "@cloudscape-design/components/link";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Badge from "@cloudscape-design/components/badge";

interface TrainingCellProps {
  levelId: string;
  trackId: string;
  items: TrackItem[];
  onRemoveCourse: (trackId: string, courseTitle: string) => void;
  isMerged?: boolean;
}

interface DraggableCourseItemProps {
  course: TrackItem;
  trackId: string;
  onRemoveCourse: (trackId: string, courseTitle: string) => void;
}

const DraggableCourseItem: React.FC<DraggableCourseItemProps> = ({ 
  course, 
  trackId,
  onRemoveCourse 
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: course.title,
    data: {
      ...course,
      sourceTrackId: trackId
    }
  });

  const style = transform ? {
    transform: CSS.Transform.toString(transform),
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`
        p-2 rounded-lg border border-gray-200
        bg-white cursor-grab active:cursor-grabbing
        hover:shadow-md hover:border-blue-300
        transform hover:scale-[1.02]
        transition-all duration-200
        ${isDragging ? 'opacity-0' : ''}
      `}
    >
      <SpaceBetween size="xs">
        <Link href={course.url} external>
          {course.title}
        </Link>
        <Box>
          <SpaceBetween size="xs" direction="horizontal">
            <Badge>{course.duration}</Badge>
            <Badge 
              color={
                course.level === 'fundamental' ? 'blue' : 
                course.level === 'associate' ? 'green' : 'grey'
              }
            >
              {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
            </Badge>
          </SpaceBetween>
        </Box>
      </SpaceBetween>
    </div>
  );
};

const TrainingCell: React.FC<TrainingCellProps> = ({
  levelId,
  trackId,
  items,
  onRemoveCourse,
  isMerged = false,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `${trackId}-${levelId}`,
    data: {
      trackId,
      levelId,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`
        p-4 min-h-[100px] w-full
        transition-all duration-300 ease-in-out
        relative
        ${isOver 
          ? 'before:absolute before:inset-0 before:bg-[#0972d3] before:opacity-10 before:rounded-lg before:border-2 before:border-[#0972d3] before:border-dashed before:animate-pulse' 
          : 'hover:brightness-95'
        }
      `}
    >
      <div className={`
        flex flex-col gap-3 w-full relative z-10
        ${isMerged ? 'items-center' : ''}
      `}>
        {items.map((item, index) => (
          <DraggableCourseItem
            key={`${item.title}-${index}`}
            course={item}
            trackId={trackId}
            onRemoveCourse={onRemoveCourse}
          />
        ))}
      </div>
    </div>
  );
};

export default TrainingCell; 