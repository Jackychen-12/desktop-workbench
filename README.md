# Desktop Workbench

本地桌面工作台 — 每日工作记录 · 项目看板 · AI 日报 · 备忘录 · 激励系统

## 功能

- **每日工作台**：手动记录 + Git/GitHub/Claude Code/Codex 自动采集
- **项目看板**：关联本地 Git 仓库和 GitHub，实时查看项目状态
- **AI 日报**：一键生成结构化每日工作总结（DeepSeek API）
- **桌面备忘录**：多彩便签，支持置顶
- **激励中心**：贡献热力图 + 连续打卡 + 成就徽章 + 番茄钟

## 技术栈

- **桌面框架**：Tauri 2（Rust 后端，~5MB 安装包）
- **前端**：React 18 + TypeScript + TailwindCSS
- **存储**：本地 SQLite（数据完全在本地，隐私安全）
- **集成**：Git CLI + GitHub API + Claude Code + Codex + DeepSeek API

## 安装

### 前置条件

- [Rust](https://rustup.rs/) (`curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`)
- [Node.js](https://nodejs.org/) >= 18
- [pnpm](https://pnpm.io/) (`npm install -g pnpm`)
- macOS: Xcode Command Line Tools (`xcode-select --install`)

### 开发运行

```bash
git clone https://github.com/Jackychen-12/desktop-workbench.git
cd desktop-workbench
pnpm install
pnpm tauri dev
```

### 构建安装包

```bash
pnpm tauri build
```

构建产物在 `src-tauri/target/release/bundle/` 目录。

## 配置

在应用内或通过 localStorage 配置：

- **DeepSeek API Key**：`localStorage.setItem("wb_deepseek_key", "sk-...")`
- **GitHub Token**：`localStorage.setItem("wb_github_token", "ghp_...")`
- **GitHub Username**：`localStorage.setItem("wb_github_user", "Jackychen-12")`

## License

MIT
