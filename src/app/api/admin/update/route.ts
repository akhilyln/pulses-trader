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
    } catch (error: any) {
        console.error('Update API Error:', error);

        // Log to file for debugging
        try {
            const fs = require('fs');
            const logMsg = `\n--- ERROR ${new Date().toISOString()} ---\nMsg: ${error.message}\nCode: ${error.code}\nDet: ${error.details}\nHint: ${error.hint}\nStack: ${error.stack}\n`;
            fs.appendFileSync('save_error.log', logMsg);
        } catch (e) { }

        if (error.code) console.error('Error Code:', error.code);
        if (error.details) console.error('Error Details:', error.details);
        if (error.hint) console.error('Error Hint:', error.hint);

        return NextResponse.json({
            error: 'Failed to update products',
            details: error.message || String(error)
        }, { status: 500 });
    }
}
