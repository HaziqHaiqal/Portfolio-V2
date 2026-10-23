import {
  AboutBento,
  CategoryBento,
  FlashSale,
  Hero,
  Newsletter,
  Popular,
  Reviews,
  TrustStrip,
} from '@components/Templates/ruang/HomeParts';
import TableBuilder from '@components/Templates/ruang/TableBuilder';
import Rooms from '@components/Templates/ruang/Rooms';

export default function RuangHome() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <CategoryBento />
      <FlashSale />
      <Popular />
      <TableBuilder />
      <Rooms />
      <Reviews />
      <AboutBento />
      <Newsletter />
    </>
  );
}
