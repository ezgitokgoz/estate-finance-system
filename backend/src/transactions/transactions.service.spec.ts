import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsService } from './transactions.service';
import { getModelToken } from '@nestjs/mongoose';
import { Transaction } from './schemas/transaction.schema';
import { TransactionStatus } from './constants/transaction.constants';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let model: any;

  const mockTransaction = (dto: any) => ({
    ...dto,
    _id: 'mockId',
    save: jest.fn().mockResolvedValue({ _id: 'mockId', ...dto }),
  });

  const mockTransactionModel = jest.fn().mockImplementation((dto) => mockTransaction(dto));
  (mockTransactionModel as any).find = jest.fn();
  (mockTransactionModel as any).findById = jest.fn();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: getModelToken(Transaction.name),
          useValue: mockTransactionModel,
        },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
    model = module.get(getModelToken(Transaction.name));
  });

  describe('Commission Rules (4.3)', () => {
    it('Scenario 1: Same agent receives 100% of agent portion (50% total)', async () => {
      const dto = {
        propertyAddress: '123 Main St',
        totalServiceFee: 10000,
        listingAgent: 'John Doe',
        sellingAgent: 'John Doe',
      };

      const result = await service.create(dto as any);

      expect(result.financialBreakdown.agencyEarned).toBe(5000); // 50%
      expect(result.financialBreakdown.listingAgentEarned).toBe(5000); // 50%
      expect(result.financialBreakdown.sellingAgentEarned).toBe(0);
    });

    it('Scenario 2: Different agents share agent portion equally (25% each total)', async () => {
      const dto = {
        propertyAddress: '456 Oak Ave',
        totalServiceFee: 10000,
        listingAgent: 'John Doe',
        sellingAgent: 'Jane Smith',
      };

      const result = await service.create(dto as any);

      expect(result.financialBreakdown.agencyEarned).toBe(5000); // 50%
      expect(result.financialBreakdown.listingAgentEarned).toBe(2500); // 25%
      expect(result.financialBreakdown.sellingAgentEarned).toBe(2500); // 25%
    });
  });

  describe('Stage Transitions (4.1)', () => {
    it('should initialize transaction in agreement stage', async () => {
      const dto = {
        propertyAddress: '789 Pine Rd',
        totalServiceFee: 1000,
        listingAgent: 'Agent A',
        sellingAgent: 'Agent B',
      };

      const result = await service.create(dto as any);
      expect(result.status).toBe(TransactionStatus.AGREEMENT);
    });

    it('should transition to next stage logically (agreement -> earnest_money)', async () => {
      const existing = {
        _id: '123',
        status: TransactionStatus.AGREEMENT,
        markModified: jest.fn(),
        save: jest.fn().mockImplementation(function() { return Promise.resolve(this); })
      };
      model.findById.mockResolvedValue(existing);

      const result = await service.transition('123');
      expect(result.status).toBe(TransactionStatus.EARNEST_MONEY);
      expect(existing.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException for backward transition', async () => {
      const existing = {
        _id: '123',
        status: TransactionStatus.TITLE_DEED,
      };
      model.findById.mockResolvedValue(existing);

      await expect(
        service.updateStage('123', TransactionStatus.AGREEMENT)
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for skipping stages (agreement -> title_deed)', async () => {
      const existing = {
        _id: '123',
        status: TransactionStatus.AGREEMENT,
      };
      model.findById.mockResolvedValue(existing);

      await expect(
        service.updateStage('123', TransactionStatus.TITLE_DEED)
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if transaction does not exist', async () => {
      model.findById.mockResolvedValue(null);

      await expect(service.transition('invalid')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if transition is attempted on a completed transaction (immutability)', async () => {
      const existing = {
        _id: '123',
        status: TransactionStatus.COMPLETED,
        markModified: jest.fn(),
        save: jest.fn(),
      };
      model.findById.mockResolvedValue(existing);

      await expect(service.transition('123')).rejects.toThrow(BadRequestException);
      await expect(service.updateStage('123', TransactionStatus.TITLE_DEED)).rejects.toThrow(BadRequestException);
    });
  });
});
