import { Currency, Product, ProductCategory } from '../types';

import heroModelsImg from '../assets/images/komse_hero.jpg';
import Loyelty_Jersey1Img from '../assets/images/Loyelty_Jersey1.jpg';
import Loyelty_Jersey2Img from '../assets/images/Loyelty_Jersey2.jpg';
import Loyelty_Jersey3Img from '../assets/images/Loyelty_Jersey3.jpg';
import Loyelty_Jersey4Img from '../assets/images/Loyelty_Jersey4.jpg';
import OverSize_Mesh_Baseball_ShirtImg1 from '../assets/images/OverSize_Mesh_Baseball_Shirt1.jpg';
import OverSize_Mesh_Baseball_ShirtImg2 from '../assets/images/OverSize_Mesh_Baseball_Shirt2.jpg';
import OverSize_Mesh_Baseball_ShirtImg3 from '../assets/images/OverSize_Mesh_Baseball_Shirt3.jpg';
import OverSize_Mesh_Baseball_ShirtImg4 from '../assets/images/OverSize_Mesh_Baseball_Shirt4.jpg';
import Green_White_Blue_OverallImg1 from '../assets/images/green_White_Bule_Overrall1.jpg';
import Green_White_Blue_OverallImg2 from '../assets/images/green_White_Bule_Overrall2.jpg';
import Green_White_Blue_OverallImg3 from '../assets/images/green_White_Bule_Overrall3.jpg';
import Green_White_Blue_OverallImg4 from '../assets/images/green_White_Bule_Overrall4.jpg';
import SL_66_Independence_Jesery1Img from '../assets/images/SL_66_Independence_Jesery1.jpg';
import SL_66_Independence_Jesery2Img from '../assets/images/SL_66_Independence_Jesery2.jpg';
import SL_66_Independence_Jesery3Img from '../assets/images/SL_66_Independence_Jesery3.jpg';
import SL_66_Independence_Jesery4Img from '../assets/images/SL_66_Independence_Jesery4.jpg';
import cultureHoodieImg1 from '../assets/images/Unisex_Turtleneck_Sweater1.jpg';
import uniksexcapImg from '../assets/images/uniksex cap.jpg';
import uniksexcapbImg from '../assets/images/uniksex capb.jpg';
import uniksexcapfImg from '../assets/images/uniksex capf.jpg';
import uniksexcapffImg from '../assets/images/uniksex capff.jpg';
import unisex_Visor_capImg1 from '../assets/images/unisex_Visor_caps1.jpg';
import unisex_Visor_capImg2 from '../assets/images/unisex_Visor_caps2.jpg';
import unisex_Visor_capImg3 from '../assets/images/unisex_Visor_caps3.jpg';
import unisex_Visor_capImg4 from '../assets/images/unisex_Visor_caps4.jpg';
import taffetaTracksuitImg1 from '../assets/images/Unisex_Taffeta_Tracksuit1.jpg';
import unisextaffetaTracksuitImg1 from '../assets/images/unisex_Taffeta_Tracksuit1.jpg';
import unisextaffetaTracksuitImg2 from '../assets/images/unisex_Taffeta_Tracksuit2.jpg';
import unisextaffetaTracksuitImg3 from '../assets/images/unisex_Taffeta_Tracksuit3.jpg';
import unisextaffetaTracksuitImg4 from '../assets/images/unisex_Taffeta_Tracksuit4.jpg';
import heritageJacketImg from '../assets/images/Unisex Denim Jacket and pants sets main.jpg';
import Unisex_Turtleneck_Sweater1Img from '../assets/images/Unisex_Turtleneck_Sweater1.jpg';
import Unisex_Turtleneck_Sweater2Img from '../assets/images/Unisex_Turtleneck_Sweater2.jpg';
import Unisex_Turtleneck_Sweater3Img from '../assets/images/Unisex_Turtleneck_Sweater3.jpg';
import Unisex_Turtleneck_Sweater4Img from '../assets/images/Unisex_Turtleneck_Sweater4.jpg';
import heritageJacketImg1 from '../assets/images/Unisex Denim Jacket and pants sets1.jpg';
import heritageJacketImg2 from '../assets/images/Unisex Denim Jacket and pants sets2.jpg';
import heritageJacketImg3 from '../assets/images/Unisex Denim Jacket and pants sets3.jpg';
import heritageJacketImg4 from '../assets/images/Unisex Denim Jacket and pants sets4.jpg';
import baseballJerseyImg from '../assets/images/232 Baseball Jersy m1.jpg';
import baseballJerseyDetail from '../assets/images/232 Baseball Jersy detail.jpg';
import baseballJerseyM3 from '../assets/images/232 Baseball m3.jpg';
import baseballJerseyM2 from '../assets/images/232 Baseball Jersy m2.jpg';
export const HERO_IMAGE = heroModelsImg;

export const CURRENCIES: Record<string, Currency> = {
  EUR: { code: 'EUR', symbol: '€', rate: 1.0, label: 'EUR €' },
  USD: { code: 'USD', symbol: '$', rate: 1.08, label: 'USD $' },
  GBP: { code: 'GBP', symbol: '£', rate: 0.85, label: 'GBP £' },
  NLE: { code: 'NLE', symbol: 'NLe ', rate: 24.5, label: 'NLE NLe' },
};

export const COLLECTION_CATEGORIES: {
  id: ProductCategory;
  title: string;
  count: string;
  image: string;
  description: string;
}[] = [
  {
    id: 'Jersey T-Shirts',
    title: 'T-Shirts',
    count: '14 Items',
    image: Loyelty_Jersey4Img,
    description: 'Premium organic cotton t-shirts with 3D gold embroidered crest and cultural motifs.',
  },
  {
    id: 'Sweaters',
    title: 'Sweaters',
    count: '9 Items',
    image: cultureHoodieImg1,
    description: 'Heavyweight fleece hoodies with gold cultural insignia.',
  },
  {
    id: 'Jackets',
    title: 'Jackets',
    count: '8 Items',
    image: heritageJacketImg,
    description: 'Tailored bombers and track jackets featuring Sierra Leonean motifs.',
  },
  {
    id: 'Caps',
    title: 'Caps',
    count: '6 Items',
    image: uniksexcapImg,
    description: 'Adjustable snapbacks and strapbacks with 3D gold metallic embroidery.',
  },
  {
    id: 'Shirts',
    title: 'Shirts',
    count: '10 Items',
    image: OverSize_Mesh_Baseball_ShirtImg2,
    description: 'Lightweight button-up shirts and polos with cultural embroidery and premium finishes.',
  },
  {
    id: 'Overalls',
    title: 'Overalls',
    count: '5 Items',
    image: Green_White_Blue_OverallImg1,
    description: 'Premium organic cotton overalls with 3D gold embroidered crest and cultural motifs.',
  },
 
 
];

export const PRODUCTS: Product[] = [
  {
    id: 'p-1',
    name: 'Love & Loyalty Jersey',
    category: 'Jersey T-Shirts',
    price: 50.0,
    originalPrice: 70.0,
    rating: 4.8,
    reviewCount: 24,
    image: Loyelty_Jersey4Img,
    gallery: [
      Loyelty_Jersey1Img,
      Loyelty_Jersey2Img,
      Loyelty_Jersey3Img,
      Loyelty_Jersey4Img,
    ],
    description:
      'The KOMSE Love & Loyalty Jersey is a premium organic cotton t-shirt featuring 3D gold embroidered crest and cultural motifs. Designed for comfort and style, it represents pride in heritage while offering a modern streetwear aesthetic.',
    features: [
      'Premium jersey material fabric',
      '3D gold embroidered crest',
      'Breathable and durable',
      'Sustainable production',
    ],
    sizes: [ 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'],
    colors: [
      { name: 'Heritage Black', hex: '#094d04' },
      { name: 'Ivory', hex: '#fefefeee' },
      { name: 'Forest Green', hex: '#000476' },
    ],
    isBestSeller: true,
    inStock: true,
  },

  {
    id: 'p-5',
    name: 'Sierra Leone 66 Independence Jersey',
    category: 'Jersey T-Shirts',
    price: 50.0,
    originalPrice: 70.0,
    rating: 4.8,
    reviewCount: 24,
    image: SL_66_Independence_Jesery4Img,
    gallery: [
      SL_66_Independence_Jesery1Img,
      SL_66_Independence_Jesery2Img,
      SL_66_Independence_Jesery3Img,
      SL_66_Independence_Jesery4Img,
    ],
    description:
      'KOMSE 66 Independence Jersey is a premium organic cotton t-shirt featuring 3D gold embroidered crest and cultural motifs. Designed for comfort and style, it represents pride in heritage while offering a modern streetwear aesthetic.',
    features: [
      'Premium jersey material fabric',
      '3D gold embroidered crest',
      'Breathable and durable',
      'Sustainable production',
    ],
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'],
    colors: [
      { name: 'Forest Green', hex: '#000476' },
    ],
    isBestSeller: true,
    inStock: true,
  },

  {
    id: 'p-2',
    name: 'OverSize Mesh Baseball Shirt',
    category: 'Shirts',
    price: 50.0,
    originalPrice: 70.0,
    rating: 4.8,
    reviewCount: 24,
    image: OverSize_Mesh_Baseball_ShirtImg1,
    gallery: [
      OverSize_Mesh_Baseball_ShirtImg1,
      OverSize_Mesh_Baseball_ShirtImg2,
      OverSize_Mesh_Baseball_ShirtImg3,
      OverSize_Mesh_Baseball_ShirtImg4,
    ],
    description:
      'The KOMSE OverSize Mesh Baseball Shirt is a premium organic cotton t-shirt featuring 3D gold embroidered crest and cultural motifs. Designed for comfort and style, it represents pride in heritage while offering a modern streetwear aesthetic.',
    features: [
      'Premium Baseball material fabric',
      'Breathable and durable',
    ],
    sizes: [ 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'],
    colors: [
      { name: 'Heritage Black', hex: '#094d04' },
      { name: 'Ivory', hex: '#fefefeee' },
      { name: 'Forest Green', hex: '#000476' },
    ],
    isBestSeller: true,
    inStock: true,
  },

  {
    id: 'p-3',
    name: 'Unisex Mesh Basketball Cap',
    category: 'Caps',
    price: 25.0,
    originalPrice: 35.0,
    rating: 4.5,
    reviewCount: 14,
    image: uniksexcapImg,
    gallery: [
      uniksexcapImg,uniksexcapbImg,uniksexcapfImg,uniksexcapffImg
    ],
    description:
      'The KOMSE Signature Cap features High Quality DTF Printed Logo with adjustable snapback closure. Perfect for any occasion, whether casual or stylish.',
    features: [
      'DTF Printed Logo',
      'Adjustable snapback',
      'Unisex fit',
      '80% cotton twill',
      'Curved bill',
    ],
    sizes: ['One Size'],
    colors: [
      { name: 'White', hex: '#ffffff' },
      { name: 'Burgundy', hex: '#0229d7' },
    ],
    isBestSeller: false,
    inStock: true,
    isNew: true,
  },

   {
    id: 'p-10',
    name: 'Unisex Visor Cap',
    category: 'Caps',
    price: 25.0,
    originalPrice: 35.0,
    rating: 4.5,
    reviewCount: 14,
    image: unisex_Visor_capImg2,
    gallery: [
      unisex_Visor_capImg1,
      unisex_Visor_capImg2,
      unisex_Visor_capImg3,
      unisex_Visor_capImg4
    ],
    description:
      ' KOMSE Design Unisex Visor Cap features High Quality DTF Printed Logo with adjustable snapback closure. Perfect for any occasion, whether casual or stylish.',
    features: [
      'DTF Printed Logo',
      'Adjustable snapback',
      'Unisex fit',
      '80% cotton twill',
      'Curved bill',
    ],
    sizes: ['One Size'],
    colors: [
      { name: 'Green', hex: '#067044' },
      { name: 'White', hex: '#ffffff' },
      { name: 'Burgundy', hex: '#0229d7' },
    ],
    isBestSeller: false,
    inStock: false,
  },

  {
    id: 'p-4',
    name: 'Unisex Denim Jacket & Pants Set',
    category: 'Jackets',
    price: 100.0,
    originalPrice: 130.0,
    rating: 4.7,
    reviewCount: 12,
    image: heritageJacketImg,
    gallery: [
      heritageJacketImg,
      heritageJacketImg1,
      heritageJacketImg2,
      heritageJacketImg3,
      heritageJacketImg4,
    ],
    description:
      'The KOMSE Heritage Denim Jacket & Pants Set is a premium denim ensemble featuring cultural embroidery details and reinforced seams. Designed for durability and style, it represents pride in heritage while offering a modern streetwear aesthetic.',
    features: [
      'Premium denim construction',
      'Cultural embroidery details',
      'Reinforced seams',
      'Includes matching pants',
      'Multiple pockets',
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL'],
    colors: [
      { name: 'Blue', hex: '#06062c' },
    ],
    isBestSeller: true,
    inStock: false,
  },

   {
    id: 'p-6',
    name: 'Unisex Taffeta Tracksuit',
    category: 'Jackets',
    price: 100.0,
    originalPrice: 130.0,
    rating: 4.5,
    reviewCount: 10,
    image: taffetaTracksuitImg1,
    gallery: [
      unisextaffetaTracksuitImg1,
      unisextaffetaTracksuitImg2,
      unisextaffetaTracksuitImg3,
      unisextaffetaTracksuitImg4,
      
    ],
    description:
      'The KOMSE Unisex Taffeta Tracksuit is a premium tracksuit featuring cultural embroidery details and reinforced seams. Designed for durability and style, it represents pride in heritage while offering a modern streetwear aesthetic.',
    features: [
      'Premium Taffeta construction',
      'Cultural embroidery details',
      'Includes matching pants',
      'Multiple pockets',
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL'],
    colors: [
      { name: 'Blue', hex: '#06062c' },
    ],
    isBestSeller: true,
    inStock: true,
    isNew: true,
  },
 
  {
    id: 'p-8',
    name: 'Unisex Green White Blue Overall',
    category: 'Overalls',
    price: 50.0,
    originalPrice: 70.0,
    rating: 4.8,
    reviewCount: 24,
    image: Green_White_Blue_OverallImg1,
    gallery: [
      Green_White_Blue_OverallImg1,
      Green_White_Blue_OverallImg2,
      Green_White_Blue_OverallImg3,
      Green_White_Blue_OverallImg4,
    ],
    description:
      'KOMSE Unisex Green White Blue Overall is a premium organic cotton overall featuring 3D gold embroidered crest and cultural motifs. Designed for comfort and style, it represents pride in heritage while offering a modern streetwear aesthetic.',
    features: [
      'Premium overall material fabric',
      'Breathable and durable',
    ],
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'],
    colors: [
      { name: 'Heritage Black', hex: '#094d04' },
      { name: 'Ivory', hex: '#fefefeee' },
      { name: 'Forest Green', hex: '#000476' },
    ],
    isBestSeller: true,
    inStock: false,
  },

  {
    id: 'p-9',
    name: '+232 Baseball Jersey',
    category: 'Jersey T-Shirts',
    price: 50.0,
    originalPrice: 60.0,
    rating: 4.6,
    reviewCount: 10,
    image: baseballJerseyImg,
    gallery: [
      baseballJerseyDetail,
      baseballJerseyM3,
      baseballJerseyImg,
      baseballJerseyM2,
    ],
    description:
      'Step into bold streetwear with the KOMSE 232 Baseball Jersey, a statement piece that blends classic athletic style with contemporary Sierra Leonean identity. Crafted from lightweight, breathable jersey fabric, it delivers a comfortable relaxed fit while featuring distinctive 232 detailing that gives the design its signature character.',
    features: [
      'Lightweight breathable jersey fabric',
      'Relaxed athletic fit',
      'Distinctive 232 chest detailing',
      'Machine washable, colorfast print',
    ],
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'],
    colors: [
      { name: 'Green', hex: '#01660f' },
      { name: 'white', hex: '#fbfcfc' },
      { name: 'bliue', hex: '#0252f1' },
    ],
    isBestSeller: true,
    inStock: false,
    isNew:false,

  },

   {
    id: 'p-11',
    name: 'Unisex Turtleneck Sweater',
    category: 'Sweaters',
    price: 50.0,
    originalPrice: 60.0,
    rating: 4.6,
    reviewCount: 10,
    image: Unisex_Turtleneck_Sweater3Img,
    gallery: [
      Unisex_Turtleneck_Sweater1Img,
      Unisex_Turtleneck_Sweater2Img,
      Unisex_Turtleneck_Sweater3Img,
      Unisex_Turtleneck_Sweater4Img,
    ],
    description:
      'Step into bold streetwear with the KOMSE Unisex Turtleneck Sweater, a statement piece that blends classic athletic style with contemporary Sierra Leonean identity. Crafted from heavyweight, breathable sweater fabric, it delivers a comfortable relaxed fit while featuring distinctive Sierra Leone Map detailing that gives the design its signature character.',
    features: [
      'Heavyweight breathable sweater fabric',
      'Relaxed athletic fit',
      'Distinctive Sierra Leone Map chest detailing',
      'Machine washable, colorfast print',
    ],
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'],
    colors: [
      { name: 'Green', hex: '#01660f' },
      { name: 'white', hex: '#fbfcfc' },
      { name: 'bliue', hex: '#0252f1' },
    ],
    isBestSeller: true,
    inStock: false,

  },
];

export const PATTERN_PRESETS = [
  { id: 'pat-1', name: 'Sierra Crown Diamond', description: 'Traditional geometric diamond weave' },
  { id: 'pat-2', name: 'Freetown Coastal Wave', description: 'Abstract ripple vector emblem' },
  { id: 'pat-3', name: 'Lion Mountain Crest', description: 'Regal shield insignia in gold thread' },
  { id: 'pat-4', name: 'Krio Heritage Lines', description: 'Minimalist parallel chevron stripes' },
];
