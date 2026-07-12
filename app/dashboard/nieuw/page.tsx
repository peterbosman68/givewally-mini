import NewGiftForm from "@/components/NewGiftForm";

export const dynamic = "force-dynamic";

export default function NieuwCadeauPage() {
  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold text-white">Nieuw cadeau</h1>
      <NewGiftForm />
    </div>
  );
}
