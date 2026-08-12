# ♟ ChessLab

ChessLab is a web-based chess study and repertoire trainer inspired by the workflow of chess databases and active-recall trainers.

## Current MVP

- Import PGN from pasted text or `.pgn` file
- Parse multiple games
- Parse comments, NAGs and recursive variations
- Build an in-memory move tree
- Browse the move tree
- Display positions on an interactive board
- Active-recall trainer: play the expected repertoire move
- Wrong-move feedback and retry
- Board flip
- Sample Sicilian study included

## Stack

- Next.js + React + TypeScript
- chess.js for legal chess moves and FEN
- pgn-parser for PGN syntax/variations
- react-chessboard for the board UI

`react-chessboard` is MIT licensed. `chessground` was deliberately not selected for this starter because its current npm package is marked deprecated and its GPL-3.0-or-later license has implications for combined web applications. See the package documentation before choosing it for a future version.

## Run locally

Requirements: Node.js 20+.

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## GitHub

This repository is designed to be pushed directly to a GitHub repository.

```bash
git init
git add .
git commit -m "feat: initial ChessLab MVP"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/chesslab.git
git push -u origin main
```

## Roadmap

1. Persistent repertoires with IndexedDB
2. Repertoire editor
3. Training sessions and statistics
4. Weighted variant selection
5. Spaced repetition
6. Search/filter/database view
7. Stockfish analysis in a Web Worker
8. Accounts + PostgreSQL sync

## Architecture

The important design decision is that the PGN move tree is the source model. The trainer and database-style viewer consume the same tree instead of maintaining separate representations.

## License

Choose a project license before publishing a production release.
