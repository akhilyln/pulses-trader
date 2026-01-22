"use client";

import React, { useMemo, useState, forwardRef, useImperativeHandle, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import {
    AllCommunityModule,
    ModuleRegistry,
    ColDef,
    ValueFormatterParams,
    ICellEditorParams
} from 'ag-grid-community';
import { Save, Plus, Download, Upload, ArrowLeft, Trash2 } from 'lucide-react';
import Link from 'next/link';

// Register all community modules
// Register all community modules
ModuleRegistry.registerModules([AllCommunityModule]);

const generateId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

const DatalistCellEditor = forwardRef((props: ICellEditorParams & { options: string[] }, ref) => {
    // Use a ref to track the value immediately. This avoids async state update delays.
    const valueRef = useRef(props.value || '');
    const inputRef = useRef<HTMLInputElement>(null);

    // We still use state to driver the UI, but getValue relies on the Ref
    const [_, forceUpdate] = useState({});

    useImperativeHandle(ref, () => ({
        getValue: () => valueRef.current,
    }));

    // Focus input when the editor is shown
    React.useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
            // Optional: select all text on focus for easier editing
            inputRef.current.select();
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        valueRef.current = e.target.value;
        forceUpdate({}); // Re-render to show value in input
    };

    const options = props.options || [];
    const listId = `datalist-${props.column.getColId()}`;

    return (
        <div className="w-full h-full p-0">
            <input
                ref={inputRef}
                value={valueRef.current}
                onChange={handleChange}
                list={listId}
                className="w-full h-full bg-zinc-900 text-white border-none outline-none px-2 focus:ring-1 focus:ring-green-500"
            />
            <datalist id={listId}>
                {options.map((opt) => (
                    <option key={opt} value={opt} />
                ))}
            </datalist>
        </div>
    );
});
DatalistCellEditor.displayName = 'DatalistCellEditor';

interface GridRow {
    productId: string;
    productName: string;
    productTeluguName?: string;
    displayOrder?: number;
    brandId: string;
    brandName: string;
    price: number;
    updatedAt: string;
}

interface AdminGridProps {
    initialData: any[];
    onSave: (data: any[]) => void;
}

export const AdminGrid: React.FC<AdminGridProps> = ({ initialData, onSave }) => {
    const gridRef = useRef<AgGridReact>(null);
    const [rowData, setRowData] = useState<GridRow[]>([]);

    const mapInitialData = (data: any[]) => {
        return data.flatMap(p =>
            p.brands.map((b: any) => ({
                productId: p.id,
                productName: p.name,
                productTeluguName: p.teluguName,
                displayOrder: p.displayOrder,
                brandId: b.id,
                brandName: b.name,
                price: b.price,
                updatedAt: b.updatedAt
            }))
        );
    };

    // Initial load and sync on prop change
    React.useEffect(() => {
        if (Array.isArray(initialData)) {
            setRowData(mapInitialData(initialData));
        }
    }, [initialData]);

    const uniqueProducts = useMemo(() => Array.from(new Set(rowData.map(r => r.productName).filter(Boolean))), [rowData]);
    const uniqueTeluguProducts = useMemo(() => Array.from(new Set(rowData.map(r => r.productTeluguName).filter(Boolean))), [rowData]);
    const uniqueBrands = useMemo(() => Array.from(new Set(rowData.map(r => r.brandName).filter(Boolean))), [rowData]);

    const columnDefs = useMemo<ColDef<GridRow>[]>(() => [
        {
            field: 'displayOrder',
            headerName: 'Order',
            editable: true,
            width: 80,
            type: 'numericColumn',
            sort: 'asc',
            valueParser: params => Number(params.newValue)
        },
        {
            field: 'productName',
            headerName: 'Product (EN)',
            editable: true,
            flex: 1,
            cellEditor: DatalistCellEditor,
            cellEditorParams: { options: uniqueProducts }
        },
        {
            field: 'productTeluguName',
            headerName: 'Product (TE)',
            editable: true,
            flex: 1,
            cellEditor: DatalistCellEditor,
            cellEditorParams: { options: uniqueTeluguProducts }
        },
        {
            field: 'brandName',
            headerName: 'Brand',
            editable: true,
            flex: 1,
            cellEditor: DatalistCellEditor,
            cellEditorParams: { options: uniqueBrands }
        },
        {
            field: 'price',
            headerName: 'Price (₹)',
            editable: true,
            type: 'numericColumn',
            valueParser: params => Number(params.newValue),
            valueFormatter: (params: ValueFormatterParams) => params.value ? `₹${Number(params.value).toFixed(2)}` : '₹0.00',
            cellClass: 'font-bold text-green-500'
        },
        {
            field: 'updatedAt',
            headerName: 'Last Updated',
            editable: false,
            valueFormatter: (params: ValueFormatterParams) => params.value ? new Date(params.value).toLocaleString() : 'N/A'
        },
        {
            headerName: 'Actions',
            width: 80,
            cellRenderer: (params: any) => (
                <button
                    onClick={() => handleDeleteRow(params.data)}
                    className="p-1 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors mt-1"
                    title="Delete Row"
                >
                    <Trash2 size={16} />
                </button>
            ),
            editable: false,
            sortable: false,
            filter: false
        }
    ], [uniqueProducts, uniqueTeluguProducts, uniqueBrands]);

    const defaultColDef = useMemo(() => ({
        sortable: true,
        filter: true,
        resizable: true
    }), []);

    const handleDeleteRow = (data: GridRow) => {
        if (confirm(`Are you sure you want to delete ${data.productName} (${data.brandName})?`)) {
            setRowData(prev => prev.filter(r => r.brandId !== data.brandId));
        }
    };

    const handleAddRow = () => {
        const newRow: GridRow = {
            productId: generateId(),
            productName: 'New Product',
            productTeluguName: '',
            displayOrder: rowData.length > 0 ? Math.max(...rowData.map(r => r.displayOrder || 0)) + 1 : 1,
            brandId: generateId(),
            brandName: 'New Brand',
            price: 0,
            updatedAt: new Date().toISOString()
        };
        setRowData([newRow, ...rowData]);
    };

    const handleExportCSV = () => {
        const headers = ['Product (EN)', 'Product (TE)', 'Brand', 'Price'];
        const rows = rowData.map(r => [r.productName, r.productTeluguName || '', r.brandName, r.price]);
        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "pulses_rates.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            const lines = text.split('\n');
            const newRows: GridRow[] = lines.slice(1)
                .filter(line => line.trim() !== '')
                .map(line => {
                    const parts = line.split(',');
                    return {
                        productId: generateId(),
                        productName: parts[0]?.trim() || 'Imported',
                        productTeluguName: parts[1]?.trim() || '',
                        brandId: generateId(),
                        brandName: parts[2]?.trim() || 'Default',
                        price: Number(parts[3]?.trim()) || 0,
                        updatedAt: new Date().toISOString()
                    };
                });

            setRowData([...newRows, ...rowData]);
        };
        reader.readAsText(file);
    };

    const handleSave = () => {
        if (!gridRef.current?.api) return;

        const currentRows: GridRow[] = [];
        gridRef.current.api.forEachNode((node) => {
            if (node.data) currentRows.push(node.data);
        });

        const productMap = new Map();
        currentRows.forEach(row => {
            if (!productMap.has(row.productName)) {
                productMap.set(row.productName, {
                    id: row.productId,
                    name: row.productName,
                    teluguName: row.productTeluguName,
                    displayOrder: Number(row.displayOrder) || 100,
                    brands: []
                });
            }
            productMap.get(row.productName).brands.push({
                id: row.brandId,
                name: row.brandName,
                price: Number(row.price),
                updatedAt: row.updatedAt
            });
        });
        onSave(Array.from(productMap.values()));
    };

    const onCellValueChanged = (event: any) => {
        const { data } = event;
        // Explicitly update the specific row in state using immutable pattern
        setRowData(prevData => prevData.map(row =>
            (row.productId === data.productId && row.brandId === data.brandId)
                ? { ...data }
                : row
        ));
    };

    return (
        <div className="flex flex-col h-[calc(100vh-120px)]">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <h2 className="text-2xl font-black text-white">Rate Manager</h2>
                </div>
                <div className="flex gap-3">
                    <button onClick={handleAddRow} className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-xl transition-all font-bold">
                        <Plus size={18} /> Add Row
                    </button>
                    <label className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-xl transition-all cursor-pointer font-bold">
                        <Upload size={18} /> Import CSV
                        <input type="file" accept=".csv" onChange={handleImportCSV} className="hidden" />
                    </label>
                    <button onClick={handleExportCSV} className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-xl transition-all font-bold">
                        <Download size={18} /> Export CSV
                    </button>
                    <button onClick={handleSave} className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-black font-black px-6 py-2 rounded-xl transition-all shadow-lg shadow-green-500/20">
                        <Save size={18} /> Save Changes
                    </button>
                </div>
            </div>

            <div className="flex-1 ag-theme-alpine-dark rounded-2xl overflow-hidden border border-zinc-800">
                <AgGridReact
                    theme="legacy"
                    ref={gridRef}
                    rowData={rowData}
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                    onCellValueChanged={onCellValueChanged}
                    getRowId={(params) => `${params.data.productId}_${params.data.brandId}`}
                    stopEditingWhenCellsLoseFocus={true}
                    singleClickEdit={true}
                />
            </div>
        </div>
    );
};
