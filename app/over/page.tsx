import type { Metadata } from "next";
import Logo from "@/components/Logo";

export const metadata: Metadata = {
  title: "Over GiveWally",
  description: "GiveWally is een Nederlandse cadeau-app: de gever stort een cadeaubedrag en de ontvanger besteedt dat bedrag zelf bij een winkel naar keuze.",
  robots: { index: true, follow: true },
};

export default function OverPage() {
  return (
    <main className="navy-gradient-bg flex min-h-screen flex-col items-center px-6 py-16 text-white">
      <div className="w-full max-w-xl">
        <div className="mb-8 flex justify-center">
          <Logo width={160} />
        </div>

        <h1 className="text-center text-2xl font-semibold">GiveWally</h1>
        <p className="mt-1 text-center italic text-white/80">
          Een kaart, cadeaubon en herinnering in één.
        </p>

        <div className="mt-8 space-y-4 text-white/90">
          <p>
            GiveWally is een Nederlandse cadeau-app: de gever stort een cadeaubedrag en de
            ontvanger besteedt dat bedrag zelf bij een winkel naar keuze. In plaats van een
            gesloten cadeaubon die maar bij een beperkt aantal winkels geldig is, werkt
            GiveWally overal waar gepind kan worden.
          </p>
          <p>
            Voordat de ontvanger afrekent, laat de app hem of haar aangeven wat er gekocht gaat
            worden — zo kan de gever het cadeaumoment meebeleven, in plaats van alleen geld over
            te maken.
          </p>
          <p>
            GiveWally wordt ontwikkeld door Bosman Beheer B.V. en bevindt zich momenteel in een
            kleinschalige pilotfase.
          </p>
        </div>

        <div className="mt-10">
          <h2 className="font-semibold gold-gradient-text">Contact</h2>
          <p className="mt-1 text-white/90">
            Bosman Beheer B.V.
            <br />
            Founder: Peter Bosman
            <br />
            M{" "}
            <a href="tel:+31622778208" className="underline hover:text-white">
              0031-622778208
            </a>
            <br />
            E{" "}
            <a href="mailto:peterbosman68@hotmail.com" className="underline hover:text-white">
              peterbosman68@hotmail.com
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
