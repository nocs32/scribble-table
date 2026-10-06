import type { ReactElement } from 'react';
import { Home } from './features';
import type { RootStore } from './stores';
import { StoreContext } from './stores/store-context';

interface AppProps {
  store: RootStore;
}

export function App({ store }: AppProps): ReactElement {
  return (
    <StoreContext value={store}>
      <Home />
    </StoreContext>
  );
}
