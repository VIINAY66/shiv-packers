/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Initialize Gemini
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    aiClient = new GoogleGenAI({ apiKey: key });
  }
  return aiClient;
}

// API endpoint for Gemini custom strategist recommendation
app.post('/api/recommendation', async (req, res) => {
  try {
    const { productDescription, targetAudience, preferredVibe, sizeHint } = req.body;
    
    const client = getAI();
    
    const prompt = `You are the Chief Packaging Strategist, Technical Architect, and expert UI/UX Designer for "Shri Packers" (Motto: "Premium Packaging Redefined").
We manufacture high-end boxes (Luxury Rigid, E-commerce, Sustainable, Die-Cut).

A B2B client has approached us with the following product profile:
- Product Description: "${productDescription || 'Not specified'}"
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

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const text = response.text || '{}';
    res.json(JSON.parse(text.trim()));
  } catch (error: any) {
    console.error('Gemini strategic AI error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate recommendation' });
  }
});

// Wrap dev server creation in an async bootstrapper to completely avoid top-level await bundling warnings/errors
async function bootstrap() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    
    app.use(vite.middlewares);
    
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = await vite.transformIndexHtml(url, `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Shri Packers - Premium Packaging Redefined</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    // Serve static assets in production using process.cwd() for robust bundling
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start packaging server:', err);
});
