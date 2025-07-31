document.addEventListener('DOMContentLoaded', function() {
  const resumeForm = document.getElementById('resumeForm');
  const aiParseSection = document.getElementById('aiParseSection');
  const aiParseBtn = document.getElementById('aiParseBtn');
  const cancelParseBtn = document.getElementById('cancelParseBtn');
  const parseBtn = document.getElementById('parseBtn');
  const rawText = document.getElementById('rawText');
  const parseLoading = document.getElementById('parseLoading');
  const parseResult = document.getElementById('parseResult');
  const optimizeBtn = document.getElementById('optimizeBtn');

  // AI解析按钮事件
  if (aiParseBtn) {
    aiParseBtn.addEventListener('click', function() {
      aiParseSection.style.display = 'block';
      aiParseBtn.style.display = 'none';
    });
  }

  // 取消AI解析按钮事件
  if (cancelParseBtn) {
    cancelParseBtn.addEventListener('click', function() {
      aiParseSection.style.display = 'none';
      if (aiParseBtn) {
        aiParseBtn.style.display = 'inline-block';
      }
    });
  }

  // 解析按钮事件
  if (parseBtn) {
    parseBtn.addEventListener('click', async function() {
      const text = rawText.value.trim();
      
      if (!text) {
        showMessage('请输入简历文本', 'danger');
        return;
      }

      parseLoading.style.display = 'inline-block';
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
          // 填充表单
          document.getElementById('name').value = result.data.name || '';
          document.getElementById('jobTitle').value = result.data.jobTitle || '';
          document.getElementById('phone').value = result.data.phone || '';
          document.getElementById('email').value = result.data.email || '';
          document.getElementById('address').value = result.data.address || '';
          document.getElementById('summary').value = result.data.summary || '';
          
          // 清空现有工作经历
          const workContainer = document.getElementById('workExperienceContainer');
          if (workContainer) {
            workContainer.innerHTML = '';
          }
          
          // 清空现有教育背景
          const eduContainer = document.getElementById('educationContainer');
          if (eduContainer) {
            eduContainer.innerHTML = '';
          }
          
          // 清空现有技能
          const skillsContainer = document.getElementById('skillsContainer');
          if (skillsContainer) {
            skillsContainer.innerHTML = '';
          }
          
          // 清空现有项目经验
          const projectsContainer = document.getElementById('projectsContainer');
          if (projectsContainer) {
            projectsContainer.innerHTML = '';
          }
          
          showMessage('解析成功，已填充到表单中', 'success');
          aiParseSection.style.display = 'none';
          if (aiParseBtn) {
            aiParseBtn.style.display = 'inline-block';
          }
        } else {
          showMessage('解析失败: ' + result.message, 'danger');
        }
      } catch (error) {
        console.error('解析出错:', error);
        showMessage('解析过程中发生错误', 'danger');
      } finally {
        parseLoading.style.display = 'none';
        parseBtn.disabled = false;
      }
    });
  }

  // 优化按钮事件
  if (optimizeBtn) {
    optimizeBtn.addEventListener('click', async function() {
      // 收集表单数据
      const formData = new FormData(resumeForm);
      const resumeData = {
        name: formData.get('name'),
        jobTitle: formData.get('jobTitle'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        address: formData.get('address'),
        summary: formData.get('summary')
      };

      // 收集工作经历
      const workCompanies = formData.getAll('workCompany[]');
      const workPositions = formData.getAll('workPosition[]');
      const workStartDates = formData.getAll('workStartDate[]');
      const workEndDates = formData.getAll('workEndDate[]');
      const workCurrent = formData.getAll('workCurrent[]');
      const workResponsibilities = formData.getAll('workResponsibilities[]');

      resumeData.workExperience = workCompanies.map((company, index) => ({
        company,
        position: workPositions[index],
        startDate: workStartDates[index],
        endDate: workEndDates[index],
        current: workCurrent.includes(index.toString()),
        responsibilities: workResponsibilities[index] ? workResponsibilities[index].split('\\n').filter(r => r.trim() !== '') : []
      }));

      // 收集教育背景
      const schools = formData.getAll('school[]');
      const majors = formData.getAll('major[]');
      const degrees = formData.getAll('degree[]');
      const eduStartDates = formData.getAll('eduStartDate[]');
      const eduEndDates = formData.getAll('eduEndDate[]');

      resumeData.education = schools.map((school, index) => ({
        school,
        major: majors[index],
        degree: degrees[index],
        startDate: eduStartDates[index],
        endDate: eduEndDates[index]
      }));

      // 收集技能
      resumeData.skills = formData.getAll('skills[]').filter(skill => skill.trim() !== '');

      // 收集项目经验
      const projectNames = formData.getAll('projectName[]');
      const projectLinks = formData.getAll('projectLink[]');
      const projectDescriptions = formData.getAll('projectDescription[]');

      resumeData.projects = projectNames.map((name, index) => ({
        name,
        link: projectLinks[index],
        description: projectDescriptions[index]
      }));

      try {
        const response = await fetch('/api/resume/optimize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ resume: resumeData })
        });

        const result = await response.json();

        if (result.success) {
          // 更新表单内容
          document.getElementById('summary').value = result.data.summary || '';
          
          showMessage('优化成功，已更新相关内容', 'success');
        } else {
          showMessage('优化失败: ' + result.message, 'danger');
        }
      } catch (error) {
        console.error('优化出错:', error);
        showMessage('优化过程中发生错误', 'danger');
      }
    });
  }

  // 添加工作经历
  document.getElementById('addWork')?.addEventListener('click', function() {
    const container = document.getElementById('workExperienceContainer');
    const index = container.children.length;
    const workItem = document.createElement('div');
    workItem.className = 'work-experience-item';
    workItem.innerHTML = '\
      <div class="form-row">\
        <div class="form-col">\
          <div class="form-group">\
            <label>公司名称:</label>\
            <input type="text" name="workCompany[]" required>\
          </div>\
        </div>\
        <div class="form-col">\
          <div class="form-group">\
            <label>职位:</label>\
            <input type="text" name="workPosition[]" required>\
          </div>\
        </div>\
      </div>\
      <div class="form-row">\
        <div class="form-col">\
          <div class="form-group">\
            <label>开始时间:</label>\
            <input type="month" name="workStartDate[]">\
          </div>\
        </div>\
        <div class="form-col">\
          <div class="form-group">\
            <label>结束时间:</label>\
            <input type="month" name="workEndDate[]">\
            <div style="margin-top: 8px;">\
              <input type="checkbox" id="workCurrent' + index + '" name="workCurrent[]" value="' + index + '">\
              <label for="workCurrent' + index + '" style="display: inline; margin-left: 5px;">至今</label>\
            </div>\
          </div>\
        </div>\
      </div>\
      <div class="form-group">\
        <label>职责描述:</label>\
        <textarea name="workResponsibilities[]" placeholder="每行一条职责"></textarea>\
      </div>\
      <div class="btn-group">\
        <button type="button" class="btn btn-danger btn-sm remove-work">删除工作经历</button>\
      </div>\
    ';
    container.appendChild(workItem);
  });

  // 添加教育背景
  document.getElementById('addEducation')?.addEventListener('click', function() {
    const container = document.getElementById('educationContainer');
    const eduItem = document.createElement('div');
    eduItem.className = 'education-item';
    eduItem.innerHTML = '\
      <div class="form-row">\
        <div class="form-col">\
          <div class="form-group">\
            <label>学校:</label>\
            <input type="text" name="school[]" required>\
          </div>\
        </div>\
        <div class="form-col">\
          <div class="form-group">\
            <label>专业:</label>\
            <input type="text" name="major[]" required>\
          </div>\
        </div>\
      </div>\
      <div class="form-row">\
        <div class="form-col">\
          <div class="form-group">\
            <label>学位:</label>\
            <input type="text" name="degree[]">\
          </div>\
        </div>\
        <div class="form-col">\
          <div class="form-group">\
            <label>开始时间:</label>\
            <input type="month" name="eduStartDate[]">\
          </div>\
        </div>\
        <div class="form-col">\
          <div class="form-group">\
            <label>结束时间:</label>\
            <input type="month" name="eduEndDate[]">\
          </div>\
        </div>\
      </div>\
      <div class="btn-group">\
        <button type="button" class="btn btn-danger btn-sm remove-education">删除教育背景</button>\
      </div>\
    ';
    container.appendChild(eduItem);
  });

  // 添加技能
  document.getElementById('addSkill')?.addEventListener('click', function() {
    const container = document.getElementById('skillsContainer');
    const skillItem = document.createElement('div');
    skillItem.className = 'skill-item';
    skillItem.innerHTML = '\
      <div class="form-group">\
        <input type="text" name="skills[]" placeholder="技能名称">\
      </div>\
      <button type="button" class="btn btn-danger btn-sm remove-skill">删除</button>\
    ';
    container.appendChild(skillItem);
  });

  // 添加项目经验
  document.getElementById('addProject')?.addEventListener('click', function() {
    const container = document.getElementById('projectsContainer');
    const projectItem = document.createElement('div');
    projectItem.className = 'project-item';
    projectItem.innerHTML = '\
      <div class="form-row">\
        <div class="form-col">\
          <div class="form-group">\
            <label>项目名称:</label>\
            <input type="text" name="projectName[]" required>\
          </div>\
        </div>\
        <div class="form-col">\
          <div class="form-group">\
            <label>项目链接:</label>\
            <input type="url" name="projectLink[]" placeholder="https://...">\
          </div>\
        </div>\
      </div>\
      <div class="form-group">\
        <label>项目描述:</label>\
        <textarea name="projectDescription[]" placeholder="项目描述"></textarea>\
      </div>\
      <div class="btn-group">\
        <button type="button" class="btn btn-danger btn-sm remove-project">删除项目</button>\
      </div>\
    ';
    container.appendChild(projectItem);
  });

  // 删除工作经历
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('remove-work')) {
      e.target.closest('.work-experience-item').remove();
    }
  });

  // 删除教育背景
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('remove-education')) {
      e.target.closest('.education-item').remove();
    }
  });

  // 删除技能
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('remove-skill')) {
      e.target.closest('.skill-item').remove();
    }
  });

  // 删除项目经验
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('remove-project')) {
      e.target.closest('.project-item').remove();
    }
  });

  // 显示消息
  function showMessage(message, type) {
    // 移除现有消息
    const existingMessage = document.getElementById('message');
    if (existingMessage) {
      existingMessage.remove();
    }

    // 创建新消息
    const messageElement = document.createElement('div');
    messageElement.id = 'message';
    messageElement.className = 'alert alert-' + type;
    messageElement.textContent = message;

    // 插入消息到表单前面
    const form = document.getElementById('resumeForm');
    if (form) {
      form.parentNode.insertBefore(messageElement, form);
    } else {
      document.body.appendChild(messageElement);
    }

    // 3秒后自动移除消息
    setTimeout(() => {
      if (messageElement.parentNode) {
        messageElement.remove();
      }
    }, 3000);
  }
});
