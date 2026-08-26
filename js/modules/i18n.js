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
    toggleNonNavigable: 'Показать несудоходные',
    addPoint: 'Добавить точку',
    addPointActive: 'Отмена (кликните карту)',
    promptPointName: 'Название точки',
    promptPointType: 'Тип (launch/exit/mooring)',
    userAdded: 'Добавлено пользователем',
    delete: 'Удалить',
    exportPoints: 'Экспорт точек',
    clearPoints: 'Очистить мои точки'
  },
  uk: {
    locate: 'Моє місцезнаходження',
    launch: 'Спуск на воду',
    exit: 'Вихід з води',
    mooring: 'Швартування',
    legend: 'Легенда',
    navigable: 'Судноплавно',
    nonNavigable: 'Не судноплавно',
    toggleNonNavigable: 'Показати не судноплавні',
    addPoint: 'Додати точку',
    addPointActive: 'Скасувати (клікніть карту)',
    promptPointName: 'Назва точки',
    promptPointType: 'Тип (launch/exit/mooring)',
    userAdded: 'Додано користувачем',
    delete: 'Видалити',
    exportPoints: 'Експорт точок',
    clearPoints: 'Очистити мої точки'
  },
  de: {
    locate: 'Mein Standort',
    launch: 'Einstieg',
    exit: 'Ausstieg',
    mooring: 'Anlegestelle',
    legend: 'Legende',
    navigable: 'Befahrbar',
    nonNavigable: 'Nicht befahrbar',
    toggleNonNavigable: 'Nicht befahrbare anzeigen',
    addPoint: 'Punkt hinzufügen',
    addPointActive: 'Abbrechen (Karte klicken)',
    promptPointName: 'Name des Punktes',
    promptPointType: 'Typ (launch/exit/mooring)',
    userAdded: 'Vom Nutzer hinzugefügt',
    delete: 'Löschen',
    exportPoints: 'Punkte exportieren',
    clearPoints: 'Meine Punkte löschen'
  },
  en: {
    locate: 'My location',
    launch: 'Launch point',
    exit: 'Exit point',
    mooring: 'Mooring',
    legend: 'Legend',
    navigable: 'Navigable',
    nonNavigable: 'Non-navigable',
    toggleNonNavigable: 'Show non-navigable',
    addPoint: 'Add point',
    addPointActive: 'Cancel (click the map)',
    promptPointName: 'Point name',
    promptPointType: 'Type (launch/exit/mooring)',
    userAdded: 'User added',
    delete: 'Delete',
    exportPoints: 'Export points',
    clearPoints: 'Clear my points'
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
  const addBtn = document.getElementById('add-point-btn');
  if (addBtn) addBtn.textContent = t('addPoint');
  const exportBtn = document.getElementById('export-points-btn');
  if (exportBtn) exportBtn.textContent = t('exportPoints');
  const clearBtn = document.getElementById('clear-points-btn');
  if (clearBtn) clearBtn.textContent = t('clearPoints');
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.getAttribute('data-i18n'));
  });
}
