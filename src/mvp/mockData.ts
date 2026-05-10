import type {
  Distance,
  Mood,
  Party,
  QuizAnswers,
  SwipeCardModel,
  Venue,
} from './types'

/** 固定 8 张滑卡，覆盖多维标签（MVP-validation：约 8 张） */
export const SWIPE_DECK: SwipeCardModel[] = [
  {
    id: 'c1',
    title: '露天夜市摊位',
    description: '嘈杂热闹，烟火气足，随意逛逛',
    chips: [
      { variant: 'teal', text: '户外' },
      { variant: 'purple', text: '热闹' },
      { variant: 'amber', text: '亲民' },
    ],
    tags: ['outdoor', 'lively', 'budget', 'market', 'group'],
    iconTone: 'bazaar',
    iconName: 'building-store',
  },
  {
    id: 'c2',
    title: '街角小咖啡馆',
    description: '安静角落，适合发呆或看书',
    chips: [
      { variant: 'teal', text: '安静' },
      { variant: 'purple', text: '咖啡' },
      { variant: 'amber', text: '步行圈' },
    ],
    tags: ['quiet', 'cafe', 'solo', 'walk', 'neighbor'],
    iconTone: 'literate',
    iconName: 'plant-2',
  },
  {
    id: 'c3',
    title: '商场顶楼排档',
    description: '选择多，适合「随便吃吃」',
    chips: [
      { variant: 'teal', text: '亲民' },
      { variant: 'purple', text: '热闹' },
      { variant: 'amber', text: '地铁直达' },
    ],
    tags: ['food', 'lively', 'mid', 'metro', 'pair'],
    iconTone: 'natural',
    iconName: 'tools-kitchen-2',
  },
  {
    id: 'c4',
    title: '河滨栈道散步',
    description: '人少景开，走一走就放松',
    chips: [
      { variant: 'teal', text: '户外' },
      { variant: 'purple', text: '安静' },
      { variant: 'amber', text: '免费' },
    ],
    tags: ['outdoor', 'quiet', 'walk', 'solo', 'neighbor'],
    iconTone: 'natural',
    iconName: 'building-store',
  },
  {
    id: 'c5',
    title: '设计集合店',
    description: '空间好看，适合逛逛拍照',
    chips: [
      { variant: 'teal', text: '新鲜感' },
      { variant: 'purple', text: '设计感' },
      { variant: 'amber', text: '小资' },
    ],
    tags: ['design', 'pair', 'metro', 'mid'],
    iconTone: 'literate',
    iconName: 'plant-2',
  },
  {
    id: 'c6',
    title: '本帮小馆私房菜',
    description: '口碑老店，适合你认真吃一顿',
    chips: [
      { variant: 'teal', text: '吃好' },
      { variant: 'purple', text: '正餐' },
      { variant: 'amber', text: '适合2人' },
    ],
    tags: ['food', 'premium', 'pair', 'quiet', 'taxi'],
    iconTone: 'natural',
    iconName: 'tools-kitchen-2',
  },
  {
    id: 'c7',
    title: '社区烘焙坊',
    description: '出炉香气，配一杯拿铁刚好',
    chips: [
      { variant: 'teal', text: '咖啡' },
      { variant: 'purple', text: '安静' },
      { variant: 'amber', text: '步行圈' },
    ],
    tags: ['cafe', 'quiet', 'solo', 'walk', 'budget'],
    iconTone: 'bazaar',
    iconName: 'building-store',
  },
  {
    id: 'c8',
    title: 'Live 小酒馆',
    description: '音乐与人群，适合想热闹一晚',
    chips: [
      { variant: 'teal', text: '热闹' },
      { variant: 'purple', text: '社交' },
      { variant: 'amber', text: '夜间' },
    ],
    tags: ['lively', 'group', 'pair', 'metro', 'mid'],
    iconTone: 'literate',
    iconName: 'tools-kitchen-2',
  },
]

/** 候选池：规则引擎从中选 3 条（假数据 / 上海吃玩混合） */
export const VENUE_POOL: Venue[] = [
  {
    id: 'v1',
    name: '襄阳南路 · 小剧场咖啡',
    categoryLine: '咖啡 · 人少座位松',
    tags: ['quiet', 'cafe', 'solo', 'walk', 'design'],
    iconTone: 'literate',
    iconName: 'plant-2',
  },
  {
    id: 'v2',
    name: '湖滨夜市 · 汤包档口',
    categoryLine: '小吃 · 现做现吃',
    tags: ['market', 'lively', 'budget', 'food', 'group', 'walk'],
    iconTone: 'bazaar',
    iconName: 'building-store',
  },
  {
    id: 'v3',
    name: '巨鹿路 · 创意韩餐',
    categoryLine: '正餐 · 适合约会小聚',
    tags: ['food', 'pair', 'metro', 'mid', 'design'],
    iconTone: 'natural',
    iconName: 'tools-kitchen-2',
  },
  {
    id: 'v4',
    name: '虹桥滨江 · 骑行驿站',
    categoryLine: '户外 · 放空散步',
    tags: ['outdoor', 'quiet', 'walk', 'solo', 'neighbor'],
    iconTone: 'natural',
    iconName: 'building-store',
  },
  {
    id: 'v5',
    name: '愚园路 · 买手集合店',
    categoryLine: '逛店 · 陈列好看',
    tags: ['design', 'fresh', 'pair', 'metro', 'quiet'],
    iconTone: 'literate',
    iconName: 'plant-2',
  },
  {
    id: 'v6',
    name: '进贤路 · 本帮馆子',
    categoryLine: '中餐 · 略预约',
    tags: ['food', 'premium', 'pair', 'taxi', 'quiet'],
    iconTone: 'natural',
    iconName: 'tools-kitchen-2',
  },
  {
    id: 'v7',
    name: '大学路 · Livehouse 楼下餐吧',
    categoryLine: '轻食酒馆 · 偏热闹',
    tags: ['lively', 'group', 'metro', 'mid', 'food'],
    iconTone: 'bazaar',
    iconName: 'tools-kitchen-2',
  },
  {
    id: 'v8',
    name: '新华路 · 社区面包房',
    categoryLine: '烘焙 · 可坐一下午',
    tags: ['cafe', 'quiet', 'solo', 'walk', 'budget'],
    iconTone: 'bazaar',
    iconName: 'building-store',
  },
  {
    id: 'v9',
    name: '龙美术馆西岸馆',
    categoryLine: '看展散步 · 空间感强',
    tags: ['design', 'fresh', 'solo', 'pair', 'taxi', 'outdoor'],
    iconTone: 'literate',
    iconName: 'plant-2',
  },
]

export const QUIZ_COPY: {
  key: keyof QuizAnswers
  label: string
  options: { value: Party | Mood | Distance; label: string }[]
}[] = [
  {
    key: 'party',
    label: '今天几个人出行？',
    options: [
      { value: 'solo', label: '就我一个' },
      { value: 'pair', label: '两个人' },
      { value: 'group', label: '3 人以上' },
    ],
  },
  {
    key: 'mood',
    label: '现在什么状态？',
    options: [
      { value: 'relax', label: '想放松' },
      { value: 'fresh', label: '想新鲜感' },
      { value: 'food', label: '想吃好的' },
      { value: 'whatever', label: '随便' },
    ],
  },
  {
    key: 'distance',
    label: '能接受多远？',
    options: [
      { value: 'walk', label: '步行圈' },
      { value: 'metro', label: '地铁 1–2 站' },
      { value: 'taxi', label: '打车都行' },
    ],
  },
]
