export default function HomePage() {
  return (
    <main className="min-h-dvh p-8">
      <h1 className="text-2xl font-bold">구스토 원정대 🍝</h1>
      <p className="mt-2 text-sm opacity-80">
        재료를 탐험해서 조합을 발견하는 서비스
      </p>

      <div className="mt-6 flex gap-3">
        <a className="underline" href="/explore">탐험 시작</a>
        <a className="underline" href="/admin">어드민</a>
      </div>
    </main>
  );
}
