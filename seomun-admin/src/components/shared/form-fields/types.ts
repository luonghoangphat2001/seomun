import type { FieldPath, FieldValues, UseControllerProps } from 'react-hook-form';

import type { AppFormFieldProps } from './AppFormField';

export type AppFormFieldSharedProps = Pick<
  AppFormFieldProps,
  'label' | 'description' | 'required' | 'labelClassName' | 'descriptionClassName' | 'errorClassName'
> & {
  fieldClassName?: string;
};

export type AppControlledFormFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = UseControllerProps<TFieldValues, TName> & AppFormFieldSharedProps;
