/* ══════════════════════════════════════════════
   ROULETTE — Canvas animation engine
══════════════════════════════════════════════ */
const Roulette = (() => {

  let _canvas = null;
  let _ctx = null;
  let _segments = [];
  let _currentRotation = 0;
  let _animFrame = null;
  let _isSpinning = false;

  // ─── Init ────────────────────────────────────
  function init(canvasId, segments) {
    _canvas = document.getElementById(canvasId);
    _ctx = _canvas.getContext('2d');
    _segments = segments;

    _resize();
    _draw(_currentRotation);

    window.addEventListener('resize', _resize);
    window.addEventListener('orientationchange', () => {
      setTimeout(() => { _resize(); _draw(_currentRotation); }, 200);
    });
  }

  function _resize() {
    if (!_canvas) return;
    const size = Math.min(
      window.innerWidth - 48,
      window.innerHeight * 0.44,
      340
    );
    _canvas.width = size;
    _canvas.height = size;

    // Update CSS variable for pointer positioning
    document.documentElement.style.setProperty('--roulette-r', `${size / 2}px`);
  }

  // ─── Draw ─────────────────────────────────────
  function _draw(rotation) {
    if (!_ctx) return;
    const ctx = _ctx;
    const W = _canvas.width;
    const H = _canvas.height;
    const cx = W / 2;
    const cy = H / 2;
    const r = (W / 2) - 4;
    const n = _segments.length;
    const angleStep = (2 * Math.PI) / n;

    ctx.clearRect(0, 0, W, H);

    // Outer ring glow
    const grad = ctx.createRadialGradient(cx, cy, r * 0.85, cx, cy, r);
    grad.addColorStop(0, 'rgba(123,45,139,0)');
    grad.addColorStop(1, 'rgba(123,45,139,0.35)');
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    ctx.fillStyle = grad;
    ctx.fill();

    _segments.forEach((seg, i) => {
      const startAngle = -Math.PI / 2 + rotation + i * angleStep;
      const endAngle   = startAngle + angleStep;

      // Wedge
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = seg.color;
      ctx.fill();

      // Divider
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, startAngle, endAngle);
      ctx.closePath();
      ctx.strokeStyle = 'rgba(13,13,20,0.7)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label
      const labelAngle = startAngle + angleStep / 2;
      const labelR = r * 0.65;
      const lx = cx + labelR * Math.cos(labelAngle);
      const ly = cy + labelR * Math.sin(labelAngle);

      ctx.save();
      ctx.translate(lx, ly);
      ctx.rotate(labelAngle + Math.PI / 2);
      ctx.fillStyle = 'rgba(255,255,255,0.92)';
      ctx.font = `bold ${Math.max(10, Math.floor(W / 22))}px -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(seg.label, 0, 0);
      ctx.restore();
    });

    // Center circle
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.14, 0, 2 * Math.PI);
    ctx.fillStyle = '#0d0d14';
    ctx.fill();
    ctx.strokeStyle = 'rgba(201,168,76,0.6)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Center dot
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.05, 0, 2 * Math.PI);
    ctx.fillStyle = '#c9a84c';
    ctx.fill();
  }

  // ─── Easing ──────────────────────────────────
  function _easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function _easeOutQuint(t) {
    return 1 - Math.pow(1 - t, 5);
  }

  // ─── Spin ─────────────────────────────────────
  function spin(targetSegmentIndex, onComplete) {
    if (_isSpinning) return;
    _isSpinning = true;

    const n = _segments.length;
    const TAU = 2 * Math.PI;

    // Target rotation: center of segment at top (angle = -π/2)
    // When drawing: segment i center is at (-π/2 + rotation + (i + 0.5) * TAU/n)
    // We want that = -π/2, so: rotation = -(i + 0.5) * TAU/n
    const targetMod = ((-(targetSegmentIndex + 0.5) / n * TAU) % TAU + TAU) % TAU;
    const currentMod = ((_currentRotation % TAU) + TAU) % TAU;
    let delta = targetMod - currentMod;
    if (delta < 0) delta += TAU;

    // Add dramatic full spins (4–6)
    const extraSpins = (4 + Math.floor(Math.random() * 3)) * TAU;
    const totalDelta = delta + extraSpins;
    const startRotation = _currentRotation;
    const endRotation = _currentRotation + totalDelta;

    // Duration: 3.5–4.5s
    const duration = 3500 + Math.random() * 1000;
    const startTime = performance.now();

    function frame(now) {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      const eased = _easeOutQuint(t);
      _currentRotation = startRotation + totalDelta * eased;
      _draw(_currentRotation);

      if (t < 1) {
        _animFrame = requestAnimationFrame(frame);
      } else {
        _currentRotation = endRotation;
        _isSpinning = false;
        _draw(_currentRotation);
        if (onComplete) onComplete();
      }
    }

    if (_animFrame) cancelAnimationFrame(_animFrame);
    _animFrame = requestAnimationFrame(frame);
  }

  function isSpinning() { return _isSpinning; }

  // Actualiza los segmentos sin reiniciar la rotación (para cambios de ronda)
  function updateSegments(newSegments) {
    if (!newSegments || newSegments.length === 0) return;
    _segments = newSegments;
    _draw(_currentRotation);
  }

  // ─── Flash the winning segment ───────────────
  function flashSegment(segmentIndex, done) {
    let flashes = 0;
    const maxFlashes = 5;
    const n = _segments.length;
    const TAU = 2 * Math.PI;
    const angleStep = TAU / n;

    function doFlash() {
      if (flashes >= maxFlashes * 2) { _draw(_currentRotation); if (done) done(); return; }

      const bright = (flashes % 2 === 0);
      const ctx = _ctx;
      const W = _canvas.width;
      const H = _canvas.height;
      const cx = W / 2;
      const cy = H / 2;
      const r = (W / 2) - 4;

      _draw(_currentRotation);

      if (bright) {
        const startAngle = -Math.PI / 2 + _currentRotation + segmentIndex * angleStep;
        const endAngle   = startAngle + angleStep;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, r, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.fill();
      }

      flashes++;
      setTimeout(doFlash, 120);
    }

    doFlash();
  }

  return { init, spin, flashSegment, isSpinning, updateSegments };
})();
