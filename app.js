(() => {
  const COLS = 36, ROWS = 20;
  const canvas = document.getElementById("grid");
  const ctx = canvas.getContext("2d");
  const $ = (id) => document.getElementById(id);
  const ui = {
    run: $("run"), resetSearch: $("resetSearch"), maze: $("maze"), clear: $("clear"),
    speed: $("speed"), visited: $("sVisited"), path: $("sPath"), queue: $("sQueue"), status: $("status"),
  };

  const walls = new Uint8Array(ROWS * COLS);
  const seen = new Int32Array(ROWS * COLS).fill(-1); // dist for explored cells, -1 = not yet
  let start = idx(Math.floor(ROWS / 2), 5);
  let end = idx(Math.floor(ROWS / 2), COLS - 6);
  let pathCells = new Set();
  let maxDist = 1;
  let running = false;
  let cell = 20;

  function idx(r, c) { return r * COLS + c; }

  // ---- sizing / drawing ----
  function resize() {
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.parentElement.clientWidth - 20;
    cell = w / COLS;
    canvas.style.width = w + "px";
    canvas.style.height = cell * ROWS + "px";
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(cell * ROWS * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }

  function css(name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }

  function draw() {
    const ink = css("--ink"), line = css("--line"), panel = css("--panel");
    ctx.fillStyle = panel;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < walls.length; i++) {
      const x = (i % COLS) * cell, y = Math.floor(i / COLS) * cell;
      if (walls[i]) ctx.fillStyle = ink;
      else if (pathCells.has(i)) ctx.fillStyle = css("--path");
      else if (seen[i] >= 0) {
        const t = seen[i] / maxDist;
        ctx.fillStyle = `hsl(${175 + t * 70} 55% ${82 - t * 30}%)`;
      } else continue;
      ctx.fillRect(x, y, cell, cell);
    }

    ctx.strokeStyle = line;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let c = 0; c <= COLS; c++) { ctx.moveTo(c * cell, 0); ctx.lineTo(c * cell, ROWS * cell); }
    for (let r = 0; r <= ROWS; r++) { ctx.moveTo(0, r * cell); ctx.lineTo(COLS * cell, r * cell); }
    ctx.stroke();

    marker(start, css("--start"));
    marker(end, css("--end"));
  }

  function marker(i, color) {
    const x = (i % COLS) * cell, y = Math.floor(i / COLS) * cell, p = cell * 0.12;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x + p, y + p, cell - 2 * p, cell - 2 * p, cell * 0.25);
    ctx.fill();
  }

  // ---- state helpers ----
  function resetSearch() {
    seen.fill(-1);
    pathCells = new Set();
    ui.visited.textContent = "0";
    ui.path.textContent = "–";
    ui.queue.textContent = "0";
    setStatus("Ready");
    draw();
  }
  function setStatus(t) { ui.status.textContent = t; }
  function setRunning(v) {
    running = v;
    [ui.run, ui.resetSearch, ui.maze, ui.clear].forEach((b) => (b.disabled = v));
  }

  // ---- running BFS ----
  function run() {
    resetSearch();
    const res = bfs(walls, ROWS, COLS, start, end);
    maxDist = Math.max(1, res.order[res.order.length - 1].dist);
    setRunning(true);
    setStatus("Searching…");

    let shown = 0, peak = 0, last = performance.now(), acc = 0, phase = "search", pathShown = 0;

    function frame(now) {
      acc += ((now - last) / 1000) * (phase === "search" ? ui.speed.value * 15 : 40);
      last = now;
      const n = Math.floor(acc);
      acc -= n;

      if (phase === "search") {
        for (let k = 0; k < n && shown < res.order.length; k++, shown++) {
          const s = res.order[shown];
          seen[s.i] = s.dist;
          peak = Math.max(peak, s.queue);
        }
        ui.visited.textContent = shown;
        ui.queue.textContent = peak;
        if (shown >= res.order.length) phase = res.found ? "path" : "done";
      } else if (phase === "path") {
        for (let k = 0; k < n && pathShown < res.path.length; k++) pathCells.add(res.path[pathShown++]);
        if (pathShown >= res.path.length) phase = "done";
      }

      draw();
      if (phase !== "done") return requestAnimationFrame(frame);

      if (res.found) {
        ui.path.textContent = res.path.length - 1 + " steps";
        setStatus("Shortest path found");
      } else {
        ui.path.textContent = "none";
        setStatus("No path: the goal is walled off");
      }
      setRunning(false);
    }
    requestAnimationFrame(frame);
  }

  // ---- pointer editing ----
  let drag = null; // "start" | "end" | "draw" | "erase"
  function cellAt(e) {
    const rect = canvas.getBoundingClientRect();
    const c = Math.min(COLS - 1, Math.max(0, Math.floor(((e.clientX - rect.left) / rect.width) * COLS)));
    const r = Math.min(ROWS - 1, Math.max(0, Math.floor(((e.clientY - rect.top) / rect.height) * ROWS)));
    return idx(r, c);
  }

  canvas.addEventListener("pointerdown", (e) => {
    if (running) return;
    canvas.setPointerCapture(e.pointerId);
    const i = cellAt(e);
    if (i === start) drag = "start";
    else if (i === end) drag = "end";
    else { drag = walls[i] ? "erase" : "draw"; walls[i] = drag === "draw" ? 1 : 0; }
    if (seen.some((v) => v >= 0) || pathCells.size) resetSearch(); else draw();
  });

  canvas.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const i = cellAt(e);
    if (drag === "start" && i !== end) { start = i; walls[i] = 0; }
    else if (drag === "end" && i !== start) { end = i; walls[i] = 0; }
    else if (drag === "draw" && i !== start && i !== end) walls[i] = 1;
    else if (drag === "erase") walls[i] = 0;
    draw();
  });

  const stop = () => (drag = null);
  canvas.addEventListener("pointerup", stop);
  canvas.addEventListener("pointercancel", stop);

  // ---- buttons ----
  ui.run.addEventListener("click", run);
  ui.resetSearch.addEventListener("click", resetSearch);
  ui.clear.addEventListener("click", () => { walls.fill(0); resetSearch(); });
  ui.maze.addEventListener("click", () => {
    for (let i = 0; i < walls.length; i++) walls[i] = i !== start && i !== end && Math.random() < 0.28 ? 1 : 0;
    resetSearch();
  });

  window.addEventListener("resize", resize);
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", draw);
  resize();
})();
