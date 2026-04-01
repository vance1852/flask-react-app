# Docker 开发环境使用指南

通过 Docker 容器化技术，一键启动整个开发环境，无需手动安装 Python、Node.js、PostgreSQL 等依赖。

## 🚀 快速开始

### 前置要求

确保你的机器上已安装：
- Docker (20.10+)
- Docker Compose (2.0+)

**Windows/Mac 用户**：直接安装 Docker Desktop 即可包含以上组件。

### 一键启动

```bash
# 克隆项目后，进入项目根目录
cd 0331-rl-terminal

# 启动所有服务
docker-compose --env-file .env.docker up -d
```

等待 30 秒后，访问：
- 🌐 **前端应用**: http://localhost
- ⚙️ **后端 API**: http://localhost:5000
- 🗄️ **数据库**: localhost:5432

就是这么简单！无需任何其他配置。

---

## 📦 服务说明

| 服务名称 | 镜像 | 容器内端口 | 宿主机映射端口 | 说明 |
|---------|------|-----------|---------------|------|
| frontend | 自定义构建 (Nginx + React) | 80 | 80 | 前端生产构建 |
| backend | 自定义构建 (Python + Flask) | 5000 | 5000 | Flask 后端 API |
| postgres | postgres:16-alpine | 5432 | 5432 | PostgreSQL 数据库 |

---

## 🔧 环境变量说明

所有配置都在 `.env.docker` 文件中，可根据需要修改：

### 数据库配置

| 变量名 | 默认值 | 说明 |
|-------|--------|------|
| DB_HOST | postgres | 数据库主机名（Docker 网络内的服务名） |
| DB_PORT | 5432 | 数据库端口 |
| DB_NAME | taskmanager | 数据库名 |
| DB_USER | taskmanager | 数据库用户名 |
| DB_PASSWORD | taskmanager | 数据库密码 |

### 后端配置

| 变量名 | 默认值 | 说明 |
|-------|--------|------|
| FLASK_PORT | 5000 | Flask 服务端口 |
| FLASK_DEBUG | false | Flask 调试模式（生产环境建议关闭） |

### 前端配置

| 变量名 | 默认值 | 说明 |
|-------|--------|------|
| FRONTEND_PORT | 80 | 前端 Nginx 服务端口 |

---

## 📝 常用命令

### 基本操作

```bash
# 启动所有服务（后台运行）
docker-compose --env-file .env.docker up -d

# 查看服务运行状态
docker-compose ps

# 查看实时日志
docker-compose logs -f

# 查看单个服务日志
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

# 停止所有服务
docker-compose stop

# 停止并删除容器（保留数据卷）
docker-compose down

# 停止并删除所有（包括数据卷，慎用！）
docker-compose down -v
```

### 开发时重新构建

如果你修改了代码，需要重新构建镜像：

```bash
# 重新构建后端镜像并启动
docker-compose build backend
docker-compose --env-file .env.docker up -d

# 重新构建前端镜像并启动
docker-compose build frontend
docker-compose --env-file .env.docker up -d

# 或者一键重新构建所有服务
docker-compose build
docker-compose --env-file .env.docker up -d
```

### 进入容器内部

```bash
# 进入后端容器
docker-compose exec backend bash

# 进入数据库容器
docker-compose exec postgres psql -U taskmanager -d taskmanager
```

---

## 🗄️ 数据库相关

### 自动初始化

项目启动时，PostgreSQL 容器会自动执行 `backend/init_db.sql` 脚本，创建所需的表结构和初始数据。

### 数据持久化

数据库数据通过 Docker Volume 持久化，即使删除容器，数据也不会丢失。

### 手动连接数据库

使用任意数据库客户端连接：
- **Host**: localhost
- **Port**: 5432
- **Database**: taskmanager
- **Username**: taskmanager
- **Password**: taskmanager

或者使用命令行：
```bash
docker-compose exec postgres psql -U taskmanager -d taskmanager
```

---

## 🏗️ Dockerfile 优化说明

### 后端 Dockerfile 多阶段构建

**backend/Dockerfile** 采用两阶段构建：
1. **Builder 阶段**: 使用完整的 Python 镜像，安装 gcc 等编译工具，构建所有依赖 wheel 包
2. **运行阶段**: 使用 slim 镜像，仅安装运行时依赖

**优化效果**:
- 最终镜像大小从 ~1.2GB 降到 ~200MB
- 不包含任何构建工具，更安全
- 层次缓存，加快重复构建速度

### 前端 Dockerfile 多阶段构建

**frontend/Dockerfile** 采用两阶段构建：
1. **Builder 阶段**: 使用 Node.js 镜像，npm 安装依赖，执行生产构建
2. **运行阶段**: 使用 Nginx Alpine 镜像，仅托管静态文件

**优化效果**:
- 最终镜像大小从 ~1GB 降到 ~50MB
- Nginx 做反向代理，直接转发 `/api` 请求到后端容器
- 内置 gzip 压缩优化

---

## 🔍 常见问题

### Q: 启动后前端连接不上后端？

A: 检查后端是否完全启动：
```bash
docker-compose logs backend
```
确认看到类似 `Listening at: http://0.0.0.0:5000` 输出。

### Q: 数据库启动失败？

A: 可能是端口冲突，修改 `.env.docker` 中的 `DB_PORT` 端口：
```env
DB_PORT=5433
```

### Q: 端口 80 被占用？

A: 修改 `.env.docker` 中的 `FRONTEND_PORT`：
```env
FRONTEND_PORT=8080
```
然后访问 http://localhost:8080

### Q: 如何重置数据库？

```bash
# 停止服务并删除数据卷
docker-compose down -v

# 重新启动
docker-compose --env-file .env.docker up -d
```

---

## 💡 开发提示

1. **推荐的开发流程**:
   - 后端修改代码后执行：`docker-compose build backend && docker-compose up -d`
   - 前端修改代码后执行：`docker-compose build frontend && docker-compose up -d`

2. **本地开发（不用 Docker）**:
   - 只启动数据库：`docker-compose up -d postgres`
   - 然后本地运行 Flask 和 Vite 开发服务器

3. **第一次运行慢？**:
   - 正常！第一次构建需要下载基础镜像，后续构建都会使用缓存。

---

## 📂 目录结构

```
├── backend/
│   ├── Dockerfile          # 后端 Dockerfile
│   ├── requirements.txt    # Python 依赖（已添加 gunicorn）
│   └── ...
├── frontend/
│   ├── Dockerfile          # 前端 Dockerfile
│   ├── nginx.conf          # Nginx 配置（含 API 代理）
│   ├── vite.config.js      # Vite 配置（支持环境变量）
│   └── ...
├── docker-compose.yml      # Docker Compose 编排配置
├── .env.docker             # Docker 环境变量
└── DOCKER_GUIDE.md         # 本使用指南
```

---

**恭喜！你已经完成了环境配置，接下来就可以愉快地开发了！🎉**
