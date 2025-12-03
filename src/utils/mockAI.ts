// Mock AI Analysis for Hackathon Demo
// Simulates AI analysis with realistic medical findings

interface AnalysisResult {
  riskScore: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  findings: string[];
  recommendations: string[];
  noduleLocation: string;
  noduleDimensions: string;
  additionalObservations: string[];
  patientId: string;
  analysisTimestamp: string;
}

const locations = [
  'right upper lobe',
  'left upper lobe',
  'right middle lobe',
  'right lower lobe',
  'left lower lobe',
];

const findingsPool = [
  'Solid pulmonary nodule detected',
  'Part-solid nodule with ground-glass component identified',
  'Irregular nodule margins observed',
  'Nodule demonstrates spiculated borders',
  'Subpleural nodule location noted',
  'Calcification pattern appears eccentric',
  'Adjacent pleural thickening observed',
  'Mild bronchiectasis in surrounding tissue',
];

const additionalObservationsPool = [
  'No pleural effusion detected',
  'Mediastinal structures appear within normal limits',
  'Cardiac silhouette normal in size',
  'No hilar lymphadenopathy identified',
  'Bilateral lung fields otherwise clear',
  'Bone structures intact, no lytic lesions',
  'Trachea midline and patent',
  'Diaphragmatic contours normal',
];

const lowRiskRecommendations = [
  'Follow-up chest CT recommended in 12 months',
  'Continue routine screening as per guidelines',
  'No immediate intervention required',
  'Consider comparison with prior imaging if available',
];

const mediumRiskRecommendations = [
  'Follow-up chest CT with contrast recommended in 3-6 months',
  'Consider PET-CT for metabolic characterization',
  'Pulmonology consultation advised',
  'Review with multidisciplinary tumor board recommended',
  'Correlate with clinical history and risk factors',
];

const highRiskRecommendations = [
  'Immediate follow-up with contrast-enhanced CT scan recommended',
  'PET-CT scan strongly advised for staging workup',
  'Urgent pulmonology referral required',
  'Consider CT-guided biopsy for tissue diagnosis',
  'Multidisciplinary tumor board review essential',
  'Patient counseling regarding findings and next steps',
];

function generatePatientId(): string {
  const prefix = 'PT';
  const numbers = Math.floor(Math.random() * 900000 + 100000);
  return `${prefix}-${numbers}`;
}

function getRandomItems<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function generateDimensions(): string {
  const dim1 = (Math.random() * 2.5 + 0.5).toFixed(1);
  const dim2 = (Math.random() * 2 + 0.4).toFixed(1);
  return `${dim1}cm x ${dim2}cm`;
}

export async function performMockAnalysis(): Promise<AnalysisResult> {
  // Simulate processing delay (3-5 seconds)
  const delay = Math.random() * 2000 + 3000;
  await new Promise(resolve => setTimeout(resolve, delay));

  // Generate risk score between 45-85%
  const riskScore = Math.floor(Math.random() * 41 + 45);
  
  // Determine risk level based on score
  let riskLevel: 'Low' | 'Medium' | 'High';
  let recommendations: string[];
  
  if (riskScore < 55) {
    riskLevel = 'Low';
    recommendations = getRandomItems(lowRiskRecommendations, 3);
  } else if (riskScore < 70) {
    riskLevel = 'Medium';
    recommendations = getRandomItems(mediumRiskRecommendations, 4);
  } else {
    riskLevel = 'High';
    recommendations = getRandomItems(highRiskRecommendations, 5);
  }

  const result: AnalysisResult = {
    riskScore,
    riskLevel,
    findings: getRandomItems(findingsPool, Math.floor(Math.random() * 2 + 2)),
    recommendations,
    noduleLocation: `Single solid pulmonary nodule detected in the ${locations[Math.floor(Math.random() * locations.length)]}`,
    noduleDimensions: `Dimensions approximately ${generateDimensions()}`,
    additionalObservations: getRandomItems(additionalObservationsPool, 3),
    patientId: generatePatientId(),
    analysisTimestamp: new Date().toISOString(),
  };

  return result;
}

// Generate a heatmap overlay on the canvas
export function generateHeatmapOverlay(
  originalImage: HTMLImageElement,
  canvas: HTMLCanvasElement
): string {
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Set canvas dimensions to match image
  canvas.width = originalImage.width;
  canvas.height = originalImage.height;

  // Draw original image
  ctx.drawImage(originalImage, 0, 0);

  // Generate random hotspot location (simulating nodule detection)
  const hotspotX = originalImage.width * (0.3 + Math.random() * 0.4);
  const hotspotY = originalImage.height * (0.25 + Math.random() * 0.35);
  const radius = Math.min(originalImage.width, originalImage.height) * 0.15;

  // Create radial gradient for heatmap
  const gradient = ctx.createRadialGradient(
    hotspotX, hotspotY, 0,
    hotspotX, hotspotY, radius
  );

  gradient.addColorStop(0, 'rgba(255, 0, 0, 0.7)');
  gradient.addColorStop(0.3, 'rgba(255, 100, 0, 0.5)');
  gradient.addColorStop(0.6, 'rgba(255, 200, 0, 0.3)');
  gradient.addColorStop(1, 'rgba(255, 255, 0, 0)');

  // Apply heatmap overlay with blend mode
  ctx.globalCompositeOperation = 'screen';
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Add secondary smaller hotspot
  const hotspot2X = hotspotX + (Math.random() - 0.5) * radius;
  const hotspot2Y = hotspotY + (Math.random() - 0.5) * radius;
  const radius2 = radius * 0.4;

  const gradient2 = ctx.createRadialGradient(
    hotspot2X, hotspot2Y, 0,
    hotspot2X, hotspot2Y, radius2
  );

  gradient2.addColorStop(0, 'rgba(255, 0, 0, 0.6)');
  gradient2.addColorStop(0.5, 'rgba(255, 150, 0, 0.3)');
  gradient2.addColorStop(1, 'rgba(255, 255, 0, 0)');

  ctx.fillStyle = gradient2;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Reset composite operation
  ctx.globalCompositeOperation = 'source-over';

  return canvas.toDataURL('image/png');
}
