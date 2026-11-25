import { CarFront, Command, GraduationCap, Heart, House, Shirt, Sparkles, Utensils } from "lucide-react";
import type { WishCategory } from "@/lib/finance";

export const WISH_CATEGORY_ICONS = {
  FOOD: Utensils,
  TRAVEL: CarFront,
  HOUSEHOLD: House,
  TECHNOLOGY: Command,
  FASHION: Shirt,
  HEALTH: Heart,
  EDUCATION: GraduationCap,
  ENTERTAINMENT: Sparkles,
  OTHER: Sparkles,
} satisfies Record<WishCategory, typeof Utensils>;
