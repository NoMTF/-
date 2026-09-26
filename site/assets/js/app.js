/* app.js —— 静态原型的交互。全部在本地切换示例状态，不发任何网络请求。
   接后端时，每个带 data-api 的控件对应的接口见 docs/API-MAPPING.md。 */
(function () {
  'use strict';
  var root = document.documentElement;
  var $ = function (sel, el) { return (el || document).querySelector(sel); };
  var $$ = function (sel, el) { return Array.prototype.slice.call((el || document).querySelectorAll(sel)); };
  function store(key, val) { try { localStorage.setItem(key, val); } catch (e) { /* 忽略 */ } }

  /* ---------- 轻提示 ---------- */
  var stack;
  function toast(text, kind) {
    if (!stack) {
      stack = document.createElement('div');
      stack.className = 'toast-stack';
      stack.setAttribute('role', 'status');
      stack.setAttribute('aria-live', 'polite');
      ($('.app') || document.body).appendChild(stack);
    }
    var t = document.createElement('div');
    t.className = 'toast ' + (kind || '');
    var icon = kind === 'good' ? 'i-check-circle' : kind === 'bad' ? 'i-alert' : 'i-info';
    t.innerHTML = '<i class="i ' + icon + '"></i><span></span>';
    t.querySelector('span').textContent = text;
    stack.appendChild(t);
    setTimeout(function () { t.remove(); }, 3200);
  }

  /* ---------- 弹窗 ---------- */
  var lastFocus = null;
  function openModal(id) {
    var m = document.getElementById(id);
    if (!m) return;
    lastFocus = document.activeElement;
    m.classList.remove('is-hidden');
    var f = $('[data-close], button, a, input', m);
    if (f) f.focus();
  }
  function closeModals() {
    $$('[data-modal]').forEach(function (m) { m.classList.add('is-hidden'); });
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  /* ---------- 选项卡（含加载骨架） ---------- */
  function activate(group, key) {
    $$('[data-tab]', group).forEach(function (b) {
      if (b.closest('[data-tabs]') !== group) return;
      var on = b.getAttribute('data-tab') === key;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    $$('[data-panel]', group).forEach(function (p) {
      if (p.closest('[data-tabs]') !== group) return;
      p.classList.toggle('is-hidden', p.getAttribute('data-panel') !== key);
    });
    $$('[data-tab-select]', group).forEach(function (s) { s.value = key; });
    if (group.hasAttribute('data-loading')) {
      group.classList.add('is-loading');
      setTimeout(function () { group.classList.remove('is-loading'); }, 520);
    }
  }

  /* ---------- 发送验证码倒计时 ---------- */
  function countdown(btn) {
    var n = 60, label = btn.textContent;
    btn.disabled = true;
    var timer = setInterval(function () {
      n -= 1;
      btn.textContent = n + ' 秒后重发';
      if (n <= 0) { clearInterval(timer); btn.disabled = false; btn.textContent = label; }
    }, 1000);
    btn.textContent = n + ' 秒后重发';
  }

  /* ---------- 复制 ---------- */
  function copy(text, done) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(false); });
    } else { done(false); }
  }

  document.addEventListener('click', function (e) {
    var t = e.target;
    var el;
    if ((el = t.closest('[data-drawer-open]'))) { root.classList.add('drawer-open'); return; }
    if ((el = t.closest('[data-drawer-close]'))) { root.classList.remove('drawer-open'); return; }
    if ((el = t.closest('[data-theme-set]'))) {
      var navy = el.getAttribute('data-theme-set') === 'navy';
      root.classList.toggle('theme-navy', navy);
      store('mtf-theme', navy ? 'navy' : 'red');
      toast(navy ? '已切换为藏青配色' : '已切换为朱红配色');
      return;
    }
    if ((el = t.closest('[data-api-toggle]'))) {
      var on = root.classList.toggle('show-api');
      store('mtf-api', on ? '1' : '0');
      toast(on ? '已显示接口标注：虚线框控件上方是对应后端接口' : '已隐藏接口标注');
      return;
    }
    if ((el = t.closest('[data-open]'))) {
      e.preventDefault();
      openModal(el.getAttribute('data-open'));
      return;
    }
    if (t.matches('[data-modal]')) { closeModals(); return; }
    if ((el = t.closest('[data-close]'))) {
      closeModals();
      var msg = el.getAttribute('data-toast');
      if (msg) toast(msg, el.getAttribute('data-toast-kind') || 'good');
      return;
    }
    if ((el = t.closest('[data-tab]'))) {
      var group = el.closest('[data-tabs]');
      if (group) { e.preventDefault(); activate(group, el.getAttribute('data-tab')); }
      return;
    }
    if ((el = t.closest('[data-checkin]'))) {
      var box = el.closest('[data-state]');
      if (box && !box.classList.contains('is-done')) {
        el.classList.add('is-loading');
        setTimeout(function () {
          $$('[data-state]').forEach(function (s) { s.classList.add('is-done'); });
          toast('签到成功：今日 +2 GB，本月额度 80.0 GB（示例）', 'good');
        }, 500);
      }
      return;
    }
    if ((el = t.closest('[data-bind-check]'))) {
      var st = el.closest('.bind-state');
      el.classList.add('is-loading');
      setTimeout(function () {
        el.classList.remove('is-loading');
        if (st) st.classList.add('is-bound');
        toast('Telegram 已绑定（示例状态）', 'good');
      }, 800);
      return;
    }
    if ((el = t.closest('[data-bind-reset]'))) {
      var st2 = el.closest('.bind-state');
      if (st2) st2.classList.remove('is-bound');
      return;
    }
    if ((el = t.closest('[data-send-code]'))) {
      countdown(el);
      toast(el.getAttribute('data-send-code') || '静态样本不会真正发送邮件');
      return;
    }
    if ((el = t.closest('[data-pw-toggle]'))) {
      var input = el.parentNode.querySelector('input');
      if (input) input.type = input.type === 'password' ? 'text' : 'password';
      el.setAttribute('aria-pressed', input && input.type === 'text' ? 'true' : 'false');
      return;
    }
    if ((el = t.closest('[data-step]'))) {
      var num = el.parentNode.querySelector('input');
      if (num) {
        var v = Math.min(+num.max || 200, Math.max(+num.min || 1, (+num.value || 0) + (+el.getAttribute('data-step'))));
        num.value = v;
        $$('[data-count-label]').forEach(function (l) { l.textContent = v; });
      }
      return;
    }
    if ((el = t.closest('[data-reveal]'))) {
      var target = document.getElementById(el.getAttribute('data-reveal'));
      if (target) target.classList.remove('is-hidden');
      if (el.getAttribute('data-toast')) toast(el.getAttribute('data-toast'), 'good');
      return;
    }
    if ((el = t.closest('[data-copy]'))) {
      copy(el.getAttribute('data-copy'), function (ok) {
        toast(ok ? '已复制：' + el.getAttribute('data-copy') : '复制失败，请手动选择文字复制', ok ? 'good' : 'bad');
      });
      return;
    }
    if ((el = t.closest('[data-toast]'))) {
      e.preventDefault();
      toast(el.getAttribute('data-toast'), el.getAttribute('data-toast-kind') || '');
      return;
    }
    if ((el = t.closest('a[href="#"]'))) { e.preventDefault(); }
  });

  document.addEventListener('change', function (e) {
    var s = e.target.closest('[data-tab-select]');
    if (s) activate(s.closest('[data-tabs]'), s.value);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeModals(); root.classList.remove('drawer-open'); }
  });

  /* ---------- 表单校验：必填为空时显示错误状态 ---------- */
  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (!form.matches('[data-validate]')) return;
    e.preventDefault();
    var ok = true;
    $$('[required]', form).forEach(function (input) {
      var field = input.closest('.field');
      var bad = input.type === 'checkbox' ? !input.checked
        : !input.value.trim() || (input.type === 'email' && !/^\S+@\S+\.\S+$/.test(input.value));
      var match = input.getAttribute('data-match');
      if (!bad && match) {
        var other = form.querySelector('#' + match);
        bad = other && other.value !== input.value;
      }
      if (field) field.classList.toggle('is-error', bad);
      if (bad) ok = false;
    });
    if (ok) toast(form.getAttribute('data-success') || '已提交（静态样本不会真正提交）', 'good');
    else {
      var first = $('.field.is-error .input', form);
      if (first) first.focus();
      toast('请按红色提示修改后再提交', 'bad');
    }
  });
  document.addEventListener('input', function (e) {
    var field = e.target.closest('.field.is-error');
    if (field && e.target.value.trim()) field.classList.remove('is-error');
  });

  /* ---------- 图表悬停提示 ---------- */
  var tip;
  document.addEventListener('mouseover', function (e) {
    var el = e.target.closest('[data-tip]');
    if (!el) { if (tip) tip.style.display = 'none'; return; }
    if (!tip) { tip = document.createElement('div'); tip.className = 'chart-tip'; document.body.appendChild(tip); }
    tip.textContent = '';
    el.getAttribute('data-tip').split('|').forEach(function (line, i) {
      var row = document.createElement(i ? 'div' : 'b');
      row.textContent = line;
      tip.appendChild(row);
    });
    tip.style.display = 'block';
  });
  document.addEventListener('mousemove', function (e) {
    if (tip && tip.style.display === 'block') {
      var x = Math.min(e.clientX + 14, window.innerWidth - tip.offsetWidth - 8);
      tip.style.left = x + 'px';
      tip.style.top = (e.clientY - tip.offsetHeight - 12) + 'px';
    }
  });

  /* 打开带 #notice-1 之类锚点的链接时，直接弹出对应公告 */
  if (location.hash && document.getElementById(location.hash.slice(1)) && document.getElementById(location.hash.slice(1)).hasAttribute('data-modal')) {
    openModal(location.hash.slice(1));
  }
})();
