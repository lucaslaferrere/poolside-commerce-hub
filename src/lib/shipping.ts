// Tarifas de envío por zona — origen Pilar, Bs. As.
// Base: 9.000 ARS hasta 1 kg. Ajustar con cotizaciones reales de Andreani/MiCorreo.

const BASE_AMBA   = 9_000;   // ARS, hasta 1 kg, a domicilio
const BRANCH_FACTOR = 0.78;  // sucursal ~22% más barato
const EXTRA_KG    = 2_500;   // ARS por kg adicional sobre 1 kg

interface Zone {
  multiplier: number;
  days: string;
}

const ZONES: Record<string, Zone> = {
  Z1: { multiplier: 1.00, days: '2-4 días hábiles' },
  Z2: { multiplier: 1.15, days: '3-5 días hábiles' },
  Z3: { multiplier: 1.30, days: '4-6 días hábiles' },
  Z4: { multiplier: 1.55, days: '5-7 días hábiles' },
  Z5: { multiplier: 1.80, days: '6-9 días hábiles' },
  Z6: { multiplier: 2.20, days: '7-12 días hábiles' },
  Z7: { multiplier: 2.90, days: '8-15 días hábiles' },
};

// Mapa provincia → zona
export const PROVINCE_ZONES: Record<string, string> = {
  'CABA':                              'Z1',
  'Buenos Aires (GBA)':                'Z1',
  'Buenos Aires (interior)':           'Z2',
  'La Pampa':                          'Z2',
  'Córdoba':                           'Z3',
  'Santa Fe':                          'Z3',
  'Entre Ríos':                        'Z3',
  'Mendoza':                           'Z4',
  'San Juan':                          'Z4',
  'San Luis':                          'Z4',
  'Tucumán':                           'Z5',
  'Salta':                             'Z5',
  'Jujuy':                             'Z5',
  'Santiago del Estero':               'Z5',
  'Catamarca':                         'Z5',
  'La Rioja':                          'Z5',
  'Misiones':                          'Z5',
  'Corrientes':                        'Z5',
  'Chaco':                             'Z5',
  'Formosa':                           'Z5',
  'Neuquén':                           'Z6',
  'Río Negro':                         'Z6',
  'Chubut':                            'Z6',
  'Santa Cruz':                        'Z6',
  'Tierra del Fuego':                  'Z7',
};

export const PROVINCES = Object.keys(PROVINCE_ZONES);

export interface ShippingQuote {
  price: number;
  days: string;
  zone: string;
}

export function calcShipping(
  province: string,
  weightKg = 1,
  mode: 'domicilio' | 'sucursal' = 'domicilio',
): ShippingQuote | null {
  const zoneKey = PROVINCE_ZONES[province];
  if (!zoneKey) return null;

  const zone = ZONES[zoneKey];
  const baseWeight = Math.ceil(Math.max(weightKg, 1)); // mínimo 1 kg
  const extraKg    = Math.max(baseWeight - 1, 0);
  const base       = (BASE_AMBA + extraKg * EXTRA_KG) * zone.multiplier;
  const price      = Math.round(mode === 'sucursal' ? base * BRANCH_FACTOR : base);

  return { price, days: zone.days, zone: zoneKey };
}
