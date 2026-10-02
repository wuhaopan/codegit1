# dsh-webchart

在 DeepSeek Harness 输入框左侧加一个 **「📊 网页图表」** 按钮：填入网页地址，点「生成」，
自动把请求发给 agent —— 由 agent 抓取网页、总结要点并生成交互式 HTML 图表。

## 使用

1. 点击输入框左侧的 **📊 网页图表**
2. 填入网址（可省略 `https://`）
3. 点 **生成**（或按 Enter）—— 消息自动提交给当前会话

面板支持：右上角 ✕ 关闭、Esc 关闭、再点一次按钮关闭。

## 安装

```powershell
dsh plugin --profile desktop add file:G:\DeepSeekworks\dsh-webchart
```

## 开发

客户端是手写的 ModuleLoader CJS bundle（`lib/client.cjs`），无需构建工具链。
改完源码后同步到 profile 再按 F5 刷新页面：

```powershell
Copy-Item "G:\DeepSeekworks\dsh-webchart\lib\client.cjs" `
  "$env:USERPROFILE\.dsh\profiles\desktop\node_modules\dsh-webchart\lib\client.cjs" -Force
```

## 结构

| 文件 | 作用 |
| --- | --- |
| `package.json` | 包定义 + `dsh.bundle` / `dsh.client` 声明 |
| `cordis.patch.yml` | 服务端插件装载入口 |
| `lib/index.mjs` | 服务端（空壳，交互全在客户端） |
| `lib/client.cjs` | 客户端 UI：按钮 + 面板 + 提交逻辑 |
