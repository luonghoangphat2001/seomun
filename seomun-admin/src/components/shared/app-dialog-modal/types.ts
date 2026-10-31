/**
 * Props for the AppDialogModal component.
 */
export type AppDialogModalProps = {
  /** Whether the modal is open or not */
  isOpen: boolean;

  /** Title of the modal */
  title: string;

  /** Content inside the modal */
  children: React.ReactNode;

  /**
   * Custom footer content.
   * Set to `null` to hide the footer.
   * If undefined, a default footer with Cancel and OK buttons will be used.
   */
  footer?: React.ReactNode | null;

  /** Maximum width of the modal in pixels */
  width?: number;

  /** Custom class for the dialog content container */
  contentClassName?: string;

  /** Custom class for the dialog overlay */
  overlayClassName?: string;

  /** Text for the confirm button (Default: 'OK') */
  okText?: string;

  /** Text for the cancel button (Default: 'Cancel') */
  cancelText?: string;

  /** Loading state for the confirm button */
  confirmLoading?: boolean;

  /** Disables the confirm button */
  okDisabled?: boolean;

  /** Function to control the open/closed state */
  setIsOpen: (open: boolean) => void;

  /** Callback function when the confirm button is clicked */
  onOk?: () => void;
};
