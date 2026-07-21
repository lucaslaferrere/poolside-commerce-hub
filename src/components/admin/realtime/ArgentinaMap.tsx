import { useState } from 'react';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';
import { Plus, Minus, Locate } from 'lucide-react';
// GeoJSON de Argentina bundleado localmente (sin depender de un CDN externo en runtime).
import argentinaGeo from '@/assets/argentina.geo.json';

export interface MapCity {
  name: string;
  coords: [number, number]; // [lng, lat]
  value: number;
  main?: boolean;
}

const HOME: { coordinates: [number, number]; zoom: number } = { coordinates: [-64, -39], zoom: 1 };
const MIN_ZOOM = 1;
const MAX_ZOOM = 12;

export function ArgentinaMap({ theme = 'light', cities = [] }: { theme?: 'dark' | 'light'; cities?: MapCity[] }) {
  const dark = theme === 'dark';
  const [hover, setHover] = useState<string | null>(null);
  const [position, setPosition] = useState(HOME);

  const accent = dark ? '#818cf8' : '#0ea5e9';
  const accentBright = dark ? '#c7d2fe' : '#0284c7';
  const geoFill = dark ? '#1a2236' : '#dbe3ec';
  const geoStroke = dark ? '#2f3a56' : '#8fa3b5';
  const geoHover = dark ? '#232d47' : '#c6d2de';

  const max = cities.reduce((m, c) => Math.max(m, c.value), 1);
  const z = position.zoom; // los marcadores se contra-escalan para no agrandarse con el zoom

  const zoomBy = (factor: number) =>
    setPosition((p) => ({ ...p, zoom: Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, p.zoom * factor)) }));

  return (
    <div className="relative flex h-full w-full items-center justify-center">
      {/* Controles de zoom (abajo a la derecha: no chocan con el header ni con el chip) */}
      <div className="absolute bottom-2 right-2 z-10 flex flex-col gap-1">
        <button
          type="button"
          onClick={() => zoomBy(1.6)}
          aria-label="Acercar"
          className="grid h-7 w-7 place-items-center rounded-md border border-neutral-200 bg-white/90 text-neutral-600 shadow-sm backdrop-blur hover:bg-white hover:text-neutral-900"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => zoomBy(1 / 1.6)}
          aria-label="Alejar"
          className="grid h-7 w-7 place-items-center rounded-md border border-neutral-200 bg-white/90 text-neutral-600 shadow-sm backdrop-blur hover:bg-white hover:text-neutral-900"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setPosition(HOME)}
          aria-label="Restablecer vista"
          className="grid h-7 w-7 place-items-center rounded-md border border-neutral-200 bg-white/90 text-neutral-600 shadow-sm backdrop-blur hover:bg-white hover:text-neutral-900"
        >
          <Locate className="h-3.5 w-3.5" />
        </button>
      </div>

      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 700, center: HOME.coordinates }}
        width={460}
        height={640}
        style={{ width: 'auto', height: '100%', maxWidth: '100%' }}
      >
        <ZoomableGroup
          zoom={position.zoom}
          center={position.coordinates}
          minZoom={MIN_ZOOM}
          maxZoom={MAX_ZOOM}
          onMoveEnd={(pos) => setPosition({ coordinates: pos.coordinates as [number, number], zoom: pos.zoom })}
        >
          <Geographies geography={argentinaGeo as object}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={geoFill}
                  stroke={geoStroke}
                  strokeWidth={0.6 / z}
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
            const baseR = 3 + t * 5;
            const r = baseR / z;
            return (
              <Marker
                key={c.name}
                coordinates={c.coords}
                onMouseEnter={() => setHover(c.name)}
                onMouseLeave={() => setHover(null)}
              >
                {c.main && (
                  <circle
                    r={r + 4 / z}
                    fill="none"
                    stroke={accentBright}
                    strokeWidth={1.5 / z}
                    opacity={0.9}
                    style={{ transformBox: 'fill-box', transformOrigin: 'center', animation: 'rt-pulse 1.9s ease-out infinite' }}
                  />
                )}
                <circle r={r + 5 / z} fill={accent} opacity={0.14} />
                <circle r={r} fill={c.main ? accentBright : accent} stroke={dark ? '#0d1320' : '#ffffff'} strokeWidth={1 / z} />
                {hover === c.name && (
                  <g transform={`translate(0, ${-(baseR + 8) / z})`} style={{ pointerEvents: 'none' }}>
                    <rect
                      x={-((c.name.length * 6.2 + 46) / 2) / z}
                      y={-19 / z}
                      width={(c.name.length * 6.2 + 46) / z}
                      height={20 / z}
                      rx={5 / z}
                      fill={dark ? '#0d1320' : '#ffffff'}
                      stroke={dark ? '#2f3a56' : '#dfe2f2'}
                      strokeWidth={1 / z}
                    />
                    <text
                      textAnchor="middle"
                      y={-5 / z}
                      fontSize={11 / z}
                      fontWeight={600}
                      fill={dark ? '#e9edf6' : '#111729'}
                    >
                      {`${c.name} · ${c.value.toLocaleString('es-AR')}`}
                    </text>
                  </g>
                )}
              </Marker>
            );
          })}
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
}
