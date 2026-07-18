'use client';

import { useEffect, useMemo, useState } from 'react';
import { colors, containerStyle, cardStyle, badgeBase, inputStyle } from '../../styles/hospital';

interface Medicine {
  medicineId: string;
  name: string;
  category: string;
  manufacturer: string;
  unitPrice: number;
  stockQuantity: number;
  requiresPrescription: boolean;
  description: string;
}

interface ListMedicinesOutput {
  medicines: Medicine[];
  pagination?: { page: number; limit: number; total: number; pages: number };
}

declare global {
  interface Window {
    sendPrompt?: (text: string) => void;
  }
}

function stockLevel(qty: number): { label: string; color: string; bg: string } {
  if (qty === 0) return { label: 'Out of stock', color: colors.statusSurgery, bg: colors.statusSurgeryBg };
  if (qty <= 15) return { label: 'Low stock', color: colors.statusBusy, bg: colors.statusBusyBg };
  return { label: 'In stock', color: colors.statusAvailable, bg: colors.statusAvailableBg };
}

export default function PharmacyInventoryWidget() {
  const [data, setData] = useState<ListMedicinesOutput | null>(null);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'toolOutput') {
        setData(event.data.data as ListMedicinesOutput);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const categories = useMemo(() => {
    if (!data) return ['All'];
    return ['All', ...Array.from(new Set(data.medicines.map((m) => m.category))).sort()];
  }, [data]);

  const filtered = useMemo(() => {
    if (!data) return [];
    let list = data.medicines;
    if (category !== 'All') list = list.filter((m) => m.category === category);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((m) => m.name.toLowerCase().includes(q) || m.manufacturer.toLowerCase().includes(q));
    }
    return list;
  }, [data, query, category]);

  if (!data) {
    return (
      <div style={containerStyle}>
        <p style={{ color: colors.textMuted, fontSize: 13 }}>Loading inventory…</p>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
        <input
          style={{ ...inputStyle, flex: '1 1 200px' }}
          placeholder="Search by name or manufacturer…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select style={{ ...inputStyle, flex: '0 0 auto' }} value={category} onChange={(e) => setCategory(e.target.value)}>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
        {filtered.map((med) => {
          const level = stockLevel(med.stockQuantity);
          return (
            <div key={med.medicineId} style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{med.name}</div>
                  <div style={{ fontSize: 12, color: colors.textMuted }}>
                    {med.category} · {med.manufacturer}
                  </div>
                </div>
                <span style={{ fontWeight: 700, fontSize: 13 }}>₹{med.unitPrice}</span>
              </div>

              <p style={{ fontSize: 12, color: colors.textMuted, margin: '8px 0' }}>{med.description}</p>

              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ ...badgeBase, color: level.color, background: level.bg }}>
                  {level.label} ({med.stockQuantity})
                </span>
                {med.requiresPrescription && (
                  <span style={{ ...badgeBase, color: colors.accent, background: colors.accentSoft }}>Rx required</span>
                )}
              </div>

              <button
                disabled={med.stockQuantity === 0}
                onClick={() =>
                  window.sendPrompt?.(
                    `I'd like to prescribe ${med.name} to a patient — can you help me fill in the prescription details?`
                  )
                }
                style={{
                  ...inputStyle,
                  marginTop: 10,
                  width: '100%',
                  textAlign: 'center',
                  cursor: med.stockQuantity === 0 ? 'not-allowed' : 'pointer',
                  color: med.stockQuantity === 0 ? colors.textMuted : colors.accent,
                  fontWeight: 600
                }}
              >
                {med.stockQuantity === 0 ? 'Unavailable' : 'Prescribe'}
              </button>
            </div>
          );
        })}
        {filtered.length === 0 && <p style={{ color: colors.textMuted, fontSize: 13 }}>No medicines match.</p>}
      </div>
    </div>
  );
}