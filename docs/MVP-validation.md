# 拍了拍 · MVP 验证 PRD

> Web 端概念验证（Vite + React）。与代码实现 `src/mvp/` 对齐。  
> 版本：**V1.1** · 更新日期：2026-06-05 · 阶段：**可交互原型 / 假设验证**

---

## 1. 验证目标

在一二线城市独居青年场景中，验证以下假设是否成立：

1. **情境输入 + 口味画像** 能否在 5 分钟内产出「愿意点开看」的本地推荐。
2. **AI 推荐理由** 是否比纯列表更能建立信任与差异化感知。
3. **刷卡决策** 是否比列表更适合「周末懒得想」的模糊需求。
4. **出行后反馈** 能否在正确时机回收信号，并让回访用户感到「越用越懂我」。

非目标（本阶段不做）：真实 POI 接入、账号体系、支付、社交、推送。

---

## 2. 目标用户

| 维度 | 描述 |
|------|------|
| 人群 | 25–30 岁，一二线城市，独居 / 单身职场人 |
| 场景 | 周五晚或周六早上，「不知道去哪但想出门」 |
| 痛点 | 决策疲劳、信息过载、需求模糊（感觉 > 品类） |
| 期望 | 少想几步，有人帮拍板，理由说得通 |

---

## 3. 四大核心场景（与实现映射）

### 场景一 · 冷启动建档（`SwipeStep`）

- 20 张口味测试卡，覆盖环境 / 价格 / 类型 / 社交四维度。
- 手势：左滑不喜欢、右滑喜欢、上滑收藏；底部按钮带文字标签。
- 拖动反馈：卡片轻微倾斜 + 整卡渐变色 + 角标（喜欢 / 跳过 / 收藏）渐显。
- **门槛**：`COLD_START_GATE = 8` 张即可解锁完整推荐；进度条仍显示 **X / 20**（滑满更准）。
- 有历史画像时可「跳过 · 使用已有口味档案」。

### 场景二 · 今日状态输入（`QuizStep`）

- 三题：几个人 / 什么状态 / 能接受多远。
- 开箱默认：`solo` · `fresh` · `metro`（紫底白字已选中 + Header 提示「已帮你预填，可直接提交」）。
- 提交后请求 MiMo 推荐 API，失败则走本地规则 `recommend.ts`。

### 场景三 · 推荐决策（`RecoSwipeStep` / `ResultsStep`）

- 推荐池 **8 条**（约 6 高匹配 + 2 探索），候选 POI **22 条**（上海 mock）。
- **默认进入 RecoSwipe**（刷卡挑去处）；右上角「列表视图」切到列表。
- RecoSwipe 卡片：琥珀色「今日推荐」标签、地址 / 价格、完整 AI 理由；与冷启动「口味测试」卡视觉区分。
- 列表卡：AI 理由 **2 行完整展示**（`line-clamp-2`），探索位文案「为你加入一个新鲜探索」。
- 详情页：真实感 `openHours` / `priceNote` / `addressLine`；首次打开场所 **3 秒后** 底部问卷横幅（可关闭）。

### 场景四 · 反馈闭环（`DepartStep` / `VisitFeedbackStep` / `FeedbackStep`）

- **决定去处**：详情「就决定这里了」→ **出发祝福页**（非立刻出行反馈）→ 写入 `pendingFeedback`。
- **回访**：Quiz 页顶部横幅「上次去了 XX，感觉怎么样？」→ 出行反馈 → 清除 pending。
- **整体感受**分两种文案：
  - 出发后（`post-depart`）：「有没有让你心动的地方？」
  - 出行后（`post-visit`）：「整体感受？」
- 列表页「今天先到这」进入问卷引导，**不再**从列表直接进整体反馈。

---

## 4. 核心用户流

### 4.1 首次 / 主路径

```
发现 Tab
  └─ SwipeStep（口味建档，≥8 张可继续）
      └─ QuizStep（预填三题）
          └─ [AI 生成]
              └─ RecoSwipeStep（默认）
                  ├─ 「列表视图」→ ResultsStep
                  └─ 点场所 → VenueDetailSheet
                      ├─ 3s 后问卷横幅（首次）
                      └─ 「就决定这里了」
                          └─ DepartStep（出发祝福）
                              └─ FeedbackStep（心动感受）
                                  └─ SurveyPromptStep → Done
```

### 4.2 回访（有 pendingFeedback）

```
QuizStep 横幅「上次去了 XX…」
  └─ VisitFeedbackStep
      └─ FeedbackStep（整体感受）
          └─ SurveyPromptStep → Done
```

### 4.3 底部 Tab

| Tab | 内容 |
|-----|------|
| 发现 | 上述主流程 |
| 收藏 | `BookmarksView` |
| 我的 | `TasteProfileView` 口味画像 |

---

## 5. Step 与状态机

| Step | 组件 | 说明 |
|------|------|------|
| `swipe` | SwipeStep | 冷启动滑卡 |
| `quiz` | QuizStep | 今日三题 |
| `reco-swipe` | RecoSwipeStep | 推荐刷卡（默认） |
| `results` | ResultsStep / ResultsEmptyStep | 列表 / 建档不足拦截 |
| `depart` | DepartStep | 出发祝福（新增） |
| `visit-feedback` | VisitFeedbackStep | 出行后按店反馈 |
| `feedback` | FeedbackStep | 整体 / 心动感受 |
| `survey` | SurveyPromptStep | 腾讯问卷引导 |
| `done` | — | 本轮结束 |

**持久化**（`localStorage` · `paipaipai-mvp-state-v1`）：

- `preferenceVector` 口味向量
- `coldStartSwipeCount` / `coldStartCompletedAt`
- `bookmarks` / `venueFeedbackHistory`
- `pendingFeedback`：`{ venueId, venueName, quizSnapshot, decidedAt }`
- `overallFeedback` / `completedFlows` / `sessionCount`

---

## 6. 功能清单与实现状态

| 功能 | 优先级 | 状态 | 备注 |
|------|--------|------|------|
| 滑卡冷启动建档 | P0 | ✅ | 手势反馈 + 按钮标签 |
| 今日状态三题 | P0 | ✅ | 默认预填 |
| 8 条推荐池 + MiMo/规则双通道 | P0 | ✅ | |
| AI 理由列表 2 行展示 | P0 | ✅ | |
| 场所详情 mock 地址/价格/营业时间 | P0 | ✅ | 22 条 POI |
| 决定去处 → 出发页 → 延后出行反馈 | P0 | ✅ | pendingFeedback |
| 冷启动门槛降至 8 张 | P1 | ✅ | GATE / TARGET 分离 |
| Quiz 预填提示文案 | P1 | ✅ | |
| 整体反馈时机与双文案 | P1 | ✅ | post-depart / post-visit |
| 详情页问卷横幅（3s） | P1 | ✅ | 每轮首次打开场所 |
| 默认 RecoSwipe + 列表切换 | P2 | ✅ | |
| RecoSwipe 卡片视觉区分 | P2 | ✅ | 今日推荐 / 地址价格 |
| 我的口味画像 | P1 | ✅ | |
| 收藏夹 | P1 | ✅ | |
| 授权数据导入 | P2 | ⏳ | 未实现 |

---

## 7. AI 与推荐逻辑（摘要）

- **情境融合**：今日三题权重高于长期画像（`recommend.ts` · `SESSION_BLEND`）。
- **探索位**：推荐池中约 2 条 explore，列表与刷卡均展示。
- **出行归因**：`visitFeedback.ts` 按情境标签更新画像，非简单否定品类。
- **Reco 刷卡重排**：`rerankRecommendationListByRecoSwipe` 实时调整剩余队列。

---

## 8. 埋点事件（`mvp_*`）

开发环境控制台 + `window` 事件 `mvp-analytics`。关键事件：

| 事件 | 时机 |
|------|------|
| `mvp_swipe_done` | 冷启动滑卡完成 |
| `mvp_quiz_done` | 提交三题 |
| `mvp_recommend_source` | mimo / rules |
| `mvp_results_view` | 进入列表 |
| `mvp_reco_swipe_enter` / `_action` / `_done` | 推荐刷卡 |
| `mvp_result_expand` | 打开详情 |
| `mvp_survey_prompt_view` / `_open_click` | 问卷（含 detail 横幅 placement） |
| `mvp_visit_feedback_submit` | 出行反馈 |
| `mvp_feedback_submit` | 整体 / 心动反馈 |
| `mvp_flow_complete` | 本轮结束 |

---

## 9. 验证指标（MVP 阶段参考）

| 指标 | 目标 | 说明 |
|------|------|------|
| 冷启动完成率（≥8 张） | > 70% | 门槛已降低 |
| 推荐生成 → 打开详情 | > 35% | 信任与理由质量 |
| 决定去处转化率 | > 15% | 详情 → 就决定这里了 |
| 回访 pending 反馈点击率 | > 25% | 横幅有效性 |
| 问卷横幅 → 打开 | > 10% | 前移入口 |
| 第 3 次使用「变准了」感知 | > 60% | 问卷自报 |

---

## 10. 已知限制与后续

- POI 为上海 mock，无地图 / 营业状态实时校验。
- 问卷依赖腾讯问卷外链；生产需配置 `VITE_SURVEY_URL`。
- MiMo API 需 Railway 部署 + `VITE_API_BASE_URL`（见 README）。
- 冷启动拦截页（`ResultsEmptyStep`）在默认 RecoSwipe 路径下较少触发；列表视图仍可看到。
- 原生 App（iOS/Android）能力见桌面版概念 PRD `pailiaopai_prd.html`，本仓库仅 Web MVP。

---

## 11. 相关文档

| 文档 | 说明 |
|------|------|
| `docs/design-system.md` | 视觉规范与 Tailwind 令牌 |
| `README.md` | 开发、部署、本地 API |
| `拍了拍_MVP迭代开发文档.md` | P0–P2 迭代任务来源（产品桌面） |
