"use client";

import { useState, useActionState } from "react";
import { updateGiftAction, type GiftFormState } from "@/app/dashboard/actions";
import { GREETING_OPTIONS, CUSTOM_GREETING_MAX, resolveGreeting, type GreetingKey } from "@/lib/greeting";
import { splitMessageForCard } from "@/lib/cardText";
import PhotoCropper from "@/components/PhotoCropper";
import GiftPhoto from "@/components/GiftPhoto";
import CardPanel from "@/components/CardPanel";
import CardFrontRight from "@/components/CardFrontRight";
import CardBackText from "@/components/CardBackText";

const MAX_MESSAGE = 1500;

const inputClass =
  "w-full rounded-xl border border-navy-900/15 bg-white px-4 py-3 text-sm focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500";

type Gift = {
  id: string;
  recipientName: string;
  originalAmount: number;
  photoUrl: string;
  greeting: string;
  message: string;
  giverName: string;
  giverEmail: string | null;
};

function amountFromCents(cents: number): string {
  return (cents / 100).toFixed(2).replace(".", ",");
}

function occasionFromGreeting(greeting: string): { occasion: GreetingKey; customGreeting: string } {
  const match = GREETING_OPTIONS.find((o) => o.key !== "anders" && o.text === greeting);
  if (match) return { occasion: match.key, customGreeting: "" };
  return { occasion: "anders", customGreeting: greeting };
}

export default function EditGiftForm({ gift }: { gift: Gift }) {
  const [state, formAction, pending] = useActionState<GiftFormState, FormData>(
    updateGiftAction,
    null
  );

  const initialGreeting = occasionFromGreeting(gift.greeting);

  const [recipientName, setRecipientName] = useState(gift.recipientName);
  const [amountInput, setAmountInput] = useState(amountFromCents(gift.originalAmount));
  const [message, setMessage] = useState(gift.message);
  const [giverName, setGiverName] = useState(gift.giverName);
  const [giverEmail, setGiverEmail] = useState(gift.giverEmail ?? "");
  const [occasion, setOccasion] = useState<GreetingKey>(initialGreeting.occasion);
  const [customGreeting, setCustomGreeting] = useState(initialGreeting.customGreeting);
  const [greetingMenuOpen, setGreetingMenuOpen] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(gift.photoUrl);

  const greetingPreview = resolveGreeting(occasion, customGreeting) ?? "Jouw boodschap";
  const selectedGreetingLabel =
    GREETING_OPTIONS.find((option) => option.key === occasion)?.label ?? "Kies een boodschap";
  const { front: messageFront, overflow: messageOverflow } = splitMessageForCard(message);

  return (
    <div>
      <p className="mb-2 text-sm text-white/50 lg:hidden">
        Pas de gegevens aan — swipe naar rechts voor een voorbeeld van de kaart →
      </p>

      <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory lg:grid lg:grid-cols-[minmax(320px,420px)_repeat(4,auto)] lg:items-start lg:gap-6 lg:overflow-visible lg:snap-none lg:pb-0">
        <form
          action={formAction}
          className="w-[90vw] max-w-md shrink-0 snap-start space-y-5 rounded-2xl border border-navy-900/10 bg-white p-5 shadow-sm lg:w-auto lg:max-w-none lg:shrink"
        >
          <input type="hidden" name="giftId" value={gift.id} />

          <div>
            <label htmlFor="recipientName" className="mb-1 block text-sm font-medium text-navy-900">
              Naam ontvanger
            </label>
            <input
              id="recipientName"
              name="recipientName"
              type="text"
              required
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="amount" className="mb-1 block text-sm font-medium text-navy-900">
              Bedrag (€)
            </label>
            <input
              id="amount"
              name="amount"
              type="text"
              inputMode="decimal"
              placeholder="25,00"
              required
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-navy-900">Foto</label>
            {!showCropper ? (
              <div className="space-y-2">
                <div
                  className="mx-auto overflow-hidden rounded-xl border border-navy-900/15 bg-white"
                  style={{ aspectRatio: "148 / 210", maxWidth: 280 }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={gift.photoUrl} alt="Huidige foto" className="h-full w-full object-cover" />
                </div>
                <button
                  type="button"
                  onClick={() => setShowCropper(true)}
                  className="text-sm font-medium text-navy-950 underline"
                >
                  Andere foto kiezen
                </button>
              </div>
            ) : (
              <PhotoCropper name="photo" onPreviewChange={setPhotoPreviewUrl} />
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-navy-900">
              Boodschap op de foto
            </label>

            <div className="overflow-hidden rounded-xl border border-navy-900/15 bg-white">
              <button
                type="button"
                onClick={() => setGreetingMenuOpen((open) => !open)}
                aria-expanded={greetingMenuOpen}
                className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-navy-900 transition"
              >
                <span>{selectedGreetingLabel}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  className={`h-4 w-4 shrink-0 text-navy-900/50 transition-transform ${
                    greetingMenuOpen ? "rotate-180" : ""
                  }`}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              {greetingMenuOpen && (
                <div className="border-t border-navy-900/10">
                  {GREETING_OPTIONS.map((option) => (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => {
                        setOccasion(option.key);
                        if (option.key !== "anders") setGreetingMenuOpen(false);
                      }}
                      className={`block w-full border-t border-navy-900/10 px-4 py-2.5 text-left text-sm font-medium transition first:border-t-0 ${
                        occasion === option.key
                          ? "gold-gradient-bg text-navy-950"
                          : "text-navy-900/70 hover:bg-navy-900/5"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <input type="hidden" name="occasion" value={occasion} />

            {occasion === "anders" && (
              <input
                type="text"
                name="customGreeting"
                value={customGreeting}
                onChange={(e) => setCustomGreeting(e.target.value)}
                maxLength={CUSTOM_GREETING_MAX}
                placeholder={`Max ${CUSTOM_GREETING_MAX} tekens, bijv. Gefeliciteerd!`}
                required
                className={`${inputClass} mt-2`}
              />
            )}
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label htmlFor="message" className="block text-sm font-medium text-navy-900">
                Boodschap
              </label>
              <span
                className={`text-xs ${message.length > MAX_MESSAGE ? "text-red-600" : "text-navy-900/40"}`}
              >
                {message.length}/{MAX_MESSAGE}
              </span>
            </div>
            <textarea
              id="message"
              name="message"
              rows={6}
              maxLength={MAX_MESSAGE}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="giverName" className="mb-1 block text-sm font-medium text-navy-900">
              Naam gever
            </label>
            <input
              id="giverName"
              name="giverName"
              type="text"
              required
              value={giverName}
              onChange={(e) => setGiverName(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="giverEmail" className="mb-1 block text-sm font-medium text-navy-900">
              E-mailadres gever
            </label>
            <input
              id="giverEmail"
              name="giverEmail"
              type="email"
              required
              value={giverEmail}
              onChange={(e) => setGiverEmail(e.target.value)}
              placeholder="jij@voorbeeld.nl"
              className={inputClass}
            />
            <p className="mt-1 text-xs text-navy-900/40">
              Je ontvangt hier een melding zodra {recipientName || "de ontvanger"} iets besteedt.
            </p>
          </div>

          {state?.error && (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="inline-flex w-full items-center justify-center rounded-xl gold-gradient-bg px-5 py-3 text-sm font-semibold text-navy-950 shadow-sm shadow-gold-500/30 transition hover:brightness-105 active:brightness-95 disabled:pointer-events-none disabled:opacity-50"
          >
            {pending ? "Opslaan..." : "Wijzigingen opslaan"}
          </button>
        </form>

        <CardPanel label="Voorkant links">
          {photoPreviewUrl ? (
            <GiftPhoto photoUrl={photoPreviewUrl} greeting={greetingPreview} alt="Voorkant" />
          ) : (
            <div className="flex h-full items-center justify-center bg-white text-center text-[11px] text-navy-950">
              Nog geen foto gekozen
            </div>
          )}
        </CardPanel>

        <CardPanel label="Voorkant rechts">
          <CardFrontRight
            recipientName={recipientName || "Naam ontvanger"}
            giverName={giverName || "Naam gever"}
            qr={null}
            pendingHint="verschijnt op de deelkaart"
          />
        </CardPanel>

        <CardPanel label="Achterkant links">
          <CardBackText text={messageFront} emptyHint="Je boodschap verschijnt hier." />
        </CardPanel>

        <CardPanel label="Achterkant rechts">
          <CardBackText
            text={messageOverflow}
            emptyHint="(blijft leeg, tenzij de boodschap niet past op één vlak)"
          />
        </CardPanel>
      </div>
    </div>
  );
}
