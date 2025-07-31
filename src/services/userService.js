const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcrypt');

const usersFilePath = path.join(__dirname, '../../data/users.json');

/**
 * 获取所有用户
 */
const getAllUsers = async () => {
  try {
    const data = await fs.readFile(usersFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    throw new Error('无法读取用户数据');
  }
};

/**
 * 根据用户名或手机号查找用户
 */
const findUser = async (username, phone) => {
  try {
    const users = await getAllUsers();
    return users.find(user => 
      user.username === username || user.phone === phone
    );
  } catch (error) {
    throw new Error('查找用户时出错');
  }
};

/**
 * 根据用户名查找用户
 */
const findUserByUsername = async (username) => {
  try {
    const users = await getAllUsers();
    return users.find(user => user.username === username);
  } catch (error) {
    throw new Error('查找用户时出错');
  }
};

/**
 * 检查用户是否为VIP
 */
const isUserVip = async (username) => {
  try {
    const user = await findUserByUsername(username);
    return user ? user.isVip === true : false;
  } catch (error) {
    throw new Error('检查用户VIP状态时出错');
  }
};

/**
 * 创建新用户
 */
const createUser = async (userData) => {
  try {
    const users = await getAllUsers();
    
    // 检查用户名或手机号是否已存在
    const existingUser = users.find(user => 
      user.username === userData.username || user.phone === userData.phone
    );
    
    if (existingUser) {
      throw new Error('用户名或手机号已存在');
    }
    
    // 密码加密
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    // 确保所有新用户默认都是非VIP用户
    const newUser = {
      id: Date.now().toString(),
      username: userData.username,
      phone: userData.phone,
      password: hashedPassword,
      isVip: false, // 默认都是非VIP用户
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2));
    
    // 返回用户信息（不包含密码）
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  } catch (error) {
    throw error;
  }
};

/**
 * 验证用户登录
 */
const validateUser = async (username, password) => {
  try {
    const users = await getAllUsers();
    const user = users.find(user => 
      user.username === username || user.phone === username
    );
    
    if (user && await bcrypt.compare(password, user.password)) {
      // 返回用户信息（不包含密码）
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
    
    return null;
  } catch (error) {
    throw new Error('验证用户时出错');
  }
};

module.exports = {
  getAllUsers,
  findUser,
  findUserByUsername,
  isUserVip,
  createUser,
  validateUser
};
