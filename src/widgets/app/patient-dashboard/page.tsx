'use client';

import { useEffect, useState } from 'react';
import { colors, containerStyle, cardStyle, badgeBase, inputStyle } from '../../styles/hospital';

interface Patient {
  patientId: string;
  fullName: string;
  age: number;
  gender: string;
  phone: string;
  email: string;
  address: string;
  bloodGroup: string;
  symptoms: string[];
  assignedDepartment: string | null;
  assignmentConfidence: 'High' | 'Medium' | 'Low' | null;
  registeredAt: string;
}

interface ListPatientsOutput {
  patients: Patient[];
  pagination?: { page: number; limit: number; total: number; pages: number };
}

type Payload = ListPatientsOutput | Patient;

function isList(payload: Payload): payload is ListPatientsOutput {
  return payload != null && Array.isArray((payload as any).patients);
}

const confidenceStyle: Record<string, { color: string; bg: string }> = {
  High: { color: colors.statusAvailable, bg: colors.statusAvailableBg },
  Medium: { color: colors.statusBusy, bg: colors.statusBusyBg },
  Low: { color: colors.statusOffline, bg: colors.statusOfflineBg }
};

export default function PatientDashboardWidget() {
  const [payload, setPayload] = useState<Payload | null>(null);
  const [selected, setSelected] = useState<Patient | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'toolOutput') {
        setPayload(event.data.data as Payload);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  if (!payload) {
    return (
      <div style={containerStyle}>
        <p style={{ color: colors.textMuted, fontSize: 13 }}>Loading…</p>
      </div>
    );
  }

  if (!isList(payload)) {
    return <PatientOverview patient={payload} onBack={null} />;
  }

  if (selected) {
    return <PatientOverview patient={selected} onBack={() => setSelected(null)} />;
  }

  const list = payload.patients ?? [];
  const filtered = query.trim()
    ? list.filter(
        (p) =>
          p.fullName.toLowerCase().includes(query.toLowerCase()) ||
          (p.assignedDepartment ?? '').toLowerCase().includes(query.toLowerCase())
      )
    : list;

  return (
    <div style={containerStyle}>
      <input
        style={{ ...inputStyle, width: '100%', marginBottom: 14, boxSizing: 'border-box' }}
        placeholder="Search by name or department…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
        {filtered.map((p) => {
          const conf = p.assignmentConfidence ? confidenceStyle[p.assignmentConfidence] : confidenceStyle.Low;
          return (
            <div key={p.patientId} style={{ ...cardStyle, cursor: 'pointer' }} onClick={() => setSelected(p)}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{p.fullName}</div>
              <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
                {p.age} yrs · {p.gender} · {p.bloodGroup}
              </div>
              <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {p.assignedDepartment ? (
                  <span style={{ ...badgeBase, color: colors.accent, background: colors.accentSoft }}>
                    {p.assignedDepartment}
                  </span>
                ) : (
                  <span style={{ ...badgeBase, color: colors.textMuted, background: colors.statusOfflineBg }}>
                    Unassigned
                  </span>
                )}
                {p.assignmentConfidence && (
                  <span style={{ ...badgeBase, color: conf.color, background: conf.bg }}>{p.assignmentConfidence} confidence</span>
                )}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && <p style={{ color: colors.textMuted, fontSize: 13 }}>No patients match.</p>}
      </div>
    </div>
  );
}

function PatientOverview({ patient, onBack }: { patient: Patient; onBack: (() => void) | null }) {
  const conf = patient.assignmentConfidence ? confidenceStyle[patient.assignmentConfidence] : confidenceStyle.Low;
  return (
    <div style={containerStyle}>
      {onBack && (
        <button onClick={onBack} style={{ ...inputStyle, marginBottom: 12, cursor: 'pointer' }}>
          ← Back to list
        </button>
      )}
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18 }}>{patient.fullName}</h2>
            <div style={{ fontSize: 13, color: colors.textMuted, marginTop: 2 }}>
              {patient.age} yrs · {patient.gender} · Blood group {patient.bloodGroup}
            </div>
          </div>
          {patient.assignedDepartment ? (
            <div style={{ display: 'flex', gap: 6 }}>
              <span style={{ ...badgeBase, color: colors.accent, background: colors.accentSoft }}>
                {patient.assignedDepartment}
              </span>
              {patient.assignmentConfidence && (
                <span style={{ ...badgeBase, color: conf.color, background: conf.bg }}>
                  {patient.assignmentConfidence} confidence
                </span>
              )}
            </div>
          ) : (
            <span style={{ ...badgeBase, color: colors.textMuted, background: colors.statusOfflineBg }}>
              No department assigned yet
            </span>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginTop: 12 }}>
        <div style={cardStyle}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Contact</div>
          <Row label="Phone" value={patient.phone} />
          <Row label="Email" value={patient.email} />
          <Row label="Address" value={patient.address} />
        </div>

        <div style={cardStyle}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Reported Symptoms</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {patient.symptoms.length === 0 && <span style={{ fontSize: 12, color: colors.textMuted }}>None recorded</span>}
            {patient.symptoms.map((s, i) => (
              <span key={i} style={{ ...badgeBase, color: colors.text, background: colors.bg }}>
                {s}
              </span>
            ))}
          </div>
          <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 10 }}>
            Registered {patient.registeredAt.slice(0, 10)}
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
      <span style={{ color: colors.textMuted }}>{label}</span>
      <span>{value}</span>
    </div>
  );
}