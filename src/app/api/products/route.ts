import { NextResponse } from 'next/server';
import { readDb } from '@/lib/db';

export async function GET() {
    try {
        const db = await readDb();
        return NextResponse.json(db.products);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}
