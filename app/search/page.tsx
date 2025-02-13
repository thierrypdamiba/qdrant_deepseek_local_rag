'use client';

import { useState, useEffect, useCallback } from 'react';

type Role = 'HEAD_OF_SUPPORT' | 'ACCOUNT_MANAGER_A' | 'ACCOUNT_MANAGER_B' | 'ACCOUNT_MANAGER_C' | 'SUPPORT_AGENT';

const roleInfo = {
  HEAD_OF_SUPPORT: "Full access to all support tickets and account data",
  ACCOUNT_MANAGER_A: "Access to Alpha and Charlie accounts and related tickets",
  ACCOUNT_MANAGER_B: "Access to Badger and Charlie accounts and related tickets",
  ACCOUNT_MANAGER_C: "Access revoked - Moved to graphics team",
  SUPPORT_AGENT: "Access to all tickets"
} as const;

interface RoleDisplay {
  title: string;
  name: string;
}

const roleDisplayNames: Record<Role, RoleDisplay> = {
  HEAD_OF_SUPPORT: { title: "Head of Support", name: "Jordan" },
  ACCOUNT_MANAGER_A: { title: "Account Manager A", name: "Avery" },
  ACCOUNT_MANAGER_B: { title: "Account Manager B", name: "Blake" },
  ACCOUNT_MANAGER_C: { title: "Account Manager C", name: "Morgan" },
  SUPPORT_AGENT: { title: "Support Agent", name: "Sam" }
} as const;

interface SearchResult {
  id: string;
  version: number;
  score: number;
  collection?: 'contracts' | 'tickets';
  payload: {
    name: string;
    summary: string;
    details?: Record<string, unknown>;
    tenant_id?: string;
    permission_level?: string;
    record_type?: string;
    dashboard_section?: string;
    status?: string;
    visualization_type?: string;
  };
  vector?: number[];
}

interface RawDocument {
  contractId?: string;
  ticketId?: string;
  clientName?: string;
  company?: string;
  summary?: string;
  description?: string;
  terms?: string;
  serviceDetails?: string;
  dateSigned?: string;
  expiresOn?: string;
  currentStatus?: string;
  priority?: string;
  timeReported?: string;
  status?: string;
  assignedTo?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
  name?: string;
  tenant_id?: string;
  permission_level?: string;
  content?: string;
  collection?: 'contracts' | 'tickets';
}

interface DocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: RawDocument | null;
  collection: 'contracts' | 'tickets';
}

function DocumentModal({ isOpen, onClose, document, collection }: DocumentModalProps) {
  if (!isOpen || !document) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="border-b border-gray-200 p-4 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-black">{document.name}</h2>
            <p className="text-sm text-gray-800">
              {collection.charAt(0).toUpperCase() + collection.slice(1)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-700 hover:text-gray-900"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 overflow-auto max-h-[calc(90vh-8rem)]">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-black">Company</h3>
              <p className="mt-1 text-sm text-gray-800">{document.tenant_id}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-black">Permission Level</h3>
              <p className="mt-1 text-sm text-gray-800">{document.permission_level}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-black">Summary</h3>
              <p className="mt-1 text-sm text-gray-800">{document.summary}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-black">Content</h3>
              <pre className="mt-1 text-sm text-gray-800 whitespace-pre-wrap font-mono bg-gray-50 p-4 rounded-lg">
                {document.content}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface RoleResults {
  role: Role;
  results: SearchResult[];
  aiAnswer: string;
}

interface ApiError extends Error {
  message: string;
}

const RoleTitle: React.FC<{ display: RoleDisplay }> = ({ display }) => (
  <div>
    <div className="font-semibold text-base">{display.title}</div>
    <div className="text-xs text-gray-400 -mt-0.5">{display.name}</div>
  </div>
);

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<Role[]>(['HEAD_OF_SUPPORT']);
  const [roleResults, setRoleResults] = useState<RoleResults[]>([]);
  const [showAiAnalysis, setShowAiAnalysis] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [isSidebarExpanded, setSidebarExpanded] = useState(true);
  const [isSearchExpanded, setIsSearchExpanded] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<RawDocument | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [metaAnalysis, setMetaAnalysis] = useState('');
  const [showIntro, setShowIntro] = useState(true);
  const [isMetaAnalysisExpanded, setIsMetaAnalysisExpanded] = useState(false);
  const [isMetaAnalysisProcessing, setIsMetaAnalysisProcessing] = useState(false);

  // Sample queries for different scenarios
  const sampleQueries = [
    { query: "Show me all Alpha Corp issues", description: "See how different roles view Alpha's tickets and contracts" },
    { query: "Network connectivity problems", description: "Compare access to technical support tickets across roles" },
    { query: "Contract renewal status", description: "Understand how contract visibility varies by role" },
    { query: "High priority tickets", description: "View urgent support matters with role-based context" }
  ];

  // Company and data information
  const companyInfo = {
    name: "North Star Support",
    description: "Enterprise IT solutions and support provider",
    customers: [
      { name: "Alpha Corp", description: "Enterprise software company, managed by Account Manager A" },
      { name: "Badger Industries", description: "Manufacturing firm, managed by Account Manager B" },
      { name: "Charlie Tech", description: "Tech startup, jointly managed by Account Managers A & B" }
    ],
    collections: [
      {
        name: "Contracts",
        description: "Service agreements and terms",
        fields: ["contractId", "clientName", "summary", "terms", "status"]
      },
      {
        name: "Support Tickets",
        description: "Customer support and incident records",
        fields: ["ticketId", "company", "subject", "description", "priority", "status"]
      }
    ]
  };

  const fetchCollections = useCallback(async () => {
    try {
      const response = await fetch('/api/collections');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch collections');
      }

      if (data.collections.length > 0) {
        setSelectedRoles(['HEAD_OF_SUPPORT']);
      }
    } catch (error) {
      const err = error as ApiError;
      console.error('Error fetching collections:', err);
      setError('Failed to load collections');
    }
  }, []);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const generateEmbedding = async (text: string) => {
    try {
      const response = await fetch('/api/embed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate embedding');
      }

      const { vector } = await response.json();
      return vector;
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw error;
    }
  };

  const toggleRoleSelection = (role: Role) => {
    setSelectedRoles(prev => 
      prev.includes(role) 
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  };

  const handleCompareSearch = async () => {
    if (!searchQuery.trim() || selectedRoles.length === 0) return;

    setIsLoading(true);
    setError('');
    setRoleResults([]);
    setShowAiAnalysis(false);
    setIsAiProcessing(false);
    setIsMetaAnalysisProcessing(false);
    setShowIntro(false);
    setMetaAnalysis('');
    setIsMetaAnalysisExpanded(false);

    try {
      const vector = await generateEmbedding(searchQuery);
      const results: RoleResults[] = [];

      // First, get all search results
      for (const role of selectedRoles) {
        const [contractsResponse, ticketsResponse] = await Promise.all([
          fetch('/api/search', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Role': role
            },
            body: JSON.stringify({
              vector,
              collection: 'contracts',
              limit: 5,
            }),
          }),
          fetch('/api/search', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Role': role
            },
            body: JSON.stringify({
              vector,
              collection: 'tickets',
              limit: 5,
            }),
          }),
        ]);

        const [contractsData, ticketsData] = await Promise.all([
          contractsResponse.json(),
          ticketsResponse.json(),
        ]);

        // Add collection type to each result
        const contractResults = contractsData.results.map((r: SearchResult) => ({
          ...r,
          collection: 'contracts' as const
        }));
        const ticketResults = ticketsData.results.map((r: SearchResult) => ({
          ...r,
          collection: 'tickets' as const
        }));

        // Combine and sort all results by score
        const combinedResults = [...contractResults, ...ticketResults]
          .sort((a, b) => b.score - a.score)
          .slice(0, 5); // Take top 5 overall

        results.push({
          role,
          results: combinedResults,
          aiAnswer: ''
        });
      }

      // Update UI with search results immediately
      setRoleResults(results);
      setIsLoading(false);

      // Then start AI analysis
      setIsAiProcessing(true);
      const updatedResults = [...results];

      // Get individual role analyses
      for (let i = 0; i < selectedRoles.length; i++) {
        const role = selectedRoles[i];
        const roleResults = results[i].results;

        const analysisResponse = await fetch('/api/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: searchQuery,
            results: roleResults,
            role
          }),
        });

        const { analysis } = await analysisResponse.json();
        updatedResults[i].aiAnswer = analysis || '';
      }

      // Update UI with individual analyses
      setRoleResults(updatedResults);
      setShowAiAnalysis(true);
      setIsAiProcessing(false);

      // Start meta-analysis after individual analyses are complete
      setIsMetaAnalysisProcessing(true);
      const metaAnalysisResponse = await fetch('/api/meta-analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
          roleResults: updatedResults,
          roleInfo: {
            HEAD_OF_SUPPORT: "Full access to all support tickets and account data",
            ACCOUNT_MANAGER_A: "Access to Alpha and Charlie accounts and related tickets",
            ACCOUNT_MANAGER_B: "Access to Badger and Charlie accounts and related tickets",
            ACCOUNT_MANAGER_C: "Access revoked - Moved to graphics team",
            SUPPORT_AGENT: "Access to all tickets but no contracts"
          }
        }),
      });

      const { analysis: metaAnalysis } = await metaAnalysisResponse.json();
      
      // Update UI with meta analysis
      setMetaAnalysis(metaAnalysis);
      setIsMetaAnalysisProcessing(false);
    } catch (error) {
      const err = error as ApiError;
      console.error('Search error:', err);
      setError(err.message || 'Search failed');
    } finally {
      setIsLoading(false);
      setIsAiProcessing(false);
      setIsMetaAnalysisProcessing(false);
    }
  };

  const handleDocumentClick = async (docId: string, collectionType: string) => {
    const collection = collectionType === 'contracts' ? 'contracts' : 'tickets' as const;
    try {
      const response = await fetch('/api/document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: docId, collection }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch document');
      }

      const data = await response.json();
      setSelectedDocument(data);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error fetching document:', error);
      setError('Failed to load document details');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Collapsible Sidebar */}
      <div className={`transition-all duration-300 ease-in-out bg-white border-r border-gray-200 ${
        isSidebarExpanded ? 'w-1/5' : 'w-16'
      }`}>
        {/* Toggle Button */}
        <button
          onClick={() => setSidebarExpanded(!isSidebarExpanded)}
          className="absolute top-4 -right-3 bg-white border border-gray-200 rounded-full p-1 shadow-sm z-10 hover:bg-gray-50"
        >
          <svg
            className={`w-4 h-4 text-gray-600 transform transition-transform ${isSidebarExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="p-4">
          <div className={`${isSidebarExpanded ? 'block' : 'hidden'} mb-6`}>
            <h1 className="text-xl font-bold text-black mb-2">
              Qdrant RBAC Demo
            </h1>
            <p className="text-sm text-gray-800">
              Compare search results across roles
            </p>
            <button
              onClick={() => setShowIntro(!showIntro)}
              className="mt-2 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-sm font-medium flex items-center justify-center w-full transition-colors"
            >
              {showIntro ? 'Hide' : 'Show'} Introduction
              <svg
                className={`w-4 h-4 ml-1.5 transform transition-transform ${showIntro ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Search Section with Toggle */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className={`text-sm font-semibold text-black ${!isSidebarExpanded && 'hidden'}`}>
                Search
              </h2>
              <button
                onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                className="text-gray-500 hover:text-gray-700"
                title={isSearchExpanded ? 'Collapse Search' : 'Expand Search'}
              >
                <svg
                  className={`w-4 h-4 transform transition-transform ${isSearchExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            
            <div className={`flex flex-col gap-2 transition-all duration-300 ${
              isSearchExpanded ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
            }`}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCompareSearch()}
                placeholder={isSidebarExpanded ? "Search..." : ""}
                className="w-full p-2 border border-gray-300 rounded-lg text-black placeholder-gray-500 text-sm"
              />
              <button
                onClick={handleCompareSearch}
                disabled={isLoading || selectedRoles.length === 0}
                className="w-full p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 text-sm"
              >
                {isLoading ? '...' : isSidebarExpanded ? 'Search' : '🔍'}
              </button>
            </div>
          </div>

          {/* Role Selection */}
          <div className={`${isSidebarExpanded ? 'space-y-2' : 'hidden'}`}>
            {Object.entries(roleDisplayNames).map(([role, displayName]) => (
              <button
                key={role}
                onClick={() => toggleRoleSelection(role as Role)}
                className={`w-full p-3 rounded-lg border text-left ${
                  selectedRoles.includes(role as Role) 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200'
                }`}
              >
                <span className="block text-sm font-medium text-gray-900">{displayName.title}</span>
                <span className="block text-xs text-gray-700 mt-0.5">{displayName.name}</span>
                <span className="block text-xs text-gray-800 mt-1">
                  {roleInfo[role as Role]}
                </span>
              </button>
            ))}
          </div>

          {/* Collapsed Role Icons */}
          <div className={`${isSidebarExpanded ? 'hidden' : 'flex flex-col gap-2'}`}>
            {Object.entries(roleDisplayNames).map(([role, displayName]) => (
              <button
                key={role}
                onClick={() => toggleRoleSelection(role as Role)}
                className={`p-2 rounded-lg border text-center ${
                  selectedRoles.includes(role as Role) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
                title={`${displayName.title} - ${displayName.name}`}
              >
                {displayName.title.charAt(0)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto relative">
        {/* Introduction Section - Now as an overlay */}
        {showIntro && (
          <div className="absolute inset-0 z-10">
            <div className="absolute inset-0 bg-white opacity-95"></div>
            <div className="relative z-20 p-6 overflow-auto max-h-full">
              <div className="space-y-6">
                {/* Company Overview */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Welcome to {companyInfo.name}</h2>
                  <p className="text-gray-700 mb-4">{companyInfo.description}</p>
                  
                  <h3 className="font-medium text-gray-900 mb-2">Our Customers</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {companyInfo.customers.map(customer => (
                      <div key={customer.name} className="bg-gray-50 rounded-lg p-3">
                        <h4 className="font-medium text-gray-900">{customer.name}</h4>
                        <p className="text-sm text-gray-600">{customer.description}</p>
                      </div>
                    ))}
                  </div>

                  <h3 className="font-medium text-gray-900 mb-2">Data Collections</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {companyInfo.collections.map(collection => (
                      <div key={collection.name} className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900">{collection.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">{collection.description}</p>
                        <div className="text-xs text-gray-500">
                          Key fields: {collection.fields.join(", ")}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sample Queries */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Try These Sample Queries</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sampleQueries.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSearchQuery(item.query);
                          setShowIntro(false);
                          // Need to wait for state to update before searching
                          setTimeout(() => handleCompareSearch(), 0);
                        }}
                        className="text-left bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                      >
                        <div className="font-medium text-gray-900">{item.query}</div>
                        <div className="text-sm text-gray-600">{item.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Results Container */}
        {roleResults.length > 0 && (
          <div className="space-y-6">
            {/* AI Analysis Section */}
            {isAiProcessing && (
              <div className="flex items-center justify-center p-6 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
                <p className="text-blue-600 font-medium">Analyzing results with DeepSeek R1...</p>
              </div>
            )}

            {showAiAnalysis && !isAiProcessing && (
              <div className="space-y-6">
                {/* Meta Analysis - Collapsible */}
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setIsMetaAnalysisExpanded(!isMetaAnalysisExpanded)}
                    className="w-full p-6 flex justify-between items-center hover:bg-gray-50"
                  >
                    <h3 className="text-lg font-semibold text-gray-900">Access Pattern Analysis</h3>
                    <svg
                      className={`w-5 h-5 text-gray-500 transform transition-transform ${
                        isMetaAnalysisExpanded ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isMetaAnalysisProcessing && (
                    <div className="p-6 border-t border-gray-200 bg-blue-50">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
                        <p className="text-blue-600 font-medium">Analyzing access patterns...</p>
                      </div>
                    </div>
                  )}

                  {isMetaAnalysisExpanded && !isMetaAnalysisProcessing && (
                    <div className="p-6 border-t border-gray-200">
                      <div className="prose prose-sm max-w-none">
                        {metaAnalysis.split('\n\n').map((section, index) => {
                          const [header, ...points] = section.split('\n');
                          return (
                            <div key={index} className="mb-6 last:mb-0">
                              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                {header.trim()}
                              </h3>
                              <ul className="list-none space-y-2">
                                {points.map((point, pointIndex) => (
                                  <li 
                                    key={pointIndex}
                                    className="flex items-start"
                                  >
                                    <span className="text-blue-600 mr-2">•</span>
                                    <span className="text-gray-700">{point.replace('•', '').trim()}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Role-specific Analysis */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Role Analysis-Powered by DeepSeek</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {roleResults.map((roleResult) => (
                      <div key={roleResult.role} className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">
                          <RoleTitle display={roleDisplayNames[roleResult.role]} />
                        </h4>
                        <p className="text-gray-800 whitespace-pre-wrap">{roleResult.aiAnswer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Vector Search Results */}
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="border-b border-gray-200 p-4">
                <div>
                  <h2 className="text-lg font-semibold text-black">Search Results- Powered by Qdrant</h2>
                  <p className="text-sm text-gray-800">
                    Showing semantic search results with relevance scores
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
                {roleResults.map((roleResult) => (
                  <div key={roleResult.role} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-black">
                          <RoleTitle display={roleDisplayNames[roleResult.role]} />
                        </h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          roleResult.role === 'HEAD_OF_SUPPORT' ? 'bg-purple-100 text-purple-800' :
                          roleResult.role.includes('ACCOUNT_MANAGER') ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {roleResult.role.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')}
                        </span>
                      </div>
                    </div>

                    {/* Search Results Section */}
                    <div className="space-y-3">
                      {roleResult.results.map((result, idx) => (
                        <div 
                          key={idx}
                          className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleDocumentClick(result.id, result.collection || '')}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-medium text-black">{result.payload.name}</span>
                            <span className="text-sm text-gray-700 bg-gray-100 px-2 py-1 rounded">
                              Score: {result.score.toFixed(3)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-800">{result.payload.summary}</p>
                          {result.payload.tenant_id && (
                            <span className="inline-block mt-2 text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded">
                              Company: {result.payload.tenant_id}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Add debug output */}
        {process.env.NODE_ENV === 'development' && (
          <pre className="text-xs text-gray-500 mt-2">
            {JSON.stringify({ 
              metaAnalysis,
              roleResults: roleResults.map(r => ({ 
                role: r.role,
                resultCount: r.results.length,
                aiAnswer: r.aiAnswer 
              }))
            }, null, 2)}
          </pre>
        )}
      </div>

      {/* Document Modal */}
      <DocumentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        document={selectedDocument}
        collection={selectedDocument ? (selectedDocument.collection === 'contracts' ? 'contracts' : 'tickets') : 'contracts'}
      />
    </div>
  );
} 