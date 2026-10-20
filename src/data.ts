export interface Zone {
  id: string
  name: string
  en: string
  range: [number, number]
  depth: string
  light: string
  temp: string
  pressure: string
  desc: string
  creatures: { name: string; en: string; note: string }[]
}

export const zones: Zone[] = [
  {
    id: 'surface',
    name: '阳光带',
    en: 'Sunlight Zone',
    range: [0, 200],
    depth: '0 — 200 m',
    light: '充足',
    temp: '约 20℃',
    pressure: '1 — 21 个大气压',
    desc: '海面下最先亮起的一层，也是海洋绝大部分生命的家园。阳光在这里还能触底，浮游生物随波翻涌。',
    creatures: [
      { name: '浮游生物', en: 'Plankton', note: '随洋流漂移，是整座海洋的食物起点。' },
      { name: '飞鱼', en: 'Flying Fish', note: '跃出水面，用滑翔逃离捕食者。' },
      { name: '水母', en: 'Jellyfish', note: '在光里透明得像一小片流动的水。' },
    ],
  },
  {
    id: 'twilight',
    name: '弱光带',
    en: 'Twilight Zone',
    range: [200, 1000],
    depth: '200 — 1000 m',
    light: '微弱',
    temp: '约 4℃',
    pressure: '21 — 101 个大气压',
    desc: '200 米以下，蓝色渐渐把世界吞没。这里只剩百分之几的阳光，生物开始学会自己发光。',
    creatures: [
      { name: '灯笼鱼', en: 'Lanternfish', note: '用腹部光点与同类对话。' },
      { name: '发光水母', en: 'Glow Jelly', note: '把身体变成一盏漂流的灯。' },
      { name: '乌贼', en: 'Squid', note: '在暗处一闪而过，留下光的涟漪。' },
    ],
  },
  {
    id: 'midnight',
    name: '午夜带',
    en: 'Midnight Zone',
    range: [1000, 4000],
    depth: '1000 — 4000 m',
    light: '无',
    temp: '约 4℃',
    pressure: '101 — 401 个大气压',
    desc: '1000 米以下，太阳彻底缺席。生物光成为唯一的照明，像深海里一场无声的灯会。',
    creatures: [
      { name: '鮟鱇鱼', en: 'Anglerfish', note: '举着发光的钓竿，等待猎物靠近。' },
      { name: '巨口鱼', en: 'Dragonfish', note: '浑身长满细密的发光器。' },
      { name: '深海章鱼', en: 'Dumbo Octopus', note: '扇动耳鳍，像在黑暗里游泳的精灵。' },
    ],
  },
  {
    id: 'abyss',
    name: '深渊带',
    en: 'Abyssal Zone',
    range: [4000, 6000],
    depth: '4000 — 6000 m',
    light: '无',
    temp: '约 2℃',
    pressure: '401 — 601 个大气压',
    desc: '四千多米，连生物光都稀疏起来。这里安静得只剩下自己的呼吸，和偶尔落下的「海雪」。',
    creatures: [
      { name: '海参', en: 'Sea Cucumber', note: '在沉积物上缓缓移动，打扫海床。' },
      { name: '三脚架鱼', en: 'Tripod Fish', note: '用鳍撑地，逆着洋流等食物落下来。' },
      { name: '片脚类', en: 'Amphipod', note: '以落入深渊的碎屑为食。' },
    ],
  },
  {
    id: 'trench',
    name: '海沟',
    en: 'Hadal Zone',
    range: [6000, 11000],
    depth: '6000 — 11000 m',
    light: '无',
    temp: '约 1℃',
    pressure: '601 — 1101 个大气压',
    desc: '海沟深处，压强超过一千个大气压，却是生命仍然存在的证明。这里藏着地球最深的秘密。',
    creatures: [
      { name: '狮子鱼', en: 'Snailfish', note: '在 8000 米处仍能自在游动。' },
      { name: '端足类', en: 'Hirondellea', note: '海沟里最常见的小居民。' },
      { name: '细菌群落', en: 'Microbes', note: '以极慢的节奏，维持着深渊的食物链。' },
    ],
  },
]

export const depthKeyframes = [
  { d: 0, top: '#58c4e8', bottom: '#1b5f9e' },
  { d: 200, top: '#1b5f9e', bottom: '#0d3b70' },
  { d: 1000, top: '#0d3b70', bottom: '#071f45' },
  { d: 4000, top: '#071f45', bottom: '#030d24' },
  { d: 6000, top: '#030d24', bottom: '#01040f' },
  { d: 11000, top: '#01040f', bottom: '#000004' },
]
