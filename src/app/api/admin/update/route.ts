import { NextResponse } from 'next/server';
import { readDb, writeDb, Product, Brand } from '@/lib/db';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

export async function POST(request: Request) {
    try {
        const { password, products } = await request.json();

        if (password !== ADMIN_PASSWORD) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const db = await readDb();

        // Simple bulk update logic
        db.products = products;
        db.products.forEach(p => {
            p.updatedAt = new Date().toISOString();
            p.brands.forEach(b => {
                if (!b.updatedAt) b.updatedAt = new Date().toISOString();
            });
        });

        await writeDb(db);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update products' }, { status: 500 });
    }
}
