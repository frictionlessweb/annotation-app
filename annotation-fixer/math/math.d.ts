export interface Bounds {
  top: number;
  left: number;
  width: number;
  height: number;
}

export const areOverlapping: (a: Bounds, b: Bounds) => boolean;

export const serializeBounds: (bounds: Bounds) => string;

export const boxContaining: (bounds: Bounds[]) => Bounds;
