import { supabase } from './supabase';

export interface Brand {
    id: string;
    name: string;
    price: number;
    prevPrice: number | null;
    change: number | null;
    updatedAt: string;
}

export interface Product {
    id: string;
    name: string;
    teluguName?: string;
    displayOrder?: number;
    brands: Brand[];
    updatedAt: string;
}

export interface PriceHistory {
    brandId: string;
    price: number;
    timestamp: string;
}

export interface DbSchema {
    products: Product[];
    history: PriceHistory[];
}

export async function readDb(): Promise<DbSchema> {
    try {
        // Fetch all products with their brands
        const { data: productsData, error: productsError } = await supabase
            .from('products')
            .select(`
                id,
                name,
                telugu_name,
                display_order,
                updated_at,
                brands (
                    id,
                    name,
                    price,
                    prev_price,
                    change,
                    updated_at
                )
            `)
            .order('display_order', { ascending: true, nullsFirst: false })
            .order('name');

        if (productsError) throw productsError;

        const products: Product[] = (productsData || []).map((p: any) => ({
            id: p.id,
            name: p.name,
            teluguName: p.telugu_name,
            displayOrder: p.display_order,
            updatedAt: p.updated_at,
            brands: (p.brands || []).map((b: any) => ({
                id: b.id,
                name: b.name,
                price: b.price,
                prevPrice: b.prev_price,
                change: b.change,
                updatedAt: b.updated_at
            }))
        }));

        // Fetch price history (limit to last 100 for performance)
        const { data: historyData, error: historyError } = await supabase
            .from('price_history')
            .select('*')
            .order('timestamp', { ascending: false })
            .limit(100);

        if (historyError) throw historyError;

        const history: PriceHistory[] = (historyData || []).map((h: any) => ({
            brandId: h.brand_id,
            price: h.price,
            timestamp: h.timestamp
        }));

        return { products, history };
    } catch (error) {
        console.error('Error reading Supabase DB:', error);
        return { products: [], history: [] };
    }
}

export async function writeDb(data: DbSchema): Promise<void> {
    // This function is for bulk updates. In Supabase, we do it per product/brand
    // But for the specific "admin bulk save" logic, we can implement it here
    try {
        for (const product of data.products) {
            // Upsert product
            const { error: pError } = await supabase
                .from('products')
                .upsert({
                    id: product.id,
                    name: product.name,
                    telugu_name: product.teluguName,
                    display_order: product.displayOrder,
                    updated_at: new Date().toISOString()
                });

            if (pError) throw pError;

            for (const brand of product.brands) {
                // Upsert brand
                const { error: bError } = await supabase
                    .from('brands')
                    .upsert({
                        id: brand.id,
                        product_id: product.id,
                        name: brand.name,
                        price: brand.price,
                        prev_price: brand.prevPrice,
                        change: brand.change,
                        updated_at: brand.updatedAt || new Date().toISOString()
                    });

                if (bError) throw bError;
            }
        }
    } catch (error) {
        console.error('Error writing to Supabase:', error);
    }
}

export async function updateBrandPrice(brandId: string, newPrice: number): Promise<void> {
    try {
        // 1. Get current brand info
        const { data: brand, error: getError } = await supabase
            .from('brands')
            .select('price')
            .eq('id', brandId)
            .single();

        if (getError) throw getError;

        const prevPrice = brand.price;
        const change = prevPrice !== 0 ? ((newPrice - prevPrice) / prevPrice) * 100 : 0;
        const updatedAt = new Date().toISOString();

        // 2. Update brand
        const { error: updateError } = await supabase
            .from('brands')
            .update({
                price: newPrice,
                prev_price: prevPrice,
                change: change,
                updated_at: updatedAt
            })
            .eq('id', brandId);

        if (updateError) throw updateError;

        // 3. Log history
        const { error: historyError } = await supabase
            .from('price_history')
            .insert({
                brand_id: brandId,
                price: newPrice,
                timestamp: updatedAt
            });

        if (historyError) throw historyError;

    } catch (error) {
        console.error('Error updating brand price in Supabase:', error);
    }
}
