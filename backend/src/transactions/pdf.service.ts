import { Injectable } from '@nestjs/common';
import { join } from 'path';
import { CommissionPolicy } from './constants/transaction.constants';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const PDFDocument = require('pdfkit');

@Injectable()
export class PdfService {
  async generateTransactionPdf(transaction: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const fontPath = join(process.cwd(), 'src', 'fonts');
        const regularFont = join(fontPath, 'Roboto-Regular.ttf');
        const boldFont = join(fontPath, 'Roboto-Bold.ttf');
        const italicFont = join(fontPath, 'Roboto-Italic.ttf');

        const doc = new PDFDocument({
          size: 'A4',
          margin: 50,
          info: { Title: `Settlement_Report_${transaction._id}` }
        });

        const chunks: Buffer[] = [];
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', (err) => reject(err));

        // --- PDF CONTENT ---

        // Header (Company Identity)
        doc.fillColor('#2563eb').font(boldFont).fontSize(24).text('ESTATE FINANCE', { align: 'left' });
        doc.fillColor('#9ca3af').fontSize(8).font(regularFont).text('Corporate Real Estate Transaction Management System', { align: 'left' });
        doc.moveDown(0.5);
        doc.fillColor('black').font(boldFont).fontSize(14).text('TRANSACTION SETTLEMENT REPORT', { align: 'right' });
        doc.moveDown(1.5);

        // General Info Box
        doc.rect(50, doc.y, 495, 60).fill('#f8fafc');
        doc.fillColor('black').font(boldFont).fontSize(10).text('REPORT DETAILS', 60, doc.y + 10);
        doc.font(regularFont).fontSize(9).text(`Reference ID: ${transaction._id}`, 60, doc.y + 15);
        doc.text(`Generated Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 250, doc.y - 12);
        doc.text(`Status: ${transaction.status.toUpperCase().replace('_', ' ')}`, 60, doc.y + 5);
        doc.moveDown(4);

        // Property Information
        doc.font(boldFont).fontSize(11).text('PROPERTY INFORMATION');
        doc.moveTo(50, doc.y + 5).lineTo(545, doc.y + 5).stroke('#e2e8f0');
        doc.moveDown(1);
        doc.font(regularFont).fontSize(10).text(`Address: ${transaction.propertyAddress}`);
        doc.moveDown(2);

        // Process Timeline
        doc.font(boldFont).fontSize(11).text('PROCESS TIMELINE');
        doc.moveTo(50, doc.y + 5).lineTo(545, doc.y + 5).stroke('#e2e8f0');
        doc.moveDown(1);

        const stageDates = transaction.stageDates || {};
        const formatStageDate = (date: any) => date ? new Date(date).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Pending';

        doc.font(regularFont).fontSize(9);
        doc.text(`1. Agreement: ${formatStageDate(stageDates.agreement)}`);
        doc.text(`2. Earnest Money: ${formatStageDate(stageDates.earnest_money)}`);
        doc.text(`3. Title Deed: ${formatStageDate(stageDates.title_deed)}`);
        doc.text(`4. Completed: ${formatStageDate(stageDates.completed)}`);
        doc.moveDown(2);

        // FINANCIAL SETTLEMENT TABLE
        doc.font(boldFont).fontSize(11).text('FINANCIAL SETTLEMENT');
        doc.moveDown(0.5);

        // Table Header
        const startY = doc.y;
        doc.rect(50, startY, 495, 20).fill('#2563eb');
        doc.fillColor('white').font(boldFont).fontSize(9);
        doc.text('Description', 60, startY + 6);
        doc.text('Calculated Amount', 400, startY + 6, { width: 135, align: 'right' });

        // Table Rows
        doc.fillColor('black').font(regularFont);
        let currentY = startY + 20;

        // Use rates from the appliedPolicy snapshot stored AT creation time.
        // For legacy records (no snapshot): reverse-calculate from the saved amounts
        // so the labels always match the actual numbers — never the live policy.
        const snap = transaction.financialBreakdown?.appliedPolicy;
        const fb   = transaction.financialBreakdown;
        const total = transaction.totalServiceFee || 1; // avoid /0

        const agencyPct = snap
          ? Math.round(snap.agencyShare * 100)
          : Math.round(((fb?.agencyEarned ?? 0) / total) * 100);

        const agentTotal = fb?.totalAgentEarned ?? ((fb?.listingAgentEarned ?? 0) + (fb?.sellingAgentEarned ?? 0));
        const agentPct = snap
          ? Math.round(snap.agentShare * 100)
          : Math.round((agentTotal / total) * 100);

        const splitPct = snap
          ? Math.round(snap.splitRatio * 100)
          : Math.round(((fb?.listingAgentEarned ?? 0) / total) * 100);

        const rows: any[] = [
          { desc: 'Total Gross Service Fee', val: transaction.totalServiceFee },
          { desc: `Agency Share (${agencyPct}%)`, val: transaction.financialBreakdown?.agencyEarned, highlight: true },
        ];

        if (transaction.financialBreakdown?.isSingleAgent) {
          rows.push({ desc: `Agent Portion — Listing & Selling (${agentPct}%): ${transaction.listingAgent}`, val: transaction.financialBreakdown?.totalAgentEarned || transaction.financialBreakdown?.listingAgentEarned });
        } else {
          rows.push({ desc: `Listing Agent (${splitPct}%): ${transaction.listingAgent}`, val: transaction.financialBreakdown?.listingAgentEarned });
          rows.push({ desc: `Selling Agent (${splitPct}%): ${transaction.sellingAgent}`, val: transaction.financialBreakdown?.sellingAgentEarned });
        }

        rows.forEach((row, index) => {
          doc.rect(50, currentY, 495, 20).fill(index % 2 === 0 ? 'white' : '#f8fafc');
          doc.fillColor(row.highlight ? '#2563eb' : 'black');
          if (row.highlight) doc.font(boldFont); else doc.font(regularFont);

          doc.text(row.desc, 60, currentY + 6);
          doc.text(`${row.val?.toLocaleString()} TL`, 400, currentY + 6, { width: 135, align: 'right' });
          currentY += 20;
        });

        doc.moveDown(3);

        // Audit Log
        doc.font(boldFont).fontSize(10).text('CALCULATION METHODOLOGY');
        // calculationLog is generated by CommissionPolicy.describe() on the backend — no hard-coded strings here
        doc.font(italicFont).fontSize(9).fillColor('#4b5563').text(transaction.financialBreakdown?.calculationLog || CommissionPolicy.describe(transaction.financialBreakdown?.isSingleAgent ?? false));
        doc.moveDown(4);

        // Signature Section
        const sigY = doc.y;
        doc.strokeColor('#e2e8f0').moveTo(50, sigY).lineTo(200, sigY).stroke();
        doc.moveTo(395, sigY).lineTo(545, sigY).stroke();

        doc.fillColor('black').font(regularFont).fontSize(8);
        doc.text('Agent Signature', 50, sigY + 5, { width: 150, align: 'center' });
        doc.text('Agency Approval (Official)', 395, sigY + 5, { width: 150, align: 'center' });

        // Footer
        doc.font(regularFont).fontSize(7).fillColor('#9ca3af').text(
          'This is a computer-generated document from Estate Finance Management System. No manual signature required if electronically stamped.',
          50, 780, { align: 'center' }
        );

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}
