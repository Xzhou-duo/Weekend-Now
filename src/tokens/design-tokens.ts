/**
 * 拍了拍设计令牌（与 docs/design-system.md 同步）
 * 供 TS 中非 Tailwind 场景使用（画布、图表、第三方组件 theme）
 */

export const colors = {
  brand: {
    purple: '#7F77DD',
    purpleLight: '#EEEDFE',
    purpleDeep: '#534AB7',
    purpleDarkest: '#3C3489',
    purpleNavy: '#26215C',
    purplePale: '#CECBF6',
  },
  teal: {
    DEFAULT: '#1D9E75',
    light: '#E1F5EE',
    deep: '#085041',
  },
  danger: {
    DEFAULT: '#A32D2D',
    light: '#FCEBEB',
    text: '#791F1F',
    border: '#E24B4A',
  },
  amber: {
    DEFAULT: '#EF9F27',
    collect: '#854F0B',
    light: '#FAEEDA',
    deep: '#633806',
  },
  text: {
    primary: '#2C2C2A',
    secondary: '#888780',
    tertiary: '#B4B2A9',
    onPurple: '#CECBF6',
    headerOnPurple: '#FFFFFF',
  },
  surface: {
    bg: '#F7F7FB',
    card: '#FFFFFF',
  },
  border: {
    card: '#EEEDFE',
    purpleAccent: '#AFA9EC',
  },
  iconBlock: {
    natural: { bg: '#9FE1CB', fg: '#085041' },
    literate: { bg: '#CECBF6', fg: '#3C3489' },
    bazaar: { bg: '#FAC775', fg: '#633806' },
  },
} as const

export const spacing = {
  pageHorizontal: 14,
  cardInner: 12,
  element: 8,
  section: 12,
  chipV: 3,
  chipH: 7,
  btnInnerY: 5,
  btnInnerX: 10,
} as const

export const radius = {
  device: 36,
  cardMain: 20,
  card: 16,
  block: 14,
  iconBlock: 12,
  badge: 8,
} as const

/** 排版层级字号（px）— 字重需在组件中用 font-medium / font-normal */
export const fontSizePx = {
  titlePage: 17,
  titleSection: 16,
  titleCard: 14,
  body: 12,
  bodySm: 11,
  caption: 10,
  hint: 9,
  chipLabel: 10,
} as const

export const fontStack =
  '"PingFang SC","Source Han Sans SC","Noto Sans SC",-apple-system,BlinkMacSystemFont,"Helvetica Neue",sans-serif'
