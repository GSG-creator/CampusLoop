import { RewardTier, TierInfo, RewardItem } from '../types';

export const TIER_DEFINITIONS: Record<RewardTier, TierInfo> = {
  Starter: {
    tier: 'Starter',
    threshold: 0,
    nextThreshold: 500,
    badge: '🌱 Campus Starter',
    color: 'from-slate-600 to-slate-800',
    canteenPerk: 'Access to standard book exchange & free peer mentoring.',
  },
  Bronze: {
    tier: 'Bronze',
    threshold: 500,
    nextThreshold: 1500,
    badge: '🥉 Bronze Contributor',
    color: 'from-amber-700 to-amber-900',
    canteenPerk: '1 Free Canteen Snack per month.',
  },
  Silver: {
    tier: 'Silver',
    threshold: 1500,
    nextThreshold: 3000,
    badge: '🥈 Silver Scholar',
    color: 'from-slate-400 to-slate-600',
    canteenPerk: '2 Free Canteen Snacks per month.',
  },
  Gold: {
    tier: 'Gold',
    threshold: 3000,
    nextThreshold: 7500,
    badge: '🥇 Gold Achiever',
    color: 'from-amber-500 to-yellow-600',
    canteenPerk: '1 Free Canteen Snack per week.',
  },
  Diamond: {
    tier: 'Diamond',
    threshold: 7500,
    nextThreshold: 10000,
    badge: '💎 Diamond Champion',
    color: 'from-cyan-500 to-blue-600',
    canteenPerk: '1 Free Canteen Snack per week + express canteen queue.',
  },
  Legend: {
    tier: 'Legend',
    threshold: 10000,
    badge: '👑 Campus Legend (Top 1%)',
    color: 'from-purple-600 via-indigo-600 to-amber-500',
    canteenPerk:
      '1 Free Snack per week + 1 Welcome Sandwich-and-Juice Combo + Major Tech Vault eligibility.',
  },
};

export function getUserTier(credits: number): TierInfo {
  if (credits >= 10000) return TIER_DEFINITIONS.Legend;
  if (credits >= 7500) return TIER_DEFINITIONS.Diamond;
  if (credits >= 3000) return TIER_DEFINITIONS.Gold;
  if (credits >= 1500) return TIER_DEFINITIONS.Silver;
  if (credits >= 500) return TIER_DEFINITIONS.Bronze;
  return TIER_DEFINITIONS.Starter;
}

export const REWARD_CATALOGUE: RewardItem[] = [
  // 1. Canteen Snacks
  {
    id: 'snack-samosa-chai',
    title: 'Hot Samosa & Masala Chai',
    category: 'snacks',
    creditCost: 40,
    minTier: 'Bronze',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=400&q=80',
    description: 'Crispy potato-stuffed samosa served with freshly brewed spiced masala tea at the campus central canteen.',
  },
  {
    id: 'snack-choco-muffin',
    title: 'Warm Choco-Chip Muffin',
    category: 'snacks',
    creditCost: 45,
    minTier: 'Bronze',
    image: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?auto=format&fit=crop&w=400&q=80',
    description: 'Freshly baked bakery-style chocolate chip muffin. Perfect mid-exam study snack.',
  },
  {
    id: 'snack-veg-puff',
    title: 'Flaky Veg Puff & Cold Drink',
    category: 'snacks',
    creditCost: 50,
    minTier: 'Bronze',
    image: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=400&q=80',
    description: 'Golden spiced vegetable pastry with choice of chilled fruit beverage or lemonade.',
  },

  // 2. Canteen Meals & Combos
  {
    id: 'meal-legend-combo',
    title: 'Welcome Gourmet Sandwich & Fresh Juice Combo',
    category: 'meals',
    creditCost: 0, // Freebie for Legend Tier!
    minTier: 'Legend',
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=400&q=80',
    description: 'Special Legend Welcome Feast: Grilled multi-grain paneer sandwich with cold-pressed orange juice.',
    sponsorNote: 'Exclusive Legend milestone unlock reward (1 per account).',
  },
  {
    id: 'meal-deluxe-thali',
    title: 'Campus Deluxe Student Thali',
    category: 'meals',
    creditCost: 120,
    minTier: 'Silver',
    image: 'https://images.unsplash.com/photo-1613292443284-8d10ef9383fe?auto=format&fit=crop&w=400&q=80',
    description: 'Hearty full meal: 2 Rotis, Paneer Butter Masala, Dal Tadka, Jeera Rice, Salad, and Gulab Jamun.',
  },

  // 3. Printing & Stationery
  {
    id: 'stat-print-notes',
    title: '50-Page Spiral Color Notes Print',
    category: 'stationery',
    creditCost: 80,
    minTier: 'Bronze',
    image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=400&q=80',
    description: 'High-speed laser color printing with clear plastic cover and spiral comb binding at the student stationery shop.',
  },
  {
    id: 'stat-notebook-pack',
    title: 'Classmate 6-Subject Notebook Pack',
    category: 'stationery',
    creditCost: 90,
    minTier: 'Silver',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80',
    description: 'Pack of 3 premium spiral 300-page ruled notebooks with index dividers and sticker tabs.',
  },

  // 4. Book Vouchers
  {
    id: 'voucher-bookstore-200',
    title: '₹200 Campus Bookstore Voucher',
    category: 'vouchers',
    creditCost: 200,
    minTier: 'Silver',
    image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=400&q=80',
    description: 'Redeemable for any syllabus guide, dictionary, or exam question bank at the campus bookstore.',
  },

  // 5. Study Accessories
  {
    id: 'acc-charging-cable',
    title: 'Braided Fast-Charging USB-C Cable',
    category: 'accessories',
    creditCost: 150,
    minTier: 'Gold',
    image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=400&q=80',
    description: 'Durable 2-meter nylon braided 65W fast-charging cable with reinforced strain relief joints.',
  },
  {
    id: 'acc-study-earbuds',
    title: 'Study Noise-Isolating Earbuds',
    category: 'accessories',
    creditCost: 350,
    minTier: 'Diamond',
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=400&q=80',
    description: 'Ergonomic in-ear buds with silicone passive noise-dampening tips for deep library study sessions.',
  },

  // 6. Major Tech Vault (Legend 10,000 CR Threshold)
  {
    id: 'tech-ipad-air',
    title: 'Apple iPad Air (M2, 128GB)',
    category: 'tech_vault',
    creditCost: 10000,
    minTier: 'Legend',
    isMajorVault: true,
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=400&q=80',
    description: 'Liquid Retina display, M2 performance, and full-day battery for digital textbook note-taking and peer tutoring.',
    sponsorNote: 'Simulated sponsor-funded reward; subject to approval and availability. Crossing threshold is eligibility, not a guaranteed free device. No cash withdrawal or real payment integration.',
  },
  {
    id: 'tech-lenovo-thinkpad',
    title: 'Lenovo ThinkPad Student Edition',
    category: 'tech_vault',
    creditCost: 10000,
    minTier: 'Legend',
    isMajorVault: true,
    image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=400&q=80',
    description: 'High-durability laptop with backlit keyboard, 16GB RAM, and 512GB SSD for coding and academic research.',
    sponsorNote: 'Simulated sponsor-funded reward; subject to approval and availability. Crossing threshold is eligibility, not a guaranteed free device. No cash withdrawal or real payment integration.',
  },
  {
    id: 'tech-samsung-tab',
    title: 'Samsung Galaxy Tab S9 FE (S-Pen)',
    category: 'tech_vault',
    creditCost: 10000,
    minTier: 'Legend',
    isMajorVault: true,
    image: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?auto=format&fit=crop&w=400&q=80',
    description: 'Water-resistant digital canvas tablet with bundled low-latency S-Pen for mathematics derivations and diagrams.',
    sponsorNote: 'Simulated sponsor-funded reward; subject to approval and availability. Crossing threshold is eligibility, not a guaranteed free device. No cash withdrawal or real payment integration.',
  },
];
