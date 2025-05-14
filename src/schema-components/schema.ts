export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface Mat3 {
  x_axis: Vec3;
  y_axis: Vec3;
  z_axis: Vec3;
}

export function buildPath(path: string, name: string | undefined): string {
  const namePath = name ?? '';
  if (path.length > 0) {
    return `${path}.${namePath}`;
  }
  return namePath;
}
