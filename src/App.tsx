import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import {
  ArrowDown,
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  CircleHelp,
  Download,
  FileJson,
  FileText,
  FlaskConical,
  FolderOpen,
  History,
  Info,
  Lightbulb,
  LockKeyhole,
  Pencil,
  Plus,
  RotateCcw,
  Save,
  Upload,
  X,
} from "lucide-react";
import { createAster } from "./demo/aster";
import { calculateScenario } from "./domain/calculate";
import { validateWorkspace } from "./domain/schema";
import {
  DRIVER_META,
  getDrivers,
  toDisplay,
  type Evidence,
  type Overrides,
  type ScenarioResult,
  type Workspace,
} from "./domain/types";
import { loadWorkspace, saveWorkspace } from "./lib/storage";
import { exportWorkspace, parseWorkspace } from "./lib/importExport";
import {
  AssumptionEditor,
  EvidenceEditor,
  Modal,
  ThesisEditor,
} from "./components/Editors";
import { Projection } from "./components/Projection";

const money = (n: number) =>
  new Intl.NumberFormat("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
const date = (value: string) =>
  new Date(
    value.length === 10 ? `${value}T12:00:00` : value,
  ).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
const today = () => new Date().toLocaleDateString("en-CA");
type Editor =
  | { type: "thesis" }
  | { type: "assumptions" }
  | { type: "evidence"; entry?: Evidence }
  | { type: "reset" }
  | { type: "import"; state: Workspace }
  | { type: "method" }
  | null;

export default function App() {
  const [initial] = useState(() => {
    const loaded = loadWorkspace();
    return { ...loaded, state: loaded.state ?? createAster() };
  });
  const [workspace, setWorkspace] = useState(initial.state);
  const [recovery, setRecovery] = useState(initial.recovery);
  const [notice, setNotice] = useState(initial.error ?? "");
  const [saveStatus, setSaveStatus] = useState(
    initial.recovery ? "Could not save" : "Saving…",
  );
  const [editor, setEditor] = useState<Editor>(null);
  const [selectedId, setSelectedId] = useState(
    () =>
      initial.state.assumptions.find((a) => a.driverKey === "operatingMargin")!
        .id,
  );
  const [growth, setGrowth] = useState(() =>
    String(
      toDisplay(
        "growthRate",
        initial.state.currentOverrides.growthRate ??
          getDrivers(initial.state.assumptions).growthRate,
      ),
    ),
  );
  const [margin, setMargin] = useState(() =>
    String(
      toDisplay(
        "operatingMargin",
        initial.state.currentOverrides.operatingMargin ??
          getDrivers(initial.state.assumptions).operatingMargin,
      ),
    ),
  );
  const fileInput = useRef<HTMLInputElement>(null);
  const base = useMemo(
    () => getDrivers(workspace.assumptions),
    [workspace.assumptions],
  );
  const selected =
    workspace.assumptions.find((a) => a.id === selectedId) ??
    workspace.assumptions[0];
  const evidence = workspace.evidence.filter(
    (e) => e.assumptionId === selected.id,
  );
  const calculation = useMemo<{
    result: ScenarioResult | null;
    error: string;
    overrides: Overrides;
  }>(() => {
    if (!growth.trim() || !margin.trim())
      return {
        result: null,
        error: "Enter growth and margin to calculate a scenario.",
        overrides: {},
      };
    const overrides = {
      ...workspace.currentOverrides,
      growthRate: Number(growth) / 100,
      operatingMargin: Number(margin) / 100,
    };
    try {
      return {
        result: calculateScenario(base, overrides),
        error: "",
        overrides,
      };
    } catch (e) {
      return {
        result: null,
        error: e instanceof Error ? e.message : "Check scenario values.",
        overrides,
      };
    }
  }, [growth, margin, base, workspace.currentOverrides]);
  const result = calculation.result;
  const scenario = { ...base, ...calculation.overrides };
  const changed =
    result !== null &&
    (scenario.growthRate !== base.growthRate ||
      scenario.operatingMargin !== base.operatingMargin ||
      scenario.revenueNow !== base.revenueNow ||
      scenario.years !== base.years);

  useEffect(() => {
    if (recovery) return;
    setSaveStatus("Saving…");
    const timer = window.setTimeout(() => {
      const saved = saveWorkspace(workspace);
      setSaveStatus(saved.success ? "Saved on this device" : "Could not save");
      if (!saved.success) setNotice(saved.error);
    }, 300);
    const flushOnLeave = () => {
      saveWorkspace(workspace);
    };
    window.addEventListener("pagehide", flushOnLeave);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("pagehide", flushOnLeave);
    };
  }, [workspace, recovery]);

  function update(next: Workspace): string | null {
    const valid = validateWorkspace(next);
    if (!valid.success) return valid.errors.slice(0, 3).join(" ");
    setWorkspace(valid.data);
    return null;
  }

  function changeScenario(key: "growthRate" | "operatingMargin", raw: string) {
    const g = key === "growthRate" ? raw : growth;
    const m = key === "operatingMargin" ? raw : margin;
    if (key === "growthRate") setGrowth(raw);
    else setMargin(raw);
    if (!g.trim() || !m.trim()) return;
    const overrides = {
      ...workspace.currentOverrides,
      growthRate: Number(g) / 100,
      operatingMargin: Number(m) / 100,
    };
    try {
      calculateScenario(base, overrides);
      update({ ...workspace, currentOverrides: overrides });
    } catch {
      /* Invalid drafts never overwrite valid state. */
    }
  }

  function resetScenario() {
    setGrowth(String(toDisplay("growthRate", base.growthRate)));
    setMargin(String(toDisplay("operatingMargin", base.operatingMargin)));
    update({ ...workspace, currentOverrides: {} });
  }

  function downside() {
    setGrowth("6");
    setMargin("17");
    const error = update({
      ...workspace,
      currentOverrides: { growthRate: 0.06, operatingMargin: 0.17 },
    });
    if (error) setNotice(error);
  }

  function saveScenario() {
    if (!result) return;
    const name = `Scenario ${workspace.scenarios.length + 1}`;
    const error = update({
      ...workspace,
      scenarios: [
        ...workspace.scenarios,
        {
          id: crypto.randomUUID(),
          thesisId: workspace.thesis.id,
          name,
          base: { ...base },
          overrides: { ...calculation.overrides },
          result: { ...result },
          savedAt: new Date().toISOString(),
        },
      ],
    });
    setNotice(error ?? `${name} saved with its original assumptions.`);
  }

  function download() {
    try {
      const blob = new Blob([exportWorkspace(workspace)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mira-${workspace.thesis.companyName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${today()}.json`;
      a.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setNotice("Workspace exported. Keep the JSON file as your backup.");
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Could not export workspace.");
    }
  }

  async function importFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > 5_000_000) {
      setNotice(
        "Choose a Mira JSON file smaller than 5 MB. Your workspace has not changed.",
      );
      return;
    }
    try {
      setEditor({ type: "import", state: parseWorkspace(await file.text()) });
    } catch (e) {
      setNotice(
        `${e instanceof Error ? e.message : "Could not read this file."} Your workspace has not changed.`,
      );
    }
  }

  function replaceWorkspace(state: Workspace) {
    const saved = saveWorkspace(state);
    if (!saved.success) {
      setNotice(`${saved.error} The existing workspace has not been replaced.`);
      setEditor(null);
      return;
    }
    setWorkspace(state);
    setRecovery(false);
    setSelectedId(
      state.assumptions.find((a) => a.driverKey === "operatingMargin")!.id,
    );
    const drivers = getDrivers(state.assumptions);
    setGrowth(
      String(
        toDisplay(
          "growthRate",
          state.currentOverrides.growthRate ?? drivers.growthRate,
        ),
      ),
    );
    setMargin(
      String(
        toDisplay(
          "operatingMargin",
          state.currentOverrides.operatingMargin ?? drivers.operatingMargin,
        ),
      ),
    );
    setNotice("Workspace loaded and saved on this device.");
    setEditor(null);
  }

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <a href="#" className="brand" aria-label="Mira home">
            mira
            <span className="brand-divider" />
            <span className="brand-caption">Assumption tracker</span>
          </a>
          <nav className="workspace-nav" aria-label="Research sections">
            <a href="#assumptions">Assumptions</a>
            <a href="#evidence">Evidence</a>
            <a href="#scenario">Scenario</a>
          </nav>
          <div
            className={`save-status ${saveStatus === "Could not save" ? "failed" : ""}`}
            role="status"
          >
            {saveStatus === "Saved on this device" ? (
              <Check size={13} />
            ) : (
              <span className="status-dot" />
            )}
            <span>{saveStatus}</span>
          </div>
        </div>
      </header>
      <main className="workspace">
        <div className="workspace-toolbar">
          <div className="breadcrumb">
            <FolderOpen size={14} />
            <span>Research workspace</span>
            <ChevronRight size={13} />
            <span className="breadcrumb-current">
              {workspace.thesis.companyName}
            </span>
          </div>
          <div className="toolbar-actions">
            <button
              className="text-button"
              onClick={() => fileInput.current?.click()}
            >
              <Upload size={14} />
              Import
            </button>
            <button className="button small secondary" onClick={download}>
              <Download size={14} />
              Export JSON
            </button>
            <input
              ref={fileInput}
              type="file"
              accept=".json,application/json"
              onChange={importFile}
              className="visually-hidden"
              aria-label="Import workspace JSON"
            />
          </div>
        </div>
        {notice && (
          <div className={`notice ${recovery ? "recovery" : ""}`} role="status">
            <Info size={17} />
            <span>{notice}</span>
            <button
              className="icon-button"
              onClick={() => setNotice("")}
              aria-label="Dismiss message"
            >
              <X size={15} />
            </button>
          </div>
        )}
        {recovery && (
          <div className="recovery-actions">
            <span>
              Recovery mode · autosave is paused to protect the saved record.
            </span>
            <button
              className="text-button"
              onClick={() => setEditor({ type: "reset" })}
            >
              Load Aster example
            </button>
          </div>
        )}
        <section className="thesis-section" aria-labelledby="company-name">
          <div className="thesis-heading">
            <div>
              <div className="eyebrow">
                INVESTMENT THESIS <span className="eyebrow-line" />
              </div>
              <h1 id="company-name">
                {workspace.thesis.companyName}
                <button
                  className="icon-button edit-company"
                  aria-label="Edit investment thesis"
                  onClick={() => setEditor({ type: "thesis" })}
                >
                  <Pencil size={16} />
                </button>
              </h1>
            </div>
            <span
              className={`sample-badge ${!workspace.isSample ? "personal" : ""}`}
            >
              <FlaskConical size={13} />
              {workspace.isSample ? "Fictional example" : "Personal workspace"}
            </span>
          </div>
          <p className="thesis-text">{workspace.thesis.text}</p>
          <div className="thesis-meta">
            <span>
              <span className="company-monogram">
                {workspace.thesis.companyName.slice(0, 1)}
              </span>
              {workspace.isSample
                ? "Specialist packaging · sample company"
                : "Your research · local workspace"}
            </span>
            <span>Updated {date(workspace.thesis.updatedAt)}</span>
          </div>
        </section>

        <div className="research-grid">
          <div className="research-column">
            <section
              className="panel assumptions-panel"
              id="assumptions"
              aria-labelledby="assumptions-heading"
            >
              <div className="section-heading">
                <div>
                  <h2 id="assumptions-heading">The assumptions</h2>
                  <p>The inputs your thesis depends on.</p>
                </div>
                <button
                  className="text-button"
                  onClick={() => setEditor({ type: "assumptions" })}
                >
                  <Pencil size={13} />
                  Edit base
                </button>
              </div>
              <div
                className="assumption-grid"
                role="group"
                aria-label="Select an assumption"
              >
                {workspace.assumptions.map((a) => (
                  <button
                    key={a.id}
                    className={`assumption ${selected.id === a.id ? "active" : ""}`}
                    aria-pressed={selected.id === a.id}
                    onClick={() => setSelectedId(a.id)}
                  >
                    <span className="assumption-label">
                      {DRIVER_META[a.driverKey].short}
                    </span>
                    <span className="assumption-value">
                      {a.driverKey === "revenueNow" ? "£" : ""}
                      {toDisplay(a.driverKey, a.value)}
                      <small>{DRIVER_META[a.driverKey].suffix}</small>
                    </span>
                    <span className="assumption-bottom">
                      {
                        workspace.evidence.filter(
                          (e) => e.assumptionId === a.id,
                        ).length
                      }{" "}
                      evidence <ArrowRight size={12} />
                    </span>
                  </button>
                ))}
              </div>
              <div className="assumption-detail">
                <div className="detail-heading">
                  <span className="mini-label">
                    {DRIVER_META[selected.driverKey].label.toUpperCase()}
                  </span>
                  <span className="base-label">Base assumption</span>
                </div>
                <p>{selected.rationale}</p>
                <div className="review-rule">
                  <span className="review-icon">
                    <History size={14} />
                  </span>
                  <div>
                    <span className="review-title">When to reconsider</span>
                    <p>
                      {selected.reviewCondition ||
                        "No review condition yet. Edit the base to add one."}
                    </p>
                    {selected.reviewOn && (
                      <span
                        className={`review-date ${selected.reviewOn <= today() ? "due" : ""}`}
                      >
                        Review {date(selected.reviewOn)} · reminder only
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </section>

            <section
              className="panel evidence-panel"
              id="evidence"
              aria-labelledby="evidence-heading"
            >
              <div className="section-heading">
                <div>
                  <h2 id="evidence-heading">
                    Evidence ledger{" "}
                    <span className="count">{evidence.length}</span>
                  </h2>
                  <p>What supports—or challenges—this assumption.</p>
                </div>
                <button
                  className="button small secondary"
                  onClick={() => setEditor({ type: "evidence" })}
                >
                  <Plus size={14} />
                  Add evidence
                </button>
              </div>
              <div className="evidence-filter">
                <span className="filter-dot" />
                Linked to {DRIVER_META[selected.driverKey].label.toLowerCase()}
                <span>
                  {evidence.length}{" "}
                  {evidence.length === 1 ? "entry" : "entries"}
                </span>
              </div>
              {evidence.length === 0 ? (
                <div className="empty-evidence">
                  <FileText size={26} />
                  <h3>No evidence attached yet</h3>
                  <p>
                    Add an observation to make the reasoning behind this
                    assumption visible.
                  </p>
                  <button
                    className="text-button"
                    onClick={() => setEditor({ type: "evidence" })}
                  >
                    Add the first piece <ArrowRight size={14} />
                  </button>
                </div>
              ) : (
                evidence.map((entry) => (
                  <article key={entry.id} className="evidence-entry">
                    <div className="evidence-top">
                      <span className={`kind-badge ${entry.kind}`}>
                        <span />
                        {entry.kind[0].toUpperCase() + entry.kind.slice(1)}
                      </span>
                      <button
                        className="icon-button"
                        aria-label={`Edit evidence: ${entry.sourceTitle}`}
                        onClick={() => setEditor({ type: "evidence", entry })}
                      >
                        <Pencil size={14} />
                      </button>
                    </div>
                    <h3>{entry.sourceTitle}</h3>
                    <div className="source-meta">
                      {entry.sourceUrl ? (
                        <a
                          href={entry.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Linked source <ArrowUpRight size={11} />
                        </a>
                      ) : (
                        <span>
                          <FileText size={11} />
                          Analyst note
                        </span>
                      )}
                      <span>·</span>
                      <span>{date(entry.observedOn)}</span>
                      {(workspace.isSample || entry.isFictional) && (
                        <>
                          <span>·</span>
                          <span>Fictional</span>
                        </>
                      )}
                    </div>
                    <blockquote>{entry.excerpt}</blockquote>
                    <div className="analyst-reading">
                      <span className="mini-label">YOUR INTERPRETATION</span>
                      <p>{entry.explanation}</p>
                    </div>
                  </article>
                ))
              )}
              <div className="ledger-footer">
                <LockKeyhole size={12} />
                <span>Your judgment, preserved alongside its source.</span>
              </div>
            </section>
            <div className="research-note">
              <Lightbulb size={17} />
              <p>
                A change in evidence is a reason to revisit an assumption—not a
                verdict on the company.
              </p>
            </div>
          </div>

          <aside
            className="scenario-column"
            id="scenario"
            aria-labelledby="scenario-heading"
          >
            <section className="panel scenario-panel">
              <div className="section-heading">
                <div>
                  <div className="scenario-eyebrow">
                    <span />
                    LIVE SCENARIO
                  </div>
                  <h2 id="scenario-heading">What if the thesis shifts?</h2>
                </div>
                <button
                  className="icon-button"
                  aria-label="How the calculation works"
                  onClick={() => setEditor({ type: "method" })}
                >
                  <CircleHelp size={16} />
                </button>
              </div>
              <p className="scenario-intro">
                Change the scenario. Keep the original.
              </p>
              <div className="scenario-inputs">
                {(["growthRate", "operatingMargin"] as const).map((key) => {
                  const inputValue = key === "growthRate" ? growth : margin;
                  const val = Number(inputValue);
                  const diff = Number(
                    (val - toDisplay(key, base[key])).toFixed(4),
                  );
                  return (
                    <div className="scenario-control" key={key}>
                      <label htmlFor={`scenario-${key}`}>
                        {DRIVER_META[key].label}
                      </label>
                      <div className="scenario-input-row">
                        <span className="base-value">
                          Base <b>{toDisplay(key, base[key])}%</b>
                        </span>
                        <ArrowRight size={15} />
                        <div className="percent-input">
                          <input
                            id={`scenario-${key}`}
                            aria-invalid={Boolean(calculation.error)}
                            type="number"
                            step="0.5"
                            value={inputValue}
                            onChange={(e) =>
                              changeScenario(key, e.target.value)
                            }
                          />
                          <span>%</span>
                        </div>
                      </div>
                      <input
                        className="scenario-range"
                        aria-label={`${DRIVER_META[key].label} slider`}
                        type="range"
                        min={key === "growthRate" ? -50 : 0}
                        max={key === "growthRate" ? 50 : 100}
                        step="0.5"
                        value={
                          Number.isFinite(val)
                            ? Math.max(
                                key === "growthRate" ? -50 : 0,
                                Math.min(key === "growthRate" ? 50 : 100, val),
                              )
                            : 0
                        }
                        onChange={(e) => changeScenario(key, e.target.value)}
                      />
                      <div className="range-caption">
                        <span>{key === "growthRate" ? "−50%" : "0%"}</span>
                        <span>
                          {inputValue.trim() && Number.isFinite(val)
                            ? `${diff > 0 ? "+" : ""}${diff} percentage points`
                            : "Enter a value"}
                        </span>
                        <span>{key === "growthRate" ? "50%" : "100%"}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="scenario-shortcuts">
                <button className="text-button" onClick={downside}>
                  <ArrowDownLeft size={13} />
                  Try downside example
                </button>
                <button className="text-button muted" onClick={resetScenario}>
                  <RotateCcw size={12} />
                  Reset
                </button>
              </div>
              {calculation.error ? (
                <div className="calculation-error" role="alert">
                  <Info size={18} />
                  <p>{calculation.error}</p>
                </div>
              ) : (
                result && (
                  <div className="scenario-results" aria-live="polite">
                    <div className="result-heading">
                      <span>Year {scenario.years} operating profit</span>
                      <span>GBP millions</span>
                    </div>
                    <div className="profit-number">
                      £{money(result.scenarioProfit)}
                      <small>m</small>
                    </div>
                    <div
                      className={`profit-change ${result.absoluteChange < 0 ? "negative" : result.absoluteChange > 0 ? "positive" : ""}`}
                    >
                      {result.absoluteChange < 0 ? (
                        <ArrowDown size={13} />
                      ) : result.absoluteChange > 0 ? (
                        <ArrowUpRight size={13} />
                      ) : null}
                      <strong>
                        {result.percentageChange === null
                          ? "Percentage unavailable"
                          : `${result.percentageChange > 0 ? "+" : ""}${money(result.percentageChange)}%`}
                      </strong>
                      <span>
                        {changed ? "vs. base case" : "Matches base case"}
                      </span>
                    </div>
                    <Projection base={base} scenario={scenario} />
                    <div className="chart-legend">
                      <span>
                        <i className="base-line" />
                        Base <b>£{money(result.baseProfit)}m</b>
                      </span>
                      <span>
                        <i className="scenario-line" />
                        Scenario <b>£{money(result.scenarioProfit)}m</b>
                      </span>
                    </div>
                    <div className="absolute-change">
                      <span>Absolute change</span>
                      <b>
                        {result.absoluteChange > 0
                          ? "+"
                          : result.absoluteChange < 0
                            ? "−"
                            : ""}
                        £{money(Math.abs(result.absoluteChange))}m
                      </b>
                    </div>
                  </div>
                )
              )}
              <button
                className="button primary save-scenario"
                disabled={!result || recovery}
                onClick={saveScenario}
              >
                <Save size={15} />
                Save scenario
                <ArrowRight size={15} />
              </button>
              <p className="snapshot-help">
                Saves a snapshot. Your base case stays intact.
              </p>
            </section>
            <section className="saved-section" aria-labelledby="saved-heading">
              <h3 id="saved-heading">
                <History size={14} />
                Saved scenarios<span>{workspace.scenarios.length}</span>
              </h3>
              {workspace.scenarios.length === 0 ? (
                <div className="empty-scenarios">
                  <span className="empty-icon">
                    <Save size={17} />
                  </span>
                  <p>
                    Your decisions deserve a record.
                    <br />
                    <span>Save a scenario to revisit it later.</span>
                  </p>
                </div>
              ) : (
                <div className="saved-list">
                  {[...workspace.scenarios].reverse().map((s) => (
                    <article className="saved-card" key={s.id}>
                      <div>
                        <h4>{s.name}</h4>
                        <span>{date(s.savedAt)} · historical snapshot</span>
                      </div>
                      <strong>£{money(s.result.scenarioProfit)}m</strong>
                      <p>
                        Growth{" "}
                        {toDisplay(
                          "growthRate",
                          s.overrides.growthRate ?? s.base.growthRate,
                        )}
                        % · Margin{" "}
                        {toDisplay(
                          "operatingMargin",
                          s.overrides.operatingMargin ?? s.base.operatingMargin,
                        )}
                        %<br />
                        Original base £{money(s.result.baseProfit)}m · Year{" "}
                        {s.overrides.years ?? s.base.years}
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </aside>
        </div>

        <footer className="workspace-footer">
          <span>
            <LockKeyhole size={12} />
            Stored in this browser. Export to keep a backup.
          </span>
          <button
            className="text-button"
            onClick={() => setEditor({ type: "reset" })}
          >
            <RotateCcw size={12} />
            Load Aster example
          </button>
          <span className="footer-disclaimer">
            Scenario analysis, not investment advice.
          </span>
        </footer>
      </main>

      {editor?.type === "thesis" && (
        <ThesisEditor
          thesis={workspace.thesis}
          close={() => setEditor(null)}
          save={(thesis) => update({ ...workspace, isSample: false, thesis })}
        />
      )}
      {editor?.type === "assumptions" && (
        <AssumptionEditor
          assumptions={workspace.assumptions}
          selectedId={selected.id}
          close={() => setEditor(null)}
          save={(assumptions) => {
            const error = update({
              ...workspace,
              assumptions,
              thesis: {
                ...workspace.thesis,
                updatedAt: new Date().toISOString(),
              },
            });
            if (!error) {
              const next = getDrivers(assumptions);
              setGrowth(
                String(
                  toDisplay(
                    "growthRate",
                    workspace.currentOverrides.growthRate ?? next.growthRate,
                  ),
                ),
              );
              setMargin(
                String(
                  toDisplay(
                    "operatingMargin",
                    workspace.currentOverrides.operatingMargin ??
                      next.operatingMargin,
                  ),
                ),
              );
            }
            return error;
          }}
        />
      )}
      {editor?.type === "evidence" && (
        <EvidenceEditor
          initial={editor.entry}
          assumptions={workspace.assumptions}
          selectedId={selected.id}
          close={() => setEditor(null)}
          save={(entry) =>
            update({
              ...workspace,
              evidence: workspace.evidence.some((e) => e.id === entry.id)
                ? workspace.evidence.map((e) => (e.id === entry.id ? entry : e))
                : [...workspace.evidence, entry],
            })
          }
        />
      )}
      {editor?.type === "reset" && (
        <Modal
          title="Load the Aster example?"
          subtitle="This replaces the thesis, evidence and saved scenarios in this browser."
          close={() => setEditor(null)}
        >
          <div className="confirm-content">
            <p>
              Export your current workspace first if you want to keep it. The
              example contains clearly labelled fictional data.
            </p>
            <div className="form-actions">
              <button
                className="button secondary"
                onClick={() => setEditor(null)}
              >
                Keep my workspace
              </button>
              <button
                className="button primary"
                onClick={() => replaceWorkspace(createAster())}
              >
                Replace with Aster
              </button>
            </div>
          </div>
        </Modal>
      )}
      {editor?.type === "import" && (
        <Modal
          title="Import this workspace?"
          subtitle="Review the file before replacing your current research."
          close={() => setEditor(null)}
        >
          <div className="confirm-content">
            <div className="import-summary">
              <FileJson size={23} />
              <div>
                <strong>{editor.state.thesis.companyName}</strong>
                <p>
                  {editor.state.evidence.length} evidence entries ·{" "}
                  {editor.state.scenarios.length} saved scenarios
                </p>
              </div>
            </div>
            <p>
              The file passed validation. Importing replaces the current
              workspace. Export a backup first if you need one.
            </p>
            <div className="form-actions">
              <button
                className="button secondary"
                onClick={() => setEditor(null)}
              >
                Cancel import
              </button>
              <button
                className="button primary"
                onClick={() => replaceWorkspace(editor.state)}
              >
                Replace workspace
              </button>
            </div>
          </div>
        </Modal>
      )}
      {editor?.type === "method" && (
        <Modal
          title="No black box. Just the assumptions."
          subtitle="Every result follows the same transparent calculation."
          close={() => setEditor(null)}
        >
          <div className="method-content">
            <div className="formula">
              Revenue × (1 + growth)<sup>years</sup> × margin
            </div>
            <p>
              Revenue is in GBP millions. Growth and margin are stored as
              decimal rates. Display values round to two decimals; calculations
              keep full precision.
            </p>
            <div className="method-example">
              <span>Fictional Aster base case</span>
              <code>100 × 1.10⁵ × 0.20 = £32.21m</code>
              <span>Downside example</span>
              <code>100 × 1.06⁵ × 0.17 = £22.75m</code>
            </div>
            <p>
              The chart applies each case's margin throughout its horizon. A
              saved scenario preserves its own inputs. These are
              operating-profit scenarios, not valuation, investment returns or
              forecasts based on live market data.
            </p>
            <button className="button primary" onClick={() => setEditor(null)}>
              Back to workspace
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
