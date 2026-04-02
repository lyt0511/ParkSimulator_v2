# 停车模拟器实施计划 v0.3（用户可玩切片版）

## 1. 总体实现思路
1. 以“先能玩，再判准”为主线：先打通最小可操作闭环，再逐步补齐状态机、几何判定、风险语义和边界规则。
2. 采用“契约层增量 + 既有流程最小接线”策略，避免重写仿真核心和全局架构。
3. 每个切片必须提供一个用户可见出口（画布/HUD/结果面板），且每片只改一个主责任层，其他仅做必要接线。
4. 以 `prd-0_3_test_contract.md` 的 9 条路径与 11 条验收标准作为收口门禁。

## 2. 最小可玩闭环切片（6 个）

### 切片 1：最小用户操作环境构建
- 叙述：
  在【`IDLE`】下，当【用户进入练习页并选择“正常倒车入库”】发生时，系统通过【`play-page` -> `session-controller` -> 20Hz 主循环】在【主画布 + 控制区】呈现【车辆矩形可动、键盘和按钮输入有效、有结束按钮、结束后显示成功/失败占位字样】。
- 标记改动文件：
  - `src/.../play-page.*`
  - `src/.../session-controller.*`
  - `src/features/parking-contract/contract-constants.ts`
  - `tests/parking-contract/smoke-checklist.md`

### 切片 2：运行状态机与用户驱动控制
- 叙述：
  在【`READY/RUNNING`】下，当【用户持续输入键盘或按钮控制】发生时，系统通过【`input-dispatcher` -> `input-guard` -> `session-controller`】在【HUD 状态区】呈现【phase 正确流转、方向与速度实时变化、非法输入不生效且会话不中断】。
- 标记改动文件：
  - `src/.../input-dispatcher.*`
  - `src/features/parking-contract/input-guard.ts`
  - `src/.../session-controller.*`
  - `tests/parking-contract/boundary-path.spec.*`

### 切片 3：单场景完整几何结算
- 叙述：
  在【`RUNNING -> SETTLING`】下，当【用户点击结束】发生时，系统通过【几何评估链路 -> `result-classifier` -> `result-panel`】在【结果面板】呈现【单场景真实成功/失败结论（非占位）、并满足速度阈值判定口径】。
- 标记改动文件：
  - `src/features/parking-contract/result-classifier.ts`
  - `src/.../session-controller.*`
  - `src/.../result-panel.*`
  - `tests/parking-contract/normal-path.spec.*`
  - `tests/parking-contract/boundary-path.spec.*`

### 切片 4：风险语义可见且不打断练习
- 叙述：
  在【`RUNNING`】下，当【碰撞或压线事件发生】发生时，系统通过【风险事件源 -> `risk-recorder` -> `session-controller` -> `result-panel`】在【HUD 风险区 + 结果面板】呈现【过程即时风险提示、结算后风险仍保留、会话不中断】。
- 标记改动文件：
  - `src/features/parking-contract/risk-recorder.ts`
  - `src/.../session-controller.*`
  - `src/.../result-panel.*`
  - `tests/parking-contract/failure-path.spec.*`

### 切片 5：结束策略与时间边界
- 叙述：
  在【`RUNNING`】下，当【299.9s 手动结束 / 300.0s 未手动结束】发生时，系统通过【`session-end-policy` -> `session-controller` -> `result-panel`】在【会话状态区 + 结果面板】呈现【前者立即正常结算，后者自动超时并标记未完成】。
- 标记改动文件：
  - `src/features/parking-contract/session-end-policy.ts`
  - `src/.../session-controller.*`
  - `tests/parking-contract/boundary-path.spec.*`
  - `tests/parking-contract/failure-path.spec.*`

### 切片 6：四场景可玩闭环封板
- 叙述：
  在【`DONE/READY`】下，当【用户切换四个场景进行重复练习】发生时，系统通过【场景装载 -> 契约层统一判定 -> 结果面板统一展示】在【练习页 + 结果面板】呈现【四场景全部可玩、双结果口径一致、边界与失败路径可复现】。
- 标记改动文件：
  - `src/features/parking-contract/contract-constants.ts`
  - `tests/parking-contract/normal-path.spec.*`
  - `tests/parking-contract/boundary-path.spec.*`
  - `tests/parking-contract/failure-path.spec.*`
  - `tests/parking-contract/smoke-checklist.md`

## 3. 验证与门禁
1. 每个切片完成标准：对应测试通过 + build 通过。
2. 切片验收顺序：`smoke -> boundary/failure -> normal`，避免未成型规则提前耦合。
3. 最终收口：
   - 9 条路径全部通过；
   - 验收标准 1-11 条全部可验证并有记录；
   - 40 条基准用例一致率 `>=90%`。
4. 非功能集中验收：状态刷新 `>=20Hz`、控制到状态变化 `<100ms`、FPS `>=30`、连续运行 30 分钟稳定。

## 4. 执行护栏（强约束）
1. 不允许一次改很多层：每个切片只改一个主责任层，其他仅做必要接线。
2. 不允许“顺手优化”混入：禁止重构仿真核心、全局状态管理、通用 UI 组件库。
3. 不新增生产依赖；若确需新增，必须先单独确认。
4. 不做与本次可玩闭环无关的功能扩展（历史回放、AI 建议、多端适配等）。

