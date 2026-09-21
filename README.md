# AI Usage Dashboard - 模型价格看板 (React 19 + Vite + TS)

基于 **React 19 + Vite + TypeScript** 构建的高颜值 AI 大模型用量价格看板。

🔗 **在线预览**：[https://mhxy13867806343.github.io/pricing-aiusage/](https://mhxy13867806343.github.io/pricing-aiusage/)

---

## 🌟 项目特性

- ⚛️ **最新 React 19 驱动**：使用 React 19 官方标准 Hooks、TypeScript 全类型安全。
- ⚡ **极致极速构建**：基于 Vite 6，开发秒级热重载，打包体积小巧。
- 📱 **纯自动双端响应式**：
  - **PC 端（桌面宽屏）**：规范呈现三列表格（模型、输入/输出、缓存读写），表头支持实时升降序排序。
  - **移动端（手机/窄屏）**：屏幕宽度 $\le$ 768px 时自动无缝切换为流式卡片，内置 2×2 价格网格。
- 🔍 **智能多维筛选与检索**：
  - **实时模糊查询**：支持模型名称即时过滤，带一键清空按钮。
  - **厂商图标与筛选**：智能正则识别模型品牌归属（OpenAI、Claude、Google、DeepSeek、Qwen、Kimi、Moonshot、MiniMax、智谱 AI、xAI 等），支持按厂商下拉筛选。
  - **统一排序下拉面板**：PC 与移动端均配备排序下拉面板（输入价格、模型名称、缓存价格排序），带选中状态与勾选标。
- 🎨 **掘金原生高质感设计**：
  - 支持 **深色模式（Dark Mode）** 与 **浅色模式（Light Mode）** 一键切换并持久化保存。
  - 防遮挡多层级智能「返回顶部」浮标，丝滑平滑置顶。
- 🛡️ **本地代理与防跨域**：
  - 本地 Vite 开发环境配置了反向代理，开发阶段直接调用接口无跨域困扰。

---

## 🛠️ 技术栈

| 模块 | 技术选型 | 说明 |
| :--- | :--- | :--- |
| **前端框架** | React 19 (`react` & `react-dom`) | 组件化、函数式编程、状态管理 |
| **构建工具** | Vite 6 | 秒级冷启动、极速 HMR、开箱即用代理 |
| **开发语言** | TypeScript 5.7 | 全量强类型声明与接口定义 |
| **界面样式** | CSS3 | 原生 CSS 变量、Flexbox / Grid、媒体查询、动画 |
| **图标资源** | 矢量 SVG (Data URI) | 完整厂商官方 Logo 集合 |
| **数据来源** | Juejin AI Usage API | `https://api.juejin.cn/aiusage_api/functions/tud-pricing` |

---

## 📂 项目结构

```text
pricing-aiusage/
├── src/
│   ├── constants/
│   │   ├── icons.ts          # 厂商矢量 SVG 图标集合
│   │   └── providers.ts      # 模型品牌识别正则与配置
│   ├── types/
│   │   └── index.ts          # TypeScript 全局接口定义
│   ├── utils/
│   │   └── format.ts         # 价格格式化工具函数
│   ├── App.tsx               # 核心交互逻辑与双端视图组件
│   ├── App.css               # 样式表（主题变量、动画、响应式）
│   └── main.tsx              # React 19 应用启动入口
├── index.html                # HTML 单页应用入口
├── vite.config.ts            # Vite 配置文件（含反向代理）
├── tsconfig.json             # TypeScript 编译器配置
├── package.json              # 依赖与脚本指令配置
├── LICENSE                   # 开源许可证（MIT License）
└── README.md                 # 项目文档说明
```

---

## 🚀 本地开发与构建

```bash
# 1. 克隆代码仓库
git clone https://github.com/mhxy13867806343/pricing-aiusage.git
cd pricing-aiusage

# 2. 安装依赖
npm install

# 3. 启动开发服务器（含 API 代理，无跨域问题）
npm run dev

# 4. 生产构建打包
npm run build
```

---

## 📄 开源许可证

本项目基于 [MIT License](LICENSE) 协议开源。
