/**
 * Site footer with fan-made disclaimer.
 */
export default function ClinicFooter() {
  return (
    <footer className="px-4 sm:px-6 py-8 sm:py-12 text-center">
      <div className="max-w-lg mx-auto">
        {/* Divider */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-zinc-800" />
          <span className="text-zinc-600 text-xs">🎈</span>
          <div className="flex-1 h-px bg-zinc-800" />
        </div>

        <p className="text-xs text-zinc-600 leading-relaxed mb-2">
          本门诊不治病，只负责陪你把今晚过完。
        </p>
        <p className="text-xs text-zinc-700 mb-3">
          Fan-made project, not affiliated with Eason Chan or official teams.
        </p>

        <p className="text-sm text-clinic-gold/70 italic tracking-wide mb-4">
          感谢永远有歌把心境道破。
        </p>

        <div className="mt-4 flex items-center justify-center gap-2 text-zinc-700">
          <span className="w-1 h-1 rounded-full bg-clinic-red/50" />
          <span className="w-1 h-1 rounded-full bg-clinic-blue/50" />
          <span className="w-1 h-1 rounded-full bg-clinic-red/50" />
        </div>
      </div>
    </footer>
  );
}
