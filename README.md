# AI Usage Dashboard - 模型价格看板 (React 19 + Vite + TS + Ant Design)

基于 **React 19 + Vite + TypeScript + Ant Design** 构建的高颜值 AI 大模型用量价格看板。

[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-blue?logo=github)](https://github.com/mhxy13867806343/pricing-aiusage)
[![GitHub Pages](https://img.shields.io/badge/Online-Preview-success?logo=github)](https://mhxy13867806343.github.io/pricing-aiusage/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19.0-61dafb?logo=react)](https://react.dev/)
[![Ant Design](https://img.shields.io/badge/Ant%20Design-6.x-1677ff?logo=antdesign)](https://ant-design.antgroup.com/)

- 📦 **GitHub 仓库地址**：[https://github.com/mhxy13867806343/pricing-aiusage](https://github.com/mhxy13867806343/pricing-aiusage)
- 🌐 **在线预览地址**：[https://mhxy13867806343.github.io/pricing-aiusage/](https://mhxy13867806343.github.io/pricing-aiusage/)

---

## 🌟 项目特性

- ⚛️ **最新 React 19 驱动**：全量采用 React 19 标准 Hooks 与 TypeScript 强类型定义。
- 🎨 **Ant Design 深度整合**：
  - 接入 `ConfigProvider` 主题管理，掘金主题蓝（`#1e80ff`）全量定制。
  - Ant Design `Input` 实时模糊搜索，支持 `allowClear` 快速清除。
  - Ant Design `Select` 品牌供应商下拉筛选（带官方矢量 Logo）与统一排序面板。
  - Ant Design `FloatButton.BackTop` 悬浮置顶按钮，防遮挡智能避让。
  - Ant Design `Spin` 优雅流光加载动效与 `Empty` 友好异常重试交互。
- 📱 **纯自动双端响应式**：
  - **PC 端（桌面宽屏）**：规范呈现三列表格（模型、输入/输出价格、缓存读写），表头支持实时升降序排序。
  - **移动端（手机/窄屏）**：屏幕宽度 $\le$ 768px 时自动无缝切换为流式卡片，内置 2×2 价格网格。
- 🔍 **智能厂商正则识别**：
  - 算法智能匹配模型所属厂商（OpenAI、Claude、Google、DeepSeek、Qwen、Kimi、Moonshot、MiniMax、智谱 AI、xAI 等），渲染官方对应品牌 SVG 矢量图标。
- 🌓 **暗黑模式支持**：
  - 支持 **深色模式（Dark Mode）** 与 **浅色模式（Light Mode）** 一键切换，并与 Ant Design `darkAlgorithm` 深度同步且持久化存储。
- 🛡️ **生产级无 CORS 限制部署**：
  - 本地使用 Vite Dev Proxy 代理转发直连。
  - 线上配合 GitHub Actions CI/CD 流水线定时拉取掘金最新数据，生成同源产物部署至 GitHub Pages，**0 跨域报错、0 假数据**。

---

## 🛠️ 技术栈

| 模块 | 技术选型 | 说明 |
| :--- | :--- | :--- |
| **前端框架** | React 19 (`react` & `react-dom`) | 组件化、函数式编程、状态管理 |
| **UI 组件库** | Ant Design (`antd` & `@ant-design/icons`) | 搜索框、下拉菜单、回到顶部、主题适配 |
| **构建工具** | Vite 6 | 秒级冷启动、极速 HMR、开箱即用代理 |
| **开发语言** | TypeScript 5.7 | 全量强类型声明与接口定义 |
| **界面样式** | CSS3 | 原生 CSS 变量、Flexbox / Grid、媒体查询、动画 |
| **图标资源** | 矢量 SVG (Data URI) | 完整厂商官方 Logo 集合 |
| **自动化发布** | GitHub Actions | 定时同步最新真实数据并打包部署至 GitHub Pages |
| **数据来源** | Juejin AI Usage API | `https://api.juejin.cn/aiusage_api/functions/tud-pricing` |

---

## 📂 项目结构

```text
pricing-aiusage/
├── .github/workflows/
│   └── deploy.yml            # GitHub Actions 自动化数据抓取与 Pages 部署
├── public/
│   └── pricing.json          # 掘金官方最新真实模型定价数据
├── src/
│   ├── constants/
│   │   ├── icons.ts          # 厂商矢量 SVG 图标集合
│   │   └── providers.ts      # 模型品牌识别正则与配置
│   ├── types/
│   │   └── index.ts          # TypeScript 全局接口定义
│   ├── utils/
│   │   └── format.ts         # 价格格式化工具函数
│   ├── App.tsx               # 核心交互逻辑与双端视图组件（Ant Design）
│   ├── App.css               # 样式表（主题变量、动画、响应式）
│   ├── vite-env.d.ts         # Vite 客户端环境变量类型声明
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
