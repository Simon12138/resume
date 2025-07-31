/**
 * PDF服务
 * 实现简历PDF生成和导出功能
 */

const puppeteer = require('puppeteer');
const path = require('path');

class PDFService {
  constructor() {
    this.browser = null;
    this.isBrowserInitialized = false;
  }

  /**
   * 初始化浏览器实例
   * @private
   * @returns {Promise<void>}
   */
  async _initializeBrowser() {
    if (this.isBrowserInitialized) {
      return;
    }

    try {
      // 首先尝试使用默认配置启动
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--disable-software-rasterizer',
          '--disable-extensions',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
          '--disable-ipc-flooding-protection',
          '--no-first-run',
          '--disable-background-networking',
          '--disable-default-apps',
          '--mute-audio',
          '--disable-features=TranslateUI',
          '--disable-ipc-flooding-protection'
        ],
        timeout: 60000
      });
      
      this.isBrowserInitialized = true;
      console.log('PDF浏览器实例初始化成功');
      return;
    } catch (error) {
      console.warn('默认浏览器启动失败，尝试使用系统Chrome:', error.message);
      
      // 尝试使用系统Chrome启动
      try {
        this.browser = await puppeteer.launch({
          headless: 'new',
          executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', // macOS Chrome路径
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu'
          ],
          timeout: 60000
        });
        
        this.isBrowserInitialized = true;
        console.log('使用系统Chrome启动PDF浏览器实例成功');
        return;
      } catch (chromeError) {
        console.warn('系统Chrome启动失败:', chromeError.message);
      }
      
      // 尝试使用系统Chromium启动
      try {
        this.browser = await puppeteer.launch({
          headless: 'new',
          executablePath: '/Applications/Chromium.app/Contents/MacOS/Chromium', // macOS Chromium路径
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu'
          ],
          timeout: 60000
        });
        
        this.isBrowserInitialized = true;
        console.log('使用系统Chromium启动PDF浏览器实例成功');
        return;
      } catch (chromiumError) {
        console.warn('系统Chromium启动失败:', chromiumError.message);
      }
      
      // 如果所有尝试都失败，抛出错误
      console.error('PDF浏览器实例初始化失败:', error);
      if (error.code === 'ECONNREFUSED') {
        throw new Error('无法连接到浏览器实例，请检查Puppeteer配置');
      } else if (error.message.includes('socket hang up')) {
        throw new Error('浏览器实例连接中断，请检查系统资源或重试');
      } else if (error.message.includes('Failed to launch')) {
        throw new Error('浏览器启动失败，请确保已安装Chrome/Chromium或配置正确的可执行路径');
      } else {
        throw new Error('PDF服务初始化失败: ' + error.message);
      }
    }
  }

  /**
   * 生成PDF
   * @param {string} htmlContent - HTML内容
   * @param {Object} options - PDF选项
   * @returns {Promise<Object>} PDF生成结果
   */
  async generatePDF(htmlContent, options = {}) {
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount <= maxRetries) {
      try {
        // 确保浏览器已初始化，如果未初始化则尝试初始化
        if (!this.isBrowserInitialized) {
          await this._initializeBrowser();
        }
        
        // 创建新页面
        const page = await this.browser.newPage();
        
        // 设置页面内容
        await page.setContent(htmlContent, {
          waitUntil: 'networkidle0', // 等待网络空闲
          timeout: 30000 // 增加超时时间
        });
        
        // 等待所有资源加载完成
        await page.evaluate(() => {
          return new Promise((resolve) => {
            if (document.readyState === 'loading') {
              document.addEventListener('DOMContentLoaded', resolve);
            } else {
              resolve();
            }
          });
        });
        
        // 默认PDF选项
        const defaultOptions = {
          format: 'A4',
          printBackground: true,
          margin: {
            top: '0px',
            right: '0px',
            bottom: '0px',
            left: '0px'
          },
          ...options
        };
        
        // 生成PDF
        const pdfBuffer = await page.pdf(defaultOptions);
        
        // 关闭页面
        await page.close();
        
        return {
          success: true,
          data: {
            buffer: pdfBuffer
          }
        };
      } catch (error) {
        console.error(`生成PDF失败 (尝试 ${retryCount + 1}/${maxRetries + 1}):`, error);
        
        // 如果是最后一次尝试，返回错误
        if (retryCount === maxRetries) {
          // 尝试重启浏览器
          try {
            await this.closeBrowser();
            this.isBrowserInitialized = false;
          } catch (closeError) {
            console.error('关闭浏览器实例失败:', closeError);
          }
          
          return {
            success: false,
            message: '生成PDF失败: ' + error.message
          };
        }
        
        // 重置浏览器状态并重试
        try {
          await this.closeBrowser();
          this.isBrowserInitialized = false;
        } catch (closeError) {
          console.error('关闭浏览器实例失败:', closeError);
        }
        
        // 等待一段时间后重试
        await new Promise(resolve => setTimeout(resolve, 2000 * (retryCount + 1)));
        retryCount++;
      }
    }
  }

  /**
   * 生成简历PDF
   * @param {Object} resumeData - 简历数据
   * @param {Object} template - 模板对象
   * @returns {Promise<Object>} PDF生成结果
   */
  async generateResumePDF(resumeData, template) {
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount <= maxRetries) {
      try {
        // 确保浏览器已初始化，如果未初始化则尝试初始化
        if (!this.isBrowserInitialized) {
          await this._initializeBrowser();
        }
        
        // 构建完整的HTML页面
        const fullHTML = `
          <!DOCTYPE html>
          <html lang="zh-CN">
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>${resumeData.name}的简历</title>
              <style>
                  body {
                      font-family: 'Microsoft YaHei', Arial, sans-serif;
                      margin: 0;
                      padding: 0;
                  }
                  @media print {
                      body {
                          padding: 0;
                          margin: 0;
                      }
                  }
              </style>
          </head>
          <body>
              ${template.html}
          </body>
          </html>
        `;
        
        // 创建新页面
        const page = await this.browser.newPage();
        
        // 注入简历数据到页面
        await page.setContent(fullHTML, {
          waitUntil: 'networkidle0',
          timeout: 30000 // 增加超时时间
        });
        
        // 等待模板渲染完成
        await page.evaluate((data) => {
          // 这里可以添加特定的模板渲染逻辑
          // 但由于我们使用的是服务端渲染，这里主要是确保页面加载完成
          return Promise.resolve();
        }, resumeData);
        
        // 生成PDF
        const pdfBuffer = await page.pdf({
          format: 'A4',
          printBackground: true,
          margin: {
            top: '20px',
            right: '20px',
            bottom: '20px',
            left: '20px'
          }
        });
        
        // 关闭页面
        await page.close();
        
        return {
          success: true,
          data: {
            buffer: pdfBuffer,
            filename: `${resumeData.name}的简历.pdf`
          }
        };
      } catch (error) {
        console.error(`生成简历PDF失败 (尝试 ${retryCount + 1}/${maxRetries + 1}):`, error);
        
        // 如果是最后一次尝试，返回错误
        if (retryCount === maxRetries) {
          // 尝试重启浏览器
          try {
            await this.closeBrowser();
            this.isBrowserInitialized = false;
          } catch (closeError) {
            console.error('关闭浏览器实例失败:', closeError);
          }
          
          return {
            success: false,
            message: '生成简历PDF失败: ' + error.message
          };
        }
        
        // 重置浏览器状态并重试
        try {
          await this.closeBrowser();
          this.isBrowserInitialized = false;
        } catch (closeError) {
          console.error('关闭浏览器实例失败:', closeError);
        }
        
        // 等待一段时间后重试
        await new Promise(resolve => setTimeout(resolve, 2000 * (retryCount + 1)));
        retryCount++;
      }
    }
  }

  /**
   * 关闭浏览器实例
   * @returns {Promise<void>}
   */
  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.isBrowserInitialized = false;
      console.log('PDF浏览器实例已关闭');
    }
  }
}

module.exports = new PDFService();
