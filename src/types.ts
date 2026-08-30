export interface PartyDetails {
  partyType: string;
  guestCount: number | null;
  date: string;
  theme: string;
  budget: number | null;
  dietaryRestrictions: string[];
  specialRequests: string;
}

export interface ShoppingItem {
  id: string;
  name: string;
  category: string;
  quantityDescription: string;
  estimatedPrice: number;
  unitPrice?: number;
  isEssential: boolean;
  isEnabled?: boolean;
  isChecked?: boolean;
  themeRelevance?: string;
  dietaryNote?: string;
  cymbalMartAisle?: string;
  notes?: string;
}

export interface ShoppingPlan {
  title: string;
  partySummary: PartyDetails;
  items: ShoppingItem[];
  assumptions: string[];
  themeHighlights: string[];
  dietaryAccommodations: string[];
  proTips: string[];
  estimatedTotal: number;
  essentialsTotal: number;
  optionalsTotal: number;
  budget: number;
  remainingBudget: number;
  costPerGuest: number;
  createdAt?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent' | 'system';
  text: string;
  timestamp: string;
  quickReplies?: string[];
  missingFields?: string[];
  extractedDetails?: Partial<PartyDetails>;
  planGenerated?: ShoppingPlan;
  isStreaming?: boolean;
}

export interface QuickTheme {
  name: string;
  type: string;
  description: string;
  defaultGuests: number;
  defaultBudget: number;
  iconName: string;
  suggestedTheme: string;
  dietarySuggestions: string[];
  specialRequests: string;
}
