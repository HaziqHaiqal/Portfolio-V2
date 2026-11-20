'use client';

import {
  useEffect,
  useRef,
  useState,
  type DragEvent,
  type FormEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from 'react';
import Link from 'next/link';
import { ImagePlus } from 'lucide-react';
import {
  BASE_PATH,
  hrefOf,
  ITEMS,
  listSlugOf,
  SHOE_SIZES,
  slugify,
  slugOf,
  stockKey,
  TOP_SIZES,
  WAIST_SIZES,
  type Category,
  type Item,
  type ListSlug,
} from '../data';
import {
  MAX_ADDED,
  useCatalogue,
  useCatalogueReady,
  useItems,
} from '../catalogue';
import { cutOut, loadCutter, readPhoto, type Cut } from '../cutout';
import { fmtCm, linesOf, OWN_MEASURES, typicalCm } from '../sheet';
import LinePreview from './LinePreview';
import { ADMIN } from './AdminShell';

const CATEGORIES: Category[] = ['Tops', 'Outerwear', 'Bottoms', 'Shoes'];

const SLUG_OF: Record<Category, ListSlug> = {
  Tops: 'tops',
  Outerwear: 'tops',
  Bottoms: 'bottoms',
  Shoes: 'shoes',
};

const SIZES: Record<ListSlug, string[]> = {
  tops: TOP_SIZES,
  bottoms: WAIST_SIZES,
  shoes: SHOE_SIZES,
};

const STOCK: Record<ListSlug, number[]> = {
  tops: [4, 8, 10, 8, 4],
  bottoms: [4, 8, 10, 6, 3],
  shoes: [3, 6, 8, 8, 6, 4, 2],
};

const LINE_NAME: Record<ListSlug, string> = {
  tops: 'Tops',
  bottoms: 'Bottoms',
  shoes: 'Shoes',
};

const SAMPLES: Record<
  ListSlug,
  {
    src: string;
    category: Category;
    name: string;
    colour: string;
    price: string;
    fabric: string;
    fit: string;
    details: string;
  }
> = {
  tops: {
    src: `${BASE_PATH}/samples/overshirt-navy.jpg`,
    category: 'Outerwear',
    name: 'Pocket Overshirt',
    colour: 'Navy',
    price: '189',
    fabric: 'Brushed cotton twill',
    fit: 'Relaxed',
    details:
      'A navy overshirt in brushed cotton twill, with two chest pockets. Wear it buttoned or open over a tee.',
  },
  bottoms: {
    src: `${BASE_PATH}/samples/chino-sand.jpg`,
    category: 'Bottoms',
    name: 'Slim Chino',
    colour: 'Sand',
    price: '149',
    fabric: 'Stretch cotton twill',
    fit: 'Slim',
    details:
      'Slim chinos in stretch cotton twill, with a clean flat front and a hem you can roll.',
  },
  shoes: {
    src: `${BASE_PATH}/samples/sneaker-white.jpg`,
    category: 'Shoes',
    name: 'Everyday Low',
    colour: 'White',
    price: '259',
    fabric: 'Full-grain leather, rubber cupsole',
    fit: 'True to size',
    details:
      'A low-top in soft full-grain leather on a stitched rubber cupsole. Goes with everything.',
  },
};

const MAX_MB = 20;
const newId = () => `own-${Date.now().toString(36)}`;

type Status =
  | { at: 'empty' }
  | { at: 'loading' }
  | { at: 'cutting' }
  | { at: 'done'; seconds: number }
  | { at: 'missed' }
  | { at: 'broken' };

interface Photo {
  name: string;
  canvas: HTMLCanvasElement;
  src: string;
}

type Field =
  | 'photo'
  | 'name'
  | 'colour'
  | 'price'
  | 'fabric'
  | 'stock'
  | 'cm';

const defaultsFor = (slug: ListSlug) => {
  const sizes = SIZES[slug];
  return {
    stock: Object.fromEntries(
      sizes.map((size, i) => [size, String(STOCK[slug][i])])
    ),
    cm: Object.fromEntries(
      sizes.map((size) => [
        size,
        typicalCm(slug, sizes, size).map(fmtCm) as [string, string],
      ])
    ),
  };
};

const decimal = (text: string) =>
  text.replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1').slice(0, 5);

function Picker({
  onFile,
  className,
  children,
}: {
  onFile: (file: File) => void;
  className: string;
  children: ReactNode;
}) {
  return (
    <label
      className={`relative cursor-pointer has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 ${className}`}
    >
      <input
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (file) onFile(file);
        }}
      />
      {children}
    </label>
  );
}

function MiniSheet({ slug, cut }: { slug: ListSlug; cut: Cut | null }) {
  const shoe = slug === 'shoes';
  const W = shoe ? 804 : 687;
  const H = shoe ? 500 : 944;
  const u = W / (shoe ? 150 : 96);
  if (!cut) return null;
  return (
    <div
      className={`relative shrink-0 bg-tpl-tint ${shoe ? 'w-[150px]' : 'w-24'}`}
      style={{ aspectRatio: `${W} / ${H}` }}
      aria-hidden="true"
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- data URL from the cut-out */}
      <img src={cut.cut} alt="" className="absolute inset-0 h-full w-full opacity-60" />
      <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full overflow-visible">
        {cut.draw.dims.map((dim, i) => {
          const g = linesOf(dim, 7 * u);
          return (
            <g key={i} stroke="rgb(var(--tpl-ink))" fill="none">
              {g.ext.map(([x1, y1, x2, y2], j) => (
                <line
                  key={j}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  strokeWidth={1.2 * u}
                  strokeDasharray={`${4 * u} ${4 * u}`}
                />
              ))}
              <line
                x1={g.main[0]}
                y1={g.main[1]}
                x2={g.main[2]}
                y2={g.main[3]}
                strokeWidth={2 * u}
              />
              {g.ticks.map(([x1, y1, x2, y2], j) => (
                <line key={j} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={2 * u} />
              ))}
            </g>
          );
        })}
      </svg>
      {cut.draw.dims.map((dim, i) => {
        const [x, y] = linesOf(dim, 0).mid;
        return (
          <span
            key={i}
            className="absolute grid h-5 w-5 -translate-x-1/2 -translate-y-1/2 place-items-center bg-tpl-ink text-[11px] font-bold text-tpl-bg"
            style={{ left: `${(x / W) * 100}%`, top: `${(y / H) * 100}%` }}
          >
            {i ? 'B' : 'A'}
          </span>
        );
      })}
    </div>
  );
}

function PhotoTapper({
  photo,
  at,
  onTap,
}: {
  photo: Photo;
  at: [number, number] | null;
  onTap: (at: [number, number]) => void;
}) {
  const pick = (e: ReactMouseEvent<HTMLButtonElement>) => {
    if (e.detail === 0) return onTap([0.5, 0.45]);
    const box = e.currentTarget.getBoundingClientRect();
    onTap([
      Math.min(1, Math.max(0, (e.clientX - box.left) / box.width)),
      Math.min(1, Math.max(0, (e.clientY - box.top) / box.height)),
    ]);
  };
  return (
    <button
      type="button"
      onClick={pick}
      className="relative mx-auto block cursor-crosshair"
      style={{ aspectRatio: `${photo.canvas.width} / ${photo.canvas.height}`, maxHeight: '560px' }}
      aria-label="Tap the piece in your photo"
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- the owner's own photo */}
      <img src={photo.src} alt="" className="h-full w-full object-contain" />
      {at && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1.5px_rgb(0_0_0/0.6)]"
          style={{ left: `${at[0] * 100}%`, top: `${at[1] * 100}%` }}
        />
      )}
    </button>
  );
}

export default function AddProduct() {
  const ready = useCatalogueReady();
  const added = useCatalogue((state) => state.added);
  const add = useCatalogue((state) => state.add);
  const items = useItems();

  const [category, setCategory] = useState<Category>('Tops');
  const slug = SLUG_OF[category];
  const sizes = SIZES[slug];

  const [photo, setPhoto] = useState<Photo | null>(null);
  const [at, setAt] = useState<[number, number] | null>(null);
  const [cut, setCut] = useState<Cut | null>(null);
  const [status, setStatus] = useState<Status>({ at: 'empty' });
  const [tapping, setTapping] = useState(false);
  const [over, setOver] = useState(false);
  const [photoError, setPhotoError] = useState('');

  const [name, setName] = useState('');
  const [colour, setColour] = useState('');
  const [price, setPrice] = useState('');
  const [fabric, setFabric] = useState('');
  const [fit, setFit] = useState('Regular');
  const [details, setDetails] = useState('');
  const [stock, setStock] = useState(() => defaultsFor('tops').stock);
  const [cm, setCm] = useState(() => defaultsFor('tops').cm);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [saved, setSaved] = useState<Item | null>(null);

  const run = useRef(0);

  const pickCategory = (option: Category) => {
    const next = SLUG_OF[option];
    if (next !== slug) {
      const fresh = defaultsFor(next);
      setStock(fresh.stock);
      setCm(fresh.cm);
    }
    setCategory(option);
  };

  useEffect(() => {
    if (!photo) return;
    const id = ++run.current;
    let stale = false;
    (async () => {
      try {
        setStatus({ at: 'loading' });
        await loadCutter();
        if (stale || id !== run.current) return;
        setStatus({ at: 'cutting' });
        const start = performance.now();
        const next = await cutOut(photo.canvas, slug, at);
        if (stale || id !== run.current) return;
        if (!next) {
          setCut(null);
          setStatus({ at: 'missed' });
          setTapping(true);
          return;
        }
        setCut(next);
        setTapping(false);
        setStatus({
          at: 'done',
          seconds: Math.max(0.1, (performance.now() - start) / 1000),
        });
      } catch (err) {
        console.error(err);
        if (!stale && id === run.current) setStatus({ at: 'broken' });
      }
    })();
    return () => {
      stale = true;
    };
  }, [photo, slug, at]);

  const take = async (file: Blob, label: string) => {
    setPhotoError('');
    if (!file.type.startsWith('image/'))
      return setPhotoError("That file isn't a photo. Choose a JPG, PNG or WebP.");
    if (file.size > MAX_MB * 1024 * 1024)
      return setPhotoError(`That photo is over ${MAX_MB} MB. Try a smaller one.`);
    try {
      const canvas = await readPhoto(file);
      setCut(null);
      setTapping(false);
      setAt(null);
      setPhoto({ name: label, canvas, src: canvas.toDataURL('image/jpeg', 0.85) });
      setErrors((e) => ({ ...e, photo: undefined }));
    } catch {
      setPhotoError("This photo couldn't be opened. Try a JPG or PNG.");
    }
  };

  const trySample = async () => {
    const sample = SAMPLES[slug];
    try {
      const blob = await (await fetch(sample.src)).blob();
      pickCategory(sample.category);
      setName((v) => v || sample.name);
      setColour((v) => v || sample.colour);
      setPrice((v) => v || sample.price);
      setFabric((v) => v || sample.fabric);
      setFit((v) => (v && v !== 'Regular' ? v : sample.fit));
      setDetails((v) => v || sample.details);
      await take(blob, `sample-${sample.src.split('/').pop()}`);
    } catch {
      setPhotoError("The sample photo didn't load. Check the connection.");
    }
  };

  const drop = (e: DragEvent) => {
    e.preventDefault();
    setOver(false);
    const file = e.dataTransfer.files[0];
    if (file) void take(file, file.name);
  };

  const sold = sizes.filter((size) => stock[size] !== undefined && stock[size] !== '');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next: Partial<Record<Field, string>> = {};
    if (!cut) next.photo = 'Add a photo of the piece first.';
    if (!name.trim()) next.name = 'Give the piece a name.';
    if (!colour.trim()) next.colour = 'Say what colour it is.';
    if (!(Number(price) > 0)) next.price = 'Enter a price in ringgit.';
    if (!sold.length) next.stock = 'Enter stock for at least one size.';
    if (sold.some((size) => cm[size].some((n) => !(Number(n) > 0))))
      next.cm = 'Fill in both measurements for every size you sell.';
    if (!fabric.trim()) next.fabric = 'Say what it is made of.';
    setErrors(next);
    const first = (Object.keys(next) as Field[])[0];
    if (first) {
      document.getElementById(`gaya-add-${first}`)?.focus();
      return;
    }

    const taken = new Set(items.map(slugOf));
    const base = slugify(`${name} ${colour}`) || 'piece';
    let unique = base;
    for (let n = 2; taken.has(unique); n++) unique = `${base}-${n}`;
    const item: Item = {
      id: newId(),
      kind: slug === 'shoes' ? 'shoes' : 'clothes',
      category,
      name: name.trim(),
      colour: colour.trim(),
      price: Number(price),
      sizes: sold,
      details: details.trim() || `${name.trim()} in ${colour.trim().toLowerCase()}.`,
      slug: unique,
      no: Math.max(ITEMS.length, ...added.map((other) => other.no ?? 0)) + 1,
      images: { cut: cut!.cut, shadow: cut!.shadow, thumb: cut!.thumb },
      spec: {
        fabric: fabric.trim(),
        fit: fit.trim(),
        draw: cut!.draw,
        cm: Object.fromEntries(
          sold.map((size) => [size, cm[size].map(Number) as [number, number]])
        ),
      },
    };
    add(
      item,
      Object.fromEntries(sold.map((size) => [stockKey(item, size), Number(stock[size])]))
    );
    setSaved(item);
    window.scrollTo({ top: 0 });
  };

  const again = () => {
    setSaved(null);
    setPhoto(null);
    setCut(null);
    setStatus({ at: 'empty' });
    setName('');
    setColour('');
    setPrice('');
    setFabric('');
    setFit('Regular');
    setDetails('');
    const next = defaultsFor(slug);
    setStock(next.stock);
    setCm(next.cm);
    setErrors({});
  };

  const crumb = (
    <p className="text-sm">
      <Link href={`${ADMIN}/products`} className="gaya-adm-link font-normal">
        Products
      </Link>
      <span className="px-2 text-tpl-ink/50">/</span>
      Add product
    </p>
  );

  if (!ready) return <div className="mt-10 h-96 bg-tpl-tint" aria-busy="true" />;

  if (saved)
    return (
      <>
        {crumb}
        <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-14">
          <LinePreview
            slug={listSlugOf(saved)}
            cut={{ ...saved.images!, draw: saved.spec!.draw }}
            name={saved.name}
            price={saved.price}
          />
          <div className="lg:pt-6">
            <h1 className="gaya-adm-title">It&apos;s on the line</h1>
            <p className="gaya-adm-sub max-w-md">
              {saved.name}, {saved.colour} is up first on the{' '}
              {LINE_NAME[listSlugOf(saved)]} line. Anyone browsing this demo in
              this browser can open it, pick a size and buy it.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={BASE_PATH} className="gaya-btn !w-auto px-6">
                See it on the line
              </Link>
              <Link href={hrefOf(saved)} className="gaya-adm-ghost">
                View its page
              </Link>
            </div>
            <p className="mt-6 text-sm">
              {added.length >= MAX_ADDED ? (
                <>
                  That&apos;s {MAX_ADDED} added pieces, the most this demo
                  holds. Take one down in{' '}
                  <Link href={`${ADMIN}/products`} className="gaya-adm-link">
                    Products
                  </Link>{' '}
                  to add another.
                </>
              ) : (
                <button type="button" onClick={again} className="gaya-adm-link">
                  Add another
                </button>
              )}
            </p>
          </div>
        </div>
      </>
    );

  if (added.length >= MAX_ADDED)
    return (
      <>
        {crumb}
        <h1 className="gaya-adm-title mt-4">Add product</h1>
        <p className="gaya-adm-sub max-w-md">
          This demo holds {MAX_ADDED} added pieces and the line is full. Take
          one down in{' '}
          <Link href={`${ADMIN}/products`} className="gaya-adm-link">
            Products
          </Link>{' '}
          to add another.
        </p>
      </>
    );

  const busy = status.at === 'loading' || status.at === 'cutting';
  const [aName, bName] = OWN_MEASURES[slug];

  return (
    <>
      {crumb}
      <h1 className="gaya-adm-title mt-4">Add product</h1>
      <p className="gaya-adm-sub max-w-xl">
        Upload a photo of the piece. The background comes off and it hangs on
        the line like the others.
      </p>

      <form
        noValidate
        onSubmit={submit}
        className="mt-9 grid items-start gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-14"
      >
        <section aria-label="Photo" className="lg:sticky lg:top-[calc(var(--demo-bar)+1.5rem)]">
          {!photo ? (
            <div
              className="gaya-adm-drop flex h-[440px] flex-col items-center justify-center gap-5 px-6 text-center md:h-[600px]"
              data-over={over}
              onDragOver={(e) => {
                e.preventDefault();
                setOver(true);
              }}
              onDragLeave={() => setOver(false)}
              onDrop={drop}
            >
              <ImagePlus size={30} strokeWidth={1.5} aria-hidden="true" />
              <div>
                <p className="text-lg font-semibold">Drop a photo of the piece here</p>
                <p className="mt-1.5 max-w-xs text-sm text-tpl-ink/70">
                  A plain wall, door or floor behind it works best. Get the
                  whole piece in.
                </p>
              </div>
              <Picker
                onFile={(file) => void take(file, file.name)}
                className="gaya-btn !w-auto px-6"
              >
                <span id="gaya-add-photo" tabIndex={-1}>
                  Choose photo
                </span>
              </Picker>
              <button type="button" onClick={trySample} className="gaya-adm-link text-sm">
                Try a sample photo
              </button>
            </div>
          ) : tapping || !cut ? (
            <div className="bg-tpl-tint p-4 md:p-6">
              {status.at === 'missed' && (
                <p className="mb-3 text-sm font-semibold">
                  Couldn&apos;t pick out the piece. Tap it in the photo.
                </p>
              )}
              {status.at === 'broken' && (
                <p className="mb-3 text-sm font-semibold text-[rgb(var(--gaya-error))]">
                  The cut-out tool didn&apos;t load. Check the connection,
                  then tap the piece to try again.
                </p>
              )}
              {tapping && status.at !== 'missed' && status.at !== 'broken' && (
                <p className="mb-3 text-sm font-semibold">
                  Tap the middle of the piece in your photo.
                </p>
              )}
              <PhotoTapper
                photo={photo}
                at={at}
                onTap={(next) => {
                  setAt(next);
                  setStatus({ at: 'loading' });
                }}
              />
              {busy && <div className="gaya-adm-busy mt-4" />}
              {cut && tapping && !busy && (
                <button
                  type="button"
                  onClick={() => setTapping(false)}
                  className="gaya-adm-link mt-3 text-sm"
                >
                  Keep the last cut-out
                </button>
              )}
            </div>
          ) : (
            <LinePreview slug={slug} cut={cut} name={name.trim()} price={Number(price) || null} />
          )}

          {photo && (
            <div className="mt-4 flex items-start gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element -- the owner's own photo */}
              <img
                src={photo.src}
                alt=""
                className="h-20 w-16 shrink-0 bg-tpl-tint object-cover"
              />
              <div className="min-w-0 text-sm">
                <p className="truncate font-semibold">{photo.name}</p>
                <p className="mt-0.5 text-tpl-ink/70" aria-live="polite">
                  {status.at === 'loading'
                    ? 'Getting the cut-out tool ready. It downloads once, about 30 MB.'
                    : status.at === 'cutting'
                      ? 'Taking the background off.'
                      : status.at === 'done'
                        ? `Background removed in ${status.seconds.toFixed(1)} seconds.`
                        : status.at === 'missed'
                          ? 'No piece found yet.'
                          : status.at === 'broken'
                            ? 'Not cut out yet.'
                            : ''}
                </p>
                {status.at === 'done' && cut?.cropped && (
                  <p className="mt-1 font-semibold">
                    Part of the piece runs off the photo. One with the whole
                    piece in will hang better.
                  </p>
                )}
                <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                  {cut && !tapping && (
                    <button
                      type="button"
                      onClick={() => setTapping(true)}
                      className="gaya-adm-link"
                    >
                      Not right? Tap the garment
                    </button>
                  )}
                  <Picker onFile={(file) => void take(file, file.name)} className="gaya-adm-link">
                    <span>Change photo</span>
                  </Picker>
                </p>
              </div>
            </div>
          )}
          {(photoError || errors.photo) && (
            <p className="gaya-adm-err" role="alert">
              {photoError || errors.photo}
            </p>
          )}
        </section>

        <section aria-label="Details" className="grid gap-7">
          <div>
            <label htmlFor="gaya-add-name" className="gaya-adm-label">
              Name
            </label>
            <input
              id="gaya-add-name"
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 40))}
              placeholder="Boxy Shirt"
              autoComplete="off"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'gaya-add-name-err' : undefined}
              className="gaya-adm-input mt-2"
            />
            {errors.name && (
              <p id="gaya-add-name-err" className="gaya-adm-err">
                {errors.name}
              </p>
            )}
          </div>

          <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-4">
            <div>
              <label htmlFor="gaya-add-colour" className="gaya-adm-label">
                Colour
              </label>
              <input
                id="gaya-add-colour"
                value={colour}
                onChange={(e) => setColour(e.target.value.slice(0, 24))}
                placeholder="Sand"
                autoComplete="off"
                aria-invalid={!!errors.colour}
                aria-describedby={errors.colour ? 'gaya-add-colour-err' : undefined}
                className="gaya-adm-input mt-2"
              />
              {errors.colour && (
                <p id="gaya-add-colour-err" className="gaya-adm-err">
                  {errors.colour}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="gaya-add-price" className="gaya-adm-label">
                Price (RM)
              </label>
              <input
                id="gaya-add-price"
                value={price}
                onChange={(e) => setPrice(e.target.value.replace(/\D/g, '').slice(0, 4))}
                inputMode="numeric"
                placeholder="129"
                autoComplete="off"
                aria-invalid={!!errors.price}
                aria-describedby={errors.price ? 'gaya-add-price-err' : undefined}
                className="gaya-adm-input mt-2 tabular-nums"
              />
              {errors.price && (
                <p id="gaya-add-price-err" className="gaya-adm-err">
                  {errors.price}
                </p>
              )}
            </div>
          </div>

          <fieldset>
            <legend className="gaya-adm-label">Line</legend>
            <div className="gaya-adm-seg mt-2">
              {CATEGORIES.map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-pressed={category === option}
                  onClick={() => pickCategory(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="gaya-adm-label">Sizes and stock</legend>
            <div
              id="gaya-add-stock"
              tabIndex={-1}
              className="mt-2 grid grid-cols-[repeat(auto-fill,minmax(4.25rem,1fr))] gap-1.5"
            >
              {sizes.map((size) => (
                <label key={size} className="gaya-adm-cell">
                  <span>{size}</span>
                  <input
                    value={stock[size] ?? ''}
                    onChange={(e) =>
                      setStock((s) => ({
                        ...s,
                        [size]: e.target.value.replace(/\D/g, '').slice(0, 3),
                      }))
                    }
                    inputMode="numeric"
                    placeholder="None"
                    autoComplete="off"
                    aria-label={`Stock in ${size}`}
                  />
                </label>
              ))}
            </div>
            <p className="gaya-adm-note mt-2">
              0 shows the size as sold out. Leave a size empty if you don&apos;t
              sell it.
            </p>
            {errors.stock && <p className="gaya-adm-err">{errors.stock}</p>}
          </fieldset>

          <fieldset>
            <legend className="gaya-adm-label">Measurements (cm)</legend>
            <div className="mt-2 flex items-start gap-5">
              <table id="gaya-add-cm" tabIndex={-1} className="min-w-0 flex-1 text-sm">
                <thead>
                  <tr className="text-left text-[12px] text-tpl-ink/70">
                    <th scope="col" className="w-14 pb-1.5 font-semibold">
                      Size
                    </th>
                    <th scope="col" className="pb-1.5 pr-1.5 font-semibold">
                      A. {aName[1]}
                    </th>
                    <th scope="col" className="pb-1.5 font-semibold">
                      B. {bName[1]}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sold.map((size) => (
                    <tr key={size}>
                      <th scope="row" className="py-0.5 text-left font-semibold">
                        {size}
                      </th>
                      {[0, 1].map((j) => (
                        <td key={j} className={`py-0.5 ${j ? '' : 'pr-1.5'}`}>
                          <input
                            value={cm[size][j]}
                            onChange={(e) =>
                              setCm((all) => {
                                const row = [...all[size]] as [string, string];
                                row[j] = decimal(e.target.value);
                                return { ...all, [size]: row };
                              })
                            }
                            inputMode="decimal"
                            autoComplete="off"
                            aria-label={`${j ? bName[0] : aName[0]}, size ${size}`}
                            aria-invalid={!(Number(cm[size][j]) > 0)}
                            className="gaya-adm-input is-small tabular-nums"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <MiniSheet slug={slug} cut={cut} />
            </div>
            <p className="gaya-adm-note mt-2">
              A is {aName[0].toLowerCase()}, B is {bName[0].toLowerCase()}.
              Typical numbers are filled in. Lay yours flat, measure, and
              change them.
            </p>
            {errors.cm && <p className="gaya-adm-err">{errors.cm}</p>}
          </fieldset>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="gaya-add-fabric" className="gaya-adm-label">
                Fabric
              </label>
              <input
                id="gaya-add-fabric"
                value={fabric}
                onChange={(e) => setFabric(e.target.value.slice(0, 40))}
                placeholder="Cotton poplin"
                autoComplete="off"
                aria-invalid={!!errors.fabric}
                aria-describedby={errors.fabric ? 'gaya-add-fabric-err' : undefined}
                className="gaya-adm-input mt-2"
              />
              {errors.fabric && (
                <p id="gaya-add-fabric-err" className="gaya-adm-err">
                  {errors.fabric}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="gaya-add-fit" className="gaya-adm-label">
                Fit
              </label>
              <input
                id="gaya-add-fit"
                value={fit}
                onChange={(e) => setFit(e.target.value.slice(0, 24))}
                placeholder="Regular"
                autoComplete="off"
                className="gaya-adm-input mt-2"
              />
            </div>
          </div>

          <div>
            <label htmlFor="gaya-add-details" className="gaya-adm-label">
              Description
            </label>
            <textarea
              id="gaya-add-details"
              value={details}
              onChange={(e) => setDetails(e.target.value.slice(0, 400))}
              rows={4}
              placeholder="What it's made of, how it fits, what makes it worth it."
              className="gaya-adm-input mt-2"
            />
          </div>

          <div className="border-t border-tpl-line pt-6">
            <button type="submit" disabled={busy} className="gaya-btn h-12 text-[15px] disabled:opacity-60">
              {slug === 'shoes' ? 'Save and set it out' : 'Save and hang it'}
            </button>
            <p className="gaya-adm-note mt-3">
              It goes {slug === 'shoes' ? 'out' : 'up'} first on the{' '}
              {LINE_NAME[slug]} line. You can change its price and stock
              later.
            </p>
          </div>
        </section>
      </form>
    </>
  );
}
