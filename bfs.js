/**
 * Breadth-first search on a grid (4-directional, unweighted).
 * walls: Uint8Array(rows*cols), 1 = wall.
 * Returns { order, parent, path, found }
 *   order: cells in the order they were visited -> [{i, dist, queue}]
 *   path:  shortest path as cell indices, start..end ([] if unreachable)
 */
function bfs(walls, rows, cols, start, end) {
  const total = rows * cols;
  const dist = new Int32Array(total).fill(-1);
  const parent = new Int32Array(total).fill(-1);
  const order = [];
  const queue = [start];
  let head = 0;
  dist[start] = 0;

  while (head < queue.length) {
    const cur = queue[head++];
    order.push({ i: cur, dist: dist[cur], queue: queue.length - head });
    if (cur === end) break;

    const r = (cur / cols) | 0;
    const c = cur % cols;
    const next = [];
    if (r > 0) next.push(cur - cols);
    if (c < cols - 1) next.push(cur + 1);
    if (r < rows - 1) next.push(cur + cols);
    if (c > 0) next.push(cur - 1);

    for (const n of next) {
      if (walls[n] || dist[n] !== -1) continue;
      dist[n] = dist[cur] + 1;
      parent[n] = cur;
      queue.push(n);
    }
  }

  const found = dist[end] !== -1;
  const path = [];
  if (found) {
    for (let at = end; at !== -1; at = parent[at]) path.push(at);
    path.reverse();
  }
  return { order, parent, path, found };
}

if (typeof module !== "undefined") module.exports = { bfs };
