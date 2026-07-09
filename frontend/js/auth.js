const Auth = {

  async login(e) {
    e.preventDefault();
    const email    = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errEl    = document.getElementById('login-error');
    const btn      = document.getElementById('login-btn');
    errEl.textContent = '';
    btn.textContent = 'Signing in...';
    try {
      const data = await API.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('student', JSON.stringify(data.student));
      showApp(data.student);
    } catch (err) {
      errEl.textContent = err.message;
    } finally {
      btn.textContent = 'Sign in';
    }
  },
  async forgotPassword(e) {
    e.preventDefault();
    const email   = document.getElementById('forgot-email').value;
    const usn     = document.getElementById('forgot-usn').value;
    const newPwd  = document.getElementById('forgot-newpwd').value;
    const confirm = document.getElementById('forgot-confirmpwd').value;
    const errEl   = document.getElementById('forgot-error');
    const succEl  = document.getElementById('forgot-success');
    const btn     = document.getElementById('forgot-btn');
    errEl.textContent  = '';
    succEl.textContent = '';

    if (newPwd !== confirm) {
      errEl.textContent = 'Passwords do not match.';
      return;
    }
    if (newPwd.length < 6) {
      errEl.textContent = 'Password must be at least 6 characters.';
      return;
    }

    btn.textContent = 'Resetting...'; btn.disabled = true;
    try {
      await API.post('/auth/forgot-password', { email, usn, new_password: newPwd });
      succEl.textContent = 'Password reset successfully! Redirecting to login...';
      setTimeout(() => showAuth('login'), 2000);
    } catch (err) {
      errEl.textContent = err.message;
    } finally {
      btn.textContent = 'Reset Password';
      btn.disabled = false;
    }
  },

  async register(e) {
    e.preventDefault();
    const body = {
      name:     document.getElementById('reg-name').value,
      usn:      document.getElementById('reg-usn').value,
      branch:   document.getElementById('reg-branch').value,
      semester: document.getElementById('reg-semester').value,
      email:    document.getElementById('reg-email').value,
      password: document.getElementById('reg-password').value,
      cgpa:     document.getElementById('reg-cgpa').value,
    };
    const errEl = document.getElementById('reg-error');
    const btn   = document.getElementById('reg-btn');
    errEl.textContent = '';
    btn.textContent = 'Creating...';
    try {
      const data = await API.post('/auth/register', body);
      localStorage.setItem('token', data.token);
      localStorage.setItem('student', JSON.stringify({ ...body, student_id: data.student_id }));
      // go to onboarding
      document.getElementById('login-box').classList.add('hidden');
      document.getElementById('register-box').classList.add('hidden');
      document.getElementById('onboarding-box').classList.remove('hidden');
    } catch (err) {
      errEl.textContent = err.message;
    } finally {
      btn.textContent = 'Create account';
    }
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('student');
    document.getElementById('login-email').value = '';
    document.getElementById('login-password').value = ''
    showAuth('login');
  },

  async changePassword(e) {
    e.preventDefault();
    const current  = document.getElementById('pwd-current').value;
    const newPwd   = document.getElementById('pwd-new').value;
    const confirm  = document.getElementById('pwd-confirm').value;
    const errEl    = document.getElementById('pwd-error');
    const succEl   = document.getElementById('pwd-success');
    const btn      = document.getElementById('pwd-btn');
    errEl.textContent  = '';
    succEl.textContent = '';

    if (newPwd !== confirm) {
      errEl.textContent = 'New passwords do not match.';
      return;
    }
    if (newPwd.length < 6) {
      errEl.textContent = 'New password must be at least 6 characters.';
      return;
    }

    btn.textContent = 'Changing...'; btn.disabled = true;
    try {
      await API.put('/profile/password', { current_password: current, new_password: newPwd });
      succEl.textContent = 'Password changed successfully!';
      document.getElementById('pwd-current').value = '';
      document.getElementById('pwd-new').value = '';
      document.getElementById('pwd-confirm').value = '';
      setTimeout(() => closeModal('change-pwd-modal'), 1500);
    } catch (err) {
      errEl.textContent = err.message;
    } finally {
      btn.textContent = 'Change Password';
      btn.disabled = false;
    }
  },
previewAvatar() {
    const url = document.getElementById('avatar-url-input').value;
    const preview = document.getElementById('avatar-preview');
    const student = JSON.parse(localStorage.getItem('student') || '{}');
    if (url) {
      preview.innerHTML = `<img src="${url}" style="width:80px;height:80px;border-radius:50%;object-fit:cover" onerror="this.parentElement.innerHTML=getInitials('${student.name}')" />`;
      preview.style.background = 'transparent';
    } else {
      preview.textContent = getInitials(student.name);
      preview.style.background = getAvatarColor(student.name);
    }
  },

  async saveAvatar() {
    const url = document.getElementById('avatar-url-input').value;
    const btn = document.getElementById('avatar-save-btn');
    btn.textContent = 'Saving...'; btn.disabled = true;
    try {
      const student = JSON.parse(localStorage.getItem('student') || '{}');
      await API.put('/profile', { ...student, avatar_url: url || null });
      student.avatar_url = url || null;
      localStorage.setItem('student', JSON.stringify(student));
      updateAvatar(student);
      closeModal('avatar-modal');
      toast('Profile picture updated');
    } catch (err) {
      document.getElementById('avatar-error').textContent = err.message;
    } finally {
      btn.textContent = 'Save'; btn.disabled = false; 
    }
  },

  async removeAvatar() {
    try {
      const student = JSON.parse(localStorage.getItem('student') || '{}');
      await API.put('/profile', { ...student, avatar_url: null });
      student.avatar_url = null;
      localStorage.setItem('student', JSON.stringify(student));
      updateAvatar(student);
      closeModal('avatar-modal');
      toast('Profile picture removed');
    } catch { toast('Failed', 'error'); }
  },

  openAvatarModal() {
    const student = JSON.parse(localStorage.getItem('student') || '{}');
    document.getElementById('avatar-url-input').value = student.avatar_url || '';
    const preview = document.getElementById('avatar-preview');
    if (student.avatar_url) {
      preview.innerHTML = `<img src="${student.avatar_url}" style="width:80px;height:80px;border-radius:50%;object-fit:cover" />`;
      preview.style.background = 'transparent';
    } else {
      preview.textContent = getInitials(student.name);
      preview.style.background = getAvatarColor(student.name);
    }
    openModal('avatar-modal');
  },
  // ---- ONBOARDING ----
  parsedData: null,

  async parseResume() {
    const file = document.getElementById('resume-file').files[0];
    if (!file) return;
    const btn = document.getElementById('parse-btn');
    btn.textContent = 'Parsing...';
    btn.disabled = true;
    try {
      const fd = new FormData();
      fd.append('resume', file);
      const data = await API.upload('/resume/parse', fd);
      this.parsedData = data;
      this.renderParsed(data);
      document.getElementById('onboard-step1').classList.add('hidden');
      document.getElementById('onboard-step2').classList.remove('hidden');
    } catch (err) {
      toast('Could not parse PDF. Try again or skip.', 'error');
    } finally {
      btn.textContent = 'Parse Resume';
      btn.disabled = false;
    }
  },

  renderParsed(data) {
    // skills
    const sc = document.getElementById('parsed-skills');
    sc.innerHTML = data.skills.length
      ? data.skills.map((s, i) => `<span class="chip">${s.skill_name} <button class="chip-remove" onclick="Auth.removeItem('skills',${i})">×</button></span>`).join('')
      : '<span style="color:var(--muted);font-size:13px">None detected</span>';

    // certs
    const cc = document.getElementById('parsed-certs');
    cc.innerHTML = data.certifications.length
      ? data.certifications.map((c, i) => `<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid var(--border);font-size:13px"><span>${c.cert_name}</span><button class="btn btn-danger btn-sm" onclick="Auth.removeItem('certifications',${i})">Remove</button></div>`).join('')
      : '<span style="color:var(--muted);font-size:13px">None detected</span>';

    // projects
    const pc = document.getElementById('parsed-projects');
    pc.innerHTML = data.projects.length
      ? data.projects.map((p, i) => `<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid var(--border);font-size:13px"><span>${p.title}</span><button class="btn btn-danger btn-sm" onclick="Auth.removeItem('projects',${i})">Remove</button></div>`).join('')
      : '<span style="color:var(--muted);font-size:13px">None detected</span>';
  },

  removeItem(type, idx) {
    this.parsedData[type].splice(idx, 1);
    this.renderParsed(this.parsedData);
  },

  async confirmImport() {
    const btn = document.getElementById('confirm-btn');
    btn.textContent = 'Saving...';
    btn.disabled = true;
    try {
      const calls = [];
      if (this.parsedData.skills.length)
        calls.push(API.post('/skills/bulk', { skills: this.parsedData.skills }));
      if (this.parsedData.certifications.length)
        calls.push(API.post('/certifications/bulk', { certifications: this.parsedData.certifications }));
      await Promise.all(calls);
      document.getElementById('onboard-step2').classList.add('hidden');
      document.getElementById('onboard-step3').classList.remove('hidden');
    } catch {
      toast('Import failed. You can add data manually.', 'error');
    } finally {
      btn.textContent = 'Confirm & Save';
      btn.disabled = false;
    }
  },

  finishOnboarding() {
    const student = JSON.parse(localStorage.getItem('student') || '{}');
    showApp(student);
  }
};
