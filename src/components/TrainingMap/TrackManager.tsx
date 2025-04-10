'use client';

import React, { useState } from 'react';
import { Track, LEVELS } from '@/types/TrainingMap';
import initialTracksData from '@/data/aws-learning-map-init.json';

// Import Cloudscape components
import Container from "@cloudscape-design/components/container";
import Header from "@cloudscape-design/components/header";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Button from "@cloudscape-design/components/button";
import Box from "@cloudscape-design/components/box";
import Alert from "@cloudscape-design/components/alert";
import Link from "@cloudscape-design/components/link";
import Badge from "@cloudscape-design/components/badge";

// Type assertion for the imported JSON data
const typedInitialTracksData = initialTracksData as Track[];

interface TrackManagerProps {
  tracks: Track[];
  onTracksChange: (tracks: Track[]) => void;
}

interface MergedCell {
  startIndex: number;
  endIndex: number;
  content: string;
}

const TrackManager: React.FC<TrackManagerProps> = ({ tracks, onTracksChange }) => {
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const importFromJson = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target?.result as string);
          onTracksChange(json);
        } catch (error) {
          console.error('Error importing JSON:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  const loadInitialTracks = () => {
    try {
      onTracksChange(typedInitialTracksData);
    } catch (error) {
      console.error('Error loading initial tracks:', error);
    }
  };

  const emptyTracks = () => {
    try {
      // Create empty tracks with the same structure but no items
      const emptyTracksData = tracks.map(track => ({
        ...track,
        items: []
      }));
      onTracksChange(emptyTracksData);
    } catch (error) {
      console.error('Error emptying tracks:', error);
    }
  };

  const exportToJson = () => {
    try {
      const dataStr = JSON.stringify(tracks, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `aws-learning-map-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting JSON:', error);
    }
  };

  const exportToHtml = () => {
    try {
      const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>AWS Learning Map</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f8f8f8;
            }
            
            .header {
              background-color: #0972d3;
              color: white;
              padding: 16px;
            }
            
            .header h1 {
              margin: 0;
              font-size: 24px;
              font-weight: bold;
            }
            
            .container {
              max-width: 100%;
              background: white;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
              position: relative;
              height: calc(100vh - 40px);
              overflow: hidden;
              margin: 20px;
            }

            .table-wrapper {
              overflow: auto;
              height: 100%;
              position: relative;
            }
            
            table {
              border-collapse: collapse;
              width: 100%;
              background: white;
            }
            
            th, td {
              border: 1px solid #e9ebed;
              padding: 16px;
            }
            
            /* Sticky header styles */
            thead {
              position: sticky;
              top: 0;
              z-index: 20;
              background: #0f1b2a;
            }

            thead th {
              background-color: #0f1b2a;
              color: white;
              font-weight: 600;
              text-align: center;
              position: relative; /* For border rendering */
            }
            
            /* Sticky first column */
            th:first-child,
            td:first-child {
              position: sticky;
              left: 0;
              z-index: 10;
            }

            /* Increase z-index for the intersection of sticky header and first column */
            thead th:first-child {
              z-index: 30;
            }
            
            .level-header {
              color: white;
              font-weight: 600;
              background-color: inherit;
            }
            
            /* Level background colors */
            .level-1 td:not(:first-child) { background-color: #f2f8fd; }
            .level-2 td:not(:first-child) { background-color: #f2f8f6; }
            .level-3 td:not(:first-child) { background-color: #f7f4fc; }
            
            /* Level header colors */
            .level-1 td:first-child { background-color: #0972d3; }
            .level-2 td:first-child { background-color: #037f0c; }
            .level-3 td:first-child { background-color: #5f1dc5; }
            
            .course-cell {
              background: white;
              border: 1px solid #e9ebed;
              border-radius: 4px;
              padding: 12px;
              margin: 4px 0;
              transition: all 0.2s ease;
            }
            
            .course-cell:hover {
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
              border-color: #0972d3;
            }
            
            .course-title {
              color: #0972d3;
              text-decoration: none;
              font-weight: 500;
              display: block;
              margin-bottom: 8px;
            }
            
            .course-title:hover {
              text-decoration: underline;
            }
            
            .course-meta {
              display: flex;
              gap: 8px;
            }
            
            .badge {
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 12px;
            }
            
            .badge-duration {
              background-color: #f2f2f2;
              color: #444;
            }
            
            .badge-fundamental {
              background-color: #f2f8fd;
              color: #0972d3;
            }
            
            .badge-associate {
              background-color: #f2f8f6;
              color: #037f0c;
            }
            
            .badge-professional {
              background-color: #f7f4fc;
              color: #5f1dc5;
            }
            
            .level-spacer {
              height: 32px;
              background-color: #f4f4f4;
            }

            /* Fix for sticky borders */
            thead th:after,
            tbody td:first-child:after {
              content: '';
              position: absolute;
              top: 0;
              right: 0;
              bottom: 0;
              left: 0;
              border: 1px solid #e9ebed;
              pointer-events: none;
            }

            @media (max-width: 768px) {
              body {
                padding: 10px;
              }
              
              .container {
                height: calc(100vh - 20px);
              }

              th, td {
                padding: 12px;
              }
              
              .course-cell {
                padding: 8px;
              }
            }
          </style>
        </head>
        <body>
          <header class="header">
            <h1>AWS ILT Classroom</h1>
          </header>
          <div class="container">
            <div class="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Levels</th>
                    ${tracks.map(track => `<th>${track.name}</th>`).join('')}
                  </tr>
                </thead>
                <tbody>
                  ${LEVELS.map((level, index) => {
                    const isLevel1End = index === 2;
                    const isLevel2End = index === 6;
                    const levelClass = index <= 2 ? 'level-1' : 
                                     index <= 6 ? 'level-2' : 
                                     'level-3';
                    
                    return `
                      <tr class="${levelClass}">
                        <td class="level-header">${level.name}</td>
                        ${tracks.map(track => `
                          <td>
                            ${track.items
                              .filter(item => item.targetLevel === level.id)
                              .map(item => `
                                <div class="course-cell">
                                  <a href="${item.url}" target="_blank" class="course-title">${item.title}</a>
                                  <div class="course-meta">
                                    <span class="badge badge-duration">${item.duration}</span>
                                    <span class="badge badge-${item.level}">${item.level.charAt(0).toUpperCase() + item.level.slice(1)}</span>
                                  </div>
                                </div>
                              `).join('')}
                          </td>
                        `).join('')}
                      </tr>
                      ${(isLevel1End || isLevel2End) ? `
                        <tr>
                          <td colspan="${tracks.length + 1}" class="level-spacer"></td>
                        </tr>
                      ` : ''}
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </body>
        </html>
      `;

      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `aws-learning-map-${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting HTML:', error);
    }
  };

  return (
    <Container>
      <Header
        variant="h2"
        description="Drag and drop courses to create learning paths"
      >
        Tracks
      </Header>
      <SpaceBetween size="l">
        <Alert type="info">
          You can export your current tracks to JSON or HTML format, or import tracks from a JSON file.
        </Alert>
        <Box>
          <SpaceBetween size="xs">
            <Button
              iconName="add-plus"
              onClick={loadInitialTracks}
              loading={isLoading}
              variant="primary"
              fullWidth
            >
              Load Initial Tracks
            </Button>
            <Button
              iconName="remove"
              onClick={emptyTracks}
              variant="normal"
              fullWidth
            >
              Empty tracks
            </Button>
            <Button
              iconName="download"
              onClick={exportToJson}
              fullWidth
            >
              Export to JSON
            </Button>
            <Button
              iconName="file"
              onClick={exportToHtml}
              fullWidth
            >
              Export to HTML
            </Button>
            <Button
              iconName="upload"
              onClick={handleImportClick}
              fullWidth
            >
              Import from JSON
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={importFromJson}
              style={{ display: 'none' }}
            />
          </SpaceBetween>
        </Box>
        <Box>
          <SpaceBetween size="xs">
            <Box variant="awsui-key-label">Current tracks</Box>
            <Box variant="p">
              {tracks.length} tracks loaded
            </Box>
          </SpaceBetween>
        </Box>
      </SpaceBetween>
    </Container>
  );
};

export default TrackManager; 