# Task03丨动手做出原型

Datawhale 第86期 Easy-Vibe · 鲸语织境  
截止：2026-11-25 03:00（北京时间）

## 一、学习要点

这一阶段从写小游戏转向产品开发。先弄清楚问题、使用者和工作流程，再确定最小版本，而不是一开始就让 AI 做出功能齐全的平台。

- 需求线索：从现有工作中的重复操作、等待、返工等问题出发，保留来源。
- 方向筛选：比较问题频率、影响、现有解决办法与验证成本。
- JTBD：关注用户要取得什么进展，而非只看表面上想要什么功能。
- The Mom Test：访谈时问实际发生过的行为与困难，少问假设性购买意愿。
- 双钻：先展开并界定问题，再探索并收敛解决方案。
- 可交互原型：先验证核心任务，再扩展页面、补足状态与交互。

## 二、动手实践：鲸语织境 · 内容工作台

沿用官方电商内容工作台案例。以下业务痛点依据教程的课堂案例，未进行独立用户访谈，不作为市场验证结论。

| 场景 | 原型假设 | 验证目标 |
|---|---|---|
| 批量准备商品内容 | 商品信息重复录入、首版图文制作耗时 | 能否一次录入多件商品并生成可编辑的内容草稿 |
| 复用之前的内容 | 标题与卖点格式不便检索和套用 | 能否保存模板，再用于新商品 |

JTBD 表述：当运营需要为一批商品准备首版内容时，希望快速得到能修改的图文草稿，以减少重复起稿的工作。

第一版范围：商品录入、批量草稿、标题与卖点编辑、模板收藏和套用。暂不接真实模型、用户账号、云数据库、电商平台或批量 Excel 上传。后续需要通过真实用户反馈判断需求是否成立。

## 三、实现思路

### 1. 需求到页面

- 单页模式：商品录入 → 草稿生成 → 编辑标题与文案 → 收藏格式。
- 多页模式：总览、内容制作、模板库；共享同一数据与核心逻辑。

源代码见 [content-workbench](content-workbench/)。两种模式由同一套代码实现，作为课堂单页和多页方案的对照，并非两次独立开发的历史记录。

### 2. 本地运行

将仓库下载到本地，用浏览器打开 `Task03/content-workbench/index.html`，或者在目录下启动静态服务：

```sh
python -m http.server 8000
```

- 多页原型：http://localhost:8000/
- 单页原型：http://localhost:8000/?mode=single

点击“载入示例”，生成草稿，修改标题，保存为模板，再到模板库选择套用。示例商品是虚构教学数据。

### 3. 文件与数据

| 文件 | 作用 |
|---|---|
| index.html | 总览、制作、模板三个页面的结构 |
| style.css | 布局、视觉样式与窄屏适配 |
| core.js | 解析批量文本、生成规则草稿、验证模板 |
| app.js | 页面路由、表单事件、编辑与本地存储 |
| core.test.cjs | 可在 Node.js 中复核的规则测试 |

当前生成逻辑使用字符串模板和 HTML/CSS 信息卡模拟输出；没有调用大模型或图像生成服务。浏览器支持 localStorage 时保存草稿与模板，否则仅保留本次会话。

后续 Task04 可将规则生成替换为服务端模型调用，增加等待、超时、错误提示与重试。模型密钥不进入前端和公开仓库。

## 四、测试与问题记录

本次使用 JavaScript 执行环境检查了 8 项核心逻辑，全部通过。见 [test-results.txt](test-results.txt)。Node.js 测试脚本可供复核：

```sh
cd Task03/content-workbench
node --test core.test.cjs
```

核心逻辑检查不等于浏览器交互验收。原型的实际页面展示、模板编辑与保存、刷新恢复和窄屏体验仍需本地试玩确认，截图随后补充。

建议验收路径：载入示例 → 生成两条草稿 → 编辑 → 保存模板 → 套用到新商品 → 刷新检查。空输入、缺少字段、空模板名应有明确反馈。

## 五、学习思考

产品原型与文旅规划中的前期策划存在共通之处：先确定服务对象、真实需求和核心功能，再进入具体空间或界面设计。软件原型不同之处在于，页面要通过可操作的流程和状态变化验证需求，不能只看视觉表现。

以此前的足迹地球应用为参照，可以把产品功能拆成一个个可独立验证的小流程，避免第一版就覆盖所有场景。对内容工作台而言，草稿能否编辑、模板能否复用，比增加更多菜单更值得先验证。

本项目为课程练习，代码由 ChatGPT 协助生成；学习心得可结合实际操作进一步补充。

## 六、参考资料

- [官方课程仓库](https://github.com/datawhalechina/easy-vibe)
- [寻找真实问题](https://datawhalechina.github.io/easy-vibe/zh-cn/stage-1/appendix-idea-sources/)
- [筛选产品方向](https://datawhalechina.github.io/easy-vibe/zh-cn/stage-1/finding-great-idea/)
- [JTBD](https://datawhalechina.github.io/easy-vibe/zh-cn/stage-1/appendix-jobs-to-be-done/)
- [The Mom Test](https://datawhalechina.github.io/easy-vibe/zh-cn/stage-1/appendix-mom-test/)
- [双钻模型](https://datawhalechina.github.io/easy-vibe/zh-cn/stage-1/appendix-double-diamond/)
- [构建可交互的产品原型](https://datawhalechina.github.io/easy-vibe/zh-cn/stage-1/building-prototype/)
