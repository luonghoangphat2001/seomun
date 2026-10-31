import type { AxiosError } from 'axios';
import type { IBaseError } from '@/types/api';
import type { OrderListItemRESP } from '@/features/orders/api/order.response';
import { OrderStatus } from '@/features/orders/enums';
import { formatKrw } from '@/utils/format-currency';
import type { ProductionOrder } from '../types/production-tools.type';
import { PRODUCTION_STATUS_LABELS, PRODUCTION_STATUS_STYLES } from '../constants';
import { ProductionStatus } from '../enums';

export function formatTimestamp(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date);
}

export function formatCurrency(amount: number) {
  return formatKrw(amount);
}

export function playSuccessTone() {
  if (typeof window === 'undefined') return;

  const AudioContextClass = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return;

  const audioContext = new AudioContextClass();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
  gainNode.gain.setValueAtTime(0.001, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.14, audioContext.currentTime + 0.02);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.22);

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.24);
  oscillator.onended = () => {
    void audioContext.close();
  };
}

export function getStatusLabel(status: string, fallbackLabel?: string | null) {
  return fallbackLabel?.trim() || PRODUCTION_STATUS_LABELS[status] || status.replaceAll('_', ' ');
}

export function getStatusStyle(status: string) {
  return PRODUCTION_STATUS_STYLES[status] || 'bg-muted text-muted-foreground';
}

export function mapOrderStatusToProductionStatus(status: string): ProductionStatus | null {
  switch (status) {
    case OrderStatus.CONFIRMED:
    case OrderStatus.PURCHASE_CONFIRMED:
    case OrderStatus.DESIGN_CONFIRMED:
      return ProductionStatus.CONFIRMED;
    case OrderStatus.TYPESETTING:
    case OrderStatus.OUTPUT_OF_POWER:
    case OrderStatus.PRINT:
      return ProductionStatus.IN_PRODUCTION;
    case OrderStatus.POST_PROCESSING:
      return ProductionStatus.POST_PROCESSING;
    case OrderStatus.PRODUCTION_DONE:
    case OrderStatus.READY_TO_SHIP:
      return ProductionStatus.READY_FOR_DELIVERY;
    default:
      return null;
  }
}

export function toProductionOrder(order: OrderListItemRESP): ProductionOrder | null {
  const productionStatus = mapOrderStatusToProductionStatus(order.status);

  if (!productionStatus) return null;

  return {
    ...order,
    production_status: productionStatus,
    production_status_label: getStatusLabel(productionStatus),
  };
}

export function getErrorMessage(error: unknown, fallback: string) {
  const axiosError = error as AxiosError<IBaseError> | undefined;
  return axiosError?.response?.data?.message || fallback;
}
