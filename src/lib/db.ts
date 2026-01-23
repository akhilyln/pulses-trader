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
    try {
        const incomingProductIds = data.products.map(p => p.id);
        const incomingBrandIds = data.products.flatMap(p => p.brands.map(b => b.id));

        // 1. Delete brands not in incoming data
        let brandDeleteQuery = supabase.from('brands').delete();
        if (incomingBrandIds.length > 0) {
            brandDeleteQuery = brandDeleteQuery.not('id', 'in', incomingBrandIds);
        } else {
            // Delete all if no brands incoming (edge case)
            brandDeleteQuery = brandDeleteQuery.neq('id', 'ffffffff-ffff-ffff-ffff-ffffffffffff');
        }
        const { error: deleteBrandsError } = await brandDeleteQuery;

        if (deleteBrandsError) {
            console.error('Error deleting stale brands:', deleteBrandsError);
            throw deleteBrandsError;
        }

        // 2. Delete products not in incoming data
        let productDeleteQuery = supabase.from('products').delete();
        if (incomingProductIds.length > 0) {
            productDeleteQuery = productDeleteQuery.not('id', 'in', incomingProductIds);
        } else {
            productDeleteQuery = productDeleteQuery.neq('id', 'ffffffff-ffff-ffff-ffff-ffffffffffff');
        }
        const { error: deleteProductsError } = await productDeleteQuery;

        if (deleteProductsError) {
            console.error('Error deleting stale products:', deleteProductsError);
            throw deleteProductsError;
        }

        // 3. Upsert current products and brands
        for (const product of data.products) {
            const { error: pError } = await supabase
                .from('products')
                .upsert({
                    id: product.id,
                    name: product.name,
                    telugu_name: product.teluguName,
                    display_order: Number(product.displayOrder) || 100,
                    updated_at: new Date().toISOString()
                });

            if (pError) throw pError;

            for (const brand of product.brands) {
                const { error: bError } = await supabase
                    .from('brands')
                    .upsert({
                        id: brand.id,
                        product_id: product.id,
                        name: brand.name,
                        price: Number(brand.price),
                        prev_price: brand.prevPrice,
                        change: brand.change,
                        updated_at: brand.updatedAt || new Date().toISOString()
                    });

                if (bError) throw bError;
            }
        }
    } catch (error) {
        console.error('CRITICAL: Error writing DB to Supabase:', error);
        throw error;
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
