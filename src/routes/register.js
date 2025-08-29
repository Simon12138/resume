const express = require('express');
const router = express.Router();
const userService = require('../services/userService');

// 显示注册页面
router.get('/register', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>用户注册 - 简历智能助手</title>
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
                </nav>
            </div>
        </header>
        
        <div class="container" style="max-width: 500px; margin: 50px auto;">
            <div class="card">
                <div class="card-header">
                    <h2>用户注册</h2>
                </div>
                <form id="registerForm">
                    <div class="form-group">
                        <label for="username">用户名</label>
                        <input type="text" id="username" name="username" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="phone">手机号</label>
                        <input type="tel" id="phone" name="phone" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="password">密码</label>
                        <input type="password" id="password" name="password" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="confirmPassword">确认密码</label>
                        <input type="password" id="confirmPassword" name="confirmPassword" required>
                    </div>
                    
                    <button type="submit" class="btn btn-primary" style="width: 100%;">注册</button>
                </form>
                <div style="margin-top: 20px; text-align: center;">
                    <p>已有账户？<a href="/login" class="nav-link">立即登录</a></p>
                </div>
            </div>
        </div>
        
        <script>
            document.getElementById('registerForm').addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const username = document.getElementById('username').value;
                const phone = document.getElementById('phone').value;
                const password = document.getElementById('password').value;
                const confirmPassword = document.getElementById('confirmPassword').value;
                
                if (password !== confirmPassword) {
                    alert('两次输入的密码不一致');
                    return;
                }
                
                try {
                    const response = await fetch('/api/register', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ username, phone, password })
                    });
                    
                    const result = await response.json();
                    
                    if (result.success) {
                        alert('注册成功');
                        window.location.href = '/login';
                    } else {
                        alert(result.message || '注册失败');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    alert('注册过程中发生错误');
                }
            });
        </script>
    </body>
    </html>
  `);
});

// 显示登录页面
router.get('/login', (req, res) => {
  // 如果用户已登录，重定向到简历页面
  if (req.session && req.session.user) {
    return res.redirect('/resume');
  }
  
  res.send(`
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>用户登录 - 简历智能助手</title>
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
                </nav>
            </div>
        </header>
        
        <div class="container" style="max-width: 500px; margin: 50px auto;">
            <div class="card">
                <div class="card-header">
                    <h2>用户登录</h2>
                </div>
                <form id="loginForm">
                    <div class="form-group">
                        <label for="username">用户名或手机号</label>
                        <input type="text" id="username" name="username" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="password">密码</label>
                        <input type="password" id="password" name="password" required>
                    </div>
                    
                    <button type="submit" class="btn btn-primary" style="width: 100%;">登录</button>
                </form>
                <div style="margin-top: 20px; text-align: center;">
                    <p>还没有账户？<a href="/register" class="nav-link">立即注册</a></p>
                </div>
            </div>
        </div>
        
        <script>
            document.getElementById('loginForm').addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const username = document.getElementById('username').value;
                const password = document.getElementById('password').value;
                
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
                        // 更新会话中的用户信息
                        await fetch('/api/update-session-user', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ user: result.data })
                        }).catch(error => {
                            console.error('更新会话用户信息失败:', error);
                        });
                        
                        window.location.href = '/resume';
                    } else {
                        alert(result.message || '登录失败');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    alert('登录过程中发生错误');
                }
            });
        </script>
    </body>
    </html>
  `);
});

// 登出
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;
