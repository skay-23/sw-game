/* ══════════════════════════════════════════════
   ACTIVITIES — base de datos + algoritmo de selección
══════════════════════════════════════════════ */
const Activities = (() => {

  // ─── Base de datos de actividades ───────────
  // target: solo | couple_internal | couple_external | group
  // {partner} se reemplaza con nombres reales al mostrar
  const DB = [

    // ══ NIVEL 1 — SUAVE ══════════════════════

    // Solo
    { id: 'a001', text: 'Nombra a la persona del grupo que más te atrae físicamente.', intensity: 1, target: 'solo', category: 'truth' },
    { id: 'a002', text: 'Confiesa algo travieso que hayas pensado sobre alguien de este grupo.', intensity: 1, target: 'solo', category: 'truth' },
    { id: 'a003', text: 'Haz tu movimiento de baile más seductor durante 30 segundos.', intensity: 1, target: 'solo', category: 'dance' },
    { id: 'a004', text: 'Di en voz alta qué zona de tu cuerpo es tu favorita.', intensity: 1, target: 'solo', category: 'connection' },
    { id: 'a005', text: 'Describe en una frase cómo sería tu noche perfecta con alguien de este grupo.', intensity: 1, target: 'solo', category: 'truth' },

    // Pareja interna
    { id: 'a010', text: 'Dale a {partner} un masaje de hombros durante 60 segundos.', intensity: 1, target: 'couple_internal', category: 'touch' },
    { id: 'a011', text: 'Mira a los ojos de {partner} en silencio durante 30 segundos. Sin reírse.', intensity: 1, target: 'couple_internal', category: 'connection' },
    { id: 'a012', text: 'Susúrrale a {partner} lo que más te gusta de él/ella.', intensity: 1, target: 'couple_internal', category: 'connection' },
    { id: 'a013', text: 'Acaricia suavemente el cabello de {partner} durante 30 segundos.', intensity: 1, target: 'couple_internal', category: 'touch' },
    { id: 'a014', text: 'Baila lento abrazado/a a {partner} durante 60 segundos.', intensity: 1, target: 'couple_internal', category: 'dance' },
    { id: 'a015', text: 'Dale a {partner} un masaje en las manos durante un minuto.', intensity: 1, target: 'couple_internal', category: 'touch' },

    // Pareja externa
    { id: 'a020', text: 'Dale a {partner} un abrazo de al menos 15 segundos.', intensity: 1, target: 'couple_external', category: 'touch' },
    { id: 'a021', text: 'Dile a {partner} algo genuino que te guste de su apariencia.', intensity: 1, target: 'couple_external', category: 'connection' },
    { id: 'a022', text: 'Baila 60 segundos con {partner}.', intensity: 1, target: 'couple_external', category: 'dance' },
    { id: 'a023', text: 'Dale a {partner} un masaje en las manos durante un minuto.', intensity: 1, target: 'couple_external', category: 'touch' },
    { id: 'a024', text: 'Siéntate al lado de {partner} y conversen sobre lo que más les emociona de esta noche.', intensity: 1, target: 'couple_external', category: 'connection' },

    // Grupo
    { id: 'a030', text: 'Todo el grupo forma un círculo y se dan un masaje de hombros en cadena durante 60 segundos.', intensity: 1, target: 'group', category: 'touch' },
    { id: 'a031', text: 'Ronda de confesiones: cada persona del grupo dice si alguna vez ha pensado en alguien de aquí de forma romántica.', intensity: 1, target: 'group', category: 'truth' },
    { id: 'a032', text: 'El grupo vota: ¿quién tiene la mirada más seductora de la noche?', intensity: 1, target: 'group', category: 'truth' },

    // ══ NIVEL 2 — PICANTE ════════════════════

    // Solo
    { id: 'b001', text: 'Describe en detalle tu mayor fantasía con alguien de este grupo.', intensity: 2, target: 'solo', category: 'truth' },
    { id: 'b002', text: 'Actúa durante 30 segundos como si estuvieras seduciendo a alguien. El grupo juzga.', intensity: 2, target: 'solo', category: 'dance' },
    { id: 'b003', text: 'Di qué parte del cuerpo de alguien del grupo encuentras más irresistible.', intensity: 2, target: 'solo', category: 'truth' },
    { id: 'b004', text: 'Confiesa: ¿has sentido atracción por alguna pareja del grupo? ¿Por quién?', intensity: 2, target: 'solo', category: 'truth' },

    // Pareja interna
    { id: 'b010', text: 'Besa a {partner} durante al menos 15 segundos.', intensity: 2, target: 'couple_internal', category: 'kiss' },
    { id: 'b011', text: 'Besa lentamente el cuello de {partner} durante 30 segundos.', intensity: 2, target: 'couple_internal', category: 'kiss' },
    { id: 'b012', text: 'Acaricia la espalda de {partner} por dentro de la ropa durante 30 segundos.', intensity: 2, target: 'couple_internal', category: 'touch' },
    { id: 'b013', text: 'Sopla suavemente sobre el cuello de {partner} sin tocarlo/la. Luego hazlo con tus labios.', intensity: 2, target: 'couple_internal', category: 'kiss' },
    { id: 'b014', text: 'Dale a {partner} un masaje en los pies y piernas durante 2 minutos.', intensity: 2, target: 'couple_internal', category: 'touch' },
    { id: 'b015', text: 'Acaricia la cara de {partner} con los ojos cerrados y dile lo que sientes.', intensity: 2, target: 'couple_internal', category: 'connection' },

    // Pareja externa
    { id: 'b020', text: 'Besa tres veces lentamente la mejilla de {partner}.', intensity: 2, target: 'couple_external', category: 'kiss' },
    { id: 'b021', text: 'Dale a {partner} un abrazo por detrás, muy cercano, durante 30 segundos.', intensity: 2, target: 'couple_external', category: 'touch' },
    { id: 'b022', text: 'Besa la mano de {partner} de manera seductora.', intensity: 2, target: 'couple_external', category: 'kiss' },
    { id: 'b023', text: 'Susúrrale al oído a {partner} algo que encuentres atractivo de él/ella.', intensity: 2, target: 'couple_external', category: 'connection' },
    { id: 'b024', text: 'Dale a {partner} un masaje en hombros y cuello durante 2 minutos.', intensity: 2, target: 'couple_external', category: 'touch' },

    // Grupo
    { id: 'b030', text: 'El grupo vota quién besa mejor. El elegido da un beso en la mejilla a quien quiera.', intensity: 2, target: 'group', category: 'kiss' },
    { id: 'b031', text: 'Todos toman la mano de la persona a su derecha y no sueltan durante el siguiente turno.', intensity: 2, target: 'group', category: 'connection' },
    { id: 'b032', text: 'Ronda de verdades: cada persona confiesa qué es lo que más le excita de una persona.', intensity: 2, target: 'group', category: 'truth' },

    // ══ NIVEL 3 — CALIENTE ═══════════════════

    // Solo
    { id: 'c001', text: 'Quítate una prenda de ropa.', intensity: 3, target: 'solo', category: 'strip' },
    { id: 'c002', text: 'Describe en detalle lo que le harías a alguien que te atrae del grupo.', intensity: 3, target: 'solo', category: 'truth' },
    { id: 'c003', text: 'Haz una pose seductora para el grupo y mantenla 15 segundos.', intensity: 3, target: 'solo', category: 'dance' },
    { id: 'c004', text: 'Quítate dos prendas de ropa.', intensity: 3, target: 'solo', category: 'strip' },
    { id: 'c005', text: 'Baila de forma sensual para todo el grupo durante un minuto.', intensity: 3, target: 'solo', category: 'dance' },

    // Pareja interna
    { id: 'c010', text: 'Quita una prenda de ropa a {partner}.', intensity: 3, target: 'couple_internal', category: 'strip' },
    { id: 'c011', text: 'Besa apasionadamente a {partner} durante 30 segundos.', intensity: 3, target: 'couple_internal', category: 'kiss' },
    { id: 'c012', text: 'Acaricia íntimamente a {partner} donde deseen durante un minuto.', intensity: 3, target: 'couple_internal', category: 'touch' },
    { id: 'c013', text: 'Desnuda la parte superior de {partner} y explora su cuerpo con tus manos durante 2 minutos.', intensity: 3, target: 'couple_internal', category: 'strip' },
    { id: 'c014', text: 'Besa a {partner} de los hombros a los muslos (por encima o sin ropa) durante 2 minutos.', intensity: 3, target: 'couple_internal', category: 'kiss' },
    { id: 'c015', text: 'Quita todas las prendas que quieras a {partner} y deja que él/ella haga lo mismo contigo.', intensity: 3, target: 'couple_internal', category: 'strip' },

    // Pareja externa
    { id: 'c020', text: 'Besa en los labios a {partner} durante 15 segundos.', intensity: 3, target: 'couple_external', category: 'kiss' },
    { id: 'c021', text: 'Quita una prenda de ropa a {partner}.', intensity: 3, target: 'couple_external', category: 'strip' },
    { id: 'c022', text: 'Acaricia la espalda, cintura y caderas de {partner} durante 60 segundos.', intensity: 3, target: 'couple_external', category: 'touch' },
    { id: 'c023', text: 'Besa el cuello y hombros de {partner} durante 30 segundos.', intensity: 3, target: 'couple_external', category: 'kiss' },
    { id: 'c024', text: 'Siéntate en las piernas de {partner} (o invítale a sentarse en las tuyas) durante los dos próximos turnos.', intensity: 3, target: 'couple_external', category: 'connection' },
    { id: 'c025', text: 'Besa apasionadamente a {partner} durante 20 segundos.', intensity: 3, target: 'couple_external', category: 'kiss' },

    // Grupo
    { id: 'c030', text: 'Todos se quitan una prenda.', intensity: 3, target: 'group', category: 'strip' },
    { id: 'c031', text: 'Pareja contra pareja: la pareja que se bese más tiempo gana. ¡El grupo cronometra!', intensity: 3, target: 'group', category: 'kiss' },
    { id: 'c032', text: 'El grupo vota quién hace el baile más seductor. El ganador elige un deseo.', intensity: 3, target: 'group', category: 'dance' },
    { id: 'c033', text: 'Cada persona le quita una prenda a la persona de su izquierda.', intensity: 3, target: 'group', category: 'strip' },

    // ══ NIVEL 4 — SIN LÍMITES ════════════════

    // Solo
    { id: 'd001', text: 'Tócate de manera sensual frente al grupo durante un minuto.', intensity: 4, target: 'solo', category: 'strip' },
    { id: 'd002', text: 'El grupo decide qué prenda te queda al final. Tú decides si aceptas.', intensity: 4, target: 'solo', category: 'strip' },
    { id: 'd003', text: 'Muestra al grupo cómo te gusta ser tocado/a, sobre tu propio cuerpo.', intensity: 4, target: 'solo', category: 'strip' },

    // Pareja interna
    { id: 'd010', text: 'Explora el cuerpo de {partner} libremente durante 3 minutos. Sin límites entre ustedes.', intensity: 4, target: 'couple_internal', category: 'touch' },
    { id: 'd011', text: 'Haz lo que {partner} te pida durante 3 minutos.', intensity: 4, target: 'couple_internal', category: 'touch' },
    { id: 'd012', text: 'Dale a {partner} placer oral durante al menos un minuto.', intensity: 4, target: 'couple_internal', category: 'kiss' },
    { id: 'd013', text: 'Satisface a {partner} con tus manos durante 2 minutos.', intensity: 4, target: 'couple_internal', category: 'touch' },
    { id: 'd014', text: 'Penetra o déjate penetrar por {partner} durante el tiempo que quieran.', intensity: 4, target: 'couple_internal', category: 'strip' },

    // Pareja externa
    { id: 'd020', text: 'Explora el cuerpo de {partner} durante 3 minutos, como ambos deseen.', intensity: 4, target: 'couple_external', category: 'touch' },
    { id: 'd021', text: 'Besa y acaricia íntimamente a {partner} donde quieran durante 3 minutos.', intensity: 4, target: 'couple_external', category: 'kiss' },
    { id: 'd022', text: '{partner} y tú tienen 5 minutos en privado (o en el grupo, si prefieren) para hacer lo que deseen.', intensity: 4, target: 'couple_external', category: 'connection' },
    { id: 'd023', text: 'Dale placer oral a {partner} durante un minuto.', intensity: 4, target: 'couple_external', category: 'kiss' },
    { id: 'd024', text: 'Satisface a {partner} con tus manos durante 2 minutos.', intensity: 4, target: 'couple_external', category: 'touch' },

    // Grupo
    { id: 'd030', text: 'Todos se quitan toda la ropa.', intensity: 4, target: 'group', category: 'strip' },
    { id: 'd031', text: 'Cada persona elige a alguien del grupo y lo satisface con sus manos durante 2 minutos.', intensity: 4, target: 'group', category: 'touch' },
    { id: 'd032', text: 'Libre para todos: 5 minutos sin reglas entre quienes lo deseen.', intensity: 4, target: 'group', category: 'strip' },
  ];

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
