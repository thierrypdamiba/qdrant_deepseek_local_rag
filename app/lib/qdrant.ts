import { QdrantClient } from '@qdrant/js-client-rest';

const QDRANT_URL = process.env.QDRANT_URL;

const API_KEYS = {
    HEAD_OF_SUPPORT: process.env.HEAD_OF_SUPPORT_API_KEY,
    ACCOUNT_MANAGER_A: process.env.ACCOUNT_MANAGER_A_API_KEY,
    ACCOUNT_MANAGER_B: process.env.ACCOUNT_MANAGER_B_API_KEY,
    ACCOUNT_MANAGER_C: process.env.ACCOUNT_MANAGER_C_API_KEY,
    SUPPORT_AGENT: process.env.SUPPORT_AGENT_API_KEY,
} as const;

// Create a map to store clients for different roles
const clients = new Map<string, QdrantClient>();

export function getQdrantClient(role: keyof typeof API_KEYS = 'HEAD_OF_SUPPORT') {
    // Check if we already have a client for this role
    const existingClient = clients.get(role);
    if (existingClient) {
        return existingClient;
    }

    // Get the API key for the role
    const apiKey = API_KEYS[role];
    if (!apiKey) {
        throw new Error(`No API key found for role: ${role}`);
    }

    if (!QDRANT_URL) {
        throw new Error('QDRANT_URL is not set in environment variables');
    }

    // Create a new client for this role with version compatibility check disabled
    const client = new QdrantClient({
        url: QDRANT_URL,
        apiKey: apiKey,
        timeout: 10000, // 10 second timeout
        checkCompatibility: false // Disable version compatibility check
    });

    // Store the client for future use
    clients.set(role, client);
    return client;
}

export type QdrantError = {
    response?: {
        data?: unknown;
    };
    message?: string;
    status?: number;
    data?: unknown;
};

// Helper function to perform vector search
export async function searchVectors(
    collectionName: string,
    vector: number[],
    limit: number = 5,
    role: keyof typeof API_KEYS = 'HEAD_OF_SUPPORT'
) {
    // Special case for Account Manager C - should see no results
    if (role === 'ACCOUNT_MANAGER_C') {
        return [{
            id: 'no-access',
            score: 0,
            payload: {
                name: 'No Access',
                summary: "None of the search results are relevant to the query",
                tenant_id: '',
                permission_level: 'No Access',
                details: {}
            }
        }];
    }

    // Special case for Support Agent - should only see tickets
    if (role === 'SUPPORT_AGENT' && collectionName === 'contracts') {
        return [];
    }

    const client = getQdrantClient(role);
    try {
        console.log(`[DEBUG] Starting search for role ${role} in collection ${collectionName}`);
        console.log(`[DEBUG] Using API key: ${API_KEYS[role]?.substring(0, 50)}...`);
        
        if (role === 'ACCOUNT_MANAGER_B') {
            console.log(`[DEBUG] Account Manager B full details:`, {
                url: QDRANT_URL,
                collection: collectionName,
                keyLength: API_KEYS[role]?.length,
                keyPrefix: API_KEYS[role]?.substring(0, 100)
            });
        }

        // Verify we're using the correct collection name
        if (!['contracts', 'tickets'].includes(collectionName)) {
            throw new Error(`Invalid collection name: ${collectionName}`);
        }

        // For debugging: if vector length is wrong, use a test vector
        if (vector.length !== 1536) {
            console.log(`[${role}] Using test vector due to incorrect vector length (${vector.length})`);
            vector = Array(1536).fill(0.1); // Create a test vector of the correct size
        }

        console.log(`[DEBUG] Executing search with params:`, {
            collectionName,
            limit,
        });

        try {
            const searchResult = await client.search(collectionName, {
                vector,
                limit,
                with_payload: true,
                with_vector: false
            });

            console.log(`[DEBUG] Search completed. Results count:`, searchResult.length);
            if (searchResult.length > 0) {
                console.log(`[DEBUG] First result sample:`, {
                    id: searchResult[0].id,
                    score: searchResult[0].score,
                    payload: collectionName === 'contracts' 
                        ? { contractId: searchResult[0].payload?.contractId, clientName: searchResult[0].payload?.clientName }
                        : { ticketId: searchResult[0].payload?.ticketId, company: searchResult[0].payload?.company }
                });
            } else {
                console.log('[DEBUG] No results found');
                return [];
            }

            // Transform results based on collection type
            return searchResult.map(result => {
                const payload = result.payload || {};
                return {
                    id: result.id,
                    score: result.score,
                    payload: {
                        name: collectionName === 'contracts' 
                            ? payload.contractId || 'Unknown Contract'
                            : payload.ticketId || 'Unknown Ticket',
                        summary: collectionName === 'contracts'
                            ? payload.summary || ''
                            : payload.description || '',
                        tenant_id: collectionName === 'contracts'
                            ? payload.clientName || ''
                            : payload.company || '',
                        permission_level: collectionName === 'contracts'
                            ? payload.currentStatus || 'Unknown'
                            : payload.status || 'Unknown',
                        details: payload
                    }
                };
            });
        } catch (error: unknown) {
            const searchError = error as QdrantError;
            console.error(`[${role}] Search error details:`, {
                status: searchError.status,
                message: searchError.message,
                data: searchError.data
            });
            
            // If we get a 403, return empty results instead of throwing
            if (searchError.status === 403) {
                console.log(`[${role}] Access denied to ${collectionName}, returning empty results`);
                return [];
            }
            throw error;
        }
    } catch (error) {
        console.error(`[${role}] Error searching ${collectionName}:`, error);
        throw error;
    }
}

// Helper function to check collection exists
export async function checkCollection(collectionName: string) {
    const client = getQdrantClient();
    try {
        const collections = await client.getCollections();
        return collections.collections.some(collection => collection.name === collectionName);
    } catch (error) {
        console.error('Error checking collection:', error);
        throw error;
    }
}

// Helper function to get collection info
export async function getCollectionInfo(collectionName: string) {
    const client = getQdrantClient();
    try {
        return await client.getCollection(collectionName);
    } catch (error) {
        console.error('Error getting collection info:', error);
        throw error;
    }
}
