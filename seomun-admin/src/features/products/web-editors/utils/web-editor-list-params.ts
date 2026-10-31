import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from '@/constants/pagination';

import type { WebEditorListREQ } from '../api/web-editor.request';
import type { WebEditorListSearch } from '../schemas';

export type NormalizedWebEditorListParams = WebEditorListREQ & Required<Pick<WebEditorListREQ, 'page' | 'per_page'>>;

export function buildWebEditorListParams(search: WebEditorListSearch): NormalizedWebEditorListParams {
  return {
    page: search.page ?? DEFAULT_PAGE,
    per_page: search.per_page ?? DEFAULT_PER_PAGE,
    search_keyword: search.search_keyword,
    type: search.type,
    is_active: search.is_active === 'true' ? true : search.is_active === 'false' ? false : undefined,
  };
}
