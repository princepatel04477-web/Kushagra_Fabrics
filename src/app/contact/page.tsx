import type { Metadata } from "next";

import { NavLink } from "@/components/chrome/NavLink";
import { InfoBlock, InfoPage, infoLinkClass } from "@/components/info/InfoPage";
import { EMAIL, PHONE_DISPLAY, PHONE_TEL, WHATSAPP_LINK } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Reach Kushagra on WhatsApp, by phone or by email — for orders, swaps, bulk gifting or a cloth you can't find on the site.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <InfoPage
      href="/contact"
      title="Talk to us"
      intro="A person reads every message. WhatsApp is quickest."
    >
      <InfoBlock heading="WhatsApp">
        <p>
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noreferrer"
            className={infoLinkClass}
          >
            Message us on WhatsApp
          </a>{" "}
          for orders, swaps and anything about a box on its way.
        </p>
      </InfoBlock>

      <InfoBlock heading="Phone">
        <p>
          <a href={`tel:${PHONE_TEL}`} data-numeric className={infoLinkClass}>
            {PHONE_DISPLAY}
          </a>
        </p>
      </InfoBlock>

      <InfoBlock heading="Email">
        <p>
          <a href={`mailto:${EMAIL}`} className={infoLinkClass}>
            {EMAIL}
          </a>
        </p>
      </InfoBlock>

      <InfoBlock heading="Ordering for a team">
        <p>
          For 10 boxes or more, use the enquiry form on{" "}
          <NavLink href="/corporate" className={infoLinkClass}>
            gifting for teams
          </NavLink>{" "}
          and we&apos;ll reply on WhatsApp within one working day.
        </p>
      </InfoBlock>
    </InfoPage>
  );
}
