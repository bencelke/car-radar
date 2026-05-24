import { cn } from "@/lib/utils";

type MemberBuildTagsProps = {
  tags: string[];
  className?: string;
};

export function MemberBuildTags({ tags, className }: MemberBuildTagsProps) {
  if (!tags.length) return null;

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {tags.map((tag) => (
        <span
          key={tag}
          className="rounded-full border border-[#EF4444]/25 bg-gradient-to-r from-[#EF4444]/12 to-[#7C3AED]/10 px-2.5 py-0.5 text-[10px] font-medium text-[#F8FAFC]"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}
