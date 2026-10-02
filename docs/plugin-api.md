# DSH 插件开发 API 参考

> 基于 **DSH 0.2.0-rc.2** 的实际开发验证（2026-10-02），
> 所有结论都由 `dsh-webchart` 插件在真机上跑通验证过，不是推测。
> 适用范围：需要给 DeepSeek Harness 的 Web 界面加 UI 的插件。

---

## 1. 插件形态

一个 DSH 插件由两半组成，可以只用其中一半：

| 半边 | 运行位置 | 入口 | 作用 |
| --- | --- | --- | --- |
| **服务端** | DSH 主进程（Node） | `lib/index.mjs` | 注册工具、命令、服务；也可只是空壳 |
| **客户端** | 浏览器（Web GUI） | `lib/client.cjs` | 注册 UI 组件到插槽、操作输入框 |

**关键结论：客户端 bundle 可以手写，不需要 Vite/React 构建链。** React 由宿主外部化提供，
通过 `require("react")` 拿到即可。

---

## 2. 包结构

```
<插件名>/
├── package.json          # 含 dsh.bundle.patch 与 dsh.client 配置
├── cordis.patch.yml      # 把服务端插件挂进 profile
├── README.md
├── CHANGELOG.md
└── lib/
    ├── index.mjs         # 服务端（ESP 模块）
    └── client.cjs        # 客户端（ModuleLoader 格式 CJS bundle）
```

### package.json 必要字段

```json
{
  "name": "<插件名>",
  "version": "0.1.0",
  "type": "module",
  "main": "lib/index.mjs",
  "exports": {
    ".":       { "default": "./lib/index.mjs" },
    "./client":{ "default": "./lib/client.cjs" }
  },
  "dsh": {
    "bundle": { "patch": "./cordis.patch.yml" },
    "client": {
      "platform": "web",
      "inject": ["@deepseek-ai/dsh-client-ui-conversation"]
    }
  }
}
```

- `dsh.bundle.patch` → 服务端插件通过该 patch 被装入 profile
- `dsh.client` → 声明这是一个客户端插件，`inject` 列出它依赖的 UI 包

### cordis.patch.yml

```yaml
- insert:
    - id: <插件短名>
      name: "<npm 包名>"
```

---

## 3. 客户端 bundle 格式（ModuleLoader）

```js
window.__ModuleLoader__.load({
  id: "<npm 包名>",                    // 必须与包名一致
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    var react = require("react");      // React 已外部化，直接 require

    function apply(ctx) {              // 插件主体，DSH 装载时调用
      ctx.slots.inject("<插槽名>", function () {
        return ctx.slots.register({
          name: "<插槽名>",
          id: "<本插件的条目 id>"       // list 类插槽用 id；keyed 类用 key
        }, MyComponent);
      });
    }

    exports.apply = apply;
    exports.inject = ["slots"];         // 依赖的客户端服务
    return module.exports;
  }
});
```

### 组件拿到的东西

注册的组件会自动收到框架注入的 props：

| prop | 说明 |
| --- | --- |
| `inputActions` | 输入框操作接口（见 §5） |
| `sessionId` | 当前会话 id（取决于插槽 scope） |
| `owner` | 父级渲染调用点的上下文 |

组件里**只用 `react.createElement`**（不能写 JSX，因为没有编译步骤）。

---

## 4. 插槽系统

### 4.1 四种类型

| kind | 语义 | 注册参数 |
| --- | --- | --- |
| `single` | 只能一个占用者 | 直接注册（已占用会冲突报错） |
| `list` | 有序列表，可多个 | `id` + 可选 `order` |
| `keyed` | 按 key 分发 | `key` |
| `chain` | 条目自荐（按 priority 选举） | `priority` |

**注册到未声明的插槽会在装载时抛错**，所以只能注册到父级已声明的名字上。

### 4.2 已确认可用的插槽

| 插槽 | 类型 | 位置 | 备注 |
| --- | --- | --- | --- |
| `conversation.input.left` | list | 输入框左侧按钮区 | ✅ 本项目使用 |
| `conversation.input.right` | list | 输入框右侧（发送键附近） | |
| `conversation.composer.dock` | list | 输入框下方停靠区 | |
| `conversation.composer.bar` | **single** | 输入框主体 | ⚠️ 已被 InputBar 占用，别注册 |
| `conversation.input.overlay` | list | 输入框上方浮层 | |
| `conversation.input.attachments` | single | 附件区 | |
| `shell.overlay` | list | 全局浮层 | |
| `tool.call.toolview` | keyed | 工具调用卡片视图 | key = 工具名 |
| `sidebar.right.pane.tab` | keyed | 右侧边栏标签页内容 | key = tab 定义 id |
| `sidebar.right.pane.tab.title` | keyed | 右侧边栏标签页标题 | |
| `sidebar.panellist` | list | 左侧面板列表图标入口 | |
| `main` | keyed | 主区域页面 | |

> 右侧边栏类插槽需要先向 `ctx.sidebarRightTabs` 注册标签页类型定义。

### 4.3 插槽的 scope

`session` / `session-maybe` / `root` —— 决定组件能拿到哪些会话级 props。
注册时无法自选，取决于父级声明。

---

## 5. 操作输入框：inputActions

组件通过 session 标准套件拿到的接口（DSH 内部为 `SessionInputShell.actions`）：

| 方法 | 作用 |
| --- | --- |
| `setDraft(text)` | 设置输入框草稿内容 |
| `submit()` | 直接提交（等价于用户按回车） |
| `insertText(text, span)` | 在光标处插入（需先 `captureInsertion()`） |
| `captureInsertion()` | 记录当前光标位置与草稿版本 |
| `addAttachments(ids)` / `removeAttachment(id)` / `pruneAttachments(ids)` | 附件管理 |

**推荐用法**（避免与编辑器更新竞态）：

```js
actions.setDraft("要发送的文本");
setTimeout(function () { actions.submit(); }, 60);
```

---

## 6. 安装、同步与生效

```powershell
# 1) 安装（file: 协议，本地开发用）
dsh plugin --profile desktop add file:<插件目录绝对路径>
```

### ⚠️ 最容易踩的坑

**pnpm 的 `file:` 依赖是「复制」而不是「符号链接」** —— 改完源码后 profile 里的副本不会更新，
必须手动同步：

```powershell
Copy-Item "<源码>\lib\client.cjs" `
  "$env:USERPROFILE\.dsh\profiles\desktop\node_modules\<插件名>\lib\client.cjs" -Force
```

然后 **F5 刷新 DSH 页面** 即可生效（客户端插件不需要重启应用）。

---

## 7. 调试与验证

### 7.1 静态验证（改完先跑这个，比刷新页面快得多）

用 Node 模拟 ModuleLoader 环境后 `eval` bundle：

```js
const loaded = [];
global.window = { __ModuleLoader__: { load: (d) => loaded.push(d) } };
eval(fs.readFileSync("lib/client.cjs", "utf8"));
const ex = loaded[0].factory((name) =>
  name === "react" ? { useState: () => [null, () => {}], createElement: () => null } : (() => { throw new Error(name); })()
);
// 检查 ex.apply / ex.inject，并模拟 ctx.slots 捕获注册参数
```

能提前发现语法错误、未预期的 `require`、注册参数写错。

### 7.2 界面验证

用 computeruse 工具：

1. `list_windows` 找 DSH 窗口拿 `nativeWindowHandle`（**重启后会变，别写死**）
2. `activate_window` + `keypress F5` 刷新页面
3. `snapshot`（带 `includeScreenshot`）截图查看
4. 按钮定位靠坐标点击；看不清细节时用 Python + Pillow **裁剪放大**再看
5. 验证交互后，`snapshot` 看元素是否按预期出现/消失

---

## 8. 已知陷阱清单

| 陷阱 | 现象 | 解法 |
| --- | --- | --- |
| 注册到 `composer.bar` | 装载报错/冲突 | 那是 single 且已被占用，改用 `conversation.input.left` |
| 依赖 peerDependencies 版本过老 | `dsh plugin add` 直接拒绝安装 | 插件不声明 peerDeps，或声明兼容区间 |
| 忘了同步到 profile | 改了代码但界面没变化 | 见 §6 的 Copy-Item |
| `setDraft` 后立刻 `submit` | 偶发提交旧内容 | 延迟 60ms 再 submit |
| 写 JSX | 运行时报语法错误 | 只能用 `react.createElement` |
| 客户端插件报错 | 可能整个页面白屏（首帧等所有 client entry） | 用静态验证先拦截；出问题用 `dsh plugin remove` 回滚 |

---

## 9. 参考实现

本工作区的 [`dsh-webchart`](../dsh-webchart/) 是一个完整可跑的最小示例：
输入框按钮 + 内联面板 + 调用 inputActions 提交，约 160 行客户端代码。
