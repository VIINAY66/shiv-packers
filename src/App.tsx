/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { 
  Box, 
  Sparkles, 
  Sliders, 
  Layers, 
  Send, 
  ShieldCheck, 
  Calendar, 
  Coins, 
  FileText, 
  ChevronRight, 
  Clock, 
  PenTool, 
  ArrowRight, 
  Leaf, 
  HelpCircle, 
  CheckCircle2, 
  User, 
  Building, 
  Mail, 
  Phone, 
  Eye, 
  SlidersHorizontal,
  FolderLock,
  Download,
  Info
} from 'lucide-react';
import { PACKAGING_PRODUCTS, calculateEstimatedPrice } from './data';
import { PackagingProduct, QuoteRequest, GeneralInquiry, AIRecommendation } from './types';

export default function App() {
  // Navigation State
  // "collections" | "simulator" | "ai-strategist" | "craftsmanship" | "inquiries" | "admin"
  const [activeTab, setActiveTab] = useState<string>('collections');
  
  // Selected Product for Simulator
  const [selectedProductId, setSelectedProductId] = useState<string>('luxury-rigid');
  
  // Simulator State
  const [length, setLength] = useState<number>(10);
  const [width, setWidth] = useState<number>(8);
  const [height, setHeight] = useState<number>(4);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>('grayboard-velvet');
  const [selectedGSM, setSelectedGSM] = useState<number>(1200);
  const [selectedFinishIds, setSelectedFinishIds] = useState<string[]>(['gold-foil', 'magnetic-lid']);
  const [quantity, setQuantity] = useState<number>(1000);
  
  // Client Contact Details (Inquiry Form)
  const [companyName, setCompanyName] = useState<string>('');
  const [contactName, setContactName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [projectName, setProjectName] = useState<string>('');
  const [additionalNotes, setAdditionalNotes] = useState<string>('');
  
  // Submitted Inquiries List (Local Storage Persistence)
  const [submittedQuotes, setSubmittedQuotes] = useState<QuoteRequest[]>([]);
  const [generalInquiries, setGeneralInquiries] = useState<GeneralInquiry[]>([]);
  
  // Success state for quote submission
  const [isSubmitSuccess, setIsSubmitSuccess] = useState<boolean>(false);
  const [recentSubmittedId, setRecentSubmittedId] = useState<string>('');

  // AI Strategist State
  const [productDesc, setProductDesc] = useState<string>('We craft limited-edition artisanal whiskey bottles, hand-blown glass, retailing at $220. We want a stunning gift box that unboxes like a luxury safe, emphasizing heavy structural board and subtle gold branding.');
  const [targetAudience, setTargetAudience] = useState<string>('Elite whiskey connoisseurs, premium corporate gifters, high-net-worth collectors.');
  const [preferredVibe, setPreferredVibe] = useState<string>('Royal, heavyweight, cinematic dark luxury with deep tactile debossing.');
  const [sizeHint, setSizeHint] = useState<string>('Length 5 inches, Width 5 inches, Height 12 inches.');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiRecommendation, setAiRecommendation] = useState<AIRecommendation | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [clientApiKey, setClientApiKey] = useState<string>(() => {
    return localStorage.getItem('shri_gemini_api_key') || '';
  });
  const [showApiKeySetting, setShowApiKeySetting] = useState<boolean>(false);

  // Active view in Collections
  const [selectedCollectionDetail, setSelectedCollectionDetail] = useState<PackagingProduct | null>(PACKAGING_PRODUCTS[0]);

  // Load submissions from localStorage on mount
  useEffect(() => {
    const savedQuotes = localStorage.getItem('shri_packers_quotes');
    const savedInquiries = localStorage.getItem('shri_packers_inquiries');
    if (savedQuotes) {
      setSubmittedQuotes(JSON.parse(savedQuotes));
    } else {
      // Seed initial dummy quote for demonstration purposes
      const dummyQuote: QuoteRequest = {
        id: 'SP-QUOTE-9421',
        productId: 'luxury-rigid',
        companyName: 'Aether Perfumes Paris',
        contactName: 'Mathilde Laurent',
        email: 'mathilde@aetherperfumes.com',
        phone: '+33 1 42 27 78 90',
        projectName: 'L\'Or de l\'Aube Perfume Box',
        length: 6,
        width: 6,
        height: 3,
        materialId: 'grayboard-velvet',
        gsm: 1500,
        finishIds: ['gold-foil', 'magnetic-lid', 'spot-uv'],
        quantity: 1500,
        additionalNotes: 'Requires micro-foam custom die-cut velvet insert for 100ml flacon. Gold foil needs extreme precision on the floral monogram.',
        estimatedUnitPrice: 4.85,
        estimatedTotalPrice: 7725.00,
        estimatedLeadTimeDays: 18,
        status: 'pending',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1 day ago
      };
      setSubmittedQuotes([dummyQuote]);
      localStorage.setItem('shri_packers_quotes', JSON.stringify([dummyQuote]));
    }
    
    if (savedInquiries) {
      setGeneralInquiries(JSON.parse(savedInquiries));
    }
  }, []);

  // Update simulator when selected product changes
  useEffect(() => {
    const product = PACKAGING_PRODUCTS.find(p => p.id === selectedProductId);
    if (product) {
      setLength(Math.round((product.limits.minLength + product.limits.maxLength) / 2));
      setWidth(Math.round((product.limits.minWidth + product.limits.maxWidth) / 2));
      setHeight(Math.round((product.limits.minHeight + product.limits.maxHeight) / 2));
      setSelectedMaterialId(product.materials[0].id);
      setSelectedGSM(product.materials[0].availableGSMs[0]);
      setSelectedFinishIds([product.finishes[0].id]);
      setQuantity(product.limits.minQty);
    }
  }, [selectedProductId]);

  // Calculate pricing based on current inputs
  const currentProduct = PACKAGING_PRODUCTS.find(p => p.id === selectedProductId) || PACKAGING_PRODUCTS[0];
  const { unitPrice, totalPrice, toolingCost, leadTimeDays } = calculateEstimatedPrice({
    productId: selectedProductId,
    length,
    width,
    height,
    materialId: selectedMaterialId,
    gsm: selectedGSM,
    finishIds: selectedFinishIds,
    quantity
  });

  // Handle Finish Selection Toggles
  const toggleFinish = (id: string) => {
    if (selectedFinishIds.includes(id)) {
      setSelectedFinishIds(selectedFinishIds.filter(fId => fId !== id));
    } else {
      setSelectedFinishIds([...selectedFinishIds, id]);
    }
  };

  // Submit Quote Inquiry
  const handleQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !contactName || !email || !projectName) {
      alert('Please complete all primary fields to register your specification sheets.');
      return;
    }

    const newQuote: QuoteRequest = {
      id: `SP-QUOTE-${Math.floor(1000 + Math.random() * 9000)}`,
      productId: selectedProductId,
      companyName,
      contactName,
      email,
      phone,
      projectName,
      length,
      width,
      height,
      materialId: selectedMaterialId,
      gsm: selectedGSM,
      finishIds: selectedFinishIds,
      quantity,
      additionalNotes,
      estimatedUnitPrice: unitPrice,
      estimatedTotalPrice: totalPrice,
      estimatedLeadTimeDays: leadTimeDays,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    const updated = [newQuote, ...submittedQuotes];
    setSubmittedQuotes(updated);
    localStorage.setItem('shri_packers_quotes', JSON.stringify(updated));
    
    setRecentSubmittedId(newQuote.id);
    setIsSubmitSuccess(true);
    
    // Clear form
    setCompanyName('');
    setContactName('');
    setPhone('');
    setProjectName('');
    setAdditionalNotes('');
  };

  // Run AI strategic consulting using Server-side Gemini API route or Client-side backup (e.g. for static hostings like Hostinger)
  const handleAiConsult = async () => {
    setIsAiLoading(true);
    setAiError(null);

    const prompt = `You are the Chief Packaging Strategist, Technical Architect, and expert UI/UX Designer for "Shri Packers" (Motto: "Premium Packaging Redefined").
We manufacture high-end boxes (Luxury Rigid, E-commerce, Sustainable, Die-Cut).

A B2B client has approached us with the following product profile:
- Product Description: "${productDesc || 'Not specified'}"
- Target Audience: "${targetAudience || 'Not specified'}"
- Preferred Vibe: "${preferredVibe || 'Not specified'}"
- Dimensions / Size Hint: "${sizeHint || 'Not specified'}"

Please design the ultimate premium packaging solution for them. Return your strategic assessment in JSON format strictly matching this schema:
{
  "recommendedProductType": "Luxury Rigid Boxes" | "E-commerce Packaging" | "Sustainable Packaging" | "Die-Cut Custom Boxes",
  "dimensions": {
    "suggestedLength": number,
    "suggestedWidth": number,
    "suggestedHeight": number,
    "unit": "inches"
  },
  "materialGSMRecommendation": {
    "material": "string (e.g. 1200 GSM Greyboard wrapped in 150 GSM Matte Velvet Lamination paper)",
    "gsm": number,
    "reasoning": "string explaining why this is the perfect structural weight for security, unboxing sound, and tactile luxurious premium hand-feel"
  },
  "finishingOptions": [
    {
      "name": "string (e.g. Gold Foil Debossing, Velvet Soft-Touch Matte Lamination, Spot Gloss UV)",
      "description": "string",
      "vibeEffect": "string explaining how this specifically creates the unboxing experience"
    }
  ],
  "pricingOverview": {
    "baseUnitPriceEstimate": number,
    "bulkUnitPriceEstimate": number,
    "minimumOrderQuantity": number,
    "toolingCostEstimate": number
  },
  "strategicAdvice": {
    "b2bPositioning": "string explaining how this packaging allows them to price their product higher and attract premium clients",
    "sustainabilityAngle": "string showing how they can market this packaging as an eco-conscious luxury benefit",
    "shippingEfficiency": "string detailing stackability, volumetric optimization, and flat-pack availability if applicable"
  },
  "executiveSummary": "string summarizing the strategic unboxing experience we are proposing for their brand in a refined, inspiring, and executive tone."
}

Do not include any markdown backticks or the word "json" in your response. Return raw, parseable JSON only.`;

    // Try client-side first if API Key is configured in localStorage
    if (clientApiKey.trim()) {
      try {
        const ai = new GoogleGenAI({ apiKey: clientApiKey.trim() });
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          }
        });
        
        const text = response.text || '{}';
        const parsed = JSON.parse(text.trim());
        setAiRecommendation(parsed);
        setIsAiLoading(false);
        return;
      } catch (err: any) {
        console.error('Client-side Gemini error:', err);
        setAiError(`Client-side Gemini error: ${err.message || err}. Please double check your API key.`);
        setIsAiLoading(false);
        return;
      }
    }

    // Otherwise, try the server API route
    try {
      const response = await fetch('/api/recommendation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productDescription: productDesc,
          targetAudience,
          preferredVibe,
          sizeHint
        })
      });

      if (!response.ok) {
        throw new Error('Our full-stack B2B AI Consulting node returned an error. If you are running this app on Hostinger Shared Hosting (which only supports static HTML/JS), please click "Static Hosting & Hostinger Options" below to enter your own Gemini API Key to run AI unboxing directly in your browser!');
      }

      const data = await response.json();
      setAiRecommendation(data);
    } catch (err: any) {
      setAiError(err.message || 'Strategic recommendation server error.');
      // Automatically prompt them to configure client key if server fails
      setShowApiKeySetting(true);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Inject AI Specs directly into Simulator
  const applyAiSpecsToSimulator = (rec: AIRecommendation) => {
    let matchedId = 'luxury-rigid';
    if (rec.recommendedProductType.includes('E-commerce')) matchedId = 'ecommerce-mailer';
    else if (rec.recommendedProductType.includes('Sustainable')) matchedId = 'sustainable-eco';
    else if (rec.recommendedProductType.includes('Die-Cut')) matchedId = 'die-cut-custom';

    setSelectedProductId(matchedId);
    
    // Suggest size
    if (rec.dimensions) {
      setLength(Math.max(3, Math.min(24, rec.dimensions.suggestedLength || 10)));
      setWidth(Math.max(3, Math.min(20, rec.dimensions.suggestedWidth || 8)));
      setHeight(Math.max(1, Math.min(12, rec.dimensions.suggestedHeight || 4)));
    }

    // Set high volume quantity
    setQuantity(rec.pricingOverview?.minimumOrderQuantity || 1000);
    
    // Put product desc in project notes
    setProjectName(`AI Suggested - Custom Packaging`);
    setAdditionalNotes(`Generated by Shri AI Packaging Strategist for: ${productDesc.slice(0, 80)}...`);
    
    setActiveTab('simulator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Admin simulation tools
  const handleUpdateQuoteStatus = (id: string, newStatus: 'pending' | 'reviewed' | 'approved' | 'completed') => {
    const updated = submittedQuotes.map(q => {
      if (q.id === id) {
        return { ...q, status: newStatus };
      }
      return q;
    });
    setSubmittedQuotes(updated);
    localStorage.setItem('shri_packers_quotes', JSON.stringify(updated));
  };

  const handleDeleteQuote = (id: string) => {
    if (window.confirm('Are you sure you want to archived this specification sheet?')) {
      const updated = submittedQuotes.filter(q => q.id !== id);
      setSubmittedQuotes(updated);
      localStorage.setItem('shri_packers_quotes', JSON.stringify(updated));
    }
  };

  return (
    <div id="shri-app-container" className="min-h-screen bg-[#FAF8F5] text-[#1D1D1F] font-sans antialiased selection:bg-[#E2D2B5] selection:text-[#1A1A1A]">
      
      {/* EXQUISITE TOP ANNOUNCEMENT BAR */}
      <div id="top-bar" className="bg-[#111] text-[#E5D5B8] py-2 px-4 text-center text-xs tracking-widest font-mono uppercase border-b border-[#2C2518]">
        <span>Atelier Shri Packers — Elite Structural Engineering & Tailored Luxury Packaging Solutions</span>
      </div>

      {/* LUXURIOUS PREMIUM HEADER */}
      <header id="main-header" className="sticky top-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#EAE6DF] transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* BRAND IDENTITY LOGO */}
          <div 
            id="brand-logo" 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setActiveTab('collections')}
          >
            <div className="w-11 h-11 bg-[#1A1A1A] text-white flex items-center justify-center rounded-sm border border-[#C5A059] shadow-md transition-all group-hover:bg-[#C5A059] group-hover:border-[#1A1A1A]">
              <span className="font-serif font-semibold text-lg tracking-wider text-[#E5D5B8] group-hover:text-[#1A1A1A]">SP</span>
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-xl font-bold tracking-widest uppercase text-[#1A1A1A]">Shri Packers</span>
              <span className="text-[9px] uppercase tracking-[0.25em] text-[#C5A059] font-semibold -mt-1">Premium Packaging Redefined</span>
            </div>
          </div>

          {/* HIGH-END NAVIGATION */}
          <nav id="header-nav" className="hidden md:flex items-center gap-8">
            <button 
              id="nav-collections"
              onClick={() => { setActiveTab('collections'); }}
              className={`text-xs font-mono tracking-widest uppercase transition-colors relative py-2 ${activeTab === 'collections' ? 'text-[#C5A059] font-bold' : 'text-[#555] hover:text-[#1A1A1A]'}`}
            >
              Collections
              {activeTab === 'collections' && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#C5A059]" />}
            </button>
            <button 
              id="nav-simulator"
              onClick={() => { setActiveTab('simulator'); }}
              className={`text-xs font-mono tracking-widest uppercase transition-colors relative py-2 ${activeTab === 'simulator' ? 'text-[#C5A059] font-bold' : 'text-[#555] hover:text-[#1A1A1A]'}`}
            >
              Atelier Simulator
              {activeTab === 'simulator' && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#C5A059]" />}
            </button>
            <button 
              id="nav-ai-strategist"
              onClick={() => { setActiveTab('ai-strategist'); }}
              className={`text-xs font-mono tracking-widest uppercase transition-colors relative py-2 flex items-center gap-1.5 ${activeTab === 'ai-strategist' ? 'text-[#C5A059] font-bold' : 'text-[#555] hover:text-[#1A1A1A]'}`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
              AI strategist
              {activeTab === 'ai-strategist' && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#C5A059]" />}
            </button>
            <button 
              id="nav-craftsmanship"
              onClick={() => { setActiveTab('craftsmanship'); }}
              className={`text-xs font-mono tracking-widest uppercase transition-colors relative py-2 ${activeTab === 'craftsmanship' ? 'text-[#C5A059] font-bold' : 'text-[#555] hover:text-[#1A1A1A]'}`}
            >
              Our Craft
            </button>
            <button 
              id="nav-inquiries"
              onClick={() => { setActiveTab('inquiries'); }}
              className={`text-xs font-mono tracking-widest uppercase transition-colors relative py-2 ${activeTab === 'inquiries' ? 'text-[#C5A059] font-bold' : 'text-[#555] hover:text-[#1A1A1A]'}`}
            >
              Atelier Hub
              {activeTab === 'inquiries' && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#C5A059]" />}
            </button>
          </nav>

          {/* ACTION BUTTON & ADMIN TOGGLE */}
          <div id="header-actions" className="flex items-center gap-3">
            <button
              id="btn-admin-gate"
              onClick={() => setActiveTab(activeTab === 'admin' ? 'collections' : 'admin')}
              className={`px-3 py-1.5 rounded text-[10px] font-mono tracking-wider uppercase border transition-all flex items-center gap-1.5 ${activeTab === 'admin' ? 'bg-[#C5A059] text-white border-[#C5A059]' : 'bg-[#FAF8F5] text-[#888] border-[#E2DED6] hover:text-[#1A1A1A] hover:border-[#1A1A1A]'}`}
              title="A dedicated terminal for packaging consultants to review incoming custom specs."
            >
              <FolderLock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Relations Desk</span>
            </button>
            
            <button
              id="cta-nav-action"
              onClick={() => {
                setActiveTab('simulator');
                window.scrollTo({ top: 400, behavior: 'smooth' });
              }}
              className="bg-[#1A1A1A] hover:bg-[#C5A059] hover:text-[#1A1A1A] text-[#FAF8F5] text-xs font-mono tracking-widest uppercase py-2.5 px-5 rounded-sm transition-all duration-300 shadow-sm hover:shadow"
            >
              Request Specs
            </button>
          </div>

        </div>
      </header>

      {/* MOBILE LOWER NAV RENDERER */}
      <div id="mobile-tabs" className="md:hidden flex justify-around bg-[#FAF8F5] border-b border-[#EAE6DF] py-3 px-2 sticky top-20 z-30 shadow-sm">
        <button 
          onClick={() => setActiveTab('collections')}
          className={`text-[10px] font-mono tracking-widest uppercase px-1.5 py-1 ${activeTab === 'collections' ? 'text-[#C5A059] border-b border-[#C5A059]' : 'text-neutral-500'}`}
        >
          Collections
        </button>
        <button 
          onClick={() => setActiveTab('simulator')}
          className={`text-[10px] font-mono tracking-widest uppercase px-1.5 py-1 ${activeTab === 'simulator' ? 'text-[#C5A059] border-b border-[#C5A059]' : 'text-neutral-500'}`}
        >
          Simulator
        </button>
        <button 
          onClick={() => setActiveTab('ai-strategist')}
          className={`text-[10px] font-mono tracking-widest uppercase px-1.5 py-1 flex items-center gap-1 ${activeTab === 'ai-strategist' ? 'text-[#C5A059] border-b border-[#C5A059]' : 'text-neutral-500'}`}
        >
          <Sparkles className="w-3 h-3 text-[#C5A059]" />
          AI Expert
        </button>
        <button 
          onClick={() => setActiveTab('inquiries')}
          className={`text-[10px] font-mono tracking-widest uppercase px-1.5 py-1 ${activeTab === 'inquiries' ? 'text-[#C5A059] border-b border-[#C5A059]' : 'text-neutral-500'}`}
        >
          Hub
        </button>
      </div>

      {/* CORE MAIN CONTENT AREA */}
      <main id="primary-content" className="max-w-7xl mx-auto px-6 py-10">
        
        {/* ======================================= */}
        {/* TAB 1: COLLECTIONS & ATELIER PROSPECTUS */}
        {/* ======================================= */}
        {activeTab === 'collections' && (
          <div id="tab-collections" className="space-y-16 animate-fade-in">
            
            {/* LUXURY EDITORIAL HERO BANNER */}
            <div id="editorial-hero" className="relative bg-[#1A1A1A] text-white rounded-lg p-8 md:p-16 overflow-hidden border border-[#2C2518] shadow-2xl flex flex-col justify-between min-h-[460px]">
              
              {/* Decorative Subtle Background Texture / Gradients */}
              <div className="absolute inset-0 bg-radial-at-tr from-[#2C2417] via-[#1A1A1A] to-[#111] opacity-90 z-0"></div>
              
              {/* Subtle Gold Grid Art */}
              <div className="absolute right-0 bottom-0 opacity-10 w-96 h-96 border-t border-l border-[#C5A059] rotate-12 transform origin-bottom-right z-0"></div>
              
              <div className="relative z-10 max-w-2xl space-y-6">
                <span className="text-[#C5A059] text-xs font-mono tracking-[0.3em] uppercase block">A Heritage of Structural Masterpieces</span>
                <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl font-light tracking-wide leading-tight text-[#FAF8F5]">
                  Premium Packaging <br/>
                  <span className="font-normal italic text-[#E5D5B8] block mt-2">Redefined with Precision</span>
                </h1>
                <p className="text-neutral-400 text-sm md:text-base leading-relaxed font-light">
                  Shri Packers designs custom luxury box structures for the world's most discerning e-commerce brands. From 1800 GSM magnetic rigid vaults to water-based organic pulp, every crease is engineered with 0.1mm tolerance for premium presentation.
                </p>
              </div>

              <div className="relative z-10 flex flex-wrap gap-4 pt-8 border-t border-neutral-800/60 mt-8">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-neutral-900 border border-[#C5A059]/30 flex items-center justify-center text-[#C5A059] font-mono text-xs">01</div>
                  <span className="text-xs tracking-wider uppercase font-mono text-neutral-300">Custom Tooling</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-neutral-900 border border-[#C5A059]/30 flex items-center justify-center text-[#C5A059] font-mono text-xs">02</div>
                  <span className="text-xs tracking-wider uppercase font-mono text-neutral-300">Tactile Finishing</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-neutral-900 border border-[#C5A059]/30 flex items-center justify-center text-[#C5A059] font-mono text-xs">03</div>
                  <span className="text-xs tracking-wider uppercase font-mono text-neutral-300">FSC Certified Pulp</span>
                </div>
              </div>
            </div>

            {/* INTUITIVE CURATED COLLECTIONS GRID */}
            <div id="curated-collections" className="space-y-8">
              <div className="flex flex-col md:flex-row justify-between items-baseline border-b border-[#EAE6DF] pb-4">
                <div className="space-y-1">
                  <span className="text-xs font-mono tracking-widest text-[#C5A059] uppercase block">Selected Atelier Series</span>
                  <h2 className="font-serif text-2xl md:text-3xl tracking-wide font-normal text-[#1A1A1A]">Core Product Portfolio</h2>
                </div>
                <p className="text-xs font-mono text-[#888] mt-2 md:mt-0">CLICK ANY PRODUCT BELOW TO VIEW COMPREHENSIVE ARCHITECTURAL SPECS</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {PACKAGING_PRODUCTS.map((prod) => (
                  <div 
                    key={prod.id}
                    id={`card-${prod.id}`}
                    onClick={() => setSelectedCollectionDetail(prod)}
                    className={`group border cursor-pointer p-5 rounded bg-white shadow-sm transition-all duration-300 flex flex-col justify-between hover:shadow-md hover:border-[#C5A059] ${selectedCollectionDetail?.id === prod.id ? 'border-[#C5A059] ring-1 ring-[#C5A059]/20' : 'border-[#E2DED6]'}`}
                  >
                    <div className="space-y-4">
                      {/* Premium Product Mock Image with subtle styling */}
                      <div className="aspect-[4/3] bg-neutral-100 rounded overflow-hidden relative border border-[#EAE6DF]">
                        {prod.image ? (
                          <img 
                            src={prod.image} 
                            alt={prod.name} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            onError={(e) => {
                              // If image hasn't completed writing or has broken cache, show custom high-end placeholder
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : null}
                        <div className="absolute inset-0 bg-[#1A1A1A]/10 group-hover:bg-[#1A1A1A]/0 transition-colors flex items-center justify-center">
                          <span className="text-[10px] font-mono tracking-widest text-[#C5A059] uppercase bg-[#1A1A1A]/85 py-1.5 px-3 rounded-sm border border-[#C5A059]/30">Examine Specs</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <span className="text-[10px] font-mono tracking-widest text-[#C5A059] uppercase block">{prod.tagline}</span>
                        <h3 className="font-serif text-lg font-bold text-[#1D1D1F] group-hover:text-[#C5A059] transition-colors">{prod.name}</h3>
                        <p className="text-neutral-500 text-xs line-clamp-2 leading-relaxed">{prod.description}</p>
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-neutral-100 flex items-center justify-between text-xs">
                      <span className="font-mono text-neutral-400">Min. Vol: {prod.limits.minQty} units</span>
                      <span className="font-mono text-[#C5A059] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        Configure <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* DETAILED DRILL-DOWN DRAWER VIEW (REPLACES SEPARATE PAGE POPUPS) */}
            {selectedCollectionDetail && (
              <div id="product-prospectus-drawer" className="bg-[#FAF8F5] border border-[#C5A059]/30 rounded p-6 md:p-10 shadow-lg relative overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="absolute top-0 left-0 w-2 h-full bg-[#C5A059]"></div>
                
                {/* Visual Section */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="aspect-[1.2] bg-[#1A1A1A] rounded overflow-hidden relative border border-[#C5A059]/20 shadow-md">
                    {selectedCollectionDetail.image ? (
                      <img 
                        src={selectedCollectionDetail.image} 
                        alt={selectedCollectionDetail.name} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : null}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
                      <span className="text-[10px] font-mono tracking-widest text-[#E5D5B8] uppercase">Studio Reference Photo</span>
                      <h4 className="font-serif text-xl font-bold text-white tracking-wide">{selectedCollectionDetail.name}</h4>
                    </div>
                  </div>

                  {/* Quality Assurance Card */}
                  <div className="p-4 bg-white border border-[#EAE6DF] rounded flex items-start gap-3.5">
                    <ShieldCheck className="w-5 h-5 text-[#C5A059] shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h5 className="text-xs font-mono tracking-widest uppercase font-bold text-[#1A1A1A]">Atelier Quality Standard</h5>
                      <p className="text-neutral-500 text-[11px] leading-relaxed">
                        FSC certified boards, clean double-lined creasing, and exact color calibrations matched under 5000K daylight lighting parameters.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Specification Spec Sheet Section */}
                <div className="lg:col-span-7 space-y-8 flex flex-col justify-between">
                  <div className="space-y-6">
                    <div>
                      <span className="text-xs font-mono tracking-widest text-[#C5A059] uppercase block mb-1">Architectural Spec Sheet</span>
                      <h3 className="font-serif text-3xl font-light text-[#1A1A1A]">{selectedCollectionDetail.name}</h3>
                      <p className="text-neutral-500 text-sm mt-2 leading-relaxed">{selectedCollectionDetail.fullDetails}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#EAE6DF]">
                      
                      {/* Dimensional Scale Limits */}
                      <div className="space-y-2">
                        <span className="text-xs font-mono tracking-wider uppercase font-bold text-[#1A1A1A] flex items-center gap-1.5">
                          <SlidersHorizontal className="w-3.5 h-3.5 text-[#C5A059]" />
                          Dimensional Capacity
                        </span>
                        <ul className="text-xs text-neutral-600 space-y-1.5 font-mono">
                          <li>Length: {selectedCollectionDetail.limits.minLength}" to {selectedCollectionDetail.limits.maxLength}"</li>
                          <li>Width: {selectedCollectionDetail.limits.minWidth}" to {selectedCollectionDetail.limits.maxWidth}"</li>
                          <li>Height: {selectedCollectionDetail.limits.minHeight}" to {selectedCollectionDetail.limits.maxHeight}"</li>
                          <li className="text-neutral-400">Scale Precision: ± 0.1 mm</li>
                        </ul>
                      </div>

                      {/* Material Matrix */}
                      <div className="space-y-2">
                        <span className="text-xs font-mono tracking-wider uppercase font-bold text-[#1A1A1A] flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-[#C5A059]" />
                          Suggested Materials
                        </span>
                        <div className="space-y-1">
                          {selectedCollectionDetail.materials.map(mat => (
                            <div key={mat.id} className="text-xs">
                              <span className="font-semibold text-neutral-700">{mat.name}</span>
                              <span className="text-neutral-400 text-[10px] block">Thickness weight: {mat.availableGSMs.join('/')} GSM</span>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>

                    {/* Finish Choices */}
                    <div className="space-y-3 pt-4 border-t border-[#EAE6DF]">
                      <span className="text-xs font-mono tracking-wider uppercase font-bold text-[#1A1A1A] block">Premium Finish Selections Available</span>
                      <div className="flex flex-wrap gap-2">
                        {selectedCollectionDetail.finishes.map(f => (
                          <span 
                            key={f.id}
                            className="bg-white border border-[#E2DED6] text-neutral-700 font-mono text-[10px] uppercase py-1 px-3 rounded shadow-xs"
                          >
                            {f.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Immediate CTA to Load this specific model in the Customizer */}
                  <div className="pt-6 border-t border-[#EAE6DF] flex flex-wrap gap-4 items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-neutral-400 block uppercase">Estimate starting at</span>
                      <span className="font-serif text-xl font-bold text-[#1D1D1F]">${selectedCollectionDetail.baseUnitCost.toFixed(2)} <span className="text-xs text-neutral-400 font-sans font-normal">per unit</span></span>
                    </div>

                    <div className="flex gap-3">
                      <button 
                        onClick={() => {
                          setSelectedProductId(selectedCollectionDetail.id);
                          setActiveTab('simulator');
                          window.scrollTo({ top: 350, behavior: 'smooth' });
                        }}
                        className="bg-[#1A1A1A] hover:bg-[#C5A059] hover:text-[#1A1A1A] text-white text-xs font-mono tracking-widest uppercase py-3 px-6 rounded-sm transition-all"
                      >
                        Load in Customizer
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* HIGH-END CONVERSATIONAL CALLOUT FOR THE AI STRATEGIST */}
            <div id="ai-strategic-callout" className="bg-[#FAF8F5] border border-[#EAE6DF] rounded-lg p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center shadow-sm">
              <div className="lg:col-span-8 space-y-4">
                <div className="inline-flex items-center gap-2 bg-[#E2D2B5]/30 border border-[#C5A059]/20 py-1 px-3 rounded-full text-xs text-[#C5A059] font-mono">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Interactive AI Strategist Integration</span>
                </div>
                <h3 className="font-serif text-2xl font-light text-[#1A1A1A]">Don't know your ideal dimensions or board thickness?</h3>
                <p className="text-neutral-500 text-sm leading-relaxed max-w-2xl font-light">
                  Describe your physical product, weight, retail price point, and target unboxing mood. Our B2B AI Consulting node will immediately design an optimized, luxury specification list tailored to your exact positioning goals.
                </p>
              </div>

              <div className="lg:col-span-4 lg:text-right">
                <button
                  onClick={() => {
                    setActiveTab('ai-strategist');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="bg-white hover:bg-[#1A1A1A] text-[#1A1A1A] hover:text-white border border-[#1A1A1A] text-xs font-mono tracking-widest uppercase py-3.5 px-6 rounded-sm transition-all shadow-xs inline-flex items-center gap-2"
                >
                  Consult AI Strategist
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        )}


        {/* ============================================== */}
        {/* TAB 2: ATELIER SIMULATOR & 3D REALTIME PREVIEW */}
        {/* ============================================== */}
        {activeTab === 'simulator' && (
          <div id="tab-simulator" className="space-y-10 animate-fade-in">
            
            {/* INFORMATIVE INTRO HEADER */}
            <div className="space-y-2 border-b border-[#EAE6DF] pb-5">
              <span className="text-xs font-mono tracking-widest text-[#C5A059] uppercase block">Tailor-Made Spec Builder</span>
              <h1 className="font-serif text-3xl font-light text-[#1A1A1A]">Custom Atelier Simulator</h1>
              <p className="text-neutral-500 text-sm max-w-3xl">
                Configure your structural packaging envelope with exact scale parameters. The live generator calculates real-time wholesale costs, physical constraints, and schedules manufacturing cycles instantly.
              </p>
            </div>

            {/* SELECTION BAR TO CHANGE CONTAINER TYPE */}
            <div className="bg-white p-3 border border-[#EAE6DF] rounded-md flex flex-wrap gap-2 shadow-xs">
              {PACKAGING_PRODUCTS.map(p => (
                <button
                  key={p.id}
                  onClick={() => setSelectedProductId(p.id)}
                  className={`px-4 py-2 text-xs font-mono tracking-wider uppercase rounded transition-all ${selectedProductId === p.id ? 'bg-[#1A1A1A] text-[#FAF8F5]' : 'bg-transparent text-neutral-500 hover:text-[#1A1A1A] hover:bg-neutral-50'}`}
                >
                  {p.name}
                </button>
              ))}
            </div>

            {/* INTERACTIVE WORKSPACE GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              
              {/* LEFT COLUMN: SIMULATOR SLIDERS AND MATERIAL MATRIX */}
              <div className="lg:col-span-7 space-y-8 bg-white p-6 md:p-8 border border-[#EAE6DF] rounded shadow-xs">
                
                {/* PART 1: CHOOSE COMPONENT SCALING (SLIDERS) */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 border-b border-neutral-100 pb-2">
                    <Sliders className="w-4.5 h-4.5 text-[#C5A059]" />
                    <h3 className="text-sm font-mono tracking-wider uppercase font-bold text-[#1D1D1F]">01. Dimensional Calibration (Inches)</h3>
                  </div>

                  <div className="space-y-5">
                    
                    {/* LENGTH SLIDER */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-neutral-500">Length (L)</span>
                        <span className="font-bold text-[#1A1A1A]">{length} in</span>
                      </div>
                      <input 
                        type="range" 
                        min={currentProduct.limits.minLength}
                        max={currentProduct.limits.maxLength}
                        value={length}
                        onChange={(e) => setLength(parseInt(e.target.value))}
                        className="w-full h-1 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-[#C5A059]"
                      />
                      <div className="flex justify-between text-[10px] text-neutral-400 font-mono">
                        <span>Min: {currentProduct.limits.minLength}"</span>
                        <span>Max: {currentProduct.limits.maxLength}"</span>
                      </div>
                    </div>

                    {/* WIDTH SLIDER */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-neutral-500">Width (W)</span>
                        <span className="font-bold text-[#1A1A1A]">{width} in</span>
                      </div>
                      <input 
                        type="range" 
                        min={currentProduct.limits.minWidth}
                        max={currentProduct.limits.maxWidth}
                        value={width}
                        onChange={(e) => setWidth(parseInt(e.target.value))}
                        className="w-full h-1 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-[#C5A059]"
                      />
                      <div className="flex justify-between text-[10px] text-neutral-400 font-mono">
                        <span>Min: {currentProduct.limits.minWidth}"</span>
                        <span>Max: {currentProduct.limits.maxWidth}"</span>
                      </div>
                    </div>

                    {/* HEIGHT SLIDER */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-neutral-500">Height (H)</span>
                        <span className="font-bold text-[#1A1A1A]">{height} in</span>
                      </div>
                      <input 
                        type="range" 
                        min={currentProduct.limits.minHeight}
                        max={currentProduct.limits.maxHeight}
                        value={height}
                        onChange={(e) => setHeight(parseInt(e.target.value))}
                        className="w-full h-1 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-[#C5A059]"
                      />
                      <div className="flex justify-between text-[10px] text-neutral-400 font-mono">
                        <span>Min: {currentProduct.limits.minHeight}"</span>
                        <span>Max: {currentProduct.limits.maxHeight}"</span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* PART 2: SELECT MATERIELS */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 border-b border-neutral-100 pb-2">
                    <Layers className="w-4.5 h-4.5 text-[#C5A059]" />
                    <h3 className="text-sm font-mono tracking-wider uppercase font-bold text-[#1D1D1F]">02. Premium Core Material</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {currentProduct.materials.map((mat) => (
                      <div
                        key={mat.id}
                        onClick={() => {
                          setSelectedMaterialId(mat.id);
                          setSelectedGSM(mat.availableGSMs[0]);
                        }}
                        className={`border p-4 rounded cursor-pointer transition-all ${selectedMaterialId === mat.id ? 'border-[#C5A059] bg-[#E2D2B5]/5' : 'border-neutral-200 bg-white hover:border-neutral-300'}`}
                      >
                        <h4 className="font-serif text-xs font-bold text-[#1A1A1A]">{mat.name}</h4>
                        <p className="text-[10px] text-neutral-500 mt-1 leading-relaxed">{mat.description}</p>
                      </div>
                    ))}
                  </div>

                  {/* GSM Calibrator inside the selected material */}
                  <div className="bg-[#FAF8F5] p-4 border border-neutral-200 rounded">
                    <span className="text-[10px] font-mono tracking-wider uppercase font-bold text-neutral-500 block mb-3">Available Core Thickness (GSM / Board Density)</span>
                    <div className="flex gap-3">
                      {(currentProduct.materials.find(m => m.id === selectedMaterialId)?.availableGSMs || [350]).map((gValue) => (
                        <button
                          key={gValue}
                          onClick={() => setSelectedGSM(gValue)}
                          className={`flex-1 py-2 rounded text-xs font-mono tracking-wider border transition-all ${selectedGSM === gValue ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] font-bold' : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400'}`}
                        >
                          {gValue} GSM
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* PART 3: EMBELLISHMENT SELECTIONS */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 border-b border-neutral-100 pb-2">
                    <PenTool className="w-4.5 h-4.5 text-[#C5A059]" />
                    <h3 className="text-sm font-mono tracking-wider uppercase font-bold text-[#1D1D1F]">03. High-End Branding Finishes</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentProduct.finishes.map((f) => (
                      <div
                        key={f.id}
                        onClick={() => toggleFinish(f.id)}
                        className={`border p-4 rounded cursor-pointer flex items-start gap-3.5 transition-all ${selectedFinishIds.includes(f.id) ? 'border-[#C5A059] bg-[#E2D2B5]/5' : 'border-neutral-200 bg-white hover:border-neutral-300'}`}
                      >
                        <input 
                          type="checkbox"
                          checked={selectedFinishIds.includes(f.id)}
                          onChange={() => {}} // handled by div click
                          className="mt-0.5 accent-[#C5A059]"
                        />
                        <div className="space-y-1">
                          <h4 className="text-xs font-mono uppercase tracking-wider font-bold text-[#1A1A1A]">{f.name}</h4>
                          <p className="text-[10px] text-neutral-500 leading-relaxed">{f.description}</p>
                          <span className="text-[10px] font-mono font-semibold text-[#C5A059] block">+ ${f.baseCostPerUnit.toFixed(2)} / unit</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* PART 4: VOLUME QUANTITY CALIBRATOR */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 border-b border-neutral-100 pb-2">
                    <Coins className="w-4.5 h-4.5 text-[#C5A059]" />
                    <h3 className="text-sm font-mono tracking-wider uppercase font-bold text-[#1D1D1F]">04. Production Volume</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-neutral-500">Volume Quantity (Units)</span>
                      <span className="font-mono text-xs text-neutral-400">Minimum Order Volume: {currentProduct.limits.minQty} units</span>
                    </div>

                    <div className="flex gap-4">
                      <input 
                        type="number"
                        min={currentProduct.limits.minQty}
                        max={100000}
                        value={quantity}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          setQuantity(isNaN(val) ? currentProduct.limits.minQty : Math.max(currentProduct.limits.minQty, val));
                        }}
                        className="bg-white border border-neutral-200 rounded p-3 text-sm font-mono text-[#1A1A1A] w-32 focus:outline-none focus:ring-1 focus:ring-[#C5A059]"
                      />
                      
                      <div className="flex-1 flex gap-2">
                        {[500, 1000, 2500, 5000].map(v => (
                          v >= currentProduct.limits.minQty && (
                            <button
                              key={v}
                              onClick={() => setQuantity(v)}
                              className={`flex-1 py-2 rounded text-xs font-mono border transition-all ${quantity === v ? 'bg-[#C5A059] text-white border-[#C5A059] font-bold' : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400'}`}
                            >
                              {v === 5000 ? '5K+' : v}
                            </button>
                          )
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

              </div>


              {/* RIGHT COLUMN: STRUCTURAL REALTIME 3D SCHEMATIC PREVIEW & PRICING METRIC LEDGER */}
              <div className="lg:col-span-5 space-y-8">
                
                {/* REALTIME DYNAMIC SVG BOX PREVIEW */}
                <div id="isometric-canvas" className="bg-[#111] border border-neutral-800 rounded p-6 shadow-md relative overflow-hidden flex flex-col justify-between min-h-[350px]">
                  
                  {/* Subtle Grid Canvas Style background */}
                  <div className="absolute inset-0 bg-grid-pattern opacity-10 z-0"></div>
                  
                  <div className="relative z-10 flex justify-between items-center">
                    <span className="text-[10px] font-mono tracking-widest text-[#C5A059] uppercase block">Interactive CAD Schematic</span>
                    <span className="text-[10px] font-mono text-neutral-400">{length}W x {width}D x {height}H Inches</span>
                  </div>

                  {/* HIGH-END INTERACTIVE VECTOR BOX */}
                  <div className="relative z-10 flex items-center justify-center h-52">
                    <svg viewBox="0 0 240 200" className="w-56 h-56 transform transition-all duration-300 drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)]">
                      {/* Let's construct a beautiful axonometric projection where scale parameters directly drive coordinate variables! */}
                      {(() => {
                        // Standard base scale factors
                        const scaleX = 4.5 + (length / 4);
                        const scaleY = 4.5 + (width / 4);
                        const scaleZ = 4.5 + (height / 2.5);

                        // Isometric Origin Coordinate
                        const oX = 120;
                        const oY = 120;

                        // Isometric vectors (30-degree orthographic projection)
                        // x-axis goes down-right: [cos(30), sin(30)] = [0.866, 0.5]
                        // y-axis goes down-left: [-0.866, 0.5]
                        // z-axis goes straight up: [0, -1]
                        
                        const vecX = [0.866, 0.5];
                        const vecY = [-0.866, 0.5];
                        const vecZ = [0, -1];

                        // Calculate key vertices
                        const v0 = [oX, oY]; // Bottom Center corner
                        const v1 = [oX + scaleX * 10 * vecX[0], oY + scaleX * 10 * vecX[1]]; // Bottom Right corner
                        const v2 = [oX + scaleX * 10 * vecX[0] + scaleY * 10 * vecY[0], oY + scaleX * 10 * vecX[1] + scaleY * 10 * vecY[1]]; // Bottom Back corner
                        const v3 = [oX + scaleY * 10 * vecY[0], oY + scaleY * 10 * vecY[1]]; // Bottom Left corner

                        // Top vertices (projected along z-axis)
                        const zOffset = scaleZ * 7;
                        const t0 = [v0[0], v0[1] - zOffset];
                        const t1 = [v1[0], v1[1] - zOffset];
                        const t2 = [v2[0], v2[1] - zOffset];
                        const t3 = [v3[0], v3[1] - zOffset];

                        // Materials visual styling mapping
                        let boxFill = '#8B6B58'; // kraft brown standard
                        let boxStroke = '#A0806A';
                        let lidFill = '#9C7A65';

                        if (selectedProductId === 'luxury-rigid') {
                          if (selectedMaterialId === 'grayboard-metallic') {
                            boxFill = '#2A2E33';
                            boxStroke = '#636E72';
                            lidFill = '#34495E';
                          } else {
                            boxFill = '#1C1C1E';
                            boxStroke = '#C5A059';
                            lidFill = '#242426';
                          }
                        } else if (selectedProductId === 'ecommerce-mailer') {
                          if (selectedMaterialId === 'kraft-corrugated') {
                            boxFill = '#ECECEC';
                            boxStroke = '#CCCCCC';
                            lidFill = '#FAF9F6';
                          } else {
                            boxFill = '#5A463B';
                            boxStroke = '#4E3C33';
                            lidFill = '#6B5346';
                          }
                        } else if (selectedProductId === 'sustainable-eco') {
                          boxFill = '#DFD5C6';
                          boxStroke = '#C2B59D';
                          lidFill = '#E9E0D2';
                        } else {
                          // precision die cut
                          boxFill = '#2C3E50';
                          boxStroke = '#34495E';
                          lidFill = '#34495E';
                        }

                        // Gold Foil Glowing Accent style if active
                        const isGoldFoil = selectedFinishIds.includes('gold-foil') || selectedFinishIds.includes('holographic-foil');

                        return (
                          <>
                            {/* SVG Defs for elegant shadows and foil metallics */}
                            <defs>
                              <linearGradient id="gold-shimmer" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#DFBA73" />
                                <stop offset="50%" stopColor="#C5A059" />
                                <stop offset="100%" stopColor="#F5E4B8" />
                              </linearGradient>
                            </defs>

                            {/* Left Side Wall */}
                            <polygon 
                              points={`${v0.join(',')}, ${v3.join(',')}, ${t3.join(',')}, ${t0.join(',')}`}
                              fill={boxFill}
                              stroke={boxStroke}
                              strokeWidth="1.5"
                              opacity="0.85"
                            />

                            {/* Right Side Wall */}
                            <polygon 
                              points={`${v0.join(',')}, ${v1.join(',')}, ${t1.join(',')}, ${t0.join(',')}`}
                              fill={boxFill}
                              stroke={boxStroke}
                              strokeWidth="1.5"
                              opacity="0.95"
                            />

                            {/* Top Lid */}
                            <polygon 
                              points={`${t0.join(',')}, ${t1.join(',')}, ${t2.join(',')}, ${t3.join(',')}`}
                              fill={lidFill}
                              stroke={boxStroke}
                              strokeWidth="1.5"
                            />

                            {/* Highlight / Crease Accents */}
                            <polyline 
                              points={`${t1.join(',')}, ${t0.join(',')}, ${t3.join(',')}`}
                              fill="none"
                              stroke="#FFF"
                              strokeWidth="1"
                              opacity="0.25"
                            />
                            <polyline 
                              points={`${t0.join(',')}, ${v0.join(',')}`}
                              fill="none"
                              stroke="#000"
                              strokeWidth="1"
                              opacity="0.15"
                            />

                            {/* Premium Foil Brand Mark Overlay on Top Lid center */}
                            {isGoldFoil && (
                              <g transform={`translate(${(t0[0]+t1[0]+t2[0]+t3[0])/4 - 10}, ${(t0[1]+t1[1]+t2[1]+t3[1])/4 - 10}) scale(0.6)`}>
                                <rect 
                                  x="0" y="0" width="30" height="30" 
                                  fill="none" 
                                  stroke="url(#gold-shimmer)" 
                                  strokeWidth="2.5" 
                                  transform="rotate(45 15 15)"
                                  className="animate-pulse"
                                />
                                <circle cx="15" cy="15" r="3" fill="url(#gold-shimmer)" />
                              </g>
                            )}

                            {/* Spot UV highlight overlay if selected */}
                            {selectedFinishIds.includes('spot-uv') && (
                              <polygon 
                                points={`${t0.join(',')}, ${t1.join(',')}, ${t2.join(',')}, ${t3.join(',')}`}
                                fill="white"
                                opacity="0.1"
                                style={{ mixBlendMode: 'overlay' }}
                              />
                            )}

                            {/* Dynamic Dimension Arrow Lines */}
                            <g opacity="0.4" stroke="#FFF" strokeWidth="0.75" fill="#FFF" className="text-[7px] font-mono">
                              {/* Height Indicator arrow */}
                              <line x1={v1[0] + 12} y1={v1[1]} x2={t1[0] + 12} y2={t1[1]} />
                              <text x={v1[0] + 16} y={(v1[1]+t1[1])/2} transform={`rotate(0 ${v1[0] + 16} ${(v1[1]+t1[1])/2})`}>H:{height}"</text>
                              
                              {/* Length Indicator arrow */}
                              <line x1={v0[0] + 5} y1={v0[1] + 10} x2={v1[0] + 5} y2={v1[1] + 10} />
                              <text x={(v0[0]+v1[0])/2 - 10} y={(v0[1]+v1[1])/2 + 18}>L:{length}"</text>

                              {/* Width Indicator arrow */}
                              <line x1={v0[0] - 5} y1={v0[1] + 10} x2={v3[0] - 5} y2={v3[1] + 10} />
                              <text x={(v0[0]+v3[0])/2 - 15} y={(v0[1]+v3[1])/2 + 18}>W:{width}"</text>
                            </g>
                          </>
                        );
                      })()}
                    </svg>
                  </div>

                  {/* Micro Specs readout details */}
                  <div className="relative z-10 pt-4 border-t border-neutral-800 flex justify-between text-[10px] text-neutral-400 font-mono">
                    <span className="flex items-center gap-1">
                      <Leaf className="w-3.5 h-3.5 text-emerald-500" />
                      FSC pulp wrapping
                    </span>
                    <span>Tolerance rating: ±0.1mm</span>
                  </div>

                </div>

                {/* PRICING ESTIMATE MATRIX / BUSINESS LEDGER */}
                <div className="bg-white border border-[#EAE6DF] rounded p-6 shadow-sm space-y-5">
                  <div className="flex justify-between items-baseline border-b border-neutral-100 pb-3">
                    <h3 className="text-xs font-mono tracking-widest uppercase font-bold text-[#1A1A1A]">Estimate Costing Sheets</h3>
                    <span className="text-[10px] font-mono text-[#888]">MOQ Discounter Applied</span>
                  </div>

                  <div className="space-y-3.5 text-xs font-mono">
                    
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Unit Price Spec Estimate</span>
                      <span className="font-bold text-[#1A1A1A]">${unitPrice.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-neutral-500">Order Quantity</span>
                      <span className="text-neutral-700">{quantity} units</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-neutral-500">Steel Die-Rule & Tooling Setup</span>
                      <span className="text-neutral-700">
                        {toolingCost === 0 ? (
                          <span className="text-emerald-600 font-bold">Waived (Volume Benefit)</span>
                        ) : (
                          `$${toolingCost.toFixed(2)}`
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-neutral-500">Estimated Lead Time</span>
                      <span className="text-neutral-700 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#C5A059]" />
                        {leadTimeDays} Business Days
                      </span>
                    </div>

                    <div className="pt-4 border-t border-dashed border-neutral-200 flex justify-between items-baseline">
                      <span className="font-serif text-sm font-semibold text-[#1A1A1A]">Estimated Total Proposal</span>
                      <span className="font-serif text-2xl font-bold text-[#C5A059]">${totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>

                  </div>
                </div>

                {/* SPECIFICATION SUBMISSION HUB */}
                <div className="bg-white border border-[#EAE6DF] rounded p-6 shadow-sm space-y-4">
                  <h3 className="text-xs font-mono tracking-widest uppercase font-bold text-[#1A1A1A] flex items-center gap-1.5 border-b border-neutral-100 pb-2">
                    <FileText className="w-4.5 h-4.5 text-[#C5A059]" />
                    Atelier Spec Registration Desk
                  </h3>

                  {isSubmitSuccess ? (
                    <div className="bg-emerald-50 border border-emerald-200 rounded p-4 text-center space-y-4 animate-fade-in">
                      <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                      <div className="space-y-1">
                        <h4 className="font-serif text-lg font-bold text-emerald-900">Inquiry Specs Registered</h4>
                        <p className="text-xs text-emerald-700">
                          Your custom box specification sheet has been successfully filed under Reference <span className="font-mono font-bold">{recentSubmittedId}</span>.
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setIsSubmitSuccess(false);
                            setCompanyName('');
                            setProjectName('');
                          }}
                          className="flex-1 py-2 rounded border border-emerald-300 text-xs text-emerald-800 font-mono bg-white hover:bg-emerald-50 transition-all"
                        >
                          New Spec Form
                        </button>
                        <button
                          onClick={() => {
                            setActiveTab('inquiries');
                            setIsSubmitSuccess(false);
                          }}
                          className="flex-1 py-2 rounded bg-emerald-600 text-xs text-white font-mono hover:bg-emerald-700 transition-all"
                        >
                          View Atelier Hub
                        </button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleQuoteSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 block">Company Name *</label>
                          <div className="relative">
                            <Building className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
                            <input 
                              type="text" 
                              required
                              value={companyName}
                              onChange={(e) => setCompanyName(e.target.value)}
                              placeholder="e.g. Dior Cosmetics Paris"
                              className="bg-[#FAF8F5] border border-neutral-200 text-xs rounded p-2.5 pl-9 w-full focus:outline-none focus:ring-1 focus:ring-[#C5A059]"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 block">Contact Name *</label>
                          <div className="relative">
                            <User className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
                            <input 
                              type="text" 
                              required
                              value={contactName}
                              onChange={(e) => setContactName(e.target.value)}
                              placeholder="e.g. Jean-Luc Godard"
                              className="bg-[#FAF8F5] border border-neutral-200 text-xs rounded p-2.5 pl-9 w-full focus:outline-none focus:ring-1 focus:ring-[#C5A059]"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 block">Work Email *</label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
                            <input 
                              type="email" 
                              required
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="e.g. luc@dior-cosmetics.fr"
                              className="bg-[#FAF8F5] border border-neutral-200 text-xs rounded p-2.5 pl-9 w-full focus:outline-none focus:ring-1 focus:ring-[#C5A059]"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 block">Phone (Optional)</label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
                            <input 
                              type="tel" 
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              placeholder="e.g. +33 6 42 21 89"
                              className="bg-[#FAF8F5] border border-neutral-200 text-xs rounded p-2.5 pl-9 w-full focus:outline-none focus:ring-1 focus:ring-[#C5A059]"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 block">Project / Product Name *</label>
                        <input 
                          type="text" 
                          required
                          value={projectName}
                          onChange={(e) => setProjectName(e.target.value)}
                          placeholder="e.g. Summer Apothecary Velvet Hex-Box"
                          className="bg-[#FAF8F5] border border-neutral-200 text-xs rounded p-2.5 w-full focus:outline-none focus:ring-1 focus:ring-[#C5A059]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 block">Special Requirements / Custom Compartments / Foam Inserts</label>
                        <textarea 
                          rows={2}
                          value={additionalNotes}
                          onChange={(e) => setAdditionalNotes(e.target.value)}
                          placeholder="e.g. Requires laser-cut 120D high-density foam insert wrapped in black velvet, embossed foil logo on the inside flap..."
                          className="bg-[#FAF8F5] border border-neutral-200 text-xs rounded p-2.5 w-full focus:outline-none focus:ring-1 focus:ring-[#C5A059]"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-[#1A1A1A] hover:bg-[#C5A059] hover:text-[#1A1A1A] text-white text-xs font-mono tracking-widest uppercase py-3.5 rounded-sm transition-all shadow"
                      >
                        File Specification & Register Project
                      </button>
                    </form>
                  )}
                </div>

              </div>

            </div>

          </div>
        )}


        {/* ========================================================= */}
        {/* TAB 3: B2B AI PACKAGING STRATEGIST (GEMINI INTEGRATION)   */}
        {/* ========================================================= */}
        {activeTab === 'ai-strategist' && (
          <div id="tab-ai-strategist" className="space-y-10 animate-fade-in">
            
            {/* INTRO SPECS */}
            <div className="space-y-2 border-b border-[#EAE6DF] pb-5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#C5A059]" />
                <span className="text-xs font-mono tracking-widest text-[#C5A059] uppercase block">Elite AI Consulting Desk</span>
              </div>
              <h1 className="font-serif text-3xl font-light text-[#1A1A1A]">AI Packaging Strategy Consultant</h1>
              <p className="text-neutral-500 text-sm max-w-3xl">
                Describe your commercial products, retail positioning, target audience, and desired unboxing experience. The server-side Gemini intelligence engine will synthesize a master physical spec sheet complete with unboxing tactics.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              
              {/* LEFT COLUMN: DESCRIPTION CONSULTATION INPUT FIELDS */}
              <div className="lg:col-span-5 bg-white border border-[#EAE6DF] p-6 md:p-8 rounded shadow-sm space-y-6">
                <h3 className="text-xs font-mono tracking-widest uppercase font-bold text-[#1A1A1A] border-b border-neutral-100 pb-2">
                  Atelier Project Outline
                </h3>

                <div className="space-y-4">
                  
                  {/* Product Profile */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 block">1. Product Characteristics & Weight *</label>
                    <textarea 
                      rows={3}
                      value={productDesc}
                      onChange={(e) => setProductDesc(e.target.value)}
                      placeholder="e.g. Ceramic soy candle, heavy weight (350g), premium apothecary style, selling at $75 each."
                      className="bg-[#FAF8F5] border border-neutral-200 text-xs rounded p-2.5 w-full focus:outline-none focus:ring-1 focus:ring-[#C5A059]"
                    />
                  </div>

                  {/* Target Audience */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 block">2. Target Audience & Positioning *</label>
                    <input 
                      type="text"
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value)}
                      placeholder="e.g. Eco-conscious luxury seekers, interior designers, gift shops."
                      className="bg-[#FAF8F5] border border-neutral-200 text-xs rounded p-2.5 w-full focus:outline-none focus:ring-1 focus:ring-[#C5A059]"
                    />
                  </div>

                  {/* Preferred Vibe */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 block">3. Desired Unboxing Experience *</label>
                    <input 
                      type="text"
                      value={preferredVibe}
                      onChange={(e) => setPreferredVibe(e.target.value)}
                      placeholder="e.g. Minimalist Japanese zen style, earthy warm cream accents, slide-out drawer."
                      className="bg-[#FAF8F5] border border-neutral-200 text-xs rounded p-2.5 w-full focus:outline-none focus:ring-1 focus:ring-[#C5A059]"
                    />
                  </div>

                  {/* Dimensions hint */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 block">4. Approximated Size Limits (If any)</label>
                    <input 
                      type="text"
                      value={sizeHint}
                      onChange={(e) => setSizeHint(e.target.value)}
                      placeholder="e.g. Approx. 4x4x4 inches cube."
                      className="bg-[#FAF8F5] border border-neutral-200 text-xs rounded p-2.5 w-full focus:outline-none focus:ring-1 focus:ring-[#C5A059]"
                    />
                  </div>

                  {/* SUBMIT BUTTON */}
                  <button
                    onClick={handleAiConsult}
                    disabled={isAiLoading}
                    className="w-full bg-[#1A1A1A] hover:bg-[#C5A059] hover:text-[#1A1A1A] text-[#FAF8F5] hover:shadow-md text-xs font-mono tracking-widest uppercase py-3.5 rounded-sm transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    {isAiLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-[#FAF8F5] border-t-transparent rounded-full animate-spin"></div>
                        <span>Engineering Unboxing Specs...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-[#C5A059]" />
                        <span>Synthesize Packaging Strategy</span>
                      </>
                    )}
                  </button>

                  {/* Error Notification */}
                  {aiError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded leading-relaxed">
                      {aiError}
                    </div>
                  )}

                  {/* Hostinger / Client-Side Deployment Support */}
                  <div className="pt-4 border-t border-neutral-100 space-y-3">
                    <button 
                      onClick={() => setShowApiKeySetting(!showApiKeySetting)}
                      className="text-[10px] font-mono uppercase tracking-wider text-[#C5A059] hover:text-[#1A1A1A] flex items-center gap-1.5 transition-colors"
                    >
                      <FolderLock className="w-3.5 h-3.5" />
                      {showApiKeySetting ? 'Hide Static Deployment Options' : 'Static Hosting & Hostinger Options'}
                    </button>

                    {showApiKeySetting && (
                      <div className="bg-[#FAF8F5] border border-neutral-200 rounded p-4 space-y-3 animate-fade-in text-neutral-600">
                        <p className="text-[11px] leading-relaxed">
                          Deploying on a static host like <strong>Hostinger Shared Hosting</strong> (which has no Node.js backend)? Enter your own <strong>Gemini API Key</strong> below to run the AI unboxing directly in your browser.
                        </p>
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-mono uppercase tracking-wider text-neutral-400 block">Gemini API Key</label>
                          <div className="flex gap-2">
                            <input 
                              type="password"
                              value={clientApiKey}
                              onChange={(e) => {
                                const val = e.target.value;
                                setClientApiKey(val);
                                localStorage.setItem('shri_gemini_api_key', val);
                              }}
                              placeholder="AIzaSy..."
                              className="bg-white border border-neutral-200 text-xs rounded p-2.5 flex-1 focus:outline-none focus:ring-1 focus:ring-[#C5A059]"
                            />
                            {clientApiKey && (
                              <button
                                onClick={() => {
                                  setClientApiKey('');
                                  localStorage.removeItem('shri_gemini_api_key');
                                }}
                                className="px-2.5 py-1 text-[10px] border border-neutral-200 bg-white text-neutral-500 rounded hover:text-red-600 hover:border-red-200 animate-fade-in"
                              >
                                Clear
                              </button>
                            )}
                          </div>
                          <span className="text-[9px] text-neutral-400 block mt-1 leading-relaxed">
                            Your key is stored securely in your local browser storage and is never sent to our servers. Get one at <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" className="text-[#C5A059] underline font-medium">Google AI Studio</a>.
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              </div>


              {/* RIGHT COLUMN: DYNAMIC PROSPECTUS OUTPUT */}
              <div className="lg:col-span-7">
                
                {!aiRecommendation && !isAiLoading && (
                  <div className="bg-[#FAF8F5] border border-dashed border-neutral-300 rounded-lg p-10 text-center flex flex-col justify-center items-center min-h-[450px] space-y-4">
                    <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center text-[#C5A059]">
                      <Sparkles className="w-8 h-8" />
                    </div>
                    <div className="space-y-1 max-w-sm">
                      <h3 className="font-serif text-lg font-bold text-[#1A1A1A]">Strategy Engine Awaiting Parameters</h3>
                      <p className="text-neutral-500 text-xs leading-relaxed">
                        Complete your product outline parameters in the left pane and prompt the AI strategist to draft your luxurious packaging spec sheets.
                      </p>
                    </div>
                  </div>
                )}

                {isAiLoading && (
                  <div className="bg-white border border-[#EAE6DF] rounded-lg p-10 text-center flex flex-col justify-center items-center min-h-[450px] space-y-6 animate-pulse">
                    <div className="w-16 h-16 bg-[#1A1A1A] text-white rounded-full flex items-center justify-center border border-[#C5A059]">
                      <Sparkles className="w-8 h-8 text-[#C5A059] animate-spin" />
                    </div>
                    <div className="space-y-2 max-w-sm">
                      <h3 className="font-serif text-lg font-bold text-[#1A1A1A] text-neutral-700">Formulating Premium Architecture</h3>
                      <p className="text-neutral-400 text-xs leading-relaxed">
                        Aligning physical boards, designing tactile stamp contours, evaluating volume-to-weight compression curves, and writing the unboxing choreography...
                      </p>
                    </div>
                  </div>
                )}

                {aiRecommendation && !isAiLoading && (
                  <div className="bg-white border-2 border-[#C5A059] rounded-lg p-6 md:p-8 shadow-md relative overflow-hidden space-y-6 animate-fade-in">
                    
                    {/* Golden luxury seal */}
                    <div className="absolute top-0 right-0 w-24 h-24 border-b border-l border-[#C5A059]/30 rotate-12 bg-[#C5A059]/5 flex items-center justify-center select-none font-mono text-[9px] text-[#C5A059] tracking-widest uppercase text-center p-2 origin-top-right">
                      Atelier Approved
                    </div>

                    <div className="space-y-1 border-b border-neutral-100 pb-4">
                      <span className="text-[10px] font-mono tracking-widest text-[#C5A059] uppercase block">Strategic Spec Prospectus</span>
                      <h2 className="font-serif text-2xl font-bold text-[#1D1D1F]">Custom Packaging Architecture</h2>
                    </div>

                    {/* Executive Summary */}
                    <div className="p-4 bg-[#FAF8F5] border border-[#EAE6DF] rounded italic text-xs leading-relaxed text-neutral-600 font-serif">
                      "{aiRecommendation.executiveSummary}"
                    </div>

                    {/* Key Technical parameters layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                      
                      {/* Structure selection */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block">Recommended Category</span>
                        <span className="font-serif text-sm font-bold text-[#1A1A1A] block">{aiRecommendation.recommendedProductType}</span>
                        <p className="text-[10px] text-neutral-500 leading-normal">
                          Matches product weight limits, unboxing drop tolerances, and tactile luxurious thresholds.
                        </p>
                      </div>

                      {/* Dimensions suggested */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block">Calculated Blueprint Dimensions</span>
                        <span className="font-mono text-sm font-bold text-[#C5A059] block">
                          {aiRecommendation.dimensions?.suggestedLength}L x {aiRecommendation.dimensions?.suggestedWidth}W x {aiRecommendation.dimensions?.suggestedHeight}H Inches
                        </span>
                        <p className="text-[10px] text-neutral-500 leading-normal">
                          Engineered with spatial buffer padding suitable for secondary protective paper cushions.
                        </p>
                      </div>

                    </div>

                    {/* Material Details */}
                    <div className="border-t border-neutral-100 pt-4 space-y-2">
                      <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-[#1A1A1A] block">Core Board density & wrap specs</span>
                      <div className="space-y-1">
                        <span className="text-xs font-mono font-semibold text-neutral-800 block">{aiRecommendation.materialGSMRecommendation?.material}</span>
                        <p className="text-[11px] text-neutral-500 leading-relaxed font-light">
                          {aiRecommendation.materialGSMRecommendation?.reasoning}
                        </p>
                      </div>
                    </div>

                    {/* Embellishments */}
                    <div className="border-t border-neutral-100 pt-4 space-y-3">
                      <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-[#1A1A1A] block">Suggested Embellishments</span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {aiRecommendation.finishingOptions?.map((f, idx) => (
                          <div key={idx} className="bg-[#FAF8F5] p-3 rounded border border-[#EAE6DF] space-y-1">
                            <span className="text-xs font-mono font-bold text-[#C5A059] uppercase block">{f.name}</span>
                            <p className="text-[10px] text-neutral-500 leading-relaxed font-light">
                              {f.description}
                            </p>
                            <span className="text-[9px] font-mono italic text-neutral-400 block mt-1">Unboxing Vibe: {f.vibeEffect}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Market strategy advice */}
                    <div className="border-t border-neutral-100 pt-4 space-y-3">
                      <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-[#1A1A1A] block">Atelier Business & Logistics Intelligence</span>
                      <div className="space-y-3 text-[11px] leading-relaxed">
                        <div>
                          <strong className="text-neutral-700 font-mono block">B2B Margin Premium:</strong>
                          <span className="text-neutral-500 font-light">{aiRecommendation.strategicAdvice?.b2bPositioning}</span>
                        </div>
                        <div>
                          <strong className="text-neutral-700 font-mono block">Sustainability Positioning:</strong>
                          <span className="text-neutral-500 font-light">{aiRecommendation.strategicAdvice?.sustainabilityAngle}</span>
                        </div>
                        <div>
                          <strong className="text-neutral-700 font-mono block">Volumetric Shipping Efficiency:</strong>
                          <span className="text-neutral-500 font-light">{aiRecommendation.strategicAdvice?.shippingEfficiency}</span>
                        </div>
                      </div>
                    </div>

                    {/* Economics summary */}
                    <div className="border-t border-neutral-100 pt-4 bg-[#FAF8F5] p-4 rounded border border-neutral-200 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div>
                        <span className="text-[9px] font-mono text-neutral-400 block uppercase">1,000 Volume Unit Cost</span>
                        <span className="font-serif text-sm font-bold text-[#1D1D1F]">${aiRecommendation.pricingOverview?.baseUnitPriceEstimate?.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-mono text-neutral-400 block uppercase">5,000 Volume Unit Cost</span>
                        <span className="font-serif text-sm font-bold text-[#C5A059]">${aiRecommendation.pricingOverview?.bulkUnitPriceEstimate?.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-mono text-neutral-400 block uppercase">Minimum order volume</span>
                        <span className="font-serif text-sm font-bold text-[#1D1D1F]">{aiRecommendation.pricingOverview?.minimumOrderQuantity} pcs</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-mono text-neutral-400 block uppercase">Steel Tooling Setup</span>
                        <span className="font-serif text-sm font-bold text-[#1D1D1F]">${aiRecommendation.pricingOverview?.toolingCostEstimate}</span>
                      </div>
                    </div>

                    {/* ACTION CTA: AUTOMATICALLY TRANSFER TO SIMULATOR AND PRICE CALC */}
                    <div className="pt-4 border-t border-neutral-100 flex justify-end">
                      <button
                        onClick={() => applyAiSpecsToSimulator(aiRecommendation)}
                        className="bg-[#1A1A1A] hover:bg-[#C5A059] hover:text-[#1A1A1A] text-white text-xs font-mono tracking-widest uppercase py-3 px-6 rounded-sm transition-all flex items-center gap-2"
                      >
                        Apply specs to custom simulator
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                )}

              </div>

            </div>

          </div>
        )}


        {/* ==================================================== */}
        {/* TAB 4: HERITAGE, SUSTAINABILITY & CRAFTSMANSHIP      */}
        {/* ==================================================== */}
        {activeTab === 'craftsmanship' && (
          <div id="tab-craftsmanship" className="space-y-16 animate-fade-in">
            
            {/* LARGE HERO EDITORIAL */}
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <span className="text-xs font-mono tracking-widest text-[#C5A059] uppercase block">Est. 1994 • Brand Heritage</span>
              <h1 className="font-serif text-4xl md:text-5xl tracking-wide font-light text-[#1A1A1A]">
                The Story of Hand-Finished Precision
              </h1>
              <div className="w-16 h-[1px] bg-[#C5A059] mx-auto"></div>
              <p className="text-neutral-500 text-sm md:text-base leading-relaxed font-light">
                At Shri Packers, we treat box construction not as a volume manufacturing commodity, but as fine mechanical architecture. Packaging is a customer's first physical handshake with your brand. We make it unforgettable.
              </p>
            </div>

            {/* TWO COLUMN EDITORIAL WITH HIGH CONTRAST */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <span className="text-xs font-mono tracking-widest text-[#C5A059] uppercase block">Material Selection Integrity</span>
                <h2 className="font-serif text-2xl tracking-wide font-normal text-[#1A1A1A]">FSC-Certified & Organic Pulp Bases</h2>
                <p className="text-neutral-500 text-sm leading-relaxed font-light">
                  Every gram of wood fiber we source belongs to strictly audited FSC forests or compostable agricultural residues (sugarcane bagasse and organic wheat straw stalks). Our premium velvet papers are laminated with cornstarch extracts rather than petroleum plastics, meaning your box preserves the Earth while presenting absolute luxury.
                </p>
                <div className="pt-4 flex gap-4 text-xs font-mono">
                  <div className="space-y-1">
                    <span className="font-bold text-[#1A1A1A] block">100%</span>
                    <span className="text-neutral-400">Recyclable Wrap</span>
                  </div>
                  <div className="space-y-1 border-l border-neutral-200 pl-4">
                    <span className="font-bold text-[#1A1A1A] block">Zero</span>
                    <span className="text-neutral-400">Microplastics</span>
                  </div>
                  <div className="space-y-1 border-l border-neutral-200 pl-4">
                    <span className="font-bold text-[#1A1A1A] block">FSC CoC</span>
                    <span className="text-neutral-400">Certified Sourcing</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#1A1A1A] rounded p-8 border border-[#2C2518] text-white space-y-6 shadow-md">
                <span className="text-xs font-mono tracking-widest text-[#C5A059] uppercase block">Mechanical Tolerance Guidelines</span>
                <h3 className="font-serif text-xl tracking-wide font-normal text-[#E5D5B8]">0.1mm Die-Rule Engineering</h3>
                <p className="text-neutral-400 text-xs leading-relaxed font-light">
                  A box that fails to close with a distinct air-pocket hiss is a failure of brand integrity. Our structural draftsmen model custom cutting shapes with precision calibration of fold creases, scoring patterns, and hidden rare-earth magnetic polar alignments.
                </p>
                <ul className="space-y-2 text-xs font-mono text-neutral-300">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-[#C5A059] rounded-full"></span>
                    Air-release micro vents prevent unboxing friction vacuum
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-[#C5A059] rounded-full"></span>
                    Creases pre-folded to 120° for immediate fold shape memory
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-[#C5A059] rounded-full"></span>
                    Double-walled internal backing guards against heavy drop punctures
                  </li>
                </ul>
              </div>
            </div>

            {/* THREE COLUMN PILLARS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-[#EAE6DF]">
              <div className="space-y-3">
                <h4 className="font-serif text-lg font-bold text-[#1A1A1A]">Curated Wrapping</h4>
                <p className="text-neutral-500 text-xs leading-relaxed">
                  Our papers are applied to greyboard backings with premium water-soluble starch glues, wrapped by hand-finishing specialists to eliminate corner wrinkles or bubbling entirely.
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="font-serif text-lg font-bold text-[#1A1A1A]">Foil Hot-Stamping</h4>
                <p className="text-neutral-500 text-xs leading-relaxed">
                  Utilizing heavy-pressure brass die plates rather than standard zinc plates, rendering crisper typographic edges, deeper indentation depth, and pristine gold sheen.
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="font-serif text-lg font-bold text-[#1A1A1A]">Drop-Tested Assurance</h4>
                <p className="text-neutral-500 text-xs leading-relaxed">
                  Every custom structure undergoes ASTM standard package drop trials, ensuring your cosmetic flacons or precious spirits remain entirely insulated during transit.
                </p>
              </div>
            </div>

          </div>
        )}


        {/* ==================================================== */}
        {/* TAB 5: SUBMITTED INQUIRIES & LIVE SPECIFICATION HUB */}
        {/* ==================================================== */}
        {activeTab === 'inquiries' && (
          <div id="tab-inquiries" className="space-y-10 animate-fade-in">
            
            {/* TAB TITLE */}
            <div className="space-y-2 border-b border-[#EAE6DF] pb-5">
              <span className="text-xs font-mono tracking-widest text-[#C5A059] uppercase block">Client Portal Workspace</span>
              <h1 className="font-serif text-3xl font-light text-[#1A1A1A]">Atelier Inquiries Hub</h1>
              <p className="text-neutral-500 text-sm max-w-3xl">
                View filed blueprint templates, track custom estimation approvals, or retrieve spec ledger PDF drafts compiled under your local workstation profile.
              </p>
            </div>

            {/* INQUIRIES WORKSPACE LISTING */}
            {submittedQuotes.length === 0 ? (
              <div className="bg-white border border-neutral-200 rounded-lg p-12 text-center max-w-lg mx-auto space-y-4">
                <FileText className="w-12 h-12 text-neutral-300 mx-auto" />
                <h3 className="font-serif text-lg font-bold">No registered custom specs found</h3>
                <p className="text-neutral-500 text-xs leading-relaxed">
                  You have not submitted any custom blueprints in this session. Head to our Custom Atelier Simulator or utilize the AI Strategist to register a project.
                </p>
                <button
                  onClick={() => setActiveTab('simulator')}
                  className="bg-[#1A1A1A] hover:bg-[#C5A059] text-white text-xs font-mono tracking-widest uppercase py-2.5 px-6 rounded-sm transition-all"
                >
                  Create Spec Sheet
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {submittedQuotes.map(quote => {
                  const productRef = PACKAGING_PRODUCTS.find(p => p.id === quote.productId);
                  return (
                    <div 
                      key={quote.id}
                      className="bg-white border border-[#EAE6DF] rounded-lg p-6 shadow-xs relative overflow-hidden flex flex-col md:flex-row justify-between gap-6"
                    >
                      {/* Status indicator rail */}
                      <div className={`absolute left-0 top-0 w-1.5 h-full ${
                        quote.status === 'pending' ? 'bg-amber-400' :
                        quote.status === 'reviewed' ? 'bg-blue-400' :
                        quote.status === 'approved' ? 'bg-emerald-500' : 'bg-neutral-400'
                      }`}></div>

                      {/* Left: General Spec overview */}
                      <div className="space-y-4 max-w-xl">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs font-bold text-[#1A1A1A]">{quote.projectName}</span>
                            <span className="text-[9px] font-mono bg-neutral-100 text-neutral-500 py-0.5 px-2 rounded">Ref: {quote.id}</span>
                            <span className={`text-[9px] font-mono tracking-widest uppercase py-0.5 px-2 rounded font-bold ${
                              quote.status === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                              quote.status === 'reviewed' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                              quote.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                              'bg-neutral-50 text-neutral-600 border border-neutral-200'
                            }`}>{quote.status}</span>
                          </div>
                          <span className="text-[10px] font-mono text-[#C5A059] block uppercase">Product Spec: {productRef?.name}</span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-[11px] font-mono">
                          <div>
                            <span className="text-neutral-400 block">Blueprints:</span>
                            <span className="text-neutral-700 font-semibold">{quote.length} x {quote.width} x {quote.height} in</span>
                          </div>
                          <div>
                            <span className="text-neutral-400 block">Thickness (GSM):</span>
                            <span className="text-neutral-700 font-semibold">{quote.gsm} GSM</span>
                          </div>
                          <div>
                            <span className="text-neutral-400 block">Quantity order:</span>
                            <span className="text-neutral-700 font-semibold">{quote.quantity} units</span>
                          </div>
                          <div>
                            <span className="text-neutral-400 block">Est. Unit Price:</span>
                            <span className="text-neutral-700 font-semibold">${quote.estimatedUnitPrice.toFixed(2)}</span>
                          </div>
                        </div>

                        {quote.additionalNotes && (
                          <div className="p-3 bg-neutral-50 rounded border border-neutral-100 text-[11px] text-neutral-500 leading-normal font-light">
                            <strong>Atelier Custom Request Notes:</strong> {quote.additionalNotes}
                          </div>
                        )}

                        <div className="text-[10px] text-neutral-400 font-mono">
                          Filed under: <span className="font-bold text-neutral-600">{quote.companyName}</span> ({quote.contactName}) • {new Date(quote.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </div>

                      {/* Right: Cost readout and simulated PDF export */}
                      <div className="flex flex-col justify-between items-end shrink-0 text-right space-y-4">
                        <div className="space-y-1">
                          <span className="text-[9px] font-mono text-neutral-400 block uppercase">Estimated Volume Total</span>
                          <span className="font-serif text-2xl font-bold text-[#C5A059]">${quote.estimatedTotalPrice.toLocaleString()}</span>
                          <span className="text-[9px] font-mono text-neutral-400 block">Estimated Delivery: {quote.estimatedLeadTimeDays} days</span>
                        </div>

                        <div className="flex flex-wrap gap-2 justify-end">
                          <button
                            onClick={() => {
                              // Simulate printing the spec sheet
                              window.print();
                            }}
                            className="p-2 border border-neutral-200 hover:border-neutral-400 rounded text-neutral-500 hover:text-neutral-700 transition-all"
                            title="Generate a printer-friendly specification prospectus"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => {
                              alert(`Simulating Specification Prospectus export for ${quote.projectName}. A complete PDF file contains raw mechanical parameters, creasing schematics, lamination properties, and lead time logistics.`);
                            }}
                            className="bg-[#1A1A1A] hover:bg-[#C5A059] text-white hover:text-[#1A1A1A] text-[10px] font-mono tracking-wider uppercase py-2 px-4 rounded-sm transition-all"
                          >
                            Download PDF Spec
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* GENERAL CONTACT CONSULTATION OPTION */}
            <div className="bg-[#1A1A1A] text-[#FAF8F5] border border-[#2C2518] rounded-lg p-6 md:p-10 space-y-6 shadow-lg">
              <span className="text-xs font-mono tracking-widest text-[#C5A059] uppercase block">B2B Custom Consultation Desk</span>
              <h2 className="font-serif text-2xl md:text-3xl font-light">Need a complete enterprise-level corporate solution?</h2>
              <p className="text-neutral-400 text-sm max-w-2xl leading-relaxed font-light">
                For complex B2B shipping matrix systems, continuous scheduled monthly releases, and high-security RFID tagging integrations, request a personalized live video consultation with our lead Technical packaging strategist.
              </p>
              <div className="flex flex-wrap gap-4 pt-4 text-xs font-mono">
                <a href="mailto:atelier@shripackers.com" className="text-[#C5A059] hover:underline flex items-center gap-1.5">
                  <Mail className="w-4 h-4" />
                  consult@shripackers.com
                </a>
                <span className="text-neutral-700">|</span>
                <span className="text-neutral-300 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#C5A059]" />
                  Response SLA: Under 2 Hours
                </span>
              </div>
            </div>

          </div>
        )}


        {/* ========================================================= */}
        {/* TAB 6: CLIENT RELATIONS TERMINAL (ADMIN ADMIN PANEL) */}
        {/* ========================================================= */}
        {activeTab === 'admin' && (
          <div id="tab-admin" className="space-y-10 animate-fade-in">
            
            {/* TAB TITLE */}
            <div className="space-y-2 border-b border-[#EAE6DF] pb-5">
              <div className="flex items-center gap-2">
                <FolderLock className="w-5 h-5 text-[#C5A059]" />
                <span className="text-xs font-mono tracking-widest text-[#C5A059] uppercase block">Atelier Backend Terminal</span>
              </div>
              <h1 className="font-serif text-3xl font-light text-[#1A1A1A]">Client Relations desk</h1>
              <p className="text-neutral-500 text-sm max-w-3xl">
                Review submitted custom quote requests, calculate gross margin valuations (Foil premium, raw board, tooling costs), simulate email spec approvals, and adjust manufacturing status settings.
              </p>
            </div>

            <div className="bg-[#111] text-[#ECEFF1] rounded-lg p-4 border border-[#2C2518] font-mono text-xs flex justify-between items-center shadow-inner">
              <span className="text-green-400 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
                Terminal Active: shri_packers_review_node
              </span>
              <span className="text-neutral-400">Total Specs Registered: {submittedQuotes.length}</span>
            </div>

            {submittedQuotes.length === 0 ? (
              <div className="bg-white border border-neutral-200 rounded-lg p-10 text-center max-w-md mx-auto space-y-2">
                <Info className="w-8 h-8 text-neutral-300 mx-auto" />
                <h3 className="font-serif text-base font-bold text-[#1A1A1A]">No specs registered</h3>
                <p className="text-neutral-500 text-xs">
                  Awaiting B2B inquiry inputs. Fill out specifications in the customizer tab first.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                
                {/* LIST OF PENDING QUOTES */}
                <div className="lg:col-span-12 space-y-6">
                  {submittedQuotes.map(quote => {
                    const productRef = PACKAGING_PRODUCTS.find(p => p.id === quote.productId);
                    
                    // Simulate internal business breakdowns (cost vs profits)
                    // Let's assume manufacturing cost is 38% of total price
                    const mfgCost = quote.estimatedTotalPrice * 0.38;
                    const shippingCost = quote.estimatedTotalPrice * 0.08;
                    const rawGrossProfit = quote.estimatedTotalPrice - mfgCost - shippingCost;
                    const grossMarginPercent = (rawGrossProfit / quote.estimatedTotalPrice) * 100;

                    return (
                      <div 
                        key={quote.id}
                        className="bg-white border border-neutral-200 rounded p-6 shadow-sm space-y-4"
                      >
                        <div className="flex flex-wrap justify-between items-start gap-4 border-b border-neutral-100 pb-3">
                          <div className="space-y-1">
                            <h3 className="text-sm font-mono font-bold text-[#1A1A1A] flex items-center gap-2">
                              {quote.projectName}
                              <span className="text-[10px] font-normal text-neutral-400">Ref: {quote.id}</span>
                            </h3>
                            <span className="text-[10px] text-[#C5A059] block uppercase">PRODUCT SPECS: {productRef?.name}</span>
                          </div>

                          <div className="flex flex-wrap gap-2 items-center">
                            <span className="text-xs font-mono font-bold text-[#C5A059] mr-2">Valuation: ${quote.estimatedTotalPrice.toLocaleString()}</span>
                            
                            <select
                              value={quote.status}
                              onChange={(e) => handleUpdateQuoteStatus(quote.id, e.target.value as any)}
                              className="bg-neutral-50 border border-neutral-200 rounded text-[11px] font-mono p-1.5 focus:outline-none focus:ring-1 focus:ring-[#C5A059]"
                            >
                              <option value="pending">Set Pending</option>
                              <option value="reviewed">Set Reviewed</option>
                              <option value="approved">Set Approved</option>
                              <option value="completed">Set Completed</option>
                            </select>

                            <button
                              onClick={() => handleDeleteQuote(quote.id)}
                              className="px-2.5 py-1.5 rounded text-[10px] font-mono border border-red-200 text-red-600 hover:bg-red-50 transition-all"
                            >
                              Archive
                            </button>
                          </div>
                        </div>

                        {/* Valuation calculations Ledger */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-[#FAF8F5] p-4 rounded border border-neutral-200">
                          
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono text-neutral-400 block uppercase">Client Profile</span>
                            <span className="text-xs text-neutral-700 font-bold block">{quote.companyName}</span>
                            <span className="text-[10px] font-mono text-neutral-500 block">{quote.email}</span>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[10px] font-mono text-neutral-400 block uppercase">Blueprints Specs</span>
                            <span className="text-xs text-neutral-700 font-mono block">Volume: {quote.quantity} pcs</span>
                            <span className="text-[10px] font-mono text-neutral-500 block">L:{quote.length}" x W:{quote.width}" x H:{quote.height}"</span>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[10px] font-mono text-neutral-400 block uppercase">Cost Breakdown</span>
                            <span className="text-xs text-neutral-700 font-mono block">Mfg: ${mfgCost.toLocaleString(undefined, { maximumFractionDigits: 0 })} (38%)</span>
                            <span className="text-xs text-neutral-700 font-mono block">Freight: ${shippingCost.toLocaleString(undefined, { maximumFractionDigits: 0 })} (8%)</span>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[10px] font-mono text-neutral-400 block uppercase">Atelier Est. Gross Margin</span>
                            <span className="text-xs text-emerald-600 font-mono font-bold block">${rawGrossProfit.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                            <span className="text-[10px] font-mono text-emerald-500 font-bold block">{grossMarginPercent.toFixed(1)}% Gross Margin</span>
                          </div>

                        </div>

                        {/* Interactive Client SLA simulation tools */}
                        <div className="pt-2 flex flex-wrap justify-between items-center text-xs gap-4">
                          <span className="text-neutral-400">Spec submitted: {new Date(quote.createdAt).toLocaleString()}</span>
                          
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                alert(`Quotation Spec email template generated: \n\n"Dear ${quote.contactName}, \nWe have reviewed specifications for project '${quote.projectName}'. Our draftsmen confirm structural tolerance limits are fully validated. Total proposal for ${quote.quantity} units is $${quote.estimatedTotalPrice.toLocaleString()} with tooling setup starting in ${quote.estimatedLeadTimeDays} days."`);
                              }}
                              className="px-3.5 py-1.5 bg-[#FAF8F5] border border-neutral-300 rounded text-[11px] font-mono text-[#1A1A1A] hover:bg-neutral-50 transition-all"
                            >
                              Simulate Approval Email
                            </button>
                            <button
                              onClick={() => {
                                alert(`Opening live structural spec debugger for Ref: ${quote.id}. CAD meshes are verified, and board grain direction is optimized to parallel the length folds.`);
                              }}
                              className="px-3.5 py-1.5 bg-[#1A1A1A] text-[#FAF8F5] rounded text-[11px] font-mono hover:bg-[#C5A059] hover:text-[#1A1A1A] transition-all"
                            >
                              Debug CAD Mesh
                            </button>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>

              </div>
            )}

          </div>
        )}

      </main>

      {/* EXQUISITE LUXURY BRAND FOOTER */}
      <footer id="brand-footer" className="bg-[#111] text-white py-16 px-6 mt-20 border-t border-[#2C2518]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12">
          
          <div className="md:col-span-5 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#FAF8F5] text-[#1A1A1A] flex items-center justify-center rounded-sm border border-[#C5A059]">
                <span className="font-serif font-bold text-lg">SP</span>
              </div>
              <div>
                <span className="font-serif text-lg font-bold tracking-widest uppercase block">Shri Packers</span>
                <span className="text-[9px] uppercase tracking-[0.2em] text-[#C5A059] font-mono">Premium Packaging Redefined</span>
              </div>
            </div>
            <p className="text-neutral-400 text-xs leading-relaxed max-w-sm">
              Shri Packers is a global elite packaging atelier specializing in heavy greyboard structures, magnetic velvet lamination wrap solutions, and biodegradable sugarcane agricultural waste boards.
            </p>
            <p className="text-neutral-500 text-[11px] font-mono">
              Designed for luxury, engineered for absolute drop safety.
            </p>
          </div>

          <div className="md:col-span-3 space-y-4">
            <h4 className="text-xs font-mono tracking-widest uppercase font-bold text-[#C5A059]">Atelier Portfolio</h4>
            <ul className="space-y-2 text-xs text-neutral-400 font-mono">
              <li><button onClick={() => { setSelectedProductId('luxury-rigid'); setActiveTab('collections'); }} className="hover:text-white">Luxury Rigid Boxes</button></li>
              <li><button onClick={() => { setSelectedProductId('ecommerce-mailer'); setActiveTab('collections'); }} className="hover:text-white">E-commerce Mailers</button></li>
              <li><button onClick={() => { setSelectedProductId('sustainable-eco'); setActiveTab('collections'); }} className="hover:text-white">Sustainable Pulp</button></li>
              <li><button onClick={() => { setSelectedProductId('die-cut-custom'); setActiveTab('collections'); }} className="hover:text-white">Die-Cut Custom Templates</button></li>
            </ul>
          </div>

          <div className="md:col-span-4 space-y-4">
            <h4 className="text-xs font-mono tracking-widest uppercase font-bold text-[#C5A059]">Headquarters & Atelier Contacts</h4>
            <ul className="space-y-2 text-xs text-neutral-400 font-mono">
              <li>Shri Packers Premium Manufacturing Zone</li>
              <li>A-42 Sector 63, Industrial Atelier Block, Noida, India</li>
              <li>Work hours: Mon - Sat • 9:00 AM - 7:00 PM</li>
              <li className="pt-2 text-neutral-500">Global Customer SLA: SLA under 2 hours.</li>
            </ul>
          </div>

        </div>

        <div className="max-w-7xl mx-auto border-t border-neutral-800/60 mt-12 pt-6 flex flex-col sm:flex-row justify-between text-[11px] text-neutral-500 font-mono">
          <span>&copy; {new Date().getFullYear()} Shri Packers Private Ltd. All luxury designs, CAD layouts, and spec parameters are copyright preserved.</span>
          <span className="mt-2 sm:mt-0">Premium Packaging Redefined</span>
        </div>
      </footer>

    </div>
  );
}
