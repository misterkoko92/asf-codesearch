"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader, type IScannerControls } from "@zxing/browser";
import { BarcodeFormat } from "@zxing/library";

type Props = {
  onScan: (payload: ScanPayload) => void;
};

export type ScanPayload = {
  text: string;
  format: string | null;
};

export default function Scanner({ onScan }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const [active, setActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!active) {
      controlsRef.current?.stop();
      controlsRef.current = null;
      return;
    }

    const reader = new BrowserMultiFormatReader();
    let canceled = false;
    const videoElement = videoRef.current;

    if (!videoElement) {
      setError("Video element not ready");
      return;
    }

    setError(null);
    reader
      .decodeFromVideoDevice(undefined, videoElement, (result, err) => {
        if (result) {
          const format = BarcodeFormat[result.getBarcodeFormat()] ?? null;
          onScan({ text: result.getText(), format });
          setActive(false);
        }
        if (err && !canceled) {
          const name = (err as Error).name;
          if (["NotFoundException", "ChecksumException", "FormatException"].includes(name)) {
            return;
          }
          setError("Camera error. Please check permissions.");
        }
      })
      .then((controls) => {
        controlsRef.current = controls;
      })
      .catch(() => {
        if (!canceled) {
          setError("Unable to start camera");
        }
      });

    return () => {
      canceled = true;
      controlsRef.current?.stop();
      controlsRef.current = null;
    };
  }, [active, onScan]);

  return (
    <div className="stack">
      <div className="panel-title">Scan camera</div>
      <div className="toolbar">
        <button className="button" type="button" onClick={() => setActive((prev) => !prev)}>
          {active ? "Stop" : "Demarrer scan"}
        </button>
      </div>
      {active ? (
        <video ref={videoRef} style={{ width: "100%", borderRadius: "16px" }} muted playsInline />
      ) : (
        <div className="notice">Camera inactive. Demarrer pour scanner un code-barres.</div>
      )}
      {error ? <div className="notice">{error}</div> : null}
    </div>
  );
}
