const express = require('express');
const router = express.Router();
const renderService = require('../services/renderService');

// 首页
router.get('/', (req, res) => {
  // 检查用户是否已登录
  const isLoggedIn = req.session && req.session.user;
  const user = isLoggedIn ? req.session.user : null;
  
  res.send(`
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>简历智能助手</title>
        <link rel="stylesheet" href="/css/style.css">
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
                    <a href="/resume" class="nav-link">创建简历</a>
                    ${isLoggedIn ? 
                      `<span class="user-info">欢迎, ${user.username} | <a href="/logout" class="nav-link">登出</a></span>` : 
                      `<a href="/login" class="nav-link">登录</a>
                       <a href="/register" class="nav-link">注册</a>`}
                </nav>
            </div>
        </header>
        
        <div class="container">
            <div class="card hero-card">
                <div class="card-header">
                    <h2>欢迎使用简历智能助手</h2>
                </div>
                <p>通过本系统，您可以快速创建专业、精美的个人简历。</p>
                <p>系统集成了通义千问大模型，能够帮助您优化简历内容，提供多种精美模板供您选择。</p>
                <div class="btn-group">
                  <a href="/resume" class="btn btn-success">开始创建简历</a>
                </div>
            </div>
            
            <div class="features-section">
                <h2 class="section-title">核心功能</h2>
                <div class="features-grid">
                    <div class="feature-card">
                        <div class="feature-icon">📝</div>
                        <h3>智能解析</h3>
                        <p>将非结构化文本简历自动解析为结构化数据，提取关键信息如基本信息、教育背景、工作经历等</p>
                    </div>
                    
                    <div class="feature-card">
                        <div class="feature-icon">✨</div>
                        <h3>内容优化</h3>
                        <p>利用通义千问大模型优化简历内容，提升表达效果，突出个人优势和成就</p>
                    </div>
                    
                    <div class="feature-card">
                        <div class="feature-icon">🎨</div>
                        <h3>多样模板</h3>
                        <p>提供多种精美简历模板，满足不同行业和职位需求，支持自定义模板生成</p>
                    </div>
                    
                    <div class="feature-card">
                        <div class="feature-icon">📄</div>
                        <h3>一键导出</h3>
                        <p>支持PDF格式导出，保持格式一致性，方便打印和分享</p>
                    </div>
                </div>
            </div>
            
            <div class="workflow-section">
                <h2 class="section-title">使用流程</h2>
                <div class="workflow-steps">
                    <div class="workflow-step">
                        <div class="step-number">1</div>
                        <h3>智能创建模板</h3>
                        <p>使用AI根据描述智能创建个性化简历模板</p>
                    </div>
                    
                    <div class="workflow-step">
                        <div class="step-number">2</div>
                        <h3>选择心仪模板</h3>
                        <p>从多种模板中选择最符合您需求的样式</p>
                    </div>
                    
                    <div class="workflow-step">
                        <div class="step-number">3</div>
                        <h3>输入简历内容</h3>
                        <p>粘贴或输入您的简历文本内容</p>
                    </div>
                    
                    <div class="workflow-step">
                        <div class="step-number">4</div>
                        <h3>智能优化内容</h3>
                        <p>使用AI优化简历内容，提升表达效果</p>
                    </div>
                    
                    <div class="workflow-step">
                        <div class="step-number">5</div>
                        <h3>智能解析简历</h3>
                        <p>系统自动解析优化后的简历内容，提取结构化信息</p>
                    </div>
                    
                    <div class="workflow-step">
                        <div class="step-number">6</div>
                        <h3>预览与导出</h3>
                        <p>预览最终效果并导出为PDF格式</p>
                    </div>
                </div>
            </div>
        </div>
        
        <style>
            .logo-container {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .logo {
                font-size: 28px;
            }
            
            .user-info {
                color: var(--text-secondary);
                font-size: 15px;
            }
            
            .user-info a {
                color: var(--primary-color);
                text-decoration: none;
                margin-left: 4px;
            }
            
            .hero-card {
                text-align: center;
                padding: 50px 40px;
            }
            
            .hero-card .card-header {
                border-bottom: none;
                margin-bottom: 20px;
            }
            
            .hero-card .card-header h2 {
                font-size: 36px;
            }
            
            .hero-card p {
                font-size: 18px;
                color: #666;
                max-width: 600px;
                margin: 0 auto 20px;
                line-height: 1.6;
            }
            
            .btn-group {
                margin-top: 30px;
                justify-content: center;
            }
            
            .section-title {
                text-align: center;
                font-size: 28px;
                margin: 50px 0 30px;
                font-weight: 600;
                color: #1d1d1f;
            }
            
            .features-section {
                margin-top: 40px;
            }
            
            .features-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 30px;
                margin-top: 30px;
            }
            
            .feature-card {
                background: white;
                border-radius: 12px;
                padding: 30px;
                text-align: center;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
                transition: all 0.3s ease;
                border: 1px solid #d2d2d7;
            }
            
            .feature-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 15px 40px rgba(0, 0, 0, 0.12);
            }
            
            .feature-icon {
                font-size: 48px;
                margin-bottom: 20px;
            }
            
            .feature-card h3 {
                font-size: 22px;
                margin-bottom: 15px;
                color: #1d1d1f;
            }
            
            .feature-card p {
                color: #86868b;
                line-height: 1.6;
            }
            
            .workflow-section {
                margin: 60px 0;
            }
            
            .workflow-steps {
                display: flex;
                justify-content: space-between;
                flex-wrap: wrap;
                margin-top: 40px;
                position: relative;
            }
            
            .workflow-steps::before {
                content: '';
                position: absolute;
                top: 30px;
                left: 50px;
                right: 50px;
                height: 2px;
                background: #d2d2d7;
                z-index: 1;
            }
            
            .workflow-step {
                flex: 1;
                min-width: 180px;
                text-align: center;
                position: relative;
                z-index: 2;
                padding: 0 10px;
            }
            
            .step-number {
                width: 60px;
                height: 60px;
                background: #0071e3;
                color: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                font-weight: 600;
                margin: 0 auto 20px;
            }
            
            .workflow-step h3 {
                font-size: 20px;
                margin-bottom: 10px;
                color: #1d1d1f;
            }
            
            .workflow-step p {
                color: #86868b;
            }
            
            @media (max-width: 768px) {
                .workflow-steps::before {
                    display: none;
                }
                
                .workflow-step {
                    flex: 0 0 100%;
                    margin-bottom: 30px;
                }
                
                .features-grid {
                    grid-template-columns: 1fr;
                }
            }
        </style>
    </body>
    </html>
  `);
});

// 简历预览页面
router.get('/preview/:generatedId', (req, res) => {
  console.log("preview", req.params);
  const { generatedId } = req.params;
  
  // 获取生成的简历
  const result = renderService.getGeneratedResume(generatedId);
  
  if (!result.success) {
    return res.status(404).send('<h1>简历不存在或已过期</h1>');
  }

  console.log("result", result);
  const generatedResume = result.data;
  
  res.send(`
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>简历预览 - 简历智能助手</title>
        <link rel="stylesheet" href="/css/style.css">
        <style>
            @media print {
                .header, .preview-header {
                    display: none;
                }
                body {
                    background-color: white;
                    padding: 0;
                }
                .resume-frame {
                    box-shadow: none;
                    border-radius: 0;
                    border: none;
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
                    <a href="/resume" class="nav-link">创建简历</a>
                </nav>
            </div>
        </header>
        
        <div class="preview-header">
            <div class="container">
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 20px 0;">
                    <h2>简历预览</h2>
                    <div>
                        <button onclick="window.print()" class="btn btn-primary" style="margin-right: 10px;">打印简历</button>
                        <button id="downloadPdf" class="btn btn-success">下载PDF</button>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="container">
            <iframe 
                srcdoc="${generatedResume.html.replace(/"/g, '&quot;')}" 
                class="resume-frame" 
                style="width: 100%; height: 800px; border: 1px solid #ddd; border-radius: 8px;"
                title="简历预览">
            </iframe>
        </div>
        
        <script>
            document.getElementById('downloadPdf').addEventListener('click', async function() {
                try {
                    const response = await fetch('/api/resume/${generatedId}/pdf', {
                        method: 'GET'
                        ${req.session && req.session.user ? '' : ', credentials: "include"'}
                    });
                    
                    if (response.ok) {
                        const blob = await response.blob();
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = '简历.pdf';
                        document.body.appendChild(a);
                        a.click();
                        window.URL.revokeObjectURL(url);
                        document.body.removeChild(a);
                    } else {
                        alert('下载失败');
                    }
                } catch (error) {
                    console.error('下载出错:', error);
                    alert('下载过程中发生错误');
                }
            });
        </script>
    </body>
    </html>
  `);
});

module.exports = router;
