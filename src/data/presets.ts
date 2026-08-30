import { QuickTheme } from '../types';

export const PARTY_PRESETS: QuickTheme[] = [
  {
    name: "Tropical Luau Birthday",
    type: "Birthday Party",
    description: "Island vibes with fresh pineapple skewers, teriyaki sliders, sparkling tropical punch, and festive tiki tableware.",
    defaultGuests: 16,
    defaultBudget: 200,
    iconName: "Palmtree",
    suggestedTheme: "Tropical Luau",
    dietarySuggestions: ["Gluten-Free"],
    specialRequests: "Include pineapple fruit platter, colorful paper leis, and coconut water mocktails"
  },
  {
    name: "Backyard BBQ Cookout",
    type: "Backyard BBQ",
    description: "Hearty Angus burgers, artisan buns, sweet corn on the cob, crisp coleslaw, craft sodas, and heavy-duty plates.",
    defaultGuests: 20,
    defaultBudget: 240,
    iconName: "Flame",
    suggestedTheme: "Rustic Summer BBQ",
    dietarySuggestions: ["Vegetarian"],
    specialRequests: "Plant-based burger option, extra ice for beer/seltzer cooler, and wet wipes"
  },
  {
    name: "Kids Superhero Bash",
    type: "Kids Birthday",
    description: "Colorful superhero cupcakes, finger pizzas, organic juice boxes, fresh berries, and superhero party favor masks.",
    defaultGuests: 14,
    defaultBudget: 140,
    iconName: "Shield",
    suggestedTheme: "Superhero Comic Adventure",
    dietarySuggestions: ["Nut Allergy"],
    specialRequests: "100% nut-free certified cupcakes, spill-proof cups, and superhero colored napkins"
  },
  {
    name: "Taco Fiesta & Game Night",
    type: "Game Night",
    description: "Build-your-own street taco bar with warm tortillas, seasoned meats & beans, fresh guacamole, queso, and Mexican sodas.",
    defaultGuests: 10,
    defaultBudget: 120,
    iconName: "Gamepad2",
    suggestedTheme: "Fiesta Taco Bar",
    dietarySuggestions: ["Gluten-Free", "Vegetarian"],
    specialRequests: "Corn and flour tortillas, 3 varieties of salsa (mild, medium, fiery), and finger-friendly snacks"
  },
  {
    name: "Elegant Cocktail & Tapas Soirée",
    type: "Cocktail Party",
    description: "Artisan charcuterie boards, imported cheeses, gourmet crackers, citrus garnishes, tonic waters, and clear stemless glasses.",
    defaultGuests: 12,
    defaultBudget: 280,
    iconName: "GlassWater",
    suggestedTheme: "Modern Gold & Slate",
    dietarySuggestions: ["Gluten-Free", "Dairy-Free"],
    specialRequests: "Fresh rosemary & dehydrated citrus cocktail garnishes, high-clarity cocktail ice, and elegant toothpicks"
  }
];

export const COMMON_DIETARY_OPTIONS = [
  "Gluten-Free",
  "Vegetarian",
  "Vegan",
  "Nut Allergy",
  "Dairy-Free",
  "Halal",
  "Kosher",
  "Low Sugar"
];

export const COMMON_THEMES = [
  "Tropical Luau",
  "Rustic Summer BBQ",
  "Fiesta Taco Bar",
  "Retro 80s Disco",
  "Superhero Adventure",
  "Elegant Gold & White",
  "Tailgate & Game Day",
  "Garden Tea Party",
  "Cozy Movie & Popcorn Night"
];
