# Hostinger Deployment Guide for Shri Packers

This guide explains how to deploy the **Shri Packers** premium packaging simulator on Hostinger step-by-step. Since Hostinger offers both **Static Shared Web Hosting** (Apache-based, standard) and **Node.js VPS / Application Hosting**, we have optimized this application to support both!

---

## Method A: Deploy as a Static Website (Recommended & Fastest)
*Use this if you have Hostinger Shared Hosting (Premium, Business, or Cloud) without a dedicated Node.js server. This runs 100% in the client's browser.*

### Step 1: Build the Static Assets
1. Export your code or compile the build.
2. Run the build command in your terminal:
   ```bash
   npm run build
   ```
3. This creates a folder named `dist/` in your project root containing fully compiled, optimized relative assets (`index.html`, CSS, JS, and premium 3D/2D packaging product imagery).

### Step 2: Upload to Hostinger File Manager
1. Log in to your **Hostinger hPanel**.
2. Go to **Websites** -> **Manage** -> **File Manager** (or connect via FTP/SFTP).
3. Open the `public_html/` folder (or your subdomain directory).
4. Drag and drop **the contents of the `dist/` folder** (NOT the `dist` folder itself, but all the files inside it) directly into `public_html/`.

### Step 3: Run AI Strategic Consulting
Because Shared Hosting does not run a Node.js server to shield secret keys, we built a **Static Hostinger Client-Side Option** directly into the UI!
1. Open your deployed website on Hostinger.
2. Go to the **AI Strategist** tab.
3. Click on the gold **"Static Hosting & Hostinger Options"** button at the bottom of the form.
4. Input your own **Gemini API Key** (you can get one instantly for free at [Google AI Studio](https://aistudio.google.com/)).
5. The application will securely save the key in your browser's local storage and run the luxury packaging analysis directly in your browser. No server-side Node.js required!

---

## Method B: Deploy as a Node.js App
*Use this if you have Hostinger Node.js Application hosting or VPS where you want a live server API to handle the AI consulting requests with a hidden system API key.*

### Step 1: Environment Variables on Hostinger
1. In your Hostinger hPanel Node.js configuration or VPS panel, add the following environment variable:
   - Name: `GEMINI_API_KEY`
   - Value: `Your-Actual-Gemini-API-Key`
   - Name: `NODE_ENV`
   - Value: `production`

### Step 2: Configure Startup File
1. Hostinger's Node.js manager asks for the **Application Startup File** (or main entry point). Set this to:
   ```
   dist/server.cjs
   ```
2. Set your **Run Command** or **Start Script** to:
   ```bash
   npm run start
   ```

### Step 3: Run and Start
1. Run the installation inside Hostinger panel or SSH to install production dependencies:
   ```bash
   npm install --production
   ```
2. Build the server and client app:
   ```bash
   npm run build
   ```
3. Start the application. Hostinger will reverse-proxy requests on port `3000` (or the environment assigned `PORT`) to your domain. The server will host the full-stack API and serve the static files in production flawlessly!
