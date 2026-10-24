import ProductStage from '@components/Templates/langkah/ProductStage';
import {
  Details,
  Newsletter,
  Reviews,
  TierGrid,
} from '@components/Templates/langkah/HomeSections';

export default function LangkahHome() {
  return (
    <>
      <ProductStage />
      <TierGrid />
      <Details />
      <Reviews />
      <Newsletter />
    </>
  );
}
