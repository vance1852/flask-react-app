# Docker 开发环境使用指南

## 概述

本项目已完成 Docker 容器化，使用 docker-compose 一键启动整个开发环境，无需手动安装 Python、Node.js、PostgreSQL 等依赖。

---

## 前置要求

安装 Docker Desktop:
- Windows: https://docs.docker.com/desktop/install/windows-install/
- macOS: https://docs.docker.com/desktop/install/mac-install/
- Linux: https://docs.docker.com/engine/install/

安装完成后确保 Docker Desktop 正在运行。

---

## 快速开始

### 1. 启动所有服务

在项目根目录执行：

```bash
docker-compose up -d
```

首次运行会自动构建镜像，需要几分钟时间。后续启动会非常快。

### 2. 访问应用

启动完成后，在浏览器中打开：

- **前端页面**: http://localhost
- **后端 API**: http://localhost:5000
- **数据库**: localhost:5432

### 3. 停止服务

```bash
docker-compose down
```

停止并删除数据卷（清空数据库）：

```bash
docker-compose down -v
```

---

## 服务详情

### PostgreSQL 数据库

| 配置项 | 值 |
|--------|----|
| 容器名称 | taskmanager-postgres |
| 镜像 | postgres:15-alpine |
| 主机端口 | 5432 |
| 容器端口 | 5432 |
| 数据库名 | taskmanager |
| 用户名 | taskmanager |
| 密码 | taskmanager |

**数据持久化**: 数据库数据存储在 Docker 命名卷 `postgres_data` 中，容器删除后数据仍然保留。

**自动初始化**: 首次启动时会自动执行 `backend/init_db.sql` 初始化表结构。

**健康检查**: 内置健康检查，确保数据库就绪后才启动后端服务。

---

### Flask 后端

| 配置项 | 值 |
|--------|----|
| 容器名称 | taskmanager-backend |
| 主机端口 | 5000 |
| 容器端口 | 5000 |

**环境变量**:

| 变量名 | 值 | 说明 |
|--------|----|------|
| DB_HOST | postgres | 数据库主机（Docker 网络内服务名） |
| DB_PORT | 5432 | 数据库端口 |
| DB_NAME | taskmanager | 数据库名 |
| DB_USER | taskmanager | 数据库用户名 |
| DB_PASSWORD | taskmanager | 数据库密码 |
| FLASK_PORT | 5000 | Flask 服务端口 |
| FLASK_DEBUG | true | 开发调试模式 |

**特性**:
- 多阶段构建，最终镜像只包含运行时依赖
- 自动等待数据库就绪后启动
- 异常自动重启

---

### React 前端

| 配置项 | 值 |
|--------|----|
| 容器名称 | taskmanager-frontend |
| 主机端口 | 80 |
| 容器端口 | 80 |

**特性**:
- 多阶段构建：第一阶段使用 Node.js 构建，第二阶段使用 nginx 部署
- 内置 API 代理，`/api` 请求自动转发到后端服务
- 支持前端路由（history 模式）
- 镜像体积小（仅几十 MB）

---

## 常用命令

### 查看服务状态

```bash
docker-compose ps
```

### 查看日志

查看所有服务日志：

```bash
docker-compose logs -f
```

查看特定服务日志：

```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### 重新构建镜像

代码变更后需要重新构建：

```bash
docker-compose build
```

或者直接启动时重新构建：

```bash
docker-compose up -d --build
```

### 进入容器

进入后端容器：

```bash
docker-compose exec backend bash
```

进入数据库容器：

```bash
docker-compose exec postgres psql -U taskmanager -d taskmanager
```

---

## 常见问题

### 1. 端口被占用

如果 80、5000 或 5432 端口被占用，可以修改 `docker-compose.yml` 中的端口映射：

```yaml
ports:
  - "8080:80"  # 前端改为 8080
  - "5001:5000"  # 后端改为 5001
  - "5433:5432"  # 数据库改为 5433
```

### 2. 后端启动失败

通常是数据库还没准备好，docker-compose 配置了健康检查和依赖关系，会自动重试。如果持续失败，查看日志：

```bash
docker-compose logs backend
```

### 3. 清理镜像和缓存

清理构建缓存和无用镜像：

```bash
docker system prune -a
```

### 4. 代码修改后不生效

如果修改了后端或前端代码，需要重新构建镜像：

```bash
docker-compose up -d --build
```

---

## 开发提示

1. **开发环境**: 本配置适用于开发环境，生产环境请另行配置
2. **热重载**: 当前配置不支持热重载，代码修改后需要重新构建
3. **密码安全**: 生产环境请修改默认数据库密码，不要提交到代码库
4. **网络**: 三个服务在同一个 Docker 网络内，通过服务名互相访问

---

## 技术说明

### 多阶段构建优势

- **后端**: 构建阶段安装 gcc 编译依赖，运行阶段只保留 libpq，镜像体积减少 80%
- **前端**: 构建阶段使用 Node.js，运行阶段只保留 nginx 和静态文件，镜像从几百 MB 降到几十 MB

### Docker 网络

三个服务都加入 `taskmanager-network` 网桥，容器之间可以通过服务名直接通信，不需要暴露端口到宿主机。
