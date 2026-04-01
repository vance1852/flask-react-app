# 第一阶段：构建阶段
FROM python:3.12-slim AS builder

WORKDIR /app

# 安装依赖
COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install --user -r requirements.txt

# 第二阶段：运行阶段
FROM python:3.12-slim

WORKDIR /app

# 从构建阶段复制已安装的依赖
COPY --from=builder /root/.local /root/.local

# 设置环境变量
ENV PATH=/root/.local/bin:$PATH
ENV PYTHONUNBUFFERED=1

# 复制应用代码
COPY . .

# 暴露端口
EXPOSE 5000

# 启动应用
CMD ["python", "app.py"]
