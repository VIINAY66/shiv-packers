/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PackagingSpecLimits {
  minLength: number;
  maxLength: number;
  minWidth: number;
  maxWidth: number;
  minHeight: number;
  maxHeight: number;
  minQty: number;
}

export interface MaterialOption {
  id: string;
  name: string;
  description: string;
  baseCostPerSqIn: number;
  availableGSMs: number[];
}

export interface FinishOption {
  id: string;
  name: string;
  description: string;
  baseCostPerUnit: number;
}

export interface PackagingProduct {
  id: string;
  name: string;
  tagline: string;
  description: string;
  fullDetails: string;
  image: string;
  limits: PackagingSpecLimits;
  materials: MaterialOption[];
  finishes: FinishOption[];
  baseUnitCost: number;
}

export interface QuoteRequest {
  productId: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  projectName: string;
  length: number;
  width: number;
  height: number;
  materialId: string;
  gsm: number;
  finishIds: string[];
  quantity: number;
  additionalNotes?: string;
  estimatedUnitPrice: number;
  estimatedTotalPrice: number;
  estimatedLeadTimeDays: number;
  status: 'pending' | 'reviewed' | 'approved' | 'completed';
  createdAt: string;
  id: string;
}

export interface GeneralInquiry {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  createdAt: string;
  status: 'unread' | 'read' | 'replied';
}

export interface AIRecommendation {
  recommendedProductType: string;
  dimensions: {
    suggestedLength: number;
    suggestedWidth: number;
    suggestedHeight: number;
    unit: string;
  };
  materialGSMRecommendation: {
    material: string;
    gsm: number;
    reasoning: string;
  };
  finishingOptions: {
    name: string;
    description: string;
    vibeEffect: string;
  }[];
  pricingOverview: {
    baseUnitPriceEstimate: number;
    bulkUnitPriceEstimate: number;
    minimumOrderQuantity: number;
    toolingCostEstimate: number;
  };
  strategicAdvice: {
    b2bPositioning: string;
    sustainabilityAngle: string;
    shippingEfficiency: string;
  };
  executiveSummary: string;
}
