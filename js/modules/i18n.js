// i18n module: supports uk, ru, de, en
const translations = {
  ru: {
    locate: 'Моё местоположение',
    launch: 'Спуск на воду',
    exit: 'Выход с воды',
    mooring: 'Швартовка'
  },
  uk: {
    locate: 'Моє місцезнаходження',
    launch: 'Спуск на воду',
    exit: 'Вихід з води',
    mooring: 'Швартування'
  },
  de: {
    locate: 'Mein Standort',
    launch: 'Einstieg',
    exit: 'Ausstieg',
    mooring: 'Anlegestelle'
  },
  en: {
    locate: 'My location',
    launch: 'Launch point',
    exit: 'Exit point',
    mooring: 'Mooring'
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
  });
}

function applyTranslations() {
  const locateBtn = document.getElementById('locate-btn');
  if (locateBtn) locateBtn.textContent = t('locate');
}
