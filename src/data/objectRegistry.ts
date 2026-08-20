import { ObjectBreakdownData } from '../types/objectData';
import { ballpointPenData } from './objects/ballpointPen';
import { wristwatchData } from './objects/wristwatch';
import { electricMotorData } from './objects/electricMotor';
import { mechanicalKeyboardData } from './objects/mechanicalKeyboard';
import { smartphoneData } from './objects/smartphone';
import { carEngineData } from './objects/carEngine';
import { jetTurbineData } from './objects/jetTurbine';
import { generateCustomObjectBreakdown } from './aiObjectGenerator';

export const ALL_OBJECTS: ObjectBreakdownData[] = [
  ballpointPenData,
  smartphoneData,
  mechanicalKeyboardData,
  wristwatchData,
  electricMotorData,
  carEngineData,
  jetTurbineData,
];

export const POPULAR_OBJECT_IDS = [
  'ballpoint-pen',
  'smartphone',
  'mechanical-keyboard',
  'wristwatch',
  'electric-motor',
  'car-engine',
];

export function getObjectById(id: string): ObjectBreakdownData | undefined {
  return ALL_OBJECTS.find((obj) => obj.id === id);
}

export function searchOrGenerateObject(query: string): ObjectBreakdownData {
  const clean = query.trim().toLowerCase();
  if (!clean) return ballpointPenData;

  // Exact or partial match in existing catalogue
  const existing = ALL_OBJECTS.find(
    (obj) =>
      obj.id.toLowerCase().includes(clean) ||
      obj.name.toLowerCase().includes(clean) ||
      obj.category.toLowerCase().includes(clean) ||
      obj.subtitle.toLowerCase().includes(clean)
  );

  if (existing) {
    return existing;
  }

  // Generate dynamic engineering breakdown for the arbitrary object query
  return generateCustomObjectBreakdown(query.trim());
}
