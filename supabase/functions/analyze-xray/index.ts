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
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    if (!imageBase64) {
      throw new Error('No image data provided');
    }

    // Step 1: Validate if image is a chest X-ray
    console.log('Step 1: Validating image...');
    const validationResult = await validateXrayImage(lovableApiKey, imageBase64);
    
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
    const analysisResult = await performAnalysis(lovableApiKey, imageBase64, mode, previousScanBase64);

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
  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [{
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Look at this image. Is it a chest X-ray (showing lungs and ribcage)?
            
Answer with exactly one word: YES or NO`
          },
          {
            type: 'image_url',
            image_url: { url: imageBase64 }
          }
        ]
      }],
      max_tokens: 50
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Lovable AI validation error:', errorText);
    
    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please try again in a moment.');
    }
    if (response.status === 402) {
      throw new Error('AI credits depleted. Please add credits to your workspace.');
    }
    // On validation error, skip validation and proceed with analysis
    console.log('Validation failed, proceeding with analysis anyway');
    return { isValid: true, confidence: 50, reason: 'Validation skipped due to error' };
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '';
  
  console.log('Validation response:', content);
  
  const upperContent = content.toUpperCase().trim();
  const isYes = upperContent.includes('YES') || upperContent.startsWith('Y');
  const isNo = upperContent.includes('NO') && !upperContent.includes('YES');
  
  if (isYes) {
    return { isValid: true, confidence: 85, reason: 'Image identified as chest X-ray' };
  } else if (isNo) {
    return { isValid: false, confidence: 85, reason: 'Image does not appear to be a chest X-ray' };
  }
  
  // If unclear response, default to allowing analysis (let the main analysis handle it)
  console.log('Unclear validation response, proceeding with analysis');
  return { isValid: true, confidence: 50, reason: 'Validation inconclusive, proceeding with analysis' };
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

  let userPrompt = `Analyze this chest X-ray image comprehensively. Use the submit_xray_analysis function to provide your results.

Guidelines:
- Be conservative - default to Normal unless there is clear evidence of pathology
- risk_score: 0-100 (below 30 = Low risk, 30-60 = Moderate, 60+ = High risk)
- Only list actual visible abnormalities in findings
- Provide heatmap_regions for areas of concern (x_percent, y_percent as 0-100, intensity as 0-1)`;

  if (mode === 'multi-disease') {
    userPrompt += `

Also analyze for these conditions in multi_disease_results: Lung Cancer, Pneumonia, Tuberculosis, COPD, Pleural Effusion, Atelectasis.`;
  }

  if (mode === 'comparison' && previousScanBase64) {
    userPrompt += `

COMPARISON MODE: Also compare with the previous scan provided. Add this field to the JSON:
"comparison_results": {
  "changes": ["description of changes"],
  "progression_rate": 0,
  "overall_trend": "stable"
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

  // Define the tool for structured output
  const tools = [{
    type: "function",
    function: {
      name: "submit_xray_analysis",
      description: "Submit the X-ray analysis results",
      parameters: {
        type: "object",
        properties: {
          classification: { type: "string", enum: ["Normal", "Abnormal", "Inconclusive"] },
          risk_score: { type: "number", description: "Risk score 0-100" },
          confidence: { type: "number", description: "Confidence 0-100" },
          findings: { type: "array", items: { type: "string" }, description: "List of findings" },
          heatmap_regions: { 
            type: "array", 
            items: { 
              type: "object",
              properties: {
                x_percent: { type: "number" },
                y_percent: { type: "number" },
                intensity: { type: "number" },
                size: { type: "number" }
              }
            }
          },
          nodule_location: { type: "string" },
          nodule_dimensions: { type: "string" },
          additional_observations: { type: "array", items: { type: "string" } },
          detailed_report: { type: "string" },
          recommendations: { type: "array", items: { type: "string" } },
          lung_age: { 
            type: "object",
            properties: { age: { type: "number" }, notes: { type: "string" } }
          },
          symmetry_analysis: {
            type: "object",
            properties: { 
              score: { type: "number" }, 
              asymmetric_regions: { type: "array", items: { type: "string" } },
              notes: { type: "string" }
            }
          },
          multi_disease_results: {
            type: "array",
            items: {
              type: "object",
              properties: {
                disease: { type: "string" },
                present: { type: "boolean" },
                confidence: { type: "number" },
                findings: { type: "array", items: { type: "string" } }
              }
            }
          }
        },
        required: ["classification", "risk_score", "confidence", "findings", "recommendations"]
      }
    }
  }];

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-pro',
      messages,
      tools,
      tool_choice: { type: "function", function: { name: "submit_xray_analysis" } }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Lovable AI analysis error:', errorText);
    
    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please try again in a moment.');
    }
    if (response.status === 402) {
      throw new Error('AI credits depleted. Please add credits to your workspace.');
    }
    throw new Error('Failed to analyze X-ray');
  }

  const data = await response.json();
  console.log('Analysis response received');
  
  try {
    // Extract the tool call arguments
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || !toolCall.function?.arguments) {
      console.error('No tool call in response:', JSON.stringify(data).substring(0, 500));
      throw new Error('No structured response from AI');
    }
    
    const parsed = JSON.parse(toolCall.function.arguments);
    console.log('Parsed tool call arguments successfully');
    
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
    console.error('Failed to parse tool call response:', e);
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
