// i18n module: supports uk, ru, de, en
const translations = {
  ru: {
    locate: 'Моё местоположение',
    launch: 'Спуск на воду',
    exit: 'Выход с воды',
    mooring: 'Швартовка',
    legend: 'Легенда',
    navigable: 'Судоходно',
    nonNavigable: 'Несудоходно',
    toggleNonNavigable: 'Показать несудоходные'
  },
  uk: {
    locate: 'Моє місцезнаходження',
    launch: 'Спуск на воду',
    exit: 'Вихід з води',
    mooring: 'Швартування',
    legend: 'Легенда',
    navigable: 'Судноплавно',
    nonNavigable: 'Не судноплавно',
    toggleNonNavigable: 'Показати не судноплавні'
  },
  de: {
    locate: 'Mein Standort',
    launch: 'Einstieg',
    exit: 'Ausstieg',
    mooring: 'Anlegestelle',
    legend: 'Legende',
    navigable: 'Befahrbar',
    nonNavigable: 'Nicht befahrbar',
    toggleNonNavigable: 'Nicht befahrbare anzeigen'
  },
  en: {
    locate: 'My location',
    launch: 'Launch point',
    exit: 'Exit point',
    mooring: 'Mooring',
    legend: 'Legend',
    navigable: 'Navigable',
    nonNavigable: 'Non-navigable',
    toggleNonNavigable: 'Show non-navigable'
  }
};

let currentLang = 'ru';

export function t(key) {
  return translations[currentLang][key] || key;
}

export function initI18n(selectEl) {
  const browserLang = navigator.language.slice(0, 2);
  currentLang = translations[browserLang] ? browserLang : 'en';
  selectEl.value = currentLang;
  applyTranslations();

  selectEl.addEventListener('change', (e) => {
    currentLang = e.target.value;
    applyTranslations();
    window.dispatchEvent(new CustomEvent('i18n:changed', { detail: { lang: currentLang } }));
  });
}

function applyTranslations() {
  const locateBtn = document.getElementById('locate-btn');
  if (locateBtn) locateBtn.textContent = t('locate');

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.getAttribute('data-i18n'));
  });
}
