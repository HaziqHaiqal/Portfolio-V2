import { getCachedPortfolio } from '@lib/data';
import HomeContent from './HomeContent';
import SplashScreen from '@components/Layout/SplashScreen';

// NOTE: this route renders dynamically because the root layout reads the
// theme cookie, so a route-level `revalidate` would never take effect. The
// caching lives in the data layer instead: `getCachedPortfolio` is shared
// across visitors and invalidated by admin mutations via `revalidateTag`.

export default async function Home() {
  const data = await getCachedPortfolio();

  return (
    <>
      <SplashScreen />
      <HomeContent {...data} />
    </>
  );
}
