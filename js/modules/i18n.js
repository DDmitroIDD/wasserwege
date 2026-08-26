// i18n module: supports uk, ru, de, en
const translations = {
  ru: {
    locate: 'Моё местоположение',
    point: 'Спуск/выход',
    legend: 'Легенда',
    navigable: 'Судоходно',
    nonNavigable: 'Несудоходно',
    toggleNonNavigable: 'Показать несудоходные',
    addPoint: 'Добавить точку',
    addPointActive: 'Отмена (кликните карту)',
    promptPointName: 'Название точки',
    userAdded: 'Добавлено пользователем',
    delete: 'Удалить',
    exportPoints: 'Экспорт точек',
    clearPoints: 'Очистить мои точки',
    pointTooFarFromWater: 'Слишком далеко от воды. Выберите точку ближе к берегу.',
    cancel: 'Отмена',
    save: 'Сохранить',
  },
  uk: {
    locate: 'Моє місцезнаходження',
    point: 'Спуск/вихід',
    legend: 'Легенда',
    navigable: 'Судноплавно',
    nonNavigable: 'Не судноплавно',
    toggleNonNavigable: 'Показати не судноплавні',
    addPoint: 'Додати точку',
    addPointActive: 'Скасувати (клікніть карту)',
    promptPointName: 'Назва точки',
    userAdded: 'Додано користувачем',
    delete: 'Видалити',
    exportPoints: 'Експорт точок',
    clearPoints: 'Очистити мої точки',
    pointTooFarFromWater: 'Занадто далеко від води. Оберіть точку ближче до берега.',
    cancel: 'Скасувати',
    save: 'Зберегти',
  },
  de: {
    locate: 'Mein Standort',
    point: 'Ein-/Ausstieg',
    legend: 'Legende',
    navigable: 'Befahrbar',
    nonNavigable: 'Nicht befahrbar',
    toggleNonNavigable: 'Nicht befahrbare anzeigen',
    addPoint: 'Punkt hinzufügen',
    addPointActive: 'Abbrechen (Karte klicken)',
    promptPointName: 'Name des Punktes',
    userAdded: 'Vom Nutzer hinzugefügt',
    delete: 'Löschen',
    exportPoints: 'Punkte exportieren',
    clearPoints: 'Meine Punkte löschen',
    pointTooFarFromWater: 'Zu weit vom Wasser entfernt. Bitte wähle einen Punkt näher am Ufer.',
    cancel: 'Abbrechen',
    save: 'Speichern',
  },
  en: {
    locate: 'My location',
    point: 'Launch/exit point',
    legend: 'Legend',
    navigable: 'Navigable',
    nonNavigable: 'Non-navigable',
    toggleNonNavigable: 'Show non-navigable',
    addPoint: 'Add point',
    addPointActive: 'Cancel (click the map)',
    promptPointName: 'Point name',
    userAdded: 'User added',
    delete: 'Delete',
    exportPoints: 'Export points',
    clearPoints: 'Clear my points',
    pointTooFarFromWater: 'Too far from water. Please choose a point closer to the bank.',
    cancel: 'Cancel',
    save: 'Save',
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
