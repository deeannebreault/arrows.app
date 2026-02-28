import React, { useState, useEffect } from 'react';
import { Button, Checkbox, Segment, Header, List, Label } from 'semantic-ui-react';

/**
 * DebugPanel - Visual debugging tool for annotations
 * 
 * Shows bounding boxes, positions, and debug info for:
 * - Text annotations
 * - Drawing annotations  
 * - Node positions
 * - Relationship endpoints
 * 
 * Helps debug text/drawing visibility issues
 */

export const DebugPanel = ({ 
  graph, 
  selectedNode,
  canvasRef,
  onToggleDebugMode
}) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true);
  const [showPositions, setShowPositions] = useState(true);
  const [showGrid, setShowGrid] = useState(false);
  const [debugInfo, setDebugInfo] = useState({
    nodes: 0,
    annotations: 0,
    selected: null
  });

  // Update debug info when graph changes
  useEffect(() => {
    if (graph) {
      const nodes = graph.nodes || [];
      const annotations = graph.annotations || [];
      
      setDebugInfo({
        nodes: nodes.length,
        annotations: annotations.length,
        selected: selectedNode
      });
    }
  }, [graph, selectedNode]);

  // Toggle debug overlay on canvas
  useEffect(() => {
    if (canvasRef && canvasRef.current) {
      const canvas = canvasRef.current;
      
      if (isEnabled) {
        canvas.classList.add('debug-mode');
        drawDebugOverlay();
      } else {
        canvas.classList.remove('debug-mode');
        clearDebugOverlay();
      }
    }
    
    if (onToggleDebugMode) {
      onToggleDebugMode(isEnabled);
    }
  }, [isEnabled, showBoundingBoxes, showPositions, showGrid]);

  const drawDebugOverlay = () => {
    // This would integrate with the canvas rendering
    // to draw bounding boxes and debug info
    console.log('Debug overlay enabled:', {
      boundingBoxes: showBoundingBoxes,
      positions: showPositions,
      grid: showGrid
    });
  };

  const clearDebugOverlay = () => {
    console.log('Debug overlay disabled');
  };

  const getSelectedInfo = () => {
    if (!selectedNode) return null;
    
    return {
      id: selectedNode.id,
      type: selectedNode.type || 'unknown',
      position: selectedNode.position || { x: 0, y: 0 },
      bounds: selectedNode.bounds || { width: 0, height: 0 },
      properties: Object.keys(selectedNode).filter(k => !['id', 'type', 'position'].includes(k))
    };
  };

  const selectedInfo = getSelectedInfo();

  return (
    <Segment className="debug-panel" style={{ 
      background: '#1e1e2e', 
      color: '#cdd6f4',
      border: '1px solid #313244'
    }}>
      <Header as='h4' style={{ color: '#f9e2af' }}>
        🐞 Debug Panel
      </Header>

      {/* Main Toggle */}
      <div style={{ marginBottom: '12px' }}>
        <Checkbox
          toggle
          label='Enable Debug Mode'
          checked={isEnabled}
          onChange={(e, { checked }) => setIsEnabled(checked)}
        />
      </div>

      {isEnabled && (
        <>
          {/* Debug Options */}
          <List selection verticalAlign='middle' style={{ marginBottom: '16px' }}>
            <List.Item>
              <Checkbox
                label='Show Bounding Boxes'
                checked={showBoundingBoxes}
                onChange={(e, { checked }) => setShowBoundingBoxes(checked)}
              />
            </List.Item>
            <List.Item>
              <Checkbox
                label='Show Positions'
                checked={showPositions}
                onChange={(e, { checked }) => setShowPositions(checked)}
              />
            </List.Item>
            <List.Item>
              <Checkbox
                label='Show Grid'
                checked={showGrid}
                onChange={(e, { checked }) => setShowGrid(checked)}
              />
            </List.Item>
          </List>

          {/* Stats */}
          <div style={{ 
            background: '#181825', 
            padding: '8px', 
            borderRadius: '4px',
            marginBottom: '12px'
          }}>
            <Header as='h5' style={{ color: '#6c7086', marginBottom: '8px' }}>
              Graph Stats
            </Header>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Label color='blue'>Nodes: {debugInfo.nodes}</Label>
              <Label color='green'>Annotations: {debugInfo.annotations}</Label>
            </div>
          </div>

          {/* Selected Node Info */}
          {selectedInfo && (
            <div style={{ 
              background: '#181825', 
              padding: '8px', 
              borderRadius: '4px',
              marginBottom: '12px'
            }}>
              <Header as='h5' style={{ color: '#6c7086', marginBottom: '8px' }}>
                Selected Node
              </Header>
              <div style={{ fontSize: '11px', color: '#cdd6f4' }}>
                <div><strong>ID:</strong> {selectedInfo.id}</div>
                <div><strong>Type:</strong> {selectedInfo.type}</div>
                <div>
                  <strong>Position:</strong> 
                  x: {Math.round(selectedInfo.position.x)}, 
                  y: {Math.round(selectedInfo.position.y)}
                </div>
                <div>
                  <strong>Size:</strong> 
                  {Math.round(selectedInfo.bounds.width)} × {Math.round(selectedInfo.bounds.height)}
                </div>
                {selectedInfo.properties.length > 0 && (
                  <div>
                    <strong>Properties:</strong> {selectedInfo.properties.join(', ')}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button 
              size='mini' 
              onClick={() => console.log('Graph dump:', graph)}
              style={{ background: '#313244', color: '#cdd6f4' }}
            >
              Log Graph
            </Button>
            <Button 
              size='mini'
              onClick={() => console.log('Selected:', selectedNode)}
              style={{ background: '#313244', color: '#cdd6f4' }}
            >
              Log Selected
            </Button>
          </div>

          {/* Help Text */}
          <div style={{ 
            marginTop: '12px', 
            padding: '8px', 
            background: 'rgba(249, 226, 175, 0.1)',
            borderRadius: '4px',
            fontSize: '10px',
            color: '#f9e2af'
          }}>
            💡 <strong>Tip:</strong> Use this to debug text/drawing visibility issues. 
            Check bounding boxes to see if elements are positioned correctly.
          </div>
        </>
      )}
    </Segment>
  );
};

// CSS for debug mode
export const debugStyles = `
  .debug-mode canvas {
    cursor: crosshair !important;
  }
  
  .debug-bounding-box {
    position: absolute;
    border: 2px dashed #f9e2af;
    background: rgba(249, 226, 175, 0.1);
    pointer-events: none;
    z-index: 1000;
  }
  
  .debug-bounding-box::after {
    content: attr(data-label);
    position: absolute;
    top: -20px;
    left: 0;
    background: #f9e2af;
    color: #1e1e2e;
    font-size: 10px;
    padding: 2px 4px;
    border-radius: 2px;
    white-space: nowrap;
  }
  
  .debug-position-marker {
    position: absolute;
    width: 8px;
    height: 8px;
    background: #a6e3a1;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
    z-index: 1001;
  }
  
  .debug-grid {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      linear-gradient(to right, rgba(108, 112, 134, 0.1) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(108, 112, 134, 0.1) 1px, transparent 1px);
    background-size: 50px 50px;
    pointer-events: none;
    z-index: 999;
  }
`;

export default DebugPanel;
