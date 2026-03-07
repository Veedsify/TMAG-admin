import { create } from "zustand";
/* ─── Sidebar toggle store ──────────────────────────────── */
interface SidebarState {
  open: boolean;
  toggle: () => void;
  close: () => void;
}
export const useSidebarStore = create<SidebarState>()((set) => ({
  open: false,
  toggle: () => set((s) => ({ open: !s.open })),
  close: () => set({ open: false }),
}));
