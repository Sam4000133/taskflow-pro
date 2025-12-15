'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import { exportToCSV, exportToPDF } from '@/lib/export';
import { toast } from 'sonner';
import type { Task } from '@/lib/types';

interface ExportButtonProps {
  tasks: Task[];
  disabled?: boolean;
}

export function ExportButton({ tasks, disabled }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportCSV = () => {
    if (tasks.length === 0) {
      toast.error('No tasks to export');
      return;
    }
    setIsExporting(true);
    try {
      exportToCSV(tasks);
      toast.success('Exported to CSV');
    } catch (error) {
      toast.error('Failed to export CSV');
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = () => {
    if (tasks.length === 0) {
      toast.error('No tasks to export');
      return;
    }
    setIsExporting(true);
    try {
      exportToPDF(tasks);
      toast.success('Exported to PDF');
    } catch (error) {
      toast.error('Failed to export PDF');
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={disabled || isExporting}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportCSV}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportPDF}>
          <FileText className="mr-2 h-4 w-4" />
          Export as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
