import { NextResponse } from 'next/server';
import OpenAI from 'openai';

type ApiError = {
    message: string;
    status?: number;
};

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export async function POST(request: Request) {
    try {
        const { text } = await request.json();

        if (!text) {
            return NextResponse.json(
                { error: 'Text is required' },
                { status: 400 }
            );
        }

        const response = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: text,
            encoding_format: "float",
        });

        return NextResponse.json({
            vector: response.data[0].embedding
        });
    } catch (error) {
        const err = error as ApiError;
        console.error('Embedding error:', err);
        return NextResponse.json(
            { error: err.message || 'Failed to generate embedding' },
            { status: err.status || 500 }
        );
    }
} 