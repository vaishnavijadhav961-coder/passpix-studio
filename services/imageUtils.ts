import { FilterSettings } from "../types";

export const readFileAsBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

export const applyFilters = async (
  imageSrc: string,
  filters: FilterSettings
): Promise<string> => {
  const img = await loadImage(imageSrc);
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');

  if (!ctx) throw new Error('Could not get canvas context');

  // Apply filters using CSS shorthand logic for canvas if possible, or manual pixel manipulation.
  // Using filter property of context (widely supported in modern browsers)
  
  const filterString = `
    brightness(${100 + filters.brightness}%) 
    contrast(${100 + filters.contrast}%) 
    saturate(${100 + filters.saturation}%)
  `;
  
  ctx.filter = filterString;
  ctx.drawImage(img, 0, 0);

  // Warmth (Simulated with an overlay)
  if (filters.warmth !== 0) {
    ctx.filter = 'none'; // Reset filter for overlay
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = filters.warmth > 0 ? `rgba(255, 160, 0, ${filters.warmth * 0.002})` : `rgba(0, 100, 255, ${Math.abs(filters.warmth) * 0.002})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'source-over';
  }

  return canvas.toDataURL('image/jpeg', 0.95);
};

export const generateTiledPDF = async (
  imageSrc: string,
  mmWidth: number,
  mmHeight: number,
  gapMm: number = 2,
  marginMm: number = 5
) => {
    // This function generates a data URL for an A4 image representation
    // Real PDF generation usually uses jspdf, but we can generate a high-res image of the sheet first
    const A4_WIDTH_MM = 210;
    const A4_HEIGHT_MM = 297;
    const DPI = 300;
    const MM_TO_PX = DPI / 25.4;

    const canvas = document.createElement('canvas');
    canvas.width = Math.floor(A4_WIDTH_MM * MM_TO_PX);
    canvas.height = Math.floor(A4_HEIGHT_MM * MM_TO_PX);
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const img = await loadImage(imageSrc);

    const photoW = mmWidth * MM_TO_PX;
    const photoH = mmHeight * MM_TO_PX;
    const gap = gapMm * MM_TO_PX;
    const margin = marginMm * MM_TO_PX;

    // Calculate columns and rows
    const availableWidth = canvas.width - (2 * margin);
    const availableHeight = canvas.height - (2 * margin);
    
    const cols = Math.floor((availableWidth + gap) / (photoW + gap));
    const rows = Math.floor((availableHeight + gap) / (photoH + gap));

    // Centering the grid
    const gridWidth = cols * photoW + (cols - 1) * gap;
    const gridHeight = rows * photoH + (rows - 1) * gap;
    
    const startX = (canvas.width - gridWidth) / 2;
    const startY = (canvas.height - gridHeight) / 2;

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const x = startX + j * (photoW + gap);
            const y = startY + i * (photoH + gap);
            ctx.drawImage(img, x, y, photoW, photoH);
            
            // Draw cut lines (light gray dashed)
            ctx.strokeStyle = '#e2e8f0';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, photoW, photoH);
        }
    }

    return {
        dataUrl: canvas.toDataURL('image/jpeg', 0.9),
        count: cols * rows
    };
};
