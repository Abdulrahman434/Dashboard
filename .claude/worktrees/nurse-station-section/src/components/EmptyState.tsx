interface EmptyStateProps {
  title: string;
}

export default function EmptyState({ title }: EmptyStateProps) {
  return (
    <div className="h-full overflow-auto p-8">
      <h2 className="text-[24px] font-semibold text-[#16274D] font-['Poppins',sans-serif] mb-6">
        {title}
      </h2>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
        <p className="text-[13px] text-[#6B7280] font-['Poppins',sans-serif]">
          Content for {title} will be added here.
        </p>
      </div>
    </div>
  );
}
