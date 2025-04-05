'use client';

import React, { useState, useCallback } from 'react';
import {
  DndContext,
  DragEndEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverlay,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Track, TrackItem, TRACKS, LEVELS } from '@/types/TrainingMap';
import CourseList from './CourseList';
import TrainingCell from './TrainingCell';
import TrackManager from './TrackManager';
import DndProvider from '@/components/providers/DndProvider';

// Import Cloudscape components
import Container from "@cloudscape-design/components/container";
import Header from "@cloudscape-design/components/header";
import Box from "@cloudscape-design/components/box";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Badge from "@cloudscape-design/components/badge";

const TrainingGrid: React.FC = () => {
  const [tracks, setTracks] = useState<Track[]>(TRACKS);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeItem, setActiveItem] = useState<any>(null);

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 1,
    },
  });
  
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 0,
      tolerance: 5,
    },
  });

  const sensors = useSensors(mouseSensor, touchSensor);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    setActiveItem(active.data.current);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over) {
      const { trackId, levelId } = over.data.current as { trackId: string; levelId: string };
      const courseData = active.data.current as TrackItem;
      
      setTracks(prevTracks => {
        return prevTracks.map(track => {
          if (track.id === trackId) {
            return {
              ...track,
              items: [...track.items, { ...courseData, targetLevel: levelId }]
            };
          }
          return track;
        });
      });
    }

    setActiveId(null);
    setActiveItem(null);
  };

  const handleRemoveCourse = useCallback((trackId: string, courseTitle: string) => {
    setTracks(prevTracks => {
      return prevTracks.map(track => {
        if (track.id === trackId) {
          return {
            ...track,
            items: track.items.filter(item => item.title !== courseTitle),
          };
        }
        return track;
      });
    });
  }, []);

  const handleTracksChange = useCallback((newTracks: Track[]) => {
    setTracks(newTracks);
  }, []);

  const getLevelStyle = (levelId: string) => {
    switch(levelId) {
      case 'level-1':
        return 'bg-[#0972d3]';
      case 'level-2-core':
      case 'level-2-additional':
        return 'bg-[#037f0c]';
      case 'level-3':
        return 'bg-[#5f1dc5]';
      default:
        return 'bg-[#414d5c]';
    }
  };

  const getLevelBackgroundColor = (index: number) => {
    if (index <= 2) return 'bg-[#f2f8fd]';
    if (index <= 6) return 'bg-[#f2f8f6]';
    return 'bg-[#f7f4fc]';
  };

  const dropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.5',
        },
      },
    }),
  };

  // Modify the DraggingOverlay component
  const DraggingOverlay = ({ course }: { course: TrackItem | null }) => {
    if (!course) return null;
    
    return (
      <div
        className={`
          fixed pointer-events-none
          bg-white rounded-lg shadow-2xl
          border-2 border-blue-400
          p-4 w-[300px]
          transform scale-105
          transition-transform duration-200
          z-50
        `}
      >
        <div className="flex flex-col">
          <span className="font-medium text-sm mb-2 text-blue-600">
            {course.title}
          </span>
          <div className="flex items-center gap-2">
            <span className="inline-block bg-gray-100 px-2 py-0.5 rounded text-xs">
              {course.duration}
            </span>
            <span
              className={`
                inline-block px-2 py-0.5 rounded text-xs
                ${course.level === 'fundamental' ? 'bg-blue-100 text-blue-800' :
                  course.level === 'associate' ? 'bg-green-100 text-green-800' :
                  'bg-purple-100 text-purple-800'}
              `}
            >
              {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <DndProvider 
      onDragStart={handleDragStart} 
      onDragEnd={handleDragEnd}
      activeId={activeId}
      activeItem={activeItem}
    >
      <div className="min-h-screen bg-gray-100">
        <Container>
          <div className="bg-white p-4 rounded-lg">
            <div className="grid-container">
              <Header
                variant="h2"
                description="Drag and drop courses to create learning paths"
              >
                Tracks
              </Header>
            </div>
            
            <div className="flex">
              <div className="w-[320px] p-4 bg-white shadow-lg overflow-y-auto">
                <TrackManager tracks={tracks} onTracksChange={handleTracksChange} />
                <div className="mt-4">
                  <CourseList />
                </div>
              </div>
              
              <div className="flex-1 p-4 overflow-x-auto">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="overflow-auto max-h-[calc(100vh-180px)]">
                    <table className="w-full border-collapse">
                      <thead className="sticky top-0 z-10">
                        <tr>
                          <th className="p-4 bg-[#0f1b2a] border border-[#e9ebed] w-[150px] min-w-[150px] sticky left-0 z-20">
                            <div className="text-white font-semibold">
                              Levels
                            </div>
                          </th>
                          {tracks.map(track => (
                            <th 
                              key={track.id} 
                              className="p-4 bg-[#0f1b2a] text-center whitespace-normal border border-[#e9ebed]"
                            >
                              <div className="text-white font-semibold">
                                {track.name}
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {LEVELS.map((level, index) => {
                          const isLevel1End = index === 2;
                          const isLevel2End = index === 6;
                          const levelBackground = getLevelBackgroundColor(index);

                          return (
                            <React.Fragment key={level.id}>
                              <tr className={`group ${levelBackground} hover:brightness-95`}>
                                <td className={`p-4 border border-[#e9ebed] sticky left-0 z-10 ${getLevelStyle(level.id)}`}>
                                  <div className="text-white font-semibold">
                                    {level.name}
                                  </div>
                                </td>
                                {tracks.map(track => (
                                  <td 
                                    key={`${track.id}-${level.id}`} 
                                    className={`border border-[#e9ebed] p-0 ${levelBackground}`}
                                  >
                                    <TrainingCell
                                      trackId={track.id}
                                      levelId={level.id}
                                      items={track.items.filter(item => item.targetLevel === level.id)}
                                      onRemoveCourse={handleRemoveCourse}
                                    />
                                  </td>
                                ))}
                              </tr>
                              {(isLevel1End || isLevel2End) && (
                                <tr className="h-8 bg-[#f4f4f4]">
                                  <td colSpan={tracks.length + 1} className="border border-[#e9ebed]"></td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </DndProvider>
  );
};

export default TrainingGrid; 