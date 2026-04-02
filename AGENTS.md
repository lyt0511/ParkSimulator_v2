# AGENTS.md

## Repository expectations
- 目录规范见 docs/architecture.md
- 提交前必须通过 npm run lint && npm run test && npm run build
- UI 组件不要直接调用数据层
- 不允许修改 auth/ 和 infra/ 除非任务卡明确允许
- 公共接口变更必须补 contract test