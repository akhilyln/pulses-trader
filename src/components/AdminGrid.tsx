"use client";

import React, { useMemo, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import {
    AllCommunityModule,
    ModuleRegistry,
    ColDef,
    ValueFormatterParams
} from 'ag-grid-community';
import { Save, Plus, Download, Upload, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// Register all community modules
ModuleRegistry.registerModules([AllCommunityModule]);

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
    const [rowData, setRowData] = useState<GridRow[]>(() => {
        return initialData.flatMap(p =>
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
    });

    const columnDefs = useMemo<ColDef<GridRow>[]>(() => [
        {
            field: 'displayOrder',
            headerName: 'Order',
            editable: true,
            width: 80,
            type: 'numericColumn',
            sort: 'asc'
        },
        { field: 'productName', headerName: 'Product (EN)', editable: true, flex: 1 },
        { field: 'productTeluguName', headerName: 'Product (TE)', editable: true, flex: 1 },
        { field: 'brandName', headerName: 'Brand', editable: true, flex: 1 },
        {
            field: 'price',
            headerName: 'Price (₹)',
            editable: true,
            type: 'numericColumn',
            valueFormatter: (params: ValueFormatterParams) => params.value ? `₹${Number(params.value).toFixed(2)}` : '₹0.00',
            cellClass: 'font-bold text-green-500'
        },
        {
            field: 'updatedAt',
            headerName: 'Last Updated',
            editable: false,
            valueFormatter: (params: ValueFormatterParams) => params.value ? new Date(params.value).toLocaleString() : 'N/A'
        }
    ], []);

    const defaultColDef = useMemo(() => ({
        sortable: true,
        filter: true,
        resizable: true
    }), []);

    const handleAddRow = () => {
        const newRow: GridRow = {
            productId: `p-${Date.now()}`,
            productName: 'New Product',
            productTeluguName: '',
            displayOrder: rowData.length > 0 ? Math.max(...rowData.map(r => r.displayOrder || 0)) + 1 : 1,
            brandId: `b-${Date.now()}`,
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
                        productId: `p-${Date.now()}-${Math.random()}`,
                        productName: parts[0]?.trim() || 'Imported',
                        productTeluguName: parts[1]?.trim() || '',
                        brandId: `b-${Date.now()}-${Math.random()}`,
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
        const productMap = new Map();
        rowData.forEach(row => {
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
                    rowData={rowData}
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                />
            </div>
        </div>
    );
};
