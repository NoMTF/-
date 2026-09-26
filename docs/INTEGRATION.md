# 接回 XBoard：落地方法、文件清单与差异

本仓库的 `site/` 是**静态原型**，不是可以直接替换线上文件的主题包。线上用户端仍是 XBoard 编译好的 Vue SPA（Naive UI），定制全部通过 MtfCore 插件注入。下面说明如何把这套视觉接进现有实现，以及每一步对应哪个文件。

> **进度（2026-09-26）**：以下步骤已经在 MTFLink 源码上实现并在本地模拟环境（真实 SPA + 模拟接口）逐页验证，桌面 / 手机 / 暗色共 62 项检查通过。
> 成品以上线包 `MTF-gov-theme-2026-09-26.zip` 单独交付（插件文件、`gov-theme.patch`、一键上线 / 回滚脚本 `ops/mtf-frontend-deploy.sh`、改前改后截图），
> **没有放进本仓库**：本仓库公开，而上线包含服务端源码和 Telegram 主群邀请链接。实际做法与下文有三处不同：
> 样式表走新增的同源路由 `/mtf-static/`（与 `/mtf-custom.js` 同样优先读 `/opt/mtf/state/`）；
> 字体全部自托管（线上 CSP 的 `font-src` 只有 `'self'`，Google Fonts 用不了），思源宋体按站内用字频次切片；
> 响应式直接写成 `@media (max-width: 767.98px)`（与 SPA 自己的 md 断点一致），并适配了 SPA 的暗色模式。

## 1. 线上定制的现状（来自 MTFLink 源码 `docs/airport.md`）

| 部位 | 现有文件 | 注入方式 |
|---|---|---|
| 配色、菜单裁剪、面板内视图、公告弹窗、底栏 | `panel/MtfCore/setup/custom.html` + `custom.js` | 主题「自定义页脚 HTML」，由 `frontend-setup.php` 写入 `theme_Xboard` 设置；`custom.js` 由 `/mtf-custom.js` 路由提供 |
| 独立页面 `/checkin` `/ranking` `/bandwidth` `/mtf-admin` | `panel/MtfCore/resources/views/*.blade.php`（共用 `_layout.blade.php`） | 插件路由 `routes/web.php` |
| 使用文档 | `v2_knowledge` 表，由 setup 脚本写入 | XBoard 知识库 |
| 公告 | XBoard 公告 + 机器人同步 | `notice-setup.php`、`bot/` |

部署命令（在面板服务器 `/opt/mtf/xboard` 下）：

```bash
docker compose exec -T xboard php artisan tinker /www/plugins/MtfCore/setup/frontend-setup.php
docker compose exec -T xboard php artisan octane:reload   # 必须，否则其他 worker 仍是旧配置
```

## 2. 建议的落地顺序

1. **样式表**：把 `site/assets/css/gov.css` 与 `gov-art.css` 作为插件静态文件提供（与 `/mtf-custom.js` 相同的做法，新增 `/mtf-gov.css` 路由，内容哈希做 `?v=`），在 `custom.html` 里用 `<link>` 引入。不要内联，保持 CSP 的 `style-src` 收紧。
2. **Naive UI 覆盖层**：新写一段 `gov-naive.css`，把 SPA 的原生组件映射到本设计的令牌：

   | Naive UI 选择器 | 对应本设计 |
   |---|---|
   | `html{--primary-color…}` 等运行时变量 | 主色 `--brand-600 #BF161D`，hover `--brand-500`，pressed `--brand-700`（需要 `!important`） |
   | `.n-layout-sider` | `.side`：朱红渐变 + 祥云底纹 + 长城剪影 |
   | `.n-menu-item-content--selected` | `.nav-link.is-active`：鎏金底、深红字 |
   | `.n-menu-item-group-title` | `.nav-group`：宋体金字 + 菱形 |
   | `.n-layout-header` | `.topbar`：纸面 + 3px 朱红下边 + 1px 金线 |
   | `.n-card` / `.n-card-header__main` | `.panel` / `.panel-title`（宋体，下压 2px 朱红短线） |
   | `.n-button--primary-type` | `.btn-primary` |
   | `.n-progress-graph-line-fill` | `.meter > span`（金到红渐变） |
   | `.n-data-table-th` | `.table th`（淡红底、朱红上边线、宋体） |
   | `.n-input` | `.input`（聚焦描红 + 3px 淡红光圈） |
   | `.n-tag` | `.tag` 各色 |
   | `.n-drawer`（手机菜单） | `.side` 抽屉样式 |

3. **面板内视图**：`custom.js` 里的 `renderCheckin` / `renderRanking` / `renderTelegram` / `renderBandwidth` 目前拼接 `mtf-card` 等类名。把拼接的 HTML 换成原型对应页面 `main.content` 内部的结构（类名见下表），数据字段保持不变，逐项对照 `docs/API-MAPPING.md`。
4. **Blade 独立页面**：`_layout.blade.php` 换成原型的外壳（`.app > .shell > .side + .main`，或访客页用 `.auth`）；`checkin` `ranking` `bandwidth` `admin` 四个视图替换正文。访客打开 `/bandwidth` 时用不带侧栏的布局即可。
5. **公告弹窗**：`custom.js` 的 `showNotice` 改用 `.modal-scrim > .modal.wide > article.doc` 红头文书结构；文号可按公告 id 生成。
6. **字体**：必须自托管——线上 CSP 是 `font-src 'self' data:`，Google Fonts 会被拦。`site/assets/fonts/` 里是原型用的按用字裁剪子集；上线包里的做法是思源宋体 Bold 按站内用字频次切片、配 `unicode-range` 按需加载。
7. **响应式**：原型用 `.is-m` 类切换手机布局（由 `boot.js` 按 760px 断点加在 `<html>` 上）。接入线上时可以保留 `boot.js`，也可以把 `gov.css` 里所有 `.is-m ` 前缀的规则整体改写进 `@media (max-width: 760px)`。

## 3. 页面与组件文件清单

| 原型页面 | 线上对应 | 主要组件（类名） |
|---|---|---|
| `login.html` `register.html` `forgot.html` | SPA 登录 / 注册 / 忘记密码 + `custom.js` 注册引导 | `.auth` `.auth-hero` `.auth-card` `.field` `.input-group` `.guide` `.vsteps` |
| `dashboard.html` | SPA 仪表盘 + `custom.js` 捷径 | `.hero` `.ring` `.hero-stats` `.codebox` `.facts` `.quick` `.todo` `.notice-list` `.line-card` |
| `docs.html` | SPA 知识库 | `.doc-toc` `.doc-article` `.prose` |
| `checkin.html` | `renderCheckin` / `checkin.blade.php` | `.checkin` `.seal-btn` `.seal-done` `.cal` `.rule` |
| `ranking.html` | `renderRanking` / `ranking.blade.php` | `.seg` `.podium` `.medal` `.rank-list` `.empty` `.tab-skeleton` |
| `nodes.html` | SPA 节点页 | `.node` `.region` `.rate` `.status` `.node-metrics` `.chain` |
| `bandwidth.html` | `renderBandwidth` / `bandwidth.blade.php` | `.bw-hero` `.bw-card` `.kv` `.schematic` |
| `profile.html` | SPA 个人中心 | `.idcard` `.privacy-col` |
| `telegram.html` | `renderTelegram` | `.bind-state` `.deadline` `.bind-box` `.bigcode` `.steps` |
| `invites.html` | SPA 我的邀请 | `.letter` `.numlist` `.steps` |
| `tickets.html` | SPA 工单 | `.table.to-cards` `.thread` `.msg` `.dropzone` |
| `traffic.html` | SPA 流量明细 | `.chart` `.legend` `.table` |
| `admin*.html` | `admin.blade.php`（`/mtf-admin`） | `.kpi` `.subnav` `.filter-bar` `.mini-meter` `.timeline` `.codes` `.preview-pane` |

路由映射：原型文件名与旧原型的 hash 一一对应（`#dashboard` → `dashboard.html`，`#admin-users` → `admin-users.html`，以此类推）。

## 4. 与现有 `source/` 的差异

- **视觉**：粉蓝白渐变 → 朱红、鎏金、宣纸三色；标题改宋体；栏目标题、公告、站徽、印章等政务元素全部新增。
- **导航**：侧栏分为「便民服务 / 线路资源 / 个人事务 / 站务管理」；普通用户页只显示一个「管理后台」入口，管理员页换成站务分组。手机新增底部标签栏（首页 / 签到 / 带宽 / 绑定 / 更多），满足「手机上容易找到带宽看板、Telegram 绑定、每日签到」。
- **新增展示但接口缺字段**的：签到日历、邀请码用途与发放批次、公告的 Telegram 同步时间（处理方式见 API-MAPPING）。
- **倍率**：原型按交接包的六台机器绘制（1x / 1.5x / 1.8x / 2x）。MTFLink 现网文档还提到香港原生家宽、美国 cn2gia（1.5x）和美国静态家宽（3.5x）；卡片网格可容纳任意台数，`gov.css` 已为 3.5x 预留 `.rate.r35`。
- **未恢复**钱包、购买、订单入口。

## 5. 上线前检查

- 原型中的 Telegram 主群邀请链接已替换为占位 `https://t.me/+MAIN_GROUP_INVITE`，接入时换回真实链接（不要把真实邀请链接提交到公开仓库）。
- 在测试环境跑一遍 `frontend-setup.php` + `octane:reload`，逐页核对桌面与手机。
- 登录 / 注册页没有 `.n-menu-item`，注入逻辑不能在这两个页面早退（见 `docs/airport.md` 已知坑）。
- 知识库页面也用 `.n-list`，注入捷径必须判断路由。
- 检查 CSP：新样式表走同源路由即可，不需要放开 `unsafe-inline`。
