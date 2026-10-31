import type { BoardType } from '../enum';

export interface BoardConfigREQ {
  boardType: BoardType;
  notice_enabled: boolean;
  notice_message: string | null;
}
