/* ══════════════════════════════════════════════
   PLAYERS — creación, parejas, validación
══════════════════════════════════════════════ */
const Players = (() => {

  // Prendas por defecto (en orden de eliminación típico)
  let PRENDAS_DEFAULT = [
    'Accesorio',
    'Zapatos',
    'Calcetines',
    'Camisa / Top',
    'Pantalón / Falda',
    'Ropa interior superior',
    'Ropa interior inferior',
  ];

  function setPrendasDefault(list) {
    if (Array.isArray(list) && list.length > 0) {
      PRENDAS_DEFAULT = [...list];
    }
  }

  function createPlayer(name) {
    return {
      id: crypto.randomUUID(),
      name: name.trim(),
      coupleId: null,
      gender: 'hombre',           // 'hombre' | 'mujer' | 'no-binario' | 'trans'
      prendas: [...PRENDAS_DEFAULT], // items que lleva puestos al inicio
      prendasRemoved: [],          // items eliminados durante el juego
      preferences: {
        maxIntensity: 4,
        openToExternal: true,
        openToSameGender: true,
        excludedCategories: [],   // categorías que este jugador no quiere que le toquen
      },
    };
  }

  // Asigna un coupleId compartido a dos jugadores
  function pairCouple(playerA, playerB) {
    const sharedId = crypto.randomUUID();
    playerA.coupleId = sharedId;
    playerB.coupleId = sharedId;
  }

  function unpair(player, allPlayers) {
    if (!player.coupleId) return;
    const partner = allPlayers.find(
      p => p.id !== player.id && p.coupleId === player.coupleId
    );
    player.coupleId = null;
    if (partner) partner.coupleId = null;
  }

  function getPartner(player, allPlayers) {
    if (!player.coupleId) return null;
    return allPlayers.find(p => p.id !== player.id && p.coupleId === player.coupleId) || null;
  }

  function validate(players) {
    const errors = [];

    if (players.length < 2) {
      errors.push('Se necesitan al menos 2 jugadores.');
    }
    if (players.length > 10) {
      errors.push('Máximo 10 jugadores.');
    }

    const names = players.map(p => p.name.toLowerCase());
    const dupes = names.filter((n, i) => n && names.indexOf(n) !== i);
    if (dupes.length > 0) {
      errors.push('Hay jugadores con nombres repetidos.');
    }

    const unnamed = players.filter(p => !p.name);
    if (unnamed.length > 0) {
      errors.push('Todos los jugadores deben tener nombre.');
    }

    return { valid: errors.length === 0, errors };
  }

  // Devuelve jugadores ordenados aleatoriamente (orden de turnos)
  function shuffleTurnOrder(players) {
    const arr = [...players];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // Siguiente prenda disponible para este jugador
  function nextPrenda(player) {
    const remaining = player.prendas.filter(p => !player.prendasRemoved.includes(p));
    return remaining[0] || null;
  }

  // Registra la eliminación de una prenda
  function removePrenda(player, prenda) {
    if (!player.prendasRemoved.includes(prenda)) {
      player.prendasRemoved.push(prenda);
    }
  }

  // Prendas aún disponibles
  function prendasRestantes(player) {
    return player.prendas.filter(p => !player.prendasRemoved.includes(p));
  }

  return {
    get PRENDAS_DEFAULT() { return PRENDAS_DEFAULT; },
    setPrendasDefault,
    createPlayer, pairCouple, unpair, getPartner, validate, shuffleTurnOrder,
    nextPrenda, removePrenda, prendasRestantes,
  };
})();
