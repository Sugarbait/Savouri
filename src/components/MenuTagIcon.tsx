import React from 'react';
import {
  Leaf,
  Sprout,
  WheatOff,
  ShieldCheck,
  MilkOff,
  Flame,
  Droplet,
  Drumstick,
  Bone,
  Moon,
  Star,
  MapPin,
  Recycle,
  BeanOff,
  TrendingDown,
  TrendingUp,
  CandyOff,
  Carrot,
} from 'lucide-react';

interface MenuTagIconProps {
  icon: string;
  className?: string;
}

const iconMap: Record<string, React.ComponentType<any>> = {
  leaf: Leaf,
  sprout: Sprout,
  'wheat-off': WheatOff,
  'nut-off': ShieldCheck,
  'milk-off': MilkOff,
  flame: Flame,
  droplet: Droplet,
  drumstick: Drumstick,
  bone: Bone,
  moon: Moon,
  star: Star,
  'map-pin': MapPin,
  recycle: Recycle,
  'shield-check': ShieldCheck,
  'bean-off': BeanOff,
  'trending-down': TrendingDown,
  'trending-up': TrendingUp,
  'candy-off': CandyOff,
  carrot: Carrot,
};

export const MenuTagIcon: React.FC<MenuTagIconProps> = ({ icon, className = 'w-4 h-4' }) => {
  const IconComponent = iconMap[icon] || Leaf;
  return <IconComponent className={className} />;
};
