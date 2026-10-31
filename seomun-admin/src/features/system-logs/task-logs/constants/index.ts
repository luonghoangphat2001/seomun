import type { TFunction } from 'i18next';

import type { AppSelectOption } from '@/components/shared/app-select';

import { TaskType } from '../enums';

export function buildTaskTypeLabels(t: TFunction<'page'>): Record<TaskType, string> {
  return {
    [TaskType.REGISTER]: t('system_logs.tasks.task_type.register'),
    [TaskType.MODIFY]: t('system_logs.tasks.task_type.modify'),
    [TaskType.DELETE]: t('system_logs.tasks.task_type.delete'),
    [TaskType.APPROVAL]: t('system_logs.tasks.task_type.approval'),
  };
}

export const TASK_TYPE_STYLES = {
  [TaskType.REGISTER]: 'bg-blue-100 text-blue-800',
  [TaskType.MODIFY]: 'bg-amber-100 text-amber-800',
  [TaskType.DELETE]: 'bg-red-100 text-red-800',
  [TaskType.APPROVAL]: 'bg-emerald-100 text-emerald-800',
} satisfies Record<TaskType, string>;

export function getTaskTypeOptions(t: TFunction<'page'>): AppSelectOption<TaskType>[] {
  const labels = buildTaskTypeLabels(t);
  return Object.values(TaskType).map((value) => ({
    value,
    label: labels[value],
  }));
}
