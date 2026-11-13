import Link from 'next/link';
import { Logo } from './Header';
import { BRAND, FREE_POSTAGE_AT, LISTS, listHref } from './data';

export default function Footer() {
  return (
    <footer className="gaya-foot">
      <div className="gaya-foot-in">
        <div className="gaya-foot-lead">
          <Logo className="is-foot" />
          <p>Everyday clothes and shoes, cut in Kuala Lumpur.</p>
        </div>
        <nav aria-label="Shop" className="gaya-foot-col">
          <p>Shop</p>
          {LISTS.map((list) => (
            <Link key={list.slug} href={listHref(list.slug)}>
              {list.name}
            </Link>
          ))}
        </nav>
        <div className="gaya-foot-col">
          <p>Help</p>
          <span>Free postage above RM{FREE_POSTAGE_AT}</span>
          <span>Exchange within 14 days</span>
          <span>Pay by FPX, card or e-wallet</span>
        </div>
        <div className="gaya-foot-col">
          <p>Visit</p>
          <span>21 Jalan Telawi 3, Bangsar Baru</span>
          <span>59100 Kuala Lumpur</span>
          <span>Daily, 11am to 9pm</span>
        </div>
        <div className="gaya-foot-col">
          <p>Follow</p>
          <span>Instagram</span>
          <span>TikTok</span>
        </div>
      </div>
      <div className="gaya-foot-base">
        <span>© 2026 {BRAND}</span>
        <span>Prices in RM. Demo store with simulated payments.</span>
      </div>
    </footer>
  );
}
