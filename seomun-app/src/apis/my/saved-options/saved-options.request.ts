import { PaginationREQ } from '@/types';
import { DateRange } from 'react-day-picker';

export type SavedOptionCreateREQ = {
  product_id: number;
  quantity: number;
  number_of_cases: number;
  order_name: string;
  notes?: string;
  options: {
    group_id: number;
    option_id: number;
  }[];
  input_options?: {
    width: number;
    height: number;
  };
};

export type SavedOptionListREQ = PaginationREQ & {
  start_date?: string;
  end_date?: string;
  search?: string;
  product_id?: number;
  dateRange?: DateRange;
};
