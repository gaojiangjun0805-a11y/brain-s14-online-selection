(function () {
  'use strict';

  const TOTAL = 99;
  const params = new URL(location.href).searchParams;
  const gameId = params.get('gameId') || location.pathname.split('/').filter(Boolean).slice(-2, -1)[0] || 'game';
  const storageKey = `ggame_level_${gameId}`;

  function clampLevel(value) {
    return Math.max(1, Math.min(TOTAL, Number(value) || 1));
  }

  function readLevel() {
    const fromURL = params.get('level');
    if (fromURL) return clampLevel(fromURL);
    try { return clampLevel(localStorage.getItem(storageKey)); } catch (_) { return 1; }
  }

  function difficulty(level) {
    if (level <= 3) return '入门';
    if (level <= 9) return '进阶';
    return '高难';
  }

  function hash(text) {
    let value = 2166136261;
    for (let index = 0; index < text.length; index += 1) {
      value ^= text.charCodeAt(index);
      value = Math.imul(value, 16777619);
    }
    return value >>> 0;
  }

  function seededRandom(salt) {
    let state = hash(`${gameId}:${api.level}:${salt || ''}`) || 1;
    return function () {
      state += 0x6D2B79F5;
      let value = state;
      value = Math.imul(value ^ value >>> 15, value | 1);
      value ^= value + Math.imul(value ^ value >>> 7, value | 61);
      return ((value ^ value >>> 14) >>> 0) / 4294967296;
    };
  }

  const api = {
    total: TOTAL,
    gameId,
    level: readLevel(),
    difficulty,
    seed: salt => hash(`${gameId}:${api.level}:${salt || ''}`),
    rng: seededRandom,
    ready(details) {
      document.body.dataset.ggameGeneratedLevel = String(api.level);
      document.dispatchEvent(new CustomEvent('ggame:challenge-ready', {
        detail: Object.assign(api.profile(), details || {})
      }));
    },
    profile(level = api.level) {
      const n = clampLevel(level);
      return {
        level: n,
        total: TOTAL,
        difficulty: difficulty(n),
        hard: n >= 10,
        progress: (n - 1) / (TOTAL - 1),
        seed: hash(`${gameId}:${n}`)
      };
    },
    select(level) {
      api.level = clampLevel(level);
      try { localStorage.setItem(storageKey, String(api.level)); } catch (_) {}
      const url = new URL(location.href);
      url.searchParams.set('level', String(api.level));
      window.history.replaceState(null, '', url.href);
      update();
      document.dispatchEvent(new CustomEvent('ggame:level-change', { detail: api.profile() }));
    }
  };
  window.GGameLevels = api;

  let currentLabel;
  let difficultyLabel;
  let dialog;
  let activePill;
  let mountAttempts = 0;

  function update() {
    if (currentLabel) currentLabel.textContent = `第 ${api.level} 关`;
    if (difficultyLabel) difficultyLabel.textContent = difficulty(api.level);
    document.querySelectorAll('[data-ggame-level-option]').forEach(button => {
      const active = Number(button.dataset.ggameLevelOption) === api.level;
      button.classList.toggle('is-current', active);
      button.setAttribute('aria-current', active ? 'true' : 'false');
    });
  }

  function findNativeStart() {
    const selectors = ['#welcome-start', '#startGame', '#startBtn', '#boot-start', '#ggameGenericStartButton'];
    for (const selector of selectors) {
      const button = document.querySelector(selector);
      if (button) return button;
    }
    return null;
  }

  function closeDialog() {
    if (dialog) dialog.hidden = true;
  }

  function createGenericStart() {
    if (!document.body || document.getElementById('ggameGenericStart')) return;
    const overlay = document.createElement('section');
    overlay.id = 'ggameGenericStart';
    overlay.innerHTML = `<div class="ggame-generic-start-card"><strong>G-Game</strong><h2>${document.title || '开始挑战'}</h2><p>选择关卡后开始挑战</p><button id="ggameGenericStartButton" type="button">开始游戏</button></div>`;
    overlay.querySelector('button').addEventListener('click', () => {
      overlay.classList.add('is-hidden');
      setTimeout(() => overlay.remove(), 360);
    });
    document.body.appendChild(overlay);
  }

  function commitLevel() {
    const profile = api.profile();
    document.body.dataset.ggameActiveLevel = String(api.level);
    document.body.dataset.ggameDifficulty = profile.difficulty;
    setTimeout(() => {
      if (typeof window.GGAME_APPLY_LEVEL === 'function') {
        window.GGAME_APPLY_LEVEL(api.level, profile);
        api.ready();
      }
    }, 0);
    const nativeIndicator = document.querySelector('#level-kicker,#hLevel,#levelCount,#p-level,#levelLabel,#levelName,#level');
    if (nativeIndicator) {
      if (activePill) { activePill.remove(); activePill = null; }
    } else if (!activePill) {
      activePill = document.createElement('div');
      activePill.className = 'ggame-active-level';
      activePill.dataset.ggameActivePill = '';
      document.body.appendChild(activePill);
    }
    if (activePill) activePill.textContent = `第 ${api.level} 关`;
    document.dispatchEvent(new CustomEvent('ggame:level-start', { detail: profile }));
  }

  function mount() {
    const nativeStart = findNativeStart();
    if (!nativeStart) {
      if (mountAttempts === 10) createGenericStart();
      if (mountAttempts < 60) {
        mountAttempts += 1;
        setTimeout(mount, 50);
      }
      return;
    }
    if (document.querySelector('[data-ggame-level-picker]')) return;
    nativeStart.dataset.ggameNativeStart = '';

    const style = document.createElement('style');
    style.textContent = `
      .ggame-level-picker{width:min(320px,86vw);margin:0 auto 16px;font-family:system-ui,-apple-system,"PingFang SC",sans-serif;color:#eef5ff}
      #ggameGenericStart{position:fixed;inset:0;z-index:2147483400;display:grid;place-items:center;padding:24px;background:radial-gradient(circle at 50% 24%,#19345c,#050c19 72%);transition:opacity .32s ease}
      #ggameGenericStart.is-hidden{opacity:0;pointer-events:none}.ggame-generic-start-card{width:min(100%,360px);text-align:center;color:#f4f8ff;font-family:system-ui,-apple-system,"PingFang SC",sans-serif}.ggame-generic-start-card strong{font-size:42px;background:linear-gradient(135deg,#fff,#64e7dc,#5ea7ff);-webkit-background-clip:text;color:transparent}.ggame-generic-start-card h2{margin:12px 0 8px;font-size:26px}.ggame-generic-start-card p{margin:0 0 18px;color:#aebbd0}.ggame-generic-start-card>button{min-width:190px!important;height:50px!important;border:0!important;border-radius:999px!important;background:linear-gradient(135deg,#64e7dc,#4ca5ff)!important;color:#04121d!important;font:900 17px/1 system-ui!important}
      .ggame-level-row{display:grid;grid-template-columns:42px 1fr 42px 58px;gap:7px;align-items:stretch}
      .ggame-level-row button{box-sizing:border-box!important;min-width:0!important;width:auto!important;height:42px!important;min-height:42px!important;padding:0 8px!important;border-radius:12px!important;border:1px solid rgba(255,255,255,.22)!important;background:rgba(7,16,34,.72)!important;color:#f5f8ff!important;font:800 13px/1 system-ui,-apple-system,"PingFang SC",sans-serif!important;box-shadow:none!important;writing-mode:horizontal-tb!important}
      .ggame-level-current{display:grid;place-items:center;min-width:0;border:1px solid rgba(105,221,255,.35);border-radius:12px;background:rgba(16,36,66,.78);font-weight:900;font-size:15px}
      .ggame-level-difficulty{display:block;margin-top:7px;text-align:center;color:#aebbd0;font-size:12px;font-weight:800;letter-spacing:2px}
      .ggame-level-dialog[hidden]{display:none!important}
      .ggame-level-dialog{position:fixed;inset:0;z-index:2147483600;display:grid;place-items:center;padding:18px;background:rgba(0,5,18,.78);backdrop-filter:blur(9px);-webkit-backdrop-filter:blur(9px)}
      .ggame-level-panel{width:min(100%,380px);max-height:min(78vh,620px);display:flex;flex-direction:column;padding:18px;border:1px solid rgba(104,222,255,.28);border-radius:22px;background:linear-gradient(155deg,#132641,#071224);box-shadow:0 28px 90px rgba(0,0,0,.5);font-family:system-ui,-apple-system,"PingFang SC",sans-serif;color:#fff}
      .ggame-level-panel-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}.ggame-level-panel-head b{font-size:18px}.ggame-level-panel-head button{width:38px!important;height:38px!important;min-height:38px!important;padding:0!important;border-radius:50%!important;background:rgba(255,255,255,.1)!important;color:#fff!important;border:1px solid rgba(255,255,255,.2)!important;box-shadow:none!important}
      .ggame-level-grid{display:grid;grid-template-columns:repeat(9,1fr);gap:6px;overflow:auto;padding:2px 2px 10px}
      .ggame-level-grid button{aspect-ratio:1;padding:0!important;min-width:0!important;width:100%!important;height:auto!important;min-height:30px!important;border-radius:8px!important;border:1px solid rgba(255,255,255,.14)!important;background:rgba(255,255,255,.07)!important;color:#dce7f8!important;font:800 12px/1 system-ui!important;box-shadow:none!important}
      .ggame-level-grid button.is-current{border-color:#64e7dc!important;background:linear-gradient(135deg,#42d3c4,#329de6)!important;color:#03131e!important}
      .ggame-active-level{position:fixed;top:max(14px,env(safe-area-inset-top));right:max(12px,env(safe-area-inset-right));z-index:2147483500;padding:7px 11px;border:1px solid rgba(116,226,255,.34);border-radius:999px;background:rgba(5,16,34,.74);color:#eef8ff;font:900 12px/1 system-ui,-apple-system,"PingFang SC",sans-serif;pointer-events:none;backdrop-filter:blur(10px)}
      @media(max-height:700px){.ggame-level-picker{margin-bottom:10px}.ggame-level-row button{height:36px!important;min-height:36px!important}.ggame-level-current{font-size:13px}.ggame-level-difficulty{margin-top:4px}.ggame-level-grid{grid-template-columns:repeat(11,1fr)}}
    `;
    document.head.appendChild(style);

    const picker = document.createElement('div');
    picker.className = 'ggame-level-picker';
    picker.dataset.ggameLevelPicker = '';
    picker.innerHTML = `
      <div class="ggame-level-row">
        <button type="button" data-ggame-level-prev aria-label="上一关">‹</button>
        <div class="ggame-level-current" data-ggame-current-level></div>
        <button type="button" data-ggame-level-next aria-label="下一关">›</button>
        <button type="button" data-ggame-open-levels>选关</button>
      </div>
      <span class="ggame-level-difficulty" data-ggame-difficulty></span>
    `;
    nativeStart.parentNode.insertBefore(picker, nativeStart);
    currentLabel = picker.querySelector('[data-ggame-current-level]');
    difficultyLabel = picker.querySelector('[data-ggame-difficulty]');

    dialog = document.createElement('div');
    dialog.className = 'ggame-level-dialog';
    dialog.hidden = true;
    dialog.innerHTML = `<section class="ggame-level-panel" role="dialog" aria-modal="true" aria-label="选择关卡"><div class="ggame-level-panel-head"><b>选择关卡</b><button type="button" data-ggame-close-levels aria-label="关闭">×</button></div><div class="ggame-level-grid"></div></section>`;
    const grid = dialog.querySelector('.ggame-level-grid');
    for (let level = 1; level <= TOTAL; level += 1) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = String(level);
      button.dataset.ggameLevelOption = String(level);
      button.addEventListener('click', () => { api.select(level); closeDialog(); });
      grid.appendChild(button);
    }
    document.body.appendChild(dialog);

    picker.querySelector('[data-ggame-level-prev]').addEventListener('click', () => api.select(api.level - 1));
    picker.querySelector('[data-ggame-level-next]').addEventListener('click', () => api.select(api.level + 1));
    picker.querySelector('[data-ggame-open-levels]').addEventListener('click', () => { dialog.hidden = false; });
    dialog.querySelector('[data-ggame-close-levels]').addEventListener('click', closeDialog);
    dialog.addEventListener('click', event => { if (event.target === dialog) closeDialog(); });
    nativeStart.addEventListener('click', commitLevel, { capture: true });
    nativeStart.addEventListener('touchend', commitLevel, { capture: true });
    update();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true });
  else mount();
})();
