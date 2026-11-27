# Task04丨给原型加上 AI 能力

Datawhale 第86期 Easy-Vibe · 鲸语织境  
截止：2026-11-28 03:00（北京时间）

## 一、学习要点

从 Task03 的模拟原型进入模型接入阶段，先选择一个需要生成内容的按钮，而不是一次接入所有模态。

| 概念 | 在本项目中的作用 |
|---|---|
| Prompt | 用固定业务要求约束标题、简介与三条卖点 |
| API / SDK | API 是服务接口，SDK 是对调用过程的封装 |
| Base URL / Endpoint / Model ID | 分别对应服务入口、接口路径与实际模型 |
| API Key | 调用凭证，只保存在服务端环境变量 |
| Usage / Token | 查看真实请求、用量和计费 |
| 多模态 | 文本生成、图片理解、图片生成、语音识别与合成、视频生成 |
| 异步任务 | 部分图像/视频服务先返回 task_id，随后查询状态与结果 |

## 二、动手实践：内容工作台 AI 文案生成

延续 [Task03 内容工作台](../Task03/README.md)，保留总览、内容制作、模板库和规则生成。Task04 独立目录存放升级版本，不改动上一阶段代码。

第一版选择文本生成：用户填写商品名称、类别、特点和人群，点击 AI 生成文案，由后端向 DeepSeek 发送请求，再将标题、简介、三条卖点填入可编辑草稿。一次 AI 操作仅处理一件商品；规则模式仍支持批量录入、套用模板。信息卡不是 AI 生成图片。

## 三、实现思路

浏览器 → 自己的 /api/generate-copy → DeepSeek /chat/completions → 解析结构化响应 → 草稿编辑。

固定系统提示词要求模型只依据商品资料写作，不补写价格、销量、功效或认证。模型返回 JSON 后进行字段及类型检查，格式错误直接提示失败，而不是自动切换到假结果。结构校验不能保证事实正确，最终仍需人工审核。

2026-11-27 核对 DeepSeek 官方首次调用文档：推荐模型 ID 已改为 `deepseek-flash`；API 入口为 `https://api.deepseek.com`。模型名可通过环境变量调整。采用非流式、关闭思考的文本请求。未使用第三方 SDK，直接通过 Node.js fetch 调用。

## 四、本地运行与验证

需要 Node.js 22 或更高版本、可访问 DeepSeek 的网络、有效 API Key 和可用额度。不要在公开仓库提交真实密钥。

Windows PowerShell：

```powershell
cd Task04/content-workbench
Copy-Item .env.example .env
notepad .env
node --env-file=.env server.mjs
```

在 .env 中填写实际密钥，启动后访问 http://127.0.0.1:8766/ 。只允许本地访问，不适合直接部署到公网。

进入内容制作，填入一行虚构商品资料，例如：

```text
山野随行杯 | 户外水杯 | 轻便耐用 | 徒步爱好者
```

点击 AI 生成文案，观察等待与成功或失败提示。再更换另一组商品重复操作。成功时查看服务端输出的请求编号和 Token，并到 [DeepSeek 开放平台](https://platform.deepseek.com/) 核对 Usage。保存运行截图时不要显示 Key。调用可能产生费用。

无 Key 时可双击 index.html 使用规则模式；不能将它作为真实 AI 调用证据。

## 五、测试与问题记录

[测试记录](test-results.txt)显示 11 项 JavaScript 逻辑及模拟 HTTP 响应用例全部通过，覆盖输入验证、请求构造、JSON 解析、未配置密钥、模拟成功及 401/429 错误。使用模拟传输层，没有向 DeepSeek 发送真实请求。

可以在项目目录复核 Node 测试：

```sh
node --test ai.test.mjs
```

| 现象 | 排查方向 |
|---|---|
| 401 / 403 | 密钥、请求头、权限 |
| 402 / 429 | 余额、频率限制，等待后重试 |
| 400 / 404 | 参数、接口地址与模型 ID |
| 响应不是 JSON | 提示词与返回字段，不能假定成功 |
| 超时 | 网络及服务状态，保留已有草稿 |

实际 API 联调、服务端 HTTP 启动、浏览器交互和运行截图尚未验证。测试不代表真实模型生成已完成。完成后可将实际请求编号（不含凭证）、Usage 和截图补充进记录。

## 六、学习思考

本章的关键是把模型当作业务流程中的一个能力，而不是让所有功能都由模型完成。像模板保存、草稿编辑和页面跳转这些规则明确的操作，普通代码就能解决；标题与文案生成则适合交给模型。

结合之前的个人应用开发经历，值得进一步理解的是提示词、数据结构、服务端接口与错误处理之间的关系。模型返回内容只是第一步，还需要检查格式、事实准确性及调用成本。

## 七、参考资料

- [Datawhale Easy-Vibe 官方课程：为原型接入 AI 能力](https://datawhalechina.github.io/easy-vibe/zh-cn/stage-1/integrating-ai-capabilities/)
- [官方章节源文件](https://github.com/datawhalechina/easy-vibe/blob/main/docs/zh-cn/stage-1/integrating-ai-capabilities/index.md)
- [DeepSeek 首次调用 API](https://api-docs.deepseek.com/zh-cn/)
- [DeepSeek 模型列表](https://api-docs.deepseek.com/api/list-models/)

开发工具：ChatGPT（代码生成及模拟测试）。
