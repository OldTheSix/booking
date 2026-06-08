# 🏡 农庄预约系统（纯前端静态版）

免费、无需后端、无需微信小程序，直接浏览器打开即可使用。

## 功能

- 📅 首页展示所有服务（钓鱼/午餐/晚餐/团建），含场地图片和菜品图片
- 📋 预约页：日历选日期、多服务勾选、菜单选择、实时计价
- 🔗 分享功能：生成分享链接，朋友打开直接预约
- ⚙️ 后台管理：增删改服务、上传图片、管理预约记录、设置折扣
- 💾 数据存在浏览器 localStorage，刷新不丢失

## 本地使用

双击 `index.html` 用浏览器打开即可。

## 免费部署（让朋友在线访问）

### 方式一：Netlify Drop（最快，30秒）

1. 打开 https://app.netlify.com/drop
2. 把整个 `booking-web` 文件夹拖进去
3. 得到一个 `xxx.netlify.app` 的网址，发给朋友即可预约

### 方式二：GitHub Pages

1. 在 GitHub 新建一个仓库（比如 `booking`）
2. 把 `booking-web` 里的所有文件 push 到仓库
3. 在仓库 Settings → Pages → Source 选择 `main` 分支
4. 等待 1 分钟，得到 `https://你的用户名.github.io/booking/` 网址

### 方式三：Vercel

1. 注册 https://vercel.com（用 GitHub 账号登录）
2. 选择 `Add New → Project → Import Git Repository`
3. 选择你的仓库，点击 Deploy
4. 得到免费网址

## 文件结构

```
booking-web/
├── index.html       ← 首页（服务展示）
├── booking.html     ← 预约页
├── admin.html       ← 后台管理
├── css/style.css    ← 样式
├── js/data.js       ← 数据层（localStorage）
└── images/          ← 图片目录
```
