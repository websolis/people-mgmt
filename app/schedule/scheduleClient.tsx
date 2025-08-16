"use client";

import { useState } from "react";
import type { Person, ShiftInstance, Assignment } from "@prisma/client";

export default function ScheduleClient({ tenantId, people, shifts }: { tenantId: string; people: Person[]; shifts: (ShiftInstance & { assignments: any[] })[] }) {
  const [form, setForm] = useState({ name: "", start: "", end: "" });
  const [personForm, setPersonForm] = useState({ name: "", email: "" });
  const [selectedShift, setSelectedShift] = useState<string>("");

  async function createShift() {
    const res = await fetch("/api/shift-instances", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ tenantId, name: form.name || null, startsAt: form.start, endsAt: form.end })
    });
    if (!res.ok) alert(await res.text()); else location.reload();
  }

  async function createPerson() {
    const res = await fetch("/api/person", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ tenantId, name: personForm.name, email: personForm.email || null })
    });
    if (!res.ok) alert(await res.text()); else location.reload();
  }

  async function assign(personId: string, shiftId: string) {
    const res = await fetch("/api/assignments", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ tenantId, personId, shiftId })
    });
    if (!res.ok) alert(await res.text()); else location.reload();
  }

  async function unassign(assignmentId: string) {
    const res = await fetch(`/api/assignments?id=${assignmentId}`, { method: "DELETE" });
    if (!res.ok) alert(await res.text()); else location.reload();
  }

  return (
    <div>
      <h2>Schedule</h2>

      <div style={{ display:"flex", gap: 24, flexWrap:"wrap" }}>
        <div style={{ minWidth: 300 }}>
          <h3>Create Shift</h3>
          <input placeholder="Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} /><br/>
          <input type="datetime-local" value={form.start} onChange={e=>setForm({...form,start:e.target.value})} /><br/>
          <input type="datetime-local" value={form.end} onChange={e=>setForm({...form,end:e.target.value})} /><br/>
          <button onClick={createShift}>Create</button>
        </div>

        <div style={{ minWidth: 300 }}>
          <h3>Create Person</h3>
          <input placeholder="Name" value={personForm.name} onChange={e=>setPersonForm({...personForm,name:e.target.value})} /><br/>
          <input placeholder="Email (optional)" value={personForm.email} onChange={e=>setPersonForm({...personForm,email:e.target.value})} /><br/>
          <button onClick={createPerson}>Create</button>
        </div>
      </div>

      <hr style={{ margin: "16px 0" }}/>

      <h3>People</h3>
      <ul>
        {people.map(p => <li key={p.id}>{p.name} {p.email ? `(${p.email})` : ""}</li>)}
        {people.length===0 && <li>No people yet.</li>}
      </ul>

      <h3>Shifts</h3>
      <ul>
        {shifts.map(s => (
          <li key={s.id} style={{ marginBottom: 12 }}>
            <strong>{s.name ?? "Shift"}</strong> — {new Date(s.startsAt).toLocaleString()} → {new Date(s.endsAt).toLocaleString()}
            <div>Assigned: {s.assignments.map(a=>a.person.name).join(", ") || "—"}</div>
            <div>
              <select value={selectedShift===s.id?selectedShift:""} onChange={e=>setSelectedShift(s.id)}>
                <option value="">Choose person…</option>
                {people.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <button onClick={()=>{ const personId = (document.querySelector(`li[key='${s.id}'] select`) as HTMLSelectElement)?.value || selectedShift; }}> </button>
              <button onClick={()=>{
                const sel = document.querySelector(`li[key='${s.id}'] select`) as HTMLSelectElement;
                const personId = sel?.value;
                if (personId) assign(personId, s.id);
              }}>Assign</button>
            </div>
            {s.assignments.map(a => (
              <div key={a.id}>
                <button onClick={()=>unassign(a.id)}>Unassign {a.person.name}</button>
              </div>
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
}
