"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

type ShareQrCodeProps = {
  url: string;
  size?: number;
  className?: string;
};

export function ShareQrCode({ url, size = 88, className }: ShareQrCodeProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void QRCode.toDataURL(url, {
      width: size,
      margin: 1,
      color: { dark: "#F8FAFC", light: "#0B111800" },
    }).then((value) => {
      if (!cancelled) setDataUrl(value);
    });
    return () => {
      cancelled = true;
    };
  }, [url, size]);

  if (!dataUrl) {
    return (
      <div
        className={className}
        style={{ width: size, height: size }}
        aria-hidden
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={dataUrl}
      alt=""
      width={size}
      height={size}
      className={className}
    />
  );
}
