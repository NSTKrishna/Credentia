export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans text-slate-900">
      <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4 shadow-sm">
            <span className="text-white font-bold text-xl tracking-tight">BGV</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">BGV Platform</h1>
          <p className="text-sm text-slate-500 mt-1">Background Verification System</p>
        </div>
        {children}
      </div>
    </div>
  );
}
