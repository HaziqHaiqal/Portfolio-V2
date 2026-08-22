import { getCachedPortfolio } from '@lib/data';
import HomeContent from './HomeContent';
import SplashScreen from '@components/Layout/SplashScreen';

// The root layout reads the theme cookie, so this route is always dynamic and
// a route-level `revalidate` would never apply. Caching lives in the data layer.
export default async function Home() {
  const data = await getCachedPortfolio();

  return (
    <>
      <SplashScreen />
      <HomeContent {...data} />
    </>
  );
}
