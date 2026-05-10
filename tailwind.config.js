/** @type {import('tailwindcss').Config} */
/**
 * 与仓库根目录 `docs/design-system.md` 对齐的设计令牌。
 * 用法示例：bg-surface-bg text-text-primary px-page-h rounded-card-main
 */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // §2 Brand
        'brand-purple': '#7F77DD',
        'brand-purple-light': '#EEEDFE',
        'brand-purple-deep': '#534AB7',
        'brand-purple-darkest': '#3C3489',
        'brand-purple-navy': '#26215C',
        // §2 Secondary
        teal: '#1D9E75',
        'teal-light': '#E1F5EE',
        'teal-deep': '#085041',
        // §2 Semantic
        danger: '#A32D2D',
        'danger-light': '#FCEBEB',
        'danger-text': '#791F1F',
        'danger-border': '#E24B4A',
        // §2 State
        amber: '#EF9F27',
        'amber-collect': '#854F0B',
        'amber-light': '#FAEEDA',
        'amber-deep': '#633806',
        // §2 Neutral
        'text-primary': '#2C2C2A',
        'text-secondary': '#888780',
        'text-tertiary': '#B4B2A9',
        'text-on-purple': '#CECBF6',
        'surface-bg': '#F7F7FB',
        'surface-card': '#FFFFFF',
        'border-card': '#EEEDFE',
        // §2.6 Icon block backgrounds (bg + fg pairs — fg as separate utilities)
        'icon-block-natural': '#9FE1CB',
        'icon-block-literate': '#CECBF6',
        'icon-block-bazaar': '#FAC775',
      },
      spacing: {
        'page-h': '14px',
        'card-inner': '12px',
        element: '8px',
        section: '12px',
        'chip-v': '3px',
        'chip-h': '7px',
        'btn-inner-y': '5px',
        'btn-inner-x': '10px',
      },
      borderRadius: {
        device: '36px',
        'card-main': '20px',
        card: '16px',
        block: '14px',
        'icon-block': '12px',
        badge: '8px',
      },
      fontFamily: {
        sans: [
          'PingFang SC',
          'Source Han Sans SC',
          'Noto Sans SC',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Helvetica Neue"',
          'sans-serif',
        ],
      },
      fontSize: {
        'title-page': [
          '17px',
          { lineHeight: '1.35', fontWeight: '500' },
        ],
        'title-section': [
          '16px',
          { lineHeight: '1.35', fontWeight: '500' },
        ],
        'title-card': [
          '14px',
          { lineHeight: '1.4', fontWeight: '500' },
        ],
        body: ['12px', { lineHeight: '1.5', fontWeight: '400' }],
        'body-sm': ['11px', { lineHeight: '1.5', fontWeight: '400' }],
        caption: ['10px', { lineHeight: '1.4', fontWeight: '400' }],
        hint: ['9px', { lineHeight: '1.4', fontWeight: '400' }],
        'chip-label': ['10px', { lineHeight: '1.3', fontWeight: '500' }],
      },
      boxShadow: {
        // subtle card (design system — 轻描边主要由 border-card 承担)
        card: '0 1px 0 rgba(44, 44, 42, 0.04)',
      },
    },
  },
  plugins: [],
}
