export type TaskStatus = "open" | "done" | "exception";
export type ChecklistTask = {
  id: string;
  title: string;
  station: string;
  block: string;
  status: TaskStatus;
  reason?: string;
  actor?: string;
  at?: string;
};

export const priorities = [
  { label: "Customers", text: "Greet customers, take orders, prepare drinks and food correctly, and ensure every order is complete" },
  { label: "Clean As You Go", text: "Keep stations, customer areas, the pastry case, and the condiment cabinet clean and stocked" },
  { label: "Progress the Checklist", text: "Whenever Priorities 1 and 2 are under control, complete the appropriate section of the checklist" },
];

const allTasks: Omit<ChecklistTask, "status">[] = [
  { id:"coffee-throughout-1", station:"Coffee & Candy", block:"Throughout Shift", title:"Keep the coffee station clean and organized" },
  { id:"coffee-throughout-2", station:"Coffee & Candy", block:"Throughout Shift", title:"Clean, refill, or put away empty jars as needed" },
  { id:"coffee-12-1", station:"Coffee & Candy", block:"12:00 PM (Early Shift)", title:"Stamp coffee bags as needed to maintain at least two dozen each of large and small bags" },
  { id:"coffee-12-2", station:"Coffee & Candy", block:"12:00 PM (Early Shift)", title:"Stamp mini cups as needed to maintain at least two dozen" },
  { id:"coffee-4-1", station:"Coffee & Candy", block:"4:00 PM (Closing Prep)", title:"Clean coffee grinders" },
  { id:"coffee-mon-1", station:"Coffee & Candy", block:"Monday", title:"Bag candy and fill canisters" },
  { id:"coffee-mon-2", station:"Coffee & Candy", block:"Monday", title:"Vacuum coffee bins" },
  { id:"coffee-thu-1", station:"Coffee & Candy", block:"Thursday", title:"Bag candy and refill jars that are less than half full" },
  { id:"coffee-thu-2", station:"Coffee & Candy", block:"Thursday", title:"Rotate candy supply, clean jars and counter, vacuum sugar, and wash jars as needed" },
  { id:"coffee-thu-3", station:"Coffee & Candy", block:"Thursday", title:"Clean shelves and bins in the cookie and candy areas" },
  { id:"coffee-fri-1", station:"Coffee & Candy", block:"Friday", title:"Pull everything from the floor along the west wall, then sweep and vacuum" },
  { id:"coffee-fri-2", station:"Coffee & Candy", block:"Friday", title:"Assemble coffee boxes until five or six are ready to go" },

  { id:"espresso-throughout-1", station:"Espresso Bar", block:"Throughout Shift", title:"Keep espresso beans stocked" },
  { id:"espresso-throughout-2", station:"Espresso Bar", block:"Throughout Shift", title:"Keep counters clean and organized" },
  { id:"espresso-throughout-3", station:"Espresso Bar", block:"Throughout Shift", title:"Wipe steam wands after each use" },
  { id:"espresso-throughout-4", station:"Espresso Bar", block:"Throughout Shift", title:"Clean coffee grounds as they accumulate" },
  { id:"espresso-throughout-5", station:"Espresso Bar", block:"Throughout Shift", title:"Return milk to refrigeration" },
  { id:"espresso-throughout-6", station:"Espresso Bar", block:"Throughout Shift", title:"Refill whipped cream as needed" },
  { id:"espresso-4-1", station:"Espresso Bar", block:"4:00 PM (Closing Prep)", title:"Restock espresso beans" },
  { id:"espresso-4-2", station:"Espresso Bar", block:"4:00 PM (Closing Prep)", title:"Restock mocha powder and white chocolate" },
  { id:"espresso-4-3", station:"Espresso Bar", block:"4:00 PM (Closing Prep)", title:"Restock cups, Java Jackets, and lids" },
  { id:"espresso-5-1", station:"Espresso Bar", block:"5:00 PM (Final Close)", title:"Clean and backflush espresso machine" },
  { id:"espresso-5-2", station:"Espresso Bar", block:"5:00 PM (Final Close)", title:"Remove drip tray for washing" },
  { id:"espresso-5-3", station:"Espresso Bar", block:"5:00 PM (Final Close)", title:"Clean espresso machine cabinet" },
  { id:"espresso-5-4", station:"Espresso Bar", block:"5:00 PM (Final Close)", title:"Reassemble espresso machine" },
  { id:"espresso-5-5", station:"Espresso Bar", block:"5:00 PM (Final Close)", title:"Empty drain bucket" },
  { id:"espresso-mon-1", station:"Espresso Bar", block:"Monday", title:"Empty the espresso machine cabinet, clean the doors, sides, top, and interior shelves, then replace all items" },
  { id:"espresso-tue-1", station:"Espresso Bar", block:"Tuesday", title:"Clean refrigerators, check dates, and wipe interior sides" },

  { id:"register-throughout-1", station:"Register / Dish / Drip Coffee", block:"Throughout Shift", title:"Keep dishes caught up" },
  { id:"register-throughout-2", station:"Register / Dish / Drip Coffee", block:"Throughout Shift", title:"Rinse milk pitchers after use" },
  { id:"register-throughout-3", station:"Register / Dish / Drip Coffee", block:"Throughout Shift", title:"Empty knock box as it fills" },
  { id:"register-12-1", station:"Register / Dish / Drip Coffee", block:"12:00 PM (Early Shift)", title:"Fill cold brew pitchers. Check brew dates and pull coffee bags, discard expired cold brew, and/or start a new batch as needed" },
  { id:"register-3-1", station:"Register / Dish / Drip Coffee", block:"3:00 PM (Pre-Close)", title:"Brew final batch of drip coffee" },
  { id:"register-3-2", station:"Register / Dish / Drip Coffee", block:"3:00 PM (Pre-Close)", title:"Clean drip coffee brewer after the final brew" },
  { id:"register-4-1", station:"Register / Dish / Drip Coffee", block:"4:00 PM (Closing Prep)", title:"Dump remaining flavored coffee and FTO medium roast, wash those airpots, and place them on the drip station" },
  { id:"register-5-1", station:"Register / Dish / Drip Coffee", block:"5:00 PM (Final Close)", title:"Wash dishes" },
  { id:"register-5-2", station:"Register / Dish / Drip Coffee", block:"5:00 PM (Final Close)", title:"Wash remaining airpots" },
  { id:"register-5-3", station:"Register / Dish / Drip Coffee", block:"5:00 PM (Final Close)", title:"Count register" },
  { id:"register-sat-1", station:"Register / Dish / Drip Coffee", block:"Saturday", title:"Clean sink and backsplash with Bar Keepers Friend" },

  { id:"bakery-throughout-1", station:"Bakery Case", block:"Throughout Shift", title:"Keep the pastry case clean, organized, attractive, and stocked throughout the shift" },
  { id:"bakery-12-1", station:"Bakery Case", block:"12:00 PM (Early Shift)", title:"Tidy and organize pastry case" },
  { id:"bakery-12-2", station:"Bakery Case", block:"12:00 PM (Early Shift)", title:"Wrap any cookies or other bakery items received that day" },
  { id:"bakery-3-1", station:"Bakery Case", block:"3:00 PM (Pre-Close)", title:"Consolidate fresh-baked sweets to one side, if possible, clean the empty side of the pastry case, and replace it with wrapped goods (breads, etc.)" },
  { id:"bakery-4-1", station:"Bakery Case", block:"4:00 PM (Closing Prep)", title:"Record leftover pastries and do Too Good To Go" },
  { id:"bakery-5-1", station:"Bakery Case", block:"5:00 PM (Final Close)", title:"Clean remaining side of pastry case" },
  { id:"bakery-5-2", station:"Bakery Case", block:"5:00 PM (Final Close)", title:"Wash pastry tongs" },
  { id:"bakery-5-3", station:"Bakery Case", block:"5:00 PM (Final Close)", title:"Place pastry boxes on patio table inside lobby" },
  { id:"bakery-sun-1", station:"Bakery Case", block:"Sunday", title:"Wipe down all tea canisters behind the bakery case" },

  { id:"bagel-throughout-1", station:"Bagel Station", block:"Throughout Shift", title:"Keep station neat and organized" },
  { id:"bagel-throughout-2", station:"Bagel Station", block:"Throughout Shift", title:"Clean work surfaces after rushes or when needed" },
  { id:"bagel-12-1", station:"Bagel Station", block:"12:00 PM (Early Shift)", title:"Refill cream cheese, peanut butter, and jelly portions to a maximum of two each. Date the bottom of each cream cheese cup with the expiration date (2 weeks from preparation)" },
  { id:"bagel-4-1", station:"Bagel Station", block:"4:00 PM (Closing Prep)", title:"Clean microwave" },
  { id:"bagel-4-2", station:"Bagel Station", block:"4:00 PM (Closing Prep)", title:"Clean toaster" },
  { id:"bagel-5-1", station:"Bagel Station", block:"5:00 PM (Final Close)", title:"Wash cutting board, knives, and utensils" },
  { id:"bagel-sun-1", station:"Bagel Station", block:"Sunday", title:"Remove all items from the bagel station shelf and counter, clean all surfaces, and replace all items" },

  { id:"lobby-throughout-1", station:"Lobby", block:"Throughout Shift", title:"Clean lobby tables regularly throughout the shift" },
  { id:"lobby-throughout-2", station:"Lobby", block:"Throughout Shift", title:"Bring dishes from the bus tub inside whenever returning from the lobby or patio" },
  { id:"lobby-4-1", station:"Lobby", block:"4:00 PM (Closing Prep)", title:"Bring water pitcher to dish area" },
  { id:"lobby-4-2", station:"Lobby", block:"4:00 PM (Closing Prep)", title:"Bring lobby trash inside (currently 4:30 PM)" },
  { id:"lobby-4-3", station:"Lobby", block:"4:00 PM (Closing Prep)", title:"Bring lobby bus tub inside (currently 4:30 PM)" },
  { id:"lobby-5-1", station:"Lobby", block:"5:00 PM (Final Close)", title:"Flip open sign and lock front door" },
  { id:"lobby-5-2", station:"Lobby", block:"5:00 PM (Final Close)", title:"Sweep and mop lobby" },
  { id:"lobby-5-3", station:"Lobby", block:"5:00 PM (Final Close)", title:"Put chairs on tables" },
  { id:"lobby-5-4", station:"Lobby", block:"5:00 PM (Final Close)", title:"Clean front door glass" },
  { id:"lobby-tue-1", station:"Lobby", block:"Tuesday", title:"Refold and restock T-shirts and hoodies" },

  { id:"alley-throughout-1", station:"Alley", block:"Throughout Shift", title:"Take trash out when cans become more than half full" },
  { id:"alley-throughout-2", station:"Alley", block:"Throughout Shift", title:"Sort recycling properly" },
  { id:"alley-5-1", station:"Alley", block:"5:00 PM (Final Close)", title:"Take out trash" },
  { id:"alley-5-2", station:"Alley", block:"5:00 PM (Final Close)", title:"Sort recycling" },
  { id:"alley-sun-1", station:"Alley", block:"Sunday", title:"Put out green compost bins" },
  { id:"alley-tue-1", station:"Alley", block:"Tuesday", title:"Put out green compost bins" },
  { id:"alley-tue-2", station:"Alley", block:"Tuesday", title:"Put out black trash bins" },
  { id:"alley-thu-1", station:"Alley", block:"Thursday", title:"Put out green compost bins" },
  { id:"alley-thu-2", station:"Alley", block:"Thursday", title:"Sweep alley" },

  { id:"patio-throughout-1", station:"Patio", block:"Throughout Shift", title:"Wipe tables after guests leave or after rushes" },
  { id:"patio-5-1", station:"Patio", block:"5:00 PM (Final Close)", title:"Wipe patio tables" },
  { id:"patio-5-2", station:"Patio", block:"5:00 PM (Final Close)", title:"Bring patio tables inside" },
  { id:"patio-5-3", station:"Patio", block:"5:00 PM (Final Close)", title:"Bring patio chairs inside" },
  { id:"patio-5-4", station:"Patio", block:"5:00 PM (Final Close)", title:"Bring patio carts inside" },
  { id:"patio-5-5", station:"Patio", block:"5:00 PM (Final Close)", title:"Sweep patio" },

  { id:"condiment-throughout-1", station:"Condiment Cabinet", block:"Throughout Shift", title:"Keep the condiment cabinet clean" },
  { id:"condiment-throughout-2", station:"Condiment Cabinet", block:"Throughout Shift", title:"Keep the sugar shaker, napkins, and sugars stocked throughout the shift" },
  { id:"condiment-4-1", station:"Condiment Cabinet", block:"4:00 PM (Closing Prep)", title:"Wash spoon cup and spoons" },
  { id:"condiment-5-1", station:"Condiment Cabinet", block:"5:00 PM (Final Close)", title:"Clean and restock condiment cabinet" },

  { id:"restroom-3-1", station:"Restroom", block:"3:00 PM (Pre-Close)", title:"Clean restroom and restock paper towels and toilet paper" },
  { id:"restroom-thu-1", station:"Restroom", block:"Thursday", title:"Sweep and mop restroom" },
];

const recurringBlocks = new Set(["12:00 PM (Early Shift)", "3:00 PM (Pre-Close)", "4:00 PM (Closing Prep)", "5:00 PM (Final Close)"]);
const demoDone = new Set(["coffee-12-1", "coffee-12-2", "espresso-4-1", "espresso-4-2", "espresso-4-3", "register-12-1", "bakery-12-1", "bakery-12-2", "bagel-12-1", "lobby-4-1", "lobby-4-2"]);

export const throughoutShiftGuidance = allTasks
  .filter((task) => task.block === "Throughout Shift")
  .reduce<Record<string, string[]>>((groups, task) => {
    (groups[task.station] ||= []).push(task.title);
    return groups;
  }, {});

export const tuesdayTasks: ChecklistTask[] = allTasks
  .filter((task) => recurringBlocks.has(task.block) || task.block === "Tuesday")
  .map((task) => {
    if (task.id === "espresso-tue-1") return { ...task, status:"exception" as const, reason:"The under-counter refrigerator needs defrosting before the interior can be fully cleaned.", actor:"Maya", at:"4:51 PM" };
    if (demoDone.has(task.id)) return { ...task, status:"done" as const, actor:"Maya", at:"4:42 PM" };
    return { ...task, status:"open" as const };
  });

export const tuesdayBlocks = ["All", "12:00 PM (Early Shift)", "3:00 PM (Pre-Close)", "4:00 PM (Closing Prep)", "5:00 PM (Final Close)", "Tuesday"];

