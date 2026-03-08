export default function Loader() {
  return (
    <div className="flex justify-center items-center py-12">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-slate-700/30" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#6366f1] border-r-[#6366f1] animate-spin" />
        <div className="absolute inset-4 rounded-full bg-[#6366f1]/20" />
      </div>
    </div>
  );
}
