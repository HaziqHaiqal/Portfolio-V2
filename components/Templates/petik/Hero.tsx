import Image from 'next/image';
import { FREE_DELIVERY_AT } from './data';
import { Bubble, DISPLAY } from './ui';

const CUT = '/templates/petik/cut';

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden bg-tpl-tint">
      <Image
        src={`${CUT}/pineapple.webp`}
        alt=""
        width={572}
        height={900}
        loading="eager"
        className="petik-float pointer-events-none absolute -bottom-6 -left-12 h-[230px] w-auto sm:h-[340px] lg:-left-6 lg:h-[500px]"
      />
      <Image
        src={`${CUT}/mangosteen.webp`}
        alt=""
        width={900}
        height={458}
        loading="eager"
        className="petik-float pointer-events-none absolute -right-12 -top-8 w-[140px] rotate-[8deg] [animation-delay:-2s] sm:-right-10 sm:top-6 sm:w-[230px] lg:right-0 lg:top-10 lg:w-[300px]"
      />
      <Image
        src={`${CUT}/papaya.webp`}
        alt=""
        width={900}
        height={341}
        loading="eager"
        className="petik-float pointer-events-none absolute -bottom-2 -right-12 w-[200px] -rotate-6 [animation-delay:-4s] sm:w-[280px] lg:bottom-8 lg:right-6 lg:w-[360px]"
      />
      <Image
        src={`${CUT}/strawberries.webp`}
        alt=""
        width={900}
        height={524}
        className="petik-float pointer-events-none absolute right-[21%] top-[56%] hidden w-[120px] rotate-12 [animation-delay:-1s] lg:block"
      />
      <Image
        src={`${CUT}/lime.webp`}
        alt=""
        width={900}
        height={432}
        className="petik-float pointer-events-none absolute left-[19%] top-[14%] hidden w-[140px] -rotate-12 [animation-delay:-3s] lg:block"
      />
      <Bubble
        text="Fresh kangkung"
        className="left-[23%] top-[58%] hidden lg:block"
      />
      <Bubble
        text="Sweet rambutan"
        className="right-[23%] top-[10%] hidden lg:block"
      />

      <div className="relative mx-auto flex min-h-[460px] max-w-[1200px] flex-col items-center justify-center px-6 pb-36 pt-20 text-center sm:min-h-[520px] sm:pt-14 lg:min-h-[560px] lg:pb-20">
        <h1
          className={`${DISPLAY} petik-rise max-w-[15ch] text-[clamp(2.25rem,5.4vw,4rem)] font-medium uppercase leading-[1.12] text-tpl-ink`}
        >
          Fresh from Malaysian farms
        </h1>
        <p className="petik-rise mt-4 max-w-[46ch] text-[15px] leading-relaxed text-tpl-ink/80 [animation-delay:100ms]">
          Picked yesterday, at your door today. Free delivery above RM
          {FREE_DELIVERY_AT} in the Klang Valley.
        </p>
        <a
          href="#shop"
          className={`${DISPLAY} petik-rise mt-8 inline-flex h-12 items-center rounded-full bg-white px-9 text-[13px] font-medium uppercase tracking-[1.5px] text-tpl-ink shadow-[0_6px_20px_rgba(0,0,0,0.06)] transition-transform [animation-delay:200ms] hover:-translate-y-0.5`}
        >
          Shop now
        </a>
      </div>
    </section>
  );
}
