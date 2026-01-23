import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readDb, updateBrandPrice } from '../db';
import { supabase } from '../supabase';

// Mock the whole supabase module
vi.mock('../supabase', () => {
    const mockFrom = vi.fn();
    return {
        supabase: {
            from: mockFrom
        }
    };
});

// Helper to create a Supabase-like thenable mock
const createMockQuery = (data: any, error: any = null) => {
    const mock: any = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockReturnThis(),
        not: vi.fn().mockReturnThis(),
        neq: vi.fn().mockReturnThis(),
        filter: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        then: vi.fn((resolve) => {
            resolve({ data, error });
        }),
        catch: vi.fn(),
    };
    return mock;
};

describe('Database Layer (db.ts)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('readDb', () => {
        it('should correctly map products and brands from Supabase', async () => {
            const mockProductsData = [
                {
                    id: 'p1',
                    name: 'Product 1',
                    telugu_name: 'ప్రొడక్ట్ 1',
                    display_order: 1,
                    updated_at: '2023-01-01',
                    brands: [
                        { id: 'b1', name: 'Brand 1', price: 100, prev_price: 90, change: 11.11, updated_at: '2023-01-01' }
                    ]
                }
            ];

            const mockHistoryData = [
                { brand_id: 'b1', price: 100, timestamp: '2023-01-01' }
            ];

            (supabase.from as any).mockImplementation((table: string) => {
                if (table === 'products') return createMockQuery(mockProductsData);
                if (table === 'price_history') return createMockQuery(mockHistoryData);
                return createMockQuery(null);
            });

            const result = await readDb();

            expect(result.products).toHaveLength(1);
            expect(result.products[0].name).toBe('Product 1');
            expect(result.products[0].brands[0].name).toBe('Brand 1');
            expect(result.history).toHaveLength(1);
        });

        it('should return empty schema on error', async () => {
            (supabase.from as any).mockImplementation(() => createMockQuery(null, new Error('DB Error')));

            const result = await readDb();
            expect(result.products).toHaveLength(0);
            expect(result.history).toHaveLength(0);
        });
    });

    describe('updateBrandPrice', () => {
        it('should update price and log history', async () => {
            const mockBrand = { price: 100 };

            const brandMock = createMockQuery(mockBrand);
            const historyMock = createMockQuery({ success: true });

            (supabase.from as any).mockImplementation((table: string) => {
                if (table === 'brands') return brandMock;
                if (table === 'price_history') return historyMock;
                return createMockQuery(null);
            });

            await updateBrandPrice('b1', 110);

            expect(supabase.from).toHaveBeenCalledWith('brands');
            expect(brandMock.select).toHaveBeenCalled();
            expect(brandMock.update).toHaveBeenCalled();
            expect(supabase.from).toHaveBeenCalledWith('price_history');
        });
    });
});
