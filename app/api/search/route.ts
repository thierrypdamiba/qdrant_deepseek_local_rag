import { NextResponse } from 'next/server';
import { searchVectors } from '@/app/lib/qdrant';

type Role = 'HEAD_OF_SUPPORT' | 'ACCOUNT_MANAGER_A' | 'ACCOUNT_MANAGER_B' | 'ACCOUNT_MANAGER_C' | 'SUPPORT_AGENT';

export async function POST(request: Request) {
    try {
        const { vector, collection, limit } = await request.json();
        const role = (request.headers.get('x-role') ?? 'HEAD_OF_SUPPORT') as Role;
        
        const results = await searchVectors(collection, vector, limit, role);
        return NextResponse.json({ results });
    } catch (error) {
        console.error('Search error:', error);
        return NextResponse.json(
            { error: 'Failed to perform search' },
            { status: 500 }
        );
    }
}
