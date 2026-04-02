全局约束：
1 从用户输入的prompt给变量mission_id赋值
2 请把<$mission_id>补全，例如若mission_id = 01，则s<$mission_id>替换为s01
3 请按照step01、02、03、...的顺序执行任务

### step01
1. 判断有没有切换到feat/s<$mission_id>分支，若无则终止执行，提示用户切换到该分支
2. 首先根据plans/prd-0.3-plan.md 中的切片<$mission_id>生成第一张任务卡Slice<$mission_id>，内容：
任务卡Slice <$mission_id> - <slice name>（slice name参考plan中切片<$mission_id>的名称命名） 

Goal
- 实现……

Context
- 需求规格：specs/prd-0_3_test_contract.md 
- 总计划：plans/prd-0_3-plan-0_2.md 
- 相关文件：src/... tests/... package.json 
- 仓库规则：AGENTS.md 

Constraints
- 不允许修改：src/auth/**, src/infra/**
- 不允许新增生产依赖
- 不允许无关重构
- 保持公开接口兼容

Done when
- 行为……
- 测试通过：npm run test:unit -- <scope> && npm run build

请先只输出：
1. 3 步执行计划
2. 将修改的文件列表
3. 会新增/更新哪些测试
4. 主要风险

不要开始编码，等我确认。

### step02
按这个计划开始实现。
要求：
1. 把当前任务卡写到docs/mission/prd-0_3-s<$mission_id>.md（要求中文）
2. 先写/更新测试（包括单元测试），再改实现
3. 完成后运行 npm run lint && npm run test:unit -- <scope> && npm run build
4. 最后输出改动文件、测试结果、剩余风险、建议 commit message

### step 03
请执行git status
git diff --stat
git diff ，并把结果告诉我，对于git diff的结果：
请按文件解释你刚才的改动，每个文件只说：
1. 为什么要改
2. 改了什么
3. 风险点

### step04
1. 把目前的改动全部提交远程分支，先add . ，然后commit，commit的信息写刚才生成的commit message，然后提交到远程分支
2. 合并任务卡<$mission_id>的结果到主分支，先checkout 到main分支，然后git merge feat/s<$mission_id>，有冲突和我确认如何修改
3. 提交分支合并到远程，执行git push origin main，若成功则删除本地和远程的feat/s<$mission_id>分支