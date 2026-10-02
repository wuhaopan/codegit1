window.__ModuleLoader__.load({
	id: "dsh-webchart",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		var react = require("react");

		/** 面板与按钮的样式（尽量少依赖主题变量，浅色/深色都能看） */
		var S = {
			wrap: { position: "relative", display: "inline-flex", alignItems: "center" },
			btn: {
				display: "inline-flex", alignItems: "center", gap: "4px",
				height: "28px", padding: "0 8px", marginRight: "4px",
				border: "1px solid rgba(128,128,128,0.35)", borderRadius: "8px",
				background: "transparent", color: "inherit", cursor: "pointer",
				fontSize: "12px", lineHeight: 1, whiteSpace: "nowrap"
			},
			panel: {
				position: "absolute", bottom: "36px", left: "0", zIndex: 40,
				width: "340px", padding: "12px",
				border: "1px solid rgba(128,128,128,0.35)", borderRadius: "12px",
				background: "var(--dsw-alias-bg-elevated, rgba(28,28,30,0.98))",
				boxShadow: "0 8px 28px rgba(0,0,0,0.28)", fontSize: "13px", color: "inherit"
			},
			close: {
				position: "absolute", top: "6px", right: "6px", width: "24px", height: "24px", padding: 0,
				display: "inline-flex", alignItems: "center", justifyContent: "center",
				border: "none", borderRadius: "6px", background: "transparent",
				color: "inherit", opacity: 0.55, cursor: "pointer", fontSize: "15px", lineHeight: 1
			},
			title: { fontWeight: 600, marginBottom: "8px", display: "block", paddingRight: "26px" },
			hint: { opacity: 0.6, fontSize: "11px", display: "block", marginBottom: "8px" },
			row: { display: "flex", gap: "6px" },
			input: {
				flex: "1", height: "30px", padding: "0 8px", fontSize: "13px",
				border: "1px solid rgba(128,128,128,0.4)", borderRadius: "8px",
				background: "rgba(128,128,128,0.10)", color: "inherit", outline: "none"
			},
			go: {
				height: "30px", padding: "0 12px", fontSize: "13px", cursor: "pointer",
				border: "none", borderRadius: "8px", color: "#fff",
				background: "var(--dsw-alias-brand-primary, #4d6bfe)"
			},
			err: { color: "#e5484d", fontSize: "11px", marginTop: "6px", display: "block" }
		};

		/**
		 * 输入框左侧的「网页总结出图」按钮 + 内联面板。
		 * 提交方式：把请求写进草稿并直接提交（inputActions 由 uiSession 标准套件提供）。
		 */
		function WebChartWidget(props) {
			var h = react.createElement;
			var openState = react.useState(false);
			var urlState = react.useState("");
			var msgState = react.useState("");
			var open = openState[0], setOpen = openState[1];
			var url = urlState[0], setUrl = urlState[1];
			var msg = msgState[0], setMsg = msgState[1];

			var actions = props.inputActions || null;

			function normalize(value) {
				var v = String(value || "").trim();
				if (!v) return "";
				if (!/^https?:\/\//i.test(v)) v = "https://" + v;
				return v;
			}

			function generate() {
				var target = normalize(url);
				if (!target) { setMsg("请输入网页地址"); return; }
				if (!actions || typeof actions.setDraft !== "function") {
					setMsg("当前上下文拿不到输入框，请先打开一个会话");
					return;
				}
				var text = "请打开这个网页并总结，然后生成一份可交互的 HTML 图表：\n" + target;
				actions.setDraft(text);
				setOpen(false);
				setUrl("");
				setMsg("");
				// 草稿写入后再提交，避免与编辑器更新竞态
				setTimeout(function () {
					try { actions.submit && actions.submit(); } catch (e) { /* ignore */ }
				}, 60);
			}

			function onKeyDown(e) {
				if (e.key === "Enter") { e.preventDefault(); generate(); }
				else if (e.key === "Escape") { setOpen(false); }
			}

			var children = [
				h("button", {
					key: "btn",
					type: "button",
					style: S.btn,
					title: "网页总结出图：输入网址，一键抓取、总结并生成图表",
					onClick: function () { setMsg(""); setOpen(!open); }
				}, "\uD83D\uDCCA 网页图表")
			];

			if (open) {
				children.push(h("div", { key: "panel", style: S.panel },
					h("button", {
						key: "close",
						type: "button",
						style: S.close,
						title: "关闭面板",
						"aria-label": "关闭面板",
						onClick: function () { setOpen(false); setMsg(""); }
					}, "\u2715"),
					h("label", { style: S.title }, "网页总结出图"),
					h("span", { style: S.hint }, "填入网页地址，自动抓取内容、总结要点并生成交互式图表"),
					h("div", { style: S.row }, [
						h("input", {
							key: "url",
							style: S.input,
							type: "text",
							value: url,
							placeholder: "https://example.com/article",
							onChange: function (e) { setUrl(e.target.value); },
							onKeyDown: onKeyDown,
							autoFocus: true
						}),
						h("button", { key: "go", type: "button", style: S.go, onClick: generate }, "生成")
					]),
					msg ? h("span", { key: "msg", style: S.err }, msg) : null
				));
			}

			return h("div", { style: S.wrap }, children);
		}

		/** 客户端插件主体：把按钮挂到输入框左侧的 list 插槽。 */
		function apply(ctx) {
			ctx.slots.inject("conversation.input.left", function () {
				return ctx.slots.register({
					name: "conversation.input.left",
					id: "webchart",
					order: 50
				}, WebChartWidget);
			});
		}

		exports.apply = apply;
		exports.inject = ["slots"];
		return module.exports;
	}
});
