// Product images for VeggieIt sample products
import tomatoesImg from "@/assets/products/tomatoes.png";
import potatoesImg from "@/assets/products/potatoes.png";
import onionsImg from "@/assets/products/onions.png";
import applesImg from "@/assets/products/apples.png";
import bananasImg from "@/assets/products/bananas.png";
import amulMilkImg from "@/assets/products/amul-milk.png";
import amulButterImg from "@/assets/products/amul-butter.png";
import breadImg from "@/assets/products/bread.png";
import laysChipsImg from "@/assets/products/lays-chips.png";
import cokeImg from "@/assets/products/coke.png";
import maggiImg from "@/assets/products/maggi.png";
import tajMahalTeaImg from "@/assets/products/taj-mahal-tea.png";
import goodDayBiscuitsImg from "@/assets/products/good-day-biscuits.png";
import dairyMilkImg from "@/assets/products/dairy-milk.png";
import aashirvaadAttaImg from "@/assets/products/aashirvaad-atta.png";
import basmatiRiceImg from "@/assets/products/basmati-rice.png";
import mdhChilliImg from "@/assets/products/mdh-chilli.png";
import fortuneOilImg from "@/assets/products/fortune-oil.png";
import kissanKetchupImg from "@/assets/products/kissan-ketchup.png";
import chickenBreastImg from "@/assets/products/chicken-breast.png";

export const productImageMap: Record<string, string> = {
  "tomatoes": tomatoesImg,
  "potatoes": potatoesImg,
  "onions": onionsImg,
  "green-onions": onionsImg,
  "apples": applesImg,
  "bananas": bananasImg,
  "amul-taaza-milk": amulMilkImg,
  "amul-butter": amulButterImg,
  "white-bread": breadImg,
  "lays-classic": laysChipsImg,
  "coca-cola": cokeImg,
  "maggi-noodles": maggiImg,
  "taj-mahal-tea": tajMahalTeaImg,
  "good-day-biscuits": goodDayBiscuitsImg,
  "cadbury-dairy-milk": dairyMilkImg,
  "aashirvaad-atta": aashirvaadAttaImg,
  "basmati-rice": basmatiRiceImg,
  "mdh-red-chilli": mdhChilliImg,
  "fortune-oil": fortuneOilImg,
  "kissan-ketchup": kissanKetchupImg,
  "chicken-breast": chickenBreastImg,
};

export const getProductImage = (productKey: string): string | undefined => {
  return productImageMap[productKey.toLowerCase().replace(/\s+/g, '-')];
};
