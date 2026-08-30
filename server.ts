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
  const partyType = details.partyType || "Party";
  const theme = details.theme || "Fun & Festive";
  const dietary = Array.isArray(details.dietaryRestrictions) && details.dietaryRestrictions.length > 0
    ? details.dietaryRestrictions
    : ["None"];
  const isGF = dietary.some((d: string) => d.toLowerCase().includes("gluten"));
  const isVeg = dietary.some((d: string) => d.toLowerCase().includes("veg"));
  const isNutFree = dietary.some((d: string) => d.toLowerCase().includes("nut"));

  const items: any[] = [];
  let idCounter = 1;

  // Mains & Proteins
  if (partyType.toLowerCase().includes("bbq") || theme.toLowerCase().includes("bbq") || theme.toLowerCase().includes("tailgate")) {
    const burgerPacks = Math.ceil(guests / 6);
    items.push({
      id: `item-${idCounter++}`,
      name: "Cymbal Choice Angus Beef Burger Patties (6-ct)",
      category: "Mains & Proteins",
      quantityDescription: `${burgerPacks} packs (${burgerPacks * 6} patties for ${guests} guests)`,
      estimatedPrice: Number((burgerPacks * 11.99).toFixed(2)),
      isEssential: true,
      themeRelevance: `Classic hearty base for ${theme}`,
      dietaryNote: "100% pure beef, gluten-free",
      cymbalMartAisle: "Aisle 1 - Meat & Seafood",
      notes: "Calculated 1.5 burgers per guest"
    });
    if (isVeg) {
      items.push({
        id: `item-${idCounter++}`,
        name: "Cymbal Plant-Based Burger Patties (4-ct)",
        category: "Mains & Proteins",
        quantityDescription: "1 pack (4 patties)",
        estimatedPrice: 6.49,
        isEssential: true,
        themeRelevance: "Vegetarian crowd pleaser",
        dietaryNote: "Certified Vegan & Vegetarian",
        cymbalMartAisle: "Aisle 1 - Plant-Based Cooler",
        notes: "Dedicated meatless option"
      });
    }
    const bunPacks = Math.ceil(guests / 8);
    items.push({
      id: `item-${idCounter++}`,
      name: "Cymbal Bakery Brioche Hamburger Buns (8-ct)",
      category: "Bakery & Deli",
      quantityDescription: `${bunPacks} bags (${bunPacks * 8} buns)`,
      estimatedPrice: Number((bunPacks * 3.49).toFixed(2)),
      isEssential: true,
      themeRelevance: "Golden bakery buns",
      dietaryNote: isGF ? "Contains wheat (see GF option)" : "Vegetarian",
      cymbalMartAisle: "Aisle 3 - Fresh Bakery",
      notes: "Freshly baked daily"
    });
    if (isGF) {
      items.push({
        id: `item-${idCounter++}`,
        name: "Udi's Gluten-Free Hamburger Buns (4-ct)",
        category: "Bakery & Deli",
        quantityDescription: "1 pack (4 buns)",
        estimatedPrice: 5.99,
        isEssential: true,
        themeRelevance: "Dietary inclusive staple",
        dietaryNote: "Certified Gluten-Free",
        cymbalMartAisle: "Aisle 3 - Specialty Bakery",
        notes: "Keeps gluten-sensitive guests covered"
      });
    }
  } else if (partyType.toLowerCase().includes("cocktail") || partyType.toLowerCase().includes("dinner")) {
    items.push({
      id: `item-${idCounter++}`,
      name: "Cymbal Artisan Charcuterie & Cheese Tasting Platter (28 oz)",
      category: "Mains & Proteins",
      quantityDescription: `${Math.ceil(guests / 10)} large boards`,
      estimatedPrice: Number((Math.ceil(guests / 10) * 19.99).toFixed(2)),
      isEssential: true,
      themeRelevance: `Sophisticated display matching ${theme}`,
      dietaryNote: isNutFree ? "Nut-free curated board" : "Includes cured meats & artisan cheeses",
      cymbalMartAisle: "Aisle 2 - Deli & Specialty",
      notes: "Pre-sliced and ready to serve"
    });
  } else {
    // General / Birthday / Game Night
    const pizzaCount = Math.ceil(guests / 3.5);
    items.push({
      id: `item-${idCounter++}`,
      name: "Cymbal Select Wood-Fired Artisan Pizzas (Assorted 3-Cheese & Pepperoni)",
      category: "Mains & Proteins",
      quantityDescription: `${pizzaCount} whole 14\" pizzas`,
      estimatedPrice: Number((pizzaCount * 7.99).toFixed(2)),
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
        category: "Mains & Proteins",
        quantityDescription: "1 pizza",
        estimatedPrice: 8.99,
        isEssential: true,
        themeRelevance: "Dietary friendly main",
        dietaryNote: "Certified Gluten-Free & Vegetarian",
        cymbalMartAisle: "Aisle 4 - Frozen Specialty",
        notes: "Separate allergen-safe serving"
      });
    }
  }

  // Fresh Produce & Sides
  const fruitTrays = Math.ceil(guests / 10);
  items.push({
    id: `item-${idCounter++}`,
    name: "Cymbal Fresh Cut Seasonal Fruit & Berry Party Bowl (3 lbs)",
    category: "Fresh Produce",
    quantityDescription: `${fruitTrays} bowls (${fruitTrays * 3} lbs)`,
    estimatedPrice: Number((fruitTrays * 11.49).toFixed(2)),
    isEssential: true,
    themeRelevance: `Refreshing pops of color matching ${theme}`,
    dietaryNote: "Naturally Gluten-Free, Vegan, Nut-Free",
    cymbalMartAisle: "Aisle 1 - Produce Department",
    notes: "Assorted melon, pineapple, grapes & berries"
  });

  // Snacks & Appetizers
  const chipBags = Math.ceil(guests / 5);
  items.push({
    id: `item-${idCounter++}`,
    name: "Cymbal Crispy Cantina Tortilla Chips (16 oz)",
    category: "Snacks & Appetizers",
    quantityDescription: `${chipBags} party-size bags`,
    estimatedPrice: Number((chipBags * 3.29).toFixed(2)),
    isEssential: true,
    themeRelevance: "Crunchy sharing snack",
    dietaryNote: "Gluten-Free & Vegan",
    cymbalMartAisle: "Aisle 5 - Chips & Snacks",
    notes: "Serve with dips in bowls"
  });
  items.push({
    id: `item-${idCounter++}`,
    name: "Cymbal Fresh Mild Chunky Guacamole & Fire-Roasted Salsa Duo",
    category: "Snacks & Appetizers",
    quantityDescription: `${Math.ceil(guests / 8)} tub packs (32 oz total)`,
    estimatedPrice: Number((Math.ceil(guests / 8) * 6.99).toFixed(2)),
    isEssential: true,
    themeRelevance: "Vibrant dip pairing",
    dietaryNote: "Vegan, Gluten-Free, Nut-Free",
    cymbalMartAisle: "Aisle 1 - Produce Deli",
    notes: "Keep refrigerated until start"
  });

  // Beverages & Bar
  const seltzerPacks = Math.ceil((guests * 2) / 12);
  items.push({
    id: `item-${idCounter++}`,
    name: "Cymbal Sparkling Seltzer Variety Pack (12 x 12 fl oz cans)",
    category: "Beverages & Bar",
    quantityDescription: `${seltzerPacks} twelve-packs (${seltzerPacks * 12} cans total)`,
    estimatedPrice: Number((seltzerPacks * 4.99).toFixed(2)),
    isEssential: true,
    themeRelevance: "Zero-sugar refreshing hydration",
    dietaryNote: "Gluten-Free, Vegan, Zero Calorie",
    cymbalMartAisle: "Aisle 7 - Beverages",
    notes: "Calculated 2 cans per guest"
  });
  items.push({
    id: `item-${idCounter++}`,
    name: "Cymbal All-Natural Lemonade / Fruit Punch (1 Gallon)",
    category: "Beverages & Bar",
    quantityDescription: `${Math.ceil(guests / 8)} gallon jugs`,
    estimatedPrice: Number((Math.ceil(guests / 8) * 3.79).toFixed(2)),
    isEssential: true,
    themeRelevance: `Sweet chilled beverage for ${theme}`,
    dietaryNote: "Dairy-Free, Nut-Free",
    cymbalMartAisle: "Aisle 7 - Chilled Drinks",
    notes: "Great standalone or drink mixer"
  });

  // Ice & Essentials
  const iceBags = Math.max(1, Math.ceil(guests / 8));
  items.push({
    id: `item-${idCounter++}`,
    name: "Cymbal Premium Pure Filtered Party Ice (10 lb bag)",
    category: "Ice & Essentials",
    quantityDescription: `${iceBags} bags (${iceBags * 10} lbs)`,
    estimatedPrice: Number((iceBags * 2.49).toFixed(2)),
    isEssential: true,
    themeRelevance: "Essential for cooler & drink tubs",
    dietaryNote: "Pure water",
    cymbalMartAisle: "Front Entry - Ice Freezers",
    notes: "Keeps drinks chilled for 4-6 hours"
  });

  // Party Supplies & Tableware
  const platePacks = Math.ceil((guests * 1.5) / 30);
  items.push({
    id: `item-${idCounter++}`,
    name: "Cymbal Eco-Friendly Heavy-Duty Compostable Paper Plates (30-ct)",
    category: "Party Supplies & Tableware",
    quantityDescription: `${platePacks} packs (${platePacks * 30} plates)`,
    estimatedPrice: Number((platePacks * 4.49).toFixed(2)),
    isEssential: true,
    themeRelevance: "Sturdy & environmentally responsible",
    dietaryNote: "Food-safe compostable",
    cymbalMartAisle: "Aisle 8 - Paper & Party Supplies",
    notes: "1.5 plates per guest for meal + sweets"
  });
  const napkinPacks = Math.ceil((guests * 2.5) / 50);
  items.push({
    id: `item-${idCounter++}`,
    name: "Cymbal 2-Ply Party Beverage Napkins (50-ct, Theme Accent Colors)",
    category: "Party Supplies & Tableware",
    quantityDescription: `${napkinPacks} packs (${napkinPacks * 50} napkins)`,
    estimatedPrice: Number((napkinPacks * 2.29).toFixed(2)),
    isEssential: true,
    themeRelevance: `Color coordinated for ${theme}`,
    dietaryNote: "General supply",
    cymbalMartAisle: "Aisle 8 - Paper & Party Supplies",
    notes: "2-3 napkins allocated per guest"
  });
  items.push({
    id: `item-${idCounter++}`,
    name: "Cymbal Plant-Based Compostable Cutlery Set (Forks, Spoons, Knives 24-pk)",
    category: "Party Supplies & Tableware",
    quantityDescription: `${Math.ceil(guests / 16)} boxes`,
    estimatedPrice: Number((Math.ceil(guests / 16) * 3.99).toFixed(2)),
    isEssential: true,
    themeRelevance: "Convenient cleanup",
    dietaryNote: "Non-toxic biodegradable",
    cymbalMartAisle: "Aisle 8 - Paper & Party Supplies",
    notes: "Full dining cutlery set"
  });

  // Desserts & Sweets
  const dessertPacks = Math.ceil(guests / 12);
  items.push({
    id: `item-${idCounter++}`,
    name: "Cymbal Bakery Celebration Cupcake Assortment (12-ct Vanilla & Chocolate)",
    category: "Desserts & Sweets",
    quantityDescription: `${dessertPacks} packs (${dessertPacks * 12} cupcakes)`,
    estimatedPrice: Number((dessertPacks * 8.99).toFixed(2)),
    isEssential: true,
    themeRelevance: `Festive centerpiece treat for ${partyType}`,
    dietaryNote: isNutFree ? "Nut-free facility bakery" : "Contains egg, dairy, wheat",
    cymbalMartAisle: "Aisle 3 - Bakery Showcase",
    notes: "1 cupcake per guest"
  });

  // OPTIONAL / NICE-TO-HAVE ITEMS
  items.push({
    id: `item-${idCounter++}`,
    name: `Festive ${theme} Decorative Garland & Table Runner Set`,
    category: "Party Supplies & Tableware",
    quantityDescription: "1 set (10 ft garland + matching runner)",
    estimatedPrice: 7.99,
    isEssential: false,
    themeRelevance: `Elevates room atmosphere with explicit ${theme} styling`,
    dietaryNote: "Decorative item",
    cymbalMartAisle: "Aisle 8 - Party Decorations",
    notes: "Optional: easily toggled off to trim budget"
  });
  items.push({
    id: `item-${idCounter++}`,
    name: "Cymbal Gourmet Dipping Chocolate & Marshmallow Skewer Kit",
    category: "Desserts & Sweets",
    quantityDescription: "1 family fun dessert kit",
    estimatedPrice: 6.49,
    isEssential: false,
    themeRelevance: "Interactive dessert station bonus",
    dietaryNote: "Vegetarian",
    cymbalMartAisle: "Aisle 6 - Confectionery",
    notes: "Optional sweet treat"
  });
  items.push({
    id: `item-${idCounter++}`,
    name: "Decorative Beverage Tub & Clear Acrylic Ice Scoop",
    category: "Party Supplies & Tableware",
    quantityDescription: "1 large insulated party tub",
    estimatedPrice: 9.99,
    isEssential: false,
    themeRelevance: "Keeps canned drinks easily accessible",
    dietaryNote: "Reusable tableware",
    cymbalMartAisle: "Aisle 8 - Seasonal & Housewares",
    notes: "Optional: reuse for future parties"
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
      `Drink allocation: calculated ~2 to 3 non-alcoholic / seltzer beverages per guest plus ice chilling.`,
      `Food portions: budgeted 1.5 main portions per person plus abundant fresh fruit, chips, and dips.`,
      `Tableware ratios: included 1.5 heavy-duty plates and 2.5 napkins per guest to comfortably cover dinner and dessert.`,
      dietary.includes("Gluten-Free") ? "Dietary: allocated dedicated gluten-free packaged substitutes to prevent cross-contact." : "Standard variety balanced across savory, sweet, and hydration.",
      `Budget management: current total is $${estimatedTotal} against your $${budget} target (${remainingBudget >= 0 ? `$${remainingBudget} surplus remaining` : `$${Math.abs(remainingBudget)} slightly above budget (toggle optional items to save $${optionalsTotal.toFixed(2)})`}).`
    ],
    themeHighlights: [
      `Decor & tableware aligned with the "${theme}" visual palette and mood.`,
      `Curated snack assortment that matches a relaxed, high-energy ${partyType} style.`,
      `Signature color-accented napkins and celebratory dessert showcase.`
    ],
    dietaryAccommodations: isGF || isVeg || isNutFree
      ? [
          isGF ? "Included certified Gluten-Free buns / pizza and naturally GF fruit & dips." : null,
          isVeg ? "Dedicated plant-based protein entrees and vegetarian snack boards." : null,
          isNutFree ? "Nut-safe bakery cupcakes and allergen-labeled snacks." : null,
        ].filter(Boolean) as string[]
      : ["All items are standard supermarket favorites with clear ingredient labeling on packages."],
    proTips: [
      "Chill beverages in the refrigerator the night before so the party ice lasts twice as long in coolers.",
      "Pre-wash and skewer fruit bowls 2 hours prior to guest arrival for easy grab-and-go snacking.",
      "Place paper plates & napkins at both ends of the buffet line to prevent guest bottlenecks."
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

// API: Check Health
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "CymbalMart Party Planner Agent" });
});

// API: Conversational Agent Endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { messages = [], partyDetails = {}, userMessage = "", forceGeneratePlan = false } = req.body;

    const gemini = getGeminiClient();

    // Check missing critical fields
    const missing: string[] = [];
    if (!partyDetails.partyType) missing.push("partyType");
    if (!partyDetails.guestCount) missing.push("guestCount");
    if (!partyDetails.budget) missing.push("budget");
    if (!partyDetails.theme) missing.push("theme");
    if (!partyDetails.date) missing.push("date");
    if (!partyDetails.dietaryRestrictions || partyDetails.dietaryRestrictions.length === 0) missing.push("dietaryRestrictions");

    // If Gemini is not available, execute smart local logic
    if (!gemini) {
      console.log("Using smart local fallback agent logic (No GEMINI_API_KEY set)");

      // Extract details from message if user spoke
      const text = userMessage.toLowerCase();
      const updatedDetails = { ...partyDetails };

      if (text.match(/(\d+)\s*(guests?|people|kids|adults|friends)/i)) {
        const match = text.match(/(\d+)\s*(guests?|people|kids|adults|friends)/i);
        if (match) updatedDetails.guestCount = parseInt(match[1], 10);
      }
      if (text.match(/\$(\d+)/) || text.match(/budget.*?(\d+)/i) || text.match(/(\d+)\s*dollars/i)) {
        const match = text.match(/\$(\d+)/) || text.match(/budget.*?(\d+)/i) || text.match(/(\d+)\s*dollars/i);
        if (match) updatedDetails.budget = parseInt(match[1], 10);
      }
      if (text.includes("bbq") || text.includes("barbecue")) updatedDetails.partyType = "Backyard BBQ";
      else if (text.includes("birthday")) updatedDetails.partyType = "Birthday Party";
      else if (text.includes("cocktail")) updatedDetails.partyType = "Cocktail Party";
      else if (text.includes("game night")) updatedDetails.partyType = "Game Night";
      else if (text.includes("graduation")) updatedDetails.partyType = "Graduation Party";
      else if (text.includes("dinner")) updatedDetails.partyType = "Dinner Party";

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
      if (text.includes("no dietary") || text.includes("none") || text.includes("no restrictions") || text.includes("no allergies")) {
        updatedDetails.dietaryRestrictions = ["None"];
      }

      if (text.includes("saturday") || text.includes("sunday") || text.includes("this weekend") || text.includes("next week") || text.includes("tomorrow")) {
        updatedDetails.date = userMessage;
      }

      // Check remaining missing fields
      const currentMissing: string[] = [];
      if (!updatedDetails.partyType) currentMissing.push("partyType");
      if (!updatedDetails.guestCount) currentMissing.push("guestCount");
      if (!updatedDetails.budget) currentMissing.push("budget");
      if (!updatedDetails.theme) currentMissing.push("theme");
      if (!updatedDetails.date) currentMissing.push("date");
      if (!updatedDetails.dietaryRestrictions || updatedDetails.dietaryRestrictions.length === 0) currentMissing.push("dietaryRestrictions");

      // Decide if we should generate the plan
      const shouldGenerate = forceGeneratePlan || (currentMissing.length === 0) || (currentMissing.length <= 1 && (updatedDetails.guestCount && updatedDetails.budget));

      if (shouldGenerate) {
        const plan = generateFallbackShoppingPlan(updatedDetails, userMessage);
        return res.json({
          replyText: `🎉 Fantastic! I've crafted your tailored CymbalMart party shopping plan for **${updatedDetails.guestCount || 12} guests** with your **$${updatedDetails.budget || 150} budget**.\n\nI've categorized all grocery and party supply items, calculated realistic quantities per person, separated essential vs. optional items for flexible budget control, and highlighted all assumptions below!`,
          extractedDetails: updatedDetails,
          missingFields: [],
          shoppingPlan: plan,
          quickReplies: ["Looks great! Show in-store aisle mode", "Make it more budget-friendly", "Add extra snacks", "Add cocktail mixer ideas"]
        });
      } else {
        // Formulate friendly conversational clarification
        let reply = "I'd love to help you build the perfect CymbalMart party shopping list! ";
        let quickReplies: string[] = [];

        if (!updatedDetails.partyType) {
          reply += "What type of party are you hosting?";
          quickReplies = ["Birthday Bash", "Backyard BBQ", "Cocktail Party", "Game Night", "Kids Birthday", "Graduation"];
        } else if (!updatedDetails.guestCount) {
          reply += `Exciting! For your ${updatedDetails.partyType}, how many guests are you expecting?`;
          quickReplies = ["8-10 guests", "15 guests", "20-25 guests", "35+ guests"];
        } else if (!updatedDetails.budget) {
          reply += `Got it, ${updatedDetails.guestCount} guests for the ${updatedDetails.partyType}. What is your approximate target budget?`;
          quickReplies = ["$100 (Budget Saver)", "$150 (Standard)", "$250 (Party Plus)", "$400 (Deluxe)"];
        } else if (!updatedDetails.theme) {
          reply += `We can match all party supplies and specialty foods to a theme. Do you have a specific theme or vibe in mind?`;
          quickReplies = ["Tropical Luau", "Retro Disco", "Fiesta Taco Bar", "Casual & Modern", "Superhero", "Tailgate / Game Day"];
        } else if (!updatedDetails.dietaryRestrictions || updatedDetails.dietaryRestrictions.length === 0) {
          reply += `Are there any dietary restrictions or food allergies among your guests (e.g. Gluten-Free, Vegan, Nut-free)?`;
          quickReplies = ["No restrictions (All Good)", "Gluten-Free", "Vegetarian", "Vegan", "Nut Allergy", "Dairy-Free"];
        } else if (!updatedDetails.date) {
          reply += `When is the party taking place? (e.g. This Saturday, Next Weekend, or a specific date)`;
          quickReplies = ["This Saturday", "This Sunday", "Next Weekend", "In 2 Weeks"];
        }

        return res.json({
          replyText: reply,
          extractedDetails: updatedDetails,
          missingFields: currentMissing,
          shoppingPlan: null,
          quickReplies
        });
      }
    }

    // Use Gemini 3.7 Flash
    const systemInstruction = `You are the CymbalMart Party Planner Shopping Agent.
CymbalMart is a friendly, modern, high-quality neighborhood supermarket with fresh produce, full butcher deli, bakery, party supplies, and beverage sections.

Your job is to assist busy customers plan parties and create practical, budget-conscious grocery and party shopping lists based on:
1. Party type (e.g., Birthday, Backyard BBQ, Game Night, Cocktail Party, Graduation, Dinner Party, Kids Birthday, Housewarming, etc.)
2. Number of guests (integer)
3. Date (e.g., "This Saturday", "Oct 12")
4. Theme (e.g., Tropical Luau, Retro Disco, Fiesta Taco Bar, Superhero, Elegant Gold & White, Tailgate)
5. Budget (in USD, e.g., $150)
6. Dietary restrictions (e.g., Gluten-Free, Vegan, Vegetarian, Nut Allergy, Dairy-Free, None)
7. Special requests (e.g., signature mocktail/cocktail recipe, eco-friendly compostable supplies, extra ice, kid-friendly games)

RULES:
- Keep interactions simple, warm, helpful, and conversational.
- Identify missing information. If crucial information (especially party type, guest count, budget, theme, dietary restrictions) is missing, politely and concisely ask for it in 'replyText' and include 'suggestedQuickReplies' to make it effortless for the customer.
- When sufficient information is available OR if the user asks to generate the shopping list, generate a complete, practical 'shoppingPlan' matching the schema.
- The shopping list MUST:
  * Group items into realistic supermarket categories: "Mains & Proteins", "Fresh Produce", "Bakery & Deli", "Beverages & Bar", "Snacks & Appetizers", "Party Supplies & Tableware", "Desserts & Sweets", "Ice & Essentials".
  * Recommend quantities scaled precisely to the guest count (e.g., "3 packs (24 patties total for 15 guests)", "2 bags (10 lbs each)").
  * Incorporate the party theme into appropriate food, drinks, and tableware items.
  * Stay strictly within or respect the user's budget (providing estimated realistic item prices).
  * Clearly prioritize essential items ('isEssential': true for main food, core drinks, basic plates/napkins) over optional items ('isEssential': false for decorative banners, specialty cocktail garnishes, extra novelty sweets).
  * Provide estimated item prices (USD) and calculate totals.
  * Include clear, realistic ASSUMPTIONS (e.g., portion sizes per guest, 2-3 drinks per person over 3 hours, 1.5 paper plates per person, ice calculations).
  * Include dietary accommodations specifically tailored to any stated allergies or restrictions.
  * Assign realistic CymbalMart aisle locations (e.g., "Aisle 1 - Fresh Produce", "Aisle 8 - Paper & Party Supplies", "Aisle 7 - Beverages").
`;

    const promptContext = {
      conversationHistory: messages.slice(-8),
      currentPartyDetails: partyDetails,
      latestUserMessage: userMessage,
      forceGeneratePlan
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
              description: "Warm, conversational response to the customer."
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
              },
              description: "Updated cumulative party details extracted from context."
            },
            missingFields: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of fields still missing or needed."
            },
            suggestedQuickReplies: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3-5 concise button reply chips for the user to tap."
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
                  items: { type: Type.STRING },
                  description: "Explicit bullet points explaining planning math and assumptions."
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
          required: ["replyText", "extractedDetails"]
        }
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    const mergedDetails = { ...partyDetails, ...(parsed.extractedDetails || {}) };

    let finalShoppingPlan = null;
    if (parsed.shoppingPlan && parsed.shoppingPlan.items && parsed.shoppingPlan.items.length > 0) {
      const planItems = parsed.shoppingPlan.items.map((it: any, idx: number) => ({
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
      const budget = Number(mergedDetails.budget) || 150;
      const guests = Number(mergedDetails.guestCount) || 12;

      finalShoppingPlan = {
        title: parsed.shoppingPlan.title || `${mergedDetails.theme || "Party"} Shopping Plan`,
        partySummary: mergedDetails,
        items: planItems,
        assumptions: parsed.shoppingPlan.assumptions || [
          `Calculated for ${guests} guests.`,
          `Estimated 2 drinks per guest.`,
          `Prioritized essential items to fit within $${budget} budget.`
        ],
        themeHighlights: parsed.shoppingPlan.themeHighlights || [`Themed menu items suited for ${mergedDetails.theme || "celebration"}`],
        dietaryAccommodations: parsed.shoppingPlan.dietaryAccommodations || ["Dietary preferences considered"],
        proTips: parsed.shoppingPlan.proTips || ["Check in-store weekly specials at CymbalMart for extra savings!"],
        estimatedTotal,
        essentialsTotal: Number(essentialsTotal.toFixed(2)),
        optionalsTotal: Number(optionalsTotal.toFixed(2)),
        budget,
        remainingBudget: Number((budget - estimatedTotal).toFixed(2)),
        costPerGuest: Number((estimatedTotal / guests).toFixed(2)),
        createdAt: new Date().toISOString()
      };
    } else if (forceGeneratePlan) {
      finalShoppingPlan = generateFallbackShoppingPlan(mergedDetails, userMessage);
    }

    res.json({
      replyText: parsed.replyText || "Here is your party plan!",
      extractedDetails: mergedDetails,
      missingFields: parsed.missingFields || [],
      quickReplies: parsed.suggestedQuickReplies || ["Looks great!", "Adjust budget", "Add more drinks", "Review items"],
      shoppingPlan: finalShoppingPlan
    });

  } catch (error: any) {
    console.error("Error in /api/chat:", error);
    // Graceful fallback so user never gets stuck
    const fallbackPlan = generateFallbackShoppingPlan(req.body.partyDetails || {});
    res.json({
      replyText: "I've organized your party details and generated a complete CymbalMart shopping plan with estimated quantities and budget breakdowns!",
      extractedDetails: req.body.partyDetails || {},
      missingFields: [],
      quickReplies: ["Review shopping list", "Modify items", "Adjust budget"],
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
