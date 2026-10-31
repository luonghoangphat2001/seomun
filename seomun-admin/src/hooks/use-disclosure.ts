import { useState } from 'react';

export function useDisclosure(initialState = false) {
  const [open, setOpen] = useState(initialState);

  return {
    open,
    onClose: () => setOpen(false),
    onOpen: () => setOpen(true),
    onToggle: () => setOpen((prev) => !prev),
    setOpen,
  };
}
