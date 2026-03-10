import { Link } from "@/i18n/routing";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 p-8 font-sans dark:bg-black">
      <main className="w-full max-w-3xl text-center">
        <h1 className="mb-4 text-4xl font-bold text-black dark:text-zinc-50">
          TounesHelp - Helping Those in Need
        </h1>
        <p className="mb-8 text-lg text-zinc-600 dark:text-zinc-400">
          Bridging the gap between marginalized communities in Tunisia's
          underserved regions and the organizations, volunteers, and donors who
          can help them.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/fr/login"
            className="flex h-12 items-center justify-center rounded-full bg-blue-600 px-5 text-white transition-colors hover:bg-blue-700"
          >
            Login
          </Link>
          <Link
            href="/fr/register"
            className="flex h-12 items-center justify-center rounded-full border border-black px-5 text-black transition-colors hover:bg-black hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black"
          >
            Register
          </Link>
        </div>
      </main>
    </div>
  );
}
