import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

// Transaction Schema Definition
export type TransactionDocument = HydratedDocument<Transaction>;

@Schema({ timestamps: true })
export class Transaction {
  @Prop({ required: true })
  propertyAddress!: string;

  @Prop({ required: true })
  totalServiceFee!: number;

  @Prop({ default: 'agreement' })
  status!: string;

  @Prop({ required: true })
  listingAgent!: string;

  @Prop({ required: true })
  sellingAgent!: string;

  @Prop({ type: Object })
  financialBreakdown!: {
    totalServiceFee: number;
    agencyEarned: number;
    listingAgentEarned: number;
    sellingAgentEarned: number;
    totalAgentEarned?: number;
    isSingleAgent?: boolean;
    calculationLog: string;
    /** Snapshot of CommissionPolicy rates active at transaction creation time. */
    appliedPolicy: {
      agencyShare: number;     // e.g. 0.5
      agentShare: number;      // e.g. 0.5
      splitRatio: number;      // e.g. 0.25 (per split-agent)
    };
  };

  @Prop({ type: Object, default: {} })
  stageDates!: {
    agreement?: Date;
    earnest_money?: Date;
    title_deed?: Date;
    completed?: Date;
    [key: string]: Date | undefined;
  };
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);

TransactionSchema.index({
  propertyAddress: 'text',
  listingAgent: 'text',
  sellingAgent: 'text'
}, { 
  name: 'TransactionSearchIndex',
  weights: {
    propertyAddress: 10,
    listingAgent: 5,
    sellingAgent: 5
  }
});