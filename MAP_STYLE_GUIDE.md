# Map Style Guide - Waze-like Basemaps

This guide helps you experiment with different basemaps and APIs to find the perfect Waze-like appearance for your mapping application.

## 🎨 Available Map Styles

### Web Version (Mapbox-based)

Your web application now includes a style switcher with these options:

#### 1. Navigation Night (Most Waze-like) ⭐
- **Style**: `mapbox://styles/mapbox/navigation-night-v1`
- **Provider**: Mapbox
- **Description**: Dark theme specifically designed for navigation, very similar to Waze
- **Best for**: Night driving, navigation apps

#### 2. Dark Theme
- **Style**: `mapbox://styles/mapbox/dark-v11`
- **Provider**: Mapbox
- **Description**: General dark theme with good contrast
- **Best for**: Dark mode applications

#### 3. Custom Dark Navigation
- **Style**: Custom JSON style definition
- **Provider**: Mapbox
- **Description**: Hand-crafted style mimicking Waze's color scheme
- **Features**:
  - Dark background (`#1a1a1a`)
  - Blue primary roads (`#4299e1`)
  - Light blue secondary roads (`#63b3ed`)
  - Gray street-level roads (`#a0aec0`)
  - Dark water features (`#2d3748`)

#### 4. CartoDB Dark Matter
- **Style**: Raster tiles
- **Provider**: CartoDB
- **Description**: High-contrast dark theme popular for data visualization
- **Best for**: Dramatic, high-contrast appearance

#### 5. Satellite Streets
- **Style**: `mapbox://styles/mapbox/satellite-streets-v12`
- **Provider**: Mapbox
- **Description**: Satellite imagery with street overlays
- **Best for**: Detailed terrain visualization

### Mobile Version (Leaflet-based)

Your mobile application includes these basemap options:

#### 1. Dark Matter (Most Waze-like) ⭐
```javascript
'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
```
- **Provider**: CartoDB
- **Description**: The closest match to Waze's appearance
- **Features**: Dark background, bright roads, clear labels

#### 2. Dark No Labels
```javascript
'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png'
```
- **Provider**: CartoDB
- **Description**: Clean dark theme without text labels
- **Best for**: Custom labeling or minimal interface

#### 3. Stamen Toner
```javascript
'https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}{r}.png'
```
- **Provider**: Stamen Design
- **Description**: High-contrast black and white theme
- **Best for**: Artistic, minimalist appearance

#### 4. ESRI Dark Gray
```javascript
'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}'
```
- **Provider**: Esri
- **Description**: Professional dark gray theme
- **Best for**: Business applications

## 🚀 How to Switch Styles

### Web Version
1. Open your map page
2. Click the palette icon (🎨) in the search bar
3. Select from available map styles
4. The map will update immediately

### Mobile Version
Currently using Dark Matter by default. To experiment with other styles:

1. Open `MapScreen.tsx`
2. Find the `basemaps` object around line 400
3. Change `basemaps['dark-matter']` to any other key like:
   - `basemaps['stamen-toner']`
   - `basemaps['esri-dark']`
   - `basemaps['dark-nolabels']`

## 🎯 Waze-like Characteristics

To achieve the most Waze-like appearance, look for these features:

### Color Scheme
- **Background**: Very dark (`#1a1a1a` to `#2a2a2a`)
- **Major Roads**: Bright blue (`#4299e1`)
- **Secondary Roads**: Light blue (`#63b3ed`)
- **Local Streets**: Light gray (`#a0aec0`)
- **Water**: Dark blue-gray (`#2d3748`)
- **Text**: White or light gray

### Visual Elements
- High contrast between roads and background
- Minimal visual clutter
- Clear road hierarchy (major roads more prominent)
- Smooth, rounded road appearance
- Dark theme optimized for night driving

## 🔧 Advanced Customization

### Creating Custom Mapbox Styles

1. Go to [Mapbox Studio](https://studio.mapbox.com/)
2. Create a new style based on "Navigation Night"
3. Customize colors to match Waze exactly:
   - Background: `#1a1a1a`
   - Primary roads: `#00d4ff` (Waze blue)
   - Secondary roads: `#87ceeb`
   - Water: `#2d3748`
4. Publish and use the style URL in your app

### Adding More Providers

You can experiment with these additional providers:

#### HERE Maps
```javascript
// Requires API key
'https://{1-4}.base.maps.ls.hereapi.com/maptile/2.1/maptile/newest/reduced.night/{z}/{x}/{y}/256/png8?apikey=YOUR_API_KEY'
```

#### Google Maps (with API key)
```javascript
// Requires Google Maps API and custom styling
// Use the Maps JavaScript API with custom styling
```

#### OpenMapTiles
```javascript
'https://api.maptiler.com/maps/streets-dark/{z}/{x}/{y}.png?key=YOUR_API_KEY'
```

## 📱 Mobile-Specific Considerations

### Performance
- Raster tiles (like CartoDB) load faster on mobile
- Vector tiles (like Mapbox) offer better scaling but require more processing

### User Experience
- Dark themes reduce battery usage on OLED screens
- High contrast improves visibility in bright sunlight
- Consider automatic day/night switching

## 🎨 Style Recommendations by Use Case

### Navigation Apps (Most Waze-like)
1. **Web**: Navigation Night + Custom markers
2. **Mobile**: CartoDB Dark Matter + Custom styling

### Data Visualization
1. **Web**: Custom Dark Navigation
2. **Mobile**: Stamen Toner

### General Purpose
1. **Web**: Mapbox Dark
2. **Mobile**: ESRI Dark Gray

## 🔄 Testing Different Styles

### Quick Testing Checklist
- [ ] Road visibility and hierarchy
- [ ] Text readability
- [ ] Marker contrast
- [ ] Performance on mobile
- [ ] Appearance in different lighting conditions
- [ ] User feedback

### A/B Testing
Consider implementing A/B testing to see which styles users prefer:
- Track user engagement
- Monitor app usage patterns
- Collect direct feedback

## 📞 API Keys and Limits

### Free Tiers Available
- **CartoDB**: 75,000 map views/month
- **Mapbox**: 50,000 map views/month
- **Stamen**: No official limits but consider donations

### Paid Options for Higher Volume
- **Google Maps**: Pay per 1,000 requests
- **HERE**: Various pricing tiers
- **MapTiler**: Subscription-based

## 🚨 Important Notes

1. **API Keys**: Some providers require API keys. Never commit keys to version control.
2. **Attribution**: Always include proper attribution as required by providers.
3. **Terms of Service**: Review each provider's terms of service for your use case.
4. **Caching**: Implement proper caching to reduce API calls and improve performance.

## 🎯 Next Steps

1. Test the current implementations
2. Gather user feedback on preferred styles
3. Consider implementing automatic day/night mode switching
4. Optimize performance based on your user base
5. Consider creating custom branded styles

Happy mapping! 🗺️
