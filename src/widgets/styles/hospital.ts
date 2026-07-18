import type React from 'react';

export const colors = {
  bg: '#F4F7FB',
  card: '#FFFFFF',
  border: '#E3E9F0',
  text: '#1B2430',
  textMuted: '#5B6B7E',
  accent: '#2464EB',
  accentSoft: '#EAF0FE',
  gold: '#F5A623',
  statusAvailable: '#1BA672',
  statusAvailableBg: '#E6F7EF',
  statusBusy: '#D9822B',
  statusBusyBg: '#FBEEDD',
  statusSurgery: '#C6394B',
  statusSurgeryBg: '#FBE7EA',
  statusOffline: '#8B96A5',
  statusOfflineBg: '#EEF1F4',
  statusLeave: '#7B5CD9',
  statusLeaveBg: '#F0EBFC'
};

export const statusStyle: Record<string, { color: string; bg: string }> = {
  Available: { color: colors.statusAvailable, bg: colors.statusAvailableBg },
  Busy: { color: colors.statusBusy, bg: colors.statusBusyBg },
  'In Surgery': { color: colors.statusSurgery, bg: colors.statusSurgeryBg },
  Offline: { color: colors.statusOffline, bg: colors.statusOfflineBg },
  'On Leave': { color: colors.statusLeave, bg: colors.statusLeaveBg }
};

export const fontStack =
  "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

export const containerStyle: React.CSSProperties = {
  fontFamily: fontStack,
  background: colors.bg,
  color: colors.text,
  padding: '20px',
  borderRadius: '16px',
  width: '100%',
  boxSizing: 'border-box'
};

export const cardStyle: React.CSSProperties = {
  background: colors.card,
  border: `1px solid ${colors.border}`,
  borderRadius: '14px',
  padding: '16px',
  boxShadow: '0 1px 2px rgba(16, 24, 40, 0.04)'
};

export const badgeBase: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: '12px',
  fontWeight: 600,
  padding: '4px 10px',
  borderRadius: '999px',
  whiteSpace: 'nowrap'
};

export const inputStyle: React.CSSProperties = {
  fontFamily: fontStack,
  border: `1px solid ${colors.border}`,
  borderRadius: '10px',
  padding: '9px 12px',
  fontSize: '13px',
  color: colors.text,
  outline: 'none',
  background: '#fff'
};

export const buttonStyle: React.CSSProperties = {
  fontFamily: fontStack,
  border: 'none',
  borderRadius: '10px',
  padding: '9px 14px',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer'
};