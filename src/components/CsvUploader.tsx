import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, FileSpreadsheet, Check, AlertCircle } from 'lucide-react';
import Papa from 'papaparse';

interface CsvUploaderProps {
  onImport: (data: any[]) => void;
  onCancel: () => void;
  expectedHeaders: string[];
  title: string;
}

export const CsvUploader: React.FC<CsvUploaderProps> = ({ onImport, onCancel, expectedHeaders, title }) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.csv')) {
        setError('Please upload a valid CSV file.');
        return;
      }
      setFile(selectedFile);
      setError(null);
      
      Papa.parse(selectedFile, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            setError(`Error parsing CSV: ${results.errors[0].message}`);
            return;
          }
          if (results.meta.fields) {
            setHeaders(results.meta.fields);
          }
          setParsedData(results.data);
        },
        error: (err: Error) => {
          setError(err.message);
        }
      });
    }
  };

  const handleImport = () => {
    if (parsedData.length === 0) return;
    // Map parsed data to ensure only expected fields are included and missing ones are null
    const mappedData = parsedData.map(row => {
      const newRow: any = {};
      expectedHeaders.forEach(header => {
        // If the header exists in the CSV, map it, otherwise null
        newRow[header] = row[header] !== undefined && row[header] !== '' ? row[header] : null;
      });
      return newRow;
    });
    
    onImport(mappedData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-xl p-6 w-full max-w-2xl shadow-2xl border border-border flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Import {title}</h3>
              <p className="text-xs text-muted-foreground">Upload a CSV file to bulk import records</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onCancel} className="h-8 w-8 p-0 rounded-full">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {!file ? (
          <div 
            className="border-2 border-dashed border-border rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 hover:border-primary/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-10 h-10 text-muted-foreground mb-4" />
            <h4 className="font-semibold mb-1">Click to upload CSV</h4>
            <p className="text-xs text-muted-foreground max-w-sm">
              The CSV should include the following headers:<br/>
              <span className="font-mono text-primary bg-primary/10 px-1 py-0.5 rounded mt-2 inline-block">
                {expectedHeaders.join(', ')}
              </span>
            </p>
            <input 
              type="file" 
              accept=".csv" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileUpload} 
            />
          </div>
        ) : (
          <div className="flex-1 overflow-hidden flex flex-col min-h-0">
            {error ? (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between p-3 bg-muted/30 border border-border rounded-lg mb-4">
                  <div className="flex items-center gap-2">
                    <Check className="text-emerald-500 w-5 h-5" />
                    <div>
                      <p className="text-sm font-semibold">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{parsedData.length} records found</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => { setFile(null); setParsedData([]); setHeaders([]); }}>
                    Change File
                  </Button>
                </div>
                
                <div className="flex-1 overflow-auto border border-border rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-muted sticky top-0">
                      <tr>
                        {expectedHeaders.map(h => (
                          <th key={h} className="px-4 py-2 text-left font-medium text-xs uppercase tracking-wider">
                            {h}
                            {!headers.includes(h) && (
                              <span className="ml-2 text-[10px] text-destructive bg-destructive/10 px-1 rounded">Missing</span>
                            )}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {parsedData.slice(0, 10).map((row, i) => (
                        <tr key={i} className="hover:bg-muted/50">
                          {expectedHeaders.map(h => (
                            <td key={h} className="px-4 py-2 truncate max-w-[150px]">
                              {row[h] || '-'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {parsedData.length > 10 && (
                  <p className="text-xs text-center text-muted-foreground mt-2 font-medium">
                    Showing 10 of {parsedData.length} records
                  </p>
                )}
              </>
            )}
          </div>
        )}

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            onClick={handleImport} 
            disabled={!file || !!error || parsedData.length === 0}
            className="btn-maritime"
          >
            Import {parsedData.length > 0 ? parsedData.length : ''} Records
          </Button>
        </div>
      </div>
    </div>
  );
};
