/**
 * 模板数据模型
 */

class Template {
  constructor(data) {
    this.id = data.id || this._generateId();
    this.name = data.name || '';
    this.description = data.description || '';
    this.html = data.html || '';
    this.css = data.css || '';
    this.createdAt = data.createdAt || new Date().toISOString();
    this.isAiGenerated = data.isAiGenerated || false;
    this.category = data.category || 'general'; // 模板分类
    this.tags = data.tags || []; // 模板标签
    this.isVip = data.isVip || false; // 是否为VIP模板
  }

  /**
   * 生成模板ID
   * @private
   * @returns {string} 模板ID
   */
  _generateId() {
    return 'template-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * 验证模板数据
   * @returns {Object} 验证结果
   */
  validate() {
    const errors = [];

    if (!this.name) {
      errors.push('模板名称不能为空');
    }

    if (!this.html) {
      errors.push('模板HTML内容不能为空');
    }

    // 验证HTML格式是否包含必要的占位符
    const requiredPlaceholders = ['{{name}}', '{{jobTitle}}'];
    for (const placeholder of requiredPlaceholders) {
      if (!this.html.includes(placeholder)) {
        errors.push(`模板HTML必须包含占位符: ${placeholder}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * 转换为纯对象
   * @returns {Object} 模板数据对象
   */
  toObject() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      html: this.html,
      css: this.css,
      createdAt: this.createdAt,
      isAiGenerated: this.isAiGenerated,
      category: this.category,
      tags: this.tags,
      isVip: this.isVip
    };
  }

  /**
   * 获取模板预览数据
   * @returns {Object} 预览数据
   */
  getPreviewData() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      createdAt: this.createdAt,
      isAiGenerated: this.isAiGenerated,
      category: this.category,
      tags: this.tags,
      isVip: this.isVip
    };
  }
}

module.exports = Template;
