"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";

import { useMounted } from "@/lib/useMounted";
import { useSmoothScroll } from "@/components/providers/SmoothScroll";
import { easeTailorBezier } from "@/lib/tokens";
import { cn } from "@/lib/cn";
import { PHONE_DISPLAY, PHONE_TEL, WHATSAPP_LINK } from "@/lib/contact";

export type InfoTopic =
  | "delivery"
  | "care-guide"
  | "returns"
  | "faq"
  | "about"
  | "privacy"
  | "terms";

interface TopicData {
  readonly title: string;
  readonly subtitle: string;
  readonly content: React.ReactNode;
}

const TOPICS: Record<InfoTopic, TopicData> = {
  faq: {
    title: "Frequently asked questions",
    subtitle: "Everything you need to know before gifting.",
    content: (
      <div className="flex flex-col gap-6 text-[0.9375rem] text-chalk">
        <div>
          <h4 className="font-medium text-suiting">
            Do you stitch the clothes or send unstitched fabric?
          </h4>
          <p className="mt-1">
            We provide premium unstitched fabric lengths in bespoke gift boxes.
            Every man has his own trusted master tailor who understands his
            unique posture, collar preference, and fit. You give him the cloth;
            he gets it tailored exactly his way.
          </p>
        </div>

        <div>
          <h4 className="font-medium text-suiting">
            Can the recipient exchange the fabric if he prefers another shade?
          </h4>
          <p className="mt-1">
            Yes. Every box includes a discreet care card with our direct WhatsApp
            contact. If he wishes to swap any uncut and unwashed fabric length,
            we arrange a doorstep exchange free of charge.
          </p>
        </div>

        <div>
          <h4 className="font-medium text-suiting">
            Is the fabric length sufficient for taller or broader men?
          </h4>
          <p className="mt-1">
            Yes. Our shirt lengths are generous 1.6 metres (accommodating up to a
            46-inch chest with full sleeves). Suit lengths are 3.25 metres, and
            bandhgalas are 2.5 metres.
          </p>
        </div>

        <div>
          <h4 className="font-medium text-suiting">
            How do corporate or bulk orders work?
          </h4>
          <p className="mt-1">
            For orders of 10 or more boxes, we offer dedicated WhatsApp
            coordination, company branding on the gift cards, and direct dispatch
            to multiple employee or client addresses across India.
          </p>
        </div>
      </div>
    ),
  },

  delivery: {
    title: "Delivery & packaging",
    subtitle: "Hand-packed in Surat and delivered across India.",
    content: (
      <div className="flex flex-col gap-5 text-[0.9375rem] text-chalk">
        <p>
          Every Kushagra box is folded by hand in Surat, tied with our signature
          grosgrain ribbon, and packed in an outer protective transit sleeve so
          the gift box arrives pristine.
        </p>

        <div className="border-t border-line pt-4">
          <h4 className="font-medium text-suiting">Transit timeline</h4>
          <p className="mt-1">
            Metro cities: 2–4 business days. Rest of India: 3–6 business days.
            Express delivery options are available upon request on WhatsApp.
          </p>
        </div>

        <div className="border-t border-line pt-4">
          <h4 className="font-medium text-suiting">Tracking</h4>
          <p className="mt-1">
            Live tracking updates and courier tracking links are sent directly
            via WhatsApp and SMS as soon as your box is dispatched.
          </p>
        </div>
      </div>
    ),
  },

  "care-guide": {
    title: "Care guide & tailoring notes",
    subtitle: "Guidance for his master tailor.",
    content: (
      <div className="flex flex-col gap-6 text-[0.9375rem] text-chalk">
        <p>
          Every box includes a printed tailor card specifying the mill
          composition, yarn count, and suggested washing guidelines.
        </p>

        <div>
          <h4 className="font-medium text-suiting">Pure cotton shirting</h4>
          <p className="mt-1">
            We recommend a gentle cold water pre-wash before cutting to allow the
            natural 1–2% cotton relaxation. Machine wash warm with like colours;
            warm iron while slightly damp.
          </p>
        </div>

        <div>
          <h4 className="font-medium text-suiting">Wool & poly suiting</h4>
          <p className="mt-1">
            Dry clean only. Steam press recommended; avoid pressing with direct
            high heat to protect the wool fibres and natural drape.
          </p>
        </div>

        <div>
          <h4 className="font-medium text-suiting">Ivory linen</h4>
          <p className="mt-1">
            Linen softens with every wash. Dry clean or gentle hand wash. Do not
            wring; hang dry in shade and iron while damp for a crisp look, or
            embrace its natural gentle creases.
          </p>
        </div>

        <div>
          <h4 className="font-medium text-suiting">Cotton velvet</h4>
          <p className="mt-1">
            Professional dry clean only. Steam from the reverse side to preserve
            the pile. Never press iron directly onto velvet pile.
          </p>
        </div>
      </div>
    ),
  },

  returns: {
    title: "Returns & exchanges",
    subtitle: "Our 7-day unstitched cloth guarantee.",
    content: (
      <div className="flex flex-col gap-5 text-[0.9375rem] text-chalk">
        <p>
          We want both the giver and the recipient to love the cloth. If the
          fabric is uncut, unwashed, and in its original state, we offer a 7-day
          doorstep return or exchange.
        </p>

        <div className="border-t border-line pt-4">
          <h4 className="font-medium text-suiting">Recipient swaps</h4>
          <p className="mt-1">
            If the recipient prefers a different shade or texture, he can
            initiate a swap using the contact on his gift card. We arrange pickup
            and send the new selection.
          </p>
        </div>

        <div className="border-t border-line pt-4">
          <h4 className="font-medium text-suiting">How to initiate</h4>
          <p className="mt-1">
            Simply message us on WhatsApp with your order number or phone number.
            Our team handles the courier pickup.
          </p>
        </div>
      </div>
    ),
  },

  about: {
    title: "About Kushagra",
    subtitle: "Select • Stitch • Stand Out",
    content: (
      <div className="flex flex-col gap-5 text-[0.9375rem] text-chalk">
        <p>
          Kushagra was born in Surat, Gujarat — the heart of India&apos;s textile
          craftsmanship. We saw men receiving the same predictable shirts and
          pre-packaged garments that never truly fit.
        </p>
        <p>
          We created Kushagra to change the ritual of gifting for men. The giver
          chooses authentic, high-grade cloth from trusted mills. The man takes
          it to the tailor he trusts. And he ends up wearing something nobody
          else in the room is wearing.
        </p>
        <div className="border-t border-line pt-4">
          <h4 className="font-medium text-suiting">Direct contact</h4>
          <p className="mt-1">
            Questions, bulk orders, or bespoke fabric sourcing:{" "}
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noreferrer"
              className="text-suiting underline decoration-line underline-offset-4"
            >
              WhatsApp
            </a>{" "}
            or call{" "}
            <a
              href={`tel:${PHONE_TEL}`}
              className="text-suiting underline decoration-line underline-offset-4"
            >
              {PHONE_DISPLAY}
            </a>
            .
          </p>
        </div>
      </div>
    ),
  },

  privacy: {
    title: "Privacy policy",
    subtitle: "Your privacy and trust matter to us.",
    content: (
      <div className="flex flex-col gap-5 text-[0.9375rem] text-chalk">
        <p>
          We only collect information necessary to prepare your gift box, print
          your personalized gift note, and arrange courier delivery.
        </p>
        <div className="border-t border-line pt-4">
          <h4 className="font-medium text-suiting">Information use</h4>
          <p className="mt-1">
            Your name, phone number, address, and gift note text are never sold,
            rented, or shared with third parties, except with our trusted logistics
            partners solely for order dispatch and live delivery notifications.
          </p>
        </div>
      </div>
    ),
  },

  terms: {
    title: "Terms of service",
    subtitle: "Clear, fair standards for all orders.",
    content: (
      <div className="flex flex-col gap-5 text-[0.9375rem] text-chalk">
        <p>
          By ordering through Kushagra, you agree to our standard terms of
          service:
        </p>
        <ul className="flex list-disc flex-col gap-2 pl-5">
          <li>All prices listed are in integer Indian Rupees (₹) inclusive of applicable taxes.</li>
          <li>Orders are confirmed and packed upon payment receipt.</li>
          <li>Fabric lengths are guaranteed to meet or exceed quoted measurements.</li>
          <li>Uncut, unwashed fabric lengths qualify for our 7-day return/exchange policy.</li>
        </ul>
      </div>
    ),
  },
};

const VALID_TOPICS: readonly InfoTopic[] = [
  "delivery",
  "care-guide",
  "returns",
  "faq",
  "about",
  "privacy",
  "terms",
];

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function InfoModal() {
  const [topic, setTopic] = useState<InfoTopic | null>(null);
  const mounted = useMounted();
  const { stop, start } = useSmoothScroll();
  const modalRef = useRef<HTMLDivElement | null>(null);

  const close = useCallback(() => {
    setTopic(null);
    if (window.location.hash) {
      history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  // Listen to hash changes for #delivery, #faq, etc.
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace("#", "") as InfoTopic;
      if (VALID_TOPICS.includes(hash)) {
        setTopic(hash);
      }
    };

    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  // Global click interceptor for info links
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = (event.target as HTMLElement | null)?.closest("a");
      if (target === null || target === undefined) return;
      const href = target.getAttribute("href");
      if (!href || !href.startsWith("#")) return;
      const clean = href.slice(1) as InfoTopic;
      if (VALID_TOPICS.includes(clean)) {
        event.preventDefault();
        setTopic(clean);
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  // Scroll lock while modal is open
  useEffect(() => {
    if (topic !== null) {
      stop();
    } else {
      start();
    }
    return () => {
      start();
    };
  }, [topic, stop, start]);

  // Escape to close & focus trap
  useEffect(() => {
    if (topic === null) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== "Tab") return;

      const root = modalRef.current;
      if (root === null) return;
      const items = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE));
      const first = items[0];
      const last = items[items.length - 1];
      if (first === undefined || last === undefined) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [topic, close]);

  if (!mounted) return null;

  const currentData = topic !== null ? TOPICS[topic] : null;

  return createPortal(
    <AnimatePresence>
      {topic !== null && currentData !== null ? (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: easeTailorBezier }}
            onClick={close}
            className="absolute inset-0 bg-suiting/60 backdrop-blur-[4px]"
          />

          <motion.div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="info-modal-title"
            tabIndex={-1}
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.3, ease: easeTailorBezier }}
            className="relative flex max-h-[90vh] w-full max-w-[640px] flex-col rounded-m border border-line bg-paper shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-line px-6 py-5 sm:px-8">
              <div>
                <h3 id="info-modal-title" className="text-suiting">
                  {currentData.title}
                </h3>
                <p className="mt-1 text-[0.875rem] text-chalk">
                  {currentData.subtitle}
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Close dialog"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-pill border border-line text-suiting transition-colors duration-200 hover:bg-suiting hover:text-shirting"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M3 3l10 10M13 3L3 13"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            {/* Quick tabs bar */}
            <div className="flex overflow-x-auto border-b border-line px-6 py-2 sm:px-8">
              <div className="flex gap-2">
                {VALID_TOPICS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setTopic(item)}
                    className={cn(
                      "rounded-pill px-3 py-1 text-[0.8125rem] font-medium transition-colors duration-200 whitespace-nowrap",
                      item === topic
                        ? "bg-suiting text-shirting"
                        : "border border-line text-chalk hover:text-suiting",
                    )}
                  >
                    {TOPICS[item].title}
                  </button>
                ))}
              </div>
            </div>

            {/* Content body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8">
              {currentData.content}
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
