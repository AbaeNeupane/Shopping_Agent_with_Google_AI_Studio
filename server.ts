import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper for Gemini AI client initialization
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Fallback rule-based planner for local/offline guarantee
function generateFallbackShoppingPlan(details: any, userPrompt?: string) {
  const guests = Number(details.guestCount) || 12;
  const budget = Number(details.budget) || 150;
  const partyType = details.partyType || "Celebration Party";
  const theme = details.theme || "Fun & Festive";
  const dietary = Array.isArray(details.dietaryRestrictions) && details.dietaryRestrictions.length > 0
    ? details.dietaryRestrictions
    : ["None"];
  const isGF = dietary.some((d: string) => d.toLowerCase().includes("gluten"));
  const isVeg = dietary.some((d: string) => d.toLowerCase().includes("veg"));
  const isNutFree = dietary.some((d: string) => d.toLowerCase().includes("nut"));

  const items: any[] = [];
  let idCounter = 1;

  // 1. FOOD
  if (partyType.toLowerCase().includes("bbq") || theme.toLowerCase().includes("bbq") || theme.toLowerCase().includes("tailgate")) {
    const burgerPacks = Math.ceil(guests / 6);
    const unitPrice = 11.99;
    items.push({
      id: `item-${idCounter++}`,
      name: "Cymbal Choice Angus Beef Burger Patties (6-ct)",
      category: "Food",
      quantityDescription: `${burgerPacks} packs (${burgerPacks * 6} patties for ${guests} guests)`,
      unitPrice: unitPrice,
      estimatedPrice: Number((burgerPacks * unitPrice).toFixed(2)),
      isEssential: true,
      themeRelevance: `Hearty main entree for ${theme}`,
      dietaryNote: "100% pure beef, gluten-free",
      cymbalMartAisle: "Aisle 1 - Meat & Poultry",
      notes: "Calculated 1.5 burgers per guest"
    });
    if (isVeg) {
      items.push({
        id: `item-${idCounter++}`,
        name: "Cymbal Plant-Based Burger Patties (4-ct)",
        category: "Food",
        quantityDescription: "1 pack (4 patties)",
        unitPrice: 6.49,
        estimatedPrice: 6.49,
        isEssential: true,
        themeRelevance: "Vegetarian crowd pleaser",
        dietaryNote: "Certified Vegan & Vegetarian",
        cymbalMartAisle: "Aisle 1 - Plant-Based Cooler",
        notes: "Dedicated meatless option"
      });
    }
    const bunPacks = Math.ceil(guests / 8);
    const bunPrice = 3.49;
    items.push({
      id: `item-${idCounter++}`,
      name: "Cymbal Bakery Brioche Hamburger Buns (8-ct)",
      category: "Food",
      quantityDescription: `${bunPacks} bags (${bunPacks * 8} buns)`,
      unitPrice: bunPrice,
      estimatedPrice: Number((bunPacks * bunPrice).toFixed(2)),
      isEssential: true,
      themeRelevance: "Fresh bakery buns",
      dietaryNote: isGF ? "Contains wheat (see GF option)" : "Vegetarian",
      cymbalMartAisle: "Aisle 3 - Fresh Bakery",
      notes: "Freshly baked daily"
    });
    if (isGF) {
      items.push({
        id: `item-${idCounter++}`,
        name: "Udi's Gluten-Free Hamburger Buns (4-ct)",
        category: "Food",
        quantityDescription: "1 pack (4 buns)",
        unitPrice: 5.99,
        estimatedPrice: 5.99,
        isEssential: true,
        themeRelevance: "Dietary inclusive staple",
        dietaryNote: "Certified Gluten-Free",
        cymbalMartAisle: "Aisle 3 - Specialty Bakery",
        notes: "Keeps gluten-sensitive guests covered"
      });
    }
  } else if (partyType.toLowerCase().includes("cocktail") || partyType.toLowerCase().includes("dinner") || partyType.toLowerCase().includes("tapas")) {
    const boardCount = Math.ceil(guests / 10);
    const boardPrice = 18.99;
    items.push({
      id: `item-${idCounter++}`,
      name: "Cymbal Artisan Charcuterie & Gourmet Cheese Platter (28 oz)",
      category: "Food",
      quantityDescription: `${boardCount} large tasting boards`,
      unitPrice: boardPrice,
      estimatedPrice: Number((boardCount * boardPrice).toFixed(2)),
      isEssential: true,
      themeRelevance: `Sophisticated display matching ${theme}`,
      dietaryNote: isNutFree ? "Nut-free curated board" : "Includes cured meats & artisan cheeses",
      cymbalMartAisle: "Aisle 2 - Deli & Specialty",
      notes: "Pre-sliced and ready to serve"
    });
  } else {
    // General / Birthday / Game Night
    const pizzaCount = Math.ceil(guests / 3.5);
    const pizzaPrice = 7.99;
    items.push({
      id: `item-${idCounter++}`,
      name: "Cymbal Select Wood-Fired Artisan Pizzas (3-Cheese & Pepperoni)",
      category: "Food",
      quantityDescription: `${pizzaCount} whole 14\" pizzas`,
      unitPrice: pizzaPrice,
      estimatedPrice: Number((pizzaCount * pizzaPrice).toFixed(2)),
      isEssential: true,
      themeRelevance: `Crowd-pleasing main for ${partyType}`,
      dietaryNote: isGF ? "Wheat crust (see GF alternative)" : "Standard dairy/meat",
      cymbalMartAisle: "Aisle 4 - Frozen Meals",
      notes: "Approx. 2.5 slices per guest"
    });
    if (isGF) {
      items.push({
        id: `item-${idCounter++}`,
        name: "Caulipower Gluten-Free Margherita Pizza",
        category: "Food",
        quantityDescription: "1 pizza",
        unitPrice: 8.99,
        estimatedPrice: 8.99,
        isEssential: true,
        themeRelevance: "Dietary friendly main",
        dietaryNote: "Certified Gluten-Free & Vegetarian",
        cymbalMartAisle: "Aisle 4 - Frozen Specialty",
        notes: "Separate allergen-safe serving"
      });
    }
  }

  // Food - Produce, Snacks & Desserts
  const fruitTrays = Math.ceil(guests / 10);
  const fruitPrice = 9.99;
  items.push({
    id: `item-${idCounter++}`,
    name: "Cymbal Fresh Cut Seasonal Fruit & Berry Party Bowl (3 lbs)",
    category: "Food",
    quantityDescription: `${fruitTrays} bowls (${fruitTrays * 3} lbs)`,
    unitPrice: fruitPrice,
    estimatedPrice: Number((fruitTrays * fruitPrice).toFixed(2)),
    isEssential: true,
    themeRelevance: `Crisp fruit pops matching ${theme}`,
    dietaryNote: "Naturally Gluten-Free, Vegan, Nut-Free",
    cymbalMartAisle: "Aisle 1 - Produce Department",
    notes: "Assorted melon, pineapple, grapes & berries"
  });

  const chipBags = Math.ceil(guests / 5);
  const chipPrice = 3.29;
  items.push({
    id: `item-${idCounter++}`,
    name: "Cymbal Crispy Cantina Tortilla Chips (16 oz)",
    category: "Food",
    quantityDescription: `${chipBags} party-size bags`,
    unitPrice: chipPrice,
    estimatedPrice: Number((chipBags * chipPrice).toFixed(2)),
    isEssential: true,
    themeRelevance: "Crunchy sharing snack",
    dietaryNote: "Gluten-Free & Vegan",
    cymbalMartAisle: "Aisle 5 - Chips & Snacks",
    notes: "Serve with dips in bowls"
  });

  const dipTubs = Math.ceil(guests / 8);
  const dipPrice = 6.49;
  items.push({
    id: `item-${idCounter++}`,
    name: "Cymbal Fresh Guacamole & Fire-Roasted Salsa Duo (32 oz)",
    category: "Food",
    quantityDescription: `${dipTubs} duo packs`,
    unitPrice: dipPrice,
    estimatedPrice: Number((dipTubs * dipPrice).toFixed(2)),
    isEssential: true,
    themeRelevance: "Vibrant dip pairing",
    dietaryNote: "Vegan, Gluten-Free, Nut-Free",
    cymbalMartAisle: "Aisle 1 - Produce Deli",
    notes: "Keep refrigerated until start"
  });

  const dessertPacks = Math.ceil(guests / 12);
  const cupcakePrice = 8.99;
  items.push({
    id: `item-${idCounter++}`,
    name: "Cymbal Bakery Celebration Cupcake Assortment (12-ct Vanilla & Chocolate)",
    category: "Food",
    quantityDescription: `${dessertPacks} packs (${dessertPacks * 12} cupcakes)`,
    unitPrice: cupcakePrice,
    estimatedPrice: Number((dessertPacks * cupcakePrice).toFixed(2)),
    isEssential: true,
    themeRelevance: `Centerpiece treat for ${partyType}`,
    dietaryNote: isNutFree ? "Nut-free facility bakery" : "Contains egg, dairy, wheat",
    cymbalMartAisle: "Aisle 3 - Bakery Showcase",
    notes: "1 cupcake per guest"
  });

  // 2. DRINKS
  const seltzerPacks = Math.ceil((guests * 2) / 12);
  const seltzerPrice = 4.99;
  items.push({
    id: `item-${idCounter++}`,
    name: "Cymbal Sparkling Seltzer Variety 12-Pack (12 x 12 oz cans)",
    category: "Drinks",
    quantityDescription: `${seltzerPacks} twelve-packs (${seltzerPacks * 12} cans total)`,
    unitPrice: seltzerPrice,
    estimatedPrice: Number((seltzerPacks * seltzerPrice).toFixed(2)),
    isEssential: true,
    themeRelevance: "Crisp zero-sugar hydration",
    dietaryNote: "Gluten-Free, Vegan, Zero Calorie",
    cymbalMartAisle: "Aisle 7 - Beverages",
    notes: "Calculated 2 cans per guest"
  });

  const juiceJugs = Math.ceil(guests / 8);
  const juicePrice = 3.79;
  items.push({
    id: `item-${idCounter++}`,
    name: "Cymbal All-Natural Chilled Lemonade / Fruit Punch (1 Gallon)",
    category: "Drinks",
    quantityDescription: `${juiceJugs} gallon jugs`,
    unitPrice: juicePrice,
    estimatedPrice: Number((juiceJugs * juicePrice).toFixed(2)),
    isEssential: true,
    themeRelevance: `Sweet chilled beverage for ${theme}`,
    dietaryNote: "Dairy-Free, Nut-Free",
    cymbalMartAisle: "Aisle 7 - Chilled Drinks",
    notes: "Great standalone or drink mixer"
  });

  const iceBags = Math.max(1, Math.ceil(guests / 8));
  const icePrice = 2.49;
  items.push({
    id: `item-${idCounter++}`,
    name: "Cymbal Pure Filtered Party Ice (10 lb bag)",
    category: "Drinks",
    quantityDescription: `${iceBags} bags (${iceBags * 10} lbs total)`,
    unitPrice: icePrice,
    estimatedPrice: Number((iceBags * icePrice).toFixed(2)),
    isEssential: true,
    themeRelevance: "Essential drink and cooler chilling",
    dietaryNote: "Pure filtered water",
    cymbalMartAisle: "Front Entry - Ice Freezers",
    notes: "Keeps drinks cold for 4-6 hours"
  });

  // 3. DECORATIONS
  items.push({
    id: `item-${idCounter++}`,
    name: `Festive ${theme} Theme Banner & Streamer Accent Pack`,
    category: "Decorations",
    quantityDescription: "1 kit (10 ft banner + 2 metallic streamers)",
    unitPrice: 5.99,
    estimatedPrice: 5.99,
    isEssential: true,
    themeRelevance: `Sets visual ambiance for ${theme}`,
    dietaryNote: "Decorative item",
    cymbalMartAisle: "Aisle 8 - Party Decorations",
    notes: "Pre-strung for instant hanging"
  });

  items.push({
    id: `item-${idCounter++}`,
    name: "Color-Coordinated Party Balloon Arch & Confetti Kit",
    category: "Decorations",
    quantityDescription: "1 kit (30 assorted latex balloons + balloon tape)",
    unitPrice: 7.49,
    estimatedPrice: 7.49,
    isEssential: false,
    themeRelevance: "Festive photo-ready room backdrop",
    dietaryNote: "Non-food decorative",
    cymbalMartAisle: "Aisle 8 - Balloons & Party",
    notes: "Easy self-inflating garland"
  });

  // 4. TABLEWARE
  const platePacks = Math.ceil((guests * 1.5) / 30);
  const platePrice = 4.49;
  items.push({
    id: `item-${idCounter++}`,
    name: "Cymbal Eco-Friendly Heavy-Duty Compostable Paper Plates (30-ct)",
    category: "Tableware",
    quantityDescription: `${platePacks} packs (${platePacks * 30} plates)`,
    unitPrice: platePrice,
    estimatedPrice: Number((platePacks * platePrice).toFixed(2)),
    isEssential: true,
    themeRelevance: "Sturdy dinner & dessert plates",
    dietaryNote: "Food-safe compostable",
    cymbalMartAisle: "Aisle 8 - Paper & Party Supplies",
    notes: "1.5 plates per guest for meal + sweets"
  });

  const napkinPacks = Math.ceil((guests * 2.5) / 50);
  const napkinPrice = 2.29;
  items.push({
    id: `item-${idCounter++}`,
    name: "Cymbal 2-Ply Party Beverage Napkins (50-ct, Theme Colors)",
    category: "Tableware",
    quantityDescription: `${napkinPacks} packs (${napkinPacks * 50} napkins)`,
    unitPrice: napkinPrice,
    estimatedPrice: Number((napkinPacks * napkinPrice).toFixed(2)),
    isEssential: true,
    themeRelevance: `Color coordinated for ${theme}`,
    dietaryNote: "General supply",
    cymbalMartAisle: "Aisle 8 - Paper & Party Supplies",
    notes: "2-3 napkins allocated per guest"
  });

  const cutleryPacks = Math.ceil(guests / 16);
  const cutleryPrice = 3.99;
  items.push({
    id: `item-${idCounter++}`,
    name: "Cymbal Plant-Based Compostable Cutlery Set (Forks, Spoons, Knives 24-pk)",
    category: "Tableware",
    quantityDescription: `${cutleryPacks} boxes (${cutleryPacks * 24} utensils)`,
    unitPrice: cutleryPrice,
    estimatedPrice: Number((cutleryPacks * cutleryPrice).toFixed(2)),
    isEssential: true,
    themeRelevance: "Mess-free dining",
    dietaryNote: "Non-toxic biodegradable",
    cymbalMartAisle: "Aisle 8 - Paper & Party Supplies",
    notes: "Full dining cutlery set"
  });

  const cupPacks = Math.ceil((guests * 2) / 30);
  const cupPrice = 3.49;
  items.push({
    id: `item-${idCounter++}`,
    name: "Cymbal Recyclable Party Cold Beverage Cups 16 oz (30-ct)",
    category: "Tableware",
    quantityDescription: `${cupPacks} packs (${cupPacks * 30} cups)`,
    unitPrice: cupPrice,
    estimatedPrice: Number((cupPacks * cupPrice).toFixed(2)),
    isEssential: true,
    themeRelevance: "Durable drink cups for punch & seltzers",
    dietaryNote: "BPA-Free recyclable",
    cymbalMartAisle: "Aisle 8 - Paper & Party Supplies",
    notes: "Assures 2 cups per person"
  });

  // 5. PARTY SUPPLIES
  items.push({
    id: `item-${idCounter++}`,
    name: "Cymbal Heavy-Duty Serving Tongs & Clear Ice Scoop Combo",
    category: "Party supplies",
    quantityDescription: "1 set (2 serving tongs + 1 ice scoop)",
    unitPrice: 4.49,
    estimatedPrice: 4.49,
    isEssential: true,
    themeRelevance: "Sanitary food & ice buffet serving",
    dietaryNote: "BPA-Free reusable plastic",
    cymbalMartAisle: "Aisle 8 - Catering & Serving",
    notes: "Essential for hygienic guest self-service"
  });

  items.push({
    id: `item-${idCounter++}`,
    name: "Cymbal Clean-Up Drawstring Party Trash Bags (13 Gallon, 15-ct)",
    category: "Party supplies",
    quantityDescription: "1 box (15 bags)",
    unitPrice: 3.29,
    estimatedPrice: 3.29,
    isEssential: true,
    themeRelevance: "Post-party quick cleanup",
    dietaryNote: "Recycled plastic",
    cymbalMartAisle: "Aisle 8 - Cleaning & Trash",
    notes: "Place next to drink tubs and buffet"
  });

  // 6. OPTIONAL EXTRAS
  items.push({
    id: `item-${idCounter++}`,
    name: "Cymbal Gourmet Dipping Chocolate & Marshmallow Skewer Kit",
    category: "Optional extras",
    quantityDescription: "1 party treat station kit",
    unitPrice: 6.49,
    estimatedPrice: 6.49,
    isEssential: false,
    themeRelevance: "Interactive dessert bonus",
    dietaryNote: "Vegetarian",
    cymbalMartAisle: "Aisle 6 - Confectionery",
    notes: "Optional: sweet interactive station"
  });

  items.push({
    id: `item-${idCounter++}`,
    name: "Insulated Beverage Tub & Condiment Serving Caddy",
    category: "Optional extras",
    quantityDescription: "1 party cooler caddy",
    unitPrice: 8.99,
    estimatedPrice: 8.99,
    isEssential: false,
    themeRelevance: "Keeps drinks chilled on the display table",
    dietaryNote: "Reusable houseware",
    cymbalMartAisle: "Aisle 8 - Seasonal & Housewares",
    notes: "Optional: easily toggled to save budget"
  });

  const essentialsTotal = items
    .filter(i => i.isEssential)
    .reduce((sum, i) => sum + i.estimatedPrice, 0);
  const optionalsTotal = items
    .filter(i => !i.isEssential)
    .reduce((sum, i) => sum + i.estimatedPrice, 0);
  const estimatedTotal = Number((essentialsTotal + optionalsTotal).toFixed(2));
  const remainingBudget = Number((budget - estimatedTotal).toFixed(2));
  const costPerGuest = Number((estimatedTotal / guests).toFixed(2));

  return {
    title: `${theme} ${partyType} CymbalMart Shopping Plan`,
    partySummary: {
      partyType,
      guestCount: guests,
      date: details.date || "Upcoming",
      theme,
      budget,
      dietaryRestrictions: dietary,
      specialRequests: details.specialRequests || "None specified"
    },
    items: items.map(it => ({ ...it, isEnabled: true, isChecked: false })),
    assumptions: [
      `Guest baseline: planned for ${guests} guests for an estimated 3 to 4 hour gathering.`,
      `Drinks allocation: budgeted ~2 to 3 seltzers/juices per guest plus 10 lbs ice for drink chilling.`,
      `Food portions: scaled 1.5 main portions per person plus ample fresh fruit, chips, guacamole, and cupcakes.`,
      `Tableware ratios: included 1.5 heavy-duty compostable plates and 2.5 napkins per guest.`,
      dietary.includes("Gluten-Free") ? "Dietary accommodation: included dedicated certified Gluten-Free items to prevent cross-contact." : "Balanced variety across savory, sweet, and hydration.",
      `Budget reconciliation: total estimated at $${estimatedTotal} against your $${budget} budget (${remainingBudget >= 0 ? `$${remainingBudget} surplus remaining` : `$${Math.abs(remainingBudget)} over target — optional extras can be toggled off to save $${optionalsTotal.toFixed(2)}`}).`
    ],
    themeHighlights: [
      `Decor & tableware styled around "${theme}" colors and aesthetic.`,
      `Curated snack & drink menu matching a festive ${partyType}.`,
      `Celebration cupcakes and accent banner centerpiece.`
    ],
    dietaryAccommodations: isGF || isVeg || isNutFree
      ? [
          isGF ? "Included certified Gluten-Free buns/pizza and naturally GF fruit & chips." : null,
          isVeg ? "Dedicated plant-based entrees and vegetarian snack platters." : null,
          isNutFree ? "Nut-safe bakery cupcakes and allergen-labeled snacks." : null,
        ].filter(Boolean) as string[]
      : ["All items are standard supermarket favorites with clear ingredient labeling."],
    proTips: [
      "Chill beverages in the refrigerator the night before so party ice lasts longer in tubs.",
      "Pre-slice fruit and set up the taco/snack bar 30 minutes before guests arrive.",
      "Set compostable plates and napkins at both ends of the table to speed up serving."
    ],
    estimatedTotal,
    essentialsTotal: Number(essentialsTotal.toFixed(2)),
    optionalsTotal: Number(optionalsTotal.toFixed(2)),
    budget,
    remainingBudget,
    costPerGuest,
    createdAt: new Date().toISOString()
  };
}

// API: Conversational Agent Endpoint with 4-Stage Flow
app.post("/api/chat", async (req, res) => {
  try {
    const { 
      messages = [], 
      partyDetails = {}, 
      userMessage = "", 
      forceGeneratePlan = false, 
      currentStage = "define",
      currentPlan = null 
    } = req.body;
    const gemini = getGeminiClient();

    // Extract updated details from user message locally as base / fallback
    const text = (userMessage || "").toLowerCase();
    const updatedDetails = { ...partyDetails };

    if (text.match(/(\d+)\s*(guests?|people|kids|adults|friends|attendees)/i)) {
      const match = text.match(/(\d+)\s*(guests?|people|kids|adults|friends|attendees)/i);
      if (match) updatedDetails.guestCount = parseInt(match[1], 10);
    }
    if (text.match(/\$(\d+)/) || text.match(/budget.*?(\d+)/i) || text.match(/(\d+)\s*dollars/i)) {
      const match = text.match(/\$(\d+)/) || text.match(/budget.*?(\d+)/i) || text.match(/(\d+)\s*dollars/i);
      if (match) updatedDetails.budget = parseInt(match[1], 10);
    }
    if (text.includes("bbq") || text.includes("barbecue") || text.includes("cookout")) updatedDetails.partyType = "Backyard BBQ";
    else if (text.includes("birthday")) updatedDetails.partyType = "Birthday Party";
    else if (text.includes("cocktail") || text.includes("tapas")) updatedDetails.partyType = "Cocktail Party";
    else if (text.includes("game night")) updatedDetails.partyType = "Game Night";
    else if (text.includes("graduation")) updatedDetails.partyType = "Graduation Party";
    else if (text.includes("dinner")) updatedDetails.partyType = "Dinner Party";
    else if (text.includes("kids party") || text.includes("children")) updatedDetails.partyType = "Kids Birthday";

    if (text.includes("tropical") || text.includes("luau")) updatedDetails.theme = "Tropical Luau";
    else if (text.includes("superhero")) updatedDetails.theme = "Superhero Adventure";
    else if (text.includes("retro") || text.includes("80s") || text.includes("disco")) updatedDetails.theme = "Retro Disco";
    else if (text.includes("fiesta") || text.includes("taco")) updatedDetails.theme = "Fiesta Taco Bar";
    else if (text.includes("gold") || text.includes("elegant")) updatedDetails.theme = "Elegant Gold & White";
    else if (text.includes("sports") || text.includes("tailgate") || text.includes("super bowl")) updatedDetails.theme = "Tailgate & Game Day";

    if (text.includes("gluten-free") || text.includes("gluten free") || text.includes("celiac")) {
      updatedDetails.dietaryRestrictions = Array.from(new Set([...(updatedDetails.dietaryRestrictions || []), "Gluten-Free"]));
    }
    if (text.includes("vegan")) {
      updatedDetails.dietaryRestrictions = Array.from(new Set([...(updatedDetails.dietaryRestrictions || []), "Vegan"]));
    }
    if (text.includes("vegetarian") || text.includes("veggie")) {
      updatedDetails.dietaryRestrictions = Array.from(new Set([...(updatedDetails.dietaryRestrictions || []), "Vegetarian"]));
    }
    if (text.includes("nut allergy") || text.includes("peanut allergy") || text.includes("nut-free")) {
      updatedDetails.dietaryRestrictions = Array.from(new Set([...(updatedDetails.dietaryRestrictions || []), "Nut Allergy"]));
    }
    if (text.includes("no dietary") || text.includes("no restrictions") || text.includes("no allergies") || text.includes("all good") || text.includes("none")) {
      updatedDetails.dietaryRestrictions = ["None"];
    }

    if (text.includes("saturday") || text.includes("sunday") || text.includes("this weekend") || text.includes("next week") || text.includes("tomorrow") || text.includes("oct") || text.includes("nov") || text.includes("dec")) {
      updatedDetails.date = userMessage;
    }

    // Determine Stage 1 missing fields among the 7 required
    const requiredSpecs = [
      { key: "partyType", label: "Party type", val: updatedDetails.partyType },
      { key: "guestCount", label: "Number of guests", val: updatedDetails.guestCount },
      { key: "date", label: "Date", val: updatedDetails.date },
      { key: "theme", label: "Theme", val: updatedDetails.theme },
      { key: "budget", label: "Budget", val: updatedDetails.budget },
      { key: "dietaryRestrictions", label: "Dietary restrictions", val: updatedDetails.dietaryRestrictions?.length ? updatedDetails.dietaryRestrictions : null },
      { key: "specialRequests", label: "Special requests", val: updatedDetails.specialRequests || null }
    ];

    const missingSpecs = requiredSpecs.filter(s => s.val === null || s.val === undefined || s.val === "");
    const providedSpecs = requiredSpecs.filter(s => s.val !== null && s.val !== undefined && s.val !== "");

    // Check user intent for Stage 3 Refine or Stage 4 Finalize
    const isCheckoutOrFinalize = text.includes("finalize") || text.includes("checkout") || text.includes("ready to order") || text.includes("confirm order") || text.includes("done");
    const isRefineRequest = text.includes("reduce cost") || text.includes("cheaper") || text.includes("add item") || text.includes("remove item") || text.includes("replace") || text.includes("change theme") || text.includes("change guest") || text.includes("change budget") || text.includes("more guests") || text.includes("less guests") || text.includes("trim budget") || text.includes("increase budget") || text.includes("add ") || text.includes("remove ") || text.includes("change quantity") || text.includes("quantity");

    // Local Fallback if Gemini is unavailable
    if (!gemini) {
      console.log("Using smart local 4-stage agent engine");

      if (isCheckoutOrFinalize && (updatedDetails.guestCount || forceGeneratePlan || currentPlan)) {
        const plan = currentPlan || generateFallbackShoppingPlan(updatedDetails, userMessage);
        return res.json({
          replyText: `🎉 **Stage 4: Finalize & Checkout**\n\nHere is your final concise shopping plan for **${plan.partySummary.guestCount} guests** with an estimated total of **$${plan.estimatedTotal.toFixed(2)}** ($${plan.costPerGuest.toFixed(2)} per guest).\n\n• Food (${plan.items.filter((i: any) => i.category === 'Food').length} items)\n• Drinks (${plan.items.filter((i: any) => i.category === 'Drinks').length} items)\n• Decorations (${plan.items.filter((i: any) => i.category === 'Decorations').length} items)\n• Tableware (${plan.items.filter((i: any) => i.category === 'Tableware').length} items)\n• Party supplies (${plan.items.filter((i: any) => i.category === 'Party supplies').length} items)\n• Optional extras (${plan.items.filter((i: any) => i.category === 'Optional extras').length} items)\n\nAll items are mapped directly to CymbalMart aisles for fast curbside pickup or store trip!`,
          extractedDetails: updatedDetails,
          missingFields: [],
          stage: "finalize",
          shoppingPlan: plan,
          quickReplies: ["Open Finalize & Checkout", "Review In-Store Mode", "Change guest count", "Adjust budget"]
        });
      }

      // If we have an existing plan and user requested modification in Stage 3
      if (currentPlan && isRefineRequest) {
        let modifiedItems = [...currentPlan.items];
        let modificationNote = "I've updated your shopping plan!";

        if (text.includes("remove") || text.includes("delete")) {
          const words = text.replace(/remove|delete|the|from|list/g, "").trim();
          modifiedItems = modifiedItems.filter(i => !i.name.toLowerCase().includes(words) && !words.includes(i.name.toLowerCase()));
          modificationNote = `Removed matching items from your shopping plan and recalculated your estimated total and remaining budget.`;
        } else if (text.includes("add")) {
          const newItemName = userMessage.replace(/^.*?add\s+/i, "").trim() || "Custom Party Item";
          modifiedItems.push({
            id: `custom-${Date.now()}`,
            name: newItemName,
            category: "Food",
            quantityDescription: "1 pack",
            unitPrice: 5.99,
            estimatedPrice: 5.99,
            isEssential: true,
            isEnabled: true,
            isChecked: false,
            cymbalMartAisle: "Aisle 1 - Grocery",
            themeRelevance: "Customer custom addition"
          });
          modificationNote = `Added "${newItemName}" to your shopping plan and updated all subtotals and budget comparisons.`;
        } else if (text.includes("reduce") || text.includes("cheaper") || text.includes("trim")) {
          modifiedItems = modifiedItems.map(i => (!i.isEssential ? { ...i, isEnabled: false } : i));
          modificationNote = `Trimmed optional extras to reduce your total and save budget.`;
        }

        const activeItems = modifiedItems.filter(i => i.isEnabled !== false);
        const essentialsTotal = activeItems
          .filter(i => i.isEssential)
          .reduce((sum, i) => sum + (i.estimatedPrice || 0), 0);
        const optionalsTotal = activeItems
          .filter(i => !i.isEssential)
          .reduce((sum, i) => sum + (i.estimatedPrice || 0), 0);
        const estimatedTotal = Number((essentialsTotal + optionalsTotal).toFixed(2));
        const budget = updatedDetails.budget || currentPlan.budget || 150;
        const guests = updatedDetails.guestCount || currentPlan.partySummary.guestCount || 12;
        const remainingBudget = Number((budget - estimatedTotal).toFixed(2));

        const updatedPlan = {
          ...currentPlan,
          partySummary: { ...currentPlan.partySummary, ...updatedDetails },
          items: modifiedItems,
          essentialsTotal: Number(essentialsTotal.toFixed(2)),
          optionalsTotal: Number(optionalsTotal.toFixed(2)),
          estimatedTotal,
          budget,
          remainingBudget,
          costPerGuest: Number((estimatedTotal / guests).toFixed(2))
        };

        return res.json({
          replyText: `📋 **Stage 3: Refine**\n\n${modificationNote}\n\n• **New Total**: $${estimatedTotal.toFixed(2)}\n• **Budget**: $${budget} (${remainingBudget >= 0 ? `$${remainingBudget.toFixed(2)} under budget` : `$${Math.abs(remainingBudget).toFixed(2)} over budget`})\n• **Active items**: ${activeItems.length}`,
          extractedDetails: updatedDetails,
          missingFields: [],
          stage: "refine",
          shoppingPlan: updatedPlan,
          quickReplies: ["💰 Reduce cost further", "➕ Add another item", "🔄 Replace item", "🛒 Finalize & Checkout"]
        });
      }

      // If we have essential parameters or forced plan, show Stage 2 / Stage 3
      const hasCore = updatedDetails.partyType && updatedDetails.guestCount && updatedDetails.budget;
      if (forceGeneratePlan || hasCore) {
        const plan = generateFallbackShoppingPlan(updatedDetails, userMessage);
        return res.json({
          replyText: `📋 **Stage 2: Review Shopping List & Stage 3: Refine**\n\nI've generated your categorized shopping plan for **${updatedDetails.guestCount || 12} guests** with an estimated total of **$${plan.estimatedTotal.toFixed(2)}** (Target: $${plan.budget}).\n\nEvery item includes exact quantities, unit prices, subtotal calculations, and essential vs. optional tags across all 6 categories (Food, Drinks, Decorations, Tableware, Party supplies, and Optional extras).\n\n**Would you like to refine anything?**\n• 💰 Reduce the cost\n• ➕ Add items\n• ➖ Remove items\n• 🔄 Replace items\n• 🎨 Change the theme\n• 👥 Change the guest count\n• 💵 Change the budget`,
          extractedDetails: updatedDetails,
          missingFields: missingSpecs.map(m => m.key),
          stage: "review",
          shoppingPlan: plan,
          quickReplies: ["💰 Reduce the cost", "➕ Add items", "🔄 Replace items", "👥 Change guest count", "🎨 Change theme", "🛒 Finalize & Checkout"]
        });
      }

      // Stage 1: Define Event - Only ask for what is missing!
      let replyText = "👋 Welcome to CymbalMart's Party Planner!\n\n";
      if (providedSpecs.length > 0) {
        replyText += `Here is what I have recorded so far:\n` + providedSpecs.map(s => `✓ **${s.label}**: ${Array.isArray(s.val) ? s.val.join(', ') : s.val}`).join('\n') + `\n\n`;
      }
      replyText += `To complete **Stage 1 (Define Event)**, please provide the remaining details:\n`;
      replyText += missingSpecs.map(m => `• **${m.label}**`).join('\n');

      let quickReplies: string[] = [];
      if (!updatedDetails.partyType) {
        quickReplies = ["Birthday Party", "Backyard BBQ", "Cocktail Party", "Game Night", "Kids Party"];
      } else if (!updatedDetails.guestCount) {
        quickReplies = ["10 guests", "15 guests", "20 guests", "30 guests"];
      } else if (!updatedDetails.budget) {
        quickReplies = ["$100 budget", "$150 budget", "$250 budget", "$350 budget"];
      } else if (!updatedDetails.theme) {
        quickReplies = ["Tropical Luau", "Retro Disco", "Fiesta Taco Bar", "Casual Cookout", "Superhero"];
      } else if (!updatedDetails.dietaryRestrictions || updatedDetails.dietaryRestrictions.length === 0) {
        quickReplies = ["No restrictions (None)", "Gluten-Free", "Vegetarian", "Vegan", "Nut Allergy"];
      } else if (!updatedDetails.date) {
        quickReplies = ["This Saturday", "This Sunday", "Next Weekend", "Oct 15th"];
      } else {
        quickReplies = ["Generate Shopping List", "No special requests", "Add mocktail recipe", "Compostable supplies"];
      }

      return res.json({
        replyText,
        extractedDetails: updatedDetails,
        missingFields: missingSpecs.map(m => m.key),
        stage: "define",
        shoppingPlan: null,
        quickReplies
      });
    }

    // Gemini 3.7 Flash Engine with strict 4-stage instructions
    const systemInstruction = `You are the CymbalMart Party Planner Shopping Agent.
CymbalMart is a modern neighborhood supermarket with full grocery, bakery, deli, produce, beverage, tableware, and party supplies aisles.

You guide the customer through four distinct stages:

--- STAGE 1: DEFINE EVENT ---
Collect the 7 event parameters:
1. Party type (e.g. Birthday, Backyard BBQ, Cocktail Party, Game Night, Graduation, Dinner)
2. Number of guests (integer)
3. Date (e.g. "This Saturday", "Oct 12")
4. Theme (e.g. Tropical Luau, Retro Disco, Fiesta Taco Bar, Superhero, Elegant Gold)
5. Budget (in USD, e.g. $150)
6. Dietary restrictions (e.g. Gluten-Free, Vegan, Vegetarian, Nut Allergy, None)
7. Special requests (e.g. mocktail recipes, eco-friendly tableware, extra ice)

CRITICAL RULE FOR STAGE 1:
- DO NOT ask all questions again if the user has already provided the information!
- In your replyText, briefly acknowledge what is already known, and ONLY ask for the missing items concisely.
- When key parameters (party type, guests, budget) are known or when user requests list generation, immediately advance to Stage 2.

--- STAGE 2: REVIEW SHOPPING LIST ---
Generate a comprehensive, categorized shopping plan.
The list MUST group items into these EXACT 6 CATEGORIES:
1. "Food" (Mains, produce, snacks, bakery, desserts)
2. "Drinks" (Seltzers, juices, craft sodas, party ice)
3. "Decorations" (Theme banner, garlands, balloon kit)
4. "Tableware" (Compostable plates, napkins, cutlery, cold cups)
5. "Party supplies" (Serving tongs, ice scoop, trash cleanup bags)
6. "Optional extras" (Interactive treat kits, beverage tubs, photo props)

FOR EVERY ITEM INCLUDE:
- name: Specific item name with CymbalMart brand or supermarket name
- category: Exactly one of "Food", "Drinks", "Decorations", "Tableware", "Party supplies", "Optional extras"
- quantityDescription: Realistic quantity scaled to guest count (e.g. "3 packs (18 patties for 12 guests)")
- unitPrice: Realistic estimated unit price (e.g. 11.99)
- estimatedPrice: Subtotal = quantity * unitPrice (e.g. 35.97)
- isEssential: true for core food/drinks/tableware; false for extra decor or specialty items
- cymbalMartAisle: e.g. "Aisle 1 - Meat & Poultry", "Aisle 7 - Beverages", "Aisle 8 - Paper & Party Supplies"
- notes: Mathematical portion or serving notes
- themeRelevance: Theme link
- dietaryNote: Allergen / dietary note

Calculate estimatedTotal (sum of all items), essentialsTotal, optionalsTotal, remainingBudget, and costPerGuest.

--- STAGE 3: REFINE & MODIFY ---
Prompt the customer explicitly on whether they want to:
- Reduce the cost
- Add items
- Remove items
- Change an item's quantity
- Replace an item with another item
- Change the theme
- Change the guest count
- Change the budget

CRITICAL RULE FOR STAGE 3:
- Whenever the shopping list is modified:
  * Update the quantities
  * Recalculate item subtotals (quantity * unitPrice)
  * Recalculate the estimated total
  * Compare the new total with the customer's budget
  * Show the remaining budget or amount over budget
- Keep all other party requirements and existing unmodified items unchanged unless the customer explicitly asks to change them!

--- STAGE 4: FINALIZE ---
When user is satisfied or asks to checkout/finalize, provide a final concise shopping list and estimated total suitable for checkout with store pickup / delivery details.

STYLE GUIDELINES:
- Warm, concise, friendly, and practical for a busy party host.
- Always provide relevant suggestedQuickReplies.
`;

    const promptContext = {
      conversationHistory: messages.slice(-8),
      currentPartyDetails: partyDetails,
      latestUserMessage: userMessage,
      forceGeneratePlan,
      currentStage,
      existingShoppingPlan: currentPlan
    };

    const response = await gemini.models.generateContent({
      model: "gemini-3.7-flash",
      contents: JSON.stringify(promptContext),
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            replyText: {
              type: Type.STRING,
              description: "Concise, friendly response guiding through the current stage."
            },
            currentStage: {
              type: Type.STRING,
              enum: ["define", "review", "refine", "finalize"],
              description: "The current workflow stage."
            },
            extractedDetails: {
              type: Type.OBJECT,
              properties: {
                partyType: { type: Type.STRING },
                guestCount: { type: Type.INTEGER },
                date: { type: Type.STRING },
                theme: { type: Type.STRING },
                budget: { type: Type.NUMBER },
                dietaryRestrictions: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                specialRequests: { type: Type.STRING }
              }
            },
            missingFields: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            suggestedQuickReplies: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            shoppingPlan: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                items: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      name: { type: Type.STRING },
                      category: { 
                        type: Type.STRING,
                        description: "Must be one of: Food, Drinks, Decorations, Tableware, Party supplies, Optional extras"
                      },
                      quantityDescription: { type: Type.STRING },
                      unitPrice: { type: Type.NUMBER },
                      estimatedPrice: { type: Type.NUMBER, description: "Estimated subtotal" },
                      isEssential: { type: Type.BOOLEAN },
                      themeRelevance: { type: Type.STRING },
                      dietaryNote: { type: Type.STRING },
                      cymbalMartAisle: { type: Type.STRING },
                      notes: { type: Type.STRING }
                    },
                    required: ["id", "name", "category", "quantityDescription", "unitPrice", "estimatedPrice", "isEssential"]
                  }
                },
                assumptions: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                themeHighlights: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                dietaryAccommodations: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                proTips: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              }
            }
          },
          required: ["replyText", "extractedDetails", "currentStage"]
        }
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    const mergedDetails = { ...partyDetails, ...(parsed.extractedDetails || {}) };

    let finalShoppingPlan = null;
    if (parsed.shoppingPlan && parsed.shoppingPlan.items && parsed.shoppingPlan.items.length > 0) {
      const planItems = parsed.shoppingPlan.items.map((it: any, idx: number) => {
        // Map category to standard 6 if needed
        let cat = it.category;
        if (!["Food", "Drinks", "Decorations", "Tableware", "Party supplies", "Optional extras"].includes(cat)) {
          if (cat.toLowerCase().includes("bev") || cat.toLowerCase().includes("drink") || cat.toLowerCase().includes("ice")) cat = "Drinks";
          else if (cat.toLowerCase().includes("decor")) cat = "Decorations";
          else if (cat.toLowerCase().includes("table") || cat.toLowerCase().includes("plate") || cat.toLowerCase().includes("napkin")) cat = "Tableware";
          else if (cat.toLowerCase().includes("suppl") || cat.toLowerCase().includes("clean") || cat.toLowerCase().includes("tong")) cat = "Party supplies";
          else if (cat.toLowerCase().includes("opt") || cat.toLowerCase().includes("extra")) cat = "Optional extras";
          else cat = "Food";
        }

        const unit = Number(it.unitPrice) || Number(it.estimatedPrice) || 3.99;
        const est = Number(it.estimatedPrice) || unit;

        return {
          ...it,
          id: it.id || `item-${idx + 1}`,
          category: cat,
          unitPrice: unit,
          estimatedPrice: est,
          isEnabled: true,
          isChecked: false
        };
      });

      const essentialsTotal = planItems
        .filter((i: any) => i.isEssential)
        .reduce((sum: number, i: any) => sum + (Number(i.estimatedPrice) || 0), 0);
      const optionalsTotal = planItems
        .filter((i: any) => !i.isEssential)
        .reduce((sum: number, i: any) => sum + (Number(i.estimatedPrice) || 0), 0);
      const estimatedTotal = Number((essentialsTotal + optionalsTotal).toFixed(2));
      const budget = Number(mergedDetails.budget) || 150;
      const guests = Number(mergedDetails.guestCount) || 12;

      finalShoppingPlan = {
        title: parsed.shoppingPlan.title || `${mergedDetails.theme || "Party"} CymbalMart Shopping Plan`,
        partySummary: mergedDetails,
        items: planItems,
        assumptions: parsed.shoppingPlan.assumptions || [
          `Calculated for ${guests} guests for an estimated 3-hour event.`,
          `Estimated 2 drinks per guest plus party ice.`,
          `Prioritized essential items to fit within $${budget} target budget.`
        ],
        themeHighlights: parsed.shoppingPlan.themeHighlights || [`Themed menu items suited for ${mergedDetails.theme || "celebration"}`],
        dietaryAccommodations: parsed.shoppingPlan.dietaryAccommodations || ["Dietary preferences accommodated"],
        proTips: parsed.shoppingPlan.proTips || ["Check in-store weekly specials at CymbalMart for extra savings!"],
        estimatedTotal,
        essentialsTotal: Number(essentialsTotal.toFixed(2)),
        optionalsTotal: Number(optionalsTotal.toFixed(2)),
        budget,
        remainingBudget: Number((budget - estimatedTotal).toFixed(2)),
        costPerGuest: Number((estimatedTotal / guests).toFixed(2)),
        createdAt: new Date().toISOString()
      };
    } else if (forceGeneratePlan || isRefineRequest) {
      finalShoppingPlan = generateFallbackShoppingPlan(mergedDetails, userMessage);
    }

    res.json({
      replyText: parsed.replyText || "I've updated your party planning specs!",
      stage: parsed.currentStage || "define",
      extractedDetails: mergedDetails,
      missingFields: parsed.missingFields || [],
      quickReplies: parsed.suggestedQuickReplies || (finalShoppingPlan ? ["💰 Reduce the cost", "➕ Add items", "🔄 Replace items", "👥 Change guest count", "🛒 Finalize & Checkout"] : ["15 guests", "$150 budget", "This Saturday", "Tropical Luau"]),
      shoppingPlan: finalShoppingPlan
    });

  } catch (error: any) {
    console.error("Error in /api/chat:", error);
    const fallbackPlan = generateFallbackShoppingPlan(req.body.partyDetails || {});
    res.json({
      replyText: "I've organized your party details and generated a complete CymbalMart shopping plan with estimated quantities and budget breakdowns!",
      stage: "review",
      extractedDetails: req.body.partyDetails || {},
      missingFields: [],
      quickReplies: ["💰 Reduce the cost", "➕ Add items", "🔄 Replace items", "🛒 Finalize & Checkout"],
      shoppingPlan: fallbackPlan
    });
  }
});

// API: Direct Plan Generator / Recalculator
app.post("/api/generate-plan", async (req, res) => {
  try {
    const { partyDetails = {}, customNotes = "" } = req.body;
    const gemini = getGeminiClient();

    if (!gemini) {
      const plan = generateFallbackShoppingPlan(partyDetails, customNotes);
      return res.json({ plan });
    }

    const systemInstruction = `You are the CymbalMart Party Planner Shopping Agent.
Generate a structured, practical, budget-conscious CymbalMart party shopping list matching the customer's party details.
Scale quantities accurately to the guest count. Group by categories. Prioritize essential items ('isEssential': true) over optional items ('isEssential': false).
Include explicit mathematical assumptions, dietary accommodations, and theme elements.
`;

    const response = await gemini.models.generateContent({
      model: "gemini-3.7-flash",
      contents: JSON.stringify({ partyDetails, customNotes }),
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  category: { type: Type.STRING },
                  quantityDescription: { type: Type.STRING },
                  estimatedPrice: { type: Type.NUMBER },
                  unitPrice: { type: Type.NUMBER },
                  isEssential: { type: Type.BOOLEAN },
                  themeRelevance: { type: Type.STRING },
                  dietaryNote: { type: Type.STRING },
                  cymbalMartAisle: { type: Type.STRING },
                  notes: { type: Type.STRING }
                },
                required: ["id", "name", "category", "quantityDescription", "estimatedPrice", "isEssential"]
              }
            },
            assumptions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            themeHighlights: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            dietaryAccommodations: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            proTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["title", "items", "assumptions"]
        }
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    const planItems = (parsed.items || []).map((it: any, idx: number) => ({
      ...it,
      id: it.id || `item-${idx + 1}`,
      isEnabled: true,
      isChecked: false
    }));

    const essentialsTotal = planItems
      .filter((i: any) => i.isEssential)
      .reduce((sum: number, i: any) => sum + (Number(i.estimatedPrice) || 0), 0);
    const optionalsTotal = planItems
      .filter((i: any) => !i.isEssential)
      .reduce((sum: number, i: any) => sum + (Number(i.estimatedPrice) || 0), 0);
    const estimatedTotal = Number((essentialsTotal + optionalsTotal).toFixed(2));
    const budget = Number(partyDetails.budget) || 150;
    const guests = Number(partyDetails.guestCount) || 12;

    const plan = {
      title: parsed.title || `${partyDetails.theme || "Party"} CymbalMart Shopping Plan`,
      partySummary: partyDetails,
      items: planItems,
      assumptions: parsed.assumptions || [`Planned for ${guests} guests.`, `Estimated portions scaled to $${budget} budget.`],
      themeHighlights: parsed.themeHighlights || [`Tailored for ${partyDetails.theme || "celebration"}`],
      dietaryAccommodations: parsed.dietaryAccommodations || ["Dietary preferences accommodated"],
      proTips: parsed.proTips || ["Pick up ice last so it stays frozen on your drive home!"],
      estimatedTotal,
      essentialsTotal: Number(essentialsTotal.toFixed(2)),
      optionalsTotal: Number(optionalsTotal.toFixed(2)),
      budget,
      remainingBudget: Number((budget - estimatedTotal).toFixed(2)),
      costPerGuest: Number((estimatedTotal / guests).toFixed(2)),
      createdAt: new Date().toISOString()
    };

    res.json({ plan });
  } catch (err: any) {
    console.error("Error in /api/generate-plan:", err);
    const fallback = generateFallbackShoppingPlan(req.body.partyDetails || {});
    res.json({ plan: fallback });
  }
});

// Vite & Static Asset Handling
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CymbalMart Party Planner Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
