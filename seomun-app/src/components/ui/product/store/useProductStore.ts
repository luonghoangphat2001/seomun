import { SavedOptionRESP } from '@/apis/my/saved-options/saved-options.response';
import { ProductQuoteREQ } from '@/apis/product/product.request';
import { ProductQuoteRESP } from '@/apis/product/product.response';
import { ProductOrderConfig } from '@/types';
import { create } from 'zustand';

type ProductState = {
  quotation: ProductQuoteRESP | null;
  setQuotation: (data: ProductQuoteRESP | null) => void;
  quoteRequest?: ProductQuoteREQ;
  setQuoteRequest: (data?: ProductQuoteREQ) => void;
  formValues?: ProductOrderConfig;
  setFormValues: (data?: ProductOrderConfig) => void;
  pendingSavedOption?: SavedOptionRESP;
  setPendingSavedOption: (data?: SavedOptionRESP) => void;
  isLoadingQuotation: boolean;
  setIsLoadingQuotation: (value: boolean) => void;
};

export const useProductStore = create<ProductState>((set) => ({
  quotation: null,
  setQuotation: (quotation) => set({ quotation }),
  quoteRequest: undefined,
  setQuoteRequest: (quoteRequest) => set({ quoteRequest }),
  formValues: undefined,
  setFormValues: (formValues) => set({ formValues }),
  pendingSavedOption: undefined,
  setPendingSavedOption: (pendingSavedOption) => set({ pendingSavedOption }),
  isLoadingQuotation: false,
  setIsLoadingQuotation: (isLoadingQuotation) => set({ isLoadingQuotation }),
}));
