/**
 * dsh-webchart — 服务端半边。
 * 本插件的交互全部在 Web 客户端（输入框旁的按钮 + 面板），
 * 服务端只负责把客户端 bundle 带进 profile。
 */
export const name = "dsh-webchart";
export const inject = [];

export function apply(ctx) {
  ctx.logger?.info?.("dsh-webchart loaded");
}
