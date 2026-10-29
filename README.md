# BFS Visualizer

An interactive breadth-first search tool. Draw a maze, move the start and goal, and watch BFS explore outward and find the shortest path. No build step, no dependencies: it's plain HTML, CSS and JavaScript.

## Run locally

```bash
npm start          # serves the folder (or just open index.html)
npm test           # runs the BFS unit tests
```

## Deploy (pick one)

| Host | Steps |
|---|---|
| **Netlify** | Drag this folder onto app.netlify.com/drop, or connect the repo (`netlify.toml` is included). |
| **Vercel** | `npx vercel --prod` in this folder. Framework preset: *Other*. |
| **GitHub Pages** | Push to a repo's `main` branch, then Settings → Pages → Source: *GitHub Actions*. The included workflow deploys it. |
| **Cloudflare Pages** | Connect the repo, leave the build command empty, output directory `/`. |
| **Docker** | `docker build -t bfs . && docker run -p 8080:80 bfs` |

## Files

- `bfs.js`: the algorithm (pure function, unit tested)
- `app.js`: canvas drawing, mouse/touch editing, animation
- `index.html`, `style.css`: the page

## How BFS works here

Cells go into a queue. Each step removes the oldest cell, then adds its unvisited up/right/down/left neighbours. Because every move costs the same, the first time the goal is reached is the shortest path. The path is rebuilt by following each cell's `parent` back to the start.
