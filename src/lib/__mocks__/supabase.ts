import { vi } from 'vitest';

export const supabase = {
    from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        upsert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockReturnThis(),
        not: vi.fn().mockReturnThis(),
        filter: vi.fn().mockReturnThis(),
        neq: vi.fn().mockReturnThis(),
        // Add other methods as needed
    })),
};

vi.mock('../supabase', () => ({
    supabase: supabase,
}));
