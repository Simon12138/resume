/**
 * 简历数据模型
 * 定义简历数据结构和验证逻辑
 */

class Resume {
  /**
   * 创建简历实例
   * @param {Object} data - 简历数据
   */
  constructor(data = {}) {
    // 个人基本信息
    this.name = data.name || '';
    this.jobTitle = data.jobTitle || '';
    this.phone = data.phone || '';
    this.email = data.email || '';
    this.address = data.address || '';
    this.summary = data.summary || '';
    
    // 工作经历（数组）
    this.workExperience = Array.isArray(data.workExperience) 
      ? data.workExperience.map(exp => ({
          company: exp.company || '',
          position: exp.position || '',
          startDate: exp.startDate || '',
          endDate: exp.endDate || '',
          responsibilities: Array.isArray(exp.responsibilities) 
            ? [...exp.responsibilities] 
            : []
        }))
      : [];
    
    // 教育背景（数组）
    this.education = Array.isArray(data.education)
      ? data.education.map(edu => ({
          school: edu.school || '',
          degree: edu.degree || '',
          major: edu.major || '',
          startDate: edu.startDate || '',
          endDate: edu.endDate || ''
        }))
      : [];
    
    // 技能专长（数组）
    this.skills = Array.isArray(data.skills) 
      ? [...data.skills] 
      : [];
    
    // 项目经验（数组）
    this.projects = Array.isArray(data.projects)
      ? data.projects.map(project => ({
          name: project.name || '',
          description: project.description || ''
        }))
      : [];
    
    // 语言能力
    this.languages = data.languages || '';
    
    // 时间戳
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }
  
  /**
   * 验证简历数据
   * @returns {Object} 验证结果
   */
  validate() {
    const errors = [];
    
    // 验证必填字段
    if (!this.name || this.name.trim().length === 0) {
      errors.push('姓名是必填项');
    }
    
    // 验证邮箱格式（如果提供了邮箱）
    if (this.email && this.email.trim().length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.email)) {
        errors.push('邮箱格式不正确');
      }
    }
    
    // 验证电话格式（如果提供了电话）
    if (this.phone && this.phone.trim().length > 0) {
      const phoneRegex = /^[\d\-\+\(\)\s]+$/;
      if (!phoneRegex.test(this.phone)) {
        errors.push('电话格式不正确');
      }
    }
    
    // 验证工作经历时间格式
    for (let i = 0; i < this.workExperience.length; i++) {
      const exp = this.workExperience[i];
      if (exp.startDate && !this._isValidDate(exp.startDate)) {
        errors.push(`工作经历[${i + 1}]开始时间格式不正确`);
      }
      if (exp.endDate && !this._isValidDate(exp.endDate)) {
        errors.push(`工作经历[${i + 1}]结束时间格式不正确`);
      }
    }
    
    // 验证教育背景时间格式
    for (let i = 0; i < this.education.length; i++) {
      const edu = this.education[i];
      if (edu.startDate && !this._isValidDate(edu.startDate)) {
        errors.push(`教育背景[${i + 1}]开始时间格式不正确`);
      }
      if (edu.endDate && !this._isValidDate(edu.endDate)) {
        errors.push(`教育背景[${i + 1}]结束时间格式不正确`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  /**
   * 验证日期格式
   * @private
   * @param {string} dateStr - 日期字符串
   * @returns {boolean} 是否为有效日期
   */
  _isValidDate(dateStr) {
    // 支持 YYYY-MM 或 YYYY-MM-DD 格式
    const dateRegex = /^\d{4}-\d{2}(-\d{2})?$/;
    return dateRegex.test(dateStr);
  }
  
  /**
   * 转换为纯数据对象
   * @returns {Object} 简历数据对象
   */
  toObject() {
    return {
      name: this.name,
      jobTitle: this.jobTitle,
      phone: this.phone,
      email: this.email,
      address: this.address,
      summary: this.summary,
      workExperience: this.workExperience,
      education: this.education,
      skills: this.skills,
      projects: this.projects,
      languages: this.languages,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = Resume;
