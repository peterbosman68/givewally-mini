"use client";

import { useState, useActionState } from "react";
import { createGiftAction, type GiftFormState } from "@/app/dashboard/actions";
import { GREETING_OPTIONS, CUSTOM_GREETING_MAX, resolveGreeting, type GreetingKey } from "@/lib/greeting";
import { splitMessageForCard } from "@/lib/cardText";
import PhotoCropper from "@/components/PhotoCropper";
import GiftPhoto from "@/components/GiftPhoto";
import CardPanel from "@/components/CardPanel";

const MAX_MESSAGE = 1500;

const inputClass =
  "w-full rounded-xl border border-navy-900/15 bg-white px-4 py-3 text-sm focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500";

export default function NewGiftForm() {
  const [state, formAction, pending] = useActionState<GiftFormState, FormData>(
    createGiftAction,
    null
  );

  const [recipientName, setRecipientName] = useState("");
  const [amountInput, setAmountInput] = useState("");
  const [message, setMessage] = useState("");
  const [giverName, setGiverName] = useState("");
  const [occasion, setOccasion] = useState<GreetingKey>("algemeen");
  const [customGreeting, setCustomGreeting] = useState("");
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [greetingMenuOpen, setGreetingMenuOpen] = useState(false);

  const greetingPreview = resolveGreeting(occasion, customGreeting) ?? "Jouw boodschap";
  const selectedGreetingLabel =
    GREETING_OPTIONS.find((option) => option.key === occasion)?.label ?? "Kies een boodschap";
  const { front: messageFront, overflow: messageOverflow } = splitMessageForCard(message);

  return (
    <div>
      <p className="mb-2 text-sm text-white/50 lg:hidden">
        Vul de gegevens in — swipe naar rechts voor een voorbeeld van de kaart →
      </p>

      {/* Mobiel: formulier + 4 kaartvlakken zijn één doorlopende horizontale swipe-rij.
          Desktop (lg): grid met formulier + 4 kaartvlakken naast elkaar, over de volle breedte. */}
      <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory lg:grid lg:grid-cols-[minmax(320px,420px)_repeat(4,auto)] lg:items-start lg:gap-6 lg:overflow-visible lg:snap-none lg:pb-0">
        <form
          action={formAction}
          className="w-[90vw] max-w-md shrink-0 snap-start space-y-5 rounded-2xl border border-navy-900/10 bg-white p-5 shadow-sm lg:w-auto lg:max-w-none lg:shrink"
        >
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
            <PhotoCropper name="photo" onPreviewChange={setPhotoPreviewUrl} />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-navy-900">
              Boodschap op de foto
            </label>

            <button
              type="button"
              onClick={() => setGreetingMenuOpen((open) => !open)}
              aria-expanded={greetingMenuOpen}
              className={`flex w-full items-center justify-between rounded-xl border bg-white px-4 py-3 text-sm font-medium text-navy-900 transition ${
                greetingMenuOpen ? "border-gold-500" : "border-navy-900/15"
              }`}
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
              <div className="mt-2 flex flex-wrap gap-2">
                {GREETING_OPTIONS.map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => {
                      setOccasion(option.key);
                      if (option.key !== "anders") setGreetingMenuOpen(false);
                    }}
                    className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                      occasion === option.key
                        ? "border-gold-500 gold-gradient-bg text-navy-950"
                        : "border-navy-900/15 text-navy-900/70 hover:border-gold-500/50"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}

            <input type="hidden" name="occasion" value={occasion} />

            {occasion === "anders" && (
              <input
                type="text"
                name="customGreeting"
                value={customGreeting}
                onChange={(e) => setCustomGreeting(e.target.value)}
                maxLength={CUSTOM_GREETING_MAX}
                placeholder="Max 10 tekens, bijv. Gefeliciteerd"
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

          {state?.error && (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="inline-flex w-full items-center justify-center rounded-xl gold-gradient-bg px-5 py-3 text-sm font-semibold text-navy-950 shadow-sm shadow-gold-500/30 transition hover:brightness-105 active:brightness-95 disabled:pointer-events-none disabled:opacity-50"
          >
            {pending ? "Cadeau aanmaken..." : "Cadeau aanmaken"}
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
          <div className="navy-gradient-bg flex h-full flex-col items-center justify-between gap-1.5 p-2.5 text-center text-white">
            <div>
              <p className="text-[8px] uppercase tracking-wide text-white/50">Voor</p>
              <p className="text-xs font-semibold leading-tight">
                {recipientName || "Naam ontvanger"}
              </p>
            </div>
            <p className="text-[7.5px] leading-snug text-white/70">
              Door deze QR-code of link te openen, opent u een webapp die u op uw telefoon of
              computer kunt installeren.
            </p>
            <div className="flex flex-col items-center gap-0.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/10 text-center text-[7px] leading-tight text-white/40">
                QR + link
              </div>
              <p className="text-[7px] text-white/40">verschijnt na aanmaken</p>
            </div>
            <p className="text-[8px] text-white/60">— {giverName || "Naam gever"}</p>
          </div>
        </CardPanel>

        <CardPanel label="Achterkant links">
          <div className="h-full overflow-hidden bg-white p-3">
            <p className="whitespace-pre-wrap text-[10px] leading-snug text-navy-900/80">
              {messageFront || "Je boodschap verschijnt hier."}
            </p>
          </div>
        </CardPanel>

        <CardPanel label="Achterkant rechts">
          <div className="h-full overflow-hidden bg-white p-3">
            {messageOverflow ? (
              <p className="whitespace-pre-wrap text-[10px] leading-snug text-navy-900/80">
                {messageOverflow}
              </p>
            ) : (
              <p className="text-[10px] text-navy-900/30">
                (blijft leeg, tenzij de boodschap niet past op één vlak)
              </p>
            )}
          </div>
        </CardPanel>
      </div>
    </div>
  );
}
