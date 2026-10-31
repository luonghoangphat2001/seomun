import { BoardType } from '@/enums/board-notice';
import { UserMemberType } from '@/enums/user';

export type MenuItem = {
  label: string;
  link: string;
  boardType: BoardType;
  memberTypes?: UserMemberType[];
};

export type MenuGroup = {
  title: string;
  items: MenuItem[];
};
