/**
 * Home, section three: the boxes as a single band. The slim navy box in
 * seven columns, the copy beside it in five, centred on the photograph.
 */

import Image from "next/image";

import { NavLink } from "@/components/chrome/NavLink";
import boxShirt from "@/assets/photos/box-shirt.jpg";
import { boxes } from "@/lib/data";
import { formatINR } from "@/lib/format";

export function TheBoxes() {
  const fromInr = boxes.reduce(
    (lowest, box) => Math.min(lowest, box.priceInr),
    Number.POSITIVE_INFINITY,
  );

  return (
    <section
      id="home-boxes"
      aria-labelledby="home-boxes-heading"
      className="section-pad"
    >
      <div className="grid-shell items-center gap-y-10">
        <div className="relative col-span-12 aspect-[3/2] overflow-hidden rounded-m border border-line bg-paper lg:col-span-7">
          <Image
            src={boxShirt}
            alt="A slim navy Kushagra box with a red bow on the lid, beside folded white and Bengal stripe shirt lengths"
            fill
            sizes="(min-width: 1320px) 700px, (min-width: 900px) 58vw, 100vw"
            placeholder="blur"
            className="object-cover"
          />
        </div>

        <div className="col-span-12 flex flex-col items-start gap-6 lg:col-span-5 lg:pl-6">
          <h2
            id="home-boxes-heading"
            className="text-suiting text-[clamp(2.25rem,3.6vw,3.5rem)]"
          >
            Boxed, ribboned, ready to hand over
          </h2>
          <p data-numeric className="text-[1.0625rem] text-chalk">
            Three boxes, from {formatINR(fromInr)}.
          </p>
          <ul className="w-full">
            {boxes.map((box) => (
              <li
                key={box.id}
                className="flex items-baseline justify-between gap-6 border-t border-line py-3 last:border-b"
              >
                <span className="text-suiting">{box.name}</span>
                <span data-numeric className="text-chalk">
                  {formatINR(box.priceInr)}
                </span>
              </li>
            ))}
          </ul>
          <NavLink href="/boxes" className="link-quiet">
            Compare the boxes
          </NavLink>
        </div>
      </div>
    </section>
  );
}
