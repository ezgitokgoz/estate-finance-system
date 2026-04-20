import { Controller, Get, Post, Body, Patch, Param, Res, NotFoundException, Query } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { PdfService } from './pdf.service';
import { ExcelService } from './excel.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { TransactionStatus } from './constants/transaction.constants';

@ApiTags('transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly pdfService: PdfService,
    private readonly excelService: ExcelService,
  ) { }

  @Post()
  @ApiOperation({ summary: 'Create a new real estate transaction' })
  @ApiResponse({ status: 201, description: 'The transaction has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  create(@Body() createTransactionDto: CreateTransactionDto) {
    return this.transactionsService.create(createTransactionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all transactions with pagination and filters' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'sort', required: false, type: String })
  async getAll(
    @Query('limit') limit: number,
    @Query('skip') skip: number,
    @Query('search') search: string,
    @Query('status') status: string,
    @Query('sort') sort: string
  ) {
    return this.transactionsService.findAll(
      Number(limit) || 10,
      Number(skip) || 0,
      search,
      status,
      sort
    );
  }

  @Get('export/excel')
  @ApiOperation({ summary: 'Export filtered transactions to Excel' })
  async exportExcel(
    @Query('search') search: string,
    @Query('status') status: string,
    @Res() res: Response
  ) {
    const result = await this.transactionsService.findAll(1000, 0, search, status);
    const buffer = await this.excelService.generateTransactionsExcel(result.data);

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=Transactions_Report.xlsx',
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single transaction by ID' })
  findOne(@Param('id') id: string) {
    return this.transactionsService.findOne(id);
  }

  @Patch(':id/stage')
  @ApiOperation({ summary: 'Update transaction stage manually' })
  updateStage(@Param('id') id: string, @Body('status') status: TransactionStatus) {
    return this.transactionsService.updateStage(id, status);
  }

  @Patch(':id/transition')
  @ApiOperation({ summary: 'Transition transaction to the next logical stage' })
  async transition(@Param('id') id: string) {
    return this.transactionsService.transition(id);
  }

  @Get(':id/pdf')
  @ApiOperation({ summary: 'Generate and download PDF report for a transaction' })
  @ApiResponse({ status: 200, description: 'PDF file generated successfully.' })
  async downloadPdf(@Param('id') id: string, @Res() res: Response) {
    try {
      const transaction = await this.transactionsService.findOne(id);
      if (!transaction) {
        throw new NotFoundException('İşlem bulunamadı');
      }

      const buffer = await this.pdfService.generateTransactionPdf(transaction);

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=Settlement_Report_${id}.pdf`,
        'Content-Length': buffer.length,
      });

      res.end(buffer);
    } catch (error: any) {
      res.status(500).json({ message: 'PDF generated error', error: error.message });
    }
  }
}
