import { PassportStandard } from './types';

export const PASSPORT_STANDARDS: PassportStandard[] = [
  { country: 'US', label: 'USA (2x2 inch)', widthMm: 51, heightMm: 51 },
  { country: 'IN', label: 'India (35x45 mm)', widthMm: 35, heightMm: 45 },
  { country: 'UK', label: 'UK (35x45 mm)', widthMm: 35, heightMm: 45 },
  { country: 'EU', label: 'Schengen (35x45 mm)', widthMm: 35, heightMm: 45 },
  { country: 'JP', label: 'Japan (35x45 mm)', widthMm: 35, heightMm: 45 },
  { country: 'CA', label: 'Canada (50x70 mm)', widthMm: 50, heightMm: 70 },
  { country: 'AU', label: 'Australia (35x45 mm)', widthMm: 35, heightMm: 45 },
];

export interface OutfitOption {
  id: string;
  label: string;
  prompt: string;
  color: string; // Hex for icon
}

export const OUTFIT_CATEGORIES = {
  men: [
    { id: 'm_shirt_white', label: 'White Shirt', color: '#f8fafc', prompt: 'Wear a crisp white formal collared shirt, no jacket.' },
    { id: 'm_shirt_blue', label: 'Blue Shirt', color: '#bfdbfe', prompt: 'Wear a light blue formal office shirt.' },
    { id: 'm_shirt_grey', label: 'Grey Shirt', color: '#94a3b8', prompt: 'Wear a smart grey formal shirt.' },
    { id: 'm_polo_navy', label: 'Navy Polo', color: '#1e293b', prompt: 'Wear a smart casual navy blue polo shirt.' },
    { id: 'm_suit_black', label: 'Black Suit', color: '#1a1a1a', prompt: 'Wear a professional black business suit, white shirt, and dark tie.' },
    { id: 'm_suit_navy', label: 'Navy Suit', color: '#172554', prompt: 'Wear a professional navy blue business suit, white shirt, and blue tie.' },
    { id: 'm_suit_grey', label: 'Grey Suit', color: '#4b5563', prompt: 'Wear a professional grey business suit, light shirt, and tie.' },
    { id: 'm_blazer_casual', label: 'Casual Blazer', color: '#57534e', prompt: 'Wear a smart casual textured blazer with a t-shirt underneath.' },
    { id: 'm_office_wear', label: 'Office Wear', color: '#334155', prompt: 'Wear smart professional corporate office attire.' },
  ],
  women: [
    { id: 'w_saree_formal', label: 'Formal Saree', color: '#b91c1c', prompt: 'Wear a professional, elegant Indian saree with a modest blouse, suitable for passport photos.' },
    { id: 'w_blouse_white', label: 'White Blouse', color: '#f8fafc', prompt: 'Wear a professional white formal blouse.' },
    { id: 'w_top_black', label: 'Black Top', color: '#1a1a1a', prompt: 'Wear a modest, professional black top.' },
    { id: 'w_shirt_blue', label: 'Blue Shirt', color: '#bfdbfe', prompt: 'Wear a light blue button-down formal shirt.' },
    { id: 'w_casual_top', label: 'Casual Top', color: '#e2e8f0', prompt: 'Wear a smart casual modest top.' },
    { id: 'w_blazer_black', label: 'Black Blazer', color: '#000000', prompt: 'Wear a professional black blazer over a white blouse.' },
    { id: 'w_blazer_navy', label: 'Navy Blazer', color: '#1e293b', prompt: 'Wear a professional navy blue blazer over a light top.' },
    { id: 'w_blazer_beige', label: 'Beige Blazer', color: '#d6d3d1', prompt: 'Wear a professional beige blazer.' },
    { id: 'w_office_dress', label: 'Office Dress', color: '#78716c', prompt: 'Wear a formal, high-neck professional office dress.' },
  ]
};

export const BACKGROUND_COLORS = [
  { name: 'White', value: '#FFFFFF', prompt: 'pure white background' },
  { name: 'Light Blue', value: '#E0F2FE', prompt: 'light blue studio background' },
  { name: 'Off White', value: '#F8FAFC', prompt: 'off-white cream background' },
  { name: 'Light Gray', value: '#E2E8F0', prompt: 'light gray professional background' },
  { name: 'Dark Gray', value: '#475569', prompt: 'dark gray professional background' },
  { name: 'Beige', value: '#f5f5dc', prompt: 'warm beige studio background' },
];