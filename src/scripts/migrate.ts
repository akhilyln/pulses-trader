import 'dotenv/config';
import { readDb } from '../lib/db';
import { supabase } from '../lib/supabase';
import fs from 'fs/promises';
import path from 'path';

async function migrate() {
    console.log('🚀 Starting migration from db.json to Supabase...');

    const DB_PATH = path.join(process.cwd(), 'data', 'db.json');
    try {
        const fileData = await fs.readFile(DB_PATH, 'utf-8');
        const db = JSON.parse(fileData);

        for (const product of db.products) {
            console.log(`📦 Migrating Product: ${product.name}`);

            const { error: pError } = await supabase
                .from('products')
                .upsert({
                    id: product.id,
                    name: product.name,
                    telugu_name: product.teluguName,
                    updated_at: product.updatedAt
                });

            if (pError) {
                console.error(`❌ Error migrating product ${product.name}:`, pError);
                continue;
            }

            for (const brand of product.brands) {
                console.log(`  - Migrating Brand: ${brand.name}`);
                const { error: bError } = await supabase
                    .from('brands')
                    .upsert({
                        id: brand.id,
                        product_id: product.id,
                        name: brand.name,
                        price: brand.price,
                        prev_price: brand.prevPrice,
                        change: brand.change,
                        updated_at: brand.updatedAt
                    });

                if (bError) console.error(`  ❌ Error migrating brand ${brand.name}:`, bError);
            }
        }

        console.log('✅ Migration complete!');
    } catch (error) {
        console.error('❌ Migration failed:', error);
    }
}

migrate();
