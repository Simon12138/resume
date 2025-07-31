/**
 * 内容渲染服务
 * 实现简历数据与模板的渲染和生成功能
 */

const Handlebars = require('handlebars');

class RenderService {
  constructor() {
    this.generatedStorage = new Map();
    
    // 注册Handlebars助手
    this._registerHelpers();
  }

  /**
   * 注册Handlebars助手
   * @private
   */
  _registerHelpers() {
    // 日期格式化助手
    Handlebars.registerHelper('formatDate', (date) => {
      if (!date) return '';
      return new Date(date).toLocaleDateString('zh-CN');
    });
    
    // 日期范围格式化助手
    Handlebars.registerHelper('dateRange', (start, end) => {
      if (!start && !end) return '';
      const startDate = start ? new Date(start).toLocaleDateString('zh-CN') : '至今';
      const endDate = end ? new Date(end).toLocaleDateString('zh-CN') : '至今';
      return `${startDate} - ${endDate}`;
    });
    
    // 随机数助手
    Handlebars.registerHelper('random', (min, max) => {
      if (typeof min === 'number' && typeof max === 'number') {
        return Math.floor(Math.random() * (max - min + 1)) + min;
      }
      return Math.random();
    });
  }

  /**
   * 渲染简历
   * @param {Object} template - 模板对象
   * @param {Object} resumeData - 简历数据
   * @returns {Object} 渲染结果
   */
  renderResume(template, resumeData) {
    try {
      if (!template || !template.html) {
        return {
          success: false,
          message: '模板数据不完整'
        };
      }
      
      if (!resumeData) {
        return {
          success: false,
          message: '简历数据不能为空'
        };
      }
      
      // 编译模板
      const compiledTemplate = Handlebars.compile(template.html);
      
      // 准备数据（将模板中的CSS插入到简历数据中）
      const renderData = {
        ...resumeData,
        css: template.css || ''
      };
      
      // 渲染HTML
      const html = compiledTemplate(renderData);
      
      return {
        success: true,
        data: {
          html: html
        }
      };
    } catch (error) {
      console.error('渲染简历失败:', error);
      return {
        success: false,
        message: '渲染简历失败: ' + error.message
      };
    }
  }

  /**
   * 生成简历并存储
   * @param {Object} resumeData - 简历数据
   * @param {Object} template - 模板对象
   * @returns {Object} 生成结果
   */
  generateAndStoreResume(resumeData, template) {
    try {
      // 渲染简历
      const renderResult = this.renderResume(template, resumeData);
      
      if (!renderResult.success) {
        return renderResult;
      }
      
      // 生成唯一ID
      const generatedId = this._generateId();
      
      // 创建生成的简历对象
      const generatedResume = {
        id: generatedId,
        html: renderResult.data.html,
        resumeData: resumeData,
        templateId: template.id,
        createdAt: new Date().toISOString()
      };
      
      // 如果resumeData中有id，则添加到generatedResume中
      if (resumeData.id) {
        generatedResume.resumeId = resumeData.id;
      }
      
      // 存储生成的简历
      this.generatedStorage.set(generatedId, generatedResume);
      
      return {
        success: true,
        message: '简历生成成功',
        data: {
          generatedId: generatedId,
          html: renderResult.data.html
        }
      };
    } catch (error) {
      console.error('生成简历失败:', error);
      return {
        success: false,
        message: '生成简历失败: ' + error.message
      };
    }
  }

  /**
   * 获取生成的简历
   * @param {string} generatedId - 生成的简历ID
   * @returns {Object} 简历数据或错误信息
   */
  getGeneratedResume(generatedId) {
    try {
      const generatedResume = this.generatedStorage.get(generatedId);
      
      if (!generatedResume) {
        return {
          success: false,
          message: '生成的简历不存在'
        };
      }
      
      return {
        success: true,
        data: generatedResume
      };
    } catch (error) {
      console.error('获取生成简历失败:', error);
      return {
        success: false,
        message: '获取生成简历失败'
      };
    }
  }

  /**
   * 删除生成的简历
   * @param {string} generatedId - 生成的简历ID
   * @returns {Object} 删除结果
   */
  deleteGeneratedResume(generatedId) {
    try {
      const exists = this.generatedStorage.has(generatedId);
      
      if (!exists) {
        return {
          success: false,
          message: '生成的简历不存在'
        };
      }
      
      this.generatedStorage.delete(generatedId);
      
      return {
        success: true,
        message: '生成的简历删除成功'
      };
    } catch (error) {
      console.error('删除生成简历失败:', error);
      return {
        success: false,
        message: '删除生成简历失败'
      };
    }
  }

  /**
   * 生成随机ID
   * @private
   * @returns {string} 随机ID
   */
  _generateId() {
    return 'generated-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }
}

module.exports = new RenderService();
