import { describe, it, expect } from 'vitest';

// Minimal test to verify Vitest is working
describe('Math', () => {
    it('should add numbers correctly', () => {
        expect(1 + 1).toBe(2);
    });
});

// Test for ID generator if possible
const generateId = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

describe('Utility Functions', () => {
    it('should generate a valid looking ID', () => {
        const id = generateId();
        expect(id).toMatch(/^[a-f0-9x-]+$/);
        expect(id.length).toBe(36);
    });
});
