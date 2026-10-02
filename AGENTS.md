# DeepSeekworks — 工作区约定

> 📖 完整的 DSH 插件 API 参考见 [docs/plugin-api.md](docs/plugin-api.md)
> （插槽清单、inputActions、调试方法、陷阱表；本文件只保留速查与规则）

## 插件生产规则（必须遵守）

**每次插件开发或修改结束时，必须提交到 git。** 具体：

1. **只提交插件目录本身**（例如 `dsh-webchart/`），不要把临时抓取的数据、测试产物、
   生成的图表等一起提交（那些文件保留在工作区但不入库）。
2. 提交信息用：`feat(<插件名>): <做了什么>` 或 `fix(<插件名>): <修了什么>`。
3. 提交后执行 `git push` 推送到远程。这台机器的网络会来回变，推送失败时按报错对症处理：
   - `Failed to connect ... over proxy 127.0.0.1` → **代理软件没开**，走直连：
     `git config --global --unset http.proxy` + `git config --global --unset https.proxy`
   - `Recv failure: Connection was reset` → **直连被墙**，配代理：
     `git config --global http.proxy http://127.0.0.1:7993`
   两种配置互斥，改完直接重试 push；本地 commit 不会丢，稍后补推也行。
4. 提交前确认三件事：源码已同步到 DSH profile、DSH 页面已刷新、功能已实测通过。

## DSH 插件开发要点

### 目录结构
```
<插件名>/
├── package.json          # 含 dsh.bundle.patch 与 dsh.client 配置
├── cordis.patch.yml      # 把服务端插件挂进 profile
└── lib/
    ├── index.mjs         # 服务端（可以是空壳）
    └── client.cjs        # 客户端 UI（ModuleLoader 格式的 CJS bundle）
```

### 客户端 bundle 格式（手写即可，不需要构建工具链）
```js
window.__ModuleLoader__.load({
  id: "<包名>",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    var react = require("react");     // React 已外部化
    function apply(ctx) {
      ctx.slots.inject("<插槽名>", () => ctx.slots.register({ name: "<插槽名>", id: "..." }, Component));
    }
    exports.apply = apply;
    exports.inject = ["slots"];
    return module.exports;
  }
});
```

### 常用插槽
| 插槽 | 类型 | 位置 |
| --- | --- | --- |
| `conversation.input.left` | list | 输入框左侧按钮区 |
| `conversation.input.right` | list | 输入框右侧（发送键附近） |
| `conversation.composer.dock` | list | 输入框下方停靠区 |
| `conversation.composer.bar` | single | 输入框主体（已被占用，不要注册） |
| `shell.overlay` | list | 全局浮层 |
| `tool.call.toolview` | keyed | 工具调用卡片视图 |

### 操作输入框 / 提交消息
组件通过 session 标准套件拿到 `inputActions`：
```js
props.inputActions.setDraft("文本");   // 写入草稿
props.inputActions.submit();           // 直接提交
```

### 安装与生效（重要）
```powershell
# 安装（file: 协议）
dsh plugin --profile desktop add file:<插件目录绝对路径>

# 改完源码后必须手动同步 —— pnpm 的 file: 是「复制」不是「符号链接」
Copy-Item "<源码>\lib\client.cjs" "$env:USERPROFILE\.dsh\profiles\desktop\node_modules\<插件名>\lib\client.cjs" -Force
```
然后按 F5 刷新 DSH 页面即可（客户端插件不需要重启应用）。

### 排查手段
- 静态验证：用 Node 模拟 `window.__ModuleLoader__` 后 eval bundle，检查 `exports.apply` 与 slot 注册参数
- 界面验证：computeruse 截图 + 坐标点击（DSH 窗口 hwnd 会变，先 list_windows）
