# 拍了拍 · Design System V2.0

> 本文档为「拍了拍」App 的正式设计系统规范，涵盖设计语言、色彩系统、字体规范、间距规则、组件库与页面规范。
> 适用范围：产品设计、前端开发、设计评审、Figma 组件库维护。

---

## 目录

1. [设计语言 Design Language](#1-设计语言-design-language)
2. [色彩系统 Color System](#2-色彩系统-color-system)
3. [字体系统 Typography](#3-字体系统-typography)
4. [间距与圆角 Spacing & Radius](#4-间距与圆角-spacing--radius)
5. [图标规范 Iconography](#5-图标规范-iconography)
6. [组件库 Components](#6-组件库-components)
7. [页面规范 Page Specs](#7-页面规范-page-specs)
8. [交互流程 Interaction Flow](#8-交互流程-interaction-flow)
9. [开发交付规范 Handoff Notes](#9-开发交付规范-handoff-notes)

---

## 1. 设计语言 Design Language

### 品牌调性

「拍了拍」是一款 AI 驱动的个性化出行推荐 App，设计语言传递以下核心感受：

- **温暖智识**：AI 的精准推荐感，同时保持生活化的温度
- **轻盈直觉**：操作路径极简，卡片滑动即决策
- **个人专属**：界面随用户行为持续进化，体现 AI 学习感

### 设计原则

| 原则 | 说明 |
|---|---|
| 内容优先 | 推荐场所本身是主角，UI 元素服务于内容呈现 |
| 状态透明 | AI 的判断依据始终可见，避免黑箱感 |
| 反馈即时 | 每一次滑动、选择、提交均有明确视觉反馈 |
| 渐进引导 | 新用户路径有清晰进度感，降低冷启动焦虑 |

---

## 2. 色彩系统 Color System

### 2.1 品牌主色 Brand Colors

| Token 名称 | 色值 | 用途 |
|---|---|---|
| `brand-purple` | `#7F77DD` | 主按钮、选中态、顶部 Header、进度条 |
| `brand-purple-light` | `#EEEDFE` | 背景填充、芯片底色、卡片描边 |
| `brand-purple-deep` | `#534AB7` | 文字强调、标签文字、图标深色 |
| `brand-purple-darkest` | `#3C3489` | AI 说明框内容文字 |
| `brand-purple-navy` | `#26215C` | 深色标题（紫色背景上） |

### 2.2 辅助色 Secondary Colors

| Token 名称 | 色值 | 用途 |
|---|---|---|
| `teal` | `#1D9E75` | 确认按钮、推荐理由标签、匹配度高 |
| `teal-light` | `#E1F5EE` | 推荐理由背景、芯片底色 |
| `teal-deep` | `#085041` | Teal 背景上的文字、图标 |

### 2.3 功能色 Semantic Colors

| Token 名称 | 色值 | 用途 |
|---|---|---|
| `danger` | `#A32D2D` | 不喜欢按钮图标、AI 注意到框标题 |
| `danger-light` | `#FCEBEB` | 不喜欢按钮背景、AI 注意到框背景 |
| `danger-text` | `#791F1F` | AI 注意到框内容文字 |
| `danger-border` | `#E24B4A` | 踩雷评分按钮选中描边 |

### 2.4 状态色 State Colors

| Token 名称 | 色值 | 用途 |
|---|---|---|
| `amber` | `#EF9F27` | 出行半径进度条、一般评分选中 |
| `amber-collect` | `#854F0B` | 收藏按钮图标 |
| `amber-light` | `#FAEEDA` | 收藏按钮背景、Amber 芯片底色 |
| `amber-deep` | `#633806` | Amber 芯片文字 |

### 2.5 中性色 Neutral Colors

| Token 名称 | 色值 | 用途 |
|---|---|---|
| `text-primary` | `#2C2C2A` | 主要标题、正文 |
| `text-secondary` | `#888780` | 次要文字、图标 |
| `text-tertiary` | `#B4B2A9` | 辅助提示、Tab 非激活 |
| `text-on-purple` | `#CECBF6` | 紫色 Header 上的次级文字 |
| `surface-bg` | `#F7F7FB` | 全局页面背景 |
| `surface-card` | `#FFFFFF` | 卡片、浮层背景 |
| `border-card` | `#EEEDFE` | 卡片描边（同 brand-purple-light） |

### 2.6 图标色块背景 Icon Block Colors

用于推荐卡片中的场所图标色块，传递场所氛围类型：

| 背景色 | 图标前景色 | 代表场景 |
|---|---|---|
| `#9FE1CB` | `#085041` | 餐饮 / 日式 / 自然系 |
| `#CECBF6` | `#3C3489` | 咖啡 / 植物 / 文艺系 |
| `#FAC775` | `#633806` | 街头小吃 / 市集 / 市井系 |

---

## 3. 字体系统 Typography

### 3.1 字体选用

- **首选字体**：PingFang SC（iOS）/ 思源黑体（Android）
- **降级字体**：-apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif

### 3.2 字体层级

| 层级名称 | 字号 | 字重 | 颜色 Token | 使用场景 |
|---|---|---|---|---|
| `title-page` | 17px | 500 | `text-primary` | 页面大标题 |
| `title-section` | 16px | 500 | `text-primary` | 区块主标题、Header 主标题 |
| `title-card` | 13–14px | 500 | `text-primary` | 卡片名称、场所名称 |
| `body` | 11–12px | 400 | `text-primary` | 正文、描述、AI 框内容 |
| `caption` | 10px | 400 | `text-secondary` | 次要说明、问题标签、元信息 |
| `hint` | 9px | 400 | `text-tertiary` | 辅助提示、Tab 文字、角标 |
| `chip-label` | 9–10px | 400/500 | 对应色系深色 | 芯片、标签文字 |

### 3.3 特殊文字处理

- 标题内强调词（如「喜欢」）：下划线装饰，颜色 `#7F77DD`，粗细 2px
- 紫色 Header 上主标题：`#FFFFFF`，16px，字重 500
- 紫色 Header 上副标题：`#CECBF6`，10px，字重 400

---

## 4. 间距与圆角 Spacing & Radius

### 4.1 间距规范

| 名称 | 值 | 用途 |
|---|---|---|
| `spacing-page-horizontal` | 14px | 页面水平内边距 |
| `spacing-card-inner` | 10–12px | 卡片内边距 |
| `spacing-element` | 8px | 同级元素间距 |
| `spacing-section` | 10–12px | 页面区块间距 |
| `spacing-chip-v` | 3px | 芯片垂直内边距 |
| `spacing-chip-h` | 7px | 芯片水平内边距 |
| `spacing-btn-inner` | 5px 10px | 选项按钮内边距 |

### 4.2 圆角规范

| 名称 | 值 | 适用元素 |
|---|---|---|
| `radius-device` | 36px | 手机设备边框 |
| `radius-card-main` | 20px | 主卡片（滑卡区） |
| `radius-card` | 16px | 推荐列表卡片 |
| `radius-block` | 14px | 小卡片、问题块、按钮、AI 框 |
| `radius-icon-block` | 12px | 图标色块、头像 |
| `radius-badge` | 8–10px | 芯片、匹配度徽章、小标签 |
| `radius-circle` | 50% | 圆形按钮（操作按钮组） |

---

## 5. 图标规范 Iconography

### 5.1 图标库

使用 **Tabler Icons**（`ti-*` 前缀），线条风格，描边粗细统一。

### 5.2 图标尺寸

| 使用场景 | 尺寸 |
|---|---|
| Tab Bar 图标 | 20px |
| 操作按钮（不喜欢/收藏） | 20px |
| 操作按钮（喜欢，主按钮） | 24px |
| 卡片详情返回/收藏 | 14px |
| AI 框头部图标 | 13–14px |
| 元信息行图标 | 10px |
| 场所色块图标 | 38–42px |
| 空状态引导图标 | 38px |

### 5.3 核心图标索引

| 功能 | 图标名 |
|---|---|
| 发现（Tab） | `ti-map-pin` |
| 收藏（Tab） | `ti-bookmark` |
| 我的（Tab） | `ti-user` |
| 不喜欢 | `ti-x` |
| 喜欢 | `ti-heart` |
| 收藏操作 | `ti-bookmark` |
| AI 推荐 / 空状态 | `ti-sparkles` |
| AI 注意到 | `ti-alert-circle` |
| AI 更新画像 | `ti-refresh` |
| 返回 | `ti-arrow-left` |
| 位置 | `ti-map-pin` |
| 价格 | `ti-coin` |
| 时间 | `ti-clock` |
| 餐饮场所 | `ti-tools-kitchen-2` |
| 植物/咖啡场所 | `ti-plant-2` |
| 市集场所 | `ti-building-store` |
| 好评表情 | `ti-mood-happy` |
| 中评表情 | `ti-mood-neutral` |
| 差评表情 | `ti-mood-sad` |

---

## 6. 组件库 Components

### 6.1 状态栏 Status Bar

```
高度：20px
背景：随当前页头部（白色页 → #FFFFFF，紫色页 → #7F77DD）
左侧：时间「9:41」，9px
右侧：WiFi + 电池图标，10px
文字色：紫色背景 → #CECBF6 | 白色背景 → #888780
```

### 6.2 手机设备框 Device Frame

```
宽度：210px
背景色：#2C2C2A
边框：6px solid #2C2C2A
圆角：36px
顶部刘海：高 28px，胶囊 60×10px，颜色 #1a1a1a
```

### 6.3 底部 Tab Bar

```
高度：52px
背景：#FFFFFF
顶部描边：1px solid #EEEDFE

Tab 项目（3个，均分）：
  - 发现（ti-map-pin）
  - 收藏（ti-bookmark）
  - 我的（ti-user）

激活态：图标 + 文字 → #7F77DD
非激活态：图标 + 文字 → #B4B2A9
图标：20px | 文字：8px
```

### 6.4 芯片 Chip

```
内边距：3px 7px
圆角：8–10px

Teal 芯片：  背景 #E1F5EE | 文字 #085041
Purple 芯片：背景 #EEEDFE | 文字 #534AB7
Amber 芯片： 背景 #FAEEDA | 文字 #633806
```

### 6.5 匹配度徽章 Match Badge

```
高匹配（含百分比）：背景 #E1F5EE | 文字 #085041 | 圆角 8px | 10px 加粗
探索型：        背景 #EEEDFE | 文字 #534AB7
```

### 6.6 AI 推荐说明框 AI Box

```
背景：#EEEDFE
圆角：14px
内边距：10px 12px

头部：
  图标：ti-sparkles，14px，#7F77DD
  标题：10px，#534AB7，加粗

内容：
  字号：11px
  颜色：#3C3489
  行高：1.5
```

### 6.7 AI 注意到框 AI Note

```
背景：#FCEBEB
圆角：14px
内边距：10px 12px

头部：
  图标：ti-alert-circle，13px，#A32D2D
  标题：「AI 注意到」，10px，#A32D2D，加粗

内容：
  字号：11px
  颜色：#791F1F
  行高：1.4
```

### 6.8 进度条 Progress Bar

```
高度：6px
轨道背景：#EEEDFE，圆角 3px
填充色：#7F77DD，圆角 3px
配套文字：右侧对齐，9px，#888780
```

### 6.9 选项按钮（问题卡片内） Option Button

| 状态 | 背景 | 文字色 | 边框 |
|---|---|---|---|
| 未选中 | `#F7F7FB` | `#888780` | 1px `#EEEDFE` |
| 已选中 | `#7F77DD` | `#FFFFFF` | 1px `#7F77DD` |

```
圆角：10px
内边距：5px 10px
字号：10px
```

### 6.10 筛选芯片（列表筛选栏）Filter Chip

| 状态 | 背景 | 文字色 | 边框 |
|---|---|---|---|
| 未选中 | 透明 | `#888780` | 1px `#EEEDFE` |
| 已选中 | `#7F77DD` | `#FFFFFF` | — |

### 6.11 主操作按钮 Primary Button

```
背景：#7F77DD
圆角：14px
内边距：12px（全宽时）/ 11px（短按钮）
文字：12px，字重 500，#FFFFFF
```

### 6.12 辅助操作按钮 Secondary Button

```
背景：#FFFFFF
边框：1.5px solid #EEEDFE
圆角：14px
文字：11px，#888780
```

### 6.13 确认操作按钮 Confirm Button（绿色）

```
背景：#1D9E75
圆角：14px
内边距：12px
文字：12px，字重 500，#E1F5EE
```

### 6.14 圆形操作按钮组 Action Buttons（滑卡页）

| 按钮 | 尺寸 | 背景 | 图标 | 图标色 |
|---|---|---|---|---|
| 不喜欢（X） | 46×46px 圆形 | `#FCEBEB` | ti-x，20px | `#A32D2D` |
| 喜欢（心）主 | 56×56px 圆形 | `#7F77DD` | ti-heart，24px | `#EEEDFE` |
| 收藏（书签） | 46×46px 圆形 | `#FAEEDA` | ti-bookmark，20px | `#854F0B` |

### 6.15 评分按钮 Rating Button（反馈页）

| 按钮 | 默认 | 选中背景 | 选中描边 | 图标（选中） |
|---|---|---|---|---|
| 好 | 白底 `#EEEDFE` 描边 | `#E1F5EE` | `#1D9E75` | ti-mood-happy `#1D9E75` |
| 一般 | 白底 `#EEEDFE` 描边 | `#FAEEDA` | `#EF9F27` | ti-mood-neutral `#EF9F27` |
| 踩雷 | 白底 `#EEEDFE` 描边 | `#FCEBEB` | `#E24B4A` | ti-mood-sad `#E24B4A` |

```
圆角：14px
内边距：12px 4px
排列：flex 纵向居中
图标：20px
文字：10px
```

### 6.16 多选标签 Tag（满意点）

| 状态 | 背景 | 边框 | 文字色 |
|---|---|---|---|
| 未选中 | `#FFFFFF` | 1px `#EEEDFE` | `#888780` |
| 已选中 | `#EEEDFE` | 1px `#AFA9EC` | `#534AB7` |

```
圆角：10px
内边距：5px 10px
字号：10px
排列：flex-wrap，间距 6px
```

### 6.17 维度卡片 Dimension Card（画像页）

```
背景：#FFFFFF
圆角：14px
内边距：10px
布局：2列网格，间距 7px

维度名称：9px，#888780
维度值：  11px，字重 500，#2C2C2A
进度条：  高 4px，背景 #EEEDFE，上边距 6px
```

---

## 7. 页面规范 Page Specs

### Page 01 · 冷启动建档

**触发时机**：App 首次启动，用户无历史数据

| 区域 | 规格 |
|---|---|
| 页面背景 | `#F7F7FB` |
| 顶部标题区 | 白色背景；副标题 10px `#888780`；主标题 17px 500 `#2C2C2A`；「喜欢」加紫色下划线 |
| 进度条 | 当前 35%（7/20）；右侧文字「7 / 20」|
| 滑卡主卡片 | 白底，圆角 20px，描边 1px `#EEEDFE` |
| 卡片图片区 | 高 110px；背景 `#9FE1CB`；中心图标 40px `#085041`；左上角白色标签 |
| 卡片信息区 | 内边距 10px 12px；名称 13px；描述 10px `#888780`；芯片组 |
| 操作按钮组 | 底部三按钮，背景 `#F7F7FB`，内边距 8px 14px 12px，间距 14px |

**交互**：左滑 → 不喜欢 | 右滑 → 喜欢 | 上滑 → 收藏 | 按钮点击 = 对应手势

---

### Page 02 · 今日状态输入

**触发时机**：建档完成或点击继续后

| 区域 | 规格 |
|---|---|
| 页面背景 | `#F7F7FB` |
| Header | 背景 `#7F77DD`，内边距 16px 14px 20px |
| Header 小标签 | 「周六早上」，背景 `#EEEDFE`，文字 `#534AB7`，9px，圆角 8px |
| Header 主标题 | 16px，500，`#FFFFFF` |
| Header 副标题 | 10px，`#CECBF6` |
| 问题卡片 | 3个，白底，圆角 14px，内边距 10px 12px |
| 问题标签 | 10px，`#888780`，底部间距 6px |
| 选项按钮 | 见 6.9 Option Button |
| 生成按钮 | 见 6.13 Confirm Button，文字「生成今日专属方案 →」 |

**问题内容**：
1. 今天几个人出行？→ 就我一个 / 两个人 / 3人以上
2. 现在什么状态？→ 想放松 / 想新鲜感 / 想吃好的 / 随便
3. 能接受多远？→ 步行圈 / 地铁1-2站 / 打车都行

---

### Page 03 · 推荐结果列表

**触发时机**：提交状态后 AI 生成方案（需建档完成）

| 区域 | 规格 |
|---|---|
| 页面背景 | `#F7F7FB` |
| 顶部区域 | 白色，内边距 14px 14px 8px |
| 主标题 | 「为你挑了 8 个地方」，16px，500，`#2C2C2A` |
| 副标题 | 10px，`#888780` |
| 筛选栏 | 白底，内边距 6px 14px；见 6.10 Filter Chip |
| 推荐卡片 | 白底，圆角 16px，内边距 10px，flex 横向 |
| 卡片图标块 | 54×54px，圆角 12px；见 §5 图标色块背景 |
| 卡片名称 | 12px，500，`#2C2C2A` |
| 推荐理由标签 | 9px，圆角 6px，内边距 2px 6px |
| 元信息 | 9px，`#B4B2A9` |
| Tab Bar | 激活：发现 |

---

### Page 04 · 卡片详情

**触发时机**：点击推荐列表任意卡片

| 区域 | 规格 |
|---|---|
| 顶部图片区（沉浸式） | 高 100px，背景 `#9FE1CB`，中心图标 42px |
| 返回按钮 | 左上角，28×28px 白色圆形，ti-arrow-left 14px `#2C2C2A` |
| 收藏按钮 | 右上角，28×28px 白色圆形，ti-bookmark 14px `#7F77DD` |
| 内容区内边距 | 12px 14px，区块间距 8px |
| 场所名称 | 16px，500，`#2C2C2A` |
| 元信息行 | ti-map-pin / ti-coin / ti-clock，10px，`#888780` |
| AI 推荐理由框 | 见 6.6 AI Box |
| 底部按钮组 | 见 6.11 Primary Button + 6.12 Secondary Button，flex 1:2 |

**按钮文案**：「不感兴趣」（Secondary）/ 「就决定这里了」（Primary）

---

### Page 05 · 我的口味画像

**触发时机**：点击 Tab Bar「我的」

| 区域 | 规格 |
|---|---|
| 页面背景 | `#F7F7FB` |
| Header | 背景 `#7F77DD`，内边距 16px 14px 20px |
| 用户头像 | 40×40px 圆形，背景 `#EEEDFE`，ti-user 20px `#534AB7` |
| 用户名 | 14px，500，`#FFFFFF` |
| 副标题 | 「基于 8 次出行 · 47 次滑动」，10px，`#CECBF6` |
| 学习中徽章 | 背景 `#CECBF6`，文字 `#26215C`，9px，圆角 8px |
| 维度网格 | 2列，间距 7px；见 6.17 Dimension Card |
| AI 注意到框 | 见 6.7 AI Note |
| Tab Bar | 激活：我的 |

**维度数据示例**：

| 维度 | 值 | 进度 | 进度条色 |
|---|---|---|---|
| 环境偏好 | 安静有设计感 | 80% | `#7F77DD` |
| 价格敏感度 | 中等 ¥50-100 | 55% | `#1D9E75` |
| 社交模式 | 独处 or 2人 | 70% | `#7F77DD` |
| 出行半径 | 地铁2站内 | 45% | `#EF9F27` |

---

### Page 06 · 空状态页（冷启动未完成保护）

**触发时机**：冷启动滑卡 < 20 张时进入推荐列表

| 区域 | 规格 |
|---|---|
| 页面背景 | `#F7F7FB` |
| 顶部区域 | 同 Page 03，白色头部 |
| 筛选栏 | 同 Page 03，但置灰不可交互 |
| 模糊预览 | 2张半透明卡片（opacity: 0.35）+ 渐变遮罩（透明 → `#F7F7FB`，高 40px） |
| 引导图标块 | 80×80px，圆角 24px，背景 `#EEEDFE`，ti-sparkles 38px `#7F77DD` |
| 主文案 | 「再滑几张，推荐就准了」，14px，500，`#2C2C2A`，居中 |
| 副文案 | 11px，`#888780`，居中，行高 1.6 |
| 进度提示卡 | 背景 `#F7F7FB`，圆角 12px，内边距 10px 12px；进度 7/20，35% |
| 主按钮 | 见 6.11，「继续滑卡，完善口味」，全宽 |
| 次按钮 | 见 6.12，「先看看大家都在去哪」，全宽 |
| 底部提示 | 「完成后推荐准确度提升约 60%」，10px，`#B4B2A9`，居中 |
| Tab Bar | 激活：发现 |

**设计意图**：模糊预览制造"内容就在眼前"的心理预期，驱动用户完成建档。

---

### Page 07 · 出行后反馈

**触发时机**：用户确认出行并完成后，通过推送通知或首页弹卡进入

| 区域 | 规格 |
|---|---|
| 页面背景 | `#F7F7FB` |
| Header | 背景 `#7F77DD`，内边距 16px 14px 22px |
| 返回行 | ti-arrow-left 16px `#CECBF6` + 文字 12px `#CECBF6` |
| 出行地点卡片 | 背景 `#CECBF6`，圆角 12px，内边距 8px 10px，flex 横向 |
| 地点图标块 | 36×36px，圆角 9px，背景 `#9FE1CB`，图标 16px `#085041` |
| 地点名称 | 12px，500，`#26215C` |
| 地点副标题 | 10px，`#534AB7` |
| 评分区 | 「总体感受」，12px，500，`#2C2C2A`；3个评分按钮横排 |
| 评分按钮 | 见 6.15 Rating Button |
| 满意点容器 | 白底，圆角 14px，内边距 10px 12px |
| 满意点标签 | 见 6.16 Tag；预置 6 个选项 |
| AI 画像更新框 | 见 6.6 AI Box，图标 ti-refresh，标题「AI 正在更新你的画像」 |
| 提交按钮 | 见 6.11，「提交反馈，让推荐更懂你」，全宽，左右外边距 14px |

**满意点标签预置**：环境安静 / 性价比高 / 菜品好吃 / 服务好 / 交通方便 / 适合独处

---

## 8. 交互流程 Interaction Flow

```
首次启动
  └→ Page 01 冷启动建档
       滑卡 < 20 张 → Page 02（同时记录未完成状态）
       滑卡已完成   → Page 02
         └→ Page 02 今日状态输入
               提交 → Page 03 推荐结果列表
                        冷启动未完成 → Page 06 空状态页
                          └→ 「继续滑卡」→ Page 01
                        点击卡片     → Page 04 卡片详情
                          └→ 「不感兴趣」    → 返回 Page 03（卡片降权）
                          └→ 「就决定这里了」→ 出行中状态
                                              出行完成推送
                                              → Page 07 出行后反馈
                                                  提交 → AI 更新画像
                                                         返回 Page 03
                          └→ 左上角返回     → Page 03
                          └→ 右上角收藏     → 加入收藏夹

Tab Bar 全局可访问：
  发现（Page 03/06）↔ 收藏（后续迭代）↔ 我的（Page 05）
```

---

## 9. 开发交付规范 Handoff Notes

### Figma 组件化建议

以下组件建议在 Figma 中创建为 **Component**，并按变体（Variants）管理状态：

| 组件 | 变体维度 |
|---|---|
| Tab Bar | active tab（发现/收藏/我的） |
| AI Box / AI Note | — |
| Chip | color（teal/purple/amber） |
| Option Button | state（default/selected） |
| Filter Chip | state（default/selected） |
| Rating Button | state（default/selected）+ type（好/一般/踩雷） |
| Tag | state（default/selected） |
| Progress Bar | progress（%值） |
| Match Badge | type（match/explore） |

### Color Styles 命名规范

```
Brand/Purple
Brand/Purple-Light
Brand/Purple-Deep
Brand/Purple-Darkest
Teal/Default
Teal/Light
Teal/Deep
Danger/Default
Danger/Light
Danger/Text
Amber/Default
Amber/Collect
Amber/Light
Text/Primary
Text/Secondary
Text/Tertiary
Text/On-Purple
Surface/Background
Surface/Card
Border/Card
```

### 页面导入顺序（Figma Make）

推荐按以下顺序逐页导入：
**01 → 02 → 03 → 06 → 04 → 07 → 05**

每次导入内容：`全局规范 + 共用组件 + 单个页面说明`

### 交互连线

- 在 Prototype 面板按第 8 节流程图添加页面跳转连线
- 滑动手势：在触发区域设置 Drag 交互（Left/Right/Up）
- 按钮 Hover 状态：建议添加 0.15s ease 过渡

---

*Design System V2.0 · 新增 Page 06 空状态页、Page 07 出行后反馈，完整交互流程*
*「拍了拍」产品作品集配套设计规范 · 请勿外传*
