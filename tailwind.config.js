/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ivory: '#FAF7F2',
        sand: '#F1EBE0',
        line: '#E4DDD0',
        ink: '#1D1B16',
        muted: '#75705F',
        clay: '#A8714B',
        olive: '#6F6A50',
        night: '#14120D',
        // Costa del Sol brand-lock palette (hard landscaping page)
        limestone: '#F6F3EC',
        plaster: '#EFE9DF',
        azure: '#1F6F8B',
        'azure-deep': '#175A72',
        sage: '#6F7F54',
        terra: '#B15A36',
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Cabinet Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
        body: ['Satoshi', 'Inter', 'system-ui', 'sans-serif'],
      },
      transitionTimingFunction: {
        luxe: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        marquee: 'marquee 36s linear infinite',
      },
    },
  },
  plugins: [],
};
