/**
 * 通义千问服务
 * 提供与通义千问大模型交互的功能
 */

const OpenAI = require('openai');

class QwenService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.QWEN_API_KEY || process.env.DASHSCOPE_API_KEY,
      baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    });
  }

  /**
   * 构建解析提示词
   * @param {string} text - 需要解析的非结构化文本
   * @returns {Array} 构建好的消息数组
   */
  buildParsePrompt(text) {
    return [
      {
        role: "system",
        content: "你是一个专业的简历分析助手。请将以下简历文本内容解析为标准的JSON格式，严格按照指定的数据结构组织信息。"
      },
      {
        role: "user",
        content: `要求：
1. 提取姓名、联系方式、教育背景、工作经历、技能专长、项目经验等信息
2. 工作经历和教育背景如果有多个，请以数组形式组织
3. 保持信息的准确性，不要添加未提及的内容
5. 严格按照以下JSON格式输出，不要包含任何其他内容（json中的showContent字段对应的值是将json中其他内容转换成markdown的格式给到用户查看的内容）：

{
  "name": "张三",
  "jobTitle": "高级软件工程师",
  "phone": "138-0000-0000",
  "email": "zhangsan@example.com",
  "address": "北京市朝阳区某某街道1001号",
  "summary": "具有5年以上软件开发经验的高级工程师，专注于Web应用开发和系统架构设计。在团队协作、技术方案设计和项目管理方面有丰富经验，致力于通过技术创新提升产品价值。",
  "workExperience": [
    {
      "company": "某某科技有限公司",
      "position": "高级软件工程师",
      "startDate": "2020-03",
      "endDate": "至今",
      "responsibilities": [
        "负责公司核心产品的后端架构设计和开发工作",
        "带领3人技术团队完成多个重要功能模块的开发",
        "优化系统性能，将响应速度提升40%",
        "参与技术选型和开发规范制定"
      ]
    },
    {
      "company": "某某互联网公司",
      "position": "软件工程师",
      "startDate": "2018-07",
      "endDate": "2020-02",
      "responsibilities": [
        "参与公司电商平台的开发和维护工作",
        "负责订单系统的重构，提高系统稳定性",
        "实现商品推荐算法，提升用户转化率15%",
        "协助测试团队完成系统测试和问题修复"
      ]
    },
    {
      "company": "某某软件公司",
      "position": "初级软件工程师",
      "startDate": "2016-06",
      "endDate": "2018-06",
      "responsibilities": [
        "参与企业内部管理系统的开发",
        "负责数据库设计和优化工作",
        "编写技术文档和用户手册",
        "协助团队完成项目部署和维护"
      ]
    }
  ],
  "education": [
    {
      "school": "某某大学",
      "degree": "学士学位",
      "major": "计算机科学与技术",
      "startDate": "2012-09",
      "endDate": "2016-06"
    },
    {
      "school": "某某高中",
      "degree": "高中",
      "major": "理科",
      "startDate": "2009-09",
      "endDate": "2012-06"
    }
  ],
  "skills": [
    "JavaScript/TypeScript",
    "Node.js",
    "React/Vue",
    "Python",
    "MySQL/Redis",
    "Docker/Kubernetes",
    "AWS/阿里云",
    "Git/Mercurial",
    "敏捷开发",
    "系统架构设计"
  ],
  "projects": [
    {
      "name": "电商平台订单系统重构",
      "description": "主导订单系统的重构工作，通过引入微服务架构和消息队列，将系统处理能力提升3倍，错误率降低80%。"
    },
    {
      "name": "在线教育平台",
      "description": "参与开发在线教育平台，负责课程管理和学习记录模块。平台上线后服务超过10万用户，获得良好口碑。"
    },
    {
      "name": "企业内部协作工具",
      "description": "独立设计并开发了企业内部使用的协作工具，整合了任务管理、文档共享和即时通讯功能，提高了团队协作效率。"
    }
  ],
  "languages": "普通话（母语），英语（熟练，CET-6）",
  "showContent": "xxxx"
}

需要解析的简历文本：
${text}`
      }
    ];
  }

  /**
   * 构建优化提示词
   * @param {string} content - 需要优化的内容
   * @param {string} context - 上下文信息
   * @returns {Array} 构建好的消息数组
   */
  buildOptimizePrompt(content, context = '') {
    return [
      {
        role: "system",
        content: "你是一个专业的简历写作顾问。请对以下简历内容进行优化，使其更加专业、简洁、有吸引力。"
      },
      {
        role: "user",
        content: `要求：
1. 保持原意不变，仅优化表达方式
2. 使用更专业、更有力的词汇
3. 确保语句通顺、逻辑清晰
4. 突出成就和贡献，使用量化数据（如果适用）
5. 保持简洁，避免冗长
6. 仅输出优化后的内容即可

需要优化的内容：
${content}

上下文信息（如果有）：
${context}`
      }
    ];
  }

  /**
   * 构建模板生成提示词
   * @param {string} userDescription - 用户对模板的描述需求
   * @returns {Array} 构建好的消息数组
   */
  buildTemplatePrompt(userDescription) {
    return [
      {
        role: "system",
        content: "你是一个专业的前端设计师，请根据用户需求设计一个精美的简历HTML模板。"
      },
      {
        role: "user",
        content: `要求：
1. 使用标准HTML5格式，包含完整的DOCTYPE声明
2. 使用内联CSS样式，不要使用外部样式表
3. 模板中需要包含以下占位符：{{name}}, {{jobTitle}}, {{phone}}, {{email}}, {{address}}, {{summary}}
4. 工作经历部分使用{{#each workExperience}}循环，包含{{company}}, {{position}}, {{startDate}}, {{endDate}}, {{#each responsibilities}}
5. 教育背景部分使用{{#each education}}循环，包含{{school}}, {{degree}}, {{major}}, {{startDate}}, {{endDate}}
6. 技能专长部分使用{{#each skills}}循环，包含{{this}}
7. 项目经验部分使用{{#each projects}}循环，包含{{name}}, {{description}}
8. 语言能力使用{{languages}}
9. 确保模板响应式设计，适合打印
10. 不要包含任何解释性文字，只返回HTML代码

用户需求：
${userDescription}

请生成符合以上要求的简历HTML模板：`
      }
    ];
  }

  /**
   * 解析非结构化文本
   * @param {string} text - 需要解析的非结构化文本
   * @returns {Promise<Object>} 解析结果
   */
  async parseResumeText(text) {
    try {
      const messages = this.buildParsePrompt(text);
      const completion = await this.openai.chat.completions.create({
        model: "deepseek-v3",
        messages: messages,
        temperature: 0.7,
        max_tokens: 2000,
      });

      const responseText = completion.choices[0].message.content;
      
      // 提取JSON部分
      const jsonStart = responseText.indexOf('{');
      const jsonEnd = responseText.lastIndexOf('}') + 1;
      if (jsonStart !== -1 && jsonEnd !== -1) {
        const jsonString = responseText.substring(jsonStart, jsonEnd);
        const parsedData = JSON.parse(jsonString);
        return parsedData;
      }
      
      throw new Error('无法从响应中提取有效的JSON数据');
    } catch (error) {
      console.error('解析简历文本失败:', error);
      throw error;
    }
  }

  /**
   * 优化简历内容
   * @param {string} content - 需要优化的内容
   * @param {string} context - 上下文信息
   * @returns {Promise<string>} 优化后的内容
   */
  async optimizeContent(content, context = '') {
    try {
      const messages = this.buildOptimizePrompt(content, context);
      const completion = await this.openai.chat.completions.create({
        model: "qwen-plus",
        messages: messages,
        temperature: 0.7,
        max_tokens: 1500,
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error('优化内容失败:', error);
      throw error;
    }
  }

  /**
   * 生成简历模板
   * @param {string} userDescription - 用户对模板的描述需求
   * @returns {Promise<string>} 生成的HTML模板
   */
  async generateTemplate(userDescription) {
    try {
      const messages = this.buildTemplatePrompt(userDescription);
      const completion = await this.openai.chat.completions.create({
        model: "qwen-plus",
        messages: messages,
        temperature: 0.8,
        max_tokens: 3000,
      });

      const responseText = completion.choices[0].message.content;
      
      // 提取HTML部分
      const htmlStart = responseText.indexOf('<!DOCTYPE html>');
      const htmlEnd = responseText.lastIndexOf('</html>') + 7;
      
      if (htmlStart !== -1 && htmlEnd !== -1) {
        return responseText.substring(htmlStart, htmlEnd);
      }
      
      throw new Error('无法从AI响应中提取有效的HTML模板');
    } catch (error) {
      console.error('生成模板失败:', error);
      throw error;
    }
  }
}

module.exports = new QwenService();
