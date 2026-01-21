import { readDb, writeDb, Product, Brand } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { password, brandId, newPrice } = await request.json();

        if (password !== (process.env.ADMIN_PASSWORD || 'admin123')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const db = await readDb();
        let updated = false;

        db.products.forEach(p => {
            const brand = p.brands.find(b => b.id === brandId);
            if (brand) {
                const prevPrice = brand.price;
                brand.prevPrice = prevPrice;
                brand.price = parseFloat(newPrice);
                brand.change = prevPrice !== 0 ? ((brand.price - prevPrice) / prevPrice) * 100 : 0;
                brand.updatedAt = new Date().toISOString();

                db.history.push({
                    brandId,
                    price: brand.price,
                    timestamp: brand.updatedAt
                });
                updated = true;
            }
        });

        if (!updated) {
            return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
        }

        await writeDb(db);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update rate' }, { status: 500 });
    }
}
