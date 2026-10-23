/* ============================================================
   KARTPAK — LANGUAGE SWITCHER (translation.js)
   AZ / EN / RU. HTML менять не нужно.
   Подключать ПОСЛЕ translations/az.js, en.js, ru.js
   ============================================================ */
(function () {
  'use strict';

  /* ---------- 0. НАСТРОЙКИ ---------- */
  var SUPPORTED_LANGS = ['az', 'en', 'ru'];
  var DEFAULT_LANG = 'az';

  var FLAGS = {
    az: 'https://flagcdn.com/w80/az.png',
    en: 'https://flagcdn.com/w80/gb.png',
    ru: 'https://flagcdn.com/w80/ru.png'
  };

  /* ---------- 1. ТЕКУЩИЙ ЯЗЫК ---------- */
  function getCurrentLang() {
    try {
      var urlLang = new URLSearchParams(location.search).get('lang');
      var savedLang =
        localStorage.getItem('lang') ||
        localStorage.getItem('kartpak-lang') ||
        localStorage.getItem('language');

      if (SUPPORTED_LANGS.includes(urlLang)) return urlLang;
      if (SUPPORTED_LANGS.includes(savedLang)) return savedLang;
    } catch (e) {}
    return DEFAULT_LANG;
  }

  /* ---------- 2. ПЕРЕВОД ДЛЯ JS-ТЕКСТОВ ---------- */
  window.t = function (key) {
    var lang = window.__lang || DEFAULT_LANG;
    return (
      (window.I18N[lang] && window.I18N[lang][key]) ??
      (window.I18N[DEFAULT_LANG] && window.I18N[DEFAULT_LANG][key]) ??
      key
    );
  };

  /* ---------- 3. ЯЗЫК ПО КНОПКЕ (обходит дубли data-lang) ----------
     У ссылки EN в шапке два атрибута data-lang="ru" data-lang="en",
     а у RU data-lang нет. Поэтому сначала читаем ТЕКСТ/флаг кнопки. */
  function detectLangFromElement(el) {
    // 3.1 Текст кнопки: "AZ" | "EN" | "RU"
    var text = (el.textContent || '').trim().toLowerCase();
    if (SUPPORTED_LANGS.includes(text)) return text;

    // 3.2 Флаг внутри кнопки
    var img = el.querySelector('img[alt]');
    if (img) {
      var alt = (img.alt || '').trim().toLowerCase();
      if (SUPPORTED_LANGS.includes(alt)) return alt;
    }

    // 3.3 Атрибуты data-lang / data-lang-btn
    var attr = el.dataset.lang || el.dataset.langBtn;
    if (SUPPORTED_LANGS.includes(attr)) return attr;

    return null;
  }

  /* ---------- 4. ПРИМЕНЕНИЕ ПЕРЕВОДА ---------- */
  function applyTranslations(lang) {
    var translations = window.I18N[lang] || {};

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var value = translations[el.dataset.i18n];
      if (value != null) el.innerHTML = value;
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      var value = translations[el.dataset.i18nPlaceholder];
      if (value != null) el.setAttribute('placeholder', value);
    });

    document.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
      var value = translations[el.dataset.i18nAria];
      if (value != null) el.setAttribute('aria-label', value);
    });

    document.querySelectorAll('[data-i18n-title]').forEach(function (el) {
      var value = translations[el.dataset.i18nTitle];
      if (value != null) el.setAttribute('title', value);
    });

    // <title> страницы
    var titleValue = translations.meta_title || translations['meta.title'];
    if (titleValue) document.title = titleValue;

    // meta description
    var metaDescription = document.querySelector('meta[name="description"]');
    var metaDesc = translations.meta_desc || translations['meta.desc'];
    if (metaDescription && metaDesc) {
      metaDescription.setAttribute('content', metaDesc);
    }
  }

  /* ---------- 5. ВИД ПЕРЕКЛЮЧАТЕЛЕЙ ---------- */
  function updateSwitcherView(lang) {
    // Флаг и подпись в шапке
    var flag = document.getElementById('lang-flag');
    if (flag) {
      flag.src = FLAGS[lang];
      flag.alt = lang.toUpperCase();
    }
    var label = document.getElementById('lang-label');
    if (label) label.textContent = lang.toUpperCase();

    // Мобильное меню — активная кнопка
    document.querySelectorAll('.mobile-language-link').forEach(function (link) {
      var isActive = detectLangFromElement(link) === lang;
      link.classList.toggle('active', isActive);
      if (isActive) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });

    // Десктопный выпадающий список — активная строка
    document.querySelectorAll('#header .absolute.right-0 a').forEach(function (link) {
      var isActive = detectLangFromElement(link) === lang;
      link.classList.toggle('text-[#0f2e26]', isActive);
      link.classList.toggle('bg-[#0f2e26]/10', isActive);
      link.classList.toggle('text-[#0f2e26]/80', !isActive);
    });
  }

  /* ---------- 6. УСТАНОВКА ЯЗЫКА ---------- */
  function setLang(lang) {
    if (!SUPPORTED_LANGS.includes(lang)) return;

    window.__lang = lang;
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('data-lang', lang);

    try {
      localStorage.setItem('lang', lang);
      localStorage.setItem('kartpak-lang', lang);
    } catch (e) {}

    applyTranslations(lang);
    updateSwitcherView(lang);
  }

  window.setLang = setLang;

  /* ---------- 7. ПОДПИСКА НА КЛИКИ ---------- */
  function initLanguageSwitcher() {
    setLang(getCurrentLang());

    var triggers = document.querySelectorAll(
      '[data-lang], [data-lang-btn], .mobile-language-link, #header .absolute.right-0 a'
    );

    triggers.forEach(function (el) {
      el.addEventListener('click', function (event) {
        event.preventDefault();
        var lang = detectLangFromElement(el);
        if (lang) setLang(lang);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLanguageSwitcher);
  } else {
    initLanguageSwitcher();
  }
})();