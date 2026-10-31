import i18next, { type ParseKeys } from 'i18next';

import { PERMISSION_MENU_NAV_KEYS, PermissionAction, type PermissionMenuKey } from '@/features/permissions';

const PERMISSION_ACTION_KEYS: Record<PermissionAction, ParseKeys<'page'>> = {
  [PermissionAction.VIEW]: 'permissions.settings.actions.view',
  [PermissionAction.REGISTER]: 'permissions.settings.actions.register',
  [PermissionAction.EDIT]: 'permissions.settings.actions.edit',
  [PermissionAction.DELETE]: 'permissions.settings.actions.delete',
  [PermissionAction.APPROVAL]: 'permissions.settings.actions.approval',
};

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export type PermissionMenuLine = { menu: string; actions: string[] };

function isPermissionItem(value: unknown): value is { menu: string; actions: unknown[] } {
  return isPlainObject(value) && typeof value.menu === 'string' && Array.isArray(value.actions);
}

// Admin permission item { menu, actions } → Korean menu/action names, same labels as the permission settings dialog
function labelPermissionMenu(menu: string, actions: unknown[]): PermissionMenuLine {
  const tNav = i18next.getFixedT('ko', 'nav');
  const tPage = i18next.getFixedT('ko', 'page');
  const navKey = PERMISSION_MENU_NAV_KEYS[menu as PermissionMenuKey];
  return {
    menu: navKey ? tNav(navKey) : menu,
    actions: actions.map((action) => {
      const key = PERMISSION_ACTION_KEYS[action as PermissionAction];
      return key ? tPage(key) : String(action);
    }),
  };
}

// [{ menu, actions }, ...] → labeled lines; undefined when the value isn't a permission list
export function getPermissionMenuLines(value: unknown): PermissionMenuLine[] | undefined {
  if (!Array.isArray(value) || value.length === 0 || !value.every(isPermissionItem)) return undefined;
  return value.map(({ menu, actions }) => labelPermissionMenu(menu, actions));
}

export function isHtml(value: unknown): value is string {
  return typeof value === 'string' && /<\/?[a-z][^>]*>/i.test(value);
}

export type JsonPathKey = string | number;
// HTML found inside the JSON, with its path from the field value so the before/after dialog can look up both sides
export type HtmlPart = { html: string; path: JsonPathKey[] };
export type JsonLinePart = string | HtmlPart;

function joinParts(groups: JsonLinePart[][], separator: string): JsonLinePart[] {
  return groups.flatMap((group, index) => (index === 0 ? group : [separator, ...group]));
}

export function formatJsonInline(value: unknown, path: JsonPathKey[]): JsonLinePart[] {
  if (value === null || value === undefined) return ['-'];
  if (isHtml(value)) return [{ html: value, path }];
  if (Array.isArray(value)) {
    return value.length === 0
      ? ['-']
      : joinParts(
          value.map((item, index) => formatJsonInline(item, [...path, index])),
          ', ',
        );
  }
  if (isPlainObject(value)) {
    if (isPermissionItem(value)) {
      const { menu, actions } = labelPermissionMenu(value.menu, value.actions);
      return [`${menu}: ${actions.join(', ') || '-'}`];
    }
    return joinParts(
      Object.entries(value).map(([key, item]) => [`${key}: `, ...formatJsonInline(item, [...path, key])]),
      ' · ',
    );
  }
  return [String(value)];
}

// JSON value (object/array) → readable lines for non-technical users: one line per array item or object key
export function formatJsonValueLines(value: unknown): JsonLinePart[][] {
  if (Array.isArray(value)) {
    if (value.length === 0) return [];
    return value.some(isPlainObject) ? value.map((item, index) => formatJsonInline(item, [index])) : [formatJsonInline(value, [])];
  }
  if (isPlainObject(value)) return Object.entries(value).map(([key, item]) => [`${key}: `, ...formatJsonInline(item, [key])]);
  return [formatJsonInline(value, [])];
}

export function linePartsToText(parts: JsonLinePart[], htmlPlaceholder?: string) {
  return parts.map((part) => (typeof part === 'string' ? part : (htmlPlaceholder ?? part.html))).join('');
}

// sender_email_address / senderEmailAddress → "Sender email address"
export function humanizeKey(key: string) {
  const text = key
    .replace(/([a-z\d])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .trim()
    .toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function isJsonEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object' || Array.isArray(a) !== Array.isArray(b)) return false;
  const aRecord = a as Record<string, unknown>;
  const bRecord = b as Record<string, unknown>;
  const aKeys = Object.keys(aRecord);
  return aKeys.length === Object.keys(bRecord).length && aKeys.every((key) => isJsonEqual(aRecord[key], bRecord[key]));
}

// Entries the diff view hides: unchanged entries at every level of the changed objects (an unchanged object counts once)
export function countUnchangedEntries(value: unknown, other: unknown): number {
  if (!isPlainObject(value)) return 0;
  const otherRecord = isPlainObject(other) ? other : {};
  return Object.entries(value).reduce(
    (count, [key, item]) => count + (isJsonEqual(item, otherRecord[key]) ? 1 : countUnchangedEntries(item, otherRecord[key])),
    0,
  );
}
