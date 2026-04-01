# 第一阶段：构建阶段
FROM node:20-alpine AS builder

WORKDIR /app

# 复制 package.json（不复制 package-lock.json）
COPY package.json ./

# 安装依赖（使用官方 npm 源，不使用 lockfile）
RUN npm config set registry https://registry.npmjs.org/ && \
    npm install --legacy-peer-deps --no-package-lock

# 复制源代码
COPY . .

# 构建生产版本
RUN npm run build

# 第二阶段：运行阶段（使用 nginx 提供静态文件）
FROM nginx:alpine

# 复制构建产物到 nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 80

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]
