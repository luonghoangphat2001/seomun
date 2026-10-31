import { create } from 'zustand';

type MemberInfoState = {
  passwordConfirmed: boolean;
  currentPassword: string;
  setPasswordConfirmed: (value: boolean) => void;
  setCurrentPassword: (value: string) => void;
};

export const useMemberInfoStore = create<MemberInfoState>((set) => ({
  passwordConfirmed: false,
  currentPassword: '',
  setPasswordConfirmed: (passwordConfirmed) => set({ passwordConfirmed }),
  setCurrentPassword: (currentPassword) => set({ currentPassword }),
}));
