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

// Import Cloudscape components
import Container from "@cloudscape-design/components/container";
import Header from "@cloudscape-design/components/header";
import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";

const TrainingGrid: React.FC = () => {
  const [tracks, setTracks] = useState<Track[]>(TRACKS);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeCourse, setActiveCourse] = useState<TrackItem | null>(null);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);

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

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    setActiveCourse(active.data.current as TrackItem);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveId(null);
    setActiveCourse(null);

    if (!over) return;

    try {
      const courseData = active.data.current as TrackItem;
      const sourceTrackId = (active.data.current as any)?.sourceTrackId;
      const { trackId, levelId } = over.data.current as { trackId: string; levelId: string };

      setTracks(prevTracks => {
        if (sourceTrackId) {
          // Moving from one cell to another
          const tracksWithoutItem = prevTracks.map(track => {
            if (track.id === sourceTrackId) {
              return {
                ...track,
                items: track.items.filter(item => item.title !== courseData.title)
              };
            }
            return track;
          });

          return tracksWithoutItem.map(track => {
            if (track.id === trackId) {
              return {
                ...track,
                items: [...track.items, { ...courseData, targetLevel: levelId }]
              };
            }
            return track;
          });
        } else {
          // New item from course list
          return prevTracks.map(track => {
            if (track.id === trackId) {
              return {
                ...track,
                items: [...track.items, { ...courseData, targetLevel: levelId }]
              };
            }
            return track;
          });
        }
      });
    } catch (error) {
      console.error('Error in handleDragEnd:', error);
    }
  }, []);

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
    dragSource: ({ source }: { source: { data: { current: { source?: string } } } }) => {
      // If the source is from the course list, disable the return animation
      if (source?.data?.current?.source === 'course-list') {
        return false;
      }
      return true;
    }
  };

  const DraggingOverlay = ({ course }: { course: TrackItem | null }) => {
    if (!course) return null;
    
    return (
      <div
        className={`
          fixed pointer-events-none
          bg-white rounded-lg shadow-2xl
          border-2 border-blue-400
          p-4
          transform scale-105
          transition-transform duration-200
          z-50
        `}
      >
        <span className="font-medium text-sm text-blue-600">
          {course.title}
        </span>
      </div>
    );
  };

  const handleTrackHeaderClick = (trackId: string) => {
    setSelectedTrackId(selectedTrackId === trackId ? null : trackId);
  };

  const displayedTracks = selectedTrackId 
    ? tracks.filter(track => track.id === selectedTrackId)
    : tracks;

  // Add this helper function to filter levels with content
  const getLevelsWithContent = (track: Track) => {
    return LEVELS.filter(level => 
      track.items.some(item => item.targetLevel === level.id)
    );
  };

  // Simplified getLevelColumnWidth function for equal widths
  const getLevelColumnWidth = () => {
    return 'w-[250px] min-w-[250px] max-w-[250px]'; // Added max-width constraint
  };

  // Updated renderLandscapeView function
  const renderLandscapeView = () => {
    const selectedTrack = tracks.find(track => track.id === selectedTrackId);
    if (!selectedTrack) return null;

    const activeLevels = getLevelsWithContent(selectedTrack);

    if (activeLevels.length === 0) {
      return renderEmptyTrackState();
    }

    return (
      <div className="overflow-auto max-h-[calc(100vh-180px)]">
        <table className="w-full border-collapse table-fixed">
          <thead className="sticky top-0 z-30">
            <tr>
              {activeLevels.map((level) => (
                <th 
                  key={level.id}
                  className={`
                    p-4 bg-[#0f1b2a] text-center whitespace-normal 
                    border border-[#e9ebed] z-30
                    ${getLevelColumnWidth()}
                  `}
                >
                  <div className={`text-white font-semibold ${getLevelStyle(level.id)}`}>
                    {level.name}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {activeLevels.map((level, index) => {
                const levelBackground = getLevelBackgroundColor(
                  LEVELS.findIndex(l => l.id === level.id)
                );
                return (
                  <td 
                    key={`${selectedTrack.id}-${level.id}`}
                    className={`
                      border border-[#e9ebed] p-0 
                      ${levelBackground}
                      ${getLevelColumnWidth()}
                    `}
                  >
                    <TrainingCell
                      trackId={selectedTrack.id}
                      levelId={level.id}
                      items={selectedTrack.items.filter(item => item.targetLevel === level.id)}
                      onRemoveCourse={handleRemoveCourse}
                      isLandscape={true}
                    />
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  // Add a droppable area for empty state
  const renderEmptyTrackState = () => {
    const selectedTrack = tracks.find(track => track.id === selectedTrackId);
    if (!selectedTrack) return null;

    return (
      <div 
        className={`
          p-8 text-center text-gray-500
          border-2 border-dashed border-gray-300
          rounded-lg m-4
          min-h-[200px]
          flex flex-col items-center justify-center
        `}
      >
        <div className="text-lg mb-2">Drag courses here to get started</div>
        <div className="text-sm">Courses will be organized by level automatically</div>
      </div>
    );
  };

  // Render regular grid view for all tracks
  const renderGridView = () => {
    return (
      <div className="overflow-auto max-h-[calc(100vh-180px)]">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-30">
            <tr>
              <th className="p-4 bg-[#0f1b2a] border border-[#e9ebed] w-[150px] min-w-[150px] sticky left-0 z-40">
                <div className="text-white font-semibold">
                  Levels
                </div>
              </th>
              {displayedTracks.map(track => (
                <th 
                  key={track.id} 
                  className="p-4 bg-[#0f1b2a] text-center whitespace-normal border border-[#e9ebed] z-30 cursor-pointer hover:bg-[#1a2634] transition-colors duration-200"
                  onClick={() => handleTrackHeaderClick(track.id)}
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
                    {displayedTracks.map(track => (
                      <td 
                        key={`${track.id}-${level.id}`} 
                        className={`border border-[#e9ebed] p-0 ${levelBackground}`}
                      >
                        <TrainingCell
                          trackId={track.id}
                          levelId={level.id}
                          items={track.items.filter(item => item.targetLevel === level.id)}
                          onRemoveCourse={handleRemoveCourse}
                          isLandscape={false}
                        />
                      </td>
                    ))}
                  </tr>
                  {(isLevel1End || isLevel2End) && (
                    <tr className="h-8 bg-[#f4f4f4]">
                      <td colSpan={displayedTracks.length + 1} className="border border-[#e9ebed]"></td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <DndContext 
      sensors={sensors} 
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="min-h-screen bg-gray-100">
        <Container>
          <div className="bg-white p-4 rounded-lg">
            <div className="flex">
              {/* Left Panel - unchanged */}
              <div className="w-[320px] h-[calc(100vh-180px)] flex flex-col bg-white shadow-lg">
                <div className="p-4 flex-shrink-0">
                  <TrackManager 
                    tracks={tracks} 
                    onTracksChange={handleTracksChange} 
                    selectedTrackId={selectedTrackId}
                  />
                </div>
                <div className="flex-1 p-4 overflow-y-auto">
                  <CourseList />
                </div>
              </div>
              
              {/* Grid - updated with track selection */}
              <div className="flex-1 p-4 overflow-x-auto">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                  {selectedTrackId && (
                    <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                      <Button 
                        onClick={() => setSelectedTrackId(null)}
                        iconName="close"
                      >
                        Return to Full Grid
                      </Button>
                      <div className="text-lg font-semibold">
                        {tracks.find(t => t.id === selectedTrackId)?.name}
                      </div>
                    </div>
                  )}
                  {selectedTrackId ? (
                    <div>
                      {getLevelsWithContent(tracks.find(t => t.id === selectedTrackId)!).length > 0 
                        ? renderLandscapeView() 
                        : renderEmptyTrackState()
                      }
                    </div>
                  ) : renderGridView()}
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>
      
      <DragOverlay>
        {activeCourse && <DraggingOverlay course={activeCourse} />}
      </DragOverlay>
    </DndContext>
  );
};

export default TrainingGrid; 