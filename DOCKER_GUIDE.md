# Docker 开发环境快速指南

## 快速开始

一行命令启动所有服务：

```bash
docker-compose up -d
```

然后在浏览器访问：http://localhost

## 前置要求

确保已安装以下工具：

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows/macOS)
- 或 Docker Engine + Docker Compose (Linux)

## 快速启动

### 1. 启动所有服务

在项目根目录下执行：

```bash
docker-compose up -d
```

这个命令会：
- 启动 PostgreSQL 数据库
- 启动 Flask 后端 API 服务
- 启动 React 前端应用

首次启动需要构建镜像，需要等待几分钟。

### 2. 访问应用

服务启动后，访问以下地址：

| 服务 | 地址 | 说明 |
|------|------|------|
| 前端应用 | http://localhost | 任务管理应用界面 |
| 后端 API | http://localhost:5000 | Flask API 服务 |
| 健康检查 | http://localhost:5000/api/health | 检查服务状态 |

## 常用命令

### 查看服务状态

```bash
docker-compose ps
```

### 查看日志

```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

### 停止服务

```bash
# 停止所有服务但保留数据
docker-compose stop

# 停止并删除容器（保留数据卷）
docker-compose down

# 停止并删除容器和数据卷（清空数据库）
docker-compose down -v
```

### 重新构建镜像

修改代码后需要重新构建：

```bash
# 重新构建并启动
docker-compose up -d --build

# 只重新构建特定服务
docker-compose build backend
docker-compose up -d backend
```

## 服务详情

### PostgreSQL 数据库

| 配置项 | 值 |
|--------|-----|
| 镜像 | postgres:15-alpine |
| 容器名 | taskmanager-db |
| 主机端口 | 5432 |
| 容器端口 | 5432 |
| 数据库名 | taskmanager |
| 用户名 | taskmanager |
| 密码 | taskmanager |
| 数据卷 | postgres_data |

**数据持久化**：数据库数据保存在 Docker volume `postgres_data` 中，即使删除容器数据也不会丢失。

### Flask 后端

| 配置项 | 值 |
|--------|-----|
| 容器名 | taskmanager-backend |
| 主机端口 | 5000 |
| 容器端口 | 5000 |
| 构建上下文 | ./backend |

**环境变量**：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| DB_HOST | db | 数据库主机名（Docker 网络内） |
| DB_PORT | 5432 | 数据库端口 |
| DB_NAME | taskmanager | 数据库名 |
| DB_USER | taskmanager | 数据库用户名 |
| DB_PASSWORD | taskmanager | 数据库密码 |
| FLASK_PORT | 5000 | Flask 服务端口 |
| FLASK_DEBUG | true | 调试模式 |

### React 前端

| 配置项 | 值 |
|--------|-----|
| 容器名 | taskmanager-frontend |
| 主机端口 | 80 |
| 容器端口 | 80 |
| 构建上下文 | ./frontend |
| Web 服务器 | nginx:alpine |

**nginx 配置**：
- 静态文件服务：`/usr/share/nginx/html`
- API 代理：`/api` → `http://backend:5000`
- 前端路由支持：所有路由重定向到 `index.html`

## 开发说明

### 后端开发

由于 Docker 容器运行的是构建好的代码，修改后端代码后需要：

```bash
# 重新构建并启动后端
docker-compose up -d --build backend
```

或者，如果希望更高效的开发体验，可以单独在本地运行后端服务（仅使用 Docker 运行数据库）。

### 前端开发

同样，修改前端代码后需要重新构建：

```bash
# 重新构建并启动前端
docker-compose up -d --build frontend
```

## 故障排除

### 端口被占用

如果遇到端口被占用的错误，可以修改 `docker-compose.yml` 中的端口映射：

```yaml
ports:
  - "5001:5000"  # 将主机端口改为 5001
```

### 数据库连接失败

检查数据库容器是否健康：

```bash
docker-compose ps
```

如果数据库未就绪，等待几秒钟后重试。

### 查看详细日志

```bash
docker-compose logs db
docker-compose logs backend
```

### 完全重置

如果需要完全重置环境（清空所有数据）：

```bash
docker-compose down -v
docker-compose up -d --build
```

## 项目结构（新增 Docker 相关文件）

```
flask-react-app/
├── backend/
│   ├── Dockerfile          # 后端 Dockerfile
│   ├── .dockerignore       # 后端构建忽略文件
│   └── ...
├── frontend/
│   ├── Dockerfile          # 前端 Dockerfile
│   ├── nginx.conf          # nginx 配置
│   ├── .dockerignore       # 前端构建忽略文件
│   └── ...
├── docker-compose.yml      # Docker Compose 配置
├── DOCKER_GUIDE.md         # 本文档
└── README.md
```
