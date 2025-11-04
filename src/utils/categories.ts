// src/utils/categories.ts
import {
  Home,
  ShoppingCart,
  Car,
  Popcorn,
  Smartphone,
  Lightbulb,
  Package,
  Utensils,
  Coffee,
  Pizza,
  Wine,
  Bus,
  Plane,
  Train,
  Fuel,
  Film,
  Music,
  Gamepad2,
  Book,
  Dumbbell,
  Tv,
  Wifi,
  Zap,
  Droplet,
  Phone,
  Heart,
  Stethoscope,
  Pill,
  Glasses,
  Scissors,
  Shirt,
  ShoppingBag,
  Watch,
  Gift,
  GraduationCap,
  Baby,
  PawPrint,
  Wrench,
  Hammer,
  Paintbrush,
  Landmark,
  CreditCard,
  PiggyBank,
  TrendingUp,
  Calculator,
  Globe,
  Umbrella,
  Flower2,
  type LucideIcon,
} from 'lucide-react-native';

export type CategoryGroup = 'essential' | 'lifestyle' | 'transport' | 'health' | 'entertainment' | 'financial' | 'other';

export interface CategoryDefinition {
  id: string;
  icon: LucideIcon;
  translationKey: string;
  group: CategoryGroup;
}

export const CATEGORY_GROUPS: Record<CategoryGroup, string> = {
  essential: 'categoryGroups.essential',
  lifestyle: 'categoryGroups.lifestyle',
  transport: 'categoryGroups.transport',
  health: 'categoryGroups.health',
  entertainment: 'categoryGroups.entertainment',
  financial: 'categoryGroups.financial',
  other: 'categoryGroups.other',
};

export const CATEGORIES: CategoryDefinition[] = [
  // Essential
  { id: 'rent', icon: Home, translationKey: 'categories.rent', group: 'essential' },
  { id: 'utilities', icon: Lightbulb, translationKey: 'categories.utilities', group: 'essential' },
  { id: 'electricity', icon: Zap, translationKey: 'categories.electricity', group: 'essential' },
  { id: 'water', icon: Droplet, translationKey: 'categories.water', group: 'essential' },
  { id: 'internet', icon: Wifi, translationKey: 'categories.internet', group: 'essential' },
  { id: 'phone', icon: Phone, translationKey: 'categories.phone', group: 'essential' },

  // Lifestyle
  { id: 'food', icon: ShoppingCart, translationKey: 'categories.food', group: 'lifestyle' },
  { id: 'groceries', icon: ShoppingBag, translationKey: 'categories.groceries', group: 'lifestyle' },
  { id: 'restaurant', icon: Utensils, translationKey: 'categories.restaurant', group: 'lifestyle' },
  { id: 'cafe', icon: Coffee, translationKey: 'categories.cafe', group: 'lifestyle' },
  { id: 'fastfood', icon: Pizza, translationKey: 'categories.fastfood', group: 'lifestyle' },
  { id: 'alcohol', icon: Wine, translationKey: 'categories.alcohol', group: 'lifestyle' },
  { id: 'clothing', icon: Shirt, translationKey: 'categories.clothing', group: 'lifestyle' },
  { id: 'shoes', icon: Watch, translationKey: 'categories.shoes', group: 'lifestyle' },
  { id: 'accessories', icon: ShoppingBag, translationKey: 'categories.accessories', group: 'lifestyle' },
  { id: 'haircut', icon: Scissors, translationKey: 'categories.haircut', group: 'lifestyle' },

  // Transport
  { id: 'transport', icon: Car, translationKey: 'categories.transport', group: 'transport' },
  { id: 'fuel', icon: Fuel, translationKey: 'categories.fuel', group: 'transport' },
  { id: 'parking', icon: Car, translationKey: 'categories.parking', group: 'transport' },
  { id: 'publictransport', icon: Bus, translationKey: 'categories.publictransport', group: 'transport' },
  { id: 'taxi', icon: Car, translationKey: 'categories.taxi', group: 'transport' },
  { id: 'train', icon: Train, translationKey: 'categories.train', group: 'transport' },
  { id: 'flight', icon: Plane, translationKey: 'categories.flight', group: 'transport' },
  { id: 'carmaintenance', icon: Wrench, translationKey: 'categories.carmaintenance', group: 'transport' },

  // Health
  { id: 'health', icon: Heart, translationKey: 'categories.health', group: 'health' },
  { id: 'doctor', icon: Stethoscope, translationKey: 'categories.doctor', group: 'health' },
  { id: 'pharmacy', icon: Pill, translationKey: 'categories.pharmacy', group: 'health' },
  { id: 'dentist', icon: Stethoscope, translationKey: 'categories.dentist', group: 'health' },
  { id: 'optician', icon: Glasses, translationKey: 'categories.optician', group: 'health' },
  { id: 'gym', icon: Dumbbell, translationKey: 'categories.gym', group: 'health' },
  { id: 'sports', icon: Dumbbell, translationKey: 'categories.sports', group: 'health' },

  // Entertainment
  { id: 'entertainment', icon: Popcorn, translationKey: 'categories.entertainment', group: 'entertainment' },
  { id: 'cinema', icon: Film, translationKey: 'categories.cinema', group: 'entertainment' },
  { id: 'streaming', icon: Tv, translationKey: 'categories.streaming', group: 'entertainment' },
  { id: 'music', icon: Music, translationKey: 'categories.music', group: 'entertainment' },
  { id: 'gaming', icon: Gamepad2, translationKey: 'categories.gaming', group: 'entertainment' },
  { id: 'books', icon: Book, translationKey: 'categories.books', group: 'entertainment' },
  { id: 'hobbies', icon: Paintbrush, translationKey: 'categories.hobbies', group: 'entertainment' },
  { id: 'travel', icon: Globe, translationKey: 'categories.travel', group: 'entertainment' },
  { id: 'vacation', icon: Umbrella, translationKey: 'categories.vacation', group: 'entertainment' },

  // Financial
  { id: 'subscription', icon: Smartphone, translationKey: 'categories.subscription', group: 'financial' },
  { id: 'insurance', icon: Umbrella, translationKey: 'categories.insurance', group: 'financial' },
  { id: 'bank', icon: Landmark, translationKey: 'categories.bank', group: 'financial' },
  { id: 'loan', icon: CreditCard, translationKey: 'categories.loan', group: 'financial' },
  { id: 'investment', icon: TrendingUp, translationKey: 'categories.investment', group: 'financial' },
  { id: 'savings', icon: PiggyBank, translationKey: 'categories.savings', group: 'financial' },
  { id: 'taxes', icon: Calculator, translationKey: 'categories.taxes', group: 'financial' },

  // Other
  { id: 'gifts', icon: Gift, translationKey: 'categories.gifts', group: 'other' },
  { id: 'education', icon: GraduationCap, translationKey: 'categories.education', group: 'other' },
  { id: 'childcare', icon: Baby, translationKey: 'categories.childcare', group: 'other' },
  { id: 'pets', icon: PawPrint, translationKey: 'categories.pets', group: 'other' },
  { id: 'homeimprovement', icon: Hammer, translationKey: 'categories.homeimprovement', group: 'other' },
  { id: 'garden', icon: Flower2, translationKey: 'categories.garden', group: 'other' },
  { id: 'charity', icon: Heart, translationKey: 'categories.charity', group: 'other' },
  { id: 'other', icon: Package, translationKey: 'categories.other', group: 'other' },
];

export const getCategoryById = (id: string): CategoryDefinition | undefined => {
  return CATEGORIES.find((cat) => cat.id === id);
};

export const getCategoriesByGroup = (group: CategoryGroup): CategoryDefinition[] => {
  return CATEGORIES.filter((cat) => cat.group === group);
};

export const getAllGroups = (): CategoryGroup[] => {
  return ['essential', 'lifestyle', 'transport', 'health', 'entertainment', 'financial', 'other'];
};
