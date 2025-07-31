/**
 * 简历数据服务
 * 实现简历数据的存储和访问逻辑
 */

const Resume = require('../models/Resume');

// 模拟内存存储
const resumeStorage = new Map();
const generatedResumeStorage = new Map();

class ResumeService {
  /**
   * 创建简历
   * @param {Object} resumeData - 简历数据
   * @returns {Object} 创建结果
   */
  createResume(resumeData) {
    try {
      // 创建简历实例
      const resume = new Resume(resumeData);
      
      // 验证数据
      const validation = resume.validate();
      if (!validation.isValid) {
        return {
          success: false,
          message: '简历数据验证失败',
          errors: validation.errors
        };
      }
      
      // 生成唯一ID
      const resumeId = this._generateId();
      
      // 存储简历
      resumeStorage.set(resumeId, resume);
      
      return {
        success: true,
        message: '简历创建成功',
        data: {
          resumeId
        }
      };
    } catch (error) {
      console.error('创建简历失败:', error);
      return {
        success: false,
        message: '创建简历失败'
      };
    }
  }
  
  /**
   * 获取简历
   * @param {string} resumeId - 简历ID
   * @returns {Object} 简历数据或错误信息
   */
  getResume(resumeId) {
    try {
      const resume = resumeStorage.get(resumeId);
      
      if (!resume) {
        return {
          success: false,
          message: '简历不存在'
        };
      }
      
      return {
        success: true,
        data: resume.toObject()
      };
    } catch (error) {
      console.error('获取简历失败:', error);
      return {
        success: false,
        message: '获取简历失败'
      };
    }
  }
  
  /**
   * 更新简历
   * @param {string} resumeId - 简历ID
   * @param {Object} updateData - 更新数据
   * @returns {Object} 更新结果
   */
  updateResume(resumeId, updateData) {
    try {
      const existingResume = resumeStorage.get(resumeId);
      
      if (!existingResume) {
        return {
          success: false,
          message: '简历不存在'
        };
      }
      
      // 合并更新数据
      const updatedData = {
        ...existingResume.toObject(),
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      
      // 创建新的简历实例
      const updatedResume = new Resume(updatedData);
      
      // 验证数据
      const validation = updatedResume.validate();
      if (!validation.isValid) {
        return {
          success: false,
          message: '简历数据验证失败',
          errors: validation.errors
        };
      }
      
      // 存储更新后的简历
      resumeStorage.set(resumeId, updatedResume);
      
      return {
        success: true,
        message: '简历更新成功',
        data: updatedResume.toObject()
      };
    } catch (error) {
      console.error('更新简历失败:', error);
      return {
        success: false,
        message: '更新简历失败'
      };
    }
  }
  
  /**
   * 删除简历
   * @param {string} resumeId - 简历ID
   * @returns {Object} 删除结果
   */
  deleteResume(resumeId) {
    try {
      const exists = resumeStorage.has(resumeId);
      
      if (!exists) {
        return {
          success: false,
          message: '简历不存在'
        };
      }
      
      resumeStorage.delete(resumeId);
      
      return {
        success: true,
        message: '简历删除成功'
      };
    } catch (error) {
      console.error('删除简历失败:', error);
      return {
        success: false,
        message: '删除简历失败'
      };
    }
  }
  
  /**
   * 生成简历（用于存储最终生成的简历）
   * @param {Object} resumeData - 简历数据
   * @returns {Object} 生成结果
   */
  createGeneratedResume(resumeData) {
    try {
      // 生成唯一ID
      const resumeId = this._generateId();
      
      // 添加时间戳
      const generatedResume = {
        ...resumeData,
        id: resumeId,
        createdAt: new Date().toISOString()
      };
      
      // 存储生成的简历
      generatedResumeStorage.set(resumeId, generatedResume);
      
      return {
        success: true,
        message: '生成简历创建成功',
        data: {
          resumeId
        }
      };
    } catch (error) {
      console.error('创建生成简历失败:', error);
      return {
        success: false,
        message: '创建生成简历失败'
      };
    }
  }
  
  /**
   * 获取生成的简历
   * @param {string} resumeId - 简历ID
   * @returns {Object} 简历数据或错误信息
   */
  getGeneratedResume(resumeId) {
    try {
      const resume = generatedResumeStorage.get(resumeId);
      
      if (!resume) {
        return {
          success: false,
          message: '生成的简历不存在'
        };
      }
      
      return {
        success: true,
        data: resume
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
   * 保存生成的简历HTML（向后兼容方法）
   * @param {string} html - 生成的简历HTML
   * @returns {string} 生成的简历ID
   */
  saveGeneratedResume(html) {
    try {
      // 生成唯一ID
      const resumeId = this._generateId();
      
      // 创建生成的简历对象
      const generatedResume = {
        html: html,
        id: resumeId,
        createdAt: new Date().toISOString()
      };
      
      // 存储生成的简历
      generatedResumeStorage.set(resumeId, generatedResume);
      
      return resumeId;
    } catch (error) {
      console.error('保存生成简历失败:', error);
      throw error;
    }
  }
  
  /**
   * 生成随机ID
   * @private
   * @returns {string} 随机ID
   */
  _generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }
}

module.exports = new ResumeService();
