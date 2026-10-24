import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type FormEvent,
} from "react";
import { X, Link2 } from "lucide-react";
import { evidenceSchema } from "../domain/schema";
import {
  DRIVER_META,
  KINDS,
  fromDisplay,
  toDisplay,
  type Assumption,
  type Evidence,
  type Thesis,
} from "../domain/types";

export function Modal({
  title,
  subtitle,
  close,
  children,
}: {
  title: string;
  subtitle?: string;
  close: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    ref.current?.showModal();
  }, []);
  return (
    <dialog
      ref={ref}
      className="modal"
      aria-labelledby="dialog-title"
      onCancel={close}
      onClick={(e) => {
        if (e.target === ref.current) {
          const rect = ref.current.getBoundingClientRect();
          if (
            e.clientX < rect.left ||
            e.clientX > rect.right ||
            e.clientY < rect.top ||
            e.clientY > rect.bottom
          )
            close();
        }
      }}
    >
      <div className="modal-head">
        <div>
          <h2 id="dialog-title">{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        <button
          className="icon-button"
          aria-label="Close dialog"
          onClick={close}
        >
          <X size={19} />
        </button>
      </div>
      {children}
    </dialog>
  );
}

function ErrorMessage({ error }: { error: string }) {
  return error ? (
    <p className="form-error" role="alert">
      {error}
    </p>
  ) : null;
}

export function ThesisEditor({
  thesis,
  save,
  close,
}: {
  thesis: Thesis;
  save: (value: Thesis) => string | null;
  close: () => void;
}) {
  const [company, setCompany] = useState(thesis.companyName);
  const [text, setText] = useState(thesis.text);
  const [error, setError] = useState("");
  function submit(e: FormEvent) {
    e.preventDefault();
    const failure = save({
      ...thesis,
      companyName: company.trim(),
      text: text.trim(),
      updatedAt: new Date().toISOString(),
    });
    if (failure) setError(failure);
    else close();
  }
  return (
    <Modal
      title="Edit investment thesis"
      subtitle="Put the belief behind the numbers into words."
      close={close}
    >
      <form onSubmit={submit} className="editor-form">
        <label>
          Company name
          <input
            autoFocus
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            required
            maxLength={100}
          />
        </label>
        <label>
          Investment thesis
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
            maxLength={2000}
            rows={4}
          />
        </label>
        <ErrorMessage error={error} />
        <div className="form-actions">
          <button type="button" className="button secondary" onClick={close}>
            Cancel
          </button>
          <button className="button primary">Save thesis</button>
        </div>
      </form>
    </Modal>
  );
}

export function AssumptionEditor({
  assumptions,
  selectedId,
  save,
  close,
}: {
  assumptions: Assumption[];
  selectedId: string;
  save: (value: Assumption[]) => string | null;
  close: () => void;
}) {
  const [drafts, setDrafts] = useState(
    assumptions.map((a) => ({
      ...a,
      displayValue: String(toDisplay(a.driverKey, a.value)),
    })),
  );
  const [error, setError] = useState("");
  const selected = drafts.find((a) => a.id === selectedId)!;
  function submit(e: FormEvent) {
    e.preventDefault();
    const reviewDate = String(
      new FormData(e.currentTarget as HTMLFormElement).get("reviewOn") ?? "",
    );
    const values = drafts.map(({ displayValue, ...a }) => ({
      ...a,
      ...(a.id === selectedId ? { reviewOn: reviewDate || undefined } : {}),
      value: fromDisplay(
        a.driverKey,
        displayValue.trim() === "" ? NaN : Number(displayValue),
      ),
    }));
    const failure = save(values);
    if (failure) setError(failure);
    else close();
  }
  function updateSelected(
    key: "rationale" | "reviewCondition" | "reviewOn",
    value: string,
  ) {
    setDrafts(
      drafts.map((a) =>
        a.id === selectedId
          ? { ...a, [key]: key === "reviewOn" && !value ? undefined : value }
          : a,
      ),
    );
  }
  return (
    <Modal
      title="Edit original assumptions"
      subtitle="These values define the base case. Scenarios stay separate."
      close={close}
    >
      <form className="editor-form" onSubmit={submit}>
        <div className="field-grid">
          {drafts.map((a, i) => (
            <label key={a.id}>
              {DRIVER_META[a.driverKey].label}
              {a.driverKey === "revenueNow"
                ? " (£m)"
                : a.driverKey === "years"
                  ? " (years)"
                  : " (%)"}
              <input
                autoFocus={i === 0}
                type="number"
                step={a.driverKey === "years" ? 1 : "any"}
                required
                value={a.displayValue}
                onChange={(e) =>
                  setDrafts(
                    drafts.map((v) =>
                      v.id === a.id
                        ? { ...v, displayValue: e.target.value }
                        : v,
                    ),
                  )
                }
              />
            </label>
          ))}
        </div>
        <div className="editor-divider">
          {DRIVER_META[selected.driverKey].label} · reasoning & review
        </div>
        <label>
          Rationale
          <textarea
            required
            value={selected.rationale}
            maxLength={4000}
            rows={2}
            onChange={(e) => updateSelected("rationale", e.target.value)}
          />
        </label>
        <label>
          Review condition
          <textarea
            value={selected.reviewCondition}
            maxLength={4000}
            rows={2}
            onChange={(e) => {
              setDrafts(
                drafts.map((a) =>
                  a.id === selectedId
                    ? { ...a, reviewCondition: e.target.value }
                    : a,
                ),
              );
            }}
          />
        </label>
        <label>
          Review date <span className="optional">optional reminder</span>
          <input
            name="reviewOn"
            type="date"
            value={selected.reviewOn ?? ""}
            onInput={(e) => updateSelected("reviewOn", e.currentTarget.value)}
            onChange={(e) => updateSelected("reviewOn", e.target.value)}
          />
        </label>
        <ErrorMessage error={error} />
        <div className="form-actions">
          <button type="button" className="button secondary" onClick={close}>
            Cancel
          </button>
          <button className="button primary">Save assumptions</button>
        </div>
      </form>
    </Modal>
  );
}

export function EvidenceEditor({
  initial,
  assumptions,
  selectedId,
  save,
  close,
}: {
  initial?: Evidence;
  assumptions: Assumption[];
  selectedId: string;
  save: (value: Evidence) => string | null;
  close: () => void;
}) {
  const [draft, setDraft] = useState<Evidence>(
    () =>
      initial ?? {
        id: crypto.randomUUID(),
        assumptionId: selectedId,
        sourceTitle: "",
        sourceUrl: "",
        observedOn: new Date().toLocaleDateString("en-CA"),
        excerpt: "",
        kind: "contradicts",
        explanation: "",
      },
  );
  const [error, setError] = useState("");
  function change<K extends keyof Evidence>(key: K, value: Evidence[K]) {
    setDraft({ ...draft, [key]: value });
  }
  function submit(e: FormEvent) {
    e.preventDefault();
    const observedOn = String(
      new FormData(e.currentTarget as HTMLFormElement).get("observedOn") ??
        draft.observedOn,
    );
    const parsed = evidenceSchema.safeParse({
      ...draft,
      observedOn,
      sourceUrl: draft.sourceUrl.trim(),
    });
    if (!parsed.success) {
      setError(parsed.error.issues.map((i) => i.message).join(" "));
      return;
    }
    const failure = save(parsed.data);
    if (failure) setError(failure);
    else close();
  }
  return (
    <Modal
      title={initial ? "Edit evidence" : "Add evidence"}
      subtitle="Record the observation, then make your own judgment."
      close={close}
    >
      <form className="editor-form" onSubmit={submit}>
        <div className="field-grid">
          <label>
            Linked assumption
            <select
              value={draft.assumptionId}
              onChange={(e) => change("assumptionId", e.target.value)}
            >
              {assumptions.map((a) => (
                <option value={a.id} key={a.id}>
                  {DRIVER_META[a.driverKey].label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Observed on
            <input
              name="observedOn"
              type="date"
              required
              value={draft.observedOn}
              onInput={(e) => change("observedOn", e.currentTarget.value)}
              onChange={(e) => change("observedOn", e.target.value)}
            />
          </label>
        </div>
        <label>
          Source title
          <input
            autoFocus
            required
            maxLength={200}
            placeholder="e.g. Product pricing review"
            value={draft.sourceTitle}
            onChange={(e) => change("sourceTitle", e.target.value)}
          />
        </label>
        <label>
          <span className="inline-label">
            <Link2 size={13} /> Source URL{" "}
            <span className="optional">optional</span>
          </span>
          <input
            type="url"
            placeholder="https://… or leave blank for an analyst note"
            value={draft.sourceUrl}
            onChange={(e) => change("sourceUrl", e.target.value)}
            maxLength={2000}
          />
        </label>
        <label>
          Observation or excerpt
          <textarea
            required
            rows={2}
            maxLength={4000}
            placeholder="What did you observe?"
            value={draft.excerpt}
            onChange={(e) => change("excerpt", e.target.value)}
          />
        </label>
        <fieldset className="classification">
          <legend>How does it affect the assumption?</legend>
          <div>
            {KINDS.map((kind) => (
              <label
                key={kind}
                className={`kind-option ${draft.kind === kind ? `chosen ${kind}` : ""}`}
              >
                <input
                  type="radio"
                  name="classification"
                  value={kind}
                  checked={draft.kind === kind}
                  onChange={() => change("kind", kind)}
                />
                <span>{kind[0].toUpperCase() + kind.slice(1)}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <label>
          Your explanation
          <textarea
            required
            rows={2}
            maxLength={4000}
            placeholder="Why does this change—or reinforce—your reasoning?"
            value={draft.explanation}
            onChange={(e) => change("explanation", e.target.value)}
          />
        </label>
        <p className="field-help">
          Classifications are your judgment. A source link does not verify a
          claim.
        </p>
        <ErrorMessage error={error} />
        <div className="form-actions">
          <button type="button" className="button secondary" onClick={close}>
            Cancel
          </button>
          <button className="button primary">
            {initial ? "Save evidence" : "Add evidence"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
