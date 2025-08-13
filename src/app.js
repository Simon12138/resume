const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const session = require('express-session');
const fileUpload = require('express-fileupload');

// 加载环境变量
dotenv.config();

// 路由模块
const indexRouter = require('./routes/index');
const resumeRouter = require('./routes/resume');
const apiRouter = require('./routes/api');
const templatesRouter = require('./routes/templates');
const registerRouter = require('./routes/register');

// 服务模块
const templateService = require('./services/templateService');
const pdfService = require('./services/pdfService');

// 创建Express应用
const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 }, // 限制文件大小为50MB
}));

// 会话中间件
app.use(session({
  secret: process.env.SESSION_SECRET || 'resume_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, // 在生产环境中使用 HTTPS 时设置为 true
    maxAge: 24 * 60 * 60 * 1000 // 24小时
  }
}));

// 静态资源目录
app.use(express.static(path.join(__dirname, '../public')));
app.use('/mock', express.static(path.join(__dirname, '../src/mock')));

// 日志中间件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// 登录验证中间件
const requireAuth = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  res.redirect('/login');
};

// 初始化模板服务
templateService.initializeBuiltInTemplates()
  .then(() => {
    console.log('模板服务初始化完成');
  })
  .catch(error => {
    console.error('模板服务初始化失败:', error);
  });

// 路由
app.use('/', indexRouter);
app.use('/resume', resumeRouter); // 移除 requireAuth 中间件，允许未登录用户访问
app.use('/api', apiRouter);
app.use('/api/templates', templatesRouter);
app.use('/', registerRouter);

// 404处理
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: '接口不存在'
  });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false,
    message: '服务器内部错误'
  });
});

// 启动服务器
const server = app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
  console.log(`访问地址: http://localhost:${PORT}`);
});

// 优雅关闭
process.on('SIGINT', async () => {
  console.log('正在关闭服务器...');
  
  // 关闭PDF服务浏览器实例
  try {
    await pdfService.closeBrowser();
    console.log('PDF服务已关闭');
  } catch (error) {
    console.error('关闭PDF服务失败:', error);
  }
  
  server.close(() => {
    console.log('服务器已关闭');
    process.exit(0);
  });
});

module.exports = app;
