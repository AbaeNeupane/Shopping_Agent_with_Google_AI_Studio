import { QuickTheme } from '../types';

export const PARTY_PRESETS: QuickTheme[] = [
  {
    name: "Outdoor Garden Wedding Reception",
    type: "Wedding Reception",
    description: "Botanical eucalyptus garlands, bistro fairy lights, canopy weather protection, white resin guest seating, banquet tables, gourmet catering, sparkling toast flutes, and guest comfort amenities.",
    defaultGuests: 24,
    defaultBudget: 450,
    iconName: "Heart",
    suggestedTheme: "Garden / Outdoor Botanical",
    dietarySuggestions: ["Gluten-Free", "Vegetarian"],
    specialRequests: "Pop-up canopy tent for shade, warm string lighting, white resin chairs, champagne flutes, botanical bug repellent, and bamboo hand fans"
  },
  {
    name: "Kids Superhero Birthday Bash",
    type: "Children's Birthday Party",
    description: "Child-friendly mini pizza bites, bakery superhero cupcakes, organic juice pouches, fresh fruit skewers, superhero cape/mask favors, and action hero decor.",
    defaultGuests: 14,
    defaultBudget: 150,
    iconName: "Shield",
    suggestedTheme: "Superhero Comic Adventure",
    dietarySuggestions: ["Nut Allergy"],
    specialRequests: "100% nut-free cupcakes, spill-proof cups, sticky-finger wet wipes, and superhero action hero favors"
  },
  {
    name: "Corporate Team-Building Workshop",
    type: "Corporate Team Building Event",
    description: "Artisan gourmet wrap platters, cold brew & tea station, sparkling waters, sleek eco tableware, Post-It easel pads, Sharpies, and team icebreaker kits.",
    defaultGuests: 18,
    defaultBudget: 260,
    iconName: "Briefcase",
    suggestedTheme: "Professional Innovation & Strategy",
    dietarySuggestions: ["Gluten-Free", "Vegetarian"],
    specialRequests: "Gourmet wrap platter (with GF & veggie options), cold brew station, Sharpies, Post-it easel pads, and desk hand sanitizer"
  },
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
    specialRequests: "Plant-based burger option, extra ice for cooler, and wet wipes"
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
    name: "Executive Cocktail & Tapas Soirée",
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

export const COMMON_PARTY_TYPES = [
  "Wedding Reception",
  "Children's Birthday Party",
  "Corporate Team Building Event",
  "Birthday Party",
  "Backyard BBQ",
  "Cocktail Party",
  "Game Night",
  "Graduation Celebration",
  "Dinner Party"
];

export const COMMON_THEMES = [
  "Garden / Outdoor Botanical",
  "Superhero Comic Adventure",
  "Professional Innovation & Strategy",
  "Tropical Luau",
  "Rustic Summer BBQ",
  "Fiesta Taco Bar",
  "Retro 80s Disco",
  "Elegant Gold & Slate",
  "Tailgate & Game Day",
  "Garden Tea Party",
  "Cozy Movie & Popcorn Night"
];
