import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../route';
import * as db from '@/lib/db';

// Mock the db module
vi.mock('@/lib/db', () => ({
    readDb: vi.fn(),
    writeDb: vi.fn(),
}));

describe('Admin Update API Route', () => {
    // Note: The route.ts captures process.env.ADMIN_PASSWORD at load time.
    // The default is 'admin123'.
    const DEFAULT_PASS = 'admin123';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return 401 if password is incorrect', async () => {
        const req = {
            json: async () => ({ password: 'wrong-password', products: [] })
        } as Request;

        const response = await POST(req);
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.error).toBe('Unauthorized');
    });

    it('should successfully update products if password is correct', async () => {
        const mockProducts = [
            { id: 'p1', name: 'Product 1', brands: [{ id: 'b1', name: 'Brand 1', price: 100 }] }
        ];

        const req = {
            json: async () => ({ password: DEFAULT_PASS, products: mockProducts })
        } as Request;

        (db.readDb as any).mockResolvedValue({ products: [], history: [] });
        (db.writeDb as any).mockResolvedValue({ success: true });

        const response = await POST(req);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(db.writeDb).toHaveBeenCalled();

        // Check if updatedAt was added
        const savedDb = (db.writeDb as any).mock.calls[0][0];
        expect(savedDb.products[0].updatedAt).toBeDefined();
    });

    it('should return 500 if database write fails', async () => {
        const req = {
            json: async () => ({ password: DEFAULT_PASS, products: [] })
        } as Request;

        (db.readDb as any).mockResolvedValue({ products: [], history: [] });
        (db.writeDb as any).mockRejectedValue(new Error('DB failure'));

        const response = await POST(req);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe('Failed to update products');
    });
});
