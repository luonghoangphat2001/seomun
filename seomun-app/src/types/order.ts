import { OrderStatus } from '@/enums/order';
import React from 'react';

export type OrderStatusConfig = {
  label: string;
  className: string;
  icon: React.ElementType;
  helperMessage?: string;
};

export type OrderType = {
  id: number;
  orderNumber: string;
  orderDate: string;
  designImageUrl?: string;
  title: string;
  description: string;
  quantity?: number;
  orderAmount?: number;
  orderStatus: OrderStatus;
  statusLabel?: string;
  shppingCode: string;
  canTrackDelivery?: boolean;
  fileStatus?: string;
  isReviewed?: boolean;
};
