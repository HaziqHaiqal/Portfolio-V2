import { createServerSupabase } from '@lib/supabase/server';
import { getPortfolio } from '@lib/data';
import HomeContent from './HomeContent';
import SplashScreen from '@components/Layout/SplashScreen';

// Revalidate the homepage at most every 5 minutes. Mutations in the admin
// panel also call `revalidatePath('/')` for instant updates.
export const revalidate = 300;

export default async function Home() {
  const supabase = await createServerSupabase();
  const data = await getPortfolio(supabase);

  return (
    <>
      <SplashScreen />
      <HomeContent {...data} />
    </>
  );
}
