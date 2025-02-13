import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(__dirname, '../.env.local') });

import { searchVectors } from '../app/lib/qdrant';
import fetch from 'node-fetch';

interface EmbeddingResponse {
  vector: number[];
}

interface AnalysisResponse {
  analysis: string;
}

interface SearchResult {
  id?: string | number;
  collection?: 'contracts' | 'tickets';
  payload: {
    name: string;
    summary: string;
    tenant_id: string;
    permission_level?: string;
    details?: Record<string, unknown>;
  };
  score: number;
}

interface RoleResults {
  role: string;
  results: SearchResult[];
  aiAnswer: string;
}

const ROLES = [
  'HEAD_OF_SUPPORT',
  'ACCOUNT_MANAGER_A',
  'ACCOUNT_MANAGER_B',
  'ACCOUNT_MANAGER_C',
  'SUPPORT_AGENT'
] as const;

async function runAlphaTicketsTest() {
  const searchQuery = "Show me all Alpha tickets";
  console.log(`Running test for query: "${searchQuery}"\n`);

  try {
    // Generate embedding for the search query
    const embeddingResponse = await fetch('http://localhost:3000/api/embed', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: searchQuery }),
    });

    if (!embeddingResponse.ok) {
      throw new Error('Failed to generate embedding');
    }

    const { vector } = await embeddingResponse.json() as EmbeddingResponse;
    const results: RoleResults[] = [];

    // Get search results for each role
    for (const role of ROLES) {
      console.log(`\n=== Testing ${role} ===`);
      
      // Search both collections
      const [contractsResults, ticketsResults] = await Promise.all([
        searchVectors('contracts', vector, 5, role),
        searchVectors('tickets', vector, 5, role)
      ]);

      // Combine and sort results
      const combinedResults = [...contractsResults, ...ticketsResults]
        .sort((a, b) => b.score - a.score)
        .slice(0, 5) as SearchResult[];

      console.log(`\nFound ${combinedResults.length} results`);
      
      // Get AI analysis for this role's results
      const analysisResponse = await fetch('http://localhost:3000/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
          results: combinedResults,
          role
        }),
      });

      if (!analysisResponse.ok) {
        throw new Error('Failed to get analysis');
      }

      const { analysis } = await analysisResponse.json() as AnalysisResponse;
      
      results.push({
        role,
        results: combinedResults,
        aiAnswer: analysis
      });

      // Print role-specific results
      console.log('\nResults:');
      combinedResults.forEach((result, index) => {
        console.log(`${index + 1}. ${result.payload.name} (${result.payload.tenant_id}) - Score: ${result.score.toFixed(3)}`);
        console.log(`   Summary: ${result.payload.summary}`);
      });
      
      console.log('\nAI Analysis:');
      console.log(analysis);
    }

    // Get meta-analysis across all roles
    console.log('\n=== Meta Analysis ===');
    const metaAnalysisResponse = await fetch('http://localhost:3000/api/meta-analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: searchQuery,
        roleResults: results,
        roleInfo: {
          HEAD_OF_SUPPORT: "Full access to all support tickets and account data",
          ACCOUNT_MANAGER_A: "Access to Alpha and Charlie accounts and related tickets",
          ACCOUNT_MANAGER_B: "Access to Badger and Charlie accounts and related tickets",
          ACCOUNT_MANAGER_C: "Access revoked - Moved to graphics team",
          SUPPORT_AGENT: "Access to all tickets but no contracts"
        }
      }),
    });

    if (!metaAnalysisResponse.ok) {
      throw new Error('Failed to get meta analysis');
    }

    const { analysis: metaAnalysis } = await metaAnalysisResponse.json() as AnalysisResponse;
    console.log('\nMeta Analysis Results:');
    console.log(metaAnalysis);

  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
runAlphaTicketsTest(); 