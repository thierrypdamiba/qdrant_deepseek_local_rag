import { NextResponse } from 'next/server';
import { generateCompletion } from '@/app/lib/ollama';

interface SearchResult {
  collection?: 'contracts' | 'tickets';
  payload: {
    name: string;
    summary: string;
    tenant_id: string;
    score: number;
  };
  score: number;
}

export async function POST(req: Request) {
  try {
    const { query, results, role } = await req.json();

    if (role === 'ACCOUNT_MANAGER_C') {
      return NextResponse.json({ 
        analysis: "No access to any data." 
      });
    }

    const queryTerms = query.toLowerCase().split(' ');
    
    const relevantResults = results.filter((result: SearchResult) => {
      const tenant = result.payload.tenant_id.toLowerCase();
      const content = result.payload.summary.toLowerCase();
      const name = result.payload.name.toLowerCase();
      
      // More sophisticated relevance check
      const hasTermMatch = queryTerms.some((term: string) => 
        tenant.includes(term) || 
        content.includes(term) || 
        name.includes(term)
      );

      // Include results with high scores even if they don't have direct term matches
      return hasTermMatch || result.score > 0.7;
    });

    if (relevantResults.length === 0) {
      return NextResponse.json({
        analysis: "No matching results found."
      });
    }

    // Sort results by score and format them
    const sortedResults = relevantResults
      .sort((a: SearchResult, b: SearchResult) => b.score - a.score)
      .slice(0, 5); // Take top 5 most relevant results

    // Format the context with relevance scores and collection type
    const context = sortedResults.map((result: SearchResult) => {
      const docType = result.collection || 'unknown';
      const id = result.payload.name;
      const company = result.payload.tenant_id;
      const summary = result.payload.summary;
      return `TYPE: ${docType}
ID: ${id}
COMPANY: ${company}
SUMMARY: ${summary}
---`;
    }).join('\n\n');

    const metaPrompt = `### System:
You are an AI assistant analyzing documents. Based on the user's query and your role's access permissions, provide a clear and direct answer.

### Query:
"${query}"

### Required Format:
First provide a direct Yes/No answer, then list relevant documents in this format:
YES/NO

Relevant documents:
[Type] [ID] ([Company]): [Summary]

### Documents:
${context}

### Response:`;

    const analysis = await generateCompletion(metaPrompt, '', context, {
      temperature: 0,
      top_k: 5,
      top_p: 0.1,
      num_predict: 2048  // Ensure we have enough tokens for the full response
    });
    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('Error analyzing results:', error);
    return NextResponse.json(
      { error: 'Failed to analyze results' },
      { status: 500 }
    );
  }
} 