function normalizeStoredUser(user) {
  if (!user || typeof user !== 'object') return null;

  var normalized = Object.assign({}, user);
  if (!normalized.id && normalized._id) normalized.id = normalized._id;

  if (Array.isArray(normalized.favorites)) {
    normalized.favorites = normalized.favorites.map(function(favorite) {
      if (favorite && typeof favorite === 'object' && favorite._id && !favorite.id) {
        return Object.assign({ id: favorite._id }, favorite);
      }
      return favorite;
    });
  }

  return normalized;
}

// Auth state management
const Auth = {
  getToken: () => localStorage.getItem('token'),
  getUser: () => {
    try { return normalizeStoredUser(JSON.parse(localStorage.getItem('user'))); }
    catch { return null; }
  },
  isLoggedIn: () => !!localStorage.getItem('token'),
  isAdmin: () => { const user = Auth.getUser(); return user && user.role === 'admin'; },

  setSession(token, user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(normalizeStoredUser(user)));
  },

  clearSession() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  updateNavbar() {
    const user = Auth.getUser();
    const loginLink = document.getElementById('nav-login');
    const registerLink = document.getElementById('nav-register');
    const profileLink = document.getElementById('nav-profile');
    const logoutBtn = document.getElementById('nav-logout');
    const adminLink = document.getElementById('nav-admin');

    const liLogin = document.getElementById('li-login');
    const liRegister = document.getElementById('li-register');
    const liAdmin = document.getElementById('li-admin');
    const liLogout = document.getElementById('li-logout');

    if (Auth.isLoggedIn() && user) {
      if (loginLink) loginLink.classList.add('hidden');
      if (liLogin) liLogin.classList.add('hidden');
      if (registerLink) registerLink.classList.add('hidden');
      if (liRegister) liRegister.classList.add('hidden');

      if (profileLink) {
        profileLink.classList.remove('hidden');
        profileLink.textContent = user.fullName || user.username;
      }
      if (logoutBtn) logoutBtn.classList.remove('hidden');
      if (liLogout) liLogout.classList.remove('hidden');

      const isAdmin = user.role === 'admin';
      if (adminLink) adminLink.classList.toggle('hidden', !isAdmin);
      if (liAdmin) liAdmin.classList.toggle('hidden', !isAdmin);
    } else {
      if (loginLink) loginLink.classList.remove('hidden');
      if (liLogin) liLogin.classList.remove('hidden');
      if (registerLink) registerLink.classList.remove('hidden');
      if (liRegister) liRegister.classList.remove('hidden');

      if (profileLink) profileLink.classList.add('hidden');
      if (logoutBtn) logoutBtn.classList.add('hidden');
      if (liLogout) liLogout.classList.add('hidden');
      if (adminLink) adminLink.classList.add('hidden');
      if (liAdmin) liAdmin.classList.add('hidden');
    }
  },

  requireAuth() {
    if (!Auth.isLoggedIn()) {
      var base = window.location.pathname.includes('/admin/') ? '../' : '';
      window.location.href = base + 'login.html';
      return false;
    }
    return true;
  },

  requireAdmin() {
    if (!Auth.isLoggedIn() || !Auth.isAdmin()) {
      var base = window.location.pathname.includes('/admin/') ? '../' : '';
      window.location.href = base + 'login.html';
      return false;
    }

    api.get('/auth/me').then(function(data) {
      if (!data.user || data.user.role !== 'admin') {
        Auth.clearSession();
        var base = window.location.pathname.includes('/admin/') ? '../' : '';
        window.location.href = base + 'login.html';
      }
    }).catch(function() {
      Auth.clearSession();
      var base = window.location.pathname.includes('/admin/') ? '../' : '';
      window.location.href = base + 'login.html';
    });

    return true;
  }
};

document.addEventListener('click', function(e) {
  if (e.target.id === 'nav-logout' || e.target.closest('#nav-logout')) {
    Auth.clearSession();
    var base = window.location.pathname.includes('/admin/') ? '../' : '';
    window.location.href = base + 'index.html';
  }
});

window.Auth = Auth;
