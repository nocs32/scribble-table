import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { LogoMark } from '../assets';
import { useRootStore } from '../stores/use-root-store';
import { HomeBrand, HomeCard, HomeLanguage, HomeRoot, HomeStatus, HomeTagline, HomeTitle } from './styled-components';

// The placeholder start page: the brand, and whether core-api answers. The game's screens replace it.
export const Home = observer(function Home(): ReactElement {
  const { locale, server } = useRootStore();

  return (
    <HomeRoot>
      <HomeLanguage type="button" aria-label={locale.toggleLabel} title={locale.toggleLabel} onClick={locale.toggle}>
        {locale.code}
      </HomeLanguage>
      <HomeCard>
        <HomeBrand>
          <LogoMark />
        </HomeBrand>
        <HomeTitle>Scribble Table</HomeTitle>
        <HomeTagline>{locale.t('home.tagline')}</HomeTagline>
        <HomeStatus role="status" status={server.state}>
          {server.label}
        </HomeStatus>
      </HomeCard>
    </HomeRoot>
  );
});
