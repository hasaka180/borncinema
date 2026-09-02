"use client";
import { useState } from "react";
import { useProject, type Version } from "@/store/project";
import { pad } from "@/lib/utils";

export function VersionHistory() {
  const { project, dispatch, patch } = useProject();
  const [compare, setCompare] = useState<Version | null>(null);
  const versions = [...project.versions].reverse();
  const current = { logline: project.structure?.logline, ending: project.structure?.ending, protagonist: project.characters[0]?.name, location: project.locations[0]?.name, paragraphs: project.story?.paragraphs.length || 0, title: project.title || project.story?.title };

  const summarize = (v: Version) => ({ logline: v.snapshot.structure?.logline, ending: v.snapshot.structure?.ending, protagonist: v.snapshot.characters?.[0]?.name, location: v.snapshot.locations?.[0]?.name, paragraphs: v.snapshot.story?.paragraphs.length || 0, title: v.snapshot.title || v.snapshot.story?.title });

  return (
    <div className="grid lg:grid-cols-12 gap-10">
      <div className="lg:col-span-5">
        <p className="serif italic text-ink-2 mb-6">Every significant change is a version. Nothing is permanently destroyed.</p>
        <div className="rule">
          <div className="flex items-center gap-5 py-4 rule"><span className="numeral text-3xl text-accent">v{pad(project.versions.length + 1)}</span><span className="flex-1"><span className="display text-xl text-ink block">Current</span><span className="label-sm text-ink-3">Working state</span></span></div>
          {versions.map((v) => (
            <div key={v.id} className="flex items-center gap-5 py-4 rule group">
              <span className="numeral text-3xl text-ink-3">v{pad(v.n)}</span>
              <span className="flex-1 min-w-0"><span className="display text-xl text-ink block truncate">{v.label}</span><span className="label-sm text-ink-3">{new Date(v.at).toLocaleString()}</span></span>
              <span className="flex gap-3 label-sm text-ink-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setCompare(v)} className="hover:text-ink">Compare</button>
                <button onClick={() => dispatch({ type: "restore", versionId: v.id })} className="hover:text-ink">Restore</button>
                <button onClick={() => patch({}, `Branch from v${pad(v.n)}`)} className="hover:text-ink">Branch</button>
              </span>
            </div>
          ))}
          {versions.length === 0 && <p className="serif italic text-ink-3 py-6">No versions yet. They appear as you make decisions.</p>}
        </div>
      </div>
      <div className="lg:col-span-7">
        {compare ? (
          <div className="card-edit p-6 anim-up">
            <div className="flex justify-between mb-6"><span className="label text-ink-3">v{pad(compare.n)} · {compare.label}</span><span className="label text-accent">Current</span></div>
            {(["title", "protagonist", "location", "logline", "ending", "paragraphs"] as const).map((k) => {
              const a = String(summarize(compare)[k] ?? "—"); const b = String(current[k] ?? "—");
              return (
                <div key={k} className="grid grid-cols-2 gap-6 py-4 rule">
                  <div><div className="label-sm text-ink-3 mb-1">{k}</div><div className={`serif leading-snug ${a !== b ? "text-ink-2 line-through decoration-accent/60" : "text-ink-2"}`}>{a}</div></div>
                  <div><div className="label-sm text-ink-3 mb-1">{k}</div><div className={`serif leading-snug ${a !== b ? "text-accent" : "text-ink"}`}>{b}</div></div>
                </div>
              );
            })}
            <div className="flex gap-3 mt-6"><button onClick={() => dispatch({ type: "restore", versionId: compare.id })} className="btn btn-sm btn-primary">Restore this version</button><button onClick={() => setCompare(null)} className="btn btn-sm">Close</button></div>
          </div>
        ) : (
          <div className="p-10 text-center border border-dashed border-line"><p className="serif italic text-ink-3">Select a version to compare it with the current state.</p></div>
        )}
      </div>
    </div>
  );
}
