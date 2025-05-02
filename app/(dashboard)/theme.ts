import { colors } from '@/lib/design-system';

export const dashboardTheme = {
  // Layout
  layout: {
    maxWidth: '1600px',
    contentPadding: 'px-4 sm:px-6 lg:px-8',
    sidebarWidth: '280px',
    headerHeight: '64px',
    footerHeight: '48px',
  },
  
  // Sidebar
  sidebar: {
    background: 'bg-white',
    activeLink: 'bg-gray-100 text-primary',
    hoverLink: 'hover:bg-gray-50',
    textColor: 'text-gray-700',
    borderColor: 'border-gray-100',
    boxShadow: 'shadow-sm',
    width: '280px',
    collapsedWidth: '80px',
  },
  
  // Header
  header: {
    background: 'bg-white',
    textColor: 'text-gray-800',
    borderColor: 'border-gray-100',
    boxShadow: 'shadow-sm',
    height: '64px',
  },
  
  // Content area
  content: {
    background: 'bg-gray-50',
    padding: 'p-6',
  },
  
  // Dashboard cards
  dashboardCards: {
    statsCard: {
      background: 'bg-white',
      border: 'border border-gray-100',
      shadow: 'shadow-sm',
      hover: 'hover:shadow-md transition-shadow duration-200',
      rounded: 'rounded-lg',
      padding: 'p-4',
      iconBackground: 'bg-primary/10',
      iconColor: 'text-primary',
      textColor: 'text-gray-800',
      valueColor: 'text-gray-900',
      labelColor: 'text-gray-500',
    },
    
    summaryCard: {
      background: 'bg-white',
      border: 'border border-gray-100',
      shadow: 'shadow-sm',
      hover: 'hover:shadow-md transition-shadow duration-200',
      rounded: 'rounded-lg',
      padding: 'p-6',
      headerBackground: 'bg-gray-50',
      headerBorder: 'border-b border-gray-100',
      headerPadding: 'px-6 py-4',
      titleSize: 'text-lg',
      titleWeight: 'font-medium',
      titleColor: 'text-gray-800',
    },
  },
  
  // Form elements
  form: {
    label: {
      color: 'text-gray-700',
      size: 'text-sm',
      weight: 'font-medium',
    },
    input: {
      background: 'bg-white',
      border: 'border border-gray-300',
      focusBorder: 'focus:border-primary',
      focusRing: 'focus:ring-2 focus:ring-primary/30',
      height: 'h-10',
      padding: 'px-3 py-2',
      textColor: 'text-gray-900',
      placeholderColor: 'placeholder:text-gray-400',
      rounded: 'rounded-md',
      shadow: 'shadow-sm',
    },
    checkbox: {
      size: 'h-4 w-4',
      color: 'text-primary',
      border: 'border-gray-300',
      rounded: 'rounded',
    },
    radio: {
      size: 'h-4 w-4',
      color: 'text-primary',
      border: 'border-gray-300',
    },
    select: {
      background: 'bg-white',
      border: 'border border-gray-300',
      focusBorder: 'focus:border-primary',
      focusRing: 'focus:ring-2 focus:ring-primary/30',
      height: 'h-10',
      padding: 'px-3 py-2',
      textColor: 'text-gray-900',
      rounded: 'rounded-md',
      shadow: 'shadow-sm',
    },
    error: {
      textColor: 'text-red-500',
      size: 'text-sm',
    },
    helper: {
      textColor: 'text-gray-500',
      size: 'text-xs',
    },
  },
  
  // Data tables
  dataTable: {
    header: {
      background: 'bg-gray-50',
      textColor: 'text-gray-500',
      fontWeight: 'font-medium',
      borderBottom: 'border-b border-gray-200',
      height: 'h-10',
    },
    row: {
      borderBottom: 'border-b border-gray-100',
      hover: 'hover:bg-gray-50/50',
      selected: 'bg-primary/5',
    },
    cell: {
      padding: 'px-4 py-3',
      textColor: 'text-gray-700',
    },
    pagination: {
      buttonColor: 'text-gray-600',
      activeButtonColor: 'text-primary',
      buttonHover: 'hover:bg-gray-100',
      textColor: 'text-gray-500',
    },
  },
  
  // Data visualizations (Charts)
  dataViz: {
    colors: [
      colors.primary,
      colors.success,
      colors.warning,
      colors.danger,
      '#8B5CF6', // purple
      '#3B82F6', // blue
      '#EC4899', // pink
      '#14B8A6', // teal
      '#F97316', // orange
      '#6366F1', // indigo
    ],
    tooltip: {
      background: 'bg-white',
      border: 'border border-gray-200',
      shadow: 'shadow-lg',
      rounded: 'rounded-lg',
      padding: 'p-4',
      titleColor: 'text-gray-800',
      valueColor: 'text-gray-900',
      labelColor: 'text-gray-500',
    },
    grid: {
      stroke: colors.gray[200],
      strokeDasharray: '3 3',
      opacity: 0.5,
    },
    axis: {
      stroke: colors.gray[300],
      tickColor: colors.gray[700],
    },
  },
}; 