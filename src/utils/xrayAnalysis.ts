import { supabase } from '@/integrations/supabase/client';
import { AnalysisResult } from '@/context/AppContext';

interface AnalysisOptions {
  mode?: 'standard' | 'multi-disease' | 'comparison';
  previousScanBase64?: string;
}

// Generate a hash for caching
export function generateImageHash(base64: string): string {
  // Simple hash based on length and sample characters
  const sample = base64.slice(0, 1000) + base64.slice(-1000);
  let hash = 0;
  for (let i = 0; i < sample.length; i++) {
    const char = sample.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `xray_${Math.abs(hash).toString(36)}_${base64.length}`;
}

// Check cache
export function getCachedResult(hash: string): AnalysisResult | null {
  try {
    const cached = localStorage.getItem(`cache_${hash}`);
    if (cached) {
      const parsed = JSON.parse(cached);
      const cacheTime = new Date(parsed.cachedAt).getTime();
      const now = Date.now();
      // Cache valid for 24 hours
      if (now - cacheTime < 24 * 60 * 60 * 1000) {
        return parsed.result;
      }
      // Remove expired cache
      localStorage.removeItem(`cache_${hash}`);
    }
  } catch {
    // Ignore cache errors
  }
  return null;
}

// Save to cache
export function cacheResult(hash: string, result: AnalysisResult): void {
  try {
    localStorage.setItem(`cache_${hash}`, JSON.stringify({
      result,
      cachedAt: new Date().toISOString()
    }));
  } catch {
    // Ignore cache errors (storage full, etc.)
  }
}

// Main analysis function
export async function analyzeXray(
  imageBase64: string,
  options: AnalysisOptions = {}
): Promise<AnalysisResult> {
  const { mode = 'standard', previousScanBase64 } = options;

  // Check cache first (for deterministic results)
  const cacheKey = generateImageHash(imageBase64 + mode);
  const cached = getCachedResult(cacheKey);
  if (cached) {
    console.log('Using cached result');
    return { ...cached, analysisTimestamp: new Date().toISOString() };
  }

  // Call edge function
  const { data, error } = await supabase.functions.invoke('analyze-xray', {
    body: {
      imageBase64,
      mode,
      previousScanBase64
    }
  });

  if (error) {
    console.error('Analysis error:', error);
    throw new Error(error.message || 'Analysis failed');
  }

  if (data.error) {
    throw new Error(data.message || data.error);
  }

  // Cache the result
  cacheResult(cacheKey, data);

  return data;
}

// Generate heatmap overlay based on AI analysis regions
export function generateHeatmapFromRegions(
  originalImage: HTMLImageElement,
  regions: Array<{ x_percent: number; y_percent: number; intensity: number; size: number }>
): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return originalImage.src;

  canvas.width = originalImage.width;
  canvas.height = originalImage.height;

  // Draw original image
  ctx.drawImage(originalImage, 0, 0);

  // If no regions, return original
  if (!regions || regions.length === 0) {
    return canvas.toDataURL('image/png');
  }

  // Apply heatmap for each region
  ctx.globalCompositeOperation = 'screen';
  
  regions.forEach(region => {
    const x = (region.x_percent / 100) * canvas.width;
    const y = (region.y_percent / 100) * canvas.height;
    const radius = (region.size / 100) * Math.min(canvas.width, canvas.height);
    
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    
    const intensity = region.intensity;
    gradient.addColorStop(0, `rgba(255, 0, 0, ${0.7 * intensity})`);
    gradient.addColorStop(0.3, `rgba(255, 100, 0, ${0.5 * intensity})`);
    gradient.addColorStop(0.6, `rgba(255, 200, 0, ${0.3 * intensity})`);
    gradient.addColorStop(1, 'rgba(255, 255, 0, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  });

  ctx.globalCompositeOperation = 'source-over';
  
  return canvas.toDataURL('image/png');
}

// Preprocess image for consistency
export async function preprocessImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    img.onload = () => {
      // Fixed dimensions for consistency
      const targetSize = 1024;
      canvas.width = targetSize;
      canvas.height = targetSize;

      // Calculate scaling to maintain aspect ratio
      const scale = Math.min(targetSize / img.width, targetSize / img.height);
      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;
      const offsetX = (targetSize - scaledWidth) / 2;
      const offsetY = (targetSize - scaledHeight) / 2;

      // Fill with black background
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, targetSize, targetSize);

      // Draw centered image
      ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);

      // Apply histogram equalization (simplified contrast enhancement)
      const imageData = ctx.getImageData(0, 0, targetSize, targetSize);
      const data = imageData.data;
      
      // Convert to grayscale and enhance contrast
      for (let i = 0; i < data.length; i += 4) {
        // Grayscale
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        // Simple contrast enhancement
        const enhanced = Math.min(255, Math.max(0, (gray - 128) * 1.2 + 128));
        data[i] = enhanced;
        data[i + 1] = enhanced;
        data[i + 2] = enhanced;
      }
      
      ctx.putImageData(imageData, 0, 0);

      // Convert to base64 with consistent quality
      const base64 = canvas.toDataURL('image/jpeg', 0.95);
      resolve(base64);
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

// Validate image type before upload
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const validTypes = ['image/jpeg', 'image/png', 'application/dicom'];
  
  if (!validTypes.includes(file.type) && !file.name.match(/\.(dcm|dicom)$/i)) {
    return { valid: false, error: 'Invalid file type. Please upload a JPEG, PNG, or DICOM file.' };
  }

  // Check minimum file size (X-rays are typically large)
  if (file.size < 50000) { // Less than 50KB
    return { valid: false, error: 'File seems too small for a medical X-ray image.' };
  }

  // Check maximum file size (20MB)
  if (file.size > 20 * 1024 * 1024) {
    return { valid: false, error: 'File size exceeds 20MB limit.' };
  }

  return { valid: true };
}

// Risk simulation calculations
export function simulateRisk(
  currentRisk: number,
  monthsSmokingFree: number,
  pollutionReduction: number
): { simulatedRisk: number; reduction: number } {
  // Smoking cessation reduces risk ~2% per month up to 50% reduction
  const smokingFactor = Math.max(0.5, 1 - (monthsSmokingFree * 0.02));
  // Pollution reduction: linear 1:1 relationship up to 30% reduction
  const pollutionFactor = 1 - (pollutionReduction / 100 * 0.3);
  
  const simulatedRisk = Math.round(currentRisk * smokingFactor * pollutionFactor);
  const reduction = Math.round(((currentRisk - simulatedRisk) / currentRisk) * 100);
  
  return { simulatedRisk, reduction };
}
