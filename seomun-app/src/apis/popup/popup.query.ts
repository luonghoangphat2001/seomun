import { PaginationREQ } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { PopupApi } from './popup.api';

export const popupQueryKeys = {
  POPUP_LIST: 'POPUP_LIST',
};

export const useGetPopupList = (params?: PaginationREQ) =>
  useQuery({
    queryKey: [popupQueryKeys.POPUP_LIST, params],
    queryFn: () => PopupApi.getList(params),
    select: (resp) => resp.data.popups,
  });
