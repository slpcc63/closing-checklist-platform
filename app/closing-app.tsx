"use client";

import { useMemo, useState } from "react";
import { priorities, throughoutShiftGuidance, tuesdayBlocks as blocks, tuesdayTasks as seedTasks, type ChecklistTask as Task } from "@/lib/checklist-data";

export default function ClosingApp() {
  const [tasks, setTasks] = useState(seedTasks);
  const [view, setView] = useState<"team" | "manager">("team");
  const [block, setBlock] = useState("All");
  const [exceptionId, setExceptionId] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [clockoutOpen, setClockoutOpen] = useState(false);
  const [clockedOut, setClockedOut] = useState(false);

  const resolved = tasks.filter((task) => task.status !== "open").length;
  const complete = resolved === tasks.length;
  const filtered = block === "All" ? tasks : tasks.filter((task) => task.block === block);
  const groups = useMemo(() => {
    return filtered.reduce<Record<string, Task[]>>((acc, task) => {
      (acc[task.station] ||= []).push(task);
      return acc;
    }, {});
  }, [filtered]);

  function markDone(id: string) {
    setTasks((current) => current.map((task) => task.id === id
      ? { ...task, status: task.status === "done" ? "open" : "done", reason: undefined, actor: "Maya", at: "Now" }
      : task));
  }

  function saveException() {
    if (!exceptionId || reason.trim().length < 8) return;
    setTasks((current) => current.map((task) => task.id === exceptionId
      ? { ...task, status: "exception", reason: reason.trim(), actor: "Maya", at: "Now" }
      : task));
    setExceptionId(null);
    setReason("");
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Spike's closing home">
          <span className="brand-mark">S</span>
          <span>SPIKE’S <small>Closing crew</small></span>
        </a>
        <div className="view-switch" aria-label="Choose view">
          <button className={view === "team" ? "active" : ""} onClick={() => setView("team")}>My close</button>
          <button className={view === "manager" ? "active" : ""} onClick={() => setView("manager")}>Manager</button>
        </div>
        <button className="avatar" aria-label="Maya's profile">M</button>
      </header>

      {view === "team" ? (
        <div className="page-grid" id="top">
          <section className="main-column">
            <div className="eyebrow">Tuesday close · Downtown</div>
            <div className="title-row">
              <div><h1>Finish strong.</h1><p>Resolve every item, then clock out safely.</p></div>
              <div className="shift-chip"><span className="pulse" /> Clocked in · 4h 18m</div>
            </div>

            <details className="priorities-card">
              <summary>Shift priorities <span>Customers first · clean as you go</span></summary>
              <ol>{priorities.map((item) => <li key={item.label}><strong>{item.label}:</strong> {item.text}</li>)}</ol>
            </details>

            <section className="progress-card" aria-label={`${resolved} of ${tasks.length} tasks resolved`}>
              <div className="progress-number">{Math.round((resolved / tasks.length) * 100)}%</div>
              <div className="progress-copy"><strong>{resolved} of {tasks.length} resolved</strong><span>{complete ? "Everything is resolved. Clock-out is ready." : `${tasks.length - resolved} items between you and clock-out.`}</span></div>
              <div className="progress-track"><span style={{ width: `${(resolved / tasks.length) * 100}%` }} /></div>
            </section>

            <nav className="block-tabs" aria-label="Checklist time blocks">
              {blocks.map((item) => <button key={item} className={block === item ? "active" : ""} onClick={() => setBlock(item)}>{item}</button>)}
            </nav>

            <div className="station-list">
              {Object.entries(groups).map(([station, stationTasks]) => {
                const stationDone = stationTasks.filter((task) => task.status !== "open").length;
                return <section className="station" key={station}>
                  <div className="station-heading"><h2>{station}</h2><span>{stationDone}/{stationTasks.length}</span></div>
                  {throughoutShiftGuidance[station]?.length > 0 && <div className="station-guidance">
                    <strong>Throughout shift</strong>
                    <ul>{throughoutShiftGuidance[station].map((reminder) => <li key={reminder}>{reminder}</li>)}</ul>
                  </div>}
                  <div className="task-stack">
                    {stationTasks.map((task) => (
                      <article className={`task ${task.status}`} key={task.id}>
                        <button className="check" onClick={() => markDone(task.id)} aria-label={task.status === "done" ? `Reopen ${task.title}` : `Complete ${task.title}`}>
                          {task.status === "done" ? "✓" : task.status === "exception" ? "!" : ""}
                        </button>
                        <div className="task-body"><strong>{task.title}</strong>
                          {task.status === "exception" && <p><b>Exception:</b> {task.reason}</p>}
                          {task.actor && <small>{task.actor} · {task.at}</small>}
                        </div>
                        {task.status !== "done" && <button className="exception-link" onClick={() => { setExceptionId(task.id); setReason(task.reason || ""); }}>{task.status === "exception" ? "Edit" : "Exception"}</button>}
                      </article>
                    ))}
                  </div>
                </section>;
              })}
            </div>
          </section>

          <aside className="closeout-card">
            <div className="closeout-icon">↗</div>
            <p className="eyebrow">Shift closeout</p>
            <h2>{clockedOut ? "You’re clocked out." : complete ? "Ready to clock out" : "Clock-out is locked"}</h2>
            <p>{clockedOut ? "Square confirmed your timecard closed at 5:08 PM." : complete ? "We’ll verify your open Square timecard one more time before closing it." : `Resolve ${tasks.length - resolved} remaining items. Exceptions count when a reason is included.`}</p>
            <div className="mini-progress"><span style={{ width: `${(resolved / tasks.length) * 100}%` }} /></div>
            <button className="primary-button" disabled={!complete || clockedOut} onClick={() => setClockoutOpen(true)}>{clockedOut ? "Clock-out confirmed" : complete ? "Review & clock out" : `${tasks.length - resolved} items remaining`}</button>
            <small>Clock-out is never triggered by a single task tap.</small>
          </aside>
        </div>
      ) : <ManagerView tasks={tasks} />}

      {exceptionId && <div className="modal-backdrop" role="presentation" onMouseDown={() => setExceptionId(null)}>
        <section className="modal" role="dialog" aria-modal="true" aria-labelledby="exception-title" onMouseDown={(e) => e.stopPropagation()}>
          <div className="modal-kicker">Document an issue</div><h2 id="exception-title">Mark as exception</h2>
          <p>{tasks.find((task) => task.id === exceptionId)?.title}</p>
          <label htmlFor="reason">What prevented this from being completed?</label>
          <textarea id="reason" autoFocus value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Be specific so a manager knows what to follow up on…" />
          <div className="reason-help"><span>Required · minimum 8 characters</span><span>{reason.trim().length}/8</span></div>
          <div className="modal-actions"><button className="secondary-button" onClick={() => setExceptionId(null)}>Cancel</button><button className="danger-button" disabled={reason.trim().length < 8} onClick={saveException}>Save exception</button></div>
        </section>
      </div>}

      {clockoutOpen && <div className="modal-backdrop" role="presentation" onMouseDown={() => setClockoutOpen(false)}>
        <section className="modal confirm-modal" role="dialog" aria-modal="true" aria-labelledby="clockout-title" onMouseDown={(e) => e.stopPropagation()}>
          <div className="confirm-mark">✓</div><div className="modal-kicker">Final confirmation</div><h2 id="clockout-title">Clock out of Square now?</h2>
          <p>All {tasks.length} items are resolved, including {tasks.filter((task) => task.status === "exception").length} exception. Your recorded shift is <strong>11:40 AM–now</strong>.</p>
          <div className="safety-note"><strong>Before you continue</strong><span>Confirm any break is ended and cash tips are declared in Square.</span></div>
          <div className="modal-actions"><button className="secondary-button" onClick={() => setClockoutOpen(false)}>Not yet</button><button className="primary-button" onClick={() => { setClockedOut(true); setClockoutOpen(false); }}>Confirm clock-out</button></div>
        </section>
      </div>}
    </main>
  );
}

function ManagerView({ tasks }: { tasks: Task[] }) {
  const exceptions = tasks.filter((task) => task.status === "exception");
  return <div className="manager-page">
    <div className="eyebrow">Live close · Downtown</div>
    <div className="manager-title"><div><h1>Tonight’s close</h1><p>See where the team needs help before anyone clocks out.</p></div><button className="secondary-button">Export audit</button></div>
    <div className="metric-grid">
      <article><span>Overall progress</span><strong>{Math.round(tasks.filter(t => t.status !== "open").length / tasks.length * 100)}%</strong><small>{tasks.filter(t => t.status !== "open").length} of {tasks.length} resolved</small></article>
      <article><span>Active closers</span><strong>3</strong><small>All currently clocked in</small></article>
      <article className="alert-metric"><span>Exceptions</span><strong>{exceptions.length}</strong><small>Needs manager review</small></article>
    </div>
    <div className="manager-grid">
      <section className="panel"><div className="panel-heading"><div><p className="eyebrow">Crew status</p><h2>Closing team</h2></div><span className="live-dot">Live</span></div>
        {[{ name: "Maya Chen", station: "Coffee & Candy · Espresso Bar", done: 8, total: 16 }, { name: "Andre Lewis", station: "Register · Bakery · Bagel", done: 5, total: 18 }, { name: "Jordan Kim", station: "Lobby · Alley · Patio", done: 3, total: 16 }].map((person, i) => <div className="person-row" key={person.name}><span className={`person-avatar a${i}`}>{person.name[0]}</span><div><strong>{person.name}</strong><small>{person.station}</small></div><div className="person-progress"><span><i style={{ width: `${person.done / person.total * 100}%` }} /></span><b>{person.done}/{person.total}</b></div></div>)}
      </section>
      <section className="panel"><div className="panel-heading"><div><p className="eyebrow">Needs attention</p><h2>Exceptions</h2></div><span className="count-badge">{exceptions.length}</span></div>
        {exceptions.map((task) => <article className="exception-card" key={task.id}><div><strong>{task.station}</strong><span>{task.at}</span></div><p>{task.title}</p><blockquote>{task.reason}</blockquote><small>Reported by {task.actor}</small><button>Acknowledge</button></article>)}
      </section>
    </div>
    <section className="panel audit"><div className="panel-heading"><div><p className="eyebrow">Accountability</p><h2>Audit trail</h2></div><button className="text-button">View all activity</button></div>
      {["4:51 PM|Maya marked Espresso Bar as an exception|Reason saved · manager review pending", "4:42 PM|Maya completed Coffee & Candy early-shift prep|Device: Maya’s iPhone", "4:36 PM|Andre completed Bakery Case early-shift prep|Device: Andre’s Pixel", "11:40 AM|Maya’s Square timecard matched|Timecard is open · version 7"].map((line, i) => { const [time, title, detail] = line.split("|"); return <div className="audit-row" key={line}><span className={i === 0 ? "warn" : ""}>{i === 0 ? "!" : "✓"}</span><time>{time}</time><div><strong>{title}</strong><small>{detail}</small></div></div>; })}
    </section>
  </div>;
}

