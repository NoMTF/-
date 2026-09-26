# 按钮与接口对照

原型里的每个可操作控件都带有 `data-api` 属性，打开任意页面右上角的「接口标注」即可在页面上直接看到。本表按页面列出接回后端时需要调用的接口、请求字段、要用到的响应字段，以及原型里已经画好的状态。

约定：

- 用户接口都走 XBoard 的 sanctum 登录态：请求头 `Authorization: <auth_data>`（`auth_data` 由登录接口返回，本身已包含 `Bearer ` 前缀）。
- `/api/v1/mtf/*` 是 MtfCore 插件的接口，定义在 `source/routes/api.php`；其余是 XBoard 原生接口（从 `original-public` 编译包中核对过路径）。
- 响应统一为 `{ status: "success" | "fail", message, data }`。失败时把 `message` 原样显示在对应位置（表单错误、轻提示或面板内提示框）。

## 访客页面

| 页面 | 控件 | 接口 | 请求 | 用到的响应 / 行为 |
|---|---|---|---|---|
| 登录 `login.html` | 「登　录」提交 | `POST /api/v1/passport/auth/login` | `email`, `password` | `data.auth_data` 存入本地后跳转仪表盘；失败显示页面顶部红色提示框与字段错误（见状态样张 01） |
| 登录 | 「凭邀请码注册」「忘记密码？」 | 页面跳转 | — | — |
| 注册 `register.html` | 「发送验证码」 | `POST /api/v1/mtf/invite/email/send` | `email`, `invite_code` | 成功后按钮进入 60 秒倒计时，提示「注册验证码已发送，请查收邮件（有效期 5 分钟）」；429 提示「操作太频繁」 |
| 注册 | 「注　册」提交 | `POST /api/v1/passport/auth/register` | `email`, `password`, `invite_code`, `email_code` | 成功后按登录处理；提示 7 天内绑定 Telegram |
| 注册 | 「私聊 @MTFLink_bot 申请」 | 外链 `https://t.me/MTFLink_bot` | — | 申请流程在机器人内完成（`source/bot/telegram-worker.js`） |
| 忘记密码 `forgot.html` | 「发送验证码」 | `POST /api/v1/passport/comm/sendEmailVerify` | `email`, `isforget=1` | 60 秒倒计时 |
| 忘记密码 | 「重设密码」 | `POST /api/v1/passport/auth/forget` | `email`, `email_code`, `password` | 成功后回登录页 |

## 用户页面

| 页面 | 控件 | 接口 | 请求 | 用到的响应 / 行为 |
|---|---|---|---|---|
| 所有页面 | 顶部公告条、通知公告列表 | `GET /api/v1/user/notice/fetch` | — | 取最新公告标题做公告条；点击打开红头文书弹窗（`title`, `content` 按 Markdown 渲染，`created_at` 做落款日期） |
| 所有页面 | 退出登录 | 清除本地 `auth_data` | — | 跳回登录页 |
| 所有页面 | 侧栏底部「当前在线 / 已注册」 | `GET /api/v1/mtf/stats` | — | 两个聚合数字，30 秒缓存 |
| 仪表盘 `dashboard.html` | 环形表、本月总额 / 已用 | `GET /api/v1/user/getSubscribe` | — | `transfer_enable`, `u`, `d`, `expired_at`（为空显示「长期有效」） |
| 仪表盘 | 「复制订阅链接」 | 同上 | — | `subscribe_url`；页面上只显示打码形式，复制用 `navigator.clipboard.writeText` |
| 仪表盘 / 个人中心 | 「重置订阅链接」→ 确认弹窗 | `GET /api/v1/user/resetSecurity` | — | 返回新链接；提示所有设备重新导入 |
| 仪表盘 | 在线设备 2 / 5 | `GET /api/v1/user/info` | — | `device_limit`；在线数来自插件的在线 IP 统计 |
| 仪表盘 | 推荐线路卡片 | `GET /api/v1/mtf/bandwidth` | — | 取 1x 机器中 `util_percent` 最低的一台；显示 `latency_ms` |
| 每日签到 `checkin.html` | 页面数据 | `GET /api/v1/mtf/checkin/info` | — | `min_gb`, `max_gb`, `streak`, `days_to_reset`, `used`, `transfer_enable`, `checked_today`, `today_reward` |
| 每日签到 | 签到印章按钮 | `POST /api/v1/mtf/checkin` | — | 成功显示「已签」印章与绿色提示框，重新拉取 info；失败把 `message` 放进红色提示框 |
| 每日签到 | 签到日历 | 需要新增字段 | — | 当前 info 接口没有按日记录，需在插件里返回本月已签日期数组（如 `days: [2,5,11,…]`）；没有该字段时可隐藏日历 |
| 流量排行 `ranking.html` | 今天 / 昨天 / 前天 / 6 天前 | `GET /api/v1/mtf/ranking?offset=0|1|2|6` | `offset` | `date`, `total`, `list[{rank,name,billed,is_me}]`, `mine`；切换时显示骨架，`list` 为空显示空状态 |
| 节点状态 `nodes.html` | 节点卡片 | `GET /api/v1/user/server/fetch` | — | 按物理机合并同名节点的三个协议；`is_online` 为 0 时显示离线卡片 |
| 节点状态 | 北京参考 RTT、连接 IP | `GET /api/v1/mtf/bandwidth` | — | `machines[].latency_ms`, `active_ips` |
| 带宽看板 `bandwidth.html` | 全页（访客可见） | `GET /api/v1/mtf/bandwidth` | — | 顶部：`used_mbps`, `capacity_mbps`, `util_percent`, `billed_used_mbps`, `today_used_gb`, `stale`；每台：`name`, `online`, `util_percent`, `used_mbps`, `capacity_mbps`, `limit_mbps`, `up_mbps`, `down_mbps`, `active_ips`, `billed_used_mbps`, `busy_ips`, `latency_ms`, `latency_loss_percent`, `today_used_gb`。约 30 秒轮询 |
| 我的邀请 `invites.html` | 邀请函、使用记录 | `GET /api/v1/user/invite/fetch` | — | `codes[]`（取 `status=0` 的一枚），`stat`；使用记录为空显示空状态 |
| 个人中心 `profile.html` | 站友证 | `GET /api/v1/user/info` | — | `email`, `created_at`, `banned`, `device_limit`, `telegram_id` |
| 个人中心 | 「保存新密码」 | `POST /api/v1/user/changePassword` | `old_password`, `new_password` | 成功提示其他设备需重新登录 |
| Telegram 绑定 `telegram.html` | 页面数据 / 「已发送？检查状态」 / 「刷新绑定码」 | `GET /api/v1/mtf/tg/token` | — | `bound`（true 显示已绑定视图）, `token`（8 位大写字母数字）, `bot`；401/403 显示「登录已失效」 |
| Telegram 绑定 | 「复制 /bind 指令」 | 本地复制 `/bind <token>` | — | 成功文案「已复制，去机器人粘贴发送」，失败「复制失败，请手动复制上方绑定码」 |
| 我的工单 `tickets.html` | 工单列表、筛选 | `GET /api/v1/user/ticket/fetch` | 可带 `id` 取详情 | 列表：`id`, `subject`, `level`, `status`, `reply_status`, `updated_at`；筛选在前端完成 |
| 我的工单 | 「回复」 | `POST /api/v1/user/ticket/reply` | `id`, `message` | — |
| 我的工单 | 「问题已解决，关闭工单」 | `POST /api/v1/user/ticket/close` | `id` | — |
| 我的工单 | 「提交工单」 | `POST /api/v1/user/ticket/save` | `subject`, `level`, `message` | 节点、协议、客户端三个下拉框建议拼进 `message` 开头，后端无需改表 |
| 流量明细 `traffic.html` | 图表与表格 | `GET /api/v1/user/stat/getTrafficLog` | — | 每日 `u`, `d`, `server_rate`, `record_at`；「计入配额」=（u+d）×倍率 |

## 站务管理（管理员鉴权：`App\Http\Middleware\Admin`）

| 页面 | 控件 | 接口 | 请求 | 用到的响应 / 行为 |
|---|---|---|---|---|
| 运维总览 `admin.html` | KPI、物理机表、刷新 | `GET /api/v1/mtf/admin/overview` | — | `totals{users,banned,online_now,traffic_today,active_bans}`，`bandwidth{capacity_mbps,used_mbps,util_percent,billed_used_mbps}`，`nodes[]`（按物理机：`name`, `online`, `heartbeat_ago`, `cpu`, `mem_used/total`, `disk_used/total`, `limit_mbps`, `limit_mode`, `congested`, `used_mbps`, `capacity_mbps` 等） |
| 用户与 IP `admin-users.html` | 筛选 + 用户列表 | `GET /api/v1/mtf/admin/users` | 关键字、IP、状态（按现有控制器参数） | `rows[{id,email,banned,used,quota,today_billed,device_limit,devices[{node,ip}],device_count,last_login_at}]`, `total` |
| 用户与 IP | 「详情」 | `GET /api/v1/mtf/admin/user/{id}` | — | `user{id,email,banned,devices}`, `snapshots`（1 小时内：时刻、节点、IP、流量增量）, `daily`（5 天汇总）, `note` |
| 用户与 IP | 「封禁账户」 | `POST /api/v1/mtf/admin/ban` | `kind=user`, `value`, `reason`, `hours` | 返回 `banned_user`, `current_ips`；先弹确认框 |
| 用户与 IP | 「封禁 IP」「封禁当前全部 IP」 | `POST /api/v1/mtf/admin/ban` | `kind=ip`, `value`, `server_id` | 逐个 IP 调用 |
| 用户与 IP / 封禁管理 | 「解封」 | `POST /api/v1/mtf/admin/unban` | `kind`, `value` | — |
| 邀请码生成 `admin-invites.html` | 「生成 N 个邀请码」 | `POST /api/v1/mtf/admin/invite/gen` | `count`（1–200） | `codes[]`, `pool_unused`；结果区显示并可全部复制 |
| 邀请码生成 | 邀请码池 | `GET /api/v1/mtf/admin/invite/pool` | — | `total`, `unused`, `used` |
| 邀请码生成 | 「用途说明」、发放记录 | 需要新增 | — | 当前接口不记录用途和批次；如需要，可在 `invite/gen` 增加 `note` 字段并新增批次列表接口，否则隐藏这两块 |
| 封禁管理 `admin-bans.html` | 当前生效列表 | `GET /api/v1/mtf/admin/bans` | — | `kind`, `value`, `server_id`, `reason`, `expire_at`, `created_by` |
| 封禁管理 | 「确认封禁」 | `POST /api/v1/mtf/admin/ban` | `kind`(user/ip/domain), `value`, `reason`, `server_id`, `hours`（0 或空为永久） | 节点通过 `/api/v1/mtf/node/bans` 拉取规则 |
| 公告管理 `admin-notices.html` | 「发布公告」「保存草稿」 | XBoard 后台 `POST /api/v2/{secure_path}/notice/save` | `title`, `content`, `tags`, `show` | 机器人通过 `/api/v1/mtf/bot/notice/next` 拉取、`notice/ack` 确认，同步到 Telegram 主群 |
| 公告管理 | 已发布列表、撤回 | `GET …/notice/fetch`、`POST …/notice/drop` | `id` | Telegram 同步状态需插件记录 ack 时间后返回；没有时显示「已发布」即可 |

## 原型里只做展示、接入时需确认的部分

- **签到日历、邀请码用途与批次、公告 Telegram 同步时间**：现有接口没有这些字段，表中已注明两种处理方式（补字段或隐藏）。
- **文号**（如 `MTF站发〔2026〕9号`）：纯展示，可在前端按公告 id 生成，也可以作为公告标题前缀保存。
- **站务组印章**：纯装饰，SVG 内联在公告文书里，不需要后端。
