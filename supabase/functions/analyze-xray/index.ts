import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface XrayValidationResult {
  isValid: boolean;
  confidence: number;
  reason?: string;
}

interface AnalysisResult {
  classification: 'Normal' | 'Abnormal' | 'Inconclusive';
  riskScore: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  confidence: number;
  findings: string[];
  recommendations: string[];
  noduleLocation: string;
  noduleDimensions: string;
  additionalObservations: string[];
  patientId: string;
  analysisTimestamp: string;
  heatmapRegions: Array<{ x_percent: number; y_percent: number; intensity: number; size: number }>;
  detailedReport: string;
  lungAge?: { age: number; notes: string };
  symmetryAnalysis?: { score: number; asymmetricRegions: string[]; notes: string };
  multiDiseaseResults?: Array<{ disease: string; present: boolean; confidence: number; findings: string[] }>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, mode, previousScanBase64 } = await req.json();
    const openAIKey = Deno.env.get('OPENAI_API_KEY');

    if (!openAIKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    if (!imageBase64) {
      throw new Error('No image data provided');
    }

    // Step 1: Validate if image is a chest X-ray
    console.log('Step 1: Validating image...');
    const validationResult = await validateXrayImage(openAIKey, imageBase64);
    
    if (!validationResult.isValid) {
      return new Response(JSON.stringify({
        error: 'invalid_image',
        message: validationResult.reason || 'This does not appear to be a chest X-ray',
        confidence: validationResult.confidence
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Image validated as X-ray with confidence:', validationResult.confidence);

    // Step 2: Perform main analysis
    console.log('Step 2: Performing analysis...');
    const analysisResult = await performAnalysis(openAIKey, imageBase64, mode, previousScanBase64);

    // Step 3: Apply confidence thresholding to reduce false positives
    const filteredResult = applyConfidenceThreshold(analysisResult);

    console.log('Analysis complete. Risk score:', filteredResult.riskScore);

    return new Response(JSON.stringify(filteredResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-xray function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function validateXrayImage(apiKey: string, imageBase64: string): Promise<XrayValidationResult> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [{
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Is this image a chest X-ray? Respond with ONLY a JSON object in this format:
{"isXray": true/false, "confidence": 0-100, "reason": "brief explanation"}

Look for: ribcage, lung fields, medical imaging characteristics, DICOM markers, grayscale medical imaging.
Reject: text documents, random photos, non-medical images, other body X-rays (dental, limbs, etc).`
          },
          {
            type: 'image_url',
            image_url: { url: imageBase64 }
          }
        ]
      }],
      temperature: 0,
      seed: 12345,
      max_tokens: 200
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('OpenAI validation error:', errorText);
    throw new Error('Failed to validate image');
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  try {
    const parsed = JSON.parse(content);
    return {
      isValid: parsed.isXray && parsed.confidence >= 75,
      confidence: parsed.confidence,
      reason: parsed.reason
    };
  } catch {
    // Fallback parsing
    const isXray = content.toLowerCase().includes('yes') || content.toLowerCase().includes('true');
    return { isValid: isXray, confidence: isXray ? 80 : 20 };
  }
}

async function performAnalysis(
  apiKey: string, 
  imageBase64: string, 
  mode: string = 'standard',
  previousScanBase64?: string
): Promise<AnalysisResult> {
  
  let systemPrompt = `You are a medical AI assistant analyzing chest X-rays. Be CONSERVATIVE in your assessment.

STRICT CRITERIA for abnormality detection:
- Only flag if there are CLEAR, VISIBLE abnormalities
- Normal anatomical structures (heart shadow, vessels, ribs) are NOT abnormalities
- Require HIGH confidence (>70%) before flagging as abnormal
- If image quality is poor, state "Image quality insufficient for analysis"
- Default to "Normal" unless there is clear evidence of pathology

IMPORTANT: Provide realistic, medically accurate assessments. Do not over-diagnose.`;

  let userPrompt = `Analyze this chest X-ray and provide a comprehensive analysis in JSON format:

{
  "classification": "Normal" or "Abnormal" (be conservative - default to Normal unless clear evidence),
  "risk_score": 0-100 (below 30 = Normal, 30-60 = Moderate, 60+ = High. Use FULL range, most normal X-rays should be 5-25),
  "confidence": 0-100,
  "findings": ["finding 1", "finding 2"] (only list ACTUAL visible abnormalities, empty array if normal),
  "heatmap_regions": [{"x_percent": 50, "y_percent": 30, "intensity": 0.8, "size": 40}] (coordinates of areas of concern, empty if normal),
  "nodule_location": "description or 'None detected'",
  "nodule_dimensions": "dimensions or 'N/A'",
  "additional_observations": ["observation 1"],
  "detailed_report": "Full radiologist-style report text",
  "recommendations": ["recommendation 1"],
  "lung_age": {"age": estimated_lung_age, "notes": "explanation of estimation"},
  "symmetry_analysis": {"score": 0-100, "asymmetric_regions": [], "notes": "comparison of left vs right lung"}
}`;

  if (mode === 'multi-disease') {
    userPrompt += `

ALSO analyze for multiple conditions and add:
"multi_disease_results": [
  {"disease": "Lung Cancer", "present": false, "confidence": 95, "findings": []},
  {"disease": "Pneumonia", "present": false, "confidence": 90, "findings": []},
  {"disease": "Tuberculosis", "present": false, "confidence": 92, "findings": []},
  {"disease": "COPD", "present": false, "confidence": 88, "findings": []},
  {"disease": "Pleural Effusion", "present": false, "confidence": 94, "findings": []},
  {"disease": "Atelectasis", "present": false, "confidence": 91, "findings": []}
]`;
  }

  if (mode === 'comparison' && previousScanBase64) {
    userPrompt += `

COMPARISON MODE: Also compare with the previous scan provided. Add:
"comparison_results": {
  "changes": ["description of changes"],
  "progression_rate": percentage,
  "overall_trend": "improving/stable/worsening"
}`;
  }

  const messages: any[] = [{
    role: 'system',
    content: systemPrompt
  }, {
    role: 'user',
    content: [
      { type: 'text', text: userPrompt },
      { type: 'image_url', image_url: { url: imageBase64 } }
    ]
  }];

  if (previousScanBase64) {
    messages[1].content.push({
      type: 'image_url',
      image_url: { url: previousScanBase64 }
    });
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages,
      temperature: 0,
      seed: 12345,
      max_tokens: 2000,
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('OpenAI analysis error:', errorText);
    throw new Error('Failed to analyze X-ray');
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  try {
    const parsed = JSON.parse(content);
    
    // Map API response to our interface
    const riskScore = parsed.risk_score || 15;
    let riskLevel: 'Low' | 'Medium' | 'High';
    if (riskScore < 30) riskLevel = 'Low';
    else if (riskScore < 60) riskLevel = 'Medium';
    else riskLevel = 'High';

    return {
      classification: parsed.classification || 'Normal',
      riskScore,
      riskLevel,
      confidence: parsed.confidence || 85,
      findings: parsed.findings || [],
      recommendations: parsed.recommendations || generateDefaultRecommendations(riskLevel),
      noduleLocation: parsed.nodule_location || 'None detected',
      noduleDimensions: parsed.nodule_dimensions || 'N/A',
      additionalObservations: parsed.additional_observations || [],
      patientId: `PT-${Date.now().toString(36).toUpperCase()}`,
      analysisTimestamp: new Date().toISOString(),
      heatmapRegions: parsed.heatmap_regions || [],
      detailedReport: parsed.detailed_report || '',
      lungAge: parsed.lung_age,
      symmetryAnalysis: parsed.symmetry_analysis,
      multiDiseaseResults: parsed.multi_disease_results
    };
  } catch (e) {
    console.error('Failed to parse analysis response:', e);
    throw new Error('Failed to parse analysis results');
  }
}

function applyConfidenceThreshold(result: AnalysisResult): AnalysisResult {
  // If classified as Abnormal but confidence is low, override to Inconclusive
  if (result.classification === 'Abnormal' && result.confidence < 70) {
    return {
      ...result,
      classification: 'Inconclusive',
      riskScore: Math.min(result.riskScore, 45),
      riskLevel: 'Medium',
      recommendations: [
        'Findings are inconclusive - recommend professional radiologist review',
        'Consider repeat imaging with higher quality',
        ...result.recommendations.slice(0, 2)
      ]
    };
  }
  
  return result;
}

function generateDefaultRecommendations(riskLevel: string): string[] {
  if (riskLevel === 'Low') {
    return [
      'No immediate concerns identified',
      'Continue routine screening as per guidelines',
      'Follow up with annual chest X-ray as appropriate'
    ];
  } else if (riskLevel === 'Medium') {
    return [
      'Follow-up imaging recommended in 3-6 months',
      'Consider pulmonology consultation',
      'Review clinical history and risk factors',
      'Compare with prior imaging if available'
    ];
  } else {
    return [
      'Urgent follow-up with contrast-enhanced CT recommended',
      'Immediate pulmonology referral advised',
      'Consider PET-CT for further characterization',
      'Multidisciplinary tumor board review recommended',
      'Patient counseling regarding findings and next steps'
    ];
  }
}
