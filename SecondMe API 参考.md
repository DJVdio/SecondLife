# SecondMe API 参考

---
title: SecondMe API 参考
description: SecondMe API 提供用户信息访问和 AI 聊天功能
---

SecondMe API 提供用户信息访问和 AI 聊天功能。

**Base URL**: `https://app.mindos.com/gate/lab`

---

## 获取用户信息

获取授权用户的基本信息。

```
GET /api/secondme/user/info
```

### 认证

需要 OAuth2 Token 或 API Key。

### 所需权限

`user.info`

### 请求示例

```bash
curl -X GET "https://app.mindos.com/gate/lab/api/secondme/user/info" \
  -H "Authorization: Bearer lba_ak_your_api_key"
```

### 响应

**成功 (200)**

```json
{
  "code": 0,
  "data": {
    "userId": "12345678",
    "name": "用户名",
    "email": "user@example.com",
    "avatar": "https://cdn.example.com/avatar.jpg",
    "bio": "个人简介",
    "selfIntroduction": "自我介绍内容",
    "profileCompleteness": 85,
    "route": "username"
  }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| userId | string | 用户 ID |
| name | string | 用户姓名 |
| email | string | 用户邮箱 |
| avatar | string | 头像 URL |
| bio | string | 个人简介 |
| selfIntroduction | string | 自我介绍 |
| profileCompleteness | number | 资料完整度（0-100） |
| route | string | 用户主页路由 |

### 错误码

| 错误码 | 说明 |
|-------|------|
| apikey.permission.denied | 缺少 user.info 权限 |

---

## 获取用户兴趣标签

获取用户的兴趣标签（仅返回有公开内容的标签）。

```
GET /api/secondme/user/shades
```

### 认证

需要 OAuth2 Token 或 API Key。

### 所需权限

`user.info.shades`

### 请求示例

```bash
curl -X GET "https://app.mindos.com/gate/lab/api/secondme/user/shades" \
  -H "Authorization: Bearer lba_ak_your_api_key"
```

### 响应

**成功 (200)**

```json
{
  "code": 0,
  "data": {
    "shades": [
      {
        "id": 123,
        "shadeName": "科技爱好者",
        "shadeIcon": "https://cdn.example.com/icon.png",
        "confidenceLevel": "HIGH",
        "shadeDescription": "热爱科技",
        "shadeDescriptionThirdView": "他/她热爱科技",
        "shadeContent": "喜欢编程和数码产品",
        "shadeContentThirdView": "他/她喜欢编程和数码产品",
        "sourceTopics": ["编程", "AI"],
        "shadeNamePublic": "科技达人",
        "shadeIconPublic": "https://cdn.example.com/public-icon.png",
        "confidenceLevelPublic": "HIGH",
        "shadeDescriptionPublic": "科技爱好者",
        "shadeDescriptionThirdViewPublic": "一位科技爱好者",
        "shadeContentPublic": "热爱科技",
        "shadeContentThirdViewPublic": "他/她热爱科技",
        "sourceTopicsPublic": ["科技"],
        "hasPublicContent": true
      }
    ]
  }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| shades | array | 兴趣标签列表 |
| shades[].id | number | 标签 ID |
| shades[].shadeName | string | 标签名称 |
| shades[].shadeIcon | string | 标签图标 URL |
| shades[].confidenceLevel | string | 置信度：`VERY_HIGH`、`HIGH`、`MEDIUM`、`LOW`、`VERY_LOW` |
| shades[].shadeDescription | string | 标签描述 |
| shades[].shadeDescriptionThirdView | string | 第三人称描述 |
| shades[].shadeContent | string | 标签内容 |
| shades[].shadeContentThirdView | string | 第三人称内容 |
| shades[].sourceTopics | array | 来源主题 |
| shades[].shadeNamePublic | string | 公开标签名称 |
| shades[].shadeIconPublic | string | 公开图标 URL |
| shades[].confidenceLevelPublic | string | 公开置信度 |
| shades[].shadeDescriptionPublic | string | 公开描述 |
| shades[].shadeDescriptionThirdViewPublic | string | 公开第三人称描述 |
| shades[].shadeContentPublic | string | 公开内容 |
| shades[].shadeContentThirdViewPublic | string | 公开第三人称内容 |
| shades[].sourceTopicsPublic | array | 公开来源主题 |
| shades[].hasPublicContent | boolean | 是否有公开内容 |

### 错误码

| 错误码 | 说明 |
|-------|------|
| apikey.permission.denied | 缺少 user.info.shades 权限 |

---

## 获取用户软记忆

获取用户的软记忆数据（个人知识库），支持分页和搜索。

```
GET /api/secondme/user/softmemory
```

### 认证

需要 OAuth2 Token 或 API Key。

### 所需权限

`user.info.softmemory`

### 查询参数

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| keyword | string | 否 | 搜索关键词 |
| pageNo | integer | 否 | 页码（默认: 1，最小: 1） |
| pageSize | integer | 否 | 每页大小（默认: 20，最大: 100） |

### 请求示例

```bash
curl -X GET "https://app.mindos.com/gate/lab/api/secondme/user/softmemory?keyword=爱好&pageNo=1&pageSize=20" \
  -H "Authorization: Bearer lba_ak_your_api_key"
```

### 响应

**成功 (200)**

```json
{
  "code": 0,
  "data": {
    "list": [
      {
        "id": 456,
        "factObject": "兴趣爱好",
        "factContent": "喜欢阅读科幻小说",
        "createTime": 1705315800000,
        "updateTime": 1705315800000
      },
      {
        "id": 457,
        "factObject": "日常作息",
        "factContent": "每天早上 7 点起床",
        "createTime": 1704873600000,
        "updateTime": 1704873600000
      }
    ],
    "total": 100
  }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| list | array | 软记忆列表 |
| list[].id | number | 软记忆 ID |
| list[].factObject | string | 事实对象/分类 |
| list[].factContent | string | 事实内容 |
| list[].createTime | number | 创建时间（毫秒时间戳） |
| list[].updateTime | number | 更新时间（毫秒时间戳） |
| total | number | 总数 |

### 错误码

| 错误码 | 说明 |
|-------|------|
| apikey.permission.denied | 缺少 user.info.softmemory 权限 |

---

## 添加笔记

创建一条笔记或记忆，支持文本笔记和链接笔记两种类型。

```
POST /api/secondme/note/add
```

### 认证

需要 OAuth2 Token 或 API Key。

### 所需权限

`note.add`

### 请求参数

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| content | string | TEXT 类型必填 | 笔记内容（最大 50000 字符） |
| title | string | 否 | 笔记标题（最大 200 字符） |
| urls | string[] | LINK 类型必填 | URL 列表（最多 10 个） |
| memoryType | string | 否 | 笔记类型：`TEXT`（默认）或 `LINK` |

### 请求示例

**文本笔记：**

```bash
curl -X POST "https://app.mindos.com/gate/lab/api/secondme/note/add" \
  -H "Authorization: Bearer lba_ak_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "今天学习了 Python 的异步编程",
    "title": "学习笔记",
    "memoryType": "TEXT"
  }'
```

**链接笔记：**

```bash
curl -X POST "https://app.mindos.com/gate/lab/api/secondme/note/add" \
  -H "Authorization: Bearer lba_ak_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "urls": ["https://example.com/article"],
    "title": "有趣的文章",
    "memoryType": "LINK"
  }'
```

### 响应

**成功 (200)**

```json
{
  "code": 0,
  "data": {
    "noteId": 12345
  }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| noteId | number | 创建的笔记 ID |

### 错误码

| 错误码 | 说明 |
|-------|------|
| auth.scope.missing | 缺少 note.add 权限 |
| note.content.required | TEXT 类型笔记必须提供 content |
| note.urls.required | LINK 类型笔记必须提供 urls |

---

## 语音合成 (TTS)

将文本转换为语音音频，返回音频文件的公开 URL。

```
POST /api/secondme/tts/generate
```

### 认证

需要 OAuth2 Token 或 API Key。

### 所需权限

`voice`

### 请求参数

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| text | string | 是 | 待转换的文本，最长 10000 字符 |
| emotion | string | 否 | 情绪：`happy`/`sad`/`angry`/`fearful`/`disgusted`/`surprised`/`calm`/`fluent`（默认） |

> **注意**: 语音 ID 自动从用户信息中获取。如需使用 TTS 功能，用户需先在 SecondMe 中设置语音。

### 请求示例

```bash
curl -X POST "https://app.mindos.com/gate/lab/api/secondme/tts/generate" \
  -H "Authorization: Bearer lba_ak_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "你好，这是一段测试语音",
    "emotion": "fluent"
  }'
```

### 响应

**成功 (200)**

```json
{
  "code": 0,
  "data": {
    "url": "https://cdn.example.com/tts/audio_12345.mp3",
    "durationMs": 2500,
    "sampleRate": 24000,
    "format": "mp3"
  }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| url | string | 音频文件 URL（公有读，永久有效） |
| durationMs | number | 音频时长（毫秒） |
| sampleRate | number | 采样率 (Hz) |
| format | string | 音频格式 |

### 错误码

| 错误码 | 说明 |
|-------|------|
| apikey.permission.denied | 缺少 voice 权限 |
| tts.text.too_long | 文本超过 10000 字符限制 |
| tts.voice_id.not_set | 用户未设置语音 |

---

## 流式聊天

以用户的 AI 分身进行流式对话。

```
POST /api/secondme/chat/stream
```

### 认证

需要 OAuth2 Token 或 API Key。

### 所需权限

`chat`

### 请求头

| 头 | 必需 | 说明 |
|---|------|------|
| Authorization | 是 | Bearer Token |
| Content-Type | 是 | application/json |
| X-App-Id | 否 | 应用 ID，默认 `general` |

### 请求参数

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| message | string | 是 | 用户消息内容 |
| sessionId | string | 否 | 会话 ID，不提供则自动生成新会话 |
| appId | string | 否 | 应用 ID，优先级高于 Header |
| systemPrompt | string | 否 | 系统提示词，仅在新会话首次有效 |
| receiverUserId | number | 否 | 接收方用户 ID（预留字段） |
| enableWebSearch | boolean | 否 | 是否启用网页搜索，默认 false |

### 请求示例

```bash
curl -X POST "https://app.mindos.com/gate/lab/api/secondme/chat/stream" \
  -H "Authorization: Bearer lba_ak_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "你好，介绍一下自己",
    "systemPrompt": "请用友好的语气回复"
  }'
```

**启用 WebSearch:**

```bash
curl -X POST "https://app.mindos.com/gate/lab/api/secondme/chat/stream" \
  -H "Authorization: Bearer lba_ak_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "今天有什么科技新闻",
    "enableWebSearch": true
  }'
```

### 响应

响应类型为 `text/event-stream` (Server-Sent Events)。

**新会话首条消息:**

```
event: session
data: {"sessionId": "labs_sess_a1b2c3d4e5f6"}

```

**聊天内容流:**

```
data: {"choices": [{"delta": {"content": "你好"}}]}

data: {"choices": [{"delta": {"content": "！我是"}}]}

data: {"choices": [{"delta": {"content": "你的 AI 分身"}}]}

data: [DONE]
```

**启用 WebSearch 时的事件流:**

```
event: session
data: {"sessionId": "labs_sess_a1b2c3d4e5f6"}

event: tool_call
data: {"toolName": "web_search", "status": "searching"}

event: tool_result
data: {"toolName": "web_search", "query": "科技新闻", "resultCount": 5}

data: {"choices": [{"delta": {"content": "根据搜索结果..."}}]}

data: [DONE]
```

### 流数据格式

| 事件类型 | 说明 |
|---------|------|
| session | 新会话创建时返回会话 ID |
| tool_call | 工具调用开始，启用 WebSearch 时触发 |
| tool_result | 工具调用结果，包含搜索查询和结果数量 |
| data | 聊天内容增量 |
| [DONE] | 流结束标志 |

### 处理流式响应示例 (Python)

```python
import requests

response = requests.post(
    "https://app.mindos.com/gate/lab/api/secondme/chat/stream",
    headers={
        "Authorization": "Bearer lba_ak_xxx",
        "Content-Type": "application/json"
    },
    json={"message": "你好"},
    stream=True
)

for line in response.iter_lines():
    if line:
        line = line.decode('utf-8')
        if line.startswith('data: '):
            data = line[6:]
            if data == '[DONE]':
                break
            print(data)
```

### 错误码

| 错误码 | 说明 |
|-------|------|
| apikey.permission.denied | 缺少 chat 权限 |
| secondme.user.invalid_id | 无效的用户 ID |
| secondme.stream.error | 流式响应错误 |

---

## 获取会话列表

获取用户的聊天会话列表。

```
GET /api/secondme/chat/session/list
```

### 认证

需要 OAuth2 Token 或 API Key。

### 所需权限

`chat`

### 查询参数

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| appId | string | 否 | 按应用 ID 筛选 |

### 请求示例

```bash
curl -X GET "https://app.mindos.com/gate/lab/api/secondme/chat/session/list?appId=general" \
  -H "Authorization: Bearer lba_ak_your_api_key"
```

### 响应

**成功 (200)**

```json
{
  "code": 0,
  "data": {
    "sessions": [
      {
        "sessionId": "labs_sess_a1b2c3d4",
        "appId": "general",
        "lastMessage": "你好，介绍一下自己...",
        "lastUpdateTime": "2024-01-20T15:30:00Z",
        "messageCount": 10
      },
      {
        "sessionId": "labs_sess_e5f6g7h8",
        "appId": "general",
        "lastMessage": "今天天气怎么样？",
        "lastUpdateTime": "2024-01-19T10:00:00Z",
        "messageCount": 5
      }
    ]
  }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| sessions | array | 会话列表，按最后更新时间倒序 |
| sessions[].sessionId | string | 会话 ID |
| sessions[].appId | string | 应用 ID |
| sessions[].lastMessage | string | 最后一条消息预览（截断至 50 字） |
| sessions[].lastUpdateTime | string | 最后更新时间（ISO 8601） |
| sessions[].messageCount | number | 消息数量 |

### 错误码

| 错误码 | 说明 |
|-------|------|
| apikey.permission.denied | 缺少 chat 权限 |

---

## 获取会话消息历史

获取指定会话的消息历史。

```
GET /api/secondme/chat/session/messages
```

### 认证

需要 OAuth2 Token 或 API Key。

### 所需权限

`chat`

### 查询参数

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| sessionId | string | 是 | 会话 ID |

### 请求示例

```bash
curl -X GET "https://app.mindos.com/gate/lab/api/secondme/chat/session/messages?sessionId=labs_sess_a1b2c3d4" \
  -H "Authorization: Bearer lba_ak_your_api_key"
```

### 响应

**成功 (200)**

```json
{
  "code": 0,
  "data": {
    "sessionId": "labs_sess_a1b2c3d4",
    "messages": [
      {
        "messageId": "msg_001",
        "role": "system",
        "content": "请用友好的语气回复",
        "senderUserId": 12345,
        "receiverUserId": null,
        "createTime": "2024-01-20T15:00:00Z"
      },
      {
        "messageId": "msg_002",
        "role": "user",
        "content": "你好，介绍一下自己",
        "senderUserId": 12345,
        "receiverUserId": null,
        "createTime": "2024-01-20T15:00:05Z"
      },
      {
        "messageId": "msg_003",
        "role": "assistant",
        "content": "你好！我是你的 AI 分身...",
        "senderUserId": 12345,
        "receiverUserId": null,
        "createTime": "2024-01-20T15:00:10Z"
      }
    ]
  }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| sessionId | string | 会话 ID |
| messages | array | 消息列表，按创建时间升序 |
| messages[].messageId | string | 消息 ID |
| messages[].role | string | 角色：`system`/`user`/`assistant` |
| messages[].content | string | 消息内容 |
| messages[].senderUserId | number | 发送方用户 ID |
| messages[].receiverUserId | number | 接收方用户 ID（预留） |
| messages[].createTime | string | 创建时间（ISO 8601） |

### 错误码

| 错误码 | 说明 |
|-------|------|
| apikey.permission.denied | 缺少 chat 权限 |
| secondme.session.unauthorized | 无权访问该会话 |

> **注意**: 如果 sessionId 不存在，接口会返回成功（code=0），但 messages 为空数组。

---

## 通用响应格式

### 成功响应

```json
{
  "code": 0,
  "data": { ... }
}
```

### 错误响应

```json
{
  "code": 403,
  "message": "缺少必需的权限",
  "subCode": "apikey.permission.denied"
}
```

### 认证失败响应

当 API Key 或 Token 无效时：

```json
{
  "detail": "需要认证"
}
```
