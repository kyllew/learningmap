'use client';

import React from 'react';
import { TrackItem } from '@/types/TrainingMap';

interface CourseModalProps {
  course: TrackItem;
  onClose: () => void;
}

export const CourseModal: React.FC<CourseModalProps> = ({ course, onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg p-8 w-[90%] max-w-[600px] relative"
        onClick={e => e.stopPropagation()}
      >
        <button 
          className="absolute top-4 right-4 text-2xl border-none bg-transparent cursor-pointer"
          onClick={onClose}
        >
          &times;
        </button>

        <h2 className="text-2xl font-bold mb-6">{course.title}</h2>

        <div className="space-y-4">
          <div className="flex justify-between py-2 border-b">
            <span className="font-medium">Duration:</span>
            <span>{course.duration}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="font-medium">Type:</span>
            <span className="capitalize">{course.type}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="font-medium">Level:</span>
            <span className="capitalize">{course.level}</span>
          </div>
          {course.status && (
            <div className="flex justify-between py-2 border-b">
              <span className="font-medium">Status:</span>
              <span className={`
                px-2 py-1 rounded-md capitalize
                ${course.status === 'not-started' ? 'bg-gray-100 text-gray-600' : ''}
                ${course.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' : ''}
                ${course.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
              `}>
                {course.status.replace('-', ' ')}
              </span>
            </div>
          )}
        </div>

        <div className="flex gap-4 mt-8">
          <button 
            className="flex-1 bg-aws-orange text-white font-bold py-2 px-4 rounded-md hover:opacity-90"
          >
            Start Course
          </button>
          <button 
            className="flex-1 bg-gray-100 text-gray-800 font-bold py-2 px-4 rounded-md hover:bg-gray-200"
          >
            Add to Learning Plan
          </button>
        </div>
      </div>
    </div>
  );
}; 