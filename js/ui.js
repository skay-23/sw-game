/* ══════════════════════════════════════════════
   UI — DOM helpers, screen transitions, toasts
══════════════════════════════════════════════ */
const UI = (() => {

  let _currentScreen = 'setup';

  // ─── Screen transitions ─────────────────────
  function showScreen(id) {
    const next = document.getElementById(`screen-${id}`);
    if (!next) return;

    const current = document.querySelector('.screen--active');
    if (current && current !== next) {
      current.classList.add('screen--exit');
      setTimeout(() => {
        current.classList.remove('screen--active', 'screen--exit');
      }, 260);
    }

    next.classList.add('screen--active');
    _currentScreen = id;
  }

  function currentScreen() { return _currentScreen; }

  // ─── Intensity hints ────────────────────────
  const INTENSITY_HINTS = {
    1: 'Masajes, baile, contacto suave y conexión emocional.',
    2: 'Besos, caricias íntimas y juegos de seducción.',
    3: 'Prendas, desinhibición y actividades más atrevidas.',
    4: 'Sin límites. Todo está permitido entre quienes lo deseen.',
  };

  // ─── Opciones de género ─────────────────────
  const GENDER_OPTIONS = [
    { value: 'hombre',     label: '♂ Hombre' },
    { value: 'mujer',      label: '♀ Mujer' },
    { value: 'no-binario', label: '⚧ No binario' },
    { value: 'trans',      label: '⚡ Trans' },
  ];

  // ─── Player setup row (simplificado: solo nombre) ─────────────
  function buildPlayerRow(playerId, index) {
    const row = document.createElement('div');
    row.className = 'player-row player-row--simple';
    row.dataset.playerId = playerId;

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'player-name-input';
    nameInput.placeholder = `Jugador ${index + 1}`;
    nameInput.maxLength = 20;
    nameInput.autocomplete = 'off';

    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-player-btn';
    removeBtn.innerHTML = '✕';
    removeBtn.type = 'button';
    removeBtn.setAttribute('aria-label', 'Eliminar jugador');

    row.appendChild(nameInput);
    row.appendChild(removeBtn);

    return { row, nameInput, removeBtn };
  }

  function refreshCoupleOptions(selectEl, ownId, allPlayers) {
    const current = selectEl.value;
    selectEl.innerHTML = '';

    const solo = document.createElement('option');
    solo.value = '';
    solo.textContent = 'Sin pareja';
    selectEl.appendChild(solo);

    allPlayers.forEach(p => {
      if (p.id === ownId) return;
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.name || `Jugador ${allPlayers.indexOf(p) + 1}`;
      selectEl.appendChild(opt);
    });

    if (current && selectEl.querySelector(`option[value="${current}"]`)) {
      selectEl.value = current;
    }
  }

  // ─── Category toggles (setup) ────────────────
  function buildCategoryToggles(segments, activeCategories) {
    const wrap = document.createElement('div');
    wrap.className = 'category-toggles';

    segments.forEach(seg => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'cat-toggle-btn' + (activeCategories.has(seg.key) ? ' active' : '');
      btn.dataset.category = seg.key;
      btn.style.setProperty('--cat-color', seg.color);
      btn.innerHTML = `<span class="cat-dot"></span>${seg.label}`;
      wrap.appendChild(btn);
    });

    return wrap;
  }

  // ─── Preferences form ────────────────────────
  function buildPrefsForm(player, globalMax, allPlayers) {
    const wrap = document.createElement('div');

    // ── Sexo ──────────────────────────────────
    const sexSection = document.createElement('div');
    sexSection.className = 'prefs-section';
    const sexLabel = document.createElement('div');
    sexLabel.className = 'prefs-section-label';
    sexLabel.textContent = 'Sexo';
    sexSection.appendChild(sexLabel);

    const sexGrid = document.createElement('div');
    sexGrid.className = 'prefs-sex-selector';
    [{ v: 'hombre', l: '♂ Hombre' }, { v: 'mujer', l: '♀ Mujer' }].forEach(opt => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'pref-sex-btn' + (player.gender === opt.v ? ' active' : '');
      btn.dataset.sex = opt.v;
      btn.textContent = opt.l;
      btn.addEventListener('click', () => {
        sexGrid.querySelectorAll('.pref-sex-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
      sexGrid.appendChild(btn);
    });
    sexSection.appendChild(sexGrid);
    wrap.appendChild(sexSection);

    // ── Pareja ────────────────────────────────
    const partnerSection = document.createElement('div');
    partnerSection.className = 'prefs-section';
    const partnerLabel = document.createElement('div');
    partnerLabel.className = 'prefs-section-label';
    partnerLabel.textContent = 'Pareja';
    partnerSection.appendChild(partnerLabel);

    const partnerHint = document.createElement('p');
    partnerHint.className = 'prefs-hint';
    partnerHint.textContent = 'Si elegís pareja, esa persona también debería elegirte a vos.';
    partnerSection.appendChild(partnerHint);

    const partnerSelect = document.createElement('select');
    partnerSelect.id = 'pref-partner-select';
    partnerSelect.className = 'couple-select';
    const noPartnerOpt = document.createElement('option');
    noPartnerOpt.value = '';
    noPartnerOpt.textContent = 'Sin pareja';
    partnerSelect.appendChild(noPartnerOpt);

    const currentPartner = allPlayers
      ? allPlayers.find(p => p.id !== player.id && p.coupleId && p.coupleId === player.coupleId)
      : null;

    (allPlayers || []).forEach(p => {
      if (p.id === player.id) return;
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.name || `Jugador ${(allPlayers.indexOf(p) + 1)}`;
      if (currentPartner && p.id === currentPartner.id) opt.selected = true;
      partnerSelect.appendChild(opt);
    });
    partnerSection.appendChild(partnerSelect);
    wrap.appendChild(partnerSection);

    // ── Nivel máximo ──────────────────────────
    const intSection = document.createElement('div');
    intSection.className = 'prefs-section';
    const intLabel = document.createElement('div');
    intLabel.className = 'prefs-section-label';
    intLabel.textContent = 'Mi nivel máximo';
    intSection.appendChild(intLabel);

    const intGrid = document.createElement('div');
    intGrid.className = 'prefs-int-selector';

    const INT_LABELS = ['', 'Suave', 'Picante', 'Caliente', 'Sin límites'];
    for (let lvl = 1; lvl <= globalMax; lvl++) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'prefs-int-btn' + (lvl === (player.preferences.maxIntensity || globalMax) ? ' active' : '');
      btn.dataset.level = lvl;
      btn.innerHTML = `<span class="prefs-int-num">${lvl}</span><span class="prefs-int-label">${INT_LABELS[lvl]}</span>`;
      btn.addEventListener('click', () => {
        intGrid.querySelectorAll('.prefs-int-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
      intGrid.appendChild(btn);
    }
    intSection.appendChild(intGrid);
    wrap.appendChild(intSection);

    // ── Categorías excluidas ──────────────────
    const catSection = document.createElement('div');
    catSection.className = 'prefs-section';
    const catLabel = document.createElement('div');
    catLabel.className = 'prefs-section-label';
    catLabel.textContent = 'Categorías que acepto';
    catSection.appendChild(catLabel);

    const catHint = document.createElement('p');
    catHint.className = 'prefs-hint';
    catHint.textContent = 'Desactiva las que no quieres que te toquen.';
    catSection.appendChild(catHint);

    const catGrid = document.createElement('div');
    catGrid.className = 'pref-cats-grid';
    catGrid.id = 'pref-cats';

    // Usar segmentos disponibles de la ruleta
    if (typeof Activities !== 'undefined') {
      Activities.getRouletteSegments().forEach(seg => {
        const isExcluded = (player.preferences?.excludedCategories || []).includes(seg.key);
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'pref-cat-btn' + (isExcluded ? '' : ' active');
        btn.dataset.category = seg.key;
        btn.style.setProperty('--cat-color', seg.color);
        btn.innerHTML = `<span class="cat-dot"></span>${seg.label}`;
        btn.addEventListener('click', () => btn.classList.toggle('active'));
        catGrid.appendChild(btn);
      });
    }
    catSection.appendChild(catGrid);
    wrap.appendChild(catSection);

    // ── Preferencias generales ────────────────
    const togSection = document.createElement('div');
    togSection.className = 'prefs-section';
    const togLabel = document.createElement('div');
    togLabel.className = 'prefs-section-label';
    togLabel.textContent = 'Preferencias';
    togSection.appendChild(togLabel);

    togSection.appendChild(buildToggle(
      'pref-external',
      'Actividades con personas fuera de mi pareja',
      player.coupleId ? 'Permite que la ruleta te asigne con otras personas.' : 'Permite actividades con otros jugadores.',
      player.preferences.openToExternal !== false
    ));

    togSection.appendChild(buildToggle(
      'pref-same-gender',
      'Cómodo/a con actividades con mi mismo género',
      'Si está desactivado, no te asignarán con alguien de tu mismo género.',
      player.preferences.openToSameGender !== false
    ));

    wrap.appendChild(togSection);

    // Prendas block
    const prendasSection = document.createElement('div');
    prendasSection.className = 'prefs-section';
    const prendasLabel = document.createElement('div');
    prendasLabel.className = 'prefs-section-label';
    prendasLabel.textContent = 'Prendas que llevo puestas';
    prendasSection.appendChild(prendasLabel);

    const prendasHint = document.createElement('p');
    prendasHint.className = 'prefs-hint';
    prendasHint.textContent = 'Marca lo que llevas puesto. La ruleta las irá eliminando en orden.';
    prendasSection.appendChild(prendasHint);

    const prendasList = document.createElement('div');
    prendasList.className = 'prefs-prendas-list';
    prendasList.id = 'pref-prendas';

    Players.PRENDAS_DEFAULT.forEach(prenda => {
      const item = document.createElement('label');
      item.className = 'prenda-check-item';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.value = prenda;
      // Checked if player has this prenda in their list
      checkbox.checked = player.prendas.includes(prenda);

      const span = document.createElement('span');
      span.textContent = prenda;

      item.appendChild(checkbox);
      item.appendChild(span);
      prendasList.appendChild(item);
    });

    prendasSection.appendChild(prendasList);
    wrap.appendChild(prendasSection);

    return wrap;
  }

  function buildToggle(id, label, sublabel, checked) {
    const row = document.createElement('div');
    row.className = 'toggle-row';

    const textWrap = document.createElement('div');
    const labelEl = document.createElement('span');
    labelEl.className = 'toggle-label';
    labelEl.textContent = label;
    const subEl = document.createElement('span');
    subEl.className = 'toggle-sublabel';
    subEl.textContent = sublabel;
    textWrap.appendChild(labelEl);
    textWrap.appendChild(subEl);

    const toggle = document.createElement('label');
    toggle.className = 'toggle';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.id = id;
    input.checked = checked;
    const track = document.createElement('span');
    track.className = 'toggle-track';
    toggle.appendChild(input);
    toggle.appendChild(track);

    row.appendChild(textWrap);
    row.appendChild(toggle);
    return row;
  }

  // ─── Progress dots ───────────────────────────
  function renderProgressDots(container, total, currentIndex) {
    container.innerHTML = '';
    for (let i = 0; i < total; i++) {
      const dot = document.createElement('div');
      dot.className = 'prefs-dot' + (i < currentIndex ? ' done' : i === currentIndex ? ' active' : '');
      container.appendChild(dot);
    }
  }

  // ─── Result player pills ─────────────────────
  function renderResultPlayers(container, primary, partners, target) {
    container.innerHTML = '';

    if (target === 'group') {
      const pill = document.createElement('div');
      pill.className = 'player-pill player-pill--group';
      pill.textContent = '¡Todo el grupo!';
      container.appendChild(pill);
      return;
    }

    const primaryPill = document.createElement('div');
    primaryPill.className = 'player-pill player-pill--primary';
    primaryPill.textContent = primary.name;
    container.appendChild(primaryPill);

    partners.forEach(p => {
      const arrow = document.createElement('span');
      arrow.className = 'player-pill-arrow';
      arrow.textContent = '→';
      container.appendChild(arrow);

      const pill = document.createElement('div');
      pill.className = 'player-pill';
      pill.textContent = p.name;
      container.appendChild(pill);
    });
  }

  // ─── Prendas tracker (resultado strip) ───────
  // Devuelve un contenedor con las prendas pendientes de cada jugador.
  // onRemove(player, prenda) se llama cuando el usuario toca una prenda.
  function buildPrendasTracker(players, onRemove) {
    const wrap = document.createElement('div');
    wrap.className = 'prendas-tracker';

    const title = document.createElement('div');
    title.className = 'prendas-tracker-title';
    title.textContent = 'Prendas a eliminar';
    wrap.appendChild(title);

    players.forEach(player => {
      const remaining = Players.prendasRestantes(player);
      if (remaining.length === 0) return;

      const section = document.createElement('div');
      section.className = 'prendas-player-section';

      const name = document.createElement('div');
      name.className = 'prendas-player-name';
      name.textContent = player.name;
      section.appendChild(name);

      const pills = document.createElement('div');
      pills.className = 'prendas-pills';

      remaining.forEach((prenda, i) => {
        const pill = document.createElement('button');
        pill.type = 'button';
        pill.className = 'prenda-pill' + (i === 0 ? ' prenda-pill--next' : '');
        pill.textContent = prenda;
        pill.dataset.prenda = prenda;
        pill.dataset.playerId = player.id;
        if (i === 0) pill.title = 'Toca para marcar como quitada';

        pill.addEventListener('click', () => {
          if (pill.classList.contains('prenda-pill--removed')) return;
          pill.classList.add('prenda-pill--removed');
          pill.classList.remove('prenda-pill--next');
          // Highlight the next one
          const nextPill = pills.querySelector('.prenda-pill:not(.prenda-pill--removed)');
          if (nextPill) nextPill.classList.add('prenda-pill--next');
          if (onRemove) onRemove(player, prenda);
        });

        pills.appendChild(pill);
      });

      section.appendChild(pills);
      wrap.appendChild(section);
    });

    return wrap;
  }

  // ─── Timer widget ────────────────────────────
  function buildTimer(totalSeconds) {
    const SIZE = 128;
    const R = 50;
    const CIRC = 2 * Math.PI * R;

    // AudioContext creado en primer gesto del usuario para evitar restricciones iOS/Chrome
    let _actx = null;
    function ensureAudio() {
      if (_actx && _actx.state !== 'closed') return _actx;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      _actx = new AC();
      return _actx;
    }

    function playDone() {
      const ctx = ensureAudio();
      if (!ctx) return;
      try {
        // Arpegio ascendente suave: Do5 → Mi5 → Sol5
        [[523.25, 0], [659.25, 0.18], [783.99, 0.36]].forEach(([freq, delay]) => {
          const osc  = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'sine';
          osc.frequency.value = freq;
          const t = ctx.currentTime + delay;
          gain.gain.setValueAtTime(0, t);
          gain.gain.linearRampToValueAtTime(0.13, t + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 1.1);
          osc.start(t);
          osc.stop(t + 1.1);
        });
      } catch (_) { /* silencioso si falla */ }
    }

    const wrap = document.createElement('div');
    wrap.className = 'timer-widget';

    // SVG ring
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `0 0 ${SIZE} ${SIZE}`);
    svg.setAttribute('width', SIZE);
    svg.setAttribute('height', SIZE);
    svg.className = 'timer-svg';

    const bgCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    bgCircle.setAttribute('cx', SIZE / 2);
    bgCircle.setAttribute('cy', SIZE / 2);
    bgCircle.setAttribute('r', R);
    bgCircle.setAttribute('fill', 'none');
    bgCircle.setAttribute('stroke', 'rgba(123,45,139,0.2)');
    bgCircle.setAttribute('stroke-width', '7');

    const progressCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    progressCircle.setAttribute('cx', SIZE / 2);
    progressCircle.setAttribute('cy', SIZE / 2);
    progressCircle.setAttribute('r', R);
    progressCircle.setAttribute('fill', 'none');
    progressCircle.setAttribute('stroke', '#c9a84c');
    progressCircle.setAttribute('stroke-width', '7');
    progressCircle.setAttribute('stroke-linecap', 'round');
    progressCircle.setAttribute('stroke-dasharray', CIRC);
    progressCircle.setAttribute('stroke-dashoffset', '0');
    progressCircle.setAttribute('transform', `rotate(-90 ${SIZE / 2} ${SIZE / 2})`);

    svg.appendChild(bgCircle);
    svg.appendChild(progressCircle);

    // Number overlay
    const ringWrap = document.createElement('div');
    ringWrap.className = 'timer-ring-wrap';

    const timeText = document.createElement('div');
    timeText.className = 'timer-time-text';

    ringWrap.appendChild(svg);
    ringWrap.appendChild(timeText);

    // Start button
    const startBtn = document.createElement('button');
    startBtn.type = 'button';
    startBtn.className = 'btn btn--ghost timer-start-btn';

    wrap.appendChild(ringWrap);
    wrap.appendChild(startBtn);

    // ── Internal state ──
    let remaining = totalSeconds;
    let timerState = 'idle'; // idle | running | paused | done
    let intervalId = null;

    function fmt(s) {
      const m = Math.floor(s / 60);
      const sec = s % 60;
      return m > 0 ? `${m}:${sec.toString().padStart(2, '0')}` : `${s}`;
    }

    function updateRing() {
      const pct = remaining / totalSeconds;
      progressCircle.setAttribute('stroke-dashoffset', CIRC * (1 - pct));
      timeText.textContent = fmt(remaining);

      if (remaining <= 5) {
        progressCircle.setAttribute('stroke', '#e74c3c');
        timeText.style.color = '#e74c3c';
      } else if (remaining <= Math.ceil(totalSeconds * 0.25)) {
        progressCircle.setAttribute('stroke', '#e8c96a');
        timeText.style.color = '#e8c96a';
      } else {
        progressCircle.setAttribute('stroke', '#c9a84c');
        timeText.style.color = '';
      }
    }

    function setBtn(label, icon) {
      startBtn.textContent = `${icon} ${label}`;
    }

    function reset() {
      clearInterval(intervalId);
      remaining = totalSeconds;
      timerState = 'idle';
      wrap.classList.remove('timer--done');
      progressCircle.setAttribute('stroke', '#c9a84c');
      timeText.style.color = '';
      updateRing();
      setBtn('Iniciar', '▶');
    }

    function onDone() {
      clearInterval(intervalId);
      timerState = 'done';
      remaining = 0;
      updateRing();
      wrap.classList.add('timer--done');
      setBtn('De nuevo', '↺');
      playDone();

      // Flash animation
      let flashes = 0;
      const flash = setInterval(() => {
        wrap.style.borderColor = flashes % 2 === 0 ? '#c9a84c' : 'var(--border)';
        if (++flashes >= 6) {
          clearInterval(flash);
          wrap.style.borderColor = '';
        }
      }, 180);
    }

    startBtn.addEventListener('click', () => {
      ensureAudio(); // crea AudioContext en gesto del usuario
      if (timerState === 'idle' || timerState === 'paused') {
        timerState = 'running';
        setBtn('Pausar', '⏸');
        intervalId = setInterval(() => {
          remaining--;
          updateRing();
          if (remaining <= 0) onDone();
        }, 1000);
      } else if (timerState === 'running') {
        clearInterval(intervalId);
        timerState = 'paused';
        setBtn('Continuar', '▶');
      } else if (timerState === 'done') {
        reset();
      }
    });

    // Expose destroy for cleanup
    wrap._destroy = () => {
      clearInterval(intervalId);
      if (_actx && _actx.state !== 'closed') _actx.close().catch(() => {});
    };

    reset(); // Initialize display
    return wrap;
  }

  // ─── Toast ───────────────────────────────────
  function toast(msg, type = 'info') {
    const tc = document.getElementById('toast-container');
    const el = document.createElement('div');
    el.className = `toast toast--${type}`;
    el.textContent = msg;
    tc.appendChild(el);
    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transition = 'opacity 0.3s';
      setTimeout(() => el.remove(), 300);
    }, 3000);
  }

  return {
    showScreen,
    currentScreen,
    buildPlayerRow,
    refreshCoupleOptions,
    buildCategoryToggles,
    buildPrefsForm,
    buildPrendasTracker,
    buildTimer,
    renderProgressDots,
    renderResultPlayers,
    toast,
    INTENSITY_HINTS,
    GENDER_OPTIONS,
  };
})();
