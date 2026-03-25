# 企业级 AI SaaS 平台

这是一个基于 **FastAPI + Next.js + PostgreSQL + Redis + Stripe + Dify** 的可部署企业级 AI SaaS 平台模板，覆盖官网、注册登录、SaaS 多租户、知识库问答、支付订阅、管理后台和 Docker 化部署。

## 1. 项目整体目录结构

```text
.
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── db/
│   │   ├── models/
│   │   ├── repositories/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── main.py
│   ├── sql/schema.sql
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── Dockerfile
│   └── package.json
├── nginx/default.conf
├── docker-compose.yml
└── README.md
```

## 2. 后端完整代码（分模块）

- 技术栈：FastAPI + SQLAlchemy + PostgreSQL + Redis + loguru。
- 分层结构：`api -> services -> repositories -> models/db`。
- 能力：JWT 登录、RBAC、租户隔离、Dify 问答、Stripe 支付回调、用量统计、健康检查。

关键模块：
- `backend/app/main.py`：应用启动、建表、路由挂载。
- `backend/app/api/v1/`：鉴权、聊天、计费、后台接口。
- `backend/app/services/`：认证、Dify、缓存、支付、用量逻辑。
- `backend/app/models/models.py`：完整 SaaS 数据模型。

## 3. 前端完整代码（Next.js 项目）

- 官网：`/`、`/pricing`、`/signin`、`/signup`
- 用户端：`/app`（已接通登录态、用量读取与 AI 问答）
- 管理后台：`/admin`（已接通真实后台指标接口）
- 技术栈：Next.js App Router + Tailwind CSS + Axios + Recharts。

## 4. 数据库建表 SQL

完整建表脚本位于：
- `backend/sql/schema.sql`

包含表：
- `users`
- `tenants`
- `subscriptions`
- `orders`
- `api_keys`
- `usage_logs`
- `knowledge_documents`

## 5. Stripe 接入代码

位置：
- `backend/app/services/payment_service.py`
- `backend/app/api/v1/routes_billing.py`

实现内容：
- Checkout Session 创建
- 订单落库
- Webhook 验签
- 订阅状态更新

配置项：
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_BASIC`
- `STRIPE_PRICE_PRO`

本地调试 webhook：
```bash
stripe listen --forward-to localhost:8000/api/v1/billing/webhook
```

## 6. Dify 接入代码

位置：
- `backend/app/services/dify_service.py`
- `backend/app/api/v1/routes_knowledge.py`（多租户文档上传/列表/删除）

实现内容：
- 多租户透传 `tenant_id`
- 知识库 `dataset_id` 隔离
- 超时控制
- Redis AI 缓存
- fallback 机制

配置项：
- `DIFY_BASE_URL`
- `DIFY_API_KEY`
- `DIFY_TIMEOUT_SECONDS`
- `FALLBACK_ANSWER`

## 7. Docker 部署文件

- `backend/Dockerfile`
- `frontend/Dockerfile`
- `docker-compose.yml`
- `nginx/default.conf`

## 8. 一键部署指南（详细步骤）

### 8.1 环境准备

确保安装：
- Docker
- Docker Compose
- Stripe CLI（可选，用于本地 webhook）

### 8.2 配置环境变量

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

然后编辑：
- `backend/.env`
- `frontend/.env`

其中前端的 `NEXT_PUBLIC_API_BASE_URL` 在通过 Nginx 反向代理部署时建议保持为 `/api/v1`，避免浏览器错误地请求访问者本机的 `localhost:8000`。

至少需要填写：
- Stripe 密钥
- Dify API Key
- `SECRET_KEY`
- 正式域名对应的 `FRONTEND_URL`

### 8.3 启动服务

```bash
docker compose up --build -d
```

启动后访问：
- 官网：`http://localhost`
- API 健康检查：`http://localhost/health`
- API 文档：`http://localhost:8000/docs`

### 8.4 生产部署建议

1. 使用云主机或 Kubernetes 部署。
2. 将 PostgreSQL 与 Redis 替换为托管服务。
3. 使用对象存储和 CDN 承载静态资源。
4. 给 Nginx 增加 HTTPS（Let's Encrypt 或云厂商证书）。
5. 在 CI/CD 中执行测试、镜像构建和灰度发布。
6. 为 Stripe / Dify / JWT 等敏感配置接入密钥管理系统。
7. 将 `Base.metadata.create_all` 替换为 Alembic 迁移流程。

### 8.5 注册到购买的完整业务链路

1. 用户在官网注册企业账号，前端会真实调用 `/api/v1/auth/signup` 并保存 JWT。
2. 后端创建 `tenant` 和 `owner user`，随后 `/api/v1/auth/me`、`/api/v1/billing/usage`、`/api/v1/admin/dashboard` 可为控制台提供真实数据。
3. 用户在定价页或控制台选择套餐。
4. 后端创建 Stripe Checkout Session。
5. Stripe Webhook 回调成功后自动激活订阅。
6. 用户在 `/app` 页面调用 `/api/v1/chat` 开始使用 Dify AI。

## 建议后续增强

- 接入支付宝国际版或本地支付网关。
- 增加邮件验证码、邀请成员、审计日志。
- 已内置本地文件存储版的多租户知识库上传能力；建议进一步替换为对象存储并接入异步任务队列。
- 为管理后台接入真实 API 数据而非静态展示。
