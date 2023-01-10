export type FuncNumberReturn = (arg0: number) => Vector2;
export type Vector2 = [number, number];
export type Vector3 = [number, number, number];

export const pointToHSL = (x: number, y: number, z: number): Vector3 => {
  // Converts the given (x, y, z) coordinate to an HSL color
  // The (x, y) values are used to calculate the hue, while the z value is used as the saturation
  // The lightness value is calculated based on the distance of (x, y) from the center (0.5, 0.5)
  // Returns an array [hue, saturation, lightness]

  // cy and cx are the center (y and x) values
  const cx = 0.5;
  const cy = 0.5;

  // Calculate the angle between the point (x, y) and the center (cx, cy)
  const radians = Math.atan2(y - cy, x - cx);

  // Convert the angle to degrees and shift it so that it goes from 0 to 360
  let deg = radians * (180 / Math.PI);
  deg = (deg + 90) % 360;

  // The saturation value is taken from the z coordinate
  const s = z;

  // Calculate the lightness value based on the distance from the center
  const dist = Math.sqrt(Math.pow(y - cy, 2) + Math.pow(x - cx, 2));
  const l = dist / cx;

  // Return the HSL color as an array [hue, saturation, lightness]
  return [deg, s, l];
};

export const hslToPoint = (hsl: Vector3): Vector3 => {
  // Converts the given HSL color to an (x, y, z) coordinate
  // The hue value is used to calculate the (x, y) position, while the saturation value is used as the z coordinate
  // The lightness value is used to calculate the distance from the center (0.5, 0.5)
  // Returns an array [x, y, z]

  // Destructure the input array into separate hue, saturation, and lightness values
  const [h, s, l] = hsl;
  // cx and cy are the center (x and y) values
  const cx = 0.5;
  const cy = 0.5;
  // Calculate the angle in radians based on the hue value
  const radians = h / (180 / Math.PI) - 90;
  // Calculate the distance from the center based on the lightness value
  const dist = l * cx;
  // Calculate the x and y coordinates based on the distance and angle
  const x = cx + dist * Math.cos(radians);
  const y = cy + dist * Math.sin(radians);
  // The z coordinate is equal to the saturation value
  const z = s;
  // Return the (x, y, z) coordinate as an array [x, y, z]
  return [x, y, z];
};

export const randomHSLPair = (
  minHDiff = 90,
  minSDiff = 0,
  minLDiff = 0.25,
  previousColor: Vector3 | null = null
): [Vector3, Vector3] => {
  let h1, s1, l1;

  if (previousColor) {
    [h1, s1, l1] = previousColor;
  } else {
    h1 = Math.random() * 360;
    s1 = Math.random();
    l1 = Math.random();
  }

  const h2 =
    (360 + (h1 + minHDiff + Math.random() * (360 - minHDiff * 2))) % 360;
  const s2 = minSDiff + Math.random() * (1 - minSDiff);
  const l2 = minSDiff + Math.random() * (1 - minLDiff);

  return [
    [h1, s1, l1],
    [h2, s2, l2],
  ];
};

export const vectorsOnLine = (
  p1: Vector3,
  p2: Vector3,
  numPoints = 4,
  f = (t, invert: boolean) => t,
  invert = false
): Vector3[] => {
  const points: Vector3[] = [];

  for (let i = 0; i < numPoints; i++) {
    const t = i / (numPoints - 1);
    const tModified = f(t, invert);
    const x = (1 - tModified) * p1[0] + tModified * p2[0];
    const y = (1 - tModified) * p1[1] + tModified * p2[1];
    const z = (1 - tModified) * p1[2] + tModified * p2[2];

    points.push([x, y, z]);
  }

  return points;
};

const linearPosition = (t: number) => {
  return t;
};

const exponentialPosition = (t: number, reverse = false) => {
  if (reverse) {
    return 1 - (1 - t) ** 2;
  }
  return t ** 2;
};

const quadraticPosition = (t: number, reverse = false) => {
  if (reverse) {
    return 1 - (1 - t) ** 3;
  }
  return t ** 3;
};

const sinusoidalPosition = (t: number, reverse = false) => {
  if (reverse) {
    return 1 - Math.sin(((1 - t) * Math.PI) / 2);
  }
  return Math.sin((t * Math.PI) / 2);
};

const circularPosition = (t: number, reverse = false) => {
  if (reverse) {
    return 1 - Math.sqrt(1 - (1 - t) ** 2);
  }
  return 1 - Math.sqrt(1 - t ** 2);
};

const arcPosition = (t: number, reverse = false) => {
  if (reverse) {
    return Math.sqrt(1 - (1 - t) ** 2);
  }
  return 1 - Math.sqrt(1 - t);
};

export const positionFunctions = {
  linearPosition,
  exponentialPosition,
  quadraticPosition,
  sinusoidalPosition,
  circularPosition,
  arcPosition,
};

const distance = (p1, p2) => {
  const a = p2[0] - p1[0];
  const b = p2[1] - p1[1];
  const c = p2[2] - p1[2];

  return Math.sqrt(a * a + b * b + c * c);
};

type ColorPointCollection = {
  x?: number;
  y?: number;
  z?: number;
  color?: Vector3;
};

class ColorPoint {
  public x = 0;
  public y = 0;
  public z = 0;
  public color: Vector3 = [0, 0, 0];

  constructor({ x, y, z, color }: ColorPointCollection = {}) {
    this.positionAndColor = { x, y, z, color };
  }

  public set positionAndColor({ x, y, z, color }: ColorPointCollection) {
    if (x && y && y && color) {
      throw new Error("Point must be initialized with either x,y,z or hsl");
    } else if (x && y && z) {
      this.x = x;
      this.y = y;
      this.z = z;
      this.color = pointToHSL(this.x, this.y, this.z);
    } else if (color) {
      this.color = color;
      [this.x, this.y, this.z] = hslToPoint(color);
    }
  }

  get position(): Vector3 {
    return [this.x, this.y, this.z];
  }

  get hslCSS(): string {
    return `hsl(${this.color[0]}, ${this.color[1] * 100}%, ${
      this.color[2] * 100
    }%)`;
  }
}

export class Poline {
  public anchorPoints: ColorPoint[];

  private numPoints: number;
  private points: ColorPoint[][];
  private positionFunction = sinusoidalPosition;

  constructor(
    anchorColors = randomHSLPair(),
    numPoints = 4,
    positionFunction = sinusoidalPosition
  ) {
    if (!anchorColors || anchorColors.length < 2) {
      throw new Error("Must have at least two anchor colors");
    }

    if (numPoints < 1) {
      throw new Error("Must have at least one point");
    }

    this.anchorPoints = anchorColors.map(
      (point) => new ColorPoint({ color: point })
    );

    this.numPoints = numPoints + 2; // add two for the anchor points
    this.positionFunction = positionFunction;

    this.updatePointPairs();
  }

  updatePointPairs() {
    const pairs = [] as ColorPoint[][];

    for (let i = 0; i < this.anchorPoints.length - 1; i++) {
      const pair = [
        this.anchorPoints[i],
        this.anchorPoints[i + 1],
      ] as ColorPoint[];

      pairs.push(pair);
    }

    this.points = pairs.map((pair, i) => {
      const p1position = pair[0] ? pair[0].position : ([0, 0, 0] as Vector3);
      const p2position = pair[1] ? pair[1].position : ([0, 0, 0] as Vector3);

      return vectorsOnLine(
        p1position,
        p2position,
        this.numPoints,
        this.positionFunction,
        i % 2 ? true : false
      ).map((p) => new ColorPoint({ x: p[0], y: p[1], z: p[2] }));
    });
  }

  addAnchorPoint({ x, y, z, color }) {
    const newAnchor = new ColorPoint({ x, y, z, color });
    this.anchorPoints.push(newAnchor);
    this.updatePointPairs();
  }

  getClosestAnchorPoint(point: Vector3, maxDistance: 1) {
    const distances = this.anchorPoints.map((anchor) => {
      return distance(anchor.position, point);
    });

    const minDistance = Math.min(...distances);
    if (minDistance > maxDistance) {
      return null;
    }

    const closestAnchorIndex = distances.indexOf(minDistance);

    return this.anchorPoints[closestAnchorIndex];
  }

  public set anchorPoint({ pointReference, pointIndex, x, y, z, color }) {
    let index = pointIndex;

    if (pointReference) {
      index = this.anchorPoints.indexOf(pointReference);
    }

    this.anchorPoints[index] = new ColorPoint({ x, y, z, color });

    this.updatePointPairs();
  }

  get flattenedPoints() {
    return this.points
      .flat()
      .filter((p, i) => (i != 0 ? i % this.numPoints : true));
  }

  get colors() {
    return this.flattenedPoints.map((p) => p.color);
  }

  get colorsCSS() {
    return this.flattenedPoints.map((c) => c.hslCSS);
  }
}
