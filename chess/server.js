import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer } from 'ws';
import { Chess } from 'chess.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };

const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];
  const file = path.join(__dirname, 'public', url === '/' ? 'index.html' : url);
  if (!file.startsWith(path.join(__dirname, 'public'))) { res.writeHead(403).end(); return; }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404).end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'text/plain' }).end(data);
  });
});

const wss = new WebSocketServer({ server });
const games = new Map(); // id -> { chess, players: {w, b}, over, result, drawOffer }

const newId = () => Math.random().toString(36).slice(2, 7).toUpperCase();
const send = (ws, msg) => ws && ws.readyState === 1 && ws.send(JSON.stringify(msg));

function status(g) {
  const c = g.chess;
  let result = g.result || null;
  if (!result) {
    if (c.isCheckmate()) result = (c.turn() === 'w' ? 'Black' : 'White') + ' wins by checkmate';
    else if (c.isStalemate()) result = 'Draw by stalemate';
    else if (c.isThreefoldRepetition()) result = 'Draw by repetition';
    else if (c.isInsufficientMaterial()) result = 'Draw: insufficient material';
    else if (c.isDraw()) result = 'Draw (50-move rule)';
  }
  return result;
}

function broadcast(id) {
  const g = games.get(id);
  for (const color of ['w', 'b']) {
    send(g.players[color], {
      type: 'state', id, color,
      fen: g.chess.fen(),
      history: g.chess.history({ verbose: true }).map(m => m.san),
      last: g.chess.history({ verbose: true }).at(-1) || null,
      turn: g.chess.turn(),
      moves: g.chess.turn() === color && !status(g) ? g.chess.moves({ verbose: true }).map(x => ({ from: x.from, to: x.to, promo: !!x.promotion })) : [],
      check: g.chess.inCheck(),
      result: status(g),
      opponent: !!g.players[color === 'w' ? 'b' : 'w'],
      drawOffer: g.drawOffer && g.drawOffer !== color,
    });
  }
}

wss.on('connection', ws => {
  ws.on('message', raw => {
    let m; try { m = JSON.parse(raw); } catch { return; }
    if (m.type === 'create') {
      const id = newId();
      const color = m.color === 'b' ? 'b' : m.color === 'w' ? 'w' : (Math.random() < 0.5 ? 'w' : 'b');
      games.set(id, { chess: new Chess(), players: { w: null, b: null } });
      join(ws, id, color);
    } else if (m.type === 'join') {
      const id = String(m.id || '').toUpperCase();
      const g = games.get(id);
      if (!g) return send(ws, { type: 'error', message: 'Game not found' });
      const color = g.players.w ? (g.players.b ? null : 'b') : 'w';
      if (!color) return send(ws, { type: 'error', message: 'Game is full' });
      join(ws, id, color);
    } else if (ws.game) {
      const g = games.get(ws.game), color = ws.color;
      if (status(g)) return;
      if (m.type === 'move') {
        if (g.chess.turn() !== color) return send(ws, { type: 'error', message: 'Not your turn' });
        if (!g.players[color === 'w' ? 'b' : 'w']) return send(ws, { type: 'error', message: 'Waiting for opponent' });
        try { g.chess.move({ from: m.from, to: m.to, promotion: m.promotion || 'q' }); }
        catch { return send(ws, { type: 'error', message: 'Illegal move' }); }
        g.drawOffer = null;
      } else if (m.type === 'resign') {
        g.result = (color === 'w' ? 'Black' : 'White') + ' wins by resignation';
      } else if (m.type === 'offerDraw') {
        g.drawOffer = color;
      } else if (m.type === 'acceptDraw' && g.drawOffer && g.drawOffer !== color) {
        g.result = 'Draw by agreement';
      } else if (m.type === 'declineDraw') {
        g.drawOffer = null;
      }
      broadcast(ws.game);
    }
  });
  ws.on('close', () => {
    if (!ws.game) return;
    const g = games.get(ws.game);
    if (g && g.players[ws.color] === ws) {
      g.players[ws.color] = null;
      if (!g.players.w && !g.players.b) games.delete(ws.game);
      else broadcast(ws.game);
    }
  });
});

function join(ws, id, color) {
  const g = games.get(id);
  g.players[color] = ws;
  ws.game = id; ws.color = color;
  broadcast(id);
}

server.listen(PORT, () => console.log(`Chess server on http://localhost:${PORT}`));
