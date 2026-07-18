'use client';

import React from 'react';

interface Doctor {
  doctorId: string;
  fullName: string;
  profilePhoto?: string;
  qualification: string;
  specialization: string;
  department: string;
  yearsOfExperience: number;
  consultationFee: number;
  hospitalBranch: string;
  status: string;
  currentlyAvailable: boolean;
  rating: number;
}

interface DoctorDirectoryProps {
  toolOutput?: {
    doctors?: Doctor[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export default function DoctorDirectoryPage({ toolOutput }: DoctorDirectoryProps) {
  const doctors = toolOutput?.doctors ?? [];

  if (doctors.length === 0) {
    return (
      <div style={{ padding: 16, fontFamily: 'sans-serif' }}>
        <p>No doctors found.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 16, fontFamily: 'sans-serif', display: 'grid', gap: 12 }}>
      {doctors.map((doc) => (
        <div
          key={doc.doctorId}
          style={{
            border: '1px solid #e2e2e2',
            borderRadius: 8,
            padding: 12,
            display: 'flex',
            gap: 12,
            alignItems: 'center'
          }}
        >
          {doc.profilePhoto && (
            <img
              src={doc.profilePhoto}
              alt={doc.fullName}
              style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover' }}
            />
          )}
          <div>
            <div style={{ fontWeight: 600 }}>{doc.fullName}</div>
            <div style={{ fontSize: 13, color: '#666' }}>
              {doc.specialization} · {doc.department}
            </div>
            <div style={{ fontSize: 12, color: '#888' }}>
              {doc.yearsOfExperience} yrs exp · ₹{doc.consultationFee} · ★ {doc.rating}
            </div>
            <div style={{ fontSize: 12, color: doc.currentlyAvailable ? 'green' : '#b33' }}>
              {doc.status}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}