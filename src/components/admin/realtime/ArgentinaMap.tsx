import { useState } from 'react';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';

const GEO_URL =
  'https://cdn.jsdelivr.net/gh/apache/superset@master/superset-frontend/plugins/legacy-plugin-chart-country-map/src/countries/argentina.geojson';

export interface MapCity {
  name: string;
  coords: [number, number]; // [lng, lat]
  value: number;
  main?: boolean;
}

export function ArgentinaMap({ theme = 'light', cities = [] }: { theme?: 'dark' | 'light'; cities?: MapCity[] }) {
  const dark = theme === 'dark';
  const [hover, setHover] = useState<string | null>(null);

  const accent = dark ? '#818cf8' : '#0ea5e9';
  const accentBright = dark ? '#c7d2fe' : '#0284c7';
  const geoFill = dark ? '#1a2236' : '#eef2f6';
  const geoStroke = dark ? '#2f3a56' : '#d4dde5';
  const geoHover = dark ? '#232d47' : '#e2e8f0';

  const max = cities.reduce((m, c) => Math.max(m, c.value), 1);

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 700, center: [-64, -39] }}
        width={460}
        height={640}
        style={{ width: 'auto', height: '100%', maxWidth: '100%' }}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill={geoFill}
                stroke={geoStroke}
                strokeWidth={0.6}
                style={{
                  default: { outline: 'none', transition: 'fill .2s' },
                  hover: { outline: 'none', fill: geoHover },
                  pressed: { outline: 'none', fill: geoHover },
                }}
              />
            ))
          }
        </Geographies>

        {cities.map((c) => {
          const t = c.value / max;
          const r = 3 + t * 5;
          return (
            <Marker
              key={c.name}
              coordinates={c.coords}
              onMouseEnter={() => setHover(c.name)}
              onMouseLeave={() => setHover(null)}
            >
              {c.main && (
                <circle
                  r={r + 4}
                  fill="none"
                  stroke={accentBright}
                  strokeWidth={1.5}
                  opacity={0.9}
                  style={{ transformBox: 'fill-box', transformOrigin: 'center', animation: 'rt-pulse 1.9s ease-out infinite' }}
                />
              )}
              <circle r={r + 5} fill={accent} opacity={0.14} />
              <circle r={r} fill={c.main ? accentBright : accent} stroke={dark ? '#0d1320' : '#ffffff'} strokeWidth={1} />
              {hover === c.name && (
                <g transform={`translate(0, ${-r - 8})`} style={{ pointerEvents: 'none' }}>
                  <rect
                    x={-((c.name.length * 6.2 + 46) / 2)}
                    y={-19}
                    width={c.name.length * 6.2 + 46}
                    height={20}
                    rx={5}
                    fill={dark ? '#0d1320' : '#ffffff'}
                    stroke={dark ? '#2f3a56' : '#dfe2f2'}
                    strokeWidth={1}
                  />
                  <text
                    textAnchor="middle"
                    y={-5}
                    fontSize={11}
                    fontWeight={600}
                    fontFamily="'Instrument Sans', sans-serif"
                    fill={dark ? '#e9edf6' : '#111729'}
                  >
                    {`${c.name} · ${c.value.toLocaleString('es-AR')}`}
                  </text>
                </g>
              )}
            </Marker>
          );
        })}
      </ComposableMap>
    </div>
  );
}
