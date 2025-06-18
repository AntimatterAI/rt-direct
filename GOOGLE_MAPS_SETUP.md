# Google Maps API Setup for RT Direct

This guide will walk you through setting up Google Maps API for location services, geocoding, and interactive maps on the RT Direct platform.

## 🚀 **Quick Setup Steps**

### 1. **Create Google Cloud Project**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Name it something like "RT-Direct-Maps"

### 2. **Enable Required APIs**
Enable these APIs in your Google Cloud Console:
- **Maps JavaScript API** (for interactive maps)
- **Geocoding API** (for address to coordinates conversion)
- **Places API** (for location autocomplete)

**To enable:**
1. Go to "APIs & Services" > "Library"
2. Search for each API and click "Enable"

### 3. **Create API Key**
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the generated API key

### 4. **Secure Your API Key (IMPORTANT!)**
1. Click on your API key to edit it
2. Under "API restrictions", select "Restrict key"
3. Choose the APIs you enabled above
4. Under "Website restrictions", add your domains:
   - `localhost:3000` (for development)
   - `*.vercel.app` (for Vercel deployments)
   - Your custom domain (if you have one)

### 5. **Add to Environment Variables**
Add this to your `.env.local` file:
```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyBOovP323EA7FE_hJphrq1cHxY_HZo_mII
```

## 🔧 **Features Enabled**

### **Job Posting Form**
- ✅ **Smart Location Search**: Google Places autocomplete
- ✅ **Geocoding**: Automatic coordinate conversion
- ✅ **Address Validation**: Ensures locations exist

### **Job Search Page**
- ✅ **Interactive Map**: See jobs plotted on map
- ✅ **"Jobs Near Me"**: Geolocation-based search
- ✅ **Distance Filtering**: 25, 50, 100, 200 mile radius
- ✅ **Click to Select**: Click map markers to view job details

## 💰 **Pricing Information**

Google Maps API has generous free tiers:
- **Maps JavaScript**: $7/1000 loads (28,000 free monthly)
- **Geocoding**: $5/1000 requests (40,000 free monthly)  
- **Places Autocomplete**: $17/1000 requests (free tier available)

For a typical RT job board, you should easily stay within free limits.

## 🛡️ **Security Best Practices**

1. **Always restrict your API key** to specific APIs and domains
2. **Monitor usage** in Google Cloud Console
3. **Set spending limits** to avoid unexpected charges
4. **Use HTTPS only** for production

## 🔄 **Fallback Behavior**

If Google Maps API is not configured:
- Job posting will use static city database (100+ US cities)
- Job search will show list view only (no map)
- Console warnings will appear but app continues working

## 🧪 **Testing**

To test the setup:
1. Try posting a job and typing in the location field
2. Visit `/jobs` page and look for the interactive map
3. Click "Find Jobs Near Me" to test geolocation

## 🆘 **Troubleshooting**

### **Map not loading?**
- Check browser console for errors
- Verify API key is correct
- Ensure APIs are enabled
- Check domain restrictions

### **Autocomplete not working?**
- Verify Places API is enabled
- Check API key restrictions
- Look for console errors

### **Geocoding failing?**
- Ensure Geocoding API is enabled
- Check request limits
- Verify locations are valid

## 📞 **Support**

If you need help with setup:
1. Check browser console for specific error messages
2. Verify all APIs are enabled in Google Cloud Console
3. Double-check API key restrictions match your domain
4. Test with a fresh API key if issues persist

---

**Cost Estimate for RT Direct:**
- Small job board (< 1000 jobs/month): **FREE**
- Medium job board (< 10k jobs/month): **~$20-50/month**
- Large job board (< 100k jobs/month): **~$200-500/month** 