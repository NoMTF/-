/* boot.js —— 在首屏绘制前同步执行：按视口宽度切换手机布局，恢复配色与接口标注偏好。 */
(function () {
  var root = document.documentElement;
  var mq = window.matchMedia('(max-width: 760px)');
  function apply() { root.classList.toggle('is-m', mq.matches); }
  apply();
  if (mq.addEventListener) mq.addEventListener('change', apply); else mq.addListener(apply);
  try {
    if (localStorage.getItem('mtf-theme') === 'navy') root.classList.add('theme-navy');
    if (localStorage.getItem('mtf-api') === '1') root.classList.add('show-api');
  } catch (e) { /* 隐私模式下读不到偏好，按默认显示 */ }
})();
