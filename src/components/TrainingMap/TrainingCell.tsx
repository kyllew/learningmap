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

// Create a separate component for draggable course items
const DraggableCourseItem: React.FC<{
  item: TrackItem;
  trackId: string;
  onRemoveCourse: (trackId: string, courseTitle: string) => void;
}> = ({ item, trackId, onRemoveCourse }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `${trackId}-${item.title}`,
    data: {
      ...item,
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
      {...attributes}
      {...listeners}
      className={`
        relative group bg-white p-3 rounded-lg
        border border-[#e9ebed]
        transition-all duration-300 ease-in-out
        hover:shadow-lg hover:scale-[1.02]
        hover:border-[#0972d3]
        cursor-grab active:cursor-grabbing
      `}
    >
      <button
        onClick={() => onRemoveCourse(trackId, item.title)}
        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 
                 p-1 rounded-full bg-red-100 hover:bg-red-200 
                 transition-all duration-300 ease-in-out
                 transform group-hover:rotate-90"
      >
        <svg
          className="w-3 h-3 text-red-600"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <Box variant="awsui-key-label">
        <Link
          href={item.url}
          external
          className="block mb-2"
        >
          {item.title}
        </Link>
        <SpaceBetween size="xs" direction="horizontal">
          <Badge>{item.duration}</Badge>
          <Badge 
            color={
              item.level === 'fundamental' ? 'blue' : 
              item.level === 'associate' ? 'green' : 'red'
            }
          >
            {item.level.charAt(0).toUpperCase() + item.level.slice(1)}
          </Badge>
        </SpaceBetween>
      </Box>
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
            item={item}
            trackId={trackId}
            onRemoveCourse={onRemoveCourse}
          />
        ))}
      </div>
    </div>
  );
};

export default TrainingCell; 