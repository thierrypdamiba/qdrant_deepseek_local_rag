import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface DocumentRequestBody {
  id: string;
  collection: 'contracts' | 'tickets';
}

interface Document {
  contractId?: string;
  ticketId?: string;
  company?: string;
  clientName?: string;
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
  metadata?: {
    documentType?: string;
    source?: string;
    lastUpdated?: string;
    version?: number;
    region?: string;
    platform?: string;
  };
}

export async function POST(request: Request) {
    try {
        const body = await request.json() as DocumentRequestBody;
        const { id, collection } = body;

        // Determine which file to read based on collection
        const fileName = collection === 'contracts' ? 'contracts.txt' : 'tickets.txt';
        const filePath = path.join(process.cwd(), 'data', fileName);

        // Read and parse the file
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const documents = JSON.parse(fileContent) as Document[];

        // Find the requested document
        const document = documents.find((doc) => 
            collection === 'contracts' 
                ? doc.contractId === id 
                : doc.ticketId === id
        );

        if (!document) {
            return NextResponse.json(
                { error: 'Document not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(document);
    } catch (error) {
        console.error('Error fetching document:', error);
        return NextResponse.json(
            { error: 'Failed to fetch document' },
            { status: 500 }
        );
    }
} 