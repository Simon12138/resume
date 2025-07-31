# 简历智能助手

## 项目简介

基于Node.js和通义千问大模型的简历智能助手，帮助用户快速创建高质量的简历。系统提供用户信息输入、AI优化、模板选择、智能填充、预览和下载等功能。

## 功能特性

- 简历信息输入：用户可以输入简历相关信息
- AI优化：通过通义千问大模型优化简历内容
- 模板选择：提供多种简历模板供用户选择
- 智能填充：根据用户信息自动填充模板
- 预览功能：在线预览生成的简历
- PDF导出：支持将简历导出为PDF格式

## 技术栈

- 后端：Node.js + Express
- AI服务：通义千问大模型
- 模板引擎：Handlebars
- PDF生成：Puppeteer
- 前端：HTML/CSS/JavaScript

## 安装与运行

### 环境要求

- Node.js >= 14.x
- npm >= 6.x

### 安装依赖

```bash
npm install
```

### 运行项目

```bash
npm start
```

### 开发模式运行

```bash
npm run dev
```

## 项目结构

```
resume/
├── src/                  # 源代码目录
│   ├── controllers/      # 控制器
│   ├── models/          # 数据模型
│   ├── routes/          # 路由
│   ├── services/        # 业务逻辑
│   ├── templates/       # 简历模板
│   ├── utils/           # 工具函数
│   └── app.js           # 入口文件
├── public/              # 静态资源目录
│   ├── css/             # 样式文件
│   ├── js/              # JavaScript文件
│   └── assets/          # 其他资源
├── tests/               # 测试文件
├── package.json         # 项目配置文件
└── README.md            # 项目说明文档
```

## 环境变量

项目需要配置以下环境变量：

- `PORT`: 服务端口，默认为3000
- `QWEN_API_KEY`: 通义千问API密钥

## 许可证

MIT
