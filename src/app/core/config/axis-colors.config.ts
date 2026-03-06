export interface AxisColor {
  name: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
}

export const AXIS_COLORS: AxisColor[] = [
  {
    name: 'SOCIAL',
    bgColor: 'bg-blue-500',
    textColor: 'text-blue-600',
    borderColor: 'border-blue-500'
  },
  {
    name: 'FINANCIERO',
    bgColor: 'bg-green-600',
    textColor: 'text-green-600',
    borderColor: 'border-green-600'
  },
  {
    name: 'TECNICO',
    bgColor: 'bg-purple-600',
    textColor: 'text-purple-600',
    borderColor: 'border-purple-600'
  },
  {
    name: 'JURIDICO',
    bgColor: 'bg-red-600',
    textColor: 'text-red-600',
    borderColor: 'border-red-600'
  },
  {
    name: 'HABITABILIDAD',
    bgColor: 'bg-amber-500',
    textColor: 'text-amber-600',
    borderColor: 'border-amber-500'
  }
];

export const DEFAULT_AXIS_COLOR: AxisColor = {
  name: 'DEFAULT',
  bgColor: 'bg-gray-500',
  textColor: 'text-gray-600',
  borderColor: 'border-gray-500'
};

export function getAxisColorByName(axisName: string): AxisColor {
  if (!axisName) return DEFAULT_AXIS_COLOR;
  
  const normalized = axisName.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const found = AXIS_COLORS.find(ac => ac.name === normalized);
  return found || DEFAULT_AXIS_COLOR;
}

export function getAllAxisNames(): string[] {
  return AXIS_COLORS.map(ac => ac.name);
}
