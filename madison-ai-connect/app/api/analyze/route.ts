// app/api/analyze/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { memoryText } = await req.json();

  // If no memory text, return demo data
  if (!memoryText || memoryText.trim().length < 20) {
    return NextResponse.json(DEMO_PROFILE);
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: `Analyze this AI chat memory/history and extract the person's interests, thinking style, and personality. Return ONLY valid JSON in this exact format:
{
  "nodes": [
    {"id": "short-id", "label": "Interest Name", "color": "#5B8FFF", "tier": 1},
    ...more primary interests (tier 1, 4-6 items)...
    {"id": "short-id", "label": "Sub-Interest", "color": "#9B5BFF", "tier": 2},
    ...more secondary interests (tier 2, 4-6 items)...
  ],
  "edges": [["id1", "id2"], ...connections between related interests...],
  "personality": "A 2-sentence personality read",
  "categories": [
    {"label": "Category Name", "color": "#5B8FFF", "items": ["Interest 1", "Interest 2"]}
  ]
}

Use these colors: #5B8FFF (tech/analytical), #9B5BFF (creative/play), #5BFFE8 (philosophical/ideas), #FF9B5B (social/practical).

Memory to analyze:
${memoryText.slice(0, 8000)}`
        }],
      }),
    });

    const data = await response.json();
    const text = data.content?.[0]?.text || '';

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const profile = JSON.parse(jsonMatch[0]);
      return NextResponse.json(profile);
    }

    return NextResponse.json(DEMO_PROFILE);
  } catch (e) {
    console.error('Claude API error:', e);
    return NextResponse.json(DEMO_PROFILE);
  }
}

const DEMO_PROFILE = {
  nodes: [
    { id:'ml', label:'Machine Learning', color:'#5B8FFF', tier:1 },
    { id:'chess', label:'Chess', color:'#9B5BFF', tier:1, shared:true },
    { id:'coffee', label:'Coffee', color:'#FF9B5B', tier:1, shared:true },
    { id:'phil', label:'Philosophy', color:'#5BFFE8', tier:1, shared:true },
    { id:'startups', label:'Startups', color:'#5B8FFF', tier:1, shared:true },
    { id:'systems', label:'Systems', color:'#5B8FFF', tier:2 },
    { id:'gamedev', label:'Game Design', color:'#9B5BFF', tier:2 },
    { id:'writing', label:'Long-form Writing', color:'#5BFFE8', tier:2 },
    { id:'pytorch', label:'PyTorch', color:'#5B8FFF', tier:2 },
    { id:'openings', label:'Chess Openings', color:'#9B5BFF', tier:2 },
    { id:'stoicism', label:'Stoicism', color:'#5BFFE8', tier:2 },
    { id:'pmfit', label:'Product/Market Fit', color:'#5B8FFF', tier:2 },
  ],
  edges: [
    ['ml','systems'], ['ml','startups'], ['ml','pytorch'],
    ['chess','gamedev'], ['chess','phil'], ['chess','openings'],
    ['coffee','startups'],
    ['phil','writing'], ['phil','stoicism'],
    ['startups','pmfit'],
    ['systems','gamedev'],
    ['writing','stoicism'],
  ],
  personality: "Strong overlap between systematic thinking and intellectual play. The Chess + Philosophy pairing is unusual — suggests someone who treats ideas like endgames, not starting points.",
  categories: [
    { label:'Technology', color:'#5B8FFF', items:['Machine Learning','Systems','PyTorch','Startups','Product/Market Fit'] },
    { label:'Games & Play', color:'#9B5BFF', items:['Chess','Game Design','Chess Openings'] },
    { label:'Ideas', color:'#5BFFE8', items:['Philosophy','Long-form Writing','Stoicism'] },
    { label:'Social', color:'#FF9B5B', items:['Coffee'] },
  ],
};
