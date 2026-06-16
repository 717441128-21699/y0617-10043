import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { CanvasItem } from './CanvasItem';
import { CanvasProvider } from './CanvasContext';
import type { ComponentType } from '@/types';
import { getComponentMeta } from '@/utils/helpers';

export const Canvas: React.FC = () => {
  const { dashboard, selectedIds, clearSelection, addComponent, multiSelect } = useDashboardStore();
  const canvasRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [scale, setScale] = useState(1);
  const [selectionBox, setSelectionBox] = useState<{ startX: number; startY: number; endX: number; endY: number } | null>(null);
  const isSelecting = useRef(false);
  const selectionStart = useRef({ x: 0, y: 0 });
  const selectionCurrent = useRef({ x: 0, y: 0 });

  const updateScale = useCallback(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const padding = 80;
    const scaleX = (container.clientWidth - padding) / dashboard.width;
    const scaleY = (container.clientHeight - padding) / dashboard.height;
    const newScale = Math.min(scaleX, scaleY, 1);
    setScale(newScale);
  }, [dashboard.width, dashboard.height]);

  useEffect(() => {
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [updateScale]);

  const getCanvasPosition = (e: React.DragEvent | React.MouseEvent | MouseEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / scale,
      y: (e.clientY - rect.top) / scale,
    };
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const type = e.dataTransfer.getData('componentType') as ComponentType;
    if (!type) return;

    const meta = getComponentMeta(type);
    if (!meta) return;

    const { x, y } = getCanvasPosition(e);
    const offsetX = meta.defaultWidth / 2;
    const offsetY = meta.defaultHeight / 2;

    addComponent(type, Math.max(0, x - offsetX), Math.max(0, y - offsetY));
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    if (e.target !== e.currentTarget) return;

    if (!e.shiftKey && !e.ctrlKey && !e.metaKey) {
      clearSelection();
    }

    isSelecting.current = true;
    const pos = getCanvasPosition(e);
    selectionStart.current = pos;
    selectionCurrent.current = pos;
    setSelectionBox({ startX: pos.x, startY: pos.y, endX: pos.x, endY: pos.y });

    document.addEventListener('mousemove', handleSelectionMove);
    document.addEventListener('mouseup', handleSelectionEnd);
  };

  const handleSelectionMove = (e: MouseEvent) => {
    if (!isSelecting.current || !canvasRef.current) return;

    const pos = getCanvasPosition(e);
    selectionCurrent.current = pos;

    setSelectionBox({
      startX: selectionStart.current.x,
      startY: selectionStart.current.y,
      endX: pos.x,
      endY: pos.y,
    });
  };

  const handleSelectionEnd = () => {
    if (isSelecting.current) {
      const startX = selectionStart.current.x;
      const startY = selectionStart.current.y;
      const endX = selectionCurrent.current.x;
      const endY = selectionCurrent.current.y;

      const left = Math.min(startX, endX);
      const right = Math.max(startX, endX);
      const top = Math.min(startY, endY);
      const bottom = Math.max(startY, endY);

      const boxWidth = right - left;
      const boxHeight = bottom - top;

      if (boxWidth > 5 && boxHeight > 5) {
        const { components } = useDashboardStore.getState().dashboard;
        const selected = components
          .filter((c) => {
            const cx = c.x + c.width / 2;
            const cy = c.y + c.height / 2;
            return cx >= left && cx <= right && cy >= top && cy <= bottom;
          })
          .map((c) => c.id);

        if (selected.length > 0) {
          multiSelect(selected);
        }
      }
    }

    isSelecting.current = false;
    setSelectionBox(null);
    document.removeEventListener('mousemove', handleSelectionMove);
    document.removeEventListener('mouseup', handleSelectionEnd);
  };

  const selectionBoxStyle = selectionBox
    ? {
        left: Math.min(selectionBox.startX, selectionBox.endX),
        top: Math.min(selectionBox.startY, selectionBox.endY),
        width: Math.abs(selectionBox.endX - selectionBox.startX),
        height: Math.abs(selectionBox.endY - selectionBox.startY),
      }
    : null;

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center p-5 overflow-auto bg-slate-950">
      <div
        ref={canvasRef}
        className={`relative ${isDragOver ? 'ring-2 ring-cyan-400 ring-offset-2' : ''}`}
        style={{
          width: dashboard.width,
          height: dashboard.height,
          backgroundColor: dashboard.backgroundColor,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          backgroundImage:
            'linear-gradient(rgba(0, 245, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 245, 255, 0.05) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          boxShadow: '0 0 60px rgba(0, 245, 255, 0.1)',
          border: '1px solid rgba(0, 245, 255, 0.2)',
          flexShrink: 0,
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onMouseDown={handleCanvasMouseDown}
      >
        <CanvasProvider scale={scale}>
          {dashboard.components.map((component) => (
            <CanvasItem
              key={component.id}
              component={component}
              isSelected={selectedIds.includes(component.id)}
            />
          ))}

          {selectionBoxStyle && (
            <div
              className="absolute pointer-events-none border-2 border-cyan-400 border-dashed bg-cyan-400/10"
              style={selectionBoxStyle}
            />
          )}
        </CanvasProvider>
      </div>
    </div>
  );
};
