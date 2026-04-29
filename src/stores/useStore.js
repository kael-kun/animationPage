import { create } from 'zustand';

const useStore = create((set) => ({
  selectedNode: null,
  darkMode: true,
  reducedMotion: false,
  hoveredNode: null,

  selectNode: (nodeId) => set({ selectedNode: nodeId }),
  clearSelection: () => set({ selectedNode: null }),
  setHoveredNode: (nodeId) => set({ hoveredNode: nodeId }),
  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
  toggleReducedMotion: () => set((state) => ({ reducedMotion: !state.reducedMotion })),
}));

export default useStore;