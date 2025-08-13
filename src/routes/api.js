const express = require('express');
const router = express.Router();
const resumeService = require('../services/resumeService');
const templateService = require('../services/templateService');
const qwenService = require('../services/qwenService');
const renderService = require('../services/renderService');
const pdfService = require('../services/pdfService');
const userService = require('../services/userService');
const pdfParseService = require('../services/pdfParseService');

// 创建简历
router.post('/resume', (req, res) => {
  try {
    const resumeData = req.body;
    
    // 调用简历服务创建简历
    const result = resumeService.createResume(resumeData);
    
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('创建简历失败:', error);
    res.status(500).json({
      success: false,
      message: '创建简历失败'
    });
  }
});

// 获取简历
router.get('/resume/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    // 调用简历服务获取简历
    const result = resumeService.getResume(id);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    console.error('获取简历失败:', error);
    res.status(500).json({
      success: false,
      message: '获取简历失败'
    });
  }
});

// 更新简历
router.put('/resume/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // 调用简历服务更新简历
    const result = resumeService.updateResume(id, updateData);
    
    if (result.success) {
      res.json(result);
    } else {
      // 根据错误类型返回相应状态码
      if (result.message === '简历不存在') {
        res.status(404).json(result);
      } else {
        res.status(400).json(result);
      }
    }
  } catch (error) {
    console.error('更新简历失败:', error);
    res.status(500).json({
      success: false,
      message: '更新简历失败'
    });
  }
});

// 删除简历
router.delete('/resume/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    // 调用简历服务删除简历
    const result = resumeService.deleteResume(id);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    console.error('删除简历失败:', error);
    res.status(500).json({
      success: false,
      message: '删除简历失败'
    });
  }
});

// 渲染简历接口
router.post('/resume/render', (req, res) => {
  try {
    const { templateId, data } = req.body;
    
    if (!templateId) {
      return res.status(400).json({
        success: false,
        message: '请提供模板ID'
      });
    }
    
    if (!data) {
      return res.status(400).json({
        success: false,
        message: '请提供简历数据'
      });
    }
    
    // 获取模板
    const template = templateService.getTemplateById(templateId);
    if (!template) {
      return res.status(404).json({
        success: false,
        message: '模板不存在'
      });
    }
    
    // 渲染简历
    const renderResult = renderService.renderResume(template, data);
    if (!renderResult.success) {
      return res.status(500).json({
        success: false,
        message: '渲染简历失败: ' + renderResult.message
      });
    }
    
    res.json({
      success: true,
      data: {
        html: renderResult.data.html
      }
    });
  } catch (error) {
    console.error('渲染简历失败:', error);
    res.status(500).json({
      success: false,
      message: '渲染简历失败: ' + error.message
    });
  }
});

// 解析非结构化文本简历
router.post('/resume/parse', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        success: false,
        message: '请提供有效的简历文本内容'
      });
    }
    
    // 调用通义千问服务解析文本
    const parsedData = await qwenService.parseResumeText(text);

    res.json({
      success: true,
      message: '简历解析成功',
      data: parsedData  // 直接返回解析的数据，而不是包装在resumeData中
    });
  } catch (error) {
    console.error('解析简历失败:', error);
    res.status(500).json({
      success: false,
      message: '简历解析失败: ' + error.message
    });
  }
});

// 解析PDF简历接口
router.post('/resume/parse-pdf', async (req, res) => {
  try {
    if (!req.files || !req.files.pdf) {
      return res.status(400).json({
        success: false,
        message: '请上传PDF文件'
      });
    }

    const pdfFile = req.files.pdf;
    
    // 检查文件类型
    if (pdfFile.mimetype !== 'application/pdf') {
      return res.status(400).json({
        success: false,
        message: '请上传有效的PDF文件'
      });
    }
    
    // 解析PDF文本
    const parseResult = await pdfParseService.extractText(pdfFile.data);
    
    if (parseResult.success) {
      res.json({
        success: true,
        message: 'PDF解析成功',
        text: parseResult.data
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'PDF解析失败: ' + parseResult.message
      });
    }
  } catch (error) {
    console.error('解析PDF简历失败:', error);
    res.status(500).json({
      success: false,
      message: '解析PDF简历失败: ' + error.message
    });
  }
});

// 优化简历文案（全局接口，不依赖特定简历ID）
router.post('/resume/optimize', async (req, res) => {
  try {
    const { text, prompt, jd } = req.body;
    
    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        success: false,
        message: '请提供需要优化的内容'
      });
    }
    
    // 构建优化上下文
    let context = prompt || '请优化这份简历，使其更加专业、简洁、有吸引力，突出技能和成就。';
    
    // 如果提供了JD信息，则添加到上下文中
    if (jd && typeof jd === 'string') {
      context += `\n\n职位描述信息：\n${jd}`;
    }
    
    // 调用通义千问服务优化内容
    const optimizedContent = await qwenService.optimizeContent(text, context);
    
    res.json({
      success: true,
      message: '内容优化成功',
      data: {
        optimizedText: optimizedContent
      }
    });
  } catch (error) {
    console.error('优化简历文案失败:', error);
    res.status(500).json({
      success: false,
      message: '内容优化失败: ' + error.message
    });
  }
});

// 生成PDF接口
router.post('/resume/generate-pdf', async (req, res) => {
  try {
    const { templateId, data } = req.body;
    
    if (!templateId) {
      return res.status(400).json({
        success: false,
        message: '请提供模板ID'
      });
    }
    
    if (!data) {
      return res.status(400).json({
        success: false,
        message: '请提供简历数据'
      });
    }
    
    // 获取模板
    const template = templateService.getTemplateById(templateId);
    if (!template) {
      return res.status(404).json({
        success: false,
        message: '模板不存在'
      });
    }
    
    // 渲染简历
    const renderResult = renderService.renderResume(template, data);
    if (!renderResult.success) {
      return res.status(500).json({
        success: false,
        message: '渲染简历失败: ' + renderResult.message
      });
    }
    
    // 构建完整的HTML页面（与预览保持一致）
    const fullHTML = `
      <!DOCTYPE html>
      <html lang="zh-CN">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>简历预览</title>
        <style>
          body {
            margin: 0;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          }
        </style>
      </head>
      <body>
        ${renderResult.data.html}
      </body>
      </html>
    `;
    
    // 生成PDF
    const pdfResult = await pdfService.generatePDF(fullHTML);
    if (!pdfResult.success) {
      return res.status(500).json({
        success: false,
        message: '生成PDF失败: ' + pdfResult.message
      });
    }
    
    // 设置响应头
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename*=UTF-8\'\'' + encodeURIComponent('简历.pdf'));
    
    // 发送PDF数据
    res.send(pdfResult.data.buffer);
  } catch (error) {
    console.error('生成PDF失败:', error);
    res.status(500).json({
      success: false,
      message: '生成PDF失败: ' + error.message
    });
  }
});

// 优化特定简历内容
router.post('/resume/:id/optimize', async (req, res) => {
  try {
    const { id } = req.params;
    const { content, context } = req.body;
    
    // 获取现有简历数据作为上下文
    const resumeResult = resumeService.getResume(id);
    if (!resumeResult.success) {
      return res.status(404).json({
        success: false,
        message: '简历不存在'
      });
    }
    
    if (!content || typeof content !== 'string') {
      return res.status(400).json({
        success: false,
        message: '请提供需要优化的内容'
      });
    }
    
    // 调用通义千问服务优化内容
    const optimizedContent = await qwenService.optimizeContent(content, context || '');
    
    res.json({
      success: true,
      message: '内容优化成功',
      data: {
        optimizedText: optimizedContent
      }
    });
  } catch (error) {
    console.error('优化简历文案失败:', error);
    res.status(500).json({
      success: false,
      message: '内容优化失败: ' + error.message
    });
  }
});

// 生成简历HTML
router.post('/resume/:resumeId/generate', (req, res) => {
  try {
    const { resumeId } = req.params;
    const { templateId } = req.body;
    
    if (!templateId) {
      return res.status(400).json({
        success: false,
        message: '请提供模板ID'
      });
    }
    
    // 获取简历数据
    const resumeResult = resumeService.getResume(resumeId);
    if (!resumeResult.success) {
      return res.status(404).json({
        success: false,
        message: '简历不存在'
      });
    }
    
    // 获取模板
    const template = templateService.getTemplateById(templateId);
    if (!template) {
      return res.status(404).json({
        success: false,
        message: '模板不存在'
      });
    }
    
    // 渲染简历
    const html = renderService.renderResume(template, {...resumeResult.data, id: resumeId});
    
    if (!html.success) {
      return res.json(html);
    }
    
    // 生成唯一ID用于预览和下载
    const generatedResult = renderService.generateAndStoreResume({...resumeResult.data, id: resumeId}, template);
    const generatedId = generatedResult.data.generatedId;
    
    res.json({
      success: true,
      message: '简历生成成功',
      data: {
        generatedId: generatedId
      }
    });
  } catch (error) {
    console.error('生成简历失败:', error);
    res.status(500).json({
      success: false,
      message: '生成简历失败: ' + error.message
    });
  }
});

// 获取模板预览内容
router.get('/templates/:id/preview', (req, res) => {
  try {
    const { id } = req.params;
    
    // 获取模板
    const template = templateService.getTemplateById(id);
    if (!template) {
      return res.status(404).json({
        success: false,
        message: '模板不存在'
      });
    }
    
    res.json({
      success: true,
      data: {
        html: template.html
      }
    });
  } catch (error) {
    console.error('获取模板预览失败:', error);
    res.status(500).json({
      success: false,
      message: '获取模板预览失败: ' + error.message
    });
  }
});

// 获取带模拟数据的模板预览内容
router.get('/templates/:id/preview-with-data', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 获取模板
    const template = templateService.getTemplateById(id);
    if (!template) {
      return res.status(404).json({
        success: false,
        message: '模板不存在'
      });
    }
    
    // 获取模拟数据
    const fs = require('fs');
    const path = require('path');
    const mockDataPath = path.join(__dirname, '../mock/resume.json');
    const mockData = JSON.parse(fs.readFileSync(mockDataPath, 'utf8'));
    
    // 渲染模板
    const renderResult = renderService.renderResume(template, mockData);
    if (!renderResult.success) {
      return res.status(500).json({
        success: false,
        message: '渲染模板失败: ' + renderResult.message
      });
    }
    
    res.json({
      success: true,
      data: {
        html: renderResult.data.html
      }
    });
  } catch (error) {
    console.error('获取模板预览失败:', error);
    res.status(500).json({
      success: false,
      message: '获取模板预览失败: ' + error.message
    });
  }
});

// 预览生成的简历
router.get('/resume/:resumeId/preview/:generatedId', (req, res) => {
  try {
    const { generatedId } = req.params;
    
    // 获取生成的简历
    const generatedResult = renderService.getGeneratedResume(generatedId);
    if (!generatedResult.success) {
      return res.status(404).json({
        success: false,
        message: '生成的简历不存在'
      });
    }
    
    res.send(generatedResult.data);
  } catch (error) {
    console.error('预览简历失败:', error);
    res.status(500).json({
      success: false,
      message: '预览简历失败: ' + error.message
    });
  }
});

// 下载简历PDF
router.get('/resume/:resumeId/download/:generatedId', async (req, res) => {
  try {
    const { resumeId, generatedId } = req.params;
    
    // 获取生成的简历
    const generatedResult = renderService.getGeneratedResume(generatedId);
    if (!generatedResult.success) {
      return res.status(404).json({
        success: false,
        message: '生成的简历不存在'
      });
    }
    
    const generatedResume = generatedResult.data;
    
    // 获取简历数据
    const resumeResult = resumeService.getResume(resumeId);
    if (!resumeResult.success) {
      return res.status(404).json({
        success: false,
        message: '简历不存在'
      });
    }
    
    // 获取模板
    const template = templateService.getTemplateById(generatedResume.templateId);
    if (!template) {
      return res.status(404).json({
        success: false,
        message: '模板不存在'
      });
    }
    
    // 生成PDF
    const pdfResult = await pdfService.generateResumePDF(resumeResult.data, template);
    
    if (!pdfResult.success) {
      return res.status(500).json(pdfResult);
    }
    
    // 设置响应头
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(pdfResult.data.filename)}"`);
    
    // 发送PDF数据
    res.send(pdfResult.data.buffer);
  } catch (error) {
    console.error('下载PDF失败:', error);
    res.status(500).json({
      success: false,
      message: '下载PDF失败: ' + error.message
    });
  }
});

// 用户注册API
router.post('/register', async (req, res) => {
  try {
    const { username, phone, password } = req.body;
    
    // 基本验证
    if (!username || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: '用户名、手机号和密码都是必填项'
      });
    }
    
    // 简单的手机号验证
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: '手机号格式不正确'
      });
    }
    
    // 密码长度验证
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: '密码长度不能少于6位'
      });
    }
    
    // 创建用户（所有新用户默认都是非VIP用户）
    const user = await userService.createUser({ username, phone, password });
    
    res.json({
      success: true,
      message: '注册成功',
      data: user
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || '注册失败'
    });
  }
});

// 用户登录API
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // 基本验证
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: '用户名和密码都是必填项'
      });
    }

    // 验证用户
    const user = await userService.validateUser(username, password);
    
    console.log('user login: ', user)

    if (user) {
      // 将用户信息存储在会话中
      req.session.user = user;
      
      res.json({
        success: true,
        message: '登录成功',
        data: user
      });
    } else {
      res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '登录过程中发生错误'
    });
  }
});

// 更新用户下载次数API
router.post('/user/update-download-count', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: '用户ID是必填项'
      });
    }
    
    // 读取所有用户
    const users = await userService.getAllUsers();
    
    // 查找目标用户
    const userIndex = users.findIndex(user => user.id === userId);
    
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }
    
    // 更新下载次数
    const user = users[userIndex];
    if (!user.downloadCount) {
      user.downloadCount = 3; // 如果之前没有设置，默认为3次
    }
    
    // 检查用户是否还有下载次数
    if (user.downloadCount <= 0) {
      return res.status(400).json({
        success: false,
        message: '您的下载次数已用完，请升级为VIP用户以获得无限下载次数'
      });
    }
    
    // 减少下载次数
    user.downloadCount -= 1;
    
    // 保存更新后的用户数据
    await userService._writeUsers(users);
    
    // 返回更新后的用户信息（不包含密码）
    const { password, ...userWithoutPassword } = user;
    
    res.json({
      success: true,
      message: '下载次数更新成功',
      data: userWithoutPassword
    });
  } catch (error) {
    console.error('更新下载次数失败:', error);
    res.status(500).json({
      success: false,
      message: '更新下载次数失败: ' + error.message
    });
  }
});

module.exports = router;
