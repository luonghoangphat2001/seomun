import { BoardType } from '@/enums/board-notice';

export type BoardNoticeConfigRESP = {
  board_type: BoardType;
  notice_enabled: boolean;
  notice_message: string | null;
};
