// Category images for VeggieIt - All categories covered
import vegetablesImg from "@/assets/categories/vegetables.png";
import fruitsImg from "@/assets/categories/fruits.png";
import dairyImg from "@/assets/categories/dairy.png";
import eggsMeatImg from "@/assets/categories/eggs-meat.png";
import snacksImg from "@/assets/categories/snacks.png";
import beveragesImg from "@/assets/categories/beverages.png";

// New comprehensive category images
import vegetablesFruitsImg from "@/assets/categories/vegetables-fruits.png";
import dairyBreakfastImg from "@/assets/categories/dairy-breakfast.png";
import munchiesImg from "@/assets/categories/munchies.png";
import coldDrinksJuicesImg from "@/assets/categories/cold-drinks-juices.png";
import instantFrozenImg from "@/assets/categories/instant-frozen.png";
import teaCoffeeHealthImg from "@/assets/categories/tea-coffee-health.png";
import bakeryBiscuitsImg from "@/assets/categories/bakery-biscuits.png";
import sweetToothImg from "@/assets/categories/sweet-tooth.png";
import attaRiceDalImg from "@/assets/categories/atta-rice-dal.png";
import masalaOilImg from "@/assets/categories/masala-oil.png";
import saucesSpreadsImg from "@/assets/categories/sauces-spreads.png";
import chickenMeatFishImg from "@/assets/categories/chicken-meat-fish.png";
import freshVegetablesImg from "@/assets/categories/fresh-vegetables.png";
import freshFruitsImg from "@/assets/categories/fresh-fruits.png";
import exoticFruitsVeggiesImg from "@/assets/categories/exotic-fruits-veggies.png";
import herbsSeasoningsImg from "@/assets/categories/herbs-seasonings.png";
import milkImg from "@/assets/categories/milk.png";
import eggsImg from "@/assets/categories/eggs.png";
import paneerTofuImg from "@/assets/categories/paneer-tofu.png";
import butterCreamImg from "@/assets/categories/butter-cream.png";
import breadPavImg from "@/assets/categories/bread-pav.png";

export const categoryImages: Record<string, string> = {
  // Main categories from database
  "vegetables & fruits": vegetablesFruitsImg,
  "dairy & breakfast": dairyBreakfastImg,
  "munchies": munchiesImg,
  "cold drinks & juices": coldDrinksJuicesImg,
  "instant & frozen food": instantFrozenImg,
  "tea, coffee & health drinks": teaCoffeeHealthImg,
  "bakery & biscuits": bakeryBiscuitsImg,
  "sweet tooth": sweetToothImg,
  "atta, rice & dal": attaRiceDalImg,
  "masala, oil & more": masalaOilImg,
  "sauces & spreads": saucesSpreadsImg,
  "chicken, meat & fish": chickenMeatFishImg,
  
  // Subcategories from database
  "fresh vegetables": freshVegetablesImg,
  "fresh fruits": freshFruitsImg,
  "exotic fruits & veggies": exoticFruitsVeggiesImg,
  "herbs & seasonings": herbsSeasoningsImg,
  "milk": milkImg,
  "eggs": eggsImg,
  "paneer & tofu": paneerTofuImg,
  "butter & cream": butterCreamImg,
  "bread & pav": breadPavImg,
  
  // Original fallback categories
  "vegetables": vegetablesImg,
  "fruits": fruitsImg,
  "dairy": dairyImg,
  "eggs & meat": eggsMeatImg,
  "snacks": snacksImg,
  "beverages": beveragesImg,
  
  // Additional variations
  "veggies": vegetablesImg,
  "vegetable": vegetablesImg,
  "fruit": fruitsImg,
  "dairy products": dairyImg,
  "meat": eggsMeatImg,
  "snack": snacksImg,
  "beverage": beveragesImg,
  "drinks": beveragesImg,
  "cold drinks": coldDrinksJuicesImg,
  "juices": coldDrinksJuicesImg,
  "tea": teaCoffeeHealthImg,
  "coffee": teaCoffeeHealthImg,
  "bakery": bakeryBiscuitsImg,
  "biscuits": bakeryBiscuitsImg,
  "sweets": sweetToothImg,
  "desserts": sweetToothImg,
  "atta": attaRiceDalImg,
  "rice": attaRiceDalImg,
  "dal": attaRiceDalImg,
  "masala": masalaOilImg,
  "oil": masalaOilImg,
  "spices": masalaOilImg,
  "sauce": saucesSpreadsImg,
  "spreads": saucesSpreadsImg,
  "chicken": chickenMeatFishImg,
  "fish": chickenMeatFishImg,
  "frozen": instantFrozenImg,
  "instant": instantFrozenImg,
  "herbs": herbsSeasoningsImg,
  "paneer": paneerTofuImg,
  "tofu": paneerTofuImg,
  "butter": butterCreamImg,
  "cream": butterCreamImg,
  "bread": breadPavImg,
  "pav": breadPavImg,
};

export const getCategoryImage = (categoryName: string): string | undefined => {
  const normalizedName = categoryName.toLowerCase().trim();
  return categoryImages[normalizedName];
};
