# AI Usage Dashboard - 模型价格看板

基于纯前端技术（HTML5 + CSS3 + 原生 JavaScript / jQuery）实现的高还原度 AI 大模型用量价格看板。

🔗 **在线预览**：[https://mhxy13867806343.github.io/pricing-aiusage/](https://mhxy13867806343.github.io/pricing-aiusage/)

---

## 🌟 项目特性

- ⚡ **零框架依赖**：纯 HTML5 + CSS3 + jQuery 实现，轻量小巧、开箱即用，无任何构建打包门槛。
- 📱 **纯自动双端响应式**：
  - **PC 端（桌面宽屏）**：呈现规范的三列表格（模型、输入/输出价格、缓存价格），支持点击列头多维升降序排序。
  - **移动端（手机/窄屏）**：屏幕宽度 $\le$ 768px 时自动无缝切换为流式卡片视图，具备 2×2 价格数据网格展示。
- 🔍 **多维智能检索与筛选**：
  - **实时模糊搜索**：输入模型关键词秒级过滤，支持一键清空。
  - **厂商图标与筛选**：智能正则识别模型品牌归属（OpenAI、Claude、Google、DeepSeek、Qwen、Kimi、Moonshot、MiniMax、智谱 AI、xAI 等），支持按厂商下拉筛选。
  - **统一排序下拉面板**：PC 端与移动端均配备排序下拉菜单（输入价格、模型名称、缓存价格排序），带高亮标记与选中勾选标。
- 🎨 **掘金原生高质感设计**：
  - 纯 CSS 实现的优雅骨架屏（Skeleton Loading）流光动画。
  - 完整支持 **深色模式（Dark Mode）** 与 **浅色模式（Light Mode）** 一键切换并持久化保存。
  - 防遮挡多层级智能「返回顶部」浮标，丝滑平滑置顶。
- 🛡️ **高可用与秒级首屏**：
  - 内置离线数据缓存（420+ 官方主流模型数据），打开即秒开。
  - 后台异步拉取线上最新接口数据进行热更新，接口受限或离线断网时自动平滑降级。

---

## 🛠️ 技术栈

| 模块 | 技术选型 | 说明 |
| :--- | :--- | :--- |
| **页面骨架** | HTML5 | 语义化标签与响应式视口配置 |
| **界面样式** | CSS3 | CSS 变量、Flexbox / Grid、媒体查询、CSS3 关键帧动画 |
| **交互逻辑** | jQuery 3.7.1 + Vanilla JS | DOM 操作、事件监听、数据检索过滤排序 |
| **图标资源** | SVG (Data URI) | 纯矢量厂商官方 Logo 集合 |
| **数据来源** | Juejin AI Usage API | `https://api.juejin.cn/aiusage_api/functions/tud-pricing` |

---

## 📂 项目结构

```text
pricing-aiusage/
├── index.html         # 核心页面结构（表格、卡片流、工具栏、置顶按钮）
├── style.css          # 全局样式（布局、响应式媒体查询、主题配色、动画）
├── app.js             # 业务逻辑（API 请求、数据正则归类、双端渲染、事件绑定）
├── icons.js           # 厂商矢量 SVG 图标集映射表
├── data.js            # 预置离线高可用模型价格数据集
├── jquery.min.js      # 本地 jQuery 脚本库（离线直接可用）
├── tud-pricing.json   # 原始定价数据备份文件
├── LICENSE            # 开源许可证（MIT License）
└── README.md          # 项目文档说明
```

---

## 🚀 本地快速启动

本仓库无需安装任何 `npm` 依赖或打包工具，克隆后即可直接运行：

### 方式 1：直接浏览器打开
直接在资源管理器中双击打开 `index.html` 即可运行。

### 方式 2：使用简易本地 HTTP 服务
```bash
# 1. 克隆代码仓库
git clone https://github.com/mhxy13867806343/pricing-aiusage.git
cd pricing-aiusage

# 2. 启动静态服务器（以 Python 为例）
python3 -m http.server 8080

# 3. 浏览器访问
open http://localhost:8080
```

---

## 📄 开源许可证

本项目基于 [MIT License](LICENSE) 协议开源。
