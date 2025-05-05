/**
 * وظائف للكشف عن نوع المتصفح وتطبيق التعديلات المناسبة
 */

// الكشف عن متصفح سفاري
export const isSafari = (): boolean => {
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
};

// الكشف عن أجهزة آبل (iOS)
export const isIOS = (): boolean => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
};

// الكشف عن متصفح Edge
export const isEdge = (): boolean => {
  return /Edge\/\d./i.test(navigator.userAgent);
};

// الكشف عن متصفح Internet Explorer
export const isIE = (): boolean => {
  return /MSIE|Trident/.test(navigator.userAgent);
};

// الكشف عن متصفح Firefox
export const isFirefox = (): boolean => {
  return navigator.userAgent.indexOf('Firefox') !== -1;
};

// الكشف عن متصفح Chrome
export const isChrome = (): boolean => {
  return /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
};

// تطبيق الأنيميشن المناسب للدبوس المحدد
export const applyMarkerAnimation = (markerElement: HTMLElement, lngLat: { lng: number; lat: number }, map: any): void => {
  // تطبيق أنيميشن موحد لجميع المتصفحات
  markerElement.style.animation = '1s ease 0s infinite alternate none running bounce';

  // تحديث موقع الدبوس المحدد
  if (map) {
    const point = map.project(lngLat);
    markerElement.style.transform = `translate(${point.x}px, ${point.y}px) translate(-50%, -50%) translate(0px, 0px)`;
  }

  // تطبيق الأسلوب المطلوب للدبابيس المحددة
  markerElement.style.width = '100%';
  markerElement.style.height = '50%';
  markerElement.style.backgroundImage = "url('/lovable-uploads/27c1f136-856b-4b61-b332-3cea9403770a.png')";
  markerElement.style.backgroundSize = 'contain';
  markerElement.style.backgroundRepeat = 'no-repeat';
  markerElement.style.backgroundPosition = 'center center';
  markerElement.style.cursor = 'pointer';
  markerElement.style.transition = '0.3s ease-in-out';
  markerElement.style.transformOrigin = 'center bottom';
  markerElement.style.zIndex = '10';
  markerElement.style.willChange = 'filter, transform, width, height';
  markerElement.style.opacity = '1';
  markerElement.style.pointerEvents = 'auto';
};
