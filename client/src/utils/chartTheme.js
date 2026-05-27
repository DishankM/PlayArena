// client/src/utils/chartTheme.js
// Recharts requires explicit fill/stroke values; aligned with arena Tailwind palette

export const CHART_COLORS = {
  primary: '#E8420A',
  navy: '#1A1A2E',
  gold: '#F7C948',
  green: '#16A34A',
  blue: '#0EA5E9',
  purple: '#7C3AED',
  amber: '#D97706',
}

export const PIE_COLORS = [
  CHART_COLORS.primary,
  CHART_COLORS.navy,
  CHART_COLORS.gold,
  CHART_COLORS.green,
  CHART_COLORS.blue,
  CHART_COLORS.purple,
  CHART_COLORS.amber,
]

export const ORDER_STATUS_COLORS = {
  pending: CHART_COLORS.amber,
  confirmed: CHART_COLORS.blue,
  processing: CHART_COLORS.purple,
  shipped: CHART_COLORS.primary,
  delivered: CHART_COLORS.green,
  cancelled: '#DC2626',
}
