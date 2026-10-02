# DeepSeekworks

个人开发工作区 —— DSH（DeepSeek Harness）插件开发、C 语言练习与日常实验。

## 目录结构

```
DeepSeekworks/
├── AGENTS.md              # 工作区约定（AI 编码助手自动读取）
├── README.md              # 本文件
├── .gitignore
├── docs/
│   └── plugin-api.md      # DSH 插件开发 API 参考
├── dsh-webchart/          # DSH 插件：网页总结出图
│   ├── lib/client.cjs     #   客户端 UI
│   ├── lib/index.mjs      #   服务端
│   ├── cordis.patch.yml
│   ├── package.json
│   ├── CHANGELOG.md
│   └── LICENSE
├── hello.c                # C 语言示例
└── .vscode/               # 编译/调试配置
```

## 项目

### dsh-webchart — 网页总结出图插件

在 DSH 输入框左侧加一个 **「📊 网页图表」** 按钮：填入网页地址点「生成」，
请求自动提交给 agent —— 由 agent 抓取网页、总结并生成交互式 HTML 图表。

- 安装：`dsh plugin --profile desktop add file:G:\DeepSeekworks\dsh-webchart`
- 详情见 [dsh-webchart/README.md](dsh-webchart/README.md)
- 变更记录见 [dsh-webchart/CHANGELOG.md](dsh-webchart/CHANGELOG.md)

### C 语言练习

`hello.c` + `.vscode/tasks.json` + `.vscode/launch.json`
（Ctrl+Shift+B 编译 / F5 用 gdb 调试）

## 文档

| 文档 | 内容 |
| --- | --- |
| [AGENTS.md](AGENTS.md) | 工作区约定：插件生产规则、DSH 插件开发速查 |
| [docs/plugin-api.md](docs/plugin-api.md) | DSH 插件 API 完整参考（插槽表、inputActions、调试方法、陷阱清单） |
| [dsh-webchart/README.md](dsh-webchart/README.md) | 插件的安装与开发说明 |

## 本机环境

| 工具 | 版本 | 位置 |
| --- | --- | --- |
| Git | 2.56.0 | `C:\Program Files\Git` |
| GCC / GDB / Make | 16.2.0 / 17.2 / 4.4.1 | `G:\w64devkit` |
| bsk CLI（浏览器自动化） | 0.3.2 | `G:\Tools\bsk` |
| ffmpeg / ffprobe | 8.1.3 | `G:\Tools\ffmpeg` |
| VS Code | 1.140.0 | `G:\Microsoft VS Code` |

## 常用命令

```bash
git status                     # 看当前状态（最常用）
git add .                      # 暂存全部改动
git commit -m "说明"           # 提交一个版本
git push                       # 推送到 GitHub
git log --oneline --graph      # 查看历史
git switch -c feature          # 新建并切换分支
```

## 约定

开发约定见 [AGENTS.md](AGENTS.md)，其中最重要的一条：

> **每次插件开发或修改结束时，必须提交到 git**（只提交插件目录本身，提交后推送）。
