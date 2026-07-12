import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import LoginForm from "@/components/LoginForm";
import Logo from "@/components/Logo";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await isAuthenticated()) redirect("/dashboard");

  return (
    <main className="navy-gradient-bg flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo width={200} />
        </div>
        <h1 className="mb-4 text-center text-xl font-semibold text-white">Inloggen</h1>
        <LoginForm />
      </div>
    </main>
  );
}
