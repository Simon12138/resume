const express = require('express');
const router = express.Router();
const aiTemplateService = require('../services/aiTemplateService');
const templateService = require('../services/templateService');

// 获取模板列表
router.get('/', (req, res) => {
  try {
    const templates = templateService.getAllTemplates();
    
    res.json({
      success: true,
      data: templates
    });
  } catch (error) {
    console.error('获取模板列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取模板列表失败'
    });
  }
});

// 获取模板详情
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const template = templateService.getTemplateById(id);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: '模板不存在'
      });
    }
    
    res.json({
      success: true,
      data: template.toObject()
    });
  } catch (error) {
    console.error('获取模板详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取模板详情失败'
    });
  }
});

// AI生成模板
router.post('/generate', async (req, res) => {
  try {
    const { description } = req.body;
    
    if (!description) {
      return res.status(400).json({
        success: false,
        message: '请提供模板描述'
      });
    }
    
    // 调用AI服务生成模板
    const template = await aiTemplateService.generateTemplate(description);
    
    // 使用模板服务创建模板
    const result = templateService.createTemplate(template, true);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.json({
      success: true,
      message: '模板生成成功',
      data: {
        id: template.id
      }
    });
  } catch (error) {
    console.error('生成模板失败:', error);
    res.status(500).json({
      success: false,
      message: '生成模板失败: ' + error.message
    });
  }
});

// 创建新模板
router.post('/', (req, res) => {
  try {
    const templateData = req.body;
    
    // 使用模板服务创建模板
    const result = templateService.createTemplate(templateData, false);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.status(201).json(result);
  } catch (error) {
    console.error('创建模板失败:', error);
    res.status(500).json({
      success: false,
      message: '创建模板失败: ' + error.message
    });
  }
});

// 更新模板
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // 使用模板服务更新模板
    const result = templateService.updateTemplate(id, updateData);
    
    if (!result.success) {
      // 根据错误类型返回相应状态码
      if (result.message === '模板不存在') {
        return res.status(404).json(result);
      } else {
        return res.status(400).json(result);
      }
    }
    
    res.json(result);
  } catch (error) {
    console.error('更新模板失败:', error);
    res.status(500).json({
      success: false,
      message: '更新模板失败: ' + error.message
    });
  }
});

// 删除模板
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    // 使用模板服务删除模板
    const result = templateService.deleteTemplate(id);
    
    if (!result.success) {
      // 根据错误类型返回相应状态码
      if (result.message === '模板不存在') {
        return res.status(404).json(result);
      } else {
        return res.status(400).json(result);
      }
    }
    
    res.json(result);
  } catch (error) {
    console.error('删除模板失败:', error);
    res.status(500).json({
      success: false,
      message: '删除模板失败: ' + error.message
    });
  }
});

module.exports = router;
