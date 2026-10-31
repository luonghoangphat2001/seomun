import type { BaseResponse } from '@/types/api';
import type { BoardType } from '../enum';

export interface BoardItem {
  id: number;
  board_type: BoardType;
  notice_enabled: boolean;
  notice_message: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export type BoardListRESP = BaseResponse<{ configs: BoardItem[] }>;
