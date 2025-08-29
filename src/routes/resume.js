const express = require('express');
const router = express.Router();
const resumeService = require('../services/resumeService');
const templateService = require('../services/templateService');
const renderService = require('../services/renderService');

// 简历输入页面
router.get('/', (req, res) => {
  // 获取当前登录用户
  const user = req.session.user;
  
  res.send(`
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="description" content="基于Node.js和通义千问大模型的简历智能助手，帮助用户快速创建高质量的简历。系统提供用户信息输入、AI优化、模板选择、智能填充、预览和下载等功能">
        <meta name="keywords" content="通义千问、简历智能助手、简历生成、简历优化、简历模板、简历预览、简历下载、简历制作、面试、求职">
        <title>创建简历 - 简历智能助手</title>
        <link rel="stylesheet" href="/css/style.css">
        <style>
          body {
            background-color: #f5f7fa;
          }
          
          .container {
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
            padding: 20px;
            margin-bottom: 30px;
          }
          
          #uploadPdfBtn {
            margin-bottom: 10px;
          }
          
          .button-group {
            margin-top: 10px;
          }
          
          .resume-builder-container {
            display: flex;
            gap: 20px;
            padding: 20px;
            max-width: 1400px;
            margin: 0 auto;
            height: calc(200vh - 120px);
          }
          
          .templates-panel {
            flex: 1;
            max-width: 350px;
            background: #f8fafc;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            height: 100%;
            overflow-y: auto;
            border: 1px solid #e2e8f0;
          }
          
          .templates-panel h2 {
            margin-top: 0;
            padding-bottom: 15px;
            border-bottom: 1px solid #eee;
          }
          
          .template-list {
            display: flex;
            flex-direction: column;
            gap: 10px;
          }
          
          .template-card {
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 12px 15px;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
          }
          
          .template-card:hover {
            border-color: #0071e3;
            background-color: #f8f9fa;
          }
          
          .template-card.selected {
            border-color: #0071e3;
            background-color: #e3f2fd;
          }
          
          .template-info {
            flex: 1;
          }
          
          .template-info h3 {
            margin: 0 0 5px 0;
            font-size: 15px;
            color: #1d1d1f;
          }
          
          .template-info p {
            font-size: 12px;
            color: #666;
            margin: 0;
            line-height: 1.4;
            display: -webkit-box;
            -webkit-line-clamp: 1;
            -webkit-box-orient: vertical;
          }
          
          .ai-badge {
            background-color: #0071e3;
            color: white;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 12px;
            margin-left: 8px;
            font-weight: 500;
          }
          
          
          .template-card {
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 12px 15px;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
          }
          
          .template-card:hover {
            border-color: #0071e3;
            background-color: #f8f9fa;
          }
          
          .template-card.selected {
            border-color: #0071e3;
            background-color: #e3f2fd;
          }
          
          .template-info {
            flex: 1;
          }
          
          .template-info h3 {
            margin: 0 0 5px 0;
            font-size: 15px;
            color: #1d1d1f;
          }
          
          .template-info p {
            font-size: 12px;
            color: #666;
            margin: 0;
            line-height: 1.4;
            display: -webkit-box;
            -webkit-line-clamp: 1;
            -webkit-box-orient: vertical;
          }
          
          .no-templates {
            text-align: center;
            padding: 30px;
            color: #666;
            font-style: italic;
          }
          
          .content-panel {
            flex: 2;
            background: #f8fafc;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            display: flex;
            flex-direction: column;
            height: calc(200vh - 120px);
            border: 1px solid #e2e8f0;
          }
          
          .content-panel h2 {
            margin-top: 0;
            padding-bottom: 15px;
            border-bottom: 1px solid #eee;
          }
          
          .input-section {
            position: relative;
            flex: 1;
            display: flex;
            flex-direction: column;
            min-height: 0; /* 允许flex项目收缩 */
            max-height: 30%;
            background-color: #ffffff;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            margin-bottom: 20px;
          }
          
          #rawText {
            width: 100%;
            height: 300px;
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 8px;
            font-family: var(--font-family);
            font-size: 16px;
            line-height: 1.5;
            resize: vertical;
            box-sizing: border-box;
          }
          
          .parse-button-container {
            position: absolute;
            bottom: 15px;
            right: 15px;
          }
          
          #parseBtn {
            background-color: #0071e3;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 500;
            box-shadow: 0 2px 10px rgba(0, 113, 227, 0.3);
          }
          
          #parseBtn:hover {
            background-color: #0077ed;
          }
          
          #parseBtn:disabled {
            background-color: #ccc;
            cursor: not-allowed;
          }
          
          .result-section {
            margin-top: 20px;
            flex: 1;
            overflow-y: auto;
            min-height: 0; /* 允许flex项目收缩 */
            background-color: #ffffff;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          }
          
          #preview {
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 0; /* 移除padding */
            background-color: white;
            height: auto;
            max-height: none;
            overflow: visible;
            display: block;
          }
          
          .preview-content {
            height: auto;
            max-height: none;
            overflow: visible;
          }
          
          /* 预览区域添加样式隔离 */
          .preview-content iframe {
            width: 100%;
            height: auto; /* 自动调整高度 */
            min-height: 600px; /* 设置最小高度 */
            border: none;
            display: block; /* 避免底部空隙 */
          }
          
          .preview-placeholder {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 600px;
            color: #666;
            text-align: center;
            padding: 20px;
          }
          
          .ai-template-section {
            background-color: #f1f5f9;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            padding: 25px;
            margin-bottom: 20px;
            margin-top: 10px;
            transition: all 0.3s ease;
            border: 1px solid #e2e8f0;
          }
          
          .ai-template-section .card-header {
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 15px;
            margin-bottom: 20px;
          }
          
          .ai-template-section .card-header h2 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
            letter-spacing: -0.3px;
            color: var(--text-primary);
          }
          
          .ai-template-content .form-group {
            margin-bottom: 18px;
          }
          
          .ai-template-content label {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
            color: var(--text-primary);
            font-size: 16px;
          }
          
          .ai-template-content textarea {
            width: 100%;
            padding: 12px 14px;
            border: 1px solid var(--border-color);
            border-radius: 8px;
            font-size: 15px;
            box-sizing: border-box;
            transition: var(--transition);
            background-color: var(--card-background);
            color: var(--text-primary);
            font-family: var(--font-family);
            min-height: 100px;
            resize: vertical;
          }
          
          .ai-template-content textarea:focus {
            outline: none;
            border-color: var(--primary-color);
            box-shadow: 0 0 0 2px rgba(0, 113, 227, 0.2);
          }
          
          .ai-template-content .btn {
            display: inline-block;
            padding: 10px 20px;
            background-color: var(--primary-color);
            color: white;
            text-decoration: none;
            border: none;
            border-radius: 25px;
            font-size: 15px;
            font-weight: 400;
            cursor: pointer;
            transition: var(--transition);
            text-align: center;
            font-family: var(--font-family);
            min-width: 120px;
            box-shadow: 0 3px 10px rgba(0, 113, 227, 0.15);
          }
          
          .ai-template-content .btn:hover {
            background-color: var(--primary-hover);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 113, 227, 0.2);
          }
          
          .ai-template-content .btn:disabled {
            background-color: #ccc;
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
          }
          
          /* 弹窗样式 */
          .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 1000;
            justify-content: center;
            align-items: center;
          }
          
          .modal-content {
            background-color: white;
            border-radius: 12px;
            width: 400px;
            max-width: 90%;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            background: linear-gradient(to bottom, #ffffff, #f8fafc);
          }
          
          .modal-body {
            padding: 30px 20px;
            text-align: center;
          }
          
          .modal-body h2 {
            margin: 15px 0 10px 0;
            font-size: 24px;
            color: #1d1d1f;
          }
          
          .modal-body p {
            color: #666;
            font-size: 16px;
            margin: 0;
          }
          
          .spinner-large {
            font-size: 48px;
            margin-bottom: 20px;
          }
          
          .optimize-modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 1000;
            justify-content: center;
            align-items: center;
          }
          
          .modal-content {
            background-color: white;
            border-radius: 12px;
            width: 600px;
            max-width: 90%;
            max-height: 90%;
            overflow-y: auto;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            background: linear-gradient(to bottom, #ffffff, #f8fafc);
          }
          
          .modal-header {
            padding: 20px;
            border-bottom: 1px solid #eee;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          
          .modal-header h2 {
            margin: 0;
          }
          
          .close-modal {
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #999;
          }
          
          .modal-body {
            padding: 20px;
          }
          
          .form-group {
            margin-bottom: 20px;
          }
          
          .form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: 500;
          }
          
          .form-group textarea {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 6px;
            resize: vertical;
            font-family: var(--font-family);
            min-height: 100px;
          }
          
          .modal-footer {
            padding: 20px;
            border-top: 1px solid #eee;
            display: flex;
            justify-content: flex-end;
            gap: 10px;
          }
          
          .btn {
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 500;
            border: none;
            font-size: 14px;
          }
          
          .btn-primary {
            background-color: #0071e3;
            color: white;
          }
          
          .btn-primary:hover {
            background-color: #0077ed;
          }
          
          .btn-secondary {
            background-color: #28a745;
            color: white;
          }
          
          .btn-secondary:hover {
            background-color: #218838;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(40, 167, 69, 0.2);
          }
          
          .btn-download {
            background-color: #28a745;
            color: white;
          }
          
          .btn-download:hover {
            background-color: #218838;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(40, 167, 69, 0.2);
          }
          
          #optimizeResult {
            margin-top: 20px;
            padding: 20px;
            border-radius: 8px;
            background-color: #f1f5f9;
            border: 1px solid #e2e8f0;
            display: none;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          }
          
          .action-buttons {
            position: absolute;
            top: 20px;
            right: 20px;
          }
          
          .optimize-btn {
            background-color: #34c759;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 500;
          }
          
          .optimize-btn:hover {
            background-color: #2db44e;
          }
          
          .parsing-indicator {
            display: none;
            text-align: center;
            padding: 20px;
          }
          
          .spinner {
            border: 4px solid rgba(0, 0, 0, 0.1);
            border-left-color: #0071e3;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            animation: spin 1s linear infinite;
            margin: 0 auto 10px;
          }
          
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          
          /* 模板生成提示弹窗 */
          .generating-modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 1000;
            justify-content: center;
            align-items: center;
          }
          
          .generating-modal-content {
            background-color: white;
            border-radius: 12px;
            width: 400px;
            max-width: 90%;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            background: linear-gradient(to bottom, #ffffff, #f8fafc);
            text-align: center;
            padding: 30px 20px;
          }
          
          .generating-modal-content h2 {
            margin: 15px 0 10px 0;
            font-size: 24px;
            color: #1d1d1f;
          }
          
          .generating-modal-content p {
            color: #666;
            font-size: 16px;
            margin: 0;
          }
          
          .spinner-large {
            font-size: 48px;
            margin-bottom: 20px;
          }
        

          .empty {
              min-height: 200px;
          }
          
          .footer {
            text-align: center;
            padding: 20px 0;
            margin-top: 20px;
            border-top: 1px solid #eee;
            color: #888;
            font-size: 14px;
          }
          
          .footer a {
            color: #888;
            text-decoration: none;
          }
          
          .footer a:hover {
            text-decoration: underline;
          }
          
          .contact-container:hover .contact-tooltip {
            display: block !important;
          }
          
          @media (max-width: 768px) {
            .resume-builder-container {
              flex-direction: column;
              height: auto;
              padding: 10px;
            }
            
            .templates-panel {
              max-width: 100%;
              height: auto;
              margin-bottom: 20px;
              padding: 15px;
            }
            
            .content-panel {
              height: auto;
              padding: 15px;
            }
            
            .input-section {
              max-height: none;
              min-height: 300px;
              padding: 15px;
            }
            
            #rawText {
              height: 200px;
              padding: 12px;
            }
            
            .header-content {
              flex-wrap: wrap;
              gap: 10px;
              height: auto;
              padding: 15px 0;
            }
            
            .nav-links {
              width: 100%;
              justify-content: center;
              margin-top: 10px;
              flex-wrap: wrap;
            }
            
            .ai-template-section {
              padding: 20px;
            }
            
            .preview-content iframe {
              min-height: 500px;
            }
            
            .modal-content {
              width: 95%;
            }
            
            .generating-modal-content {
              width: 95%;
            }
          }
          
          @media (max-width: 480px) {
            .resume-builder-container {
              padding: 5px;
            }
            
            .content-panel, .templates-panel {
              padding: 10px;
            }
            
            .input-section, .result-section {
              padding: 15px;
            }
            
            #rawText {
              height: 150px;
              padding: 10px;
              font-size: 16px;
            }
            
            .btn {
              width: 100%;
              padding: 12px;
              margin-bottom: 10px;
            }
            
            .button-group {
              flex-direction: column;
            }
            
            .form-row {
              flex-direction: column;
              gap: 15px;
            }
            
            .template-card {
              padding: 10px;
            }
            
            .template-info h3 {
              font-size: 14px;
            }
            
            .preview-content iframe {
              min-height: 400px;
            }
            
            .modal-content {
              width: 98%;
              padding: 10px;
            }
            
            .generating-modal-content {
              width: 98%;
              padding: 20px 15px;
            }
            
            .ai-template-section {
              padding: 15px;
            }
          }
        </style>
    </head>
    <body>
        <header class="header">
            <div class="header-content">
                <div class="logo-container">
                    <span class="logo">📝</span>
                    <h1>简历智能助手</h1>
                </div>
                <nav class="nav-links">
                    <a href="/" class="nav-link">首页</a>
                    <a href="/resume" class="nav-link active">创建简历</a>
                    <div class="contact-container" style="position: relative; display: inline-block; margin-left: 15px;">
                        <span class="nav-link" style="cursor: default;">联系我们</span>
                        <div class="contact-tooltip" style="display: none; position: absolute; top: 100%; right: 0; background: #333; color: white; padding: 10px; border-radius: 4px; white-space: nowrap; z-index: 1000; font-size: 14px;">
                            联系邮箱：599082380@qq.com
                        </div>
                    </div>
                    ${user && !user.isVIP ? '<a href="#" class="nav-link" id="becomeVipLink">成为会员</a>' : ''}
                    <span class="user-info">当前用户: ${user ? user.username : '访客'} | ${user ? '<a href="/logout" class="nav-link">登出</a>' : '<a href="/login" class="nav-link">登录</a>'}</span>
                </nav>
            </div>
        </header>
        
        <!-- 支付对话框 -->
        <div id="paymentModal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.5); z-index: 10000;">
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; border-radius: 8px; padding: 20px; width: 500px; max-width: 90%; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3); text-align: center;">
                <h3 style="margin-top: 0; color: #333;">成为会员</h3>
                <p style="line-height: 1.6; color: #666;">您还不是会员，请扫码下方小红书账号二维码（账号：495380418 黄小鸭），关注后私信成为会员</p>
                <p style="line-height: 1.6; color: #666; margin-bottom: 20px;">非会员仅享受3次下载文件机会，关注后私信成为会员即可无限制下载</p>
                <div style="padding: 10px; display: flex; justify-content: center; align-items: center;">
                    <img src="/data/account.JPG" alt="账号二维码" style="max-width: 100%; height: auto; max-height: 400px; object-fit: contain;">
                </div>
                <div style="display: flex; justify-content: space-between; margin-top: 20px;">
                    <button id="cancelPayment" style="flex: 1; margin-right: 10px; padding: 12px; background-color: #f1f1f1; border: none; border-radius: 4px; cursor: pointer; color: #333;">取消</button>
                    <button id="confirmPayment" style="flex: 1; margin-left: 10px; padding: 12px; background-color: #0071e3; color: white; border: none; border-radius: 4px; cursor: pointer;">已关注</button>
                </div>
            </div>
        </div>
        
        <div class="container">
            <div class="ai-template-section card">
                <div class="card-header">
                    <h2>自定义模板</h2>
                </div>
                <div class="ai-template-content">
                    <div class="form-group">
                        <label for="templateDescription">描述您想要的简历模板样式：</label>
                        <textarea 
                            id="templateDescription" 
                            placeholder="例如：我想要一个适合应届毕业生的简洁模板，颜色以蓝色为主，布局清晰，突出教育背景和实习经历..."></textarea>
                    </div>
                    <div class="form-group" style="margin-bottom: 0;">
                        <button class="btn" id="generateTemplateBtn">
                            <span id="templateGeneratingIndicator" style="display: none;">生成中...</span>
                            <span>生成模板</span>
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="resume-builder-container">
              <!-- 左侧模板选择面板 -->
              <div class="templates-panel">
                <h2>选择模板</h2>
                <div class="template-list" id="templateList">
                  <!-- 模板将通过JS动态加载 -->
                </div>
              </div>
              
              <!-- 右侧内容面板 -->
              <div class="content-panel">
                    <h2>输入简历内容</h2>
                    <div class="input-section">
                        <div class="button-group">
                            <input type="file" id="pdfUpload" accept=".pdf" style="display: none;">
                            <button class="btn" id="uploadPdfBtn">
                                导入简历内容
                            </button>
                        </div>
                        <div class="input-group">
                            <textarea id="rawText" placeholder="请输入简历内容，例如：
您好，我是张三，一名拥有5年以上经验的高级软件工程师，目前居住在北京市朝阳区。如果您需要联系我，我的电话是138-0000-0000，邮箱是zhangsan@example.com。

我专注于Web应用开发和系统架构设计，在团队协作、技术方案设计和项目管理方面积累了丰富经验。一直以来，我都致力于通过技术创新来提升产品价值，为客户和用户创造更好的体验。

在职业发展方面，我目前就职于某某科技有限公司担任高级软件工程师，主要负责公司核心产品的后端架构设计和开发工作。在这里，我带领着一个3人的技术团队完成了多个重要功能模块的开发，并通过系统优化将响应速度提升了40%。此外，我还积极参与技术选型和开发规范的制定，确保团队开发流程的高效和规范。

在此之前，我在某某互联网公司担任软件工程师，主要参与了公司电商平台的开发和维护工作。我负责的订单系统重构项目显著提高了系统稳定性，同时实现的商品推荐算法帮助提升了用户转化率15%。我还协助测试团队完成了系统测试和问题修复，确保产品质量。

我的职业生涯始于某某软件公司，当时作为初级软件工程师参与了企业内部管理系统的开发。在那段经历中，我负责数据库设计和优化工作，编写了大量技术文档和用户手册，并协助团队完成了项目部署和维护，这为我后续的职业发展打下了坚实基础。

在教育背景方面，我毕业于某某大学计算机科学与技术专业，获得学士学位。高中阶段我在某某高中理科班学习，为后续的计算机专业学习奠定了良好基础。

我的技术栈比较全面，熟练掌握JavaScript/TypeScript、Node.js、React/Vue等前端技术，同时在Python后端开发方面也有丰富经验。在数据库方面，我精通MySQL和Redis；在部署运维领域，熟悉Docker/Kubernetes容器化技术以及AWS和阿里云平台。此外，我还精通Git等版本控制工具，并有丰富的敏捷开发和系统架构设计经验。

值得一提的是，我曾主导完成了电商平台订单系统的重构工作，通过引入微服务架构和消息队列，成功将系统处理能力提升3倍，错误率降低80%。此外，我还参与开发了服务超过10万用户的在线教育平台，并独立设计开发了企业内部协作工具，整合了任务管理、文档共享和即时通讯功能，显著提高了团队协作效率。

在语言能力方面，我以普通话为母语，英语水平熟练（CET-6），能够无障碍阅读技术文档并与国际团队进行交流。

我始终相信，优秀的软件工程师不仅需要扎实的技术功底，更需要持续学习的态度和解决问题的能力。期待有机会与您进一步交流，共同探讨如何通过技术创造更大价值。"></textarea>
                        </div>
                        
                        <div class="button-group">
                            <button class="btn" id="parseBtn" style="margin-left: 10px;">
                                <span id="parsingIndicator" style="display: none;">🔄 生成中，请耐心等待，预计1~3分钟左右...</span>
                                <span id="parseText">生成漂亮简历</span>
                            </button>
                            <button class="btn btn-secondary" id="openOptimizeModal" style="margin-left: 10px;">
                                优化简历文案
                            </button>
                            <button class="btn btn-download" id="downloadPdfBtn" style="margin-left: 10px; display: none;">
                                下载漂亮简历
                            </button>
                        </div>
                    </div>
                    <div class="result-section">
                        <div id="preview">
                            <div class="preview-content">
                                <div class="preview-placeholder">
                                    <div>
                                        <p>选择模板并解析简历后，预览将在此处显示</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="footer">
            <p><a href="http://beian.miit.gov.cn/" target="_blank">沪ICP备2025138415号-1</a></p>
        </div>
        <div class="empty"></div>
        
        <!-- 登录对话框 -->
        <div id="loginModal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.5); z-index: 10000;">
            <div class="modal-content" style="background-color: #fff; margin: 10% auto; padding: 0; border-radius: 8px; width: 90%; max-width: 500px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15); position: relative;">
                <div class="modal-header" style="padding: 20px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;">
                    <h2 style="margin: 0; font-size: 24px; color: #333;">用户登录</h2>
                    <span class="close" id="closeLoginModal" style="font-size: 28px; cursor: pointer; color: #aaa;">&times;</span>
                </div>
                <form id="loginForm">
                    <div class="modal-body" style="padding: 30px;">
                        <div class="form-group" style="margin-bottom: 20px; display: flex; align-items: center;">
                            <label for="loginUsername" style="flex: 0 0 120px; margin-bottom: 0; font-weight: 500; color: #333;">用户名或手机号</label>
                            <input type="text" id="loginUsername" name="username" required style="flex: 1; margin-left: 10px; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 16px; box-sizing: border-box;">
                        </div>
                        <div class="form-group" style="margin-bottom: 20px; display: flex; align-items: center;">
                            <label for="loginPassword" style="flex: 0 0 120px; margin-bottom: 0; font-weight: 500; color: #333;">密码</label>
                            <input type="password" id="loginPassword" name="password" required style="flex: 1; margin-left: 10px; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 16px; box-sizing: border-box;">
                        </div>
                        <button type="submit" class="btn btn-primary" style="width: 100%; background-color: #007bff; color: white; padding: 12px; border: none; border-radius: 6px; cursor: pointer; font-size: 16px; font-weight: 500;">登录</button>
                    </div>
                </form>
                <div style="padding: 0 30px 30px; text-align: center;">
                    <p style="margin: 0; font-size: 14px; color: #666;">还没有账户？<a href="/register" class="nav-link" style="color: #007bff; text-decoration: none; display: inline; padding: 0; margin: 0;">立即注册</a></p>
                </div>
            </div>
        </div>
        
        <!-- 优化弹窗 -->
        <div class="optimize-modal" id="optimizeModal">
          <div class="modal-content">
            <div class="modal-header">
              <h2>优化简历内容</h2>
              <button class="close-modal close-modal-btn">&times;</button>
            </div>
            <div class="modal-body">
              <div class="form-group">
                <label for="rawTextForOptimize" style="text-align: left; display: block;">简历原始内容</label>
                <textarea id="rawTextForOptimize" placeholder="请输入你的简历原始信息"></textarea>
              </div>
              
              <div class="form-group">
                <label for="optimizePrompt" style="text-align: left; display: block;">你想要的效果</label>
                <textarea id="optimizePrompt" placeholder="告诉AI如何优化你的简历，例如：请帮我优化这份简历，让它更适合应聘软件工程师职位，突出我的技术能力和项目经验。"></textarea>
              </div>
              
              <div class="form-group">
                <label for="jdInfo" style="text-align: left; display: block;">职位描述(JD)</label>
                <textarea id="jdInfo" placeholder="请输入职位描述信息，帮助AI更好地优化简历"></textarea>
              </div>
              
              <button id="submitOptimize" class="btn btn-primary">提交优化</button>
              
              <div id="optimizeGeneratingIndicator" class="parsing-indicator">
                <div class="spinner"></div>
                <p>正在优化...</p>
              </div>
              
              <div id="optimizeResult">
                <h3>优化结果</h3>
                <div id="optimizeResultContent"></div>
                <button id="copyOptimizedContent" class="btn btn-primary" style="margin-top: 10px;">复制到简历</button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 解析提示弹窗 -->
        <div id="parsingModal" class="modal">
          <div class="modal-content">
            <div class="modal-body">
              <div class="spinner-large">🔄</div>
              <h2>解析中</h2>
              <p>请耐心等待，预计1~3分钟左右...</p>
            </div>
          </div>
        </div>
        
        <!-- 下载PDF提示弹窗 -->
        <div id="downloadingModal" class="modal">
          <div class="modal-content">
            <div class="modal-body">
              <div class="spinner-large">📄</div>
              <h2>下载中</h2>
              <p>正在生成PDF文件，请稍候...</p>
            </div>
          </div>
        </div>
        
        <!-- 生成模板提示弹窗 -->
        <div id="generatingTemplateModal" class="modal">
          <div class="modal-content">
            <div class="modal-body">
              <div class="spinner-large">🔄</div>
              <h2>模板生成中</h2>
              <p>AI正在为您生成个性化简历模板，请耐心等待...</p>
            </div>
          </div>
        </div>
        
        <script>
          // 初始化元素引用
          const rawText = document.getElementById('rawText');
          const parseBtn = document.getElementById('parseBtn');
          const parsingIndicator = document.getElementById('parsingIndicator');
          const parseText = document.getElementById('parseText');
          const templateList = document.getElementById('templateList');
          const downloadPdfBtn = document.getElementById('downloadPdfBtn');
          const optimizeModal = document.getElementById('optimizeModal');
          const openOptimizeModal = document.getElementById('openOptimizeModal');
          const closeButtons = document.querySelectorAll('.close-modal');
          const rawTextForOptimize = document.getElementById('rawTextForOptimize');
          const optimizePrompt = document.getElementById('optimizePrompt');
          const jdInfo = document.getElementById('jdInfo');
          const submitOptimize = document.getElementById('submitOptimize');
          const optimizeGeneratingIndicator = document.getElementById('optimizeGeneratingIndicator');
          const optimizeResult = document.getElementById('optimizeResult');
          const optimizeResultContent = document.getElementById('optimizeResultContent');
          const copyOptimizedContent = document.getElementById('copyOptimizedContent');
          const templateDescription = document.getElementById('templateDescription');
          const generateTemplateBtn = document.getElementById('generateTemplateBtn');
          const templateGeneratingIndicator = document.getElementById('templateGeneratingIndicator');
          const generatingModal = document.getElementById('generatingModal');
          const downloadingModal = document.getElementById('downloadingModal');
          
          let parsedResumeData = null;
          let selectedTemplateId = null;
          
          // 页面加载完成后初始化
          document.addEventListener('DOMContentLoaded', async function() {
            // 加载模板列表
            await loadTemplates();
            
            // 绑定事件
            bindEvents();
          });
          
          // 加载模板列表
          async function loadTemplates() {
            try {
              const response = await fetch('/api/templates');
              const result = await response.json();
              
              if (result.success) {
                renderTemplateList(result.data);
              } else {
                console.error('加载模板失败:', result.message);
              }
            } catch (error) {
              console.error('加载模板出错:', error);
            }
          }
          
          // 渲染模板列表
          function renderTemplateList(templates) {
            // 按模板名称排序
            templates.sort((a, b) => a.name.localeCompare(b.name));
            
            templateList.innerHTML = '';
            
            templates.forEach(template => {
              const templateCard = document.createElement('div');
              templateCard.className = 'template-card';
              templateCard.dataset.templateId = template.id;
              
              // 添加模板预览缩略图占位符
              templateCard.innerHTML = \`
                <div class="template-info">
                  <div style="display: flex; align-items: center;">
                    <h3>\${template.name}</h3>
                    \${template.isAiGenerated ? '<span class="ai-badge">AI</span>' : ''}
                  </div>
                  <p>\${template.description || '无描述'}</p>
                </div>
              \`;
              
              templateCard.addEventListener('click', () => {
                // 移除其他卡片的选中状态
                document.querySelectorAll('.template-card').forEach(card => {
                  card.classList.remove('selected');
                });
                
                // 添加当前卡片的选中状态
                templateCard.classList.add('selected');
                
                // 设置选中的模板ID
                selectedTemplateId = template.id;
                
                // 如果已经有解析的数据，重新渲染预览
                if (parsedResumeData) {
                  renderPreview();
                } else {
                  // 如果还没有解析数据，使用mock数据预览模板
                  renderTemplatePreview();
                }
              });
              
              templateList.appendChild(templateCard);
            });
            
            // 默认选中第一个模板
            if (templates.length > 0) {
              templateList.firstChild.classList.add('selected');
              selectedTemplateId = templates[0].id;
              // 使用mock数据预览第一个模板
              renderTemplatePreview();
            } else {
              // 如果没有模板，显示提示信息
              templateList.innerHTML = '<div class="no-templates">暂无模板，请使用AI生成模板</div>';
            }
          }
          
          // 绑定事件
          function bindEvents() {
            // 解析按钮事件
            parseBtn.addEventListener('click', parseResume);
            
            // 优化弹窗相关事件
            openOptimizeModal.addEventListener('click', () => {
              // 将输入框内容带到弹框中
              rawTextForOptimize.value = rawText.value;
              optimizeModal.style.display = 'flex';
            });
            
            // 提交优化
            submitOptimize.addEventListener('click', optimizeResume);
            
            // 复制优化后的内容
            copyOptimizedContent.addEventListener('click', () => {
              rawText.value = optimizeResultContent.innerText;
              optimizeModal.style.display = 'none';
            });
            
            // 点击弹窗外部关闭弹窗
            optimizeModal.addEventListener('click', (e) => {
              if (e.target === optimizeModal) {
                optimizeModal.style.display = 'none';
              }
            });
            
            // 关闭弹窗按钮事件
            closeButtons.forEach(button => {
              button.addEventListener('click', () => {
                optimizeModal.style.display = 'none';
                parsingModal.style.display = 'none';
                downloadingModal.style.display = 'none';
              });
            });
            
            // 成为会员链接点击事件
            document.addEventListener('click', function(e) {
              if (e.target.id === 'becomeVipLink') {
                e.preventDefault();
                document.getElementById('paymentModal').style.display = 'block';
              }
              
              // 取消支付按钮点击事件
              if (e.target.id === 'cancelPayment') {
                document.getElementById('paymentModal').style.display = 'none';
              }
              
              // 确认支付按钮点击事件
              if (e.target.id === 'confirmPayment') {
                document.getElementById('paymentModal').style.display = 'none';
              }
            });
            
            // 生成模板
            generateTemplateBtn.addEventListener('click', generateTemplate);
            
            // 下载PDF
            downloadPdfBtn.addEventListener('click', downloadPdf);
          }
          
          // 解析简历
          async function parseResume() {
            const text = rawText.value.trim();
            
            if (!text) {
              alert('请输入简历文本');
              return;
            }
            
            if (!selectedTemplateId) {
              alert('请选择一个模板');
              return;
            }
            
            // 显示解析弹窗
            parsingModal.style.display = 'flex';
            parseBtn.disabled = true;
            
            try {
              const response = await fetch('/api/resume/parse', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text: text })
              });
              
              const result = await response.json();
              
              if (result.success) {
                parsedResumeData = result.data;
                renderPreview();
              } else {
                alert('解析失败: ' + result.message);
              }
            } catch (error) {
              console.error('解析出错:', error);
              alert('解析过程中发生错误');
            } finally {
              // 隐藏解析弹窗
              parsingModal.style.display = 'none';
              parseBtn.disabled = false;
            }
          }
          
          // 渲染预览
          async function renderPreview() {
            if (!parsedResumeData || !selectedTemplateId) {
              return;
            }
            
            try {
              const response = await fetch('/api/resume/render', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  templateId: selectedTemplateId,
                  data: parsedResumeData
                })
              });
              
              const result = await response.json();
              
              if (result.success) {
                displayPreview(result.data.html);
              } else {
                displayPreviewError('渲染失败: ' + result.message);
              }
            } catch (error) {
              console.error('渲染出错:', error);
              displayPreviewError('渲染过程中发生错误');
            }
          }
          
          // 渲染模板预览（使用mock数据）
          async function renderTemplatePreview() {
            if (!selectedTemplateId) {
              return;
            }
            
            try {
              // 获取mock数据
              const mockResponse = await fetch('/mock/resume.json');
              const mockData = await mockResponse.json();
              
              const response = await fetch('/api/resume/render', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  templateId: selectedTemplateId,
                  data: mockData
                })
              });
              
              const result = await response.json();
              
              if (result.success) {
                displayPreview(result.data.html);
              } else {
                displayPreviewError('模板预览失败: ' + result.message);
              }
            } catch (error) {
              console.error('模板预览出错:', error);
              displayPreviewError('模板预览过程中发生错误');
            }
          }
          
          // 显示预览内容
          function displayPreview(htmlContent) {
            const previewContent = document.querySelector('.preview-content');
            
            // 创建包含完整HTML结构的页面
            const fullHtml = \`
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
                \${htmlContent}
              </body>
              </html>
            \`;
            
            // 使用Blob和URL.createObjectURL创建安全的预览页面
            const blob = new Blob([fullHtml], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            
            // 创建iframe并设置源为blob URL
            const iframe = document.createElement('iframe');
            iframe.style.width = '100%';
            iframe.style.border = 'none';
            iframe.style.display = 'block';
            iframe.style.height = '800px';
            
            // 监听加载事件以尝试调整高度
            iframe.onload = function() {
              try {
                // 尝试获取iframe内容的实际高度
                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                const body = iframeDoc.body;
                const html = iframeDoc.documentElement;
                
                // 计算实际内容高度
                const height = Math.max(
                  body.scrollHeight,
                  body.offsetHeight,
                  html.clientHeight,
                  html.scrollHeight,
                  html.offsetHeight
                );
                
                // 设置iframe高度（设置一个最小高度）
                iframe.style.height = Math.max(height, 600) + 'px';
              } catch (e) {
                // 跨域问题时使用默认高度
                iframe.style.height = '800px';
              }
            };
            
            iframe.src = url;
            
            // 清空容器并添加iframe
            previewContent.innerHTML = '';
            previewContent.appendChild(iframe);
            
            // 显示下载PDF按钮
            downloadPdfBtn.style.display = 'inline-block';
          }
          
          // 显示预览错误信息
          function displayPreviewError(message) {
            const previewContent = document.querySelector('.preview-content');
            previewContent.innerHTML = \`<div class="preview-placeholder"><p>\${message}</p></div>\`;
          }
          
          // 显示消息
          function showMessage(message, type) {
            // 移除现有消息
            const existingMessage = document.querySelector('.alert');
            if (existingMessage) {
              existingMessage.remove();
            }

            // 创建新消息
            const messageElement = document.createElement('div');
            messageElement.className = 'alert alert-' + type;
            messageElement.textContent = message;
            messageElement.style.cssText = 'position: fixed; top: 20px; right: 20px; padding: 15px 20px; border-radius: 8px; color: white; font-weight: 500; z-index: 1000; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); ' + (type === 'success' ? 'background-color: #4caf50;' : '') + (type === 'danger' ? 'background-color: #f44336;' : '');

            document.body.appendChild(messageElement);

            // 3秒后自动移除消息
            setTimeout(() => {
              if (messageElement.parentNode) {
                messageElement.remove();
              }
            }, 3000);
          }
          
          // 优化简历
          async function optimizeResume() {
            const text = rawTextForOptimize.value.trim();
            const prompt = optimizePrompt.value.trim();
            const jdInfo = document.getElementById('jdInfo').value.trim();
            
            if (!text) {
              alert('请输入简历文本');
              return;
            }
            
            // 显示优化指示器
            optimizeGeneratingIndicator.style.display = 'block';
            submitOptimize.disabled = true;
            
            try {
              const response = await fetch('/api/resume/optimize', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                  text: text,
                  prompt: prompt,
                  jd: jdInfo
                })
              });
              
              const result = await response.json();
              
              if (result.success) {
                optimizeResultContent.innerHTML = \`<pre style="white-space: pre-wrap; word-wrap: break-word;">\${result.data.optimizedText}</pre>\`;
                optimizeResult.style.display = 'block';
              } else {
                alert('优化失败: ' + result.message);
              }
            } catch (error) {
              console.error('优化出错:', error);
              alert('优化过程中发生错误');
            } finally {
              // 隐藏优化指示器
              optimizeGeneratingIndicator.style.display = 'none';
              submitOptimize.disabled = false;
            }
          }
          
          // 生成模板
          async function generateTemplate() {
            const description = templateDescription.value.trim();
            
            if (!description) {
              alert('请输入模板描述');
              return;
            }
            
            // 显示生成提示弹窗
            generatingTemplateModal.style.display = 'flex';
            
            // 禁用生成按钮
            generateTemplateBtn.disabled = true;
            
            try {
              const response = await fetch('/api/templates/generate', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ description: description })
              });
              
              const result = await response.json();
              
              if (result.success) {
                // 重新加载模板列表
                await loadTemplates();
                templateDescription.value = '';
                alert('模板生成成功');
              } else {
                alert('生成模板失败: ' + result.message);
              }
            } catch (error) {
              console.error('生成模板出错:', error);
              alert('生成模板过程中发生错误');
            } finally {
              // 隐藏生成提示弹窗
              generatingTemplateModal.style.display = 'none';
              generateTemplateBtn.disabled = false;
            }
          }
          
          // 上传PDF按钮事件
          if (uploadPdfBtn && pdfUpload) {
            uploadPdfBtn.addEventListener('click', function() {
              pdfUpload.click();
            });
            
            pdfUpload.addEventListener('change', function(e) {
              const file = e.target.files[0];
              if (file && file.type === 'application/pdf') {
                const formData = new FormData();
                formData.append('pdf', file);
                
                // 显示解析指示器
                parsingIndicator.style.display = 'inline';
                parseText.style.display = 'none';
                parseBtn.disabled = true;
                
                fetch('/api/resume/parse-pdf', {
                  method: 'POST',
                  body: formData
                })
                .then(response => response.json())
                .then(data => {
                  if (data.success) {
                    rawText.value = data.text;
                    showMessage('PDF解析成功，已填充到文本框中', 'success');
                  } else {
                    showMessage('PDF解析失败: ' + data.message, 'danger');
                  }
                })
                .catch(error => {
                  console.error('PDF解析出错:', error);
                  showMessage('PDF解析过程中发生错误', 'danger');
                })
                .finally(() => {
                  // 隐藏解析指示器
                  parsingIndicator.style.display = 'none';
                  parseText.style.display = 'inline';
                  parseBtn.disabled = false;
                });
              } else if (file) {
                showMessage('请选择一个有效的PDF文件', 'danger');
              }
            });
          }
          
          // 下载PDF
          async function downloadPdf() {
            // 检查用户是否已登录
            // 优先检查全局currentUser变量（登录后更新），其次检查页面加载时的user对象
            const user = typeof currentUser !== 'undefined' ? currentUser : ${JSON.stringify(user)};
            if (!user) {
              // 用户未登录，显示登录对话框
              document.getElementById('loginModal').style.display = 'block';
              return;
            }
            
            // 用户已登录，执行实际下载
            performDownload();
          }
          
          // 实际的下载逻辑
          async function performDownload() {
            const user = typeof currentUser !== 'undefined' ? currentUser : ${JSON.stringify(user)};
            
            // 检查用户下载次数（VIP用户不受限制）
            if (user && !user.isVIP && user.downloadCount <= 0) {
              alert('您的下载次数已用完，请升级为VIP用户以获得无限下载次数');
              return;
            }
            
            if (!parsedResumeData || !selectedTemplateId) {
              alert('请先解析简历并选择模板');
              return;
            }
            
            // 显示下载弹窗
            downloadingModal.style.display = 'flex';
            
            try {
              const response = await fetch('/api/resume/generate-pdf', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  templateId: selectedTemplateId,
                  data: parsedResumeData
                })
              });
              
              if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = '简历.pdf';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
                
                // 更新用户下载次数（非VIP用户）
                if (user && !user.isVIP) {
                  try {
                    await fetch('/api/user/update-download-count', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json'
                      },
                      body: JSON.stringify({
                        userId: user.id
                      })
                    });
                  } catch (error) {
                    console.error('更新下载次数失败:', error);
                  }
                }
              } else {
                const result = await response.json();
                alert('生成PDF失败: ' + (result.message || '未知错误'));
              }
            } catch (error) {
              console.error('下载PDF出错:', error);
              alert('下载PDF过程中发生错误');
            } finally {
              // 隐藏下载弹窗
              setTimeout(() => {
                downloadingModal.style.display = 'none';
              }, 500); // 延迟隐藏弹窗，确保用户能看到下载完成的提示
            }
          }
          
          
          // 登录表单提交处理
          document.getElementById('loginForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const username = document.getElementById('loginUsername').value;
            const password = document.getElementById('loginPassword').value;
            
            try {
              const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
              });
              
              const result = await response.json();
              
              if (result.success) {
                // 登录成功，关闭登录对话框
                document.getElementById('loginModal').style.display = 'none';
                // 显示成功消息
                showMessage('登录成功！', 'success');
                // 更新页面右上角的用户信息
                const userInfoElement = document.querySelector('.user-info');
                if (userInfoElement) {
                  userInfoElement.innerHTML = '当前用户: ' + result.data.username + ' | <a href="/logout" class="nav-link">登出</a>';
                }
                // 更新导航栏中的成为会员链接
                const navLinks = document.querySelector('.nav-links');
                if (navLinks && result.data && !result.data.isVIP) {
                  const becomeVipLink = document.createElement('a');
                  becomeVipLink.href = '#';
                  becomeVipLink.className = 'nav-link';
                  becomeVipLink.id = 'becomeVipLink';
                  becomeVipLink.textContent = '成为会员';
                  navLinks.insertBefore(becomeVipLink, userInfoElement);
                }
                // 更新全局用户变量
                window.currentUser = result.data;
                // 更新会话中的用户信息
                fetch('/api/update-session-user', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({ user: result.data })
                }).catch(error => {
                  console.error('更新会话用户信息失败:', error);
                });
                // 重新执行下载操作，但这次绕过登录检查
                setTimeout(() => {
                  // 直接调用下载逻辑，跳过用户检查
                  performDownload();
                }, 1000);
              } else {
                alert('登录失败: ' + result.message);
              }
            } catch (error) {
              console.error('登录出错:', error);
              alert('登录过程中发生错误');
            }
          });
          
          // 关闭登录对话框
          document.getElementById('closeLoginModal').addEventListener('click', function() {
            document.getElementById('loginModal').style.display = 'none';
          });
          
          // 点击对话框外部关闭
          window.addEventListener('click', function(e) {
            const loginModal = document.getElementById('loginModal');
            if (e.target === loginModal) {
              loginModal.style.display = 'none';
            }
          });
        </script>
    </body>
    </html>
  `);
});

module.exports = router;

