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

  const promptText = ((userPrompt || "") + " " + partyType + " " + theme).toLowerCase();
  
  // Specific Party Archetype detection
  const isKidsParty = partyType.toLowerCase().includes("child") || 
                      partyType.toLowerCase().includes("kid") || 
                      promptText.includes("child") || 
                      promptText.includes("kid") || 
                      promptText.includes("superhero");

  const isSuperheroTheme = promptText.includes("superhero") || 
                           promptText.includes("comic") || 
                           promptText.includes("avenger") || 
                           promptText.includes("hero");

  const isCorporateEvent = partyType.toLowerCase().includes("corporate") || 
                           partyType.toLowerCase().includes("team") || 
                           partyType.toLowerCase().includes("office") || 
                           partyType.toLowerCase().includes("workplace") || 
                           promptText.includes("corporate") || 
                           promptText.includes("team building") || 
                           promptText.includes("team-building");

  const isBBQ = partyType.toLowerCase().includes("bbq") || theme.toLowerCase().includes("bbq") || theme.toLowerCase().includes("cookout");
  const isCocktail = partyType.toLowerCase().includes("cocktail") || partyType.toLowerCase().includes("tapas") || partyType.toLowerCase().includes("soiree");

  const items: any[] = [];
  let idCounter = 1;

  // ==========================================
  // CASE 1: CHILDREN'S BIRTHDAY PARTY (AGE-APPROPRIATE & CHILD-SAFE)
  // ==========================================
  if (isKidsParty) {
    // 1. Food (Child-friendly, no sharp items, kid portions)
    const pizzaPacks = Math.ceil(guests / 4);
    const pizzaPrice = 8.49;
    items.push({
      id: `item-${idCounter++}`,
      name: isSuperheroTheme 
        ? "Cymbal Kids 'Power Slice' Mini Pepperoni & Cheese Pizzas (24-ct)" 
        : "Cymbal Kids Bite-Sized Mini Pizza Rolls & Slices (24-ct)",
      category: "Food",
      quantityDescription: `${pizzaPacks} party boxes (${pizzaPacks * 24} bite slices for ${guests} kids)`,
      unitPrice: pizzaPrice,
      estimatedPrice: Number((pizzaPacks * pizzaPrice).toFixed(2)),
      isEssential: true,
      themeRelevance: isSuperheroTheme ? "Hero fuel main dish for kids" : `Child-friendly main dish for ${theme}`,
      dietaryNote: isGF ? "Contains wheat (see GF tenders)" : "Kid-tested crowd pleaser",
      cymbalMartAisle: "Aisle 4 - Frozen Specialty",
      notes: "Calculated 3-4 bite-sized slices per child"
    });

    const tenderPacks = Math.ceil(guests / 6);
    const tenderPrice = 9.99;
    items.push({
      id: `item-${idCounter++}`,
      name: "Cymbal All-Natural Crispy Baked Chicken Breast Tenders (32 oz)",
      category: "Food",
      quantityDescription: `${tenderPacks} family-size bags (${tenderPacks * 32} oz)`,
      unitPrice: tenderPrice,
      estimatedPrice: Number((tenderPacks * tenderPrice).toFixed(2)),
      isEssential: true,
      themeRelevance: "Safe finger-friendly protein for children",
      dietaryNote: "100% white meat, no artificial preservatives",
      cymbalMartAisle: "Aisle 4 - Frozen Poultry",
      notes: "Pre-cooked & oven-baked finger food"
    });

    // Fresh seedless cut fruit wands / bowl (child-safe, no sharp skewers)
    const fruitBowls = Math.ceil(guests / 8);
    const fruitPrice = 8.99;
    items.push({
      id: `item-${idCounter++}`,
      name: "Cymbal Fresh Cut Seedless Melon, Strawberry & Grape Kids Bowl (3 lbs)",
      category: "Food",
      quantityDescription: `${fruitBowls} party bowls (${fruitBowls * 3} lbs)`,
      unitPrice: fruitPrice,
      estimatedPrice: Number((fruitBowls * fruitPrice).toFixed(2)),
      isEssential: true,
      themeRelevance: "Sweet, refreshing, child-safe vitamin snack",
      dietaryNote: "Naturally Gluten-Free, Vegan, 100% Nut-Free",
      cymbalMartAisle: "Aisle 1 - Produce Department",
      notes: "Seedless & bite-sized cut fruit for kids"
    });

    // Kids Celebration Cupcakes (Nut-free bakery)
    const cupcakePacks = Math.ceil(guests / 12);
    const cupcakePrice = 9.49;
    items.push({
      id: `item-${idCounter++}`,
      name: isSuperheroTheme
        ? "Cymbal Bakery Superhero Comic Cupcakes with Action Shield Toppers (12-ct)"
        : "Cymbal Bakery Colorful Kids Birthday Cupcakes with Rainbow Sprinkles (12-ct)",
      category: "Food",
      quantityDescription: `${cupcakePacks} bakery packs (${cupcakePacks * 12} cupcakes)`,
      unitPrice: cupcakePrice,
      estimatedPrice: Number((cupcakePacks * cupcakePrice).toFixed(2)),
      isEssential: true,
      themeRelevance: isSuperheroTheme ? "Superhero comic emblem birthday treat" : `Birthday celebration centerpiece for ${guests} kids`,
      dietaryNote: isNutFree ? "Made in a dedicated 100% nut-free bakery facility" : "Contains dairy, wheat, eggs",
      cymbalMartAisle: "Aisle 3 - Bakery Showcase",
      notes: "1 cupcake per child guest"
    });

    // Kid-friendly sharing snack (Animal crackers / Fruit snacks)
    const snackPacks = Math.ceil(guests / 7);
    const snackPrice = 4.29;
    items.push({
      id: `item-${idCounter++}`,
      name: "Cymbal Organic Mini Animal Crackers & Real Fruit Snacks Duo (18 pouches)",
      category: "Food",
      quantityDescription: `${snackPacks} variety boxes (${snackPacks * 18} individual pouches)`,
      unitPrice: snackPrice,
      estimatedPrice: Number((snackPacks * snackPrice).toFixed(2)),
      isEssential: false,
      themeRelevance: "Grab-and-go snack for active play",
      dietaryNote: "Peanut-Free, 100% Real Fruit Juice",
      cymbalMartAisle: "Aisle 5 - Kids Snacks",
      notes: "Individual no-mess pouches"
    });

    // 2. Drinks (Child-friendly, spill-proof, non-alcoholic)
    const juicePacks = Math.ceil((guests * 1.5) / 10);
    const juicePrice = 3.99;
    items.push({
      id: `item-${idCounter++}`,
      name: isSuperheroTheme
        ? "Cymbal 'Super Power Berry' 100% Fruit Juice Pouches with Straws (10-pk)"
        : "Cymbal 100% All-Natural Apple & Berry Kids Juice Pouches (10-pk)",
      category: "Drinks",
      quantityDescription: `${juicePacks} ten-packs (${juicePacks * 10} pouches total)`,
      unitPrice: juicePrice,
      estimatedPrice: Number((juicePacks * juicePrice).toFixed(2)),
      isEssential: true,
      themeRelevance: isSuperheroTheme ? "Hero energy hydration pouch" : "Spill-proof kids hydration",
      dietaryNote: "100% Juice, No Added Sugar, Gluten-Free",
      cymbalMartAisle: "Aisle 7 - Kids Beverages",
      notes: "1.5 pouches per child"
    });

    const waterPacks = Math.ceil(guests / 12);
    const waterPrice = 4.49;
    items.push({
      id: `item-${idCounter++}`,
      name: "Cymbal Mini 8 oz Pure Spring Water Kid Bottles (24-pk)",
      category: "Drinks",
      quantityDescription: `${waterPacks} cases (${waterPacks * 24} mini bottles)`,
      unitPrice: waterPrice,
      estimatedPrice: Number((waterPacks * waterPrice).toFixed(2)),
      isEssential: true,
      themeRelevance: "Easy-grip mini bottles for kids",
      dietaryNote: "Pure spring water",
      cymbalMartAisle: "Aisle 7 - Bottled Water",
      notes: "Zero spill mini bottles"
    });

    const iceBags = Math.max(1, Math.ceil(guests / 12));
    const icePrice = 2.49;
    items.push({
      id: `item-${idCounter++}`,
      name: "Cymbal Filtered Party Ice (10 lb bag)",
      category: "Drinks",
      quantityDescription: `${iceBags} bag (${iceBags * 10} lbs)`,
      unitPrice: icePrice,
      estimatedPrice: Number((iceBags * icePrice).toFixed(2)),
      isEssential: true,
      themeRelevance: "Drink tub and beverage chilling",
      dietaryNote: "Pure filtered ice",
      cymbalMartAisle: "Front Entry - Ice Freezers",
      notes: "Keeps juice and water cold"
    });

    // 3. Decorations (Bright, joyful, child-safe)
    items.push({
      id: `item-${idCounter++}`,
      name: isSuperheroTheme
        ? "Superhero Action Hero 'POW! BAM! BOOM!' Comic Banner & Photo Backdrop Kit"
        : "Vibrant 'Happy Birthday' Child-Safe Multicolor Banner & Hanging Streamers Kit",
      category: "Decorations",
      quantityDescription: "1 complete backdrop kit",
      unitPrice: 6.99,
      estimatedPrice: 6.99,
      isEssential: true,
      themeRelevance: isSuperheroTheme ? "Vibrant comic book superhero photo scene" : `Festive birthday party backdrop for ${theme}`,
      dietaryNote: "Non-food decorative",
      cymbalMartAisle: "Aisle 8 - Party Decorations",
      notes: "Pre-assembled and easy to hang with child-safe tape"
    });

    items.push({
      id: `item-${idCounter++}`,
      name: isSuperheroTheme
        ? "Superhero Bold Primary Color Balloon Garland Kit with Comic Cutouts (30-ct)"
        : "Pastel & Primary Color Balloon Arch Kit (30 assorted latex balloons)",
      category: "Decorations",
      quantityDescription: "1 kit (30 balloons + arch strip)",
      unitPrice: 7.99,
      estimatedPrice: 7.99,
      isEssential: false,
      themeRelevance: "Eye-catching party entrance garland",
      dietaryNote: "Non-toxic latex",
      cymbalMartAisle: "Aisle 8 - Balloons & Party",
      notes: "Includes balloon tape and manual pump"
    });

    // 4. Tableware (Child-safe, spill-resistant, paper tableware)
    const platePacks = Math.ceil((guests * 1.5) / 24);
    const platePrice = 4.29;
    items.push({
      id: `item-${idCounter++}`,
      name: isSuperheroTheme
        ? "Superhero Action Emblem Heavy-Duty Paper Party Plates 9\" (24-ct)"
        : "Cymbal Colorful Spill-Proof Heavy-Duty Kids Paper Plates 9\" (24-ct)",
      category: "Tableware",
      quantityDescription: `${platePacks} packs (${platePacks * 24} plates)`,
      unitPrice: platePrice,
      estimatedPrice: Number((platePacks * platePrice).toFixed(2)),
      isEssential: true,
      themeRelevance: isSuperheroTheme ? "Superhero comic emblem meal plates" : "Mess-free sturdy paper plates",
      dietaryNote: "Food-safe compostable paper",
      cymbalMartAisle: "Aisle 8 - Paper & Party Supplies",
      notes: "1.5 plates per child for pizza & cupcakes"
    });

    const napkinPacks = Math.ceil((guests * 3) / 50);
    const napkinPrice = 2.49;
    items.push({
      id: `item-${idCounter++}`,
      name: isSuperheroTheme
        ? "Superhero 'Hero Squad' 2-Ply Lunch Napkins (50-ct)"
        : "Cymbal 2-Ply Vibrant Kids Party Napkins (50-ct)",
      category: "Tableware",
      quantityDescription: `${napkinPacks} packs (${napkinPacks * 50} napkins)`,
      unitPrice: napkinPrice,
      estimatedPrice: Number((napkinPacks * napkinPrice).toFixed(2)),
      isEssential: true,
      themeRelevance: "High-absorbency for sticky kid hands",
      dietaryNote: "General paper supply",
      cymbalMartAisle: "Aisle 8 - Paper & Party Supplies",
      notes: "Budgeted 3 napkins per child"
    });

    const cupPacks = Math.ceil(guests / 20);
    const cupPrice = 3.29;
    items.push({
      id: `item-${idCounter++}`,
      name: "Cymbal Child-Friendly Recyclable Paper Beverage Cups 9 oz (20-ct)",
      category: "Tableware",
      quantityDescription: `${cupPacks} packs (${cupPacks * 20} cups)`,
      unitPrice: cupPrice,
      estimatedPrice: Number((cupPacks * cupPrice).toFixed(2)),
      isEssential: true,
      themeRelevance: "Sized perfectly for little hands",
      dietaryNote: "BPA-Free, compostable",
      cymbalMartAisle: "Aisle 8 - Paper & Party Supplies",
      notes: "Sturdy non-slip paper cups"
    });

    const cutleryPacks = Math.ceil(guests / 24);
    const cutleryPrice = 2.99;
    items.push({
      id: `item-${idCounter++}`,
      name: "Cymbal Rounded-Edge Plant-Based Kids Cutlery Set (24-ct Forks & Spoons)",
      category: "Tableware",
      quantityDescription: `${cutleryPacks} pack (24 utensils)`,
      unitPrice: cutleryPrice,
      estimatedPrice: Number((cutleryPacks * cutleryPrice).toFixed(2)),
      isEssential: true,
      themeRelevance: "Child-safe rounded tips for cake & meals",
      dietaryNote: "Non-toxic biodegradable",
      cymbalMartAisle: "Aisle 8 - Paper & Party Supplies",
      notes: "Smooth rounded tines for child safety"
    });

    // 5. Party Supplies (Child safety, sticky fingers, favors)
    items.push({
      id: `item-${idCounter++}`,
      name: "Cymbal Gentle Hand & Face Wet Wipes for Sticky Fingers (2-pack, 120 wipes)",
      category: "Party supplies",
      quantityDescription: "1 double-pack (120 hypoallergenic wipes)",
      unitPrice: 3.49,
      estimatedPrice: 3.49,
      isEssential: true,
      themeRelevance: "Essential post-cake & pizza cleanup for kids",
      dietaryNote: "Fragrance-free, hypoallergenic",
      cymbalMartAisle: "Aisle 8 - Cleaning & Baby Care",
      notes: "Keep on table for instant mess cleanup"
    });

    items.push({
      id: `item-${idCounter++}`,
      name: "Cymbal Child-Safe Plastic Birthday Cake Knife & Server Duo",
      category: "Party supplies",
      quantityDescription: "1 set (serrated plastic knife + cake spatula)",
      unitPrice: 2.99,
      estimatedPrice: 2.99,
      isEssential: true,
      themeRelevance: "Safe cake cutting with no metal blades",
      dietaryNote: "BPA-Free food grade plastic",
      cymbalMartAisle: "Aisle 8 - Party Supplies",
      notes: "Child-safe plastic cutting edge"
    });

    if (isSuperheroTheme) {
      const favorPacks = Math.ceil(guests / 12);
      const favorPrice = 11.99;
      items.push({
        id: `item-${idCounter++}`,
        name: "Superhero Satin Cape & Felt Mask Party Favor Set (12-ct)",
        category: "Party supplies",
        quantityDescription: `${favorPacks} sets (${favorPacks * 12} capes & masks)`,
        unitPrice: favorPrice,
        estimatedPrice: Number((favorPacks * favorPrice).toFixed(2)),
        isEssential: true,
        themeRelevance: "Immersive superhero transformation favor for every guest",
        dietaryNote: "Non-toxic fabric with child-safe velcro",
        cymbalMartAisle: "Aisle 8 - Party Favors",
        notes: "1 cape and mask for each child"
      });
    } else {
      const favorPacks = Math.ceil(guests / 12);
      const favorPrice = 7.99;
      items.push({
        id: `item-${idCounter++}`,
        name: "Kids Party Goodie Favor Bags with Fun Stickers & Activity Pencils (12-ct)",
        category: "Party supplies",
        quantityDescription: `${favorPacks} pack (${favorPacks * 12} favor bags)`,
        unitPrice: favorPrice,
        estimatedPrice: Number((favorPacks * favorPrice).toFixed(2)),
        isEssential: true,
        themeRelevance: "Take-home favor bags for party guests",
        dietaryNote: "Non-candy child favor kit",
        cymbalMartAisle: "Aisle 8 - Party Favors",
        notes: "Child-friendly activity favors"
      });
    }

    items.push({
      id: `item-${idCounter++}`,
      name: "Cymbal Clean-Up Drawstring Party Trash Bags (13 Gallon, 15-ct)",
      category: "Party supplies",
      quantityDescription: "1 box (15 bags)",
      unitPrice: 3.29,
      estimatedPrice: 3.29,
      isEssential: true,
      themeRelevance: "Fast post-party cleanup",
      dietaryNote: "Recycled plastic",
      cymbalMartAisle: "Aisle 8 - Cleaning & Trash",
      notes: "Place near activity stations"
    });

    // 6. Optional extras
    items.push({
      id: `item-${idCounter++}`,
      name: isSuperheroTheme
        ? "Superhero Photo Booth Action Prop Kit (Comic Words & Mask Cutouts)"
        : "Kids DIY Cupcake Sprinkle & Cookie Decorating Station Kit",
      category: "Optional extras",
      quantityDescription: "1 interactive activity kit",
      unitPrice: 5.99,
      estimatedPrice: 5.99,
      isEssential: false,
      themeRelevance: "Fun interactive photo station for children",
      dietaryNote: "Child-safe cardboard",
      cymbalMartAisle: "Aisle 8 - Party Games & Activities",
      notes: "Optional: easily toggled to adjust budget"
    });

  // ==========================================
  // CASE 2: CORPORATE TEAM BUILDING EVENT (PROFESSIONAL WORKPLACE ENVIRONMENT)
  // ==========================================
  } else if (isCorporateEvent) {
    // 1. Food (Gourmet catering platters, professional presentation, dietary inclusive)
    const wrapPlatters = Math.ceil(guests / 8);
    const wrapPrice = 28.99;
    items.push({
      id: `item-${idCounter++}`,
      name: "Cymbal Executive Gourmet Artisan Wrap & Sandwich Platter (16 Assorted Halves)",
      category: "Food",
      quantityDescription: `${wrapPlatters} catering platters (${wrapPlatters * 16} wrap halves for ${guests} attendees)`,
      unitPrice: wrapPrice,
      estimatedPrice: Number((wrapPlatters * wrapPrice).toFixed(2)),
      isEssential: true,
      themeRelevance: "Professional lunch entree with Roast Turkey Avocado, Smoked Beef Cheddar, and Grilled Veggie Hummus",
      dietaryNote: "Individually wrapped halves; includes vegetarian and gluten-friendly labeled options",
      cymbalMartAisle: "Aisle 2 - Deli Catering Department",
      notes: "Calculated ~1.5 wrap halves per attendee"
    });

    const cheeseFruitBoards = Math.ceil(guests / 10);
    const cheesePrice = 19.99;
    items.push({
      id: `item-${idCounter++}`,
      name: "Cymbal Deluxe Artisan Cheese, Dried Fig & Glazed Pecan Tasting Board (32 oz)",
      category: "Food",
      quantityDescription: `${cheeseFruitBoards} presentation boards`,
      unitPrice: cheesePrice,
      estimatedPrice: Number((cheeseFruitBoards * cheesePrice).toFixed(2)),
      isEssential: true,
      themeRelevance: "Upscale grazing board for workshop breaks",
      dietaryNote: isNutFree ? "Nut-free curated board (dried fruits & gourmet cheeses)" : "Vegetarian friendly",
      cymbalMartAisle: "Aisle 2 - Specialty Cheese & Deli",
      notes: "Aged Gouda, Brie, Sharp Cheddar, grapes & crackers"
    });

    const fruitPlatters = Math.ceil(guests / 12);
    const fruitPrice = 12.49;
    items.push({
      id: `item-${idCounter++}`,
      name: "Cymbal Fresh Cut Crisp Seasonal Fruit & Berry Catering Platter (4 lbs)",
      category: "Food",
      quantityDescription: `${fruitPlatters} platters (${fruitPlatters * 4} lbs)`,
      unitPrice: fruitPrice,
      estimatedPrice: Number((fruitPlatters * fruitPrice).toFixed(2)),
      isEssential: true,
      themeRelevance: "Fresh, healthy brain-fuel hydration",
      dietaryNote: "100% Vegan, Gluten-Free, Nut-Free",
      cymbalMartAisle: "Aisle 1 - Produce Catering",
      notes: "Pineapple, melon, berries & fresh mint"
    });

    const trailMixPacks = Math.ceil(guests / 6);
    const trailMixPrice = 6.49;
    items.push({
      id: `item-${idCounter++}`,
      name: "Cymbal Individual Brain-Fuel Energy Trail Mix & Nut Packs (6-pk)",
      category: "Food",
      quantityDescription: `${trailMixPacks} multi-packs (${trailMixPacks * 6} individual packs)`,
      unitPrice: trailMixPrice,
      estimatedPrice: Number((trailMixPacks * trailMixPrice).toFixed(2)),
      isEssential: false,
      themeRelevance: "Mid-afternoon focus snack for workshop breakout tables",
      dietaryNote: "Gluten-Free, Plant-Protein",
      cymbalMartAisle: "Aisle 5 - Healthy Snacks",
      notes: "No-mess individual attendee packs"
    });

    const pastryBoxes = Math.ceil(guests / 12);
    const pastryPrice = 11.99;
    items.push({
      id: `item-${idCounter++}`,
      name: "Cymbal Bakery Executive French Macarons & Gourmet Cookie Board (18-ct)",
      category: "Food",
      quantityDescription: `${pastryBoxes} display boxes (${pastryBoxes * 18} gourmet sweets)`,
      unitPrice: pastryPrice,
      estimatedPrice: Number((pastryBoxes * pastryPrice).toFixed(2)),
      isEssential: true,
      themeRelevance: "Sophisticated afternoon sweet accompaniment",
      dietaryNote: "Artisan bakery recipe (contains almond flour, dairy, egg)",
      cymbalMartAisle: "Aisle 3 - Bakery Showcase",
      notes: "1.5 sweets per attendee"
    });

    // 2. Drinks (Cold brew coffee station, sparkling waters, artisan tea)
    const coffeeBarKits = Math.ceil(guests / 12);
    const coffeePrice = 14.99;
    items.push({
      id: `item-${idCounter++}`,
      name: "Cymbal Barista Cold Brew Coffee & Artisan Tea Station (1 Gal Cold Brew + Organic Teas + Oat Milk)",
      category: "Drinks",
      quantityDescription: `${coffeeBarKits} beverage station kits`,
      unitPrice: coffeePrice,
      estimatedPrice: Number((coffeeBarKits * coffeePrice).toFixed(2)),
      isEssential: true,
      themeRelevance: "Executive caffeine & premium tea setup for workshop focus",
      dietaryNote: "Includes Dairy & Plant-Based Oat Milk Creamers",
      cymbalMartAisle: "Aisle 7 - Coffee & Specialty Drinks",
      notes: "Includes cold brew jug, hot water tea bags, oat milk & stevia"
    });

    const seltzerPacks = Math.ceil((guests * 2) / 12);
    const seltzerPrice = 5.99;
    items.push({
      id: `item-${idCounter++}`,
      name: "Cymbal Reserve Sparkling Flavored Mineral Water Variety 12-pk (Perrier & San Pellegrino Style)",
      category: "Drinks",
      quantityDescription: `${seltzerPacks} twelve-packs (${seltzerPacks * 12} cans total)`,
      unitPrice: seltzerPrice,
      estimatedPrice: Number((seltzerPacks * seltzerPrice).toFixed(2)),
      isEssential: true,
      themeRelevance: "Zero-sugar crisp workplace hydration",
      dietaryNote: "Calorie-Free, Gluten-Free, Vegan",
      cymbalMartAisle: "Aisle 7 - Premium Sparkling Water",
      notes: "Budgeted 2 cans per attendee"
    });

    const iceBags = Math.max(1, Math.ceil(guests / 10));
    const icePrice = 2.49;
    items.push({
      id: `item-${idCounter++}`,
      name: "Cymbal Pure Filtered Party Ice (10 lb bag)",
      category: "Drinks",
      quantityDescription: `${iceBags} bags (${iceBags * 10} lbs)`,
      unitPrice: icePrice,
      estimatedPrice: Number((iceBags * icePrice).toFixed(2)),
      isEssential: true,
      themeRelevance: "Iced coffee and water chilling",
      dietaryNote: "Pure filtered water",
      cymbalMartAisle: "Front Entry - Ice Freezers",
      notes: "For cold brew and water dispenser"
    });

    // 3. Decorations (Subtle, professional, minimalist workplace aesthetic)
    items.push({
      id: `item-${idCounter++}`,
      name: "Minimalist Modern Tabletop Potted Succulent & Ceramic Planter Duo",
      category: "Decorations",
      quantityDescription: "1 centerpiece set (2 modern succulent planters)",
      unitPrice: 8.99,
      estimatedPrice: 8.99,
      isEssential: false,
      themeRelevance: "Sophisticated biophilic greenery for workshop conference tables",
      dietaryNote: "Live decorative plants",
      cymbalMartAisle: "Floral Department",
      notes: "Subtle professional table accents"
    });

    items.push({
      id: `item-${idCounter++}`,
      name: "Executive Welcome Tabletop Signage Frame & Slate Fabric Table Runner",
      category: "Decorations",
      quantityDescription: "1 display set",
      unitPrice: 6.49,
      estimatedPrice: 6.49,
      isEssential: false,
      themeRelevance: "Neat, branded entryway display for event agenda",
      dietaryNote: "General decor",
      cymbalMartAisle: "Aisle 8 - Event Displays",
      notes: "Professional neutral slate table runner"
    });

    // 4. Tableware (Eco-luxe palm leaf / bamboo, linen-feel napkins, sleek tumblers)
    const platePacks = Math.ceil((guests * 1.5) / 25);
    const platePrice = 7.99;
    items.push({
      id: `item-${idCounter++}`,
      name: "Cymbal Eco-Luxe Compostable Palm Leaf / Sleek Bamboo Plates 9\" (25-ct)",
      category: "Tableware",
      quantityDescription: `${platePacks} packs (${platePacks * 25} plates)`,
      unitPrice: platePrice,
      estimatedPrice: Number((platePacks * platePrice).toFixed(2)),
      isEssential: true,
      themeRelevance: "Sustainable, elegant, leak-proof dining plates for corporate events",
      dietaryNote: "100% USDA Certified Biobased",
      cymbalMartAisle: "Aisle 8 - Eco Catering Tableware",
      notes: "1.5 plates per attendee for wraps and pastries"
    });

    const napkinPacks = Math.ceil((guests * 2.5) / 50);
    const napkinPrice = 3.99;
    items.push({
      id: `item-${idCounter++}`,
      name: "Cymbal Heavyweight Linen-Feel Dinner Napkins (50-ct, Crisp White)",
      category: "Tableware",
      quantityDescription: `${napkinPacks} packs (${napkinPacks * 50} napkins)`,
      unitPrice: napkinPrice,
      estimatedPrice: Number((napkinPacks * napkinPrice).toFixed(2)),
      isEssential: true,
      themeRelevance: "Cloth-like luxury feel for professional dining",
      dietaryNote: "Ultra-absorbent paper",
      cymbalMartAisle: "Aisle 8 - Premium Paper Supplies",
      notes: "2-3 napkins per attendee"
    });

    const cupPacks = Math.ceil((guests * 2) / 30);
    const cupPrice = 5.49;
    items.push({
      id: `item-${idCounter++}`,
      name: "Cymbal Compostable Insulated Hot & Cold Drink Tumblers with Sip Lids 12 oz (30-ct)",
      category: "Tableware",
      quantityDescription: `${cupPacks} packs (${cupPacks * 30} cups + lids)`,
      unitPrice: cupPrice,
      estimatedPrice: Number((cupPacks * cupPrice).toFixed(2)),
      isEssential: true,
      themeRelevance: "Desk-safe spill prevention for iced coffee and hot tea",
      dietaryNote: "Plant-based PLA lining",
      cymbalMartAisle: "Aisle 8 - Coffee & Catering Supplies",
      notes: "Includes tight-fitting sip lids"
    });

    const cutleryPacks = Math.ceil(guests / 24);
    const cutleryPrice = 4.49;
    items.push({
      id: `item-${idCounter++}`,
      name: "Cymbal Matte Black Plant-Based Heavy-Duty Cutlery Set (24-pk)",
      category: "Tableware",
      quantityDescription: `${cutleryPacks} box (24 utensils)`,
      unitPrice: cutleryPrice,
      estimatedPrice: Number((cutleryPacks * cutleryPrice).toFixed(2)),
      isEssential: true,
      themeRelevance: "Modern sleek aesthetic with high durability",
      dietaryNote: "Compostable polymer",
      cymbalMartAisle: "Aisle 8 - Paper & Catering Supplies",
      notes: "Full dining forks and knives"
    });

    // 5. Party Supplies (Team Building & Workshop Collaboration Supplies)
    items.push({
      id: `item-${idCounter++}`,
      name: "Post-it Super Sticky Wall-Hanging Easel Pads (2-pack, 60 large self-adhesive sheets)",
      category: "Party supplies",
      quantityDescription: "1 double-pack (2 large pads, 60 sheets)",
      unitPrice: 16.99,
      estimatedPrice: 16.99,
      isEssential: true,
      themeRelevance: "Essential workshop breakout canvas for team brainstorming & sticky exercises",
      dietaryNote: "Workplace stationery",
      cymbalMartAisle: "Aisle 8 - Office & Stationery",
      notes: "Sticks firmly to conference room walls without damaging paint"
    });

    items.push({
      id: `item-${idCounter++}`,
      name: "Sharpie Multi-Color Chisel & Fine-Point Marker Multi-Pack (12-ct)",
      category: "Party supplies",
      quantityDescription: "1 box (12 assorted bold markers)",
      unitPrice: 8.49,
      estimatedPrice: 8.49,
      isEssential: true,
      themeRelevance: "Bold, smudge-proof markers for easel pads & brainstorm cards",
      dietaryNote: "Non-toxic ink",
      cymbalMartAisle: "Aisle 8 - Office Supplies",
      notes: "Assorted colors for team grouping"
    });

    items.push({
      id: `item-${idCounter++}`,
      name: "Assorted Color Post-it Ideation Sticky Notes (5 pads, 3x3 in, 500 sheets)",
      category: "Party supplies",
      quantityDescription: "1 multi-pack (5 color pads)",
      unitPrice: 5.99,
      estimatedPrice: 5.99,
      isEssential: true,
      themeRelevance: "Silent brainstorming and affinity mapping exercises",
      dietaryNote: "Stationery",
      cymbalMartAisle: "Aisle 8 - Office Supplies",
      notes: "5 distinct colors for team voting & clustering"
    });

    items.push({
      id: `item-${idCounter++}`,
      name: "Team-Building Collaboration Challenge & Icebreaker Trivia Card Deck",
      category: "Party supplies",
      quantityDescription: "1 activity deck (50 team prompts)",
      unitPrice: 7.99,
      estimatedPrice: 7.99,
      isEssential: false,
      themeRelevance: "Guided structured icebreaker to kick off the workshop",
      dietaryNote: "Activity kit",
      cymbalMartAisle: "Aisle 8 - Games & Activities",
      notes: "Designed for professional workplace teams"
    });

    items.push({
      id: `item-${idCounter++}`,
      name: "Cymbal Clean-Up Drawstring Heavy-Duty Trash Bags (13 Gallon, 15-ct)",
      category: "Party supplies",
      quantityDescription: "1 box (15 bags)",
      unitPrice: 3.29,
      estimatedPrice: 3.29,
      isEssential: true,
      themeRelevance: "Leave-no-trace conference room cleanup",
      dietaryNote: "Recycled plastic",
      cymbalMartAisle: "Aisle 8 - Cleaning & Trash",
      notes: "For conference room trash management"
    });

    // 6. Optional Extras (Workplace practicality & badges)
    items.push({
      id: `item-${idCounter++}`,
      name: "Touch-Free Pump Hand Sanitizer & Surface Sanitizing Wipes Station",
      category: "Optional extras",
      quantityDescription: "1 hygiene station pack (16 oz pump sanitizer + 75 surface wipes)",
      unitPrice: 5.99,
      estimatedPrice: 5.99,
      isEssential: false,
      themeRelevance: "Sanitary hygiene for shared tabletops, markers, and buffet lines",
      dietaryNote: "70% ethyl alcohol, dermatologist tested",
      cymbalMartAisle: "Aisle 8 - Health & Cleaning",
      notes: "Place on entry and food buffet tables"
    });

    items.push({
      id: `item-${idCounter++}`,
      name: "Adhesive Name Badges with Clip Lanyards (20-ct)",
      category: "Optional extras",
      quantityDescription: "1 pack (20 badges)",
      unitPrice: 4.99,
      estimatedPrice: 4.99,
      isEssential: false,
      themeRelevance: "Easy attendee identification across cross-functional departments",
      dietaryNote: "Office supply",
      cymbalMartAisle: "Aisle 8 - Office Supplies",
      notes: "Optional: easily toggled to adjust budget"
    });

  // ==========================================
  // CASE 3: BBQ / COOKOUT
  // ==========================================
  } else if (isBBQ) {
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

    const fruitTrays = Math.ceil(guests / 10);
    items.push({
      id: `item-${idCounter++}`,
      name: "Cymbal Fresh Cut Seasonal Fruit & Berry Party Bowl (3 lbs)",
      category: "Food",
      quantityDescription: `${fruitTrays} bowls (${fruitTrays * 3} lbs)`,
      unitPrice: 9.99,
      estimatedPrice: Number((fruitTrays * 9.99).toFixed(2)),
      isEssential: true,
      themeRelevance: `Crisp fruit pops matching ${theme}`,
      dietaryNote: "Naturally Gluten-Free, Vegan, Nut-Free",
      cymbalMartAisle: "Aisle 1 - Produce Department",
      notes: "Assorted melon, pineapple, grapes & berries"
    });

    const chipBags = Math.ceil(guests / 5);
    items.push({
      id: `item-${idCounter++}`,
      name: "Cymbal Crispy Cantina Tortilla Chips (16 oz)",
      category: "Food",
      quantityDescription: `${chipBags} party-size bags`,
      unitPrice: 3.29,
      estimatedPrice: Number((chipBags * 3.29).toFixed(2)),
      isEssential: true,
      themeRelevance: "Crunchy sharing snack",
      dietaryNote: "Gluten-Free & Vegan",
      cymbalMartAisle: "Aisle 5 - Chips & Snacks",
      notes: "Serve with dips in bowls"
    });

    const dessertPacks = Math.ceil(guests / 12);
    items.push({
      id: `item-${idCounter++}`,
      name: "Cymbal Bakery Celebration Cupcake Assortment (12-ct Vanilla & Chocolate)",
      category: "Food",
      quantityDescription: `${dessertPacks} packs (${dessertPacks * 12} cupcakes)`,
      unitPrice: 8.99,
      estimatedPrice: Number((dessertPacks * 8.99).toFixed(2)),
      isEssential: true,
      themeRelevance: `Centerpiece treat for ${partyType}`,
      dietaryNote: isNutFree ? "Nut-free facility bakery" : "Contains egg, dairy, wheat",
      cymbalMartAisle: "Aisle 3 - Bakery Showcase",
      notes: "1 cupcake per guest"
    });

    // BBQ Drinks
    const seltzerPacks = Math.ceil((guests * 2) / 12);
    items.push({
      id: `item-${idCounter++}`,
      name: "Cymbal Sparkling Seltzer Variety 12-Pack (12 x 12 oz cans)",
      category: "Drinks",
      quantityDescription: `${seltzerPacks} twelve-packs (${seltzerPacks * 12} cans total)`,
      unitPrice: 4.99,
      estimatedPrice: Number((seltzerPacks * 4.99).toFixed(2)),
      isEssential: true,
      themeRelevance: "Crisp zero-sugar hydration",
      dietaryNote: "Gluten-Free, Vegan, Zero Calorie",
      cymbalMartAisle: "Aisle 7 - Beverages",
      notes: "Calculated 2 cans per guest"
    });

    const lemonadeJugs = Math.ceil(guests / 8);
    items.push({
      id: `item-${idCounter++}`,
      name: "Cymbal All-Natural Chilled Lemonade / Iced Tea (1 Gallon)",
      category: "Drinks",
      quantityDescription: `${lemonadeJugs} gallon jugs`,
      unitPrice: 3.79,
      estimatedPrice: Number((lemonadeJugs * 3.79).toFixed(2)),
      isEssential: true,
      themeRelevance: "Sweet chilled beverage for cookout",
      dietaryNote: "Dairy-Free, Nut-Free",
      cymbalMartAisle: "Aisle 7 - Chilled Drinks",
      notes: "Great standalone or drink mixer"
    });

    const iceBags = Math.max(1, Math.ceil(guests / 8));
    items.push({
      id: `item-${idCounter++}`,
      name: "Cymbal Pure Filtered Party Ice (10 lb bag)",
      category: "Drinks",
      quantityDescription: `${iceBags} bags (${iceBags * 10} lbs total)`,
      unitPrice: 2.49,
      estimatedPrice: Number((iceBags * 2.49).toFixed(2)),
      isEssential: true,
      themeRelevance: "Essential drink and cooler chilling",
      dietaryNote: "Pure filtered water",
      cymbalMartAisle: "Front Entry - Ice Freezers",
      notes: "Keeps drinks cold for 4-6 hours"
    });

    // BBQ Decor
    items.push({
      id: `item-${idCounter++}`,
      name: `Festive ${theme} Theme Banner & Streamer Accent Pack`,
      category: "Decorations",
      quantityDescription: "1 kit",
      unitPrice: 5.99,
      estimatedPrice: 5.99,
      isEssential: true,
      themeRelevance: `Sets visual ambiance for ${theme}`,
      dietaryNote: "Decorative item",
      cymbalMartAisle: "Aisle 8 - Party Decorations",
      notes: "Pre-strung for instant hanging"
    });

    // BBQ Tableware
    const platePacks = Math.ceil((guests * 1.5) / 30);
    items.push({
      id: `item-${idCounter++}`,
      name: "Cymbal Eco-Friendly Heavy-Duty Compostable Paper Plates (30-ct)",
      category: "Tableware",
      quantityDescription: `${platePacks} packs (${platePacks * 30} plates)`,
      unitPrice: 4.49,
      estimatedPrice: Number((platePacks * 4.49).toFixed(2)),
      isEssential: true,
      themeRelevance: "Sturdy dinner & dessert plates",
      dietaryNote: "Food-safe compostable",
      cymbalMartAisle: "Aisle 8 - Paper & Party Supplies",
      notes: "1.5 plates per guest"
    });

    const napkinPacks = Math.ceil((guests * 2.5) / 50);
    items.push({
      id: `item-${idCounter++}`,
      name: "Cymbal 2-Ply Party Beverage Napkins (50-ct)",
      category: "Tableware",
      quantityDescription: `${napkinPacks} packs (${napkinPacks * 50} napkins)`,
      unitPrice: 2.29,
      estimatedPrice: Number((napkinPacks * 2.29).toFixed(2)),
      isEssential: true,
      themeRelevance: "Mess-free dining",
      dietaryNote: "General supply",
      cymbalMartAisle: "Aisle 8 - Paper & Party Supplies",
      notes: "2-3 napkins per guest"
    });

    const cupPacks = Math.ceil((guests * 2) / 30);
    items.push({
      id: `item-${idCounter++}`,
      name: "Cymbal Recyclable Party Cold Beverage Cups 16 oz (30-ct)",
      category: "Tableware",
      quantityDescription: `${cupPacks} packs (${cupPacks * 30} cups)`,
      unitPrice: 3.49,
      estimatedPrice: Number((cupPacks * 3.49).toFixed(2)),
      isEssential: true,
      themeRelevance: "Durable drink cups",
      dietaryNote: "BPA-Free recyclable",
      cymbalMartAisle: "Aisle 8 - Paper & Party Supplies",
      notes: "2 cups per person"
    });

    const cutleryPacks = Math.ceil(guests / 16);
    items.push({
      id: `item-${idCounter++}`,
      name: "Cymbal Plant-Based Compostable Cutlery Set (24-pk)",
      category: "Tableware",
      quantityDescription: `${cutleryPacks} box`,
      unitPrice: 3.99,
      estimatedPrice: Number((cutleryPacks * 3.99).toFixed(2)),
      isEssential: true,
      themeRelevance: "Mess-free dining",
      dietaryNote: "Non-toxic biodegradable",
      cymbalMartAisle: "Aisle 8 - Paper & Party Supplies",
      notes: "Full dining cutlery set"
    });

    // BBQ Supplies
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
      notes: "Hygienic self-service"
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
      notes: "Place next to cooler and buffet"
    });

    items.push({
      id: `item-${idCounter++}`,
      name: "Insulated Beverage Tub & Condiment Serving Caddy",
      category: "Optional extras",
      quantityDescription: "1 party cooler caddy",
      unitPrice: 8.99,
      estimatedPrice: 8.99,
      isEssential: false,
      themeRelevance: "Keeps drinks chilled on the patio",
      dietaryNote: "Reusable houseware",
      cymbalMartAisle: "Aisle 8 - Seasonal & Housewares",
      notes: "Optional: easily toggled to save budget"
    });

  // ==========================================
  // CASE 4: GENERAL CELEBRATION / BIRTHDAY / DINNER
  // ==========================================
  } else {
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

    const fruitTrays = Math.ceil(guests / 10);
    items.push({
      id: `item-${idCounter++}`,
      name: "Cymbal Fresh Cut Seasonal Fruit & Berry Party Bowl (3 lbs)",
      category: "Food",
      quantityDescription: `${fruitTrays} bowls (${fruitTrays * 3} lbs)`,
      unitPrice: 9.99,
      estimatedPrice: Number((fruitTrays * 9.99).toFixed(2)),
      isEssential: true,
      themeRelevance: `Crisp fruit pops matching ${theme}`,
      dietaryNote: "Naturally Gluten-Free, Vegan, Nut-Free",
      cymbalMartAisle: "Aisle 1 - Produce Department",
      notes: "Assorted melon, pineapple, grapes & berries"
    });

    const chipBags = Math.ceil(guests / 5);
    items.push({
      id: `item-${idCounter++}`,
      name: "Cymbal Crispy Cantina Tortilla Chips (16 oz)",
      category: "Food",
      quantityDescription: `${chipBags} party-size bags`,
      unitPrice: 3.29,
      estimatedPrice: Number((chipBags * 3.29).toFixed(2)),
      isEssential: true,
      themeRelevance: "Crunchy sharing snack",
      dietaryNote: "Gluten-Free & Vegan",
      cymbalMartAisle: "Aisle 5 - Chips & Snacks",
      notes: "Serve with dips in bowls"
    });

    const dipTubs = Math.ceil(guests / 8);
    items.push({
      id: `item-${idCounter++}`,
      name: "Cymbal Fresh Guacamole & Fire-Roasted Salsa Duo (32 oz)",
      category: "Food",
      quantityDescription: `${dipTubs} duo packs`,
      unitPrice: 6.49,
      estimatedPrice: Number((dipTubs * 6.49).toFixed(2)),
      isEssential: true,
      themeRelevance: "Vibrant dip pairing",
      dietaryNote: "Vegan, Gluten-Free, Nut-Free",
      cymbalMartAisle: "Aisle 1 - Produce Deli",
      notes: "Keep refrigerated until start"
    });

    const dessertPacks = Math.ceil(guests / 12);
    items.push({
      id: `item-${idCounter++}`,
      name: "Cymbal Bakery Celebration Cupcake Assortment (12-ct Vanilla & Chocolate)",
      category: "Food",
      quantityDescription: `${dessertPacks} packs (${dessertPacks * 12} cupcakes)`,
      unitPrice: 8.99,
      estimatedPrice: Number((dessertPacks * 8.99).toFixed(2)),
      isEssential: true,
      themeRelevance: `Centerpiece treat for ${partyType}`,
      dietaryNote: isNutFree ? "Nut-free facility bakery" : "Contains egg, dairy, wheat",
      cymbalMartAisle: "Aisle 3 - Bakery Showcase",
      notes: "1 cupcake per guest"
    });

    const seltzerPacks = Math.ceil((guests * 2) / 12);
    items.push({
      id: `item-${idCounter++}`,
      name: "Cymbal Sparkling Seltzer Variety 12-Pack (12 x 12 oz cans)",
      category: "Drinks",
      quantityDescription: `${seltzerPacks} twelve-packs (${seltzerPacks * 12} cans total)`,
      unitPrice: 4.99,
      estimatedPrice: Number((seltzerPacks * 4.99).toFixed(2)),
      isEssential: true,
      themeRelevance: "Crisp zero-sugar hydration",
      dietaryNote: "Gluten-Free, Vegan, Zero Calorie",
      cymbalMartAisle: "Aisle 7 - Beverages",
      notes: "Calculated 2 cans per guest"
    });

    const juiceJugs = Math.ceil(guests / 8);
    items.push({
      id: `item-${idCounter++}`,
      name: "Cymbal All-Natural Chilled Lemonade / Fruit Punch (1 Gallon)",
      category: "Drinks",
      quantityDescription: `${juiceJugs} gallon jugs`,
      unitPrice: 3.79,
      estimatedPrice: Number((juiceJugs * 3.79).toFixed(2)),
      isEssential: true,
      themeRelevance: `Sweet chilled beverage for ${theme}`,
      dietaryNote: "Dairy-Free, Nut-Free",
      cymbalMartAisle: "Aisle 7 - Chilled Drinks",
      notes: "Great standalone or drink mixer"
    });

    const iceBags = Math.max(1, Math.ceil(guests / 8));
    items.push({
      id: `item-${idCounter++}`,
      name: "Cymbal Pure Filtered Party Ice (10 lb bag)",
      category: "Drinks",
      quantityDescription: `${iceBags} bags (${iceBags * 10} lbs total)`,
      unitPrice: 2.49,
      estimatedPrice: Number((iceBags * 2.49).toFixed(2)),
      isEssential: true,
      themeRelevance: "Essential drink and cooler chilling",
      dietaryNote: "Pure filtered water",
      cymbalMartAisle: "Front Entry - Ice Freezers",
      notes: "Keeps drinks cold for 4-6 hours"
    });

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

    const platePacks = Math.ceil((guests * 1.5) / 30);
    items.push({
      id: `item-${idCounter++}`,
      name: "Cymbal Eco-Friendly Heavy-Duty Compostable Paper Plates (30-ct)",
      category: "Tableware",
      quantityDescription: `${platePacks} packs (${platePacks * 30} plates)`,
      unitPrice: 4.49,
      estimatedPrice: Number((platePacks * 4.49).toFixed(2)),
      isEssential: true,
      themeRelevance: "Sturdy dinner & dessert plates",
      dietaryNote: "Food-safe compostable",
      cymbalMartAisle: "Aisle 8 - Paper & Party Supplies",
      notes: "1.5 plates per guest for meal + sweets"
    });

    const napkinPacks = Math.ceil((guests * 2.5) / 50);
    items.push({
      id: `item-${idCounter++}`,
      name: "Cymbal 2-Ply Party Beverage Napkins (50-ct, Theme Colors)",
      category: "Tableware",
      quantityDescription: `${napkinPacks} packs (${napkinPacks * 50} napkins)`,
      unitPrice: 2.29,
      estimatedPrice: Number((napkinPacks * 2.29).toFixed(2)),
      isEssential: true,
      themeRelevance: `Color coordinated for ${theme}`,
      dietaryNote: "General supply",
      cymbalMartAisle: "Aisle 8 - Paper & Party Supplies",
      notes: "2-3 napkins allocated per guest"
    });

    const cutleryPacks = Math.ceil(guests / 16);
    items.push({
      id: `item-${idCounter++}`,
      name: "Cymbal Plant-Based Compostable Cutlery Set (Forks, Spoons, Knives 24-pk)",
      category: "Tableware",
      quantityDescription: `${cutleryPacks} boxes (${cutleryPacks * 24} utensils)`,
      unitPrice: 3.99,
      estimatedPrice: Number((cutleryPacks * 3.99).toFixed(2)),
      isEssential: true,
      themeRelevance: "Mess-free dining",
      dietaryNote: "Non-toxic biodegradable",
      cymbalMartAisle: "Aisle 8 - Paper & Party Supplies",
      notes: "Full dining cutlery set"
    });

    const cupPacks = Math.ceil((guests * 2) / 30);
    items.push({
      id: `item-${idCounter++}`,
      name: "Cymbal Recyclable Party Cold Beverage Cups 16 oz (30-ct)",
      category: "Tableware",
      quantityDescription: `${cupPacks} packs (${cupPacks * 30} cups)`,
      unitPrice: 3.49,
      estimatedPrice: Number((cupPacks * 3.49).toFixed(2)),
      isEssential: true,
      themeRelevance: "Durable drink cups for punch & seltzers",
      dietaryNote: "BPA-Free recyclable",
      cymbalMartAisle: "Aisle 8 - Paper & Party Supplies",
      notes: "Assures 2 cups per person"
    });

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
  }

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
      isKidsParty 
        ? `Children's Party Baseline: Scaled for ${guests} kids with child-safe portions, spill-resistant drinks, and age-appropriate supplies.`
        : isCorporateEvent
        ? `Corporate Workshop Baseline: Scaled for ${guests} professional attendees with catering wraps, cold brew bar, and team collaboration supplies.`
        : `Guest baseline: planned for ${guests} guests for an estimated 3 to 4 hour gathering.`,
      isKidsParty 
        ? `Drinks allocation: 100% kid-friendly juice pouches and mini water bottles (strictly non-alcoholic).`
        : isCorporateEvent
        ? `Drinks allocation: Cold brew coffee bar station, artisan teas, and sparkling flavored mineral waters.`
        : `Drinks allocation: budgeted ~2 to 3 seltzers/juices per guest plus ice for drink chilling.`,
      isKidsParty 
        ? `Food portions: Kid-sized portions including mini pizza bites, baked chicken tenders, cut seedless fruit, and celebration cupcakes.`
        : isCorporateEvent
        ? `Food portions: 1.5 artisan wrap halves per person, executive cheese & fruit boards, and afternoon macarons.`
        : `Food portions: scaled 1.5 main portions per person plus fresh fruit, snacks, and cupcakes.`,
      `Tableware ratios: included ample plates, cups, and napkins tailored to the event archetype.`,
      dietary.includes("Nut Allergy") 
        ? "Nut Allergy accommodation: selected 100% nut-free bakery facility items and labeled snacks."
        : dietary.includes("Gluten-Free") 
        ? "Dietary accommodation: included dedicated certified Gluten-Free items to prevent cross-contact." 
        : "Balanced variety across savory, sweet, and hydration.",
      `Budget reconciliation: total estimated at $${estimatedTotal} against your $${budget} budget (${remainingBudget >= 0 ? `$${remainingBudget.toFixed(2)} surplus remaining` : `$${Math.abs(remainingBudget).toFixed(2)} over target — optional extras can be toggled off to save $${optionalsTotal.toFixed(2)}`}).`
    ],
    themeHighlights: isKidsParty
      ? [
          isSuperheroTheme ? "Superhero comic action banner, masks, and emblem cupcakes." : "Bright, joyful child-friendly decorations & colorful cupcakes.",
          "Child-safe tableware, spill-proof juice pouches, and sticky-finger cleansing wipes.",
          "Interactive take-home party favors and photo props."
        ]
      : isCorporateEvent
      ? [
          "Professional catering wrap platters, cold brew coffee bar, and sparkling waters.",
          "Post-it super sticky easel pads, Sharpies, and ideation sticky notes for team activities.",
          "Eco-luxe bamboo tableware and clean desk sanitizing station."
        ]
      : [
          `Decor & tableware styled around "${theme}" colors and aesthetic.`,
          `Curated snack & drink menu matching a festive ${partyType}.`,
          `Celebration cupcakes and accent banner centerpiece.`
        ],
    dietaryAccommodations: isGF || isVeg || isNutFree
      ? [
          isGF ? "Included certified Gluten-Free options and naturally GF fruit & chips." : null,
          isVeg ? "Dedicated plant-based entrees and vegetarian snack platters." : null,
          isNutFree ? "Nut-safe bakery cupcakes and allergen-labeled snacks." : null,
        ].filter(Boolean) as string[]
      : ["All items are standard supermarket favorites with clear ingredient labeling."],
    proTips: isKidsParty
      ? [
          "Pre-portion cupcakes and juice pouches on the side table before singing happy birthday to prevent spills.",
          "Keep wet wipes directly on the dining table for instant cleanup after finger foods and cupcakes.",
          "Set up the superhero photo station near the entryway so parents can snap photos as guests arrive."
        ]
      : isCorporateEvent
      ? [
          "Set up the cold brew and tea station 15 minutes before the morning session starts.",
          "Distribute Sharpies and Post-it pads at each breakout table before attendees arrive.",
          "Keep hand sanitizer pumps at both ends of the catering food platter line."
        ]
      : [
          "Chill beverages in the refrigerator the night before so party ice lasts longer in tubs.",
          "Pre-slice fruit and set up the snack bar 30 minutes before guests arrive.",
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
1. Party type (e.g. Children's Birthday Party, Corporate Team Building Event, Birthday Party, Backyard BBQ, Cocktail Party, Game Night, Graduation, Dinner)
2. Number of guests (integer)
3. Date (e.g. "This Saturday", "Oct 12")
4. Theme (e.g. Superhero Comic Adventure, Professional Innovation & Strategy, Tropical Luau, Retro Disco, Fiesta Taco Bar)
5. Budget (in USD, e.g. $150)
6. Dietary restrictions (e.g. Gluten-Free, Vegan, Vegetarian, Nut Allergy, None)
7. Special requests (e.g. mocktail recipes, eco-friendly tableware, sticky-finger wet wipes, easel pads)

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
5. "Party supplies" (Serving tongs, ice scoop, trash cleanup bags, workshop/activity supplies)
6. "Optional extras" (Interactive treat kits, beverage tubs, photo props, hygiene station)

SPECIAL PARTY TYPE RULES:

[A. CHILDREN'S BIRTHDAY PARTIES]
When party type is a Children's Birthday Party or kids party:
- Make all recommendations AGE-APPROPRIATE and SAFE for children.
- Food & Drinks: Recommend child-friendly foods (mini pizzas, baked chicken tenders, seedless cut fruit wands/cups, animal crackers/fruit snacks, 100% juice pouches with straws, kid-sized mini water bottles, and nut-safe celebration cupcakes with rainbow sprinkles).
- Quantities: Scale portions appropriately for kids (smaller portion sizes, finger-friendly).
- Child-Friendly Decorations: Vibrant birthday banners, colorful balloon garlands, and themed backdrop kits.
- Safe Party Supplies: Include gentle wet wipes / face wipes for sticky fingers, child-safe plastic cake knife/spatula (no sharp blades), spill-proof paper cups, rounded-edge cutlery, and goodie favor bags.
- Superhero Theme: For superhero-themed parties, include relevant superhero decorations (POW! BAM! BOOM! comic banners, superhero balloon garlands), superhero cape/mask favors, and action hero comic cupcake toppers.
- STRICT PROHIBITION: DO NOT recommend inappropriate adult-oriented products (NO alcohol, NO beer/wine/cocktail mixers, NO sharp toothpicks/cocktail picks, NO adult-only games).
- Continue to respect the customer's budget and calculate realistic estimated costs.

[B. CORPORATE TEAM BUILDING EVENTS]
When party type is a Corporate Team Building Event or workplace gathering:
- Adapt all recommendations for a PROFESSIONAL WORKPLACE ENVIRONMENT.
- Food & Drinks: Recommend upscale catering platters (artisan gourmet wraps/sandwich platters with roasted turkey, smoked beef, and grilled veggie hummus; deluxe artisan cheese, dried fruit & nut tasting boards; fresh cut fruit platters; brain-fuel trail mix snack packs; executive French macarons & gourmet cookies).
- Beverage Setup: Premium barista cold brew coffee & artisan tea station (with oat milk and sweeteners), sparkling flavored mineral waters (Perrier / San Pellegrino style), and filtered ice.
- Quantities: Calculate adult professional portions (~1.5 wrap halves per attendee, continuous hydration).
- Professional Tableware: Sleek eco-friendly compostable palm leaf or bamboo plates, heavyweight linen-feel napkins, insulated hot/cold tumblers with sip lids (desk-safe spill prevention), and sturdy matte black cutlery.
- Team-Building & Activity Supplies: Include essential workshop supplies in "Party supplies" or "Optional extras" (Post-it wall-hanging super sticky easel pads for brainstorming, Sharpie multi-color chisel/fine marker packs, Post-it ideation sticky notes for affinity mapping, team icebreaker / trivia challenge card decks).
- Practical Workplace Items: Include touch-free pump hand sanitizer & surface sanitizing wipes station, adhesive name badges with lanyards, and discreet trash bags.
- STRICT PROHIBITION: AVOID children's-party or overly casual/noisy items (NO party noisemakers, NO party blowers, NO confetti cannons, NO kiddie juice boxes, NO cartoon characters).
- Maintain strict budget adherence and realistic supermarket catering pricing.

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
- Warm, concise, friendly, and practical for a busy party host or workplace coordinator.
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
