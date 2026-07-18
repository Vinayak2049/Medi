'use client';

import { useEffect, useState } from 'react';
import { colors, containerStyle, cardStyle, badgeBase } from '../../styles/hospital';

interface Appointment {
  appointmentId: string;
  patientName: string;
  doctorName: string;
  department: string;
  date: string;
  time: string;
  status: string;
  consultationFee: number;
  createdAt: string;
}

export default function AppointmentConfirmationWidget() {
  const [appointment, setAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'toolOutput') {
        setAppointment(event.data.data as Appointment);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  if (!appointment) {
    return (
      <div style={containerStyle}>
        <p style={{ color: colors.textMuted, fontSize: 13 }}>Loading appointment…</p>
      </div>
    );
  }

  const isConfirmed = appointment.status === 'Confirmed';

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: 15 }}>Appointment {isConfirmed ? 'Confirmed' : appointment.status}</div>
          <span
            style={{
              ...badgeBase,
              color: isConfirmed ? colors.statusAvailable : colors.statusBusy,
              background: isConfirmed ? colors.statusAvailableBg : colors.statusBusyBg
            }}
          >
            {appointment.status}
          </span>
        </div>

        <div style={{ marginTop: 14, fontSize: 13, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Row label="Appointment ID" value={appointment.appointmentId} />
          <Row label="Patient" value={appointment.patientName} />
          <Row label="Doctor" value={appointment.doctorName} />
          <Row label="Department" value={appointment.department} />
          <Row label="Date" value={appointment.date} />
          <Row label="Time" value={appointment.time} />
        </div>

        <div
          style={{
            marginTop: 14,
            paddingTop: 14,
            borderTop: `1px dashed ${colors.border}`,
            display: 'flex',
            justifyContent: 'space-between',
            fontWeight: 700,
            fontSize: 14
          }}
        >
          <span>Consultation Fee</span>
          <span>₹{appointment.consultationFee}</span>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <span style={{ color: colors.textMuted }}>{label}</span>
      <span>{value}</span>
    </div>
  );
}