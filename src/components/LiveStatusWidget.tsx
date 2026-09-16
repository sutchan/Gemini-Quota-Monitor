'use client';

export default function LiveStatusWidget() {
  return (
    <div className="fixed top-4 right-4 w-64 p-4 bg-gray-900 text-white rounded-lg shadow-lg border border-gray-700">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-sm">Gemini Usage (Demo)</h3>
        <button className="text-gray-400 hover:text-white">−</button>
      </div>
      <div className="text-right font-mono font-semibold mb-2">850/1500</div>
      <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
        <div className="bg-yellow-400 h-full w-[56%]"></div>
      </div>
      <div className="mt-2 text-right text-xs opacity-50">UTC 00:00 Reset</div>
    </div>
  );
}
