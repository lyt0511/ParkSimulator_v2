全局约束：
1 从用户输入的prompt给变量mission_id赋值
2 请把<$mission_id>补全，例如若mission_id = 01，则s<$mission_id>替换为s01
3 请按照step01、02、03、...的顺序执行任务

### step01
按这个计划开始实现。
要求：
1. 实现完成后，写单元测试，并进行测试
2. 最后输出改动文件、测试结果、剩余风险、建议 commit message

### step 02
请执行git status
git diff --stat
git diff ，并把结果告诉我，对于git diff的结果：
请按文件解释你刚才的改动，每个文件只说：
1. 为什么要改
2. 改了什么
3. 风险点

### step03
1. 把目前的改动全部提交远程分支，先add . ，然后commit，commit的信息写刚才生成的commit message，然后提交到远程分支
2. 合并任务卡<$mission_id>的结果到主分支，先checkout 到main分支，然后git merge feat/s<$mission_id>，有冲突和我确认如何修改
3. 提交分支合并到远程，执行git push origin main，若成功则删除本地和远程的feat/s<$mission_id>分支