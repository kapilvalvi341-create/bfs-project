const assert = require("assert");
const { bfs } = require("./bfs.js");

// 1) open 3x3 grid: shortest path corner to corner has 5 cells
{
  const walls = new Uint8Array(9);
  const r = bfs(walls, 3, 3, 0, 8);
  assert.ok(r.found);
  assert.strictEqual(r.path.length, 5);
}
// 2) fully walled-off target is unreachable
{
  const walls = new Uint8Array(9);
  walls[1] = walls[3] = 1; // blocks the start corner
  const r = bfs(walls, 3, 3, 0, 8);
  assert.ok(!r.found);
  assert.deepStrictEqual(r.path, []);
}
// 3) path must go around a wall
{
  const walls = new Uint8Array(9);
  walls[4] = 1;
  const r = bfs(walls, 3, 3, 3, 5);
  assert.ok(r.found);
  assert.strictEqual(r.path.length, 5);
}
console.log("All BFS tests passed");
