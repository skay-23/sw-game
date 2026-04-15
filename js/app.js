/* ══════════════════════════════════════════════
   APP — estado global y máquina de estados
══════════════════════════════════════════════ */
(function () {

  // ─── Estado global ──────────────────────────
  const State = {
    // Setup
    rawPlayers: [],
    globalIntensity: 1,
    totalRounds: 5,
    activeCategories: new Set(['touch', 'dance', 'connection', 'kiss', 'strip', 'truth']),

    // Game
    turnOrder: [],
    currentPlayerIndex: 0,
    currentRound: 1,
    turnHistory: [],
    usedActivityIds: new Set(),
    preferencesStep: 0,
  };

  const $ = id => document.getElementById(id);

  // ══════════════════════════════════════════
  // SETUP SCREEN
  // ══════════════════════════════════════════

  const playersList = $('players-list');
  const playerCount = $('player-count');

  function refreshPlayerList() {
    playersList.innerHTML = '';
    playerCount.textContent = State.rawPlayers.length;

    State.rawPlayers.forEach((player, i) => {
      const { row, nameInput, removeBtn } = UI.buildPlayerRow(player.id, i);

      nameInput.value = player.name;

      // Name change — solo actualiza el estado, sin reconstruir el DOM
      nameInput.addEventListener('input', () => {
        player.name = nameInput.value;
      });

      // Remove
      removeBtn.addEventListener('click', () => {
        Players.unpair(player, State.rawPlayers);
        State.rawPlayers = State.rawPlayers.filter(p => p.id !== player.id);
        refreshPlayerList();
      });

      playersList.appendChild(row);
    });
  }

  // Add player
  $('add-player-btn').addEventListener('click', () => {
    if (State.rawPlayers.length >= 10) {
      UI.toast('Máximo 10 jugadores.', 'error');
      return;
    }
    const p = Players.createPlayer('');
    State.rawPlayers.push(p);
    refreshPlayerList();
    const rows = playersList.querySelectorAll('.player-row');
    rows[rows.length - 1]?.querySelector('input')?.focus();
  });

  // Intensity selector
  $('global-intensity').addEventListener('click', e => {
    const btn = e.target.closest('.int-btn');
    if (!btn) return;
    const level = parseInt(btn.dataset.level);
    State.globalIntensity = level;
    $('global-intensity').querySelectorAll('.int-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    $('intensity-hint').textContent = UI.INTENSITY_HINTS[level];
  });

  // Rounds selector
  $('rounds-selector').addEventListener('click', e => {
    const btn = e.target.closest('.round-btn');
    if (!btn) return;
    State.totalRounds = parseInt(btn.dataset.rounds);
    $('rounds-selector').querySelectorAll('.round-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });

  // Start button
  $('start-btn').addEventListener('click', () => {
    const { valid, errors } = Players.validate(State.rawPlayers);
    if (!valid) {
      UI.toast(errors[0], 'error');
      return;
    }
    startPreferences();
  });

  // ══════════════════════════════════════════
  // PREFERENCES FLOW
  // ══════════════════════════════════════════

  function startPreferences() {
    State.preferencesStep = 0;
    showPrefsCover(State.rawPlayers[0]);
  }

  function showPrefsCover(player) {
    $('cover-name').textContent = player.name || `Jugador ${State.rawPlayers.indexOf(player) + 1}`;
    UI.showScreen('prefs-cover');
  }

  $('cover-btn').addEventListener('click', () => {
    showPrefsForm(State.preferencesStep);
  });

  function showPrefsForm(step) {
    const player = State.rawPlayers[step];
    $('prefs-title').textContent = player.name || `Jugador ${step + 1}`;
    UI.renderProgressDots($('prefs-progress'), State.rawPlayers.length, step);

    const body = $('prefs-body');
    body.innerHTML = '';
    body.appendChild(UI.buildPrefsForm(player, State.globalIntensity, State.rawPlayers));

    UI.showScreen('preferences');
  }

  $('prefs-save-btn').addEventListener('click', () => {
    const step = State.preferencesStep;
    const player = State.rawPlayers[step];
    const body  = $('prefs-body');

    // Sexo
    const activeSex = body.querySelector('.pref-sex-btn.active');
    if (activeSex) player.gender = activeSex.dataset.sex;

    // Pareja
    const partnerSel = document.getElementById('pref-partner-select');
    if (partnerSel) {
      Players.unpair(player, State.rawPlayers);
      const targetId = partnerSel.value;
      if (targetId) {
        const target = State.rawPlayers.find(p => p.id === targetId);
        if (target) {
          Players.unpair(target, State.rawPlayers);
          Players.pairCouple(player, target);
        }
      }
    }

    // Intensidad máxima
    const activeInt = body.querySelector('.prefs-int-btn.active');
    if (activeInt) player.preferences.maxIntensity = parseInt(activeInt.dataset.level);

    // Categorías excluidas (las que NO tienen clase active)
    player.preferences.excludedCategories = [];
    body.querySelectorAll('#pref-cats .pref-cat-btn:not(.active)').forEach(btn => {
      player.preferences.excludedCategories.push(btn.dataset.category);
    });

    // Toggles preferencias
    const extToggle = document.getElementById('pref-external');
    const genderToggle = document.getElementById('pref-same-gender');
    if (extToggle)    player.preferences.openToExternal    = extToggle.checked;
    if (genderToggle) player.preferences.openToSameGender  = genderToggle.checked;

    // Prendas de ropa
    const prendasChecked = [];
    body.querySelectorAll('#pref-prendas input[type=checkbox]:checked').forEach(cb => {
      prendasChecked.push(cb.value);
    });
    player.prendas = prendasChecked;
    player.prendasRemoved = [];

    State.preferencesStep++;

    if (State.preferencesStep >= State.rawPlayers.length) {
      initGame();
    } else {
      showPrefsCover(State.rawPlayers[State.preferencesStep]);
    }
  });

  // ══════════════════════════════════════════
  // GAME INIT
  // ══════════════════════════════════════════

  function initGame() {
    State.turnOrder = Players.shuffleTurnOrder(State.rawPlayers);
    State.currentPlayerIndex = 0;
    State.currentRound = 1;
    State.turnHistory = [];
    State.usedActivityIds = new Set();

    // Segmentos filtrados por ronda actual (nivel 1 al inicio)
    const segs = getSegmentsForCurrentRound();
    const fallback = Activities.getRouletteSegments().filter(s => State.activeCategories.has(s.key));
    Roulette.init('roulette-canvas', segs.length > 0 ? segs : fallback);

    UI.showScreen('game');
    updateGameHeader();

    history.pushState({ sw: true }, '');
    window.addEventListener('popstate', onPopState);
  }

  function onPopState() {
    history.pushState({ sw: true }, '');
  }

  // ══════════════════════════════════════════
  // GAME LOOP
  // ══════════════════════════════════════════

  function updateGameHeader() {
    const player = State.turnOrder[State.currentPlayerIndex];
    const intensity = Activities.getEffectiveIntensity(State);
    $('turn-name').textContent = player.name;
    $('round-badge').textContent = `Ronda ${State.currentRound}`;
    $('level-badge').textContent = `Nivel ${intensity}`;
  }

  $('spin-btn').addEventListener('click', () => {
    if (Roulette.isSpinning()) return;
    $('spin-btn').disabled = true;

    const result = Activities.selectActivity(State);
    if (!result) {
      UI.toast('No hay actividades disponibles. Terminando juego.', 'info');
      endGame();
      return;
    }

    const { activity, primary, partners } = result;

    // Segmentos activos para la ronda actual (los mismos que ve la ruleta)
    const segments = getSegmentsForCurrentRound();
    const segIndex = segments.findIndex(s => s.key === activity.category);
    const targetSeg = segIndex >= 0 ? segIndex : 0;

    Roulette.spin(targetSeg, () => {
      Roulette.flashSegment(targetSeg, () => {
        State.usedActivityIds.add(activity.id);
        State.turnHistory.push({
          round: State.currentRound,
          playerId: primary.id,
          activityId: activity.id,
        });
        showResult(activity, primary, partners);
      });
    });
  });

  $('end-game-btn').addEventListener('click', () => {
    if (confirm('¿Terminar el juego ahora?')) endGame();
  });

  // ══════════════════════════════════════════
  // RESULT SCREEN
  // ══════════════════════════════════════════

  let _activeTimer = null; // referencia al widget de timer activo

  function showResult(activity, primary, partners) {
    // Limpiar timer anterior si existía
    if (_activeTimer) { _activeTimer._destroy(); _activeTimer = null; }

    const allSegments = Activities.getRouletteSegments();
    const seg = allSegments.find(s => s.key === activity.category);

    $('result-category').textContent = seg ? seg.label : activity.category;
    $('result-level').textContent = `Nivel ${activity.intensity}`;

    UI.renderResultPlayers($('result-players'), primary, partners, activity.target);
    $('result-text').textContent = Activities.renderText(activity, partners);

    // ── Timer de actividad ──
    const timerContainer = $('result-activity-timer');
    timerContainer.innerHTML = '';
    const duration = Activities.getDuration(activity.id);
    if (duration) {
      _activeTimer = UI.buildTimer(duration);
      timerContainer.appendChild(_activeTimer);
    }

    // ── Prendas tracker ──
    const prendasContainer = $('result-prendas');
    prendasContainer.innerHTML = '';
    if (activity.category === 'strip') {
      // Solo mostrar las prendas de quien las pierde:
      // - grupo: todos; solo: el jugador activo; pareja: solo el/la partner
      const involved = activity.target === 'group'
        ? State.turnOrder
        : activity.target === 'solo'
          ? [primary]
          : partners;   // couple_internal / couple_external → solo el partner
      const withPrendas = involved.filter(p => Players.prendasRestantes(p).length > 0);
      if (withPrendas.length > 0) {
        prendasContainer.appendChild(UI.buildPrendasTracker(withPrendas, (player, prenda) => {
          Players.removePrenda(player, prenda);
        }));
      }
    }

    // ── Countdown para habilitar "Listo" ──
    const doneBtn = $('result-done-btn');
    doneBtn.disabled = true;
    $('result-timer').textContent = 'Espera 4 segundos…';

    let countdown = 4;
    const cd = setInterval(() => {
      countdown--;
      if (countdown > 0) {
        $('result-timer').textContent = `Espera ${countdown} segundo${countdown !== 1 ? 's' : ''}…`;
      } else {
        clearInterval(cd);
        doneBtn.disabled = false;
        $('result-timer').textContent = '';
      }
    }, 1000);

    UI.showScreen('result');
  }

  $('result-done-btn').addEventListener('click', nextTurn);

  // ══════════════════════════════════════════
  // TURN ADVANCEMENT
  // ══════════════════════════════════════════

  function nextTurn() {
    if (_activeTimer) { _activeTimer._destroy(); _activeTimer = null; }

    const prevIntensity = Activities.getEffectiveIntensity(State);
    State.currentPlayerIndex++;

    if (State.currentPlayerIndex >= State.turnOrder.length) {
      State.currentPlayerIndex = 0;
      State.currentRound++;

      if (State.currentRound > State.totalRounds) {
        endGame();
        return;
      }
    }

    const newIntensity = Activities.getEffectiveIntensity(State);

    // Notificar categorías recién desbloqueadas al subir de nivel
    if (newIntensity > prevIntensity) {
      const unlocked = Activities.getRouletteSegments().filter(s =>
        State.activeCategories.has(s.key) &&
        Activities.getCategoryMinIntensity(s.key) === newIntensity
      );
      if (unlocked.length > 0) {
        const names = unlocked.map(s => s.label).join(' y ');
        setTimeout(() => UI.toast(`Nivel ${newIntensity} — ${names} desbloqueado`, 'success'), 350);
      }
    }

    // Actualizar ruleta con las categorías disponibles para esta ronda
    const segs = getSegmentsForCurrentRound();
    const fallback = Activities.getRouletteSegments().filter(s => State.activeCategories.has(s.key));
    Roulette.updateSegments(segs.length > 0 ? segs : fallback);

    UI.showScreen('game');
    updateGameHeader();
    $('spin-btn').disabled = false;
  }

  // ══════════════════════════════════════════
  // END GAME
  // ══════════════════════════════════════════

  function endGame() {
    window.removeEventListener('popstate', onPopState);
    UI.showScreen('end');
  }

  $('play-again-btn').addEventListener('click', () => {
    State.rawPlayers = [];
    State.globalIntensity = 1;
    State.totalRounds = 5;
    State.activeCategories = new Set(Activities.getRouletteSegments().map(s => s.key));
    State.turnOrder = [];
    State.currentPlayerIndex = 0;
    State.currentRound = 1;
    State.turnHistory = [];
    State.usedActivityIds = new Set();

    $('global-intensity').querySelectorAll('.int-btn').forEach((b, i) => {
      b.classList.toggle('active', i === 0);
    });
    $('rounds-selector').querySelectorAll('.round-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.rounds === '5');
    });
    $('intensity-hint').textContent = UI.INTENSITY_HINTS[1];

    State.activeCategories = new Set(Activities.getRouletteSegments().map(s => s.key));
    State.rawPlayers.push(Players.createPlayer(''));
    State.rawPlayers.push(Players.createPlayer(''));
    refreshPlayerList();

    UI.showScreen('setup');
  });

  // ══════════════════════════════════════════
  // HELPERS
  // ══════════════════════════════════════════

  // Segmentos de ruleta disponibles para el jugador y ronda actual
  function getSegmentsForCurrentRound() {
    const intensity      = Activities.getEffectiveIntensity(State);
    const currentPlayer  = State.turnOrder[State.currentPlayerIndex];
    const excluded       = currentPlayer?.preferences?.excludedCategories || [];
    return Activities.getRouletteSegments().filter(s =>
      (s.minIntensity || 1) <= intensity &&
      !excluded.includes(s.key)
    );
  }

  // ══════════════════════════════════════════
  // BOOT — carga config del servidor si está disponible
  // ══════════════════════════════════════════
  (function boot() {
    function fetchWithTimeout(url, ms) {
      return Promise.race([
        fetch(url).then(r => r.ok ? r.json() : null).catch(() => null),
        new Promise(resolve => setTimeout(() => resolve(null), ms)),
      ]);
    }

    // Config y actividades cargan en paralelo (timeout 1.5s)
    const configPromise     = fetchWithTimeout('/api/config', 1500);
    const activitiesPromise = fetchWithTimeout('/api/activities', 1500);

    // Leer localStorage como fallback cuando el servidor no está disponible
    function loadFromLocalStorage() {
      try {
        const lsActs = localStorage.getItem('sw_activities');
        const lsCfg  = localStorage.getItem('sw_config');
        if (lsActs) {
          const acts = JSON.parse(lsActs);
          if (Array.isArray(acts) && acts.length > 0) Activities.setActivities(acts);
        }
        if (lsCfg) {
          const cfg = JSON.parse(lsCfg);
          if (Array.isArray(cfg.categories)) Activities.setCategories(cfg.categories);
        }
      } catch (e) { /* localStorage no disponible */ }
    }

    $('splash-start-btn').addEventListener('click', async () => {
      const [config, activities] = await Promise.all([configPromise, activitiesPromise]);

      if (config && Array.isArray(config.categories)) {
        Activities.setCategories(config.categories);
      }
      if (Array.isArray(activities) && activities.length > 0) {
        Activities.setActivities(activities);
      }
      // Si el servidor no respondió, usar localStorage (datos guardados desde el admin)
      if (!config && !activities) {
        loadFromLocalStorage();
      }

      // Inicializar setup
      State.activeCategories = new Set(Activities.getRouletteSegments().map(s => s.key));
      State.rawPlayers.push(Players.createPlayer(''));
      State.rawPlayers.push(Players.createPlayer(''));
      refreshPlayerList();
      UI.showScreen('setup');
      setTimeout(() => {
        playersList.querySelector('.player-name-input')?.focus();
      }, 300);
    });
  })();

})();
