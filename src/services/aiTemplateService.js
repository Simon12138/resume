/**
 * AI模板服务
 * 提供与通义千问交互生成简历模板的功能
 */

const qwenService = require('./qwenService');

class AITemplateService {
  /**
   * 生成简历模板
   * @param {string} userDescription - 用户对模板的描述需求
   * @returns {Promise<Object>} 生成的模板对象
   */
  async generateTemplate(userDescription) {
    try {
      // 调用通义千问生成模板
      const templateHtml = await qwenService.generateTemplate(userDescription);
      
      const templateId = this._generateId();
      
      return {
        id: templateId,
        name: `AI生成模板-${templateId.substring(0, 6)}`,
        description: userDescription,
        html: templateHtml,
        css: this._generateTemplateCss(),
        createdAt: new Date().toISOString(),
        isAiGenerated: true
      };
    } catch (error) {
      console.error('AI生成模板失败:', error);
      // 如果AI生成失败，返回默认模板
      return this._generateDefaultTemplate(userDescription);
    }
  }
  

  /**
   * 生成模板ID
   * @private
   * @returns {string} 模板ID
   */
  _generateId() {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
  
  /**
   * 生成默认模板（当AI生成失败时使用）
   * @private
   * @param {string} userDescription - 用户对模板的描述需求
   * @returns {Object} 默认模板对象
   */
  _generateDefaultTemplate(userDescription) {
    const templateId = this._generateId();
    const templateHtml = this._generateTemplateHtml(userDescription);
    
    return {
      id: templateId,
      name: `默认模板-${templateId.substring(0, 6)}`,
      description: userDescription || '默认简历模板',
      html: templateHtml,
      css: this._generateTemplateCss(),
      createdAt: new Date().toISOString(),
      isAiGenerated: false
    };
  }
  
  /**
   * 根据用户描述生成HTML模板
   * @private
   * @param {string} userDescription - 用户对模板的描述需求
   * @returns {string} HTML模板内容
   */
  _generateTemplateHtml(userDescription) {
    // 这里应该通过调用AI接口生成真实的模板
    // 现在只是模拟生成一个简单的模板
    
    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{name}}的简历</title>
    <style>
        {{css}}
    </style>
</head>
<body>
    <div class="resume-container">
        <header class="resume-header">
            <h1>{{name}}</h1>
            <div class="contact-info">
                {{#if phone}}<span>电话: {{phone}}</span>{{/if}}
                {{#if email}}<span>邮箱: {{email}}</span>{{/if}}
                {{#if address}}<span>地址: {{address}}</span>{{/if}}
            </div>
        </header>
        
        {{#if summary}}
        <section class="summary">
            <h2>个人简介</h2>
            <p>{{summary}}</p>
        </section>
        {{/if}}
        
        {{#if workExperience.length}}
        <section class="work-experience">
            <h2>工作经历</h2>
            {{#each workExperience}}
            <div class="job">
                <h3>{{company}} - {{position}}</h3>
                <div class="job-duration">{{startDate}} - {{endDate}}</div>
                <ul>
                    {{#each responsibilities}}
                    <li>{{this}}</li>
                    {{/each}}
                </ul>
            </div>
            {{/each}}
        </section>
        {{/if}}
        
        {{#if education.length}}
        <section class="education">
            <h2>教育背景</h2>
            {{#each education}}
            <div class="education-item">
                <h3>{{school}}</h3>
                <div class="degree">{{degree}} - {{major}}</div>
                <div class="edu-duration">{{startDate}} - {{endDate}}</div>
            </div>
            {{/each}}
        </section>
        {{/if}}
        
        {{#if skills.length}}
        <section class="skills">
            <h2>技能专长</h2>
            <ul>
                {{#each skills}}
                <li>{{this}}</li>
                {{/each}}
            </ul>
        </section>
        {{/if}}
        
        {{#if projects.length}}
        <section class="projects">
            <h2>项目经验</h2>
            {{#each projects}}
            <div class="project-item">
                <h3>{{name}}</h3>
                <p>{{description}}</p>
            </div>
            {{/each}}
        </section>
        {{/if}}
        
        {{#if languages}}
        <section class="languages">
            <h2>语言能力</h2>
            <p>{{languages}}</p>
        </section>
        {{/if}}
    </div>
</body>
</html>
    `.trim();
  }
  
  /**
   * 生成模板CSS样式
   * @private
   * @returns {string} CSS样式内容
   */
  _generateTemplateCss() {
    return `
.resume-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    font-family: Arial, sans-serif;
    line-height: 1.6;
}

.resume-header {
    text-align: center;
    border-bottom: 2px solid #333;
    padding-bottom: 20px;
    margin-bottom: 30px;
}

.resume-header h1 {
    margin: 0 0 10px 0;
    color: #333;
}

.contact-info {
    display: flex;
    justify-content: center;
    gap: 20px;
    flex-wrap: wrap;
}

.contact-info span {
    white-space: nowrap;
}

section {
    margin-bottom: 30px;
}

section h2 {
    border-left: 4px solid #007bff;
    padding-left: 10px;
    margin-bottom: 15px;
    color: #333;
}

.job, .education-item, .project-item {
    margin-bottom: 20px;
}

.job h3, .education-item h3, .project-item h3 {
    margin: 0 0 5px 0;
    color: #007bff;
}

.job-duration, .edu-duration, .degree {
    color: #666;
    margin-bottom: 10px;
}

ul {
    padding-left: 20px;
}

@media print {
    .resume-container {
        padding: 0;
    }
}
    `.trim();
  }
}

module.exports = new AITemplateService();
