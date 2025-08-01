/**
 * PDF解析服务
 * 用于从PDF文件中提取文本信息
 */

const fs = require('fs').promises;

class PDFParseService {
  /**
   * 解析PDF文件中的文本内容
   * @param {Buffer} pdfBuffer - PDF文件Buffer
   * @returns {Promise<Object>} 解析结果
   */
  async parsePDFText(pdfBuffer) {
    try {
      // 动态引入pdf-parse库，使用require避免执行库中的测试代码
      const pdfParse = require('pdf-parse');
      
      // 确保传入的是Buffer对象
      if (!(pdfBuffer instanceof Buffer)) {
        throw new Error('传入的参数必须是Buffer对象');
      }
      
      // 解析PDF文本
      const data = await pdfParse(pdfBuffer);
      
      return {
        success: true,
        data: {
          text: data.text,
          pages: data.numpages,
          info: data.info,
          metadata: data.metadata
        }
      };
    } catch (error) {
      console.error('PDF解析失败:', error);
      
      return {
        success: false,
        message: 'PDF解析失败: ' + error.message
      };
    }
  }
  
  /**
   * 解析PDF文件中的文本内容（简化版，只返回文本）
   * @param {Buffer} pdfBuffer - PDF文件Buffer
   * @returns {Promise<Object>} 解析结果
   */
  async extractText(pdfBuffer) {
    try {
      const result = await this.parsePDFText(pdfBuffer);
      
      if (result.success) {
        return {
          success: true,
          data: result.data.text
        };
      } else {
        return result;
      }
    } catch (error) {
      console.error('PDF文本提取失败:', error);
      
      return {
        success: false,
        message: 'PDF文本提取失败: ' + error.message
      };
    }
  }
}

module.exports = new PDFParseService();
