/* eslint-disable react/no-unescaped-entities */
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export default function Home() {
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  const toggleStep = (stepNumber: number) => {
    setExpandedStep(expandedStep === stepNumber ? null : stepNumber);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="relative w-full max-w-2xl mx-auto mb-8">
            <Image
              src="/title.webp"
              alt="Qdrant RBAC Demo Illustration"
              width={800}
              height={400}
              className="rounded-lg shadow-lg"
              priority
            />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            Qdrant RBAC Demo
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Explore role-based access control in action with semantic search capabilities.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div className="rounded-md shadow">
              <Link
                href="/search"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
              >
                Try the Demo
              </Link>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mt-24">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">How It Works</h2>
          <div className="space-y-8">
            {/* Step 1 */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="flex items-start p-6">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                    1
                  </div>
                </div>
                <div className="ml-4 flex-grow">
                  <h3 className="text-lg font-medium text-gray-900">Select a Role</h3>
                  <p className="mt-2 text-gray-600">
                    Choose from different roles including Head of Support, Account Managers, and Support Agent.
                  </p>
                  <button
                    onClick={() => toggleStep(1)}
                    className="mt-3 text-blue-600 hover:text-blue-700 text-sm flex items-center"
                  >
                    {expandedStep === 1 ? (
                      <>
                        Show Less
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </>
                    ) : (
                      <>
                        Learn More
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </div>
              {expandedStep === 1 && (
                <div className="px-6 pb-6 bg-gray-50 border-t border-gray-100">
                  <div className="mt-4 text-sm text-gray-600 space-y-3">
                    <p><strong>Head of Support, Jordan:</strong> Full access to all support tickets and contract data. Perfect for managing the support team and overseeing all customer interactions.</p>
                    <p><strong>Account Manager:</strong> Access to specific support tickets and contract data related to their accounts. Each manager only has access to data pertaining to their accounts to ensure focused customer care and privacy.</p>
                    <div className="ml-4">
                      <p><strong>Account Manager A, Avery:</strong> Access to all support tickets and contract data related to Alpha and Charlie accounts.</p>
                      <p><strong>Account Manager B, Blake:</strong> Access to all support tickets and contract data related to Badger and Charlie accounts.</p>
                      <p><strong>Account Manager C, Morgan:</strong> Changed department to Graphic Design. No longer has access to support tickets or contracts.</p>
                    </div>
                    <p><strong>Support Agent, Sam:</strong> Access to all support tickets but no access to contracts. Ideal for day-to-day ticket resolution and customer support.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="flex items-start p-6">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                    2
                  </div>
                </div>
                <div className="ml-4 flex-grow">
                  <h3 className="text-lg font-medium text-gray-900">Search Documents</h3>
                  <p className="mt-2 text-gray-600">
                    Perform semantic searches across support tickets and contracts with role-specific access.
                  </p>
                  <button
                    onClick={() => toggleStep(2)}
                    className="mt-3 text-blue-600 hover:text-blue-700 text-sm flex items-center"
                  >
                    {expandedStep === 2 ? (
                      <>
                        Show Less
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </>
                    ) : (
                      <>
                        Learn More
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </div>
              {expandedStep === 2 && (
                <div className="px-6 pb-6 bg-gray-50 border-t border-gray-100">
                  <div className="mt-4 text-sm text-gray-600 space-y-3">
                    <p><strong>Natural Language Search:</strong> Use everyday language to search. The system understands context and intent, not just keywords.</p>
                    <p><strong>Document Types:</strong> Search across both support tickets and contracts, each containing rich and detailed information.</p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 my-4">
                      <p className="text-sm text-blue-800">
                        <strong>Note:</strong> While we typically recommend using a single collection with multi-vectors or metadata fields to differentiate document types, 
                        this demo uses separate collections to showcase granular role-based access control capabilities across different data sources.
                      </p>
                    </div>
                    <p><strong>Support Tickets:</strong></p>
                    <p>These documents include detailed records of customer interactions, issue reports, and resolutions.</p>
                    <p>For example, a ticket might have the following details:</p>
                    <table className="min-w-full divide-y divide-gray-200 my-4">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Field</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sample Value</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                          <td className="px-3 py-2 text-sm font-mono text-gray-900">ticketId</td>
                          <td className="px-3 py-2 text-sm font-mono text-blue-600">TICK-2024-0123</td>
                          <td className="px-3 py-2 text-sm font-mono text-gray-600">Unique identifier for the ticket</td>
                        </tr>
                        <tr>
                          <td className="px-3 py-2 text-sm font-mono text-gray-900">company</td>
                          <td className="px-3 py-2 text-sm font-mono text-blue-600">Alpha Corp</td>
                          <td className="px-3 py-2 text-sm font-mono text-gray-600">Company that submitted the ticket</td>
                        </tr>
                        <tr>
                          <td className="px-3 py-2 text-sm font-mono text-gray-900">subject</td>
                          <td className="px-3 py-2 text-sm font-mono text-blue-600">Dashboard Access Issue</td>
                          <td className="px-3 py-2 text-sm font-mono text-gray-600">Brief description of the issue</td>
                        </tr>
                        <tr>
                          <td className="px-3 py-2 text-sm font-mono text-gray-900">description</td>
                          <td className="px-3 py-2 text-sm font-mono text-blue-600">Unable to access sales dashboard...</td>
                          <td className="px-3 py-2 text-sm font-mono text-gray-600">Detailed explanation of the issue</td>
                        </tr>
                        <tr>
                          <td className="px-3 py-2 text-sm font-mono text-gray-900">priority</td>
                          <td className="px-3 py-2 text-sm font-mono text-blue-600">High</td>
                          <td className="px-3 py-2 text-sm font-mono text-gray-600">Urgency level of the ticket</td>
                        </tr>
                        <tr>
                          <td className="px-3 py-2 text-sm font-mono text-gray-900">status</td>
                          <td className="px-3 py-2 text-sm font-mono text-blue-600">In Progress</td>
                          <td className="px-3 py-2 text-sm font-mono text-gray-600">Current state of the ticket</td>
                        </tr>
                        <tr>
                          <td className="px-3 py-2 text-sm font-mono text-gray-900">assignedTo</td>
                          <td className="px-3 py-2 text-sm font-mono text-blue-600">Sam</td>
                          <td className="px-3 py-2 text-sm font-mono text-gray-600">Team member handling the ticket</td>
                        </tr>
                      </tbody>
                    </table>
                    <p><strong>Contracts:</strong></p>
                    <p>These documents include detailed service agreements, terms, and conditions.</p>
                    <p>For example, a contract might have the following details:</p>
                    <table className="min-w-full divide-y divide-gray-200 my-4">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Field</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sample Value</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                          <td className="px-3 py-2 text-sm font-mono text-gray-900">contractId</td>
                          <td className="px-3 py-2 text-sm font-mono text-blue-600">CONT-2024-0456</td>
                          <td className="px-3 py-2 text-sm font-mono text-gray-600">Unique identifier for the contract</td>
                        </tr>
                        <tr>
                          <td className="px-3 py-2 text-sm font-mono text-gray-900">clientName</td>
                          <td className="px-3 py-2 text-sm font-mono text-blue-600">Charlie Industries</td>
                          <td className="px-3 py-2 text-sm font-mono text-gray-600">Name of the client company</td>
                        </tr>
                        <tr>
                          <td className="px-3 py-2 text-sm font-mono text-gray-900">contractTitle</td>
                          <td className="px-3 py-2 text-sm font-mono text-blue-600">Enterprise Support Plan</td>
                          <td className="px-3 py-2 text-sm font-mono text-gray-600">Title of the service agreement</td>
                        </tr>
                        <tr>
                          <td className="px-3 py-2 text-sm font-mono text-gray-900">summary</td>
                          <td className="px-3 py-2 text-sm font-mono text-blue-600">24/7 Premium Support Package</td>
                          <td className="px-3 py-2 text-sm font-mono text-gray-600">Brief overview of the contract</td>
                        </tr>
                        <tr>
                          <td className="px-3 py-2 text-sm font-mono text-gray-900">terms</td>
                          <td className="px-3 py-2 text-sm font-mono text-blue-600">12 months, auto-renewal</td>
                          <td className="px-3 py-2 text-sm font-mono text-gray-600">Contract terms and conditions</td>
                        </tr>
                        <tr>
                          <td className="px-3 py-2 text-sm font-mono text-gray-900">serviceDetails</td>
                          <td className="px-3 py-2 text-sm font-mono text-blue-600">Priority support, SLA 2hr...</td>
                          <td className="px-3 py-2 text-sm font-mono text-gray-600">Specific services covered</td>
                        </tr>
                        <tr>
                          <td className="px-3 py-2 text-sm font-mono text-gray-900">status</td>
                          <td className="px-3 py-2 text-sm font-mono text-blue-600">Active</td>
                          <td className="px-3 py-2 text-sm font-mono text-gray-600">Current state of the contract</td>
                        </tr>
                      </tbody>
                    </table>
                    <p><strong>Smart Filtering:</strong> Results are automatically filtered based on role permissions, ensuring users only see documents they're authorized to access.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="flex items-start p-6">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                    3
                  </div>
                </div>
                <div className="ml-4 flex-grow">
                  <h3 className="text-lg font-medium text-gray-900">View Results</h3>
                  <p className="mt-2 text-gray-600">
                    See how different roles receive different search results based on their access levels.
                  </p>
                  <button
                    onClick={() => toggleStep(3)}
                    className="mt-3 text-blue-600 hover:text-blue-700 text-sm flex items-center"
                  >
                    {expandedStep === 3 ? (
                      <>
                        Show Less
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </>
                    ) : (
                      <>
                        Learn More
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </div>
              {expandedStep === 3 && (
                <div className="px-6 pb-6 bg-gray-50 border-t border-gray-100">
                  <div className="mt-4 text-sm text-gray-600 space-y-4">
                    <p>When you search, you'll see two types of results:</p>
                    
                    <div className="pl-4">
                      <p><strong>1. Retrieved Documents:</strong> Direct search results showing matching documents with relevance scores, clearly indicating which documents each role can access.</p>
                      <p><strong>2. AI Analysis:</strong> For each role, an AI-generated summary explaining the search results from that role's perspective and access level.</p>
                    </div>

                    <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                      <p className="font-medium text-blue-900 mb-2">Demo Example:</p>
                      <p><strong>Demo Example:</strong> &quot;Tell me about Alpha Corp tickets&quot;</p>
                      <div className="space-y-2 text-blue-800">
                        <p><strong>Head of Support (Jordan):</strong> Sees all Alpha Corp tickets, including high-priority issues and sensitive internal matters.</p>
                        <p><strong>Account Manager A (Avery):</strong> Sees Alpha Corp tickets as they manage this account.</p>
                        <p><strong>Account Manager B (Blake):</strong> No access to Alpha Corp tickets as they manage different accounts.</p>
                        <p><strong>Account Manager C (Morgan):</strong> No access to any tickets - moved to Graphics Design department.</p>
                        <p><strong>Support Agent (Sam):</strong> Sees all Alpha Corp support tickets but no contract information.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-24">
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
            {/* RBAC Feature */}
            <div className="p-6 bg-white rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Role-Based Access</h3>
              <p className="text-gray-600">
                Demonstrates fine-grained access control with different roles and permissions levels.
              </p>
            </div>

            {/* Semantic Search Feature */}
            <div className="p-6 bg-white rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Semantic Search</h3>
              <p className="text-gray-600">
                Powered by Qdrant vector database for intelligent, context-aware search results.
              </p>
            </div>

            {/* AI Analysis Feature */}
            <div className="p-6 bg-white rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Analysis</h3>
              <p className="text-gray-600">
                Real-time AI analysis of search results with role-specific insights.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
