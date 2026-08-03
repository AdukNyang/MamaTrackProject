import {
  createContext,
  useContext,
  useRef,
  useState,
  type MutableRefObject,
  type ReactNode,
} from 'react';

export type DrawerControls = {
  openDrawer: () => void;
  closeDrawer: () => void;
};

const noopControls: DrawerControls = {
  openDrawer: () => {},
  closeDrawer: () => {},
};

const DrawerControlsRefContext = createContext<MutableRefObject<DrawerControls> | null>(null);
const DrawerOpenContext = createContext(false);
const DrawerOpenSetterContext = createContext<(open: boolean) => void>(() => {});

export function DrawerControlsProvider({ children }: { children: ReactNode }) {
  const controlsRef = useRef<DrawerControls>(noopControls);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <DrawerControlsRefContext.Provider value={controlsRef}>
      <DrawerOpenSetterContext.Provider value={setIsDrawerOpen}>
        <DrawerOpenContext.Provider value={isDrawerOpen}>{children}</DrawerOpenContext.Provider>
      </DrawerOpenSetterContext.Provider>
    </DrawerControlsRefContext.Provider>
  );
}

export function useDrawerControlsRef() {
  const controlsRef = useContext(DrawerControlsRefContext);
  if (!controlsRef) {
    throw new Error('useDrawerControlsRef must be used within DrawerControlsProvider');
  }
  return controlsRef;
}

export function useIsDrawerOpen() {
  return useContext(DrawerOpenContext);
}

export function useSetDrawerOpen() {
  return useContext(DrawerOpenSetterContext);
}
