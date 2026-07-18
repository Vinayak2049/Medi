'use client';

import { useEffect, useState } from 'react';
import { colors, containerStyle, cardStyle, badgeBase } from '../../styles/hospital';

interface ConsultationNote {
  noteId: string;
  doctorName: string;
  department: string;
  diagnosis: string;
  notes: string;
  prescribedMedicines: string[];
  createdAt: string;
}

interface SharedNote {
  shareId: string;
  noteId: string;
  sharedWithDoctorName: string;
  message: string;
  sharedAt: string;
}

interface LabReportRequest {
  requestId: string;
  testName: string;
  status: string;
  requestedAt: string;
  resultSummary?: string;
}

interface PatientMedicalRecord {
  patientId: string;
  patientName: string;
  consultationNotes: ConsultationNote[];
  sharedNotes: SharedNote[];
  labReports: LabReportRequest[];
}

type Tab = 'notes' | 'lab' | 'shared';

export default function MedicalRecordViewerWidget() {
  const [record, setRecord] = useState<PatientMedicalRecord | null>(null);
  const [tab, setTab] = useState<Tab>('notes');

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'toolOutput') {
        setRecord(event.data.data as PatientMedicalRecord);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  if (!record) {
    return (
      <div style={containerStyle}>
        <p style={{ color: colors.textMuted, fontSize: 13 }}>Loading medical record…</p>
      </div>
    );
  }

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'notes', label: 'Consultations & Prescriptions', count: record.consultationNotes.length },
    { key: 'lab', label: 'Lab Reports', count: record.labReports.length },
    { key: 'shared', label: 'Shared with Doctors', count: record.sharedNotes.length }
  ];

  return (
    <div style={containerStyle}>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontWeight: 700, fontSize: 15 }}>{record.patientName}</div>
        <div style={{ fontSize: 12, color: colors.textMuted }}>Patient ID: {record.patientId}</div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              ...badgeBase,
              cursor: 'pointer',
              border: 'none',
              color: tab === t.key ? '#fff' : colors.accent,
              background: tab === t.key ? colors.accent : colors.accentSoft
            }}
          >
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {tab === 'notes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {record.consultationNotes.length === 0 && <Empty text="No consultation notes yet." />}
          {record.consultationNotes.map((note) => (
            <div key={note.noteId} style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, fontSize: 13 }}>{note.doctorName}</span>
                <span style={{ fontSize: 12, color: colors.textMuted }}>{note.createdAt.slice(0, 10)}</span>
              </div>
              <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>{note.department}</div>
              <div style={{ fontSize: 13, marginTop: 8 }}>
                <strong>Diagnosis:</strong> {note.diagnosis}
              </div>
              <div style={{ fontSize: 13, marginTop: 4 }}>
                <strong>Notes:</strong> {note.notes}
              </div>
              {note.prescribedMedicines.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                  {note.prescribedMedicines.map((m, i) => (
                    <span key={i} style={{ ...badgeBase, color: colors.accent, background: colors.accentSoft }}>
                      💊 {m}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === 'lab' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {record.labReports.length === 0 && <Empty text="No lab reports requested yet." />}
          {record.labReports.map((lab) => {
            const isDone = lab.status === 'Completed';
            return (
              <div key={lab.requestId} style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: 13 }}>{lab.testName}</span>
                  <span
                    style={{
                      ...badgeBase,
                      color: isDone ? colors.statusAvailable : colors.statusBusy,
                      background: isDone ? colors.statusAvailableBg : colors.statusBusyBg
                    }}
                  >
                    {lab.status}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 4 }}>
                  Requested {lab.requestedAt.slice(0, 10)}
                </div>
                {lab.resultSummary && <div style={{ fontSize: 13, marginTop: 8 }}>{lab.resultSummary}</div>}
              </div>
            );
          })}
        </div>
      )}

      {tab === 'shared' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {record.sharedNotes.length === 0 && <Empty text="No notes shared with other doctors yet." />}
          {record.sharedNotes.map((share) => (
            <div key={share.shareId} style={cardStyle}>
              <div style={{ fontSize: 13 }}>
                Shared note <strong>{share.noteId}</strong> with <strong>{share.sharedWithDoctorName}</strong>
              </div>
              <div style={{ fontSize: 13, color: colors.textMuted, marginTop: 6 }}>{share.message}</div>
              <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 6 }}>{share.sharedAt.slice(0, 10)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p style={{ color: colors.textMuted, fontSize: 13 }}>{text}</p>;
}