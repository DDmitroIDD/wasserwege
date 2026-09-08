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
    addPhoto: 'Фото (необязательно)',
    submitted: 'Точка отправлена на модерацию.',
    submitError: 'Ошибка при отправке. Попробуйте ещё раз.',
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
    addPhoto: 'Фото (необовʼязково)',
    submitted: 'Точку надіслано на модерацію.',
    submitError: 'Помилка при надсиланні. Спробуйте ще раз.',
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
    addPhoto: 'Foto (optional)',
    submitted: 'Punkt zur Prüfung eingereicht.',
    submitError: 'Fehler beim Einreichen. Bitte erneut versuchen.',
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
    addPhoto: 'Photo (optional)',
    submitted: 'Point submitted for moderation.',
    submitError: 'Submission failed. Please try again.',
  },
};

let currentLang = 'ru';

export function t(key) {
  return translations[currentLang][key] || key;
}

export function initI18n(selectEl) {
  function apply(lang) {
    currentLang = lang;
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const k = el.dataset.i18n;
      el.textContent = t(k);
    });
    window.dispatchEvent(new CustomEvent('i18n:changed'));
  }
  apply(selectEl.value);
  selectEl.addEventListener('change', (e) => apply(e.target.value));
}
