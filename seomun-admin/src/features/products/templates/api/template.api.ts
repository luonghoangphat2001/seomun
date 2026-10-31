import { ENDPOINTS } from '@/config/endpoints';
import { api } from '@/lib/api/api-client';

import type { TemplateCopyREQ, TemplateExportExcelREQ, TemplateListREQ, TemplateWriteREQ } from './template.request';
import type {
  TemplateCopyPreviewRESP,
  TemplateDetailRESP,
  TemplateExportProgressResultRESP,
  TemplateExportRESP,
  TemplateListRESP,
  TemplateSearchFiltersRESP,
} from './template.response';

export const getTemplatesAPI = (params: TemplateListREQ): Promise<TemplateListRESP> => api.get(ENDPOINTS.TEMPLATE.LIST, { params });

export const getTemplateDetailAPI = (id: number): Promise<TemplateDetailRESP> => api.get(ENDPOINTS.TEMPLATE.DETAIL(id));

export const createTemplateAPI = (payload: TemplateWriteREQ): Promise<TemplateDetailRESP> => api.post(ENDPOINTS.TEMPLATE.CREATE, payload);

export const updateTemplateAPI = (id: number, payload: TemplateWriteREQ): Promise<TemplateDetailRESP> =>
  api.put(ENDPOINTS.TEMPLATE.UPDATE(id), payload);

export const patchTemplateAPI = (id: number, payload: Partial<TemplateWriteREQ>): Promise<TemplateDetailRESP> =>
  api.patch(ENDPOINTS.TEMPLATE.PATCH(id), payload);

export const deleteTemplateAPI = (id: number): Promise<void> => api.delete(ENDPOINTS.TEMPLATE.DELETE(id));

export const getTemplateSearchFiltersAPI = (): Promise<TemplateSearchFiltersRESP> => api.get(ENDPOINTS.TEMPLATE.SEARCH_FILTERS);

export const exportTemplatesExcelAPI = (params: TemplateExportExcelREQ): Promise<TemplateExportRESP> => api.post(ENDPOINTS.TEMPLATE.EXPORT, params);

export const checkTemplateExportProgressStatusAPI = (historyId: number): Promise<TemplateExportProgressResultRESP> =>
  api.get(ENDPOINTS.TEMPLATE.CHECK_EXPORT_STATUS(historyId));

export const getTemplateCopyPreviewAPI = (id: number): Promise<TemplateCopyPreviewRESP> => api.get(ENDPOINTS.TEMPLATE.COPY_PREVIEW(id));

export const copyTemplateAPI = (id: number, payload: TemplateCopyREQ): Promise<TemplateDetailRESP> => api.post(ENDPOINTS.TEMPLATE.COPY(id), payload);
