export default function ResetIndicator() {
  return (
    <div className="my-8 p-6 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
      <h3 className="font-semibold text-blue-900 dark:text-blue-100">每日使用重置</h3>
      <p className="text-blue-700 dark:text-blue-300">
        您的使用计数器会在每日 <strong>UTC 00:00</strong> 自动归零。
      </p>
      <div className="mt-4 flex items-center gap-2">
        <div className="flex-1 h-3 bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 w-[60%]"></div>
        </div>
        <span className="text-xs text-blue-600 dark:text-blue-400">进行中</span>
      </div>
    </div>
  );
}
