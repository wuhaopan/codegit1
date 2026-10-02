# Changelog

本文件记录 `dsh-webchart` 的所有重要变更。

格式遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [Unreleased]

## [0.1.1] - 2026-10-02

### Added
- 面板右上角新增关闭按钮（✕），点击关闭面板并清空错误提示
- 标题区右侧留白 26px，避免与关闭按钮重叠

### Changed
- 关闭方式增至三种：点 ✕ / 再点工具栏按钮 / 按 Esc

## [0.1.0] - 2026-10-02

### Added
- 输入框左侧「📊 网页图表」按钮（挂载到 `conversation.input.left` 插槽）
- 内联面板：网页地址输入框 + 「生成」按钮
- 通过 `inputActions.setDraft()` + `submit()` 把请求自动提交给当前会话
- 网址自动补全协议头（省略 `https://` 也能用）
- 支持 Esc 关闭面板、Enter 直接生成
