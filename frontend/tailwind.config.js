/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // GitHub canvas (backgrounds)
        canvas: {
          default:   '#ffffff',
          overlay:   '#ffffff',
          inset:     '#f6f8fa',
          subtle:    '#f6f8fa',
          // dark
          'dark-default':  '#0d1117',
          'dark-overlay':  '#161b22',
          'dark-inset':    '#010409',
          'dark-subtle':   '#161b22',
        },
        // GitHub borders
        border: {
          default:  '#d0d7de',
          muted:    '#d8dee4',
          subtle:   '#eaeef2',
          // dark
          'dark-default': '#30363d',
          'dark-muted':   '#21262d',
          'dark-subtle':  '#161b22',
        },
        // GitHub foreground (text)
        fg: {
          default:  '#1f2328',
          muted:    '#636c76',
          subtle:   '#6e7781',
          onEmphasis: '#ffffff',
          // dark
          'dark-default':    '#e6edf3',
          'dark-muted':      '#848d97',
          'dark-subtle':     '#6e7681',
          'dark-onEmphasis': '#ffffff',
        },
        // GitHub accent (blue — primary action)
        accent: {
          fg:        '#0969da',
          emphasis:  '#0969da',
          muted:     '#54aeff26',
          subtle:    '#ddf4ff',
          // dark
          'dark-fg':       '#2f81f7',
          'dark-emphasis': '#1f6feb',
          'dark-muted':    '#388bfd26',
          'dark-subtle':   '#121d2f',
        },
        // GitHub success (green)
        success: {
          fg:       '#1a7f37',
          emphasis: '#1f883d',
          muted:    '#aceebb',
          subtle:   '#dafbe1',
          // dark
          'dark-fg':       '#3fb950',
          'dark-emphasis': '#238636',
          'dark-muted':    '#2ea04326',
          'dark-subtle':   '#0f2d1a',
        },
        // GitHub danger (red)
        danger: {
          fg:       '#d1242f',
          emphasis: '#cf222e',
          muted:    '#ffcecb',
          subtle:   '#fff0ee',
          // dark
          'dark-fg':       '#f85149',
          'dark-emphasis': '#da3633',
          'dark-muted':    '#f8514926',
          'dark-subtle':   '#2d1216',
        },
        // GitHub neutral
        neutral: {
          emphasis:     '#6e7781',
          emphasisPlus: '#24292f',
          muted:        '#afb8c133',
          subtle:       '#f6f8fa',
          // dark
          'dark-emphasis':     '#6e7681',
          'dark-emphasisPlus': '#8b949e',
          'dark-muted':        '#6e768166',
          'dark-subtle':       '#161b22',
        },
        primary: '#0969da',
        secondary: '#1f883d',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      keyframes: {
        'scroll-left': {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(calc(-100% - var(--gap)))' },
        },
        'scroll-right': {
          from: { transform: 'translateX(calc(-100% - var(--gap)))' },
          to: { transform: 'translateX(0)' },
        },
      },
      animation: {
        'scroll-left': 'scroll-left var(--duration, 25s) linear infinite',
        'scroll-right': 'scroll-right var(--duration, 25s) linear infinite',
      },
    },
  },
  plugins: [],
}
