import { useEffect, useId, useMemo, useState } from "react";
import { flushSync } from "react-dom";
import {
  buildCopySummary,
  calculate,
  defaultForm,
  formatGbp,
  formatPercent,
  type FormState,
  type InputMode,
} from "./calculator";

const LOGO_URL =
  "https://raw.githubusercontent.com/Gitkierenoffical/image-store-for-cordoval/main/logos/margins.svg";
const PRIVACY_URL = "https://scrub.cordoval.co.uk/privacy";
const TERMS_URL = "https://scrub.cordoval.co.uk/terms";
const CORDOVAL_HOME = "https://cordoval.co.uk";

function App() {
  const [form, setForm] = useState<FormState>(defaultForm);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => calculate(form), [form]);

  useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(id);
  }, [copied]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setCopied(false);
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function setMode(mode: InputMode) {
    setCopied(false);
    setForm((prev) => ({ ...prev, mode }));
  }

  function handleClear() {
    setCopied(false);
    setForm({ ...defaultForm });
  }

  function handleCopy() {
    if (!result.ok) return;
    const text = buildCopySummary(result);

    function legacyCopy(): boolean {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      textarea.setSelectionRange(0, text.length);
      let ok = false;
      try {
        ok = document.execCommand("copy");
      } finally {
        document.body.removeChild(textarea);
      }
      return ok;
    }

    const legacyOk = legacyCopy();
    flushSync(() => {
      setCopied(true);
    });
    if (!legacyOk) {
      window.setTimeout(() => {
        void navigator.clipboard?.writeText(text);
      }, 0);
    }
  }

  const sellId = useId();
  const costId = useId();
  const targetMarginId = useId();

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="header-inner">
          <a className="brand" href={CORDOVAL_HOME}>
            <img
              className="brand-mark"
              src={LOGO_URL}
              width={36}
              height={36}
              alt=""
            />
            <span className="brand-name">Cordoval</span>
          </a>
          <a className="header-link" href={CORDOVAL_HOME}>
            cordoval.co.uk
          </a>
        </div>
      </header>

      <main className="main">
        <div className="page">
          <p className="badge">Runs entirely in your browser</p>
          <h1 className="title">Cordoval Margins</h1>
          <p className="lede">
            Check profit, margin and markup from sell price and cost, or work out
            the sell price you need for a target margin. Clear or refresh wipes
            the form — nothing is stored.
          </p>

          <section className="card" aria-labelledby="figures-heading">
            <h2 id="figures-heading" className="visually-hidden">
              Your figures
            </h2>

            <div
              className="mode-tabs"
              role="tablist"
              aria-label="Calculation mode"
            >
              <button
                type="button"
                role="tab"
                id="tab-sell-cost"
                aria-selected={form.mode === "sellAndCost"}
                aria-controls="panel-sell-cost"
                className={
                  form.mode === "sellAndCost" ? "tab active" : "tab"
                }
                onClick={() => setMode("sellAndCost")}
              >
                Sell price &amp; cost
              </button>
              <button
                type="button"
                role="tab"
                id="tab-target-margin"
                aria-selected={form.mode === "costAndMargin"}
                aria-controls="panel-target-margin"
                className={
                  form.mode === "costAndMargin" ? "tab active" : "tab"
                }
                onClick={() => setMode("costAndMargin")}
              >
                Cost &amp; target margin
              </button>
            </div>

            {form.mode === "sellAndCost" ? (
              <div
                id="panel-sell-cost"
                role="tabpanel"
                aria-labelledby="tab-sell-cost"
                className="field-grid"
              >
                <div className="field">
                  <label htmlFor={sellId}>Sell price</label>
                  <div className="input-wrap">
                    <span className="input-prefix" aria-hidden="true">
                      £
                    </span>
                    <input
                      id={sellId}
                      name="sellPrice"
                      type="text"
                      inputMode="decimal"
                      autoComplete="off"
                      value={form.sellPrice}
                      onChange={(e) =>
                        updateField("sellPrice", e.target.value)
                      }
                      placeholder="120.00"
                    />
                  </div>
                </div>
                <div className="field">
                  <label htmlFor={costId}>Cost</label>
                  <div className="input-wrap">
                    <span className="input-prefix" aria-hidden="true">
                      £
                    </span>
                    <input
                      id={costId}
                      name="cost"
                      type="text"
                      inputMode="decimal"
                      autoComplete="off"
                      value={form.cost}
                      onChange={(e) => updateField("cost", e.target.value)}
                      placeholder="80.00"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div
                id="panel-target-margin"
                role="tabpanel"
                aria-labelledby="tab-target-margin"
                className="field-grid"
              >
                <div className="field">
                  <label htmlFor={costId}>Cost</label>
                  <div className="input-wrap">
                    <span className="input-prefix" aria-hidden="true">
                      £
                    </span>
                    <input
                      id={costId}
                      name="cost"
                      type="text"
                      inputMode="decimal"
                      autoComplete="off"
                      value={form.cost}
                      onChange={(e) => updateField("cost", e.target.value)}
                      placeholder="80.00"
                    />
                  </div>
                </div>
                <div className="field">
                  <label htmlFor={targetMarginId}>Target margin</label>
                  <div className="input-wrap">
                    <input
                      id={targetMarginId}
                      name="targetMarginPercent"
                      type="text"
                      inputMode="decimal"
                      autoComplete="off"
                      value={form.targetMarginPercent}
                      onChange={(e) =>
                        updateField("targetMarginPercent", e.target.value)
                      }
                      placeholder="25"
                    />
                    <span className="input-suffix" aria-hidden="true">%</span>
                  </div>
                </div>
              </div>
            )}

            <div className="actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={handleClear}
              >
                Clear
              </button>
            </div>

            {!result.ok && (
              <p className="error" role="status">{result.error}</p>
            )}

            {result.ok && (
              <div className="results">
                <dl className="rate-list">
                  {form.mode === "costAndMargin" && (
                    <div className="rate-row highlight">
                      <dt>Required sell price</dt>
                      <dd>{formatGbp(result.sellPrice)}</dd>
                    </div>
                  )}
                  {form.mode === "sellAndCost" && (
                    <div className="rate-row">
                      <dt>Sell price</dt>
                      <dd>{formatGbp(result.sellPrice)}</dd>
                    </div>
                  )}
                  <div className="rate-row">
                    <dt>Cost</dt>
                    <dd>{formatGbp(result.cost)}</dd>
                  </div>
                  <div className="rate-row highlight">
                    <dt>Profit</dt>
                    <dd>{formatGbp(result.profit)}</dd>
                  </div>
                  <div className="rate-row">
                    <dt>Margin</dt>
                    <dd>{formatPercent(result.marginPercent)}</dd>
                  </div>
                  <div className="rate-row">
                    <dt>Markup</dt>
                    <dd>{formatPercent(result.markupPercent)}</dd>
                  </div>
                </dl>
                <button
                  type="button"
                  className={copied ? "btn-primary copied" : "btn-primary"}
                  onClick={handleCopy}
                  aria-live="polite"
                >
                  {copied ? "Copied" : "Copy summary"}
                </button>
              </div>
            )}
          </section>
        </div>
      </main>

      <footer className="site-footer">
        <div className="footer-inner">
          <p>
            A{" "}
            <a href={CORDOVAL_HOME}>Cordoval</a> product. Nothing is stored.
          </p>
          <nav className="footer-nav" aria-label="Legal">
            <a href={PRIVACY_URL}>Privacy Policy</a>
            <a href={TERMS_URL}>Terms of Service</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}

export default App;
