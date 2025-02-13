import { NextResponse } from 'next/server';
import { checkCollection } from '@/app/lib/qdrant';

type ApiError = {
    message: string;
    status?: number;
};

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const collection = searchParams.get('collection');

        if (!collection) {
            return NextResponse.json(
                { error: 'Collection name is required' },
                { status: 400 }
            );
        }

        const exists = await checkCollection(collection);
        return NextResponse.json({ exists });
    } catch (error) {
        const err = error as ApiError;
        console.error('Check collection error:', err);
        return NextResponse.json(
            { error: err.message || 'Failed to check collection' },
            { status: err.status || 500 }
        );
    }
} 