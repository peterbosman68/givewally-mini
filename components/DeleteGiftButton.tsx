"use client";

import { deleteGiftAction } from "@/app/dashboard/actions";

export default function DeleteGiftButton({
  giftId,
  recipientName,
}: {
  giftId: string;
  recipientName: string;
}) {
  return (
    <form
      action={deleteGiftAction}
      onSubmit={(e) => {
        const confirmed = window.confirm(
          `Weet je zeker dat je het cadeau voor ${recipientName} wilt verwijderen? Dit kan niet ongedaan worden gemaakt.`
        );
        if (!confirmed) e.preventDefault();
      }}
    >
      <input type="hidden" name="giftId" value={giftId} />
      <button
        type="submit"
        title="Cadeau verwijderen"
        aria-label={`Cadeau voor ${recipientName} verwijderen`}
        className="shrink-0 rounded-lg p-2 text-navy-900/30 transition hover:bg-red-50 hover:text-red-600"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 7h12M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m-8 0h10l-.867 12.142A2 2 0 0114.138 21H9.862a2 2 0 01-1.995-1.858L7 7z" />
        </svg>
      </button>
    </form>
  );
}
