export default function Page() {
  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold underline">Twinin!</h1>
      {process.env.NODE_ENV !== "production" && (
        <form method="post" action="/api/dev/pen" className="mt-6">
          <button className="rounded bg-black px-4 py-2 text-white">
            Buy Sapiom pen! (sandbox mode)
          </button>
        </form>
      )}
    </main>
  );
}