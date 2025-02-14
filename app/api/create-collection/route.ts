import { NextResponse } from 'next/server';
import { getQdrantClient } from '@/app/lib/qdrant';

type ApiError = {
    message: string;
    status?: number;
};

export async function POST(request: Request) {
    try {
        const client = getQdrantClient();
        const { name, size = 4096 } = await request.json();

        if (!name) {
            return NextResponse.json(
                { error: 'Collection name is required' },
                { status: 400 }
            );
        }

        await client.createCollection(name, {
            vectors: {
                size,
                distance: 'Cosine'
            }
        });

        return NextResponse.json({ message: 'Collection created successfully' });
    } catch (error) {
        const err = error as ApiError;
        console.error('Create collection error:', err);
        return NextResponse.json(
            { error: err.message || 'Failed to create collection' },
            { status: err.status || 500 }
        );
    }
} 