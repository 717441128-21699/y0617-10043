import React from 'react';
import type { CSSProperties } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { ChartRenderer } from '../charts/ChartRenderer';
import type { DashboardComponent } from '@/types';
import { useCanvasScale } from './CanvasContext';

interface ResizeHandleProps {
  position: string;
  onMouseDown: (e: React.MouseEvent) => void;
}

const ResizeHandle: React.FC<ResizeHandleProps> = ({ position, onMouseDown }) => {
  const positionStyles: Record<string, CSSProperties> = {
    'top-left': { top: -4, left: -4, cursor: 'nw-resize' },
    'top-right': { top: -4, right: -4, cursor: 'ne-resize' },
    'bottom-left': { bottom: -4, left: -4, cursor: 'sw-resize' },
    'bottom-right': { bottom: -4, right: -4, cursor: 'se-resize' },
    'top': { top: -4, left: '50%', transform: 'translateX(-50%)', cursor: 'n-resize' },
    'bottom': { bottom: -4, left: '50%', transform: 'translateX(-50%)', cursor: 's-resize' },
    'left': { top: '50%', left: -4, transform: 'translateY(-50%)', cursor: 'w-resize' },
    'right': { top: '50%', right: -4, transform: 'translateY(-50%)', cursor: 'e-resize' },
  };

  return (
    <div
      className="absolute w-3 h-3 bg-cyan-400 border border-slate-900 rounded-sm z-20 hover:scale-125 transition-transform"
      style={positionStyles[position]}
      onMouseDown={onMouseDown}
    />
  );
};

interface CanvasItemProps {
  component: DashboardComponent;
  isSelected: boolean;
}

export const CanvasItem: React.FC<CanvasItemProps> = ({ component, isSelected }) => {
  const { selectComponent, updateComponent, resizeComponent, pushHistory, dashboard } =
    useDashboardStore();
  const { scale } = useCanvasScale();

  const isDragging = React.useRef(false);
  const isResizing = React.useRef(false);
  const startMousePos = React.useRef({ x: 0, y: 0 });
  const startComponentPos = React.useRef({ x: 0, y: 0, width: 0, height: 0 });
  const startSelectedPositions = React.useRef<Map<string, { x: number; y: number }>>(new Map());
  const resizeDirection = React.useRef('');
  const hasMoved = React.useRef(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();

    const multi = e.ctrlKey || e.metaKey;
    const { selectedIds } = useDashboardStore.getState();
    const isAlreadySelected = selectedIds.includes(component.id);

    if (multi || !isAlreadySelected) {
      selectComponent(component.id, multi);
    }

    const currentSelectedIds = useDashboardStore.getState().selectedIds;

    isDragging.current = true;
    hasMoved.current = false;
    startMousePos.current = { x: e.clientX, y: e.clientY };
    startComponentPos.current = {
      x: component.x,
      y: component.y,
      width: component.width,
      height: component.height,
    };

    const positions = new Map<string, { x: number; y: number }>();
    dashboard.components.forEach((comp) => {
      if (currentSelectedIds.includes(comp.id)) {
        positions.set(comp.id, { x: comp.x, y: comp.y });
      }
    });
    startSelectedPositions.current = positions;

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleResizeStart = (e: React.MouseEvent, direction: string) => {
    e.stopPropagation();
    isResizing.current = true;
    resizeDirection.current = direction;
    startMousePos.current = { x: e.clientX, y: e.clientY };
    startComponentPos.current = {
      x: component.x,
      y: component.y,
      width: component.width,
      height: component.height,
    };

    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.current) return;

    const dx = (e.clientX - startMousePos.current.x) / scale;
    const dy = (e.clientY - startMousePos.current.y) / scale;

    if (Math.abs(dx) > 2 / scale || Math.abs(dy) > 2 / scale) {
      hasMoved.current = true;
    }

    const { selectedIds } = useDashboardStore.getState();
    if (selectedIds.includes(component.id) && selectedIds.length > 1) {
      startSelectedPositions.current.forEach((pos, id) => {
        useDashboardStore.getState().updateComponent(id, {
          x: Math.max(0, pos.x + dx),
          y: Math.max(0, pos.y + dy),
        });
      });
    } else {
      const newX = Math.max(0, startComponentPos.current.x + dx);
      const newY = Math.max(0, startComponentPos.current.y + dy);
      updateComponent(component.id, { x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    if (isDragging.current && hasMoved.current) {
      pushHistory();
    }
    isDragging.current = false;
    hasMoved.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const handleResizeMove = (e: MouseEvent) => {
    if (!isResizing.current) return;

    const dx = (e.clientX - startMousePos.current.x) / scale;
    const dy = (e.clientY - startMousePos.current.y) / scale;
    const direction = resizeDirection.current;

    let newX = startComponentPos.current.x;
    let newY = startComponentPos.current.y;
    let newWidth = startComponentPos.current.width;
    let newHeight = startComponentPos.current.height;

    if (direction.includes('right')) {
      newWidth = Math.max(100, startComponentPos.current.width + dx);
    }
    if (direction.includes('left')) {
      newWidth = Math.max(100, startComponentPos.current.width - dx);
      newX = startComponentPos.current.x + (startComponentPos.current.width - newWidth);
    }
    if (direction.includes('bottom')) {
      newHeight = Math.max(60, startComponentPos.current.height + dy);
    }
    if (direction.includes('top')) {
      newHeight = Math.max(60, startComponentPos.current.height - dy);
      newY = startComponentPos.current.y + (startComponentPos.current.height - newHeight);
    }

    resizeComponent(component.id, newWidth, newHeight);
    if (direction.includes('left') || direction.includes('top')) {
      updateComponent(component.id, { x: Math.max(0, newX), y: Math.max(0, newY) });
    }
  };

  const handleResizeEnd = () => {
    isResizing.current = false;
    pushHistory();
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);
  };

  return (
    <div
      className={`absolute select-none ${
        isSelected ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-900' : ''
      }`}
      style={{
        left: component.x,
        top: component.y,
        width: component.width,
        height: component.height,
        zIndex: component.zIndex,
        background: 'rgba(10, 22, 40, 0.6)',
        border: isSelected ? '1px solid rgba(0, 245, 255, 0.5)' : '1px solid rgba(30, 58, 95, 0.5)',
        borderRadius: '4px',
        boxShadow: isSelected ? '0 0 20px rgba(0, 245, 255, 0.3)' : 'none',
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="w-full h-full p-2">
        <ChartRenderer component={component} isPreview={true} />
      </div>

      {isSelected && (
        <>
          <ResizeHandle position="top-left" onMouseDown={(e) => handleResizeStart(e, 'top-left')} />
          <ResizeHandle position="top-right" onMouseDown={(e) => handleResizeStart(e, 'top-right')} />
          <ResizeHandle position="bottom-left" onMouseDown={(e) => handleResizeStart(e, 'bottom-left')} />
          <ResizeHandle position="bottom-right" onMouseDown={(e) => handleResizeStart(e, 'bottom-right')} />
          <ResizeHandle position="top" onMouseDown={(e) => handleResizeStart(e, 'top')} />
          <ResizeHandle position="bottom" onMouseDown={(e) => handleResizeStart(e, 'bottom')} />
          <ResizeHandle position="left" onMouseDown={(e) => handleResizeStart(e, 'left')} />
          <ResizeHandle position="right" onMouseDown={(e) => handleResizeStart(e, 'right')} />
        </>
      )}
    </div>
  );
};
