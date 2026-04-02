# 停车模拟器实施切片计划 v0.4（基于 prd-0_3_test_contract）

## 1. 总体实现思路
1. 采用“契约层旁挂 + 既有流程最小接线”的方式落地，避免改动仿真核心和场景资源。
2. 先冻结规则常量，再逐步接入输入约束、会话结束、风险锁存、双结果判定、验收套件。
3. 每个切片只改一层主责任，禁止跨层大改，保证可并、可测、可回滚。
4. 每片完成标准：对应测试通过 + build 通过 + 回滚点明确。

## 2. 切片清单（6 个）

### 切片 1：契约常量冻结
- 目标：固化阈值与结果字段口径，避免后续漂移。
- 改动文件：
  - `src/features/parking-contract/contract-constants.ts`
  - `tests/parking-contract/contract-constants.spec.*`
  - `part_prd/prd-0_3_test_contract.md`（补常量映射）
- 测试：常量断言、结果字段断言、build。
- 风险：与现有状态字段命名冲突。
- 回滚点：回退 `parking-contract` 常量文件与对应测试，不影响旧行为。

### 切片 2：输入约束接线（BP-03）
- 目标：实现动力钳制与非法方向输入屏蔽。
- 改动文件：
  - `src/features/parking-contract/input-guard.ts`
  - `src/.../input-dispatcher.*`（接线）
  - `tests/parking-contract/boundary-path.spec.*`（BP-03）
- 测试：动力越界钳制、非法方向无效、会话不中断、build。
- 风险：输入事件节流/重复触发导致边界抖动。
- 回滚点：仅回退 `input-guard` 与 `input-dispatcher` 接线变更。

### 切片 3：会话结束策略（BP-02、FP-03）
- 目标：落地“手动结束 + 300s 超时自动结束（未完成）”。
- 改动文件：
  - `src/features/parking-contract/session-end-policy.ts`
  - `src/.../session-controller.*`（接线）
  - `tests/parking-contract/boundary-path.spec.*`（BP-02）
  - `tests/parking-contract/failure-path.spec.*`（FP-03）
- 测试：299.9s 手动结束、300s 自动超时、超时结果字段、build。
- 风险：计时起点定义不统一。
- 回滚点：仅回退会话结束策略接线，恢复旧结束行为。

### 切片 4：风险锁存（FP-01、FP-02 前提）
- 目标：压线/碰撞事件“发生即记录并保留到会话结束”。
- 改动文件：
  - `src/features/parking-contract/risk-recorder.ts`
  - `src/.../session-controller.*`（接线）
  - `tests/parking-contract/failure-path.spec.*`（风险保留断言）
- 测试：碰撞后继续操作仍保留风险；压线同理；build。
- 风险：重复事件上报导致覆盖或抖动。
- 回滚点：回退 `risk-recorder` 与会话接线，恢复旧风险逻辑。

### 切片 5：双结果判定与展示（NP、BP-01、FP-01/02）
- 目标：输出并展示“入位成功 + 安全合规”双结果。
- 改动文件：
  - `src/features/parking-contract/result-classifier.ts`
  - `src/.../session-controller.*`（组装最终结果）
  - `src/.../result-panel.*`（展示双字段与风险）
  - `tests/parking-contract/normal-path.spec.*`
  - `tests/parking-contract/boundary-path.spec.*`（BP-01）
  - `tests/parking-contract/failure-path.spec.*`（FP-01、FP-02）
- 测试：3 条正常路径、速度阈值边界、2 条失败路径、build。
- 风险：旧单结果字段仍被下游消费造成显示不一致。
- 回滚点：仅回退“结果分类 + 结果面板”改动，保留已落地基础能力。

### 切片 6：验收套件封板（DoD）
- 目标：将 9 条路径与 11 条验收标准落为可执行门禁。
- 改动文件：
  - `tests/parking-contract/normal-path.spec.*`
  - `tests/parking-contract/boundary-path.spec.*`
  - `tests/parking-contract/failure-path.spec.*`
  - `tests/parking-contract/smoke-checklist.md`
  - `part_prd/prd-0_3_test_contract.md`（补测试映射记录）
- 测试：9 条路径全过；11 条标准可打勾；40 条基准一致率 >= 90%；build。
- 风险：人工标注口径不统一影响一致率稳定性。
- 回滚点：仅回退验收门禁和测试文档，不影响业务逻辑。

## 3. 必须先决策的问题（阻塞项）
1. 双结果字段名最终口径（中文名或英文名）必须统一。
2. 300s 计时起点（进场、开始按钮、首次输入）必须唯一。
3. 300s 临界时“手动结束”和“超时结束”优先级必须定义。
4. 风险事件是否允许清除（默认不允许，直到会话结束）。
5. 速度阈值与几何容差是否按 `0.05m/s` 与 `0.05m` 固定。
6. 40 条样本标签的标注责任与仲裁规则。

## 4. 最容易发生无关重构的区域（明确禁止）
1. 禁止重写仿真核心（动力学、碰撞、场景几何）。
2. 禁止借机改全局状态管理、路由、启动流程。
3. 禁止重构通用 UI 组件库（仅允许结果面板字段扩展）。
4. 禁止引入“顺手优化”型性能重构。
5. 禁止新增生产依赖（若必须新增，需单独确认）。

## 5. 执行护栏
1. 每个切片开始前先确认本片文件清单，不跨片改动。
2. 每个切片必须先有测试/验证项，再实施改动。
3. 每个切片合并前至少完成：对应测试 + build。
4. 每个切片独立提交，确保可单片回滚。
5. 超出当前需求的改动一律延后，单独建后续任务。
