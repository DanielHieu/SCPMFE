/**
 * Design System
 * 
 * This file serves as a centralized location for all design system elements
 * including colors, typography, spacing, shadows, and shared component styles.
 */

// Color system
export const colors = {
  primary: '#0066CC',
  secondary: '#FF7300',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  }
};

// Chart color palette - for consistent data visualization
export const chartColors = [
  '#0066CC', // primary
  '#10B981', // success 
  '#F59E0B', // warning
  '#EF4444', // danger
  '#8B5CF6', // purple
  '#3B82F6', // blue
  '#EC4899', // pink
  '#14B8A6', // teal
  '#F97316', // orange
  '#6366F1', // indigo
  '#84CC16', // lime
  '#06B6D4', // cyan
  '#A855F7', // violet
  '#22C55E', // green
  '#FB7185', // rose
];

// Typography
export const typography = {
  fontFamily: {
    sans: 'var(--font-geist-sans)',
    mono: 'var(--font-geist-mono)',
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  fontSize: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
  },
  lineHeight: {
    none: '1',
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
    loose: '2',
  },
};

// Spacing
export const spacing = {
  0: '0px',
  0.5: '0.125rem', // 2px
  1: '0.25rem',    // 4px
  1.5: '0.375rem', // 6px
  2: '0.5rem',     // 8px
  2.5: '0.625rem', // 10px
  3: '0.75rem',    // 12px
  3.5: '0.875rem', // 14px
  4: '1rem',       // 16px
  5: '1.25rem',    // 20px
  6: '1.5rem',     // 24px
  7: '1.75rem',    // 28px
  8: '2rem',       // 32px
  9: '2.25rem',    // 36px
  10: '2.5rem',    // 40px
  11: '2.75rem',   // 44px
  12: '3rem',      // 48px
  14: '3.5rem',    // 56px
  16: '4rem',      // 64px
  20: '5rem',      // 80px
  24: '6rem',      // 96px
  28: '7rem',      // 112px
  32: '8rem',      // 128px
  36: '9rem',      // 144px
  40: '10rem',     // 160px
  44: '11rem',     // 176px
  48: '12rem',     // 192px
  52: '13rem',     // 208px
  56: '14rem',     // 224px
  60: '15rem',     // 240px
  64: '16rem',     // 256px
  72: '18rem',     // 288px
  80: '20rem',     // 320px
  96: '24rem',     // 384px
};

// Border radius
export const borderRadius = {
  none: '0px',
  sm: '0.125rem',   // 2px
  default: '0.25rem', // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px',
};

// Shadows
export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  default: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  none: 'none',
};

// Z-index
export const zIndex = {
  0: '0',
  10: '10',
  20: '20',
  30: '30',
  40: '40',
  50: '50',
  auto: 'auto',
  dropdown: '1000',
  sticky: '1020',
  fixed: '1030',
  modalBackdrop: '1040',
  modal: '1050',
  popover: '1060',
  tooltip: '1070',
};

// Transition
export const transition = {
  default: 'all 0.2s ease-in-out',
  fast: 'all 0.1s ease-in-out',
  slow: 'all 0.3s ease-in-out',
};

// Card styles
export const cardStyles = {
  default: {
    background: 'bg-white',
    border: 'border border-gray-100',
    shadow: 'shadow-sm',
    hover: 'hover:shadow-md transition-shadow duration-200',
    rounded: 'rounded-lg',
    padding: 'p-6',
  },
  header: {
    background: 'bg-gray-50',
    border: 'border-b border-gray-100',
    padding: 'px-6 py-4',
  },
  title: {
    size: 'text-xl',
    weight: 'font-semibold',
    color: 'text-gray-800',
  },
};

// Button styles
export const buttonStyles = {
  base: 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background',
  sizes: {
    sm: 'h-9 px-3 rounded-md',
    md: 'h-10 py-2 px-4',
    lg: 'h-11 px-8 rounded-md',
    icon: 'h-10 w-10',
  },
  variants: {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
    outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    link: 'underline-offset-4 hover:underline text-primary',
  },
};

// Table styles
export const tableStyles = {
  base: 'w-full caption-bottom text-sm',
  header: 'bg-gray-50 [&_tr]:border-b',
  headerCell: 'h-12 px-4 text-left align-middle font-medium text-gray-500',
  body: '[&_tr:last-child]:border-0',
  row: 'border-b transition-colors hover:bg-gray-50/50 data-[state=selected]:bg-gray-50',
  cell: 'p-4 align-middle',
  footer: 'bg-gray-50 border-t',
};

// Chart styles
export const chartStyles = {
  container: 'bg-white p-4 rounded-lg border border-gray-100 shadow-sm',
  title: 'text-lg font-medium text-gray-800 mb-4',
  axisLine: { stroke: colors.gray[300] },
  axisTick: { fontSize: 12, fill: colors.gray[700] },
  grid: { strokeDasharray: '3 3', opacity: 0.2 },
  tooltip: {
    container: 'bg-white p-4 border border-gray-200 shadow-lg rounded-lg',
    title: 'font-semibold text-gray-800',
    itemContainer: 'mt-3 space-y-2',
    item: 'flex items-center gap-2',
    itemText: 'text-sm',
    itemValue: 'font-semibold',
  },
}; 