import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AdminGrid } from '../AdminGrid';

// Mock lucide-react
vi.mock('lucide-react', () => ({
    Save: () => <div data-testid="save-icon" />,
    Plus: () => <div data-testid="plus-icon" />,
    Download: () => <div data-testid="download-icon" />,
    Upload: () => <div data-testid="upload-icon" />,
    ArrowLeft: () => <div data-testid="arrow-left-icon" />,
    Trash2: () => <div data-testid="trash-icon" />,
}));

// Mock next/link
vi.mock('next/link', () => ({
    default: ({ children }: { children: React.ReactNode }) => <a>{children}</a>,
}));

// Mock AgGridReact
const mockAgGridApi = {
    forEachNode: vi.fn(),
};

vi.mock('ag-grid-react', () => ({
    AgGridReact: React.forwardRef((props: any, ref: any) => {
        // Expose mock API through ref
        React.useImperativeHandle(ref, () => ({
            api: {
                forEachNode: (callback: any) => {
                    props.rowData.forEach((data: any) => callback({ data }));
                }
            }
        }));
        // Store props for testing logic handlers
        (AgGridReact as any).lastProps = props;
        return <div data-testid="ag-grid" />;
    }),
}));

import { AgGridReact } from 'ag-grid-react';

describe('AdminGrid Component', () => {
    const mockInitialData = [
        {
            id: 'p1',
            name: 'Toor Dal',
            teluguName: 'కంది పప్పు',
            displayOrder: 1,
            brands: [
                { id: 'b1', name: 'Brand A', price: 100, updatedAt: '2023-01-01' },
                { id: 'b2', name: 'Brand B', price: 110, updatedAt: '2023-01-01' }
            ]
        }
    ];

    const mockOnSave = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should correctly map initial data to flat rows', () => {
        render(<AdminGrid initialData={mockInitialData} onSave={mockOnSave} />);

        const gridProps = (AgGridReact as any).lastProps;
        expect(gridProps.rowData).toHaveLength(2);
        expect(gridProps.rowData[0].productName).toBe('Toor Dal');
        expect(gridProps.rowData[0].brandName).toBe('Brand A');
        expect(gridProps.rowData[1].brandName).toBe('Brand B');
    });

    it('should maintain row independence on cell value change', async () => {
        render(<AdminGrid initialData={mockInitialData} onSave={mockOnSave} />);

        let gridProps = (AgGridReact as any).lastProps;
        const onCellValueChanged = gridProps.onCellValueChanged;

        // Simulate changing "Toor Dal" to "Yellow Dal" for ONLY the first row (Brand A)
        await act(async () => {
            onCellValueChanged({
                data: gridProps.rowData[0],
                colDef: { field: 'productName' },
                newValue: 'Yellow Dal',
                oldValue: 'Toor Dal'
            });
        });

        // Get updated props
        gridProps = (AgGridReact as any).lastProps;
        const updatedRowData = gridProps.rowData;

        expect(updatedRowData[0].productName).toBe('Yellow Dal');
        expect(updatedRowData[1].productName).toBe('Toor Dal'); // Should NOT change!
    });

    it('should group rows with identical product names into one product on save', async () => {
        render(<AdminGrid initialData={mockInitialData} onSave={mockOnSave} />);

        const saveButton = screen.getByText(/Save Changes/i);
        await act(async () => {
            fireEvent.click(saveButton);
        });

        expect(mockOnSave).toHaveBeenCalledTimes(1);
        const savedData = mockOnSave.mock.calls[0][0];

        // Even though we had 2 rows in the grid, they should be grouped into 1 product
        expect(savedData).toHaveLength(1);
        expect(savedData[0].name).toBe('Toor Dal');
        expect(savedData[0].brands).toHaveLength(2);
    });

    it('should separate products if names are edited to be different', async () => {
        render(<AdminGrid initialData={mockInitialData} onSave={mockOnSave} />);

        let gridProps = (AgGridReact as any).lastProps;

        // Change the second row's product name to something else
        await act(async () => {
            gridProps.onCellValueChanged({
                data: gridProps.rowData[1],
                colDef: { field: 'productName' },
                newValue: 'Chana Dal',
                oldValue: 'Toor Dal'
            });
        });

        const saveButton = screen.getByText(/Save Changes/i);
        await act(async () => {
            fireEvent.click(saveButton);
        });

        const savedData = mockOnSave.mock.calls[0][0];

        // Now it should be 2 separate products
        expect(savedData).toHaveLength(2);
        expect(savedData.find((p: any) => p.name === 'Toor Dal')).toBeDefined();
        expect(savedData.find((p: any) => p.name === 'Chana Dal')).toBeDefined();
    });
});
