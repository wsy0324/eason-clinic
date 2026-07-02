/**
 * Site footer with pay codes and credits.
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

        {/* Pay codes */}
        <div className="mb-6">
          <p className="text-xs text-zinc-500 mb-3 leading-relaxed">
            如果这张处方刚好陪到你，欢迎 EF 随缘投喂，帮小站续一口域名费 🩺
          </p>
          <div className="flex justify-center gap-4 sm:gap-6">
            <div className="text-center">
              <img
                src="/assets/pay_code/c28086ba733772da860f1cf7c39d3837.jpg"
                alt="微信赞赏"
                className="w-28 h-28 sm:w-32 sm:h-32 object-cover rounded-lg border border-zinc-700/50"
              />
              <span className="text-[10px] text-zinc-600 mt-1 block">微信</span>
            </div>
            <div className="text-center">
              <img
                src="/assets/pay_code/e0ffa62958f83a5520f510c8f5636cae.jpg"
                alt="支付宝赞赏"
                className="w-28 h-28 sm:w-32 sm:h-32 object-cover rounded-lg border border-zinc-700/50"
              />
              <span className="text-[10px] text-zinc-600 mt-1 block">支付宝</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-zinc-600 leading-relaxed mb-2">
          本门诊不提供医学诊断，只负责把此刻的心情交给一首歌照看。
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
