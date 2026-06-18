"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

import { useLocale } from "@/components/providers/LocaleProvider";
import { Button } from "@/components/ui/button";
import { copyShareLink } from "@/lib/share/web-share";

type CopyLinkButtonProps = {
  url: string;
  onCopied?: () => void;
  className?: string;
};

export function CopyLinkButton({ url, onCopied, className }: CopyLinkButtonProps) {
  const { t } = useLocale();
  const [copied, setCopied] = useState(false);

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      className={className}
      onClick={() => {
        void copyShareLink(url).then((ok) => {
          if (ok) {
            setCopied(true);
            onCopied?.();
            setTimeout(() => setCopied(false), 2000);
          }
        });
      }}
    >
      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      {copied ? t.share.linkCopied : t.share.copyLink}
    </Button>
  );
}
