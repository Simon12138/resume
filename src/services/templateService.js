/**
 * 模板服务
 * 提供模板存储、管理和访问功能
 */

const fs = require('fs').promises;
const path = require('path');
const Template = require('../models/Template');

class TemplateService {
  constructor() {
    // 内置模板存储在内存中
    this.templateStorage = new Map();
    
    // AI生成的模板也存储在内存中
    this.generatedTemplateStorage = new Map();
    
    // 模板目录路径
    this.templateDir = path.join(__dirname, '../templates');
    this.vipTemplateDir = path.join(__dirname, '../templates/vip');
  }

  /**
   * 初始化内置模板
   * @returns {Promise<void>}
   */
  async initializeBuiltInTemplates() {
    try {
      // 读取普通模板目录中的所有文件
      const files = await fs.readdir(this.templateDir);
      
      // 过滤出.hbs模板文件
      const templateFiles = files.filter(file => file.endsWith('.hbs'));
      
      // 加载每个模板文件
      for (const file of templateFiles) {
        try {
          const templateId = path.basename(file, '.hbs');
          const templatePath = path.join(this.templateDir, file);
          const templateContent = await fs.readFile(templatePath, 'utf8');
          
          // 创建模板对象
          const template = new Template({
            id: templateId,
            name: this._getTemplateName(templateId),
            description: this._getTemplateDescription(templateId),
            html: templateContent,
            isAiGenerated: false
          });
          
          // 存储到内置模板中
          this.templateStorage.set(templateId, template);
        } catch (error) {
          console.error(`加载模板文件 ${file} 失败:`, error);
        }
      }
      
      console.log(`成功加载 ${this.templateStorage.size} 个内置模板`);
    } catch (error) {
      // 如果模板目录不存在，创建目录
      if (error.code === 'ENOENT') {
        try {
          await fs.mkdir(this.templateDir, { recursive: true });
          console.log('模板目录已创建');
        } catch (mkdirError) {
          console.error('创建模板目录失败:', mkdirError);
        }
      } else {
        console.error('初始化内置模板失败:', error);
      }
    }
    
    // 加载VIP模板
    try {
      const vipFiles = await fs.readdir(this.vipTemplateDir);
      const vipTemplateFiles = vipFiles.filter(file => file.endsWith('.hbs'));
      
      for (const file of vipTemplateFiles) {
        try {
          const templateId = 'vip-' + path.basename(file, '.hbs');
          const templatePath = path.join(this.vipTemplateDir, file);
          const templateContent = await fs.readFile(templatePath, 'utf8');
          
          // 创建模板对象，并标记为VIP模板
          const template = new Template({
            id: templateId,
            name: this._getTemplateName(templateId),
            description: this._getTemplateDescription(templateId),
            html: templateContent,
            isAiGenerated: false,
            isVip: true  // 标记为VIP模板
          });
          
          // 存储到内置模板中
          this.templateStorage.set(templateId, template);
        } catch (error) {
          console.error(`加载VIP模板文件 ${file} 失败:`, error);
        }
      }
      
      console.log(`成功加载 ${vipTemplateFiles.length} 个VIP模板`);
    } catch (error) {
      // 如果VIP模板目录不存在，记录日志但不报错
      if (error.code === 'ENOENT') {
        console.log('VIP模板目录不存在，跳过加载');
      } else {
        console.error('加载VIP模板失败:', error);
      }
    }
  }

  /**
   * 根据模板ID获取模板名称
   * @private
   * @param {string} templateId - 模板ID
   * @returns {string} 模板名称
   */
  _getTemplateName(templateId) {
    // 处理VIP模板名称
    if (templateId.startsWith('vip-')) {
      const baseId = templateId.substring(4);
      const nameMap = {
        'modern-elite': '现代极简风格-VIP',
        'creative-pro': '创意设计风格-VIP',
        'minimalist-premium': '极简专业风格-VIP',
        'tech-futuristic': '科技未来风格-VIP',
        'elegant-classic': '优雅经典风格-VIP',
        'modern-business': '现代商务风格-VIP',
        'creative-geek': '创意极客风格-VIP',
        'artistic-creative': '艺术创意风格-VIP',
        'minimal-bw': '极简黑白风格-VIP',
        'professional-finance': '专业金融风格-VIP',
        'business-formal-1': '商务正式型-模板1',
        'business-formal-2': '商务正式型-模板2',
        'creative-design-1': '创意设计型-模板1',
        'creative-design-2': '创意设计型-模板2',
        'hybrid-1': '混合平衡型-模板1',
        'hybrid-2': '混合平衡型-模板2',
        'minimalist-1': '极简主义型-模板1',
        'minimalist-2': '极简主义型-模板2',
        'modern-minimal-1': '现代简约型-模板1',
        'modern-minimal-2': '现代简约型-模板2',
        'skills-focused-1': '功能技能型-模板1',
        'skills-focused-2': '功能技能型-模板2',
        'timeline-1': '时间线发展型-模板1',
        'timeline-2': '时间线发展型-模板2'
      };
      return nameMap[baseId] || templateId;
    }
    
    const nameMap = {
      'business': '商务风格-模板1',
      'modern': '现代简约-模板1',
      'business-formal-1': '商务正式型-模板1',
      'business-formal-2': '商务正式型-模板2',
      'creative-design-1': '创意设计型-模板1',
      'creative-design-2': '创意设计型-模板2',
      'hybrid-1': '混合平衡型-模板1',
      'hybrid-2': '混合平衡型-模板2',
      'minimalist-1': '极简主义型-模板1',
      'minimalist-2': '极简主义型-模板2',
      'modern-minimal-1': '现代简约型-模板1',
      'modern-minimal-2': '现代简约型-模板2',
      'skills-focused-1': '功能技能型-模板1',
      'skills-focused-2': '功能技能型-模板2',
      'timeline-1': '时间线发展型-模板1',
      'timeline-2': '时间线发展型-模板2'
    };
    
    return nameMap[templateId] || templateId;
  }

  /**
   * 根据模板ID获取模板描述
   * @private
   * @param {string} templateId - 模板ID
   * @returns {string} 模板描述
   */
  _getTemplateDescription(templateId) {
    // 处理VIP模板描述
    if (templateId.startsWith('vip-')) {
      const baseId = templateId.substring(4);
      const descriptionMap = {
        'modern-elite': '现代极简风格设计，采用渐变色彩和清晰布局，适合追求现代感的用户',
        'creative-pro': '具有创意感的设计，使用动画背景和卡片式布局，适合设计类岗位',
        'minimalist-premium': '极简主义设计风格，注重内容的清晰呈现，适合各类专业人士',
        'tech-futuristic': '科技感十足的未来风格设计，使用霓虹色彩和科技元素，适合IT行业',
        'elegant-classic': '优雅经典风格，金色装饰和经典排版，适合传统行业和高级管理人员',
        'modern-business': '现代商务风格，蓝色主调和卡片式设计，适合商业人士',
        'creative-geek': '终端界面风格的创意设计，适合程序员和开发者',
        'artistic-creative': '花朵装饰和手写体的艺术创意设计，适合设计类岗位',
        'minimal-bw': '简洁的黑白设计，突出内容本身，适合极简主义爱好者',
        'professional-finance': '深蓝金色调的专业金融风格，适合金融行业',
        'business-formal-1': '经典商务正式风格，适合金融、法律等传统行业',
        'business-formal-2': '现代商务正式风格，布局清晰，适合各类商务场合',
        'creative-design-1': '富有创意的设计风格，适合设计师、艺术家等创意行业',
        'creative-design-2': '色彩丰富的创意设计，突出个性和创造力',
        'hybrid-1': '结合时间线和功能型的混合布局，适合展示完整职业发展',
        'hybrid-2': '现代混合型设计，平衡了技能和职业经历的展示',
        'minimalist-1': '极简主义设计，突出关键信息，减少视觉干扰',
        'minimalist-2': '干净简洁的极简风格，适合追求简约的用户',
        'modern-minimal-1': '现代简约风格，注重空间布局和视觉层次',
        'modern-minimal-2': '时尚现代设计，结合简约元素，适合年轻专业人士',
        'skills-focused-1': '以技能为中心的设计，突出专业技能和能力',
        'skills-focused-2': '功能型简历模板，适合转行或技能导向的求职者',
        'timeline-1': '时间线布局设计，清晰展示职业发展轨迹',
        'timeline-2': '创新时间线设计，适合展示连续的职业发展历程'
      };
      return descriptionMap[baseId] || 'VIP简历模板';
    }
    
    const descriptionMap = {
      'business': '适用于商务场合的正式简历模板，采用深蓝色调，布局清晰',
      'modern': '现代简约风格，设计简洁大方，适合各类求职者',
      'creative': '富有创意的设计，适合设计类岗位求职者',
      'professional': '专业版简历模板，突出专业技能和项目经验',
      'minimalist': '极简风格设计，内容重点突出，阅读体验佳',
      'executive': '适用于高级管理人员的简历模板，彰显专业与权威',
      'business-formal-1': '经典商务正式风格，适合金融、法律等传统行业',
      'business-formal-2': '现代商务正式风格，布局清晰，适合各类商务场合',
      'creative-design-1': '富有创意的设计风格，适合设计师、艺术家等创意行业',
      'creative-design-2': '色彩丰富的创意设计，突出个性和创造力',
      'hybrid-1': '结合时间线和功能型的混合布局，适合展示完整职业发展',
      'hybrid-2': '现代混合型设计，平衡了技能和职业经历的展示',
      'minimalist-1': '极简主义设计，突出关键信息，减少视觉干扰',
      'minimalist-2': '干净简洁的极简风格，适合追求简约的用户',
      'modern-minimal-1': '现代简约风格，注重空间布局和视觉层次',
      'modern-minimal-2': '时尚现代设计，结合简约元素，适合年轻专业人士',
      'skills-focused-1': '以技能为中心的设计，突出专业技能和能力',
      'skills-focused-2': '功能型简历模板，适合转行或技能导向的求职者',
      'timeline-1': '时间线布局设计，清晰展示职业发展轨迹',
      'timeline-2': '创新时间线设计，适合展示连续的职业发展历程'
    };
    
    return descriptionMap[templateId] || '简历模板';
  }

  /**
   * 获取所有模板列表
   * @returns {Array} 模板预览数据数组
   */
  getAllTemplates() {
    const templates = [];
    
    // 添加内置模板
    for (const template of this.templateStorage.values()) {
      templates.push(template.getPreviewData());
    }
    
    // 添加AI生成的模板
    for (const template of this.generatedTemplateStorage.values()) {
      templates.push(template.getPreviewData());
    }
    
    // 按创建时间排序
    templates.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    return templates;
  }

  /**
   * 根据ID获取模板
   * @param {string} id - 模板ID
   * @returns {Template|null} 模板对象或null
   */
  getTemplateById(id) {
    // 先在内置模板中查找
    let template = this.templateStorage.get(id);
    
    // 如果没找到，再在AI生成模板中查找
    if (!template) {
      template = this.generatedTemplateStorage.get(id);
    }
    
    return template || null;
  }

  /**
   * 创建新模板
   * @param {Object} templateData - 模板数据
   * @param {boolean} isAiGenerated - 是否为AI生成
   * @returns {Object} 结果对象
   */
  createTemplate(templateData, isAiGenerated = false) {
    try {
      // 创建模板对象
      const template = new Template({
        ...templateData,
        isAiGenerated: isAiGenerated
      });
      
      // 验证模板数据
      const validation = template.validate();
      if (!validation.isValid) {
        return {
          success: false,
          message: '模板数据验证失败',
          errors: validation.errors
        };
      }
      
      // 存储模板
      if (isAiGenerated) {
        this.generatedTemplateStorage.set(template.id, template);
      } else {
        this.templateStorage.set(template.id, template);
      }
      
      return {
        success: true,
        message: '模板创建成功',
        data: {
          id: template.id
        }
      };
    } catch (error) {
      console.error('创建模板失败:', error);
      return {
        success: false,
        message: '创建模板失败: ' + error.message
      };
    }
  }

  /**
   * 更新模板
   * @param {string} id - 模板ID
   * @param {Object} updateData - 更新数据
   * @returns {Object} 结果对象
   */
  updateTemplate(id, updateData) {
    try {
      // 查找模板
      let template = this.templateStorage.get(id);
      let isGenerated = false;
      
      if (!template) {
        template = this.generatedTemplateStorage.get(id);
        isGenerated = true;
      }
      
      if (!template) {
        return {
          success: false,
          message: '模板不存在'
        };
      }
      
      // 更新模板数据
      Object.assign(template, updateData);
      
      // 验证更新后的数据
      const validation = template.validate();
      if (!validation.isValid) {
        return {
          success: false,
          message: '模板数据验证失败',
          errors: validation.errors
        };
      }
      
      // 重新存储模板
      if (isGenerated) {
        this.generatedTemplateStorage.set(id, template);
      } else {
        this.templateStorage.set(id, template);
      }
      
      return {
        success: true,
        message: '模板更新成功'
      };
    } catch (error) {
      console.error('更新模板失败:', error);
      return {
        success: false,
        message: '更新模板失败: ' + error.message
      };
    }
  }

  /**
   * 删除模板
   * @param {string} id - 模板ID
   * @returns {Object} 结果对象
   */
  deleteTemplate(id) {
    try {
      // 不能删除内置模板
      if (this.templateStorage.has(id)) {
        return {
          success: false,
          message: '不能删除内置模板'
        };
      }
      
      // 删除AI生成的模板
      const deleted = this.generatedTemplateStorage.delete(id);
      
      if (deleted) {
        return {
          success: true,
          message: '模板删除成功'
        };
      } else {
        return {
          success: false,
          message: '模板不存在'
        };
      }
    } catch (error) {
      console.error('删除模板失败:', error);
      return {
        success: false,
        message: '删除模板失败: ' + error.message
      };
    }
  }

  /**
   * 保存AI生成的模板到文件系统
   * @param {Template} template - 模板对象
   * @returns {Promise<Object>} 结果对象
   */
  async saveGeneratedTemplateToFile(template) {
    try {
      // 确保目录存在
      await fs.mkdir(this.templateDir, { recursive: true });
      
      // 生成文件路径
      const fileName = `${template.id}.hbs`;
      const filePath = path.join(this.templateDir, fileName);
      
      // 保存模板内容到文件
      await fs.writeFile(filePath, template.html, 'utf8');
      
      return {
        success: true,
        message: '模板文件保存成功'
      };
    } catch (error) {
      console.error('保存模板文件失败:', error);
      return {
        success: false,
        message: '保存模板文件失败: ' + error.message
      };
    }
  }
}

module.exports = new TemplateService();
