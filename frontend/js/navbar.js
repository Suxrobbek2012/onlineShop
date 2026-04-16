// Inject navbar into any page
(function() {
  var isAdmin = window.location.pathname.includes('/admin/');
  var base = isAdmin ? '../' : '';

  var navHTML =
    '<nav class="navbar" id="main-navbar">' +
      '<div class="nav-container">' +
        '<a href="' + base + 'index.html" class="nav-logo">SHOP</a>' +
        '<ul class="nav-links" id="nav-links">' +
          '<li><a href="' + base + 'index.html" data-i18n="nav.home">Bosh sahifa</a></li>' +
          '<li><a href="' + base + 'shop.html" data-i18n="nav.shop">Do\'kon</a></li>' +
          '<li><a href="' + base + 'news.html" data-i18n="nav.news">Yangiliklar</a></li>' +
          '<li><a href="' + base + 'discounts.html" data-i18n="nav.discounts">Chegirmalar</a></li>' +
          '<li><a href="' + base + 'cart.html" style="position:relative;display:flex;align-items:center;gap:4px">' +
            '<span data-i18n="nav.cart">Savat</span>' +
            '<span class="cart-badge" id="cart-badge" style="display:none">0</span>' +
          '</a></li>' +
          '<li><a href="' + base + 'profile.html" id="nav-profile" class="hidden"></a></li>' +
          '<li id="li-login"><a href="' + base + 'login.html" id="nav-login" data-i18n="nav.login">Kirish</a></li>' +
          '<li id="li-register"><a href="' + base + 'register.html" id="nav-register" data-i18n="nav.register">Royxatdan otish</a></li>' +
          '<li id="li-admin" class="hidden"><a href="' + base + 'admin/index.html" id="nav-admin">Admin</a></li>' +
          '<li id="li-logout" class="hidden"><button id="nav-logout" class="btn btn-sm btn-secondary">Chiqish</button></li>' +
        '</ul>' +
        '<div class="nav-actions">' +
          '<div class="lang-switcher" id="lang-switcher-wrap">' +
            '<button class="lang-dropdown-btn" id="lang-dropdown-btn">' +
              '<span id="lang-current-icon">UZ</span>' +
              '<span class="lang-arrow">&#9660;</span>' +
            '</button>' +
            '<div class="lang-dropdown" id="lang-dropdown">' +
              '<button class="lang-option" data-lang="uz">UZ &mdash; O\'zbekcha</button>' +
              '<button class="lang-option" data-lang="ru">RU &mdash; Russkiy</button>' +
              '<button class="lang-option" data-lang="en">EN &mdash; English</button>' +
            '</div>' +
          '</div>' +
          '<button class="theme-toggle" id="theme-toggle" title="Toggle theme">&#9790;</button>' +
          '<button class="hamburger" id="hamburger" aria-label="Menu">&#9776;</button>' +
        '</div>' +
      '</div>' +
    '</nav>';

  var placeholder = document.getElementById('navbar-placeholder');
  if (placeholder) placeholder.innerHTML = navHTML;

  // Active link
  var path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(function(a) {
    var href = (a.getAttribute('href') || '').split('/').pop();
    if (href === path) a.classList.add('active');
  });

  // Set current lang label
  var savedLang = localStorage.getItem('lang') || 'uz';
  var langLabels = { uz: 'UZ', ru: 'RU', en: 'EN' };
  var langIcon = document.getElementById('lang-current-icon');
  if (langIcon) langIcon.textContent = langLabels[savedLang] || 'UZ';

  // Lang dropdown toggle
  var langBtn = document.getElementById('lang-dropdown-btn');
  var langDrop = document.getElementById('lang-dropdown');
  if (langBtn && langDrop) {
    langBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      langDrop.classList.toggle('open');
    });
    document.addEventListener('click', function(e) {
      if (!langBtn.contains(e.target) && !langDrop.contains(e.target)) {
        langDrop.classList.remove('open');
      }
    });
    langDrop.querySelectorAll('.lang-option').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var lang = this.dataset.lang;
        langDrop.classList.remove('open');
        if (langIcon) langIcon.textContent = langLabels[lang] || lang.toUpperCase();
        if (window.I18N) {
          I18N.load(lang).then(function() {
            document.querySelectorAll('.add-to-cart-btn').forEach(function(b) {
              b.textContent = I18N.t('shop.add_to_cart');
            });
          });
        }
      });
    });
  }

  // Hamburger
  var hamburger = document.getElementById('hamburger');
  var navLinks  = document.getElementById('nav-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', function(e) {
      e.stopPropagation();
      var open = navLinks.classList.toggle('open');
      hamburger.innerHTML = open ? '&#10005;' : '&#9776;';
    });
    navLinks.querySelectorAll('a, button').forEach(function(el) {
      el.addEventListener('click', function() {
        navLinks.classList.remove('open');
        hamburger.innerHTML = '&#9776;';
      });
    });
    document.addEventListener('click', function(e) {
      if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('open');
        hamburger.innerHTML = '&#9776;';
      }
    });
  }

  // Theme toggle
  document.addEventListener('click', function(e) {
    if (e.target.id === 'theme-toggle' || e.target.closest('#theme-toggle')) {
      if (window.Theme) Theme.toggle();
    }
  });
})();
