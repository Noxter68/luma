// src/utils/sharedIncomeSources.ts

import { Users, CircleDollarSign, Gift, Repeat, DollarSign } from 'lucide-react-native';

export interface SharedIncomeSourceDefinition {
  id: 'contribution' | 'refund' | 'gift' | 'reimbursement' | 'other';
  icon: any;
  translationKey: string;
}

export const SHARED_INCOME_SOURCES: SharedIncomeSourceDefinition[] = [
  { id: 'contribution', icon: Users, translationKey: 'sharedAccounts.incomeSources.contribution' },
  { id: 'refund', icon: CircleDollarSign, translationKey: 'sharedAccounts.incomeSources.refund' },
  { id: 'gift', icon: Gift, translationKey: 'sharedAccounts.incomeSources.gift' },
  { id: 'reimbursement', icon: Repeat, translationKey: 'sharedAccounts.incomeSources.reimbursement' },
  { id: 'other', icon: DollarSign, translationKey: 'sharedAccounts.incomeSources.other' },
];
