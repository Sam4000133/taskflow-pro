import { jsPDF } from 'jspdf';
import Papa from 'papaparse';
import { format } from 'date-fns';
import type { Task } from './types';

interface ExportTask {
  title: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  assignee: string;
  creator: string;
  dueDate: string;
  createdAt: string;
}

function formatTasksForExport(tasks: Task[]): ExportTask[] {
  return tasks.map((task) => ({
    title: task.title,
    description: task.description || '',
    status: task.status,
    priority: task.priority,
    category: task.category?.name || '',
    assignee: task.assignee?.name || 'Unassigned',
    creator: task.creator?.name || '',
    dueDate: task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : '',
    createdAt: format(new Date(task.createdAt), 'yyyy-MM-dd'),
  }));
}

export function exportToCSV(tasks: Task[], filename = 'tasks'): void {
  const data = formatTasksForExport(tasks);
  const csv = Papa.unparse(data, {
    header: true,
    columns: [
      'title',
      'description',
      'status',
      'priority',
      'category',
      'assignee',
      'creator',
      'dueDate',
      'createdAt',
    ],
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportToPDF(tasks: Task[], filename = 'tasks'): void {
  const doc = new jsPDF();
  const data = formatTasksForExport(tasks);

  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('TaskFlow Pro - Tasks Report', 14, 20);

  // Metadata
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${format(new Date(), 'PPpp')}`, 14, 28);
  doc.text(`Total Tasks: ${tasks.length}`, 14, 34);

  // Summary stats
  const todoCount = tasks.filter((t) => t.status === 'TODO').length;
  const inProgressCount = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const doneCount = tasks.filter((t) => t.status === 'DONE').length;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Summary', 14, 46);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`To Do: ${todoCount} | In Progress: ${inProgressCount} | Done: ${doneCount}`, 14, 52);

  // Tasks table
  let yPosition = 66;
  const lineHeight = 7;
  const pageHeight = doc.internal.pageSize.height;
  const marginBottom = 20;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Tasks', 14, yPosition);
  yPosition += lineHeight;

  // Table header
  doc.setFontSize(9);
  doc.setFillColor(240, 240, 240);
  doc.rect(14, yPosition - 4, 182, 8, 'F');
  doc.text('Title', 16, yPosition);
  doc.text('Status', 80, yPosition);
  doc.text('Priority', 110, yPosition);
  doc.text('Due Date', 140, yPosition);
  doc.text('Assignee', 170, yPosition);
  yPosition += lineHeight;

  // Table rows
  doc.setFont('helvetica', 'normal');
  data.forEach((task, index) => {
    if (yPosition > pageHeight - marginBottom) {
      doc.addPage();
      yPosition = 20;
    }

    // Alternate row background
    if (index % 2 === 0) {
      doc.setFillColor(250, 250, 250);
      doc.rect(14, yPosition - 4, 182, 7, 'F');
    }

    // Truncate long titles
    const title = task.title.length > 35 ? task.title.substring(0, 32) + '...' : task.title;
    const assignee = task.assignee.length > 12 ? task.assignee.substring(0, 9) + '...' : task.assignee;

    doc.text(title, 16, yPosition);
    doc.text(task.status, 80, yPosition);
    doc.text(task.priority, 110, yPosition);
    doc.text(task.dueDate || '-', 140, yPosition);
    doc.text(assignee, 170, yPosition);

    yPosition += lineHeight;
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Page ${i} of ${pageCount} - TaskFlow Pro`,
      doc.internal.pageSize.width / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  doc.save(`${filename}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}
