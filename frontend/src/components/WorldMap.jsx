import React, { memo, useMemo } from 'react';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const WorldMap = memo(({ countries = [], markers = [] }) => {
  // Build a lookup: countryCode (ISO Alpha-2) -> views
  const countryData = useMemo(() => {
    const map = {};
    countries.forEach(c => { map[c.countryCode] = c.views; });
    return map;
  }, [countries]);

  const maxViews = useMemo(() => Math.max(...countries.map(c => c.views), 1), [countries]);

  const getColor = (geo) => {
    // react-simple-maps uses ISO_A2 or ISO_A3 properties
    const code2 = geo.properties?.ISO_A2;
    const views = countryData[code2];
    if (!views) return '#e5e7eb';
    const intensity = Math.max(0.15, views / maxViews);
    // Interpolate from light blue to deep blue
    const r = Math.round(219 - intensity * 189);
    const g = Math.round(234 - intensity * 119);
    const b = Math.round(254 - intensity * 64);
    return `rgb(${r},${g},${b})`;
  };

  return (
    <div className="w-full" data-testid="world-map">
      <ComposableMap
        projectionConfig={{ rotate: [-10, 0, 0], scale: 147 }}
        width={800}
        height={400}
        style={{ width: '100%', height: 'auto' }}
      >
        <ZoomableGroup center={[0, 20]} zoom={1}>
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rpiKey || geo.properties?.name}
                  geography={geo}
                  fill={getColor(geo)}
                  stroke="#fff"
                  strokeWidth={0.4}
                  style={{
                    default: { outline: 'none' },
                    hover: { outline: 'none', fill: '#1e73be', cursor: 'pointer' },
                    pressed: { outline: 'none' },
                  }}
                />
              ))
            }
          </Geographies>

          {/* City markers */}
          {markers.map((m, i) => (
            <Marker key={i} coordinates={[m.lon, m.lat]}>
              <circle
                r={Math.max(2, Math.min(6, (m.views / maxViews) * 8))}
                fill="#ef4444"
                fillOpacity={0.7}
                stroke="#fff"
                strokeWidth={0.5}
              />
            </Marker>
          ))}
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
});

WorldMap.displayName = 'WorldMap';
export default WorldMap;
