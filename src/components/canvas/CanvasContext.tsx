import React, { createContext, useContext } from 'react';

interface CanvasContextValue {
  scale: number;
}

const CanvasContext = createContext<CanvasContextValue>({
  scale: 1,
});

export const useCanvasScale = () => useContext(CanvasContext);

export const CanvasProvider: React.FC<{ scale: number; children: React.ReactNode }> = ({
  scale,
  children,
}) => {
  return <CanvasContext.Provider value={{ scale }}>{children}</CanvasContext.Provider>;
};
