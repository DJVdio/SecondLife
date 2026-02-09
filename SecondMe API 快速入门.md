# SecondMe API 快速入门

---
title: SecondMe API 快速入门
description: 本指南将帮助你在 5 分钟内完成 API 接入
---

欢迎使用 SecondMe API！本指南将帮助你在 5 分钟内完成 API 接入。

## API 概述

SecondMe API 提供 SecondMe 数字分身能力，让你的应用能够：

- 获取用户授权的个人信息
- 访问用户的软记忆（个人知识库）
- 以用户的 AI 分身进行流式对话

**Base URL**: `https://app.mindos.com/gate/lab`

## 认证方式

SecondMe API 支持两种认证方式：

| 方式 | 适用场景 | 特点 |
|------|---------|------|
| **API Key** | 服务端调用、后台服务 | 长期有效，无需用户交互 |
| **OAuth2** | 第三方应用接入 | 需要用户授权，标准授权码流程 |

### 快速开始：使用 API Key

1. **获取 API Key**

   登录 [MindVerse SecondMe后台](https://app.mindos.com) 创建 API Key，选择所需权限。

2. **发起 API 请求**

   在请求头中添加 Authorization：

   ```bash
   curl -X GET "https://app.mindos.com/gate/lab/api/secondme/user/info" \
     -H "Authorization: Bearer lba_ak_your_api_key_here"
   ```

3. **处理响应**

   ```json
   {
     "code": 0,
     "message": "success",
     "data": {
       "name": "用户名",
       "bio": "个人简介",
       "avatar": "https://..."
     }
   }
   ```

## 第一个 API 调用

### 获取用户信息

```bash
curl -X GET "https://app.mindos.com/gate/lab/api/secondme/user/info" \
  -H "Authorization: Bearer lba_ak_your_api_key_here"
```

### 流式聊天

```bash
curl -X POST "https://app.mindos.com/gate/lab/api/secondme/chat/stream" \
  -H "Authorization: Bearer lba_ak_your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "你好，介绍一下自己"
  }'
```

响应为 Server-Sent Events 流：

```
event: session
data: {"sessionId": "labs_sess_xxx"}

data: {"choices": [{"delta": {"content": "你好"}}]}
data: {"choices": [{"delta": {"content": "，我是..."}}]}
data: [DONE]
```

## 权限 (Scopes)

API Key 和 OAuth2 都需要指定权限范围：

| 权限 | 说明 |
|------|------|
| `user.info` | 访问用户基础信息（姓名、邮箱、头像等） |
| `user.info.shades` | 访问用户兴趣标签 |
| `user.info.softmemory` | 访问用户软记忆 |
| `note.add` | 添加笔记和记忆 |
| `chat` | 访问聊天功能 |
| `voice` | 使用语音功能 |

## 下一步

- [认证概述](/zh/docs/authentication) - 了解两种认证方式的详细区别
- [API Key 指南](/zh/docs/authentication/api-key) - 深入了解 API Key 使用方法
- [OAuth2 指南](/zh/docs/authentication/oauth2) - 学习 OAuth2 授权码流程
- [SecondMe API](/zh/docs/api-reference/secondme) - 查看完整 API 参考
- [错误码](/zh/docs/errors) - 了解错误处理
