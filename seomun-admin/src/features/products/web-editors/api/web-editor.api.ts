import { ENDPOINTS } from '@/config/endpoints';
import { api } from '@/lib/api/api-client';

import type { WebEditorListREQ, WebEditorREQ, WebEditorUpdateREQ } from './web-editor.request';
import type { WebEditorWriteRESP, WebEditorListRESP, WebEditorDetailRESP, WebEditorTemplatesRESP } from './web-editor.response';

export const getWebEditorsAPI = (params: WebEditorListREQ): Promise<WebEditorListRESP> => api.get(ENDPOINTS.WEB_EDITORS.LIST, { params });

export const createWebEditorAPI = (payload: WebEditorREQ): Promise<WebEditorWriteRESP> => api.post(ENDPOINTS.WEB_EDITORS.CREATE, payload);

export const updateWebEditorAPI = (id: number, payload: WebEditorUpdateREQ): Promise<WebEditorWriteRESP> =>
  api.put(ENDPOINTS.WEB_EDITORS.UPDATE(id), payload);

export const deleteWebEditorAPI = (id: number): Promise<void> => api.delete(ENDPOINTS.WEB_EDITORS.DELETE(id));

export const getWebEditorDetailAPI = (id: number): Promise<WebEditorDetailRESP> => api.get(ENDPOINTS.WEB_EDITORS.DETAIL(id));

export const getWebEditorTemplatesAPI = (id: number): Promise<WebEditorTemplatesRESP> => api.get(ENDPOINTS.WEB_EDITORS.TEMPLATES(id));
