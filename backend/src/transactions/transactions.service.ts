import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transaction, TransactionDocument } from './schemas/transaction.schema';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { TransactionStatus, CommissionPolicy, TRANSACTION_STATUS_ORDER } from './constants/transaction.constants';

import { toTitleCase, generateTurkishRegex } from '../common/utils/string.utils';

@Injectable()
export class TransactionsService {

  constructor(
    @InjectModel(Transaction.name) private transactionModel: Model<TransactionDocument>,
  ) { }


  async create(createDto: CreateTransactionDto): Promise<Transaction> {
    const totalServiceFee = createDto.totalServiceFee;
    const propertyAddress = toTitleCase(createDto.propertyAddress);
    const listingAgent = toTitleCase(createDto.listingAgent);
    const sellingAgent = toTitleCase(createDto.sellingAgent);

    // Apply single-source-of-truth commission policy rates
    const agencyEarned = totalServiceFee * CommissionPolicy.AGENCY_SHARE;
    const totalAgentPortion = totalServiceFee * CommissionPolicy.AGENT_SHARE;

    let listingAgentEarned = 0;
    let sellingAgentEarned = 0;

    const isSingleAgent = listingAgent === sellingAgent;

    if (isSingleAgent) {
      listingAgentEarned = totalAgentPortion;
    } else {
      // Co-Agent split: Allocate predefined SPLIT_RATIO (derived from AGENT_SHARE) to both listing and selling agents
      listingAgentEarned = totalServiceFee * CommissionPolicy.SPLIT_RATIO;
      sellingAgentEarned = totalServiceFee * CommissionPolicy.SPLIT_RATIO;
    }

    const newTransaction = new this.transactionModel({
      ...createDto,
      propertyAddress,
      listingAgent,
      sellingAgent,
      status: TransactionStatus.AGREEMENT,
      stageDates: { agreement: new Date() },
      financialBreakdown: {
        totalServiceFee,
        agencyEarned,
        listingAgentEarned,
        sellingAgentEarned,
        totalAgentEarned: totalAgentPortion,
        isSingleAgent,
        calculationLog: CommissionPolicy.describe(isSingleAgent),
        // Snapshot of policy rates at creation time — immutable historical record
        appliedPolicy: {
          agencyShare: CommissionPolicy.AGENCY_SHARE,
          agentShare: CommissionPolicy.AGENT_SHARE,
          splitRatio: CommissionPolicy.SPLIT_RATIO,
        },
      }
    });

    return newTransaction.save();
  }

  async findAll(limit: number, skip: number, search?: string, status?: string, sort: string = 'newest'): Promise<{ data: Transaction[], total: number }> {
    const query: any = {};

    if (search) {
      // Apply structural Turkish regex for robust Mongoose search
      const trRegex = generateTurkishRegex(search);

      query.$or = [
        { propertyAddress: { $regex: trRegex, $options: 'i' } },
        { listingAgent: { $regex: trRegex, $options: 'i' } },
        { sellingAgent: { $regex: trRegex, $options: 'i' } },
      ];
    }

    if (status && status !== 'all' && status !== 'active_only') {
      query.status = { $in: [status, status.replace('_', ' ')] };
    } else if (status === 'active_only') {
      query.status = { $nin: [TransactionStatus.COMPLETED, 'Finished ✓'] };
    }

    const sortOption: any = sort === 'oldest' ? { createdAt: 1, _id: 1 } : { createdAt: -1, _id: 1 };

    const [data, total] = await Promise.all([
      this.transactionModel
        .find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.transactionModel.countDocuments(query).exec()
    ]);

    return { data, total };
  }

  async updateStage(id: string, newStatus: TransactionStatus): Promise<Transaction> {
    const transaction = await this.transactionModel.findById(id);
    if (!transaction) throw new NotFoundException('Transaction not found');
    if (transaction.status === TransactionStatus.COMPLETED) {
      throw new BadRequestException('Finished transactions cannot be updated');
    }

    const currentIndex = TRANSACTION_STATUS_ORDER.indexOf(transaction.status as TransactionStatus);
    const nextIndex = TRANSACTION_STATUS_ORDER.indexOf(newStatus);

    if (nextIndex === -1) throw new BadRequestException('Invalid stage');
    if (nextIndex < currentIndex) throw new BadRequestException('Cannot move backwards');
    if (nextIndex > currentIndex + 1) throw new BadRequestException('Stages must follow sequence');

    transaction.status = newStatus;

    if (!transaction.stageDates) transaction.stageDates = {};
    transaction.stageDates[newStatus.replace(' ', '_')] = new Date();
    transaction.markModified('stageDates');

    return transaction.save();
  }

  async transition(id: string): Promise<Transaction> {
    const transaction = await this.transactionModel.findById(id);
    if (!transaction) throw new NotFoundException('Transaction not found');
    if (transaction.status === TransactionStatus.COMPLETED) {
      throw new BadRequestException('Finished transactions cannot be transitioned further');
    }

    const currentIndex = TRANSACTION_STATUS_ORDER.indexOf(transaction.status as TransactionStatus);

    if (currentIndex !== -1 && currentIndex < TRANSACTION_STATUS_ORDER.length - 1) {
      transaction.status = TRANSACTION_STATUS_ORDER[currentIndex + 1];
    } else if (currentIndex === -1) {
      transaction.status = TransactionStatus.EARNEST_MONEY;
    }

    if (!transaction.stageDates) transaction.stageDates = {};
    transaction.stageDates[transaction.status.replace(' ', '_')] = new Date();
    transaction.markModified('stageDates');

    return transaction.save();
  }

  async findOne(id: string): Promise<Transaction> {
    const transaction = await this.transactionModel.findById(id).exec();
    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }
    return transaction;
  }
}
