# GitHub Pages 部署说明

> 课程硬性要求：网页项目**必须部署到 GitHub Pages**，链接可正常访问。仅上传代码不视为完成部署。

## 部署前检查清单

- [x] 网站为纯静态文件，无构建步骤，无后端依赖
- [x] 所有资源使用相对路径（`css/`、`js/`），可在子路径下正常加载
- [x] `index.html` 位于项目根目录
- [x] 本地服务器验证通过：4 个资源均返回 200，标签解读 / 科普库 / AI 问答功能正常
- [x] 本地 Git 仓库已初始化（`main` 分支，`user.name=yhandme`，`.workbuddy/` 已忽略）
- [x] 本地已提交，提交号 `c4c7115`，远程 `origin` 已指向 `https://github.com/yhandme/food-label-ai.git`
- [x] 已在 GitHub 创建仓库
- [x] 代码已推送到仓库
- [x] 已开启 GitHub Pages 并验证链接可访问
- [x] 线上地址：<https://yhandme.github.io/food-label-ai/>
- [x] 仓库地址：<https://github.com/yhandme/food-label-ai>

## 部署步骤

### 第一步：创建 GitHub 仓库

1. 登录 [GitHub](https://github.com)，点击右上角 `+` → `New repository`。
2. 仓库名建议：`food-label-ai` 或 `shian-label-reader`。
3. 建议选择 **Public**（GitHub Pages 免费版对公开仓库支持最好）。
4. **不要**勾选 "Add a README file" 等初始化选项（本地已有文件，避免冲突）。
5. 点击 `Create repository`。

### 第二步：本地初始化并推送

在本项目目录（包含 `index.html` 的文件夹）打开终端，执行：

```bash
# 初始化 Git 仓库
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit: 食安标签通网站"

# 关联远程仓库（把 YOUR_USERNAME 和 YOUR_REPO 换成你自己的）
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# 推送到 main 分支
git branch -M main
git push -u origin main
```

> 如果 Git 要求登录，请使用 Personal Access Token（PAT）代替密码：  
> GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token，勾选 `repo` 权限。

### 第三步：开启 GitHub Pages

1. 进入你的仓库页面，点击顶部 `Settings` 标签。
2. 在左侧菜单找到 `Pages`。
3. 在 `Build and deployment` 区域：
   - **Source** 选择 `Deploy from a branch`
   - **Branch** 选择 `main`
   - **Folder** 选择 `/(root)`
4. 点击 `Save`。
5. 等待 1–2 分钟刷新页面，顶部会出现绿色提示 "Your site is live at <https://..."。>

### 第四步：验证并提交

1. 打开生成的链接（格式：`https://YOUR_USERNAME.github.io/YOUR_REPO/`），确认页面正常显示、各功能可用。
2. 将链接填入：
   - 实验报告封面的「成果链接」栏
   - `README.md` 中「在线访问」处
3. 在课程主页提交：报告 + GitHub 仓库链接 + AI 交互记录附件。

### 第五步：后续更新（第 7 轮修复后的推送）

本地仓库已完成提交并配好远程，剩下的只有「推送」这一步。在本项目目录打开终端执行：

```bash
git push -u origin main
```

第一次推送会要求登录。GitHub 早已不支持密码，需用 Personal Access Token：

1. GitHub → 头像 → `Settings` → 左侧最下方 `Developer settings`
2. `Personal access tokens` → `Tokens (classic)` → `Generate new token (classic)`
3. Note 随便填（如 `workbuddy-push`），Expiration 选 90 天，权限勾 **`repo`**
4. 生成后复制那串 `ghp_...`（只显示一次），推送时把它粘到密码位置
5. 账号填 `yhandme`

推送成功后等 1–2 分钟，`https://yhandme.github.io/food-label-ai/` 就会更新，浏览器按 `Ctrl+F5` 强制刷新即可看到新样式。

> 如果不想折腾终端，也可以直接到仓库页面点 `Add file` → `Upload files`，把这 4 个文件重新拖上去覆盖：`index.html`、`css/style.css`、`js/data.js`、`js/app.js`（`js/icons.js` 若已在仓库中则无需动）。效果完全一样。

**Q：页面打开是 404？**  
A：确认 `index.html` 在仓库根目录，且 Pages 的 Source 配置的是 `main` 分支的 `/(root)`。

**Q：样式或脚本加载失败（页面无样式、按钮无反应）？**  
A：检查 `index.html` 中引用路径是否为相对路径（`css/style.css`、`js/app.js`、`js/icons.js`），不要使用绝对路径或以 `/` 开头；并确认 `js` 文件夹里三个脚本都在（`icons.js`、`data.js`、`app.js`）。

**Q：更新了样式或脚本，线上页面没变化？**  
A：确认改动已推送到仓库（`index.html`、`css/style.css`、`js/` 全部更新，尤其是新增的 `js/icons.js` 不能漏传），然后等 1–2 分钟并强制刷新（Ctrl+F5）。

**Q：修改后网站没更新？**  
A：GitHub Pages 有缓存，推送后等待 1–2 分钟；可强制刷新浏览器（Ctrl+F5）。

**Q：可以绑定自己的域名吗？**  
A：可以，在 Pages 设置中的 `Custom domain` 处添加，但课程作业非必需。

## 提醒

建议在 **12 月 1 日之前**完成部署，为链接验证和报告填写留出缓冲时间。课程截止时间为 **2026 年 12 月 7 日**。
