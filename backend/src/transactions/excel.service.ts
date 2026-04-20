import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { Transaction } from './schemas/transaction.schema';

@Injectable()
export class ExcelService {
  async generateTransactionsExcel(transactions: Transaction[]): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Estate Transactions');

    // 1. Define Columns
    worksheet.columns = [
      { header: 'ID', key: '_id', width: 25 },
      { header: 'Date', key: 'createdAt', width: 20 },
      { header: 'Property Address', key: 'propertyAddress', width: 35 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Total Service Fee (TL)', key: 'totalServiceFee', width: 20 },
      { header: 'Agency Earned (TL)', key: 'agencyEarned', width: 20 },
      { header: 'Listing Agent', key: 'listingAgent', width: 20 },
      { header: 'Listing Agent Earned (TL)', key: 'listingAgentEarned', width: 25 },
      { header: 'Selling Agent', key: 'sellingAgent', width: 20 },
      { header: 'Selling Agent Earned (TL)', key: 'sellingAgentEarned', width: 25 },
    ];

    // 2. Styling Header
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '2563EB' } // Blue Primary
    };

    // 3. Add Data
    transactions.forEach((t: any) => {
      worksheet.addRow({
        _id: t._id.toString(),
        createdAt: t.createdAt ? new Date(t.createdAt).toLocaleDateString('en-US') : 'N/A',
        propertyAddress: t.propertyAddress,
        status: t.status.toUpperCase().replace('_', ' '),
        totalServiceFee: t.financialBreakdown?.totalServiceFee || 0,
        agencyEarned: t.financialBreakdown?.agencyEarned || 0,
        listingAgent: t.listingAgent,
        listingAgentEarned: t.financialBreakdown?.listingAgentEarned || 0,
        sellingAgent: t.sellingAgent,
        sellingAgentEarned: t.financialBreakdown?.sellingAgentEarned || 0,
      });
    });

    // 4. Formatting Numbers
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        [5, 6, 8, 10].forEach(col => {
          row.getCell(col).numFmt = '#,##0.00 "TL"';
        });
      }
    });

    return (await workbook.xlsx.writeBuffer()) as unknown as Buffer;
  }
}
