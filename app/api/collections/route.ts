import { NextResponse } from 'next/server';
import { getQdrantClient } from '@/app/lib/qdrant';

export async function GET() {
    try {
        const client = getQdrantClient();
        const { collections } = await client.getCollections();
        return NextResponse.json({ collections });
    } catch (err) {
        console.error('Failed to fetch collections:', err);
        return NextResponse.json({ error: 'Failed to fetch collections' }, { status: 500 });
    }
} 