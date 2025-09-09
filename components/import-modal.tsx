"use client"

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  UploadIcon, 
  FileSpreadsheetIcon, 
  LoaderIcon, 
  CheckCircleIcon, 
  AlertCircleIcon,
  DownloadIcon,
  FileTextIcon
} from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

interface ImportResult {
  success: number;
  failed: number;
  errors: Array<{
    row: number;
    error: string;
    data?: any;
  }>;
}

interface ImportModalProps {
  onImportComplete?: () => void;
}

export function ImportModal({ onImportComplete }: ImportModalProps) {
  const [open, setOpen] = React.useState(false);
  const [file, setFile] = React.useState<File | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [result, setResult] = React.useState<ImportResult | null>(null);
  const [dragActive, setDragActive] = React.useState(false);

  const handleFileChange = (selectedFile: File | null) => {
    setFile(selectedFile);
    setResult(null);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (isValidFileType(droppedFile)) {
        handleFileChange(droppedFile);
      } else {
        toast.error('Invalid file type. Please upload Excel (.xlsx, .xls) or CSV file.');
      }
    }
  };

  const isValidFileType = (file: File) => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];
    return allowedTypes.includes(file.type);
  };

  const handleImport = async () => {
    if (!file) {
      toast.error('Please select a file to import');
      return;
    }

    setUploading(true);
    const loadingToast = toast.loading('Importing data...');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/v1/konsultasi/admin/import', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Import failed');
      }

      setResult(data.result);
      
      toast.dismiss(loadingToast);
      toast.success(`Import completed! ${data.result.success} records imported successfully.`);
      
      if (onImportComplete) {
        onImportComplete();
      }

    } catch (error) {
      console.error('Import error:', error);
      toast.dismiss(loadingToast);
      toast.error(error instanceof Error ? error.message : 'Import failed');
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const templateData = [
      {
        nama_lengkap: 'John Doe',
        nomor_telepon: '081234567890',
        instansi_organisasi: 'Pemkot Jakarta',
        asal_kota_kabupaten: 'Jakarta Pusat',
        asal_provinsi: 'DKI Jakarta',
        uraian_kebutuhan_konsultasi: 'Membutuhkan konsultasi untuk implementasi SPBE',
        skor_indeks_spbe: 2.5,
        kondisi_implementasi_spbe: 'Belum optimal',
        fokus_tujuan: 'Meningkatkan layanan digital',
        mekanisme_konsultasi: 'Online',
        kategori: 'tata kelola',
        status: 'new',
        pic_name: 'Safira',
        unit_names: 'Tim Akselerasi Pemerintah Daerah,Tim Smart City',
        topik_names: 'Arsitektur, Tata Kelola, Regulasi, dan Kebijakan',
        solusi: 'Implementasi tahap pertama',
        timestamp: '2024-01-15 10:30:00'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'template_import_konsultasi.xlsx');
    
    toast.success('Template downloaded successfully');
  };

  const downloadErrors = () => {
    if (!result?.errors.length) return;

    const ws = XLSX.utils.json_to_sheet(result.errors);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Import Errors');
    XLSX.writeFile(wb, 'import_errors.xlsx');
    
    toast.success('Error report downloaded');
  };

  const resetModal = () => {
    setFile(null);
    setResult(null);
    setUploading(false);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) {
        resetModal();
      }
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="text-xs gap-2">
          <UploadIcon className="size-1" />
          Import Data
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Import Konsultasi SPBE</DialogTitle>
          <DialogDescription>
            Upload file Excel atau CSV untuk mengimpor data konsultasi secara massal.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Template Download */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <FileTextIcon className="size-4 text-muted-foreground" />
              <span className="text-sm font-medium">Template Import</span>
            </div>
            <Button variant="outline" size="sm" onClick={downloadTemplate}>
              <DownloadIcon className="size-4 mr-1" />
              Download
            </Button>
          </div>

          {/* File Upload Area */}
          <div
            className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-muted-foreground/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="file-upload"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              accept=".xlsx,.xls,.csv"
              onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
              disabled={uploading}
            />
            
            <div className="space-y-2">
              <FileSpreadsheetIcon className="size-8 mx-auto text-muted-foreground" />
              {file ? (
                <div className="space-y-1">
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    Drop your file here, or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Supports Excel (.xlsx, .xls) and CSV files
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Import Result */}
          {result && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                  <CheckCircleIcon className="size-4 text-green-600" />
                  <div>
                    <div className="text-sm font-medium text-green-800">Success</div>
                    <div className="text-xs text-green-600">{result.success} records</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
                  <AlertCircleIcon className="size-4 text-red-600" />
                  <div>
                    <div className="text-sm font-medium text-red-800">Failed</div>
                    <div className="text-xs text-red-600">{result.failed} records</div>
                  </div>
                </div>
              </div>

              {result.errors.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Import Errors</Label>
                    <Button variant="outline" size="sm" onClick={downloadErrors}>
                      <DownloadIcon className="size-3 mr-1" />
                      Download
                    </Button>
                  </div>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {result.errors.slice(0, 5).map((error, index) => (
                      <Alert key={index} className="py-2">
                        <AlertDescription className="text-xs">
                          <span className="font-medium">Row {error.row}:</span> {error.error}
                        </AlertDescription>
                      </Alert>
                    ))}
                    {result.errors.length > 5 && (
                      <div className="text-xs text-muted-foreground text-center py-1">
                        +{result.errors.length - 5} more errors...
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={uploading}
          >
            {result ? 'Close' : 'Cancel'}
          </Button>
          {!result && (
            <Button
              onClick={handleImport}
              disabled={!file || uploading}
            >
              {uploading ? (
                <>
                  <LoaderIcon className="size-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <UploadIcon className="size-4 mr-2" />
                  Import
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}