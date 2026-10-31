import { DesignSourceType } from '@/enums/common';

//membership level
export type MemberShipLevelType = {
  name: string;
  min: number;
  pointPercent: number;
  activeIcon: string;
  inactiveIcon: string;
};

export type MyEditorType = {
  id: number;
  name: string;
  thumbnailUrl: string;
  productSlug?: string;
  productName?: string;
  designGroupId?: string;
  sourceType?: DesignSourceType;
  categoryId: number;
  created_at?: string;
  updated_at?: string;
  upload_artwork?: UploadArtworkType;
};

export type UploadArtworkType = {
  created_at: string;
  design_group_id: number;
  id: number;
  mime: string;
  name: string;
  print_as_is: boolean;
  print_without_proof: boolean;
  size: number;
  updated_at: string;
  url: string;
};

export type MyEditorCategoryType = {
  id: number;
  name: string;
};

export type ShippingAddressType = {
  id: number;
  deliveryAddress: string;
  recipient: string;
  address: string;
  phone: string;
  isDefault?: boolean;
};

export type ProductDesignType = {
  id: number;
  designUrls: string[];
  fileName: string;
  fileSize: number;
  fileUrl: string;
};

export type CartType = {
  id: number;
  productName: string;
  productDescription: string;
  productThumbnail: string;
  designFileName: string;
  designUrl: string;
  postProcessing: string;
  quantity: number;
  count: number;
  orderAmount: number;
};
