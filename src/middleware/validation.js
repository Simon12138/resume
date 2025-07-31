/**
 * 数据验证中间件
 * 提供API请求数据验证功能
 */

/**
 * 验证简历ID参数
 */
const validateResumeId = (req, res, next) => {
  const { id } = req.params;
  
  if (!id || id.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: '简历ID是必需的'
    });
  }
  
  next();
};

/**
 * 验证简历创建请求体
 */
const validateResumeCreation = (req, res, next) => {
  const resumeData = req.body;
  
  if (!resumeData || typeof resumeData !== 'object') {
    return res.status(400).json({
      success: false,
      message: '请求体必须包含简历数据'
    });
  }
  
  next();
};

/**
 * 验证简历更新请求体
 */
const validateResumeUpdate = (req, res, next) => {
  const updateData = req.body;
  
  if (!updateData || typeof updateData !== 'object') {
    return res.status(400).json({
      success: false,
      message: '请求体必须包含更新数据'
    });
  }
  
  next();
};

module.exports = {
  validateResumeId,
  validateResumeCreation,
  validateResumeUpdate
};
