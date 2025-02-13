import { NextResponse } from 'next/server';
import { generateCompletion } from '@/app/lib/ollama';

interface RoleResult {
  role: string;
  results: {
    collection?: 'contracts' | 'tickets';
    payload: {
      name: string;
      summary: string;
      tenant_id: string;
      permission_level?: string;
    };
    score: number;
  }[];
  aiAnswer: string;
}

export async function POST(request: Request) {
  try {
    const { query, roleResults, roleInfo } = await request.json();

    // If no results, return early with a simple message
    if (!roleResults?.length) {
      return NextResponse.json({ 
        analysis: "No results available for meta-analysis." 
      });
    }

    const systemPrompt = `You are a professional AI assistant analyzing search result patterns across different roles. 
Focus on access patterns, data visibility, and role-based permissions. Structure your analysis into these sections:

1. Access Pattern Overview
2. Role-Specific Observations
3. Security Implications

Keep each section concise but informative. Use bullet points for clarity.`;

    const formattedResults = roleResults.map((result: RoleResult) => {
      const roleName = result.role;
      const roleAccess = roleInfo[roleName];
      const docs = result.results.map(r => 
        `- ${r.collection}: ${r.payload.name} (${r.payload.tenant_id}) - Score: ${r.score.toFixed(3)}`
      ).join('\n');
      
      return `${roleName} (${roleAccess}):\n${docs}\nAI Analysis: ${result.aiAnswer}\n`;
    }).join('\n\n');

    const userPrompt = `Analyze these search results for the query "${query}":\n\n${formattedResults}`;

    try {
      const analysis = await generateCompletion(systemPrompt, userPrompt);
      return NextResponse.json({ analysis });
    } catch (error) {
      // If Ollama returns HTML or isn't ready
      if (error instanceof Error && error.message.includes('<!DOCTYPE')) {
        return NextResponse.json({ 
          analysis: "Analysis service is starting up. Please try again in a moment." 
        });
      }
      throw error; // Re-throw other errors
    }
  } catch (error) {
    console.error('Error in meta-analysis:', error);
    return NextResponse.json(
      { error: 'Failed to perform meta-analysis' },
      { status: 500 }
    );
  }
} 