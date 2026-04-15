/* ══════════════════════════════════════════════
   ACTIVITIES — base de datos + algoritmo de selección
══════════════════════════════════════════════ */
const Activities = (() => {

  // ─── Base de datos de actividades ───────────
  // target: solo | couple_internal | couple_external | group
  // {partner} se reemplaza con nombres reales al mostrar
  // Los datos se cargan desde data/activities.json al iniciar (ver boot en app.js)
  const DB = [];

  // ─── Definición de categorías (dinámico — sobreescribible por admin) ─
  let CATEGORY_LABELS = {
    touch:      'Toque',
    dance:      'Baile',
    connection: 'Conexión',
    kiss:       'Beso',
    strip:      'Prenda',
    truth:      'Verdad',
  };

  let CATEGORY_COLORS = {
    touch:      '#7b2d8b',
    dance:      '#2d6b8b',
    connection: '#8b5a2d',
    kiss:       '#c9a84c',
    strip:      '#8b2d2d',
    truth:      '#2d8b5a',
  };

  // Nivel mínimo en que aparece cada categoría en la ruleta
  let CATEGORY_MIN_INTENSITY = {
    touch:      1,
    dance:      1,
    connection: 1,
    truth:      1,
    kiss:       2,   // aparece al llegar a nivel 2
    strip:      3,   // aparece al llegar a nivel 3
  };

  // Sobreescribe las definiciones desde el servidor (admin)
  function setCategories(cats) {
    CATEGORY_LABELS      = {};
    CATEGORY_COLORS      = {};
    CATEGORY_MIN_INTENSITY = {};
    cats.forEach(c => {
      CATEGORY_LABELS[c.key]        = c.label;
      CATEGORY_COLORS[c.key]        = c.color;
      CATEGORY_MIN_INTENSITY[c.key] = c.minIntensity || 1;
    });
  }

  function getCategoryMinIntensity(key) {
    return CATEGORY_MIN_INTENSITY[key] || 1;
  }

  function getRouletteSegments() {
    return Object.keys(CATEGORY_LABELS).map(key => ({
      key,
      label:        CATEGORY_LABELS[key],
      color:        CATEGORY_COLORS[key],
      minIntensity: CATEGORY_MIN_INTENSITY[key] || 1,
    }));
  }

  // ─── Intensidad efectiva por RONDA ──────────
  // Escala lineal de 1 → globalIntensity, garantizando que
  // la ÚLTIMA RONDA siempre sea el nivel máximo elegido.
  //
  // Ejemplos con globalIntensity=4:
  //   3 rondas  → 1, 3, 4
  //   5 rondas  → 1, 2, 3, 3, 4
  //   8 rondas  → 1, 1, 2, 2, 3, 3, 4, 4
  //  12 rondas  → 1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4
  function getEffectiveIntensity(state) {
    if (state.globalIntensity <= 1) return 1;
    if (state.totalRounds <= 1)     return state.globalIntensity;

    const progress = (state.currentRound - 1) / (state.totalRounds - 1); // 0.0 → 1.0
    const intensity = 1 + Math.ceil(progress * (state.globalIntensity - 1));
    return Math.min(state.globalIntensity, Math.max(1, intensity));
  }

  // ─── Tipos de target válidos por ronda ───────
  function getValidTargets(state) {
    const progress = state.totalRounds <= 1 ? 1
      : (state.currentRound - 1) / (state.totalRounds - 1);

    const types = ['solo'];
    const hasCouples = state.turnOrder.some(p => p.coupleId);
    if (hasCouples) types.push('couple_internal');

    // couple_external desde el 25% del juego
    if (progress >= 0.25) types.push('couple_external');

    // group desde el 55% del juego
    if (progress >= 0.55) types.push('group');

    return types;
  }

  // ─── Compatibilidad de género ────────────────
  // Solo aplicamos el filtro entre géneros binarios declarados.
  // No-binario y trans nunca son excluidos por esta regla.
  function isSameGender(a, b) {
    const binary = ['hombre', 'mujer'];
    if (!binary.includes(a.gender) || !binary.includes(b.gender)) return false;
    return a.gender === b.gender;
  }

  // ─── Filtrado de candidatos ──────────────────
  function getCandidates(state) {
    const primary = state.turnOrder[state.currentPlayerIndex];
    const intensity = getEffectiveIntensity(state);
    const targets = getValidTargets(state);
    const activeCats = state.activeCategories || null;

    const excluded = primary.preferences?.excludedCategories || [];

    return DB.filter(a => {
      if (a.intensity > intensity) return false;
      if (!targets.includes(a.target)) return false;
      if (state.usedActivityIds.has(a.id)) return false;
      if (a.target === 'couple_internal' && !primary.coupleId) return false;
      // Filtrar por categorías activas globalmente
      if (activeCats && !activeCats.has(a.category)) return false;
      // Filtrar por nivel mínimo de categoría (progresión por ronda)
      if ((CATEGORY_MIN_INTENSITY[a.category] || 1) > intensity) return false;
      // Filtrar por exclusiones personales del jugador activo
      if (excluded.includes(a.category)) return false;
      return true;
    });
  }

  // ─── Asignación de pareja ────────────────────
  function assignPartner(activity, primary, state) {
    if (activity.target === 'solo' || activity.target === 'group') return [];

    const others = state.turnOrder.filter(p => p.id !== primary.id);

    if (activity.target === 'couple_internal') {
      const partner = others.find(p => p.coupleId && p.coupleId === primary.coupleId);
      if (!partner) return null;
      if (activity.intensity > partner.preferences.maxIntensity) return null;
      // Respetar exclusiones de categoría del partner
      if ((partner.preferences?.excludedCategories || []).includes(activity.category)) return null;
      return [partner];
    }

    if (activity.target === 'couple_external') {
      if (!primary.preferences.openToExternal) return null;

      const candidates = others.filter(p => {
        if (primary.coupleId && p.coupleId === primary.coupleId) return false;
        if (!p.preferences.openToExternal) return false;
        if (activity.intensity > p.preferences.maxIntensity) return false;
        if (activity.intensity > primary.preferences.maxIntensity) return false;
        // Filtro de género: si alguno no está cómodo con el mismo género
        if (!primary.preferences.openToSameGender && isSameGender(primary, p)) return false;
        if (!p.preferences.openToSameGender && isSameGender(p, primary)) return false;
        // Respetar exclusiones de categoría del candidato
        if ((p.preferences?.excludedCategories || []).includes(activity.category)) return false;
        return true;
      });

      if (candidates.length === 0) return null;
      return [candidates[Math.floor(Math.random() * candidates.length)]];
    }

    return null;
  }

  // ─── Selector principal ──────────────────────
  function selectActivity(state) {
    const primary = state.turnOrder[state.currentPlayerIndex];
    let candidates = getCandidates(state);
    const intensity = getEffectiveIntensity(state);

    // Priorizar actividades al nivel actual; caer a niveles inferiores solo si es necesario
    // Ordenar: primero por intensidad desc, luego aleatorio dentro del mismo nivel
    candidates = candidates.slice().sort((a, b) => {
      if (b.intensity !== a.intensity) return b.intensity - a.intensity;
      return Math.random() - 0.5;
    });

    for (const activity of candidates) {
      const partners = assignPartner(activity, primary, state);
      if (partners !== null) {
        return { activity, primary, partners };
      }
    }

    // Hard fallback: solo truth at intensity 1
    const fallback = DB.find(a => a.target === 'solo' && a.intensity === 1 && a.category === 'truth');
    return { activity: fallback, primary, partners: [] };
  }

  // Sobreescribe la DB completa desde el servidor (admin)
  function setActivities(arr) {
    if (Array.isArray(arr) && arr.length > 0) {
      DB.length = 0;
      arr.forEach(a => DB.push(a));
    }
  }

  function getActivities() { return DB.slice(); }

  // ─── Duración: embebida en cada actividad como campo opcional ────
  function getDuration(activityId) {
    const act = DB.find(a => a.id === activityId);
    return act?.duration || null;
  }

  // ─── Render texto ────────────────────────────
  function renderText(activity, partners) {
    return activity.text.replace('{partner}', partners.map(p => p.name).join(' y '));
  }

  return {
    getRouletteSegments,
    getEffectiveIntensity,
    getCategoryMinIntensity,
    setCategories,
    setActivities,
    getActivities,
    selectActivity,
    renderText,
    getDuration,
    CATEGORY_LABELS,
  };
})();
