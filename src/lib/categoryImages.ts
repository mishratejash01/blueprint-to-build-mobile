// Category images for VeggieIt
import vegetablesImg from "@/assets/categories/vegetables.png";
import fruitsImg from "@/assets/categories/fruits.png";
import dairyImg from "@/assets/categories/dairy.png";
import eggsMeatImg from "@/assets/categories/eggs-meat.png";
import snacksImg from "@/assets/categories/snacks.png";
import beveragesImg from "@/assets/categories/beverages.png";

export const categoryImages: Record<string, string> = {
  // Main categories
  "vegetables": vegetablesImg,
  "fruits": fruitsImg,
  "dairy": dairyImg,
  "eggs & meat": eggsMeatImg,
  "eggs and meat": eggsMeatImg,
  "snacks": snacksImg,
  "beverages": beveragesImg,
  
  // Variations
  "veggies": vegetablesImg,
  "vegetable": vegetablesImg,
  "fruit": fruitsImg,
  "milk": dairyImg,
  "dairy products": dairyImg,
  "eggs": eggsMeatImg,
  "meat": eggsMeatImg,
  "snack": snacksImg,
  "beverage": beveragesImg,
  "drinks": beveragesImg,
};

export const getCategoryImage = (categoryName: string): string | undefined => {
  const normalizedName = categoryName.toLowerCase().trim();
  return categoryImages[normalizedName];
};
