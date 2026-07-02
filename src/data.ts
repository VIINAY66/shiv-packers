/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PackagingProduct } from './types';

// Import image assets via Vite relative imports for robust deployment bundling on Hostinger
import luxuryRigidBoxImg from './assets/images/luxury_rigid_box_1782829429920.jpg';
import ecommerceMailerImg from './assets/images/ecommerce_mailer_1782829446061.jpg';
import sustainableEcoImg from './assets/images/sustainable_box_1782829459062.jpg';
import dieCutCustomImg from './assets/images/die_cut_box_1782829470833.jpg';

export const PACKAGING_PRODUCTS: PackagingProduct[] = [
  {
    id: 'luxury-rigid',
    name: 'Luxury Rigid Boxes',
    tagline: 'Precision-crafted structural elegance for high-end brands.',
    description: 'Thick, non-collapsible cardboard structures wrapped in custom specialty papers. Perfect for jewelry, electronics, and luxury cosmetics.',
    fullDetails: 'Manufactured with high-density greyboard (800-1800 GSM) wrapped in premium coated or textured art papers. Options include magnetic closures, velvet flocking, custom foam inserts, and ribbon pull-tabs.',
    image: luxuryRigidBoxImg,
    limits: {
      minLength: 3,
      maxLength: 18,
      minWidth: 3,
      maxWidth: 18,
      minHeight: 1.5,
      maxHeight: 8,
      minQty: 500
    },
    materials: [
      {
        id: 'grayboard-velvet',
        name: 'Premium Velvet-Coated Greyboard',
        description: 'Ultra-smooth velvet touch paper wrap over rigid dense board.',
        baseCostPerSqIn: 0.015,
        availableGSMs: [1200, 1500, 1800]
      },
      {
        id: 'grayboard-textured',
        name: 'Linear Textured Fine Art Paper wrap',
        description: 'Distinct tactile ribbed textures for an organic premium feel.',
        baseCostPerSqIn: 0.018,
        availableGSMs: [1000, 1200, 1500]
      },
      {
        id: 'grayboard-metallic',
        name: 'Iridescent Metallic Pearl wrap',
        description: 'High-end reflective metallic finish for ultimate tech and cosmetic brands.',
        baseCostPerSqIn: 0.022,
        availableGSMs: [1200, 1500]
      }
    ],
    finishes: [
      { id: 'gold-foil', name: 'Gold Foil Stamping', description: 'Metallic gold foil pressed onto paper under heat.', baseCostPerUnit: 0.45 },
      { id: 'spot-uv', name: 'Spot Gloss UV', description: 'Glossy raised varnish on targeted areas for high-contrast light reflections.', baseCostPerUnit: 0.30 },
      { id: 'emboss', name: 'Deep Debossing/Embossing', description: 'Three-dimensional indentation or raising of branding.', baseCostPerUnit: 0.25 },
      { id: 'magnetic-lid', name: 'Premium Magnetic Closure', description: 'Hidden rare-earth magnets for a satisfying unboxing snap.', baseCostPerUnit: 0.90 }
    ],
    baseUnitCost: 2.50
  },
  {
    id: 'ecommerce-mailer',
    name: 'E-commerce Mailer Boxes',
    tagline: 'High-durability self-adhesive parcels with premium matte exterior.',
    description: 'Corrugated boxes designed for the ultimate unboxing experience. Robust shipping protection meets custom luxury branding.',
    fullDetails: 'Crafted with premium fluted corrugation (E-flute or B-flute) for crushing resistance. Includes optional double self-adhesive strips for easy customer returns and tear-open strips.',
    image: ecommerceMailerImg,
    limits: {
      minLength: 5,
      maxLength: 24,
      minWidth: 4,
      maxWidth: 20,
      minHeight: 2,
      maxHeight: 12,
      minQty: 1000
    },
    materials: [
      {
        id: 'kraft-corrugated',
        name: 'Premium White Kraft Corrugated',
        description: 'Crisp, high-density bleached kraft paperboard for vibrant colors.',
        baseCostPerSqIn: 0.005,
        availableGSMs: [350, 400, 450]
      },
      {
        id: 'brown-kraft-corrugated',
        name: 'Reinforced Natural Brown Kraft',
        description: 'Heavy-duty unbleached brown corrugated board for a rugged, premium feel.',
        baseCostPerSqIn: 0.004,
        availableGSMs: [350, 400, 450]
      }
    ],
    finishes: [
      { id: 'matte-lam', name: 'Soft-Touch Matte Lamination', description: 'Micro-textured clear layer that repels scuffs and water.', baseCostPerUnit: 0.20 },
      { id: 'black-foil', name: 'Matte Black Foil Stamping', description: 'Sleek, understated reflective hot stamping.', baseCostPerUnit: 0.35 },
      { id: 'interior-print', name: 'Full-Color Interior Print', description: 'Print custom patterns or greetings on the inside of the lid.', baseCostPerUnit: 0.40 }
    ],
    baseUnitCost: 0.85
  },
  {
    id: 'sustainable-eco',
    name: 'Sustainable & Biodegradable Packaging',
    tagline: '100% compostable materials, zero luxury compromised.',
    description: 'Eco-friendly, water-based soy ink prints on fully recycled fibrous boards with zero plastic lamination.',
    fullDetails: 'Engineered entirely from recycled ocean plastics, post-consumer agricultural waste, or FSC-certified natural pulp. Disintegrates naturally in compost without leaving toxic residues.',
    image: sustainableEcoImg,
    limits: {
      minLength: 4,
      maxLength: 16,
      minWidth: 4,
      maxWidth: 16,
      minHeight: 1,
      maxHeight: 8,
      minQty: 500
    },
    materials: [
      {
        id: 'agri-waste',
        name: 'Upcycled Agricultural Fiber Paperboard',
        description: 'Slightly flecked tactile board made from sugarcane bagasse and wheat straw.',
        baseCostPerSqIn: 0.008,
        availableGSMs: [300, 350, 400]
      },
      {
        id: 'fsc-recycled',
        name: 'FSC-Certified Ocean-Bound Kraft Board',
        description: 'Strictly monitored post-consumer wood pulp board with organic hand-feel.',
        baseCostPerSqIn: 0.007,
        availableGSMs: [350, 400]
      }
    ],
    finishes: [
      { id: 'soy-ink', name: 'Organic Soy-Based Water Printing', description: 'Vibrant, completely non-toxic, compostable soy ink branding.', baseCostPerUnit: 0.10 },
      { id: 'blind-deboss', name: 'Blind Debossing (No Foil)', description: 'Branding deeply impressed into the paper fibers without foils or ink.', baseCostPerUnit: 0.15 },
      { id: 'hemp-ribbon', name: 'Organic Hemp Ribbon Tie', description: 'Hand-woven biodegradable ribbon fastening.', baseCostPerUnit: 0.50 }
    ],
    baseUnitCost: 1.10
  },
  {
    id: 'die-cut-custom',
    name: 'Precision Die-Cut Custom Boxes',
    tagline: 'Avant-garde geometric shapes that fit your product like a glove.',
    description: 'Custom structural templates engineered from scratch. Perfect for specialized cosmetics, premium liquors, and complex shapes.',
    fullDetails: 'Custom knives and steel molds created specifically to punch unique locks, internal fold-outs, or hexagonal slide structures. Highly customizable and structurally protective.',
    image: dieCutCustomImg,
    limits: {
      minLength: 3,
      maxLength: 15,
      minWidth: 3,
      maxWidth: 15,
      minHeight: 1,
      maxHeight: 10,
      minQty: 1000
    },
    materials: [
      {
        id: 'sbs-board',
        name: 'Solid Bleached Sulfate (SBS) Board',
        description: 'Superb stiffness, ultra-white premium finish for cosmetics and apothecary.',
        baseCostPerSqIn: 0.009,
        availableGSMs: [300, 350, 400]
      },
      {
        id: 'black-kraft',
        name: 'Solid Dyed Jet Black Core Board',
        description: 'Solid premium black cardstock dyed through, so edges never show white paper lines.',
        baseCostPerSqIn: 0.012,
        availableGSMs: [350, 450]
      }
    ],
    finishes: [
      { id: 'holographic-foil', name: 'Prismatic Holographic Foil', description: 'Rainbow spectrum color-shifting foil stamp.', baseCostPerUnit: 0.55 },
      { id: 'die-cut-window', name: 'Integrated Acetate-Free Window', description: 'Open geometric cutouts so customers can touch the product itself.', baseCostPerUnit: 0.30 },
      { id: 'spot-gold-texture', name: 'Tactile Raised Gold Screen Print', description: 'Felt texture pattern of metallic gold ink.', baseCostPerUnit: 0.65 }
    ],
    baseUnitCost: 1.30
  }
];

export function calculateEstimatedPrice(params: {
  productId: string;
  length: number;
  width: number;
  height: number;
  materialId: string;
  gsm: number;
  finishIds: string[];
  quantity: number;
}) {
  const product = PACKAGING_PRODUCTS.find(p => p.id === params.productId);
  if (!product) return { unitPrice: 0, totalPrice: 0, toolingCost: 0, leadTimeDays: 0 };

  const material = product.materials.find(m => m.id === params.materialId) || product.materials[0];
  
  // Surface area calculation: Box surface area = 2 * (L*W + W*H + L*H)
  const surfaceArea = 2 * (params.length * params.width + params.width * params.height + params.length * params.height);
  
  // Material base cost scales with surface area and GSM ratio (relative to standard 350 GSM)
  const gsmFactor = params.gsm / 350;
  const materialCost = surfaceArea * material.baseCostPerSqIn * gsmFactor;
  
  // Finishes cost
  let finishesCost = 0;
  params.finishIds.forEach(id => {
    const f = product.finishes.find(finish => finish.id === id);
    if (f) finishesCost += f.baseCostPerUnit;
  });
  
  // Base raw unit cost
  const rawUnitCost = product.baseUnitCost + materialCost + finishesCost;
  
  // Quantity discount
  let qtyDiscount = 1.0;
  if (params.quantity >= 5000) {
    qtyDiscount = 0.58; // 42% discount for super bulk
  } else if (params.quantity >= 2500) {
    qtyDiscount = 0.68;
  } else if (params.quantity >= 1000) {
    qtyDiscount = 0.78;
  } else if (params.quantity >= 500) {
    qtyDiscount = 0.88;
  }
  
  const discountedUnitCost = rawUnitCost * qtyDiscount;
  
  // Custom tooling or setup fee (one-time)
  let toolingCost = 250;
  if (params.productId === 'luxury-rigid') toolingCost = 450; // rigid boxes require precision steel-rule dies
  if (params.productId === 'die-cut-custom') toolingCost = 350;
  
  // Waive tooling cost for high quantities
  if (params.quantity >= 2000) {
    toolingCost = 0;
  }
  
  const unitPrice = parseFloat(discountedUnitCost.toFixed(2));
  const totalPrice = parseFloat((unitPrice * params.quantity + toolingCost).toFixed(2));
  
  // Lead time calculations
  let leadTimeDays = 12;
  if (params.quantity >= 5000) leadTimeDays = 21;
  else if (params.quantity >= 2500) leadTimeDays = 16;
  else if (params.quantity >= 1000) leadTimeDays = 14;
  
  // Premium rigid boxes take slightly longer due to handmade wrapping steps
  if (params.productId === 'luxury-rigid') {
    leadTimeDays += 4;
  }
  
  return {
    unitPrice,
    totalPrice,
    toolingCost,
    leadTimeDays
  };
}
