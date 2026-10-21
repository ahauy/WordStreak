import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

export interface SourceAttributionBadgeProps {
  license?: string;
  authors?: string;
  showAuthors?: boolean;
  showLink?: boolean;
  href?: string;
  className?: string;
}

export const SourceAttributionBadge: React.FC<SourceAttributionBadgeProps> = ({
  license = "CC BY-SA 4.0",
  authors = "Browne, Culligan & Phillips",
  showAuthors = false,
  showLink = true,
  href = "/sources",
  className = "",
}) => {
  const content = (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono border transition-colors ${
        showLink
          ? "bg-[#fafafa] border-[#e5e5e5] text-[#525252] hover:text-[#090909] hover:border-[#d4d4d4]"
          : "bg-[#fafafa] border-[#e5e5e5] text-[#737373]"
      } ${className}`}
    >
      <ShieldCheck className="w-3 h-3 text-[#525252]" />
      <span>{license}</span>
      {showAuthors && (
        <>
          <span className="text-[#a3a3a3]">·</span>
          <span className="font-sans font-medium text-[11px] text-[#525252] truncate max-w-[140px] sm:max-w-none">
            {authors}
          </span>
        </>
      )}
    </span>
  );

  if (showLink && href) {
    return (
      <Link
        to={href}
        title={`Bản quyền nguồn dữ liệu (${license})`}
        className="inline-flex cursor-pointer focus:outline-none focus:ring-1 focus:ring-black rounded-full"
      >
        {content}
      </Link>
    );
  }

  return content;
};
