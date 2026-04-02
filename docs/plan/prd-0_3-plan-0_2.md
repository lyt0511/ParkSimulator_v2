# prd-0_3-plan-0_2

## Summary
目标从“可交互可判定”升级为“可交互 + 可判定 + 可视化场景语义完整”。在不做无关重构、不新增生产依赖的前提下，补齐道路样式、停车位划线、车辆形状（车头/车体/车轮）、绿化带等装饰，并保证四场景都可渲染且可练习。

## Key Changes（含接口）
1. 新增渲染契约 `SceneRenderSpec`：定义每场景的图层、几何与样式 token。  
2. 新增车辆外观契约 `VehicleVisualSpec`：`body/head/wheels` 组成与朝向规则。  
3. 冻结图层顺序：`background -> road -> laneMarkings -> parkingSlots -> decorations(greenbelt) -> staticCars -> egoCar -> HUDOverlay`。  
4. 冻结样式 token（v0.3）：道路深色、标线白色、车位线白/浅灰、绿化带绿色，场景间允许几何差异但不改主题色系。  

## 6 个切片
1. 在【`IDLE/READY`】下，当【用户进入练习页并选择场景】发生时，系统通过【`play-page -> scene-loader -> scene-renderer`】在【主画布】呈现【黑色道路、白色标线、停车位划线、绿化带、静态参照车的基础场景图像】。  
标记改动文件：`src/.../play-page.*`、`src/.../scene-renderer.*`、`src/features/parking-contract/contract-constants.ts`、`tests/parking-contract/smoke-checklist.md`。

2. 在【`READY/RUNNING`】下，当【用户键盘/按钮输入控制】发生时，系统通过【`input-dispatcher -> input-guard -> session-controller -> scene-renderer`】在【主画布 + HUD】呈现【自车以“车头+车体+车轮”形态运动与转向，且控制实时可见】。  
标记改动文件：`src/.../input-dispatcher.*`、`src/features/parking-contract/input-guard.ts`、`src/.../session-controller.*`、`src/.../scene-renderer.*`、`tests/parking-contract/boundary-path.spec.*`。

3. 在【`RUNNING/SETTLING/DONE`】下，当【开始、结束、重试、返回场景选择】发生时，系统通过【`session-controller -> session-end-policy -> result-panel`】在【HUD + 控制区 + 结果面板】呈现【状态机驱动的完整会话交互（可开始、可结束、可重开）】。  
标记改动文件：`src/.../session-controller.*`、`src/features/parking-contract/session-end-policy.ts`、`src/.../result-panel.*`、`tests/parking-contract/smoke-checklist.md`。

4. 在【`RUNNING -> SETTLING`】下，当【用户点击结束】发生时，系统通过【几何评估链路 -> `result-classifier` -> `result-panel`】在【结果面板】呈现【单场景真实结算（成功/失败）与速度阈值差异（0.05 vs 0.051）】。  
标记改动文件：`src/features/parking-contract/result-classifier.ts`、`src/.../session-controller.*`、`src/.../result-panel.*`、`tests/parking-contract/normal-path.spec.*`、`tests/parking-contract/boundary-path.spec.*`。

5. 在【`RUNNING`】下，当【碰撞/压线/超时/输入越界】发生时，系统通过【`risk-recorder + session-end-policy + input-guard -> session-controller -> HUD/result-panel`】在【HUD 风险区 + 结果面板】呈现【风险即时提示且锁存、超时自动结束、输入钳制不中断】。  
标记改动文件：`src/features/parking-contract/risk-recorder.ts`、`src/features/parking-contract/session-end-policy.ts`、`src/features/parking-contract/input-guard.ts`、`tests/parking-contract/failure-path.spec.*`、`tests/parking-contract/boundary-path.spec.*`。

6. 在【`DONE/READY`】下，当【用户切换四个场景循环练习】发生时，系统通过【`scene-catalog -> scene-loader -> scene-renderer -> contract pipeline`】在【练习页画布 + 结果面板】呈现【四场景均具备可区分渲染（正常/窄路、倒库/侧方）并完整可交互结算】。  
标记改动文件：`src/features/parking-contract/contract-constants.ts`、`src/.../scene-renderer.*`、`tests/parking-contract/normal-path.spec.*`、`tests/parking-contract/boundary-path.spec.*`、`tests/parking-contract/failure-path.spec.*`、`tests/parking-contract/smoke-checklist.md`。

## Test Plan
1. 渲染清单验收（每场景）：道路、标线、车位线、自车形状、绿化带、静态参照车均可见。  
2. 场景差异验收：四场景在车位几何与通道宽度上可区分（正常 vs 窄路、倒库 vs 侧方）。  
3. 交互与结算验收：沿用 9 条路径 + 11 条标准；重点保留 BP-01/BP-02/BP-03、FP-01/02/03。  
4. 工程门禁：每切片执行对应测试与仓库既有 build 命令并通过。  

## Assumptions
1. v0.3 采用 2D Canvas/矢量绘制，不引入贴图资源包与新生产依赖。  
2. 视觉目标是“语义清晰可练习”，不是高拟真美术。  
3. 装饰元素（如绿化带）参与渲染但不改变 v0.3 判定主逻辑。  
