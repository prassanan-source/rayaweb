export type Dietary = "veg" | "egg" | "chicken" | "mutton";

export type MenuItem = {
  name: string;
  description: string;
  price: number;
  dietary: Dietary;
  signature?: boolean;
  spicy?: boolean;
};

export type MenuCategory = {
  id: string;
  label: string;
  blurb: string;
  items: MenuItem[];
};

export const menuCategories: MenuCategory[] = [
  {
    id: "soups",
    label: "Soups",
    blurb: "Broths that start the meal the South Indian way.",
    items: [
      {
        name: "Mutton Milagu Soup",
        description:
          "Tender mutton slices in an enriched broth flavoured with pepper and bold spices.",
        price: 6.99,
        dietary: "mutton",
        spicy: true,
      },
      {
        name: "Chicken Pepper Soup",
        description:
          "Flavourful chicken broth infused with curry leaves, pepper, and aromatic spices.",
        price: 5.99,
        dietary: "chicken",
        spicy: true,
      },
      {
        name: "Mixed Veg Soup",
        description: "Hearty South Indian-style broth with mixed vegetables.",
        price: 4.99,
        dietary: "veg",
      },
      {
        name: "Rasam",
        description:
          "A tangy broth of tamarind, fresh tomatoes, and a touch of tempered garlic.",
        price: 4.99,
        dietary: "veg",
      },
    ],
  },
  {
    id: "appetizers",
    label: "Appetizers",
    blurb: "Crisp, spicy starters from the tawa and the fryer.",
    items: [
      {
        name: "Chicken 65",
        description:
          "Bite-sized chicken marinated in a spicy blend and fried until the edges crackle.",
        price: 13.99,
        dietary: "chicken",
        signature: true,
        spicy: true,
      },
      {
        name: "Kongunadu Chicken",
        description:
          "Boneless chicken with the earthy heat and aroma of Kongu country spices.",
        price: 14.99,
        dietary: "chicken",
        spicy: true,
      },
      {
        name: "Pallipalayam Chicken",
        description:
          "Bone-in chicken with coconut slices, curry leaves, and a rustic Tamil Nadu finish.",
        price: 14.99,
        dietary: "chicken",
      },
      {
        name: "Madras Mutton Sukka",
        description:
          "Tender mutton slow-cooked with aromatic spices and curry leaves until the masala clings.",
        price: 15.99,
        dietary: "mutton",
        signature: true,
        spicy: true,
      },
      {
        name: "Gobi Manchurian",
        description: "Crispy cauliflower florets tossed in a medium-spicy Indo-Chinese sauce.",
        price: 10.99,
        dietary: "veg",
      },
      {
        name: "Cut Mirchi",
        description: "Spicy battered green chilies, fried crisp.",
        price: 10.99,
        dietary: "veg",
        spicy: true,
      },
      {
        name: "Onion Spinach Pakora",
        description: "Fritters of onion and spinach in a spiced gram-flour batter.",
        price: 10.99,
        dietary: "veg",
      },
      {
        name: "Special Podi Idly",
        description: "Soft mini idlis tossed in gunpowder spice and ghee.",
        price: 10.99,
        dietary: "veg",
        signature: true,
      },
      {
        name: "Mini Ghee Idly",
        description: "Soft mini idlis drizzled with aromatic ghee.",
        price: 8.99,
        dietary: "veg",
      },
    ],
  },
  {
    id: "kids",
    label: "Kid's Special",
    blurb: "Milder plates and playful dosas for smaller appetites.",
    items: [
      {
        name: "Cone Dosa",
        description: "Crispy dosa folded into a cone, served with chutneys and sambar.",
        price: 11.99,
        dietary: "veg",
      },
      {
        name: "Cheese Dosa",
        description: "Crispy dosa filled with melted cheese, served with chutneys and sambar.",
        price: 11.99,
        dietary: "veg",
      },
      {
        name: "Chocolate Dosa",
        description: "Thin dosa layered with chocolate — a sweet twist kids ask for twice.",
        price: 11.99,
        dietary: "veg",
      },
    ],
  },
  {
    id: "dosa-idli",
    label: "Dosa & Idli",
    blurb: "Fermented rice-and-lentil classics, griddled to order.",
    items: [
      {
        name: "Plain Dosa",
        description:
          "Golden, thin crepe of fermented rice and lentil batter, with chutneys and sambar.",
        price: 11.99,
        dietary: "veg",
      },
      {
        name: "Madras Masala Dosa",
        description: "Crispy dosa filled with spiced potato masala — the Madras classic.",
        price: 11.99,
        dietary: "veg",
        signature: true,
      },
      {
        name: "Mysore Masala Dosa",
        description: "Dosa spread with spicy red chutney, then filled with potato masala.",
        price: 11.99,
        dietary: "veg",
        spicy: true,
      },
      {
        name: "Andhra Masala Dosa",
        description: "Crispy dosa stuffed with a tangy, spiced potato filling.",
        price: 11.99,
        dietary: "veg",
        spicy: true,
      },
      {
        name: "Madurai Malli Dosa",
        description: "Crispy dosa infused with aromatic Madurai malli leaf.",
        price: 11.99,
        dietary: "veg",
      },
      {
        name: "Ghee Roast",
        description: "Crispy dosa generously drizzled with aromatic ghee.",
        price: 11.99,
        dietary: "veg",
        signature: true,
      },
      {
        name: "Kal Dosa",
        description: "Thick, savory dosa cooked on a stone griddle.",
        price: 9.99,
        dietary: "veg",
      },
      {
        name: "Egg Curry Dosa",
        description: "Golden dosa with aromatic egg curry folded through South Indian spices.",
        price: 12.99,
        dietary: "egg",
      },
      {
        name: "Chicken Curry Dosa",
        description: "Medium-spicy chicken curry stuffed into a crisp dosa.",
        price: 13.99,
        dietary: "chicken",
        spicy: true,
      },
      {
        name: "Idli",
        description: "Soft steamed rice cakes with the usual condiments.",
        price: 9.99,
        dietary: "veg",
      },
      {
        name: "Idiappam",
        description: "Steamed string hoppers with savory curry or sweet coconut milk.",
        price: 10.99,
        dietary: "veg",
      },
    ],
  },
  {
    id: "omelette",
    label: "Omelette",
    blurb: "Street-style karandi omelettes and masala folds.",
    items: [
      {
        name: "Omelette — Plain / Masala",
        description: "Fluffy omelette with onions, tomatoes, chilies, and herbs.",
        price: 5.99,
        dietary: "egg",
      },
      {
        name: "Plain Karandi Omelette",
        description: "Ladle-cooked South Indian omelette with a unique texture.",
        price: 6.99,
        dietary: "egg",
      },
      {
        name: "Chicken Karandi Omelette",
        description: "Ladle-cooked omelette stuffed with spicy minced chicken.",
        price: 7.99,
        dietary: "chicken",
      },
      {
        name: "Mutton Karandi Omelette",
        description: "Ladle-cooked omelette filled with tender spiced mutton.",
        price: 7.99,
        dietary: "mutton",
      },
    ],
  },
  {
    id: "biryani",
    label: "Biryani",
    blurb: "Seeraga samba rice, dum-cooked with whole spices.",
    items: [
      {
        name: "Chicken Biryani",
        description:
          "Fragrant seeraga samba rice simmered with rich spices and tender chicken.",
        price: 15.99,
        dietary: "chicken",
        signature: true,
      },
      {
        name: "Mutton Biryani",
        description:
          "Aromatic mutton biryani on seeraga samba rice, cooked until the meat yields.",
        price: 18.99,
        dietary: "mutton",
        signature: true,
      },
      {
        name: "Veg Biryani",
        description: "Vegetable biryani on seeraga samba rice with a blend of rich spices.",
        price: 12.99,
        dietary: "veg",
      },
      {
        name: "Chicken Biryani — 1/2 plate",
        description: "Half portion of our dum-style chicken biryani.",
        price: 8.99,
        dietary: "chicken",
      },
      {
        name: "Mutton Biryani — 1/2 plate",
        description: "Half portion of our dum-style mutton biryani.",
        price: 10.99,
        dietary: "mutton",
      },
      {
        name: "Veg Biryani — 1/2 plate",
        description: "Half portion of vegetable biryani.",
        price: 7.99,
        dietary: "veg",
      },
    ],
  },
  {
    id: "mains",
    label: "Main Dishes",
    blurb: "Gravies from Chettinad, Andhra, and Virudhunagar.",
    items: [
      {
        name: "Virudhunagar Mutton Curry",
        description:
          "Tender mutton in a rich, aromatic blend inspired by Virudhunagar kitchens.",
        price: 17.99,
        dietary: "mutton",
        signature: true,
        spicy: true,
      },
      {
        name: "Andhra Pepper Chicken",
        description: "Chicken with black pepper, tangy spices, and fresh herbs — true Andhra heat.",
        price: 14.99,
        dietary: "chicken",
        spicy: true,
      },
      {
        name: "Chettinadu Chicken Gravy",
        description: "Chicken simmered with Chettinad spices, coconut, and herbs.",
        price: 14.99,
        dietary: "chicken",
        spicy: true,
      },
      {
        name: "Chicken Kurma",
        description: "Mild, creamy chicken curry with yogurt and ground nuts.",
        price: 14.99,
        dietary: "chicken",
      },
      {
        name: "Veg Kurma",
        description: "Creamy mixed-vegetable curry with yogurt and ground nuts.",
        price: 12.99,
        dietary: "veg",
      },
    ],
  },
  {
    id: "combos",
    label: "Combos",
    blurb: "A full plate: biryani or parotta, gravy, soup, and a sweet.",
    items: [
      {
        name: "Chicken Combo",
        description: "Chicken biryani, 1 parotta, gravy, chicken soup, and sweet.",
        price: 20.99,
        dietary: "chicken",
        signature: true,
      },
      {
        name: "Mutton Combo",
        description: "Mutton biryani, 1 parotta, gravy, mutton soup, and sweet.",
        price: 22.99,
        dietary: "mutton",
        signature: true,
      },
      {
        name: "Veg Combo",
        description: "Veg biryani, 1 parotta, gobi 65, gravy, soup, and sweet.",
        price: 11.99,
        dietary: "veg",
      },
      {
        name: "Chicken Parotta Combo",
        description: "Two parottas with Andhra pepper chicken curry.",
        price: 15.99,
        dietary: "chicken",
        spicy: true,
      },
      {
        name: "Mutton Parotta Combo",
        description: "Two parottas with mild Madurai mutton curry.",
        price: 17.99,
        dietary: "mutton",
      },
      {
        name: "Idli with Chicken Curry",
        description: "Soft idlis served with medium-spicy chicken curry.",
        price: 15.99,
        dietary: "chicken",
      },
    ],
  },
  {
    id: "breads",
    label: "Breads",
    blurb: "Flaky parotta, kothu, and poori off the tawa.",
    items: [
      {
        name: "Parotta — 2 pieces",
        description: "Flaky, layered flatbread pan-roasted to gold.",
        price: 11.99,
        dietary: "veg",
      },
      {
        name: "Chicken Kothu Parotta",
        description: "Shredded parotta stir-fried with spicy chicken, egg, and spices.",
        price: 12.99,
        dietary: "chicken",
      },
      {
        name: "Egg Kothu Parotta",
        description: "Chopped parotta tossed with eggs, onions, and street-style spice.",
        price: 12.99,
        dietary: "egg",
      },
      {
        name: "Veg Kothu Parotta",
        description: "Layered parotta chopped and stir-fried with vegetables and herbs.",
        price: 11.99,
        dietary: "veg",
      },
      {
        name: "Poori",
        description: "Deep-fried, fluffy golden bread, served hot.",
        price: 5.99,
        dietary: "veg",
      },
    ],
  },
  {
    id: "beverages",
    label: "Beverages",
    blurb: "Filter coffee, lassi, and a glass of rose milk.",
    items: [
      { name: "Filter Coffee", description: "South Indian filter coffee, served hot.", price: 3.99, dietary: "veg" },
      { name: "Tea", description: "Spiced chai.", price: 3.99, dietary: "veg" },
      { name: "Mango Lassi", description: "Cool, sweet mango yogurt drink.", price: 4.99, dietary: "veg" },
      { name: "Rose Milk", description: "Chilled milk scented with rose.", price: 4.99, dietary: "veg" },
      { name: "Soda", description: "Soft drink.", price: 1.99, dietary: "veg" },
    ],
  },
  {
    id: "desserts",
    label: "Desserts",
    blurb: "A little something sweet at the end.",
    items: [
      {
        name: "Kavuniarusi Pongal",
        description: "Traditional Tamil sweet pongal made with kavuni arisi.",
        price: 5.99,
        dietary: "veg",
      },
      {
        name: "Broken Wheat Halwa",
        description: "Warm, ghee-rich broken wheat halwa.",
        price: 5.99,
        dietary: "veg",
      },
    ],
  },
  {
    id: "sides",
    label: "Sides",
    blurb: "Rice to round out a gravy.",
    items: [
      {
        name: "Curd Rice",
        description: "Cooling tempered yogurt rice.",
        price: 8.99,
        dietary: "veg",
      },
      {
        name: "Steamed Rice",
        description: "Plain steamed rice.",
        price: 3.49,
        dietary: "veg",
      },
    ],
  },
];

export function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

export const featuredDishes = [
  {
    name: "Chicken Biryani",
    description: "Seeraga samba rice, dum-cooked with spiced chicken and fried onions.",
    price: 15.99,
    image: "/images/biryani.jpg",
    href: "/menu#biryani",
  },
  {
    name: "Chicken 65",
    description: "Fiery, marinated boneless chicken fried until the crust snaps.",
    price: 13.99,
    image: "/images/fried.jpg",
    href: "/menu#appetizers",
  },
  {
    name: "Madras Masala Dosa",
    description: "Crisp fermented crepe filled with potato masala, chutney, and sambar.",
    price: 11.99,
    image: "/images/dosa.jpg",
    href: "/menu#dosa-idli",
  },
  {
    name: "Mutton Biryani",
    description: "Regal mutton and whole spices on fragrant seeraga samba rice.",
    price: 18.99,
    image: "/images/curry.jpg",
    href: "/menu#biryani",
  },
] as const;
