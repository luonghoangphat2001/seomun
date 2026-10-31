import { ENDPOINTS } from '@/config/endpoints';
import { api } from '@/lib/api/api-client';
import type {
  CategoryCreateREQ,
  CategoryListREQ,
  CategorySortOrderREQ,
  CategoryUpdateREQ,
  ExportCategoriesREQ,
  UpdateCategoryExposureREQ,
} from './category.request';
import type {
  CategoryActionRESP,
  CategoryDetailRESP,
  CategoryFilterOptionRESP,
  CategoryListRESP,
  CategorySortOrderRESP,
  ExportCategoryRESP,
  UploadExposureImageRESP,
} from './category.response';

export const categoryApi = {
  getCategoryList: async (params?: CategoryListREQ): Promise<CategoryListRESP> => {
    return api.get<CategoryListRESP>(ENDPOINTS.CATEGORIES.LIST, { params });
  },

  getCategorySearchFilters: async (): Promise<CategoryFilterOptionRESP> => {
    return api.get<CategoryFilterOptionRESP>(ENDPOINTS.CATEGORIES.SEARCH_FILTERS);
  },

  getCategoryDetail: async (id: number): Promise<CategoryDetailRESP> => {
    return api.get<CategoryDetailRESP>(ENDPOINTS.CATEGORIES.DETAIL(id.toString()));
  },

  createCategory: async (data: CategoryCreateREQ): Promise<CategoryDetailRESP> => {
    return api.post<CategoryDetailRESP>(ENDPOINTS.CATEGORIES.CREATE, data);
  },

  updateCategory: async (id: number, data: CategoryUpdateREQ): Promise<CategoryDetailRESP> => {
    return api.put<CategoryDetailRESP>(ENDPOINTS.CATEGORIES.UPDATE(id.toString()), data);
  },

  deleteCategory: async (id: number): Promise<CategoryActionRESP> => {
    return api.delete<CategoryActionRESP>(ENDPOINTS.CATEGORIES.DELETE(id));
  },

  updateCategorySortOrder: async (data: CategorySortOrderREQ): Promise<CategorySortOrderRESP> => {
    return api.put<CategorySortOrderRESP>(ENDPOINTS.CATEGORIES.SORT_ORDER, data);
  },

  updateCategoryExposure: async (id: number, data: UpdateCategoryExposureREQ): Promise<CategoryDetailRESP> => {
    return api.patch<CategoryDetailRESP>(ENDPOINTS.CATEGORIES.UPDATE_EXPOSURE(id.toString()), data);
  },

  exportCategoriesToExcel: async (payload: ExportCategoriesREQ): Promise<ExportCategoryRESP> => {
    return api.post<ExportCategoryRESP>(ENDPOINTS.CATEGORIES.EXPORT_EXCEL, payload);
  },

  checkExportStatus: async (historyId: number): Promise<ExportCategoryRESP> => {
    return api.get<ExportCategoryRESP>(ENDPOINTS.CATEGORIES.CHECK_EXPORT_STATUS(historyId));
  },

  uploadExposureImage: async (file: File, type: 'banner' | 'icon'): Promise<UploadExposureImageRESP> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    return api.post<UploadExposureImageRESP>(ENDPOINTS.CATEGORIES.UPLOAD_EXPOSURE_IMAGE, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};
