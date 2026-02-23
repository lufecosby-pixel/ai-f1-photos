"use client";

import { useState } from "react";

export default function Page() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [resultUrl, setResultUrl] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  function onPickFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setResultUrl("");
    setStatus("");
    setPreviewUrl(URL.createObjectURL(f));
  }

  async function onGenerate() {
    if (!file) return;
    setLoading(true);
    setStatus("Uploading…");

    try {
      const form = new FormData();
      form.append("image", file);

      const res = await fetch("/api/generate", { method: "POST", body: form });
      if (!res.ok) throw new Error(await res.text());

      const { predictionId } = await res.json();

      setStatus("Generating…");
      for (let i = 0; i < 80; i++) {
        await new Promise((r) => setTimeout(r, 1500));
        const poll = await fetch(`/api/poll?id=${encodeURIComponent(predictionId)}`);
        const p = await poll.json();

        if (p.status === "succeeded") {
          setResultUrl(p.outputUrl);
          setStatus("Done!");
          setLoading(false);
          return;
        }
        if (p.status === "failed") throw new Error("Generation failed.");
        setStatus(`Generating… (${p.status})`);
      }

      throw new Error("Timed out waiting for the image.");
    } catch (err) {
      setStatus(err?.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.h1}>AI F1 Cartoon Booth</h1>
        <p style={styles.p}>
          Take a selfie → get an F1-themed cartoon. No app download.
        </p>

        <label style={styles.label}>
          <div style={styles.btnSecondary}>Take / Upload Selfie</div>
          <input
            type="file"
            accept="image/*"
            capture="user"
            onChange={onPickFile}
            style={{ display: "none" }}
          />
        </label>

        {previewUrl && (
          <div style={{ marginTop: 14 }}>
            <div style={styles.small}>Preview</div>
            <img src={previewUrl} alt="preview" style={styles.img} />
          </div>
        )}

        <button
          onClick={onGenerate}
          disabled={!file || loading}
          style={{ ...styles.btnPrimary, opacity: !file || loading ? 0.6 : 1 }}
        >
          {loading ? "Generating…" : "Generate Cartoon"}
        </button>

        {!!status && <div style={styles.status}>{status}</div>}

        {resultUrl && (
          <div style={{ marginTop: 14 }}>
            <div style={styles.small}>Your Cartoon</div>
            <img src={resultUrl} alt="result" style={styles.img} />
            <a href={resultUrl} target="_blank" rel="noreferrer" style={styles.link}>
              Open / Download
            </a>
          </div>
        )}

        <div style={styles.footer}>
          Best results: good lighting, face centered, no sunglasses.
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    background: "#0b0f19",
    color: "white",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
  },
  card: {
    width: "min(520px, 100%)",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 18,
    padding: 18
  },
  h1: { margin: 0, fontSize: 22 },
  p: { marginTop: 8, opacity: 0.9, lineHeight: 1.4 },
  label: { display: "inline-block", marginTop: 8, cursor: "pointer" },
  btnSecondary: {
    display: "inline-block",
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.25)"
  },
  btnPrimary: {
    marginTop: 14,
    width: "100%",
    padding: "12px 14px",
    borderRadius: 12,
    border: "none",
    background: "white",
    color: "#0b0f19",
    fontWeight: 700,
    cursor: "pointer"
  },
  status: { marginTop: 10, opacity: 0.9 },
  small: { fontSize: 12, opacity: 0.8, marginBottom: 6 },
  img: {
    width: "100%",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.14)"
  },
  link: { display: "inline-block", marginTop: 8, color: "white", textDecoration: "underline" },
  footer: { marginTop: 14, fontSize: 12, opacity: 0.75 }
};
