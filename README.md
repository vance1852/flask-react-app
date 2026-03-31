# 任务管理器 — Flask + React + PostgreSQL

一个带分类功能的全栈任务管理应用，后端 Flask，前端 React，数据库 PostgreSQL。

## 项目结构

```
flask-react-app/
├── backend/
│   ├── app.py              # Flask API 服务
│   ├── config.py           # 环境变量配置
│   ├── requirements.txt    # Python 依赖
│   ├── init_db.sql         # 建表 + 种子数据
│   └── .env.example        # 环境变量示例
├── frontend/
│   ├── src/
│   │   ├── components/     # React 组件
│   │   ├── api/            # API 请求封装
│   │   ├── App.jsx         # 根组件
│   │   ├── App.css         # 样式
│   │   └── main.jsx        # 入口
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

## 环境要求

- Python 3.9+
- Node.js 18+
- PostgreSQL 14+

## 启动步骤

### 1. 数据库

创建 PostgreSQL 数据库和用户：

```sql
CREATE USER taskmanager WITH PASSWORD 'taskmanager';
CREATE DATABASE taskmanager OWNER taskmanager;
```

初始化表结构和种子数据：

```bash
psql -U taskmanager -d taskmanager -f backend/init_db.sql
```

### 2. 后端

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env       # 按需修改数据库连接信息
python app.py
```

API 服务启动在 `http://localhost:5000`。

### 3. 前端

```bash
cd frontend
npm install
npm run dev
```

开发服务器启动在 `http://localhost:5173`，API 请求会代理到后端。

## 接口列表

| 方法   | 路径            | 说明                              |
| ------ | --------------- | --------------------------------- |
| GET    | /api/tasks      | 获取任务列表（可选 `?category=`） |
| POST   | /api/tasks      | 创建任务                          |
| PUT    | /api/tasks/:id  | 更新任务                          |
| DELETE | /api/tasks/:id  | 删除任务                          |
| GET    | /api/categories | 获取所有分类                      |
| POST   | /api/categories | 创建分类                          |
| GET    | /api/health     | 健康检查                          |

## 环境变量

| 变量        | 默认值      | 说明             |
| ----------- | ----------- | ---------------- |
| DB_HOST     | localhost   | PostgreSQL 地址  |
| DB_PORT     | 5432        | PostgreSQL 端口  |
| DB_NAME     | taskmanager | 数据库名         |
| DB_USER     | taskmanager | 数据库用户       |
| DB_PASSWORD | taskmanager | 数据库密码       |
| FLASK_PORT  | 5000        | Flask 服务端口   |
| FLASK_DEBUG | true        | 是否开启调试模式 |
