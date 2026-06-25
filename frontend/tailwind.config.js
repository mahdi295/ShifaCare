/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary palette — clean medical blue
        primary:    '#1A6BCC',
        'primary-light': '#EBF3FF',
        'primary-dark':  '#1252A3',
        // Secondary — teal for accents
        secondary:  '#0D9488',
        'secondary-light': '#CCFBF1',
        // Neutral system
        surface:    '#FFFFFF',
        background: '#F4F6F9',
        border:     '#E2E8F0',
        'border-strong': '#CBD5E1',
        // Text
        heading:    '#0F172A',
        body:       '#334155',
        muted:      '#64748B',
        subtle:     '#94A3B8',
        // Legacy aliases (keeps old refs working)
        accent:     '#1A6BCC',
        'accent-secondary': '#0D9488',
        text:       '#334155',
        // Status
        success:    '#16A34A',
        warning:    '#D97706',
        danger:     '#DC2626',
        info:       '#2563EB',
      },
      fontFamily: {
        heading: ['Plus Jakarta Sans', 'sans-serif'],
        body:    ['DM Sans', 'sans-serif'],
      },
      boxShadow: {
        'card':   '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-md':'0 4px 12px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04)',
        'card-lg':'0 8px 24px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.05)',
        'nav':    '0 1px 0 #E2E8F0',
        'button': '0 1px 2px rgba(26,107,204,0.20)',
        // Keep nm- aliases to avoid breaking references
        'nm-flat':   '0 1px 3px rgba(0,0,0,0.06)',
        'nm-inset':  'inset 0 1px 3px rgba(0,0,0,0.06)',
        'nm-sm':     '0 1px 2px rgba(0,0,0,0.05)',
        'nm-sm-inset':'inset 0 1px 2px rgba(0,0,0,0.05)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
