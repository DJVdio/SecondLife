# 第二人生 (SecondLife)

基于 SecondMe API 的个性化人生重开模拟器。利用用户在 SecondMe 中的记忆、性格标签和 AI 分身，为每个用户生成独一无二的重启人生故事。

## 技术栈

- **框架**: Next.js 15 (App Router)
- **样式**: Tailwind CSS v4
- **数据库**: PostgreSQL (Neon) + Drizzle ORM
- **会话**: iron-session（加密 cookie，无状态）
- **部署**: Vercel
- **ID 生成**: 雪花漂移算法（用于分享链接）

## SecondMe API

Base URL: `https://app.mindos.com/gate/lab`

### OAuth2 授权流程

1. 重定向用户到 `https://go.second.me/oauth/?client_id=xxx&redirect_uri=xxx&response_type=code&state=xxx`
2. 用户授权后回调携带 `code` 和 `state`
3. 服务端用 `POST /api/oauth/token/code`（x-www-form-urlencoded）换取 Token
4. Access Token 有效期 2 小时，Refresh Token 30 天
5. 刷新用 `POST /api/oauth/token/refresh`（x-www-form-urlencoded），旧 Refresh Token 作废

### 核心端点

| 端点 | 方法 | 权限 | 用途 |
|------|------|------|------|
| `/api/secondme/user/info` | GET | user.info | 用户基本信息（姓名、简介、头像） |
| `/api/secondme/user/shades` | GET | user.info.shades | 兴趣标签（含置信度） |
| `/api/secondme/user/softmemory` | GET | user.info.softmemory | 软记忆（分页，factObject + factContent） |
| `/api/secondme/chat/stream` | POST | chat | SSE 流式聊天（支持 systemPrompt、sessionId） |
| `/api/secondme/note/add` | POST | note.add | 添加笔记 |

### SSE 流格式

```
event: session
data: {"sessionId": "labs_sess_xxx"}

data: {"choices": [{"delta": {"content": "文本片段"}}]}
data: [DONE]
```

### 所需 OAuth2 Scopes

`user.info`, `user.info.shades`, `user.info.softmemory`, `chat`

## 项目结构

```
src/
├── app/                        # Next.js App Router
│   ├── page.tsx                # 落地页
│   ├── layout.tsx              # 根布局
│   ├── globals.css             # 全局样式
│   ├── auth/
│   │   └── callback/page.tsx   # OAuth2 回调页
│   ├── game/
│   │   └── page.tsx            # 游戏主页
│   ├── result/
│   │   └── [id]/page.tsx       # 公开分享结果页
│   └── api/
│       ├── auth/               # 登录、回调、刷新、会话
│       ├── user/               # 代理 SecondMe 用户数据
│       ├── game/               # 游戏启动、流式、选择、保存
│       └── result/[id]/        # 公开获取分享结果
├── lib/
│   ├── secondme/
│   │   ├── client.ts           # SecondMe API 客户端（仅服务端）
│   │   ├── types.ts            # API 响应类型
│   │   └── memory-composer.ts  # 记忆组合为 prompt 素材
│   ├── auth/
│   │   └── session.ts          # iron-session 会话管理
│   ├── game/
│   │   ├── engine.ts           # 游戏状态机
│   │   ├── stages.ts           # 人生阶段定义
│   │   ├── prompts.ts          # System Prompt 模板
│   │   └── types.ts            # 游戏类型
│   ├── db/
│   │   ├── index.ts            # Drizzle 客户端
│   │   └── schema.ts           # 数据库 schema
│   └── snowflake.ts            # 雪花 ID 生成
├── components/
│   ├── ui/                     # 基础 UI 组件
│   ├── game/                   # 游戏组件（时间线、选择面板、属性条）
│   └── result/                 # 结果展示组件
└── hooks/
    ├── use-auth.ts             # 认证 hook
    ├── use-game.ts             # 游戏状态 hook
    └── use-sse.ts              # SSE 流式 hook
```

## 核心架构

### 游戏流程

1. 用户 OAuth2 授权登录
2. 服务端并行获取 user/info + user/shades + user/softmemory
3. `memory-composer` 将三个数据源组合为结构化人物档案
4. 随机生成初始属性（幸福/财富/健康/智力/魅力/运气，各 0-100）
5. 构建 systemPrompt（人物档案 + 初始属性 + 输出格式要求）
6. 通过 SecondMe chat/stream 逐阶段生成人生故事
7. AI 以结构化 JSON 输出每阶段事件、属性变化、选择项
8. 最终结果存入 PostgreSQL，生成雪花 ID 用于分享

### 人生阶段

| 阶段 | 年龄 | 选择数 |
|------|------|--------|
| 出生+童年 | 0-12 | 1 |
| 青年 | 13-22 | 2 |
| 成年 | 23-40 | 2 |
| 中年 | 41-60 | 1 |
| 老年+结局 | 61+ | 0（终章） |

### 会话策略

- 整个游戏使用**单个 chat session**，保持叙事连贯
- systemPrompt 在首次请求时设定，后续请求携带同一 sessionId
- 每个玩家选择作为新 message 发送，触发下一阶段生成

### 数据存储

仅存储最终结果，schema 极简：
- `share_id`（雪花 ID，唯一索引）
- 用户信息（userId, name, avatar）
- 初始/最终属性（JSONB）
- 人生总结（死亡年龄、死因、墓志铭、评级、摘要）
- 各阶段叙事 + 关键事件 + 选择记录（JSONB）

## 前端设计规范

**风格：白色 + 黑色线稿**

- 背景：纯白 `#FFFFFF`
- 文字/线条：纯黑 `#000000`
- 卡片背景：`#F5F5F5`，边框：`#E0E0E0`
- 中文字体：Noto Serif SC（衬线）
- 数字/代码：JetBrains Mono
- 无渐变、无阴影、圆角不超过 2px
- 插图使用 SVG 线稿，手绘风格，不填充
- 文字打字机动画效果
- 整体感觉：极简素描本

## 环境变量

参见 `.env.example`，实际值放 `.env.local`（已 gitignore）：

- `SECONDME_CLIENT_ID` — OAuth2 Client ID
- `SECONDME_CLIENT_SECRET` — OAuth2 Client Secret
- `SECONDME_BASE_URL` — API 基础 URL
- `NEXT_PUBLIC_BASE_URL` — 应用公开 URL
- `SESSION_SECRET` — iron-session 加密密钥（32+ 字符）
- `DATABASE_URL` — PostgreSQL 连接字符串（Vercel 部署时自动注入）

## 开发命令

```bash
npm run dev        # 本地开发（http://localhost:3000）
npm run build      # 生产构建
npm run start      # 生产启动
npm run db:push    # 推送 schema 到数据库
npm run db:studio  # 打开 Drizzle Studio
```

## 注意事项

- 所有 SecondMe API 调用必须经服务端 API Route 代理，不暴露 Token
- Token 换取必须用 `application/x-www-form-urlencoded` 格式，不是 JSON
- Refresh Token 有轮换机制：每次刷新后旧 Token 失效
- SSE 代理路由需设置 `maxDuration: 60`（Vercel 函数超时）
- 解析 AI JSON 输出需容错处理，准备 fallback 到纯文本展示
- 所有commit之前都需要践行代码review