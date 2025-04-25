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
  selectedTrackId: string | null;
}

interface MergedCell {
  startIndex: number;
  endIndex: number;
  content: string;
}

const TrackManager: React.FC<TrackManagerProps> = ({ tracks, onTracksChange, selectedTrackId }) => {
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
      // This function removes all courses while keeping track structure intact
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
      const tracksToExport = selectedTrackId 
        ? tracks.filter(track => track.id === selectedTrackId)
        : tracks;

      const getTitle = () => {
        if (selectedTrackId) {
          const trackName = tracks.find(t => t.id === selectedTrackId)?.name;
          return `${trackName} Learning Track`;
        }
        return 'AWS Learning Map';
      };

      const getActiveLevels = (track: Track) => {
        return LEVELS.filter(level => 
          track.items.some(item => item.targetLevel === level.id)
        );
      };

      const getLevelStyle = (levelId: string) => {
        switch(levelId) {
          case 'level-1':
            return 'background-color: #0972d3;';
          case 'level-2-core':
          case 'level-2-additional':
            return 'background-color: #037f0c;';
          case 'level-3':
            return 'background-color: #5f1dc5;';
          default:
            return 'background-color: #414d5c;';
        }
      };

      const getLevelBackgroundColor = (index: number) => {
        if (index <= 2) return 'background-color: #f2f8fd;';
        if (index <= 6) return 'background-color: #f2f8f6;';
        return 'background-color: #f7f4fc;';
      };

      const generateTableHtml = () => {
        if (selectedTrackId) {
          // Single track view - landscape layout
          const track = tracksToExport[0];
          const activeLevels = getActiveLevels(track);

          return `
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr>
                  ${activeLevels.map(level => `
                    <th style="padding: 16px; border: 1px solid #e9ebed; text-align: center; width: 250px; ${getLevelStyle(level.id)}">
                      <div style="color: white; font-weight: 600;">
                        ${level.name}
                      </div>
                    </th>
                  `).join('')}
                </tr>
              </thead>
              <tbody>
                <tr>
                  ${activeLevels.map((level, index) => `
                    <td style="border: 1px solid #e9ebed; padding: 16px; vertical-align: top; width: 250px; ${getLevelBackgroundColor(LEVELS.findIndex(l => l.id === level.id))}">
                      ${track.items
                        .filter(item => item.targetLevel === level.id)
                        .map(item => `
                          <div style="background: white; padding: 12px; margin-bottom: 12px; border-radius: 8px; border: 1px solid #e9ebed;">
                            <a href="${item.url}" target="_blank" style="color: #0972d3; text-decoration: none; display: block; margin-bottom: 8px;">
                              ${item.title}
                            </a>
                            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                              <span style="background: #e9ebed; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                                ${item.duration}
                              </span>
                              <span style="background: ${
                                item.level === 'fundamental' ? '#e3f2fd' :
                                item.level === 'associate' ? '#e8f5e9' :
                                '#ffebee'
                              }; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                                ${item.level.charAt(0).toUpperCase() + item.level.slice(1)}
                              </span>
                            </div>
                          </div>
                        `).join('')}
                    </td>
                  `).join('')}
                </tr>
              </tbody>
            </table>
          `;
        } else {
          // Full grid view - original vertical layout
          return `
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr>
                  <th style="padding: 16px; background: #0f1b2a; border: 1px solid #e9ebed; color: white; font-weight: 600; text-align: left; width: 150px;">
                    Levels
                  </th>
                  ${tracksToExport.map(track => `
                    <th style="padding: 16px; background: #0f1b2a; border: 1px solid #e9ebed; color: white; font-weight: 600; text-align: center;">
                      ${track.name}
                    </th>
                  `).join('')}
                </tr>
              </thead>
              <tbody>
                ${LEVELS.map((level, levelIndex) => `
                  <tr>
                    <td style="padding: 16px; border: 1px solid #e9ebed; ${getLevelStyle(level.id)}">
                      <div style="color: white; font-weight: 600;">
                        ${level.name}
                      </div>
                    </td>
                    ${tracksToExport.map(track => `
                      <td style="border: 1px solid #e9ebed; padding: 16px; vertical-align: top; ${getLevelBackgroundColor(levelIndex)}">
                        ${track.items
                          .filter(item => item.targetLevel === level.id)
                          .map(item => `
                            <div style="background: white; padding: 12px; margin-bottom: 12px; border-radius: 8px; border: 1px solid #e9ebed;">
                              <a href="${item.url}" target="_blank" style="color: #0972d3; text-decoration: none; display: block; margin-bottom: 8px;">
                                ${item.title}
                              </a>
                              <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                                <span style="background: #e9ebed; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                                  ${item.duration}
                                </span>
                                <span style="background: ${
                                  item.level === 'fundamental' ? '#e3f2fd' :
                                  item.level === 'associate' ? '#e8f5e9' :
                                  '#ffebee'
                                }; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                                  ${item.level.charAt(0).toUpperCase() + item.level.slice(1)}
                                </span>
                              </div>
                            </div>
                          `).join('')}
                      </td>
                    `).join('')}
                  </tr>
                  ${(levelIndex === 2 || levelIndex === 6) ? `
                    <tr>
                      <td colspan="${tracksToExport.length + 1}" style="height: 32px; background: #f4f4f4; border: 1px solid #e9ebed;"></td>
                    </tr>
                  ` : ''}
                `).join('')}
              </tbody>
            </table>
          `;
        }
      };

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>${getTitle()}</title>
          <style>
            @font-face {
              font-family: 'Amazon Ember';
              src: url('https://d1s31zyz7dcc2d.cloudfront.net/9519319c6d0646f38e4aa7261b225d58/AmazonEmber_W_Rg.woff2') format('woff2');
              font-weight: normal;
              font-style: normal;
            }
            
            @font-face {
              font-family: 'Amazon Ember';
              src: url('https://d1s31zyz7dcc2d.cloudfront.net/2c09921762c34e51b6645da7d8e1d2b5/AmazonEmber_W_Bd.woff2') format('woff2');
              font-weight: bold;
              font-style: normal;
            }

            body {
              font-family: 'Amazon Ember', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              padding: 20px;
              max-width: 1800px;
              margin: 0 auto;
              color: #000716;
              background-color: #ffffff;
            }

            table {
              box-shadow: 0 1px 4px 0 rgba(0, 28, 36, 0.15);
              border-radius: 8px;
              overflow: hidden;
            }

            .title {
              color: #000716;
              margin-bottom: 24px;
              font-size: 24px;
              font-weight: bold;
              line-height: 1.25;
              font-family: 'Amazon Ember', sans-serif;
            }

            th {
              font-family: 'Amazon Ember', sans-serif;
              font-weight: bold;
            }

            a {
              color: #0972d3;
              text-decoration: none;
            }

            a:hover {
              text-decoration: underline;
            }
          </style>
        </head>
        <body>
          <h1 class="title">${getTitle()}</h1>
          ${generateTableHtml()}
        </body>
        </html>
      `;

      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${
        selectedTrackId 
          ? tracks.find(t => t.id === selectedTrackId)?.name.toLowerCase().replace(/\s+/g, '-')
          : 'aws-learning-map'
      }-${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting HTML:', error);
    }
  };

  // Add this helper function to filter levels with content
  const getLevelsWithContent = (track: Track) => {
    return LEVELS.filter(level => 
      track.items.some(item => item.targetLevel === level.id)
    );
  };

  const exportToPowerPoint = async () => {
    try {
      const pptxgen = (await import('pptxgenjs')).default;
      const pres = new pptxgen();
      
      const defaultFont = 'Calibri';
      
      const tracksToExport = selectedTrackId 
        ? tracks.filter(track => track.id === selectedTrackId)
        : tracks;

      const title = selectedTrackId
        ? `${tracks.find(t => t.id === selectedTrackId)?.name} Learning Track`
        : 'AWS Learning Map';

      // Title slide
      const titleSlide = pres.addSlide();
      titleSlide.addText(title, {
        x: 0.5,
        y: 1,
        w: '90%',
        h: 0.8,
        fontSize: 20,
        color: '000716',
        bold: true,
        align: 'center',
        fontFace: defaultFont
      });

      const createContentSlide = () => {
        const slide = pres.addSlide();

        if (selectedTrackId) {
          const track = tracksToExport[0];
          const activeLevels = getLevelsWithContent(track);
          
          if (activeLevels.length === 0) {
            slide.addText('No courses placed in this track yet', {
              x: 0.5,
              y: 2,
              w: '90%',
              h: 1,
              fontSize: 14,
              color: '5F6B7A',
              align: 'center',
              fontFace: defaultFont
            });
            return;
          }

          // Track name as slide title
          slide.addText(track.name, {
            x: 0.5,
            y: 0.3,
            w: '90%',
            h: 0.4,
            fontSize: 14,
            color: '000716',
            bold: true,
            align: 'center',
            fontFace: defaultFont
          });

          const startY = 0.8;
          const levelWidth = Math.min(2.2, 9 / activeLevels.length);
          const totalWidth = levelWidth * activeLevels.length;
          const startX = (10 - totalWidth) / 2;

          activeLevels.forEach((level, index) => {
            const x = startX + (index * levelWidth);

            // Level header
            slide.addText(level.name, {
              x: x,
              y: startY,
              w: levelWidth - 0.1,
              h: 0.4,
              color: 'FFFFFF',
              fontSize: 9,
              bold: true,
              align: 'center',
              valign: 'middle',
              fill: { color: getLevelColorForPPT(level.id) },
              fontFace: defaultFont
            });

            const items = track.items.filter(item => item.targetLevel === level.id);
            const itemHeight = 0.5;
            const contentY = startY + 0.45;

            items.forEach((item, itemIndex) => {
              const itemY = contentY + (itemIndex * itemHeight);

              // Course box
              slide.addText([
                {
                  text: item.title,
                  options: {
                    hyperlink: { url: item.url },
                    color: '0972D3',
                    fontSize: 7,
                    breakLine: true,
                    fontFace: defaultFont
                  }
                },
                {
                  text: `${item.duration} | ${item.level}`,
                  options: {
                    color: '5F6B7A',
                    fontSize: 6,
                    fontFace: defaultFont
                  }
                }
              ], {
                x: x,
                y: itemY,
                w: levelWidth - 0.1,
                h: itemHeight - 0.05,
                fill: { color: 'FFFFFF' },
                line: { color: 'E9EBED', pt: 0.5 },
                padding: 3
              });
            });
          });
        } else {
          // Full grid view
          const tableData = [];
          const headerRow = ['Levels', ...tracksToExport.map(t => t.name)];
          tableData.push(headerRow);

          LEVELS.forEach(level => {
            const row = [level.name];
            tracksToExport.forEach(track => {
              const items = track.items
                .filter(item => item.targetLevel === level.id)
                .map(item => `${item.title}\n(${item.duration})`)
                .join('\n\n');
              row.push(items);
            });
            tableData.push(row);
          });

          slide.addTable(tableData, {
            x: 0.5,
            y: 0.5,
            w: 9,
            colW: [2, ...Array(tracksToExport.length).fill(7/tracksToExport.length)],
            border: { pt: 0.5, color: 'E9EBED' },
            align: 'left',
            fontSize: 7,
            fontFace: defaultFont,
            rowH: 0.8,
            autoPage: true,
            valign: 'middle'
          });
        }
      };

      createContentSlide();

      const filename = `${
        selectedTrackId 
          ? tracks.find(t => t.id === selectedTrackId)?.name.toLowerCase().replace(/\s+/g, '-')
          : 'aws-learning-map'
      }-${new Date().toISOString().split('T')[0]}.pptx`;

      pres.writeFile(filename);
    } catch (error) {
      console.error('Error exporting to PowerPoint:', error);
    }
  };

  // Helper function for PowerPoint colors
  const getLevelColorForPPT = (levelId: string) => {
    switch(levelId) {
      case 'level-1':
        return '0972D3';
      case 'level-2-core':
      case 'level-2-additional':
        return '037F0C';
      case 'level-3':
        return '5F1DC5';
      default:
        return '414D5C';
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
              iconName="download"
              onClick={() => {
                exportToPowerPoint().catch(error => {
                  console.error('Failed to export PowerPoint:', error);
                });
              }}
              fullWidth
            >
              Export to PowerPoint
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