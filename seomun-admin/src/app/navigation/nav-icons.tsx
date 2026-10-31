import type { LucideIcon } from 'lucide-react';
import {
  Bell,
  Building2,
  ChartBar,
  ClipboardList,
  Factory,
  Folders,
  KeyRound,
  LayoutDashboard,
  MessageSquareMore,
  Package,
  ScrollText,
  Settings2,
  ShieldUser,
  SquareMenu,
  Truck,
  Users,
  VectorSquare,
  Wallet,
} from 'lucide-react';

import type { NavIconKey } from '@/app/navigation/nav-config';

export const navIcons: Record<NavIconKey, LucideIcon> = {
  bell: Bell,
  'building-2': Building2,
  'chart-bar': ChartBar,
  'clipboard-list': ClipboardList,
  factory: Factory,
  folders: Folders,
  'key-round': KeyRound,
  'layout-dashboard': LayoutDashboard,
  'message-square-more': MessageSquareMore,
  package: Package,
  'scroll-text': ScrollText,
  'settings-2': Settings2,
  'shield-user': ShieldUser,
  'square-text': SquareMenu,
  truck: Truck,
  users: Users,
  'square-dimensions': VectorSquare,
  wallet: Wallet,
};
