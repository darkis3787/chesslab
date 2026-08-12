# GitHub tutorial — ChessLab

## 1. Create the repository

On GitHub choose **New repository**.

Recommended:

- Repository name: `chesslab`
- Visibility: Public if you want an open-source project
- Do not initialize it with another README when you already have this project locally

## 2. Put the project on your computer

Extract the ChessLab starter ZIP.

Open a terminal in the project folder.

Check:

```bash
node -v
npm -v
```

Then:

```bash
npm install
npm run dev
```

Visit:

```text
http://localhost:3000
```

## 3. First commit

Stop the dev server if you want, then:

```bash
git init
git add .
git commit -m "feat: initial ChessLab MVP"
git branch -M main
```

## 4. Connect GitHub

Create an empty repository called `chesslab`.

Copy its HTTPS address and run:

```bash
git remote add origin https://github.com/YOUR_USERNAME/chesslab.git
git push -u origin main
```

## 5. Normal development workflow

For every feature:

```bash
git checkout -b feat/pgn-import
```

Work, test:

```bash
npm run build
```

Then:

```bash
git add .
git commit -m "feat: improve PGN import"
git push -u origin feat/pgn-import
```

Open a Pull Request on GitHub and merge it into `main`.

## 6. Suggested branch names

```text
feat/pgn-import
feat/move-tree
feat/trainer
feat/repertoire-storage
feat/statistics
feat/spaced-repetition
feat/stockfish
fix/pgn-variation-parser
refactor/chess-core
```

## 7. GitHub repository settings

For a public project, enable the security features available to you:

- Dependabot alerts
- Secret scanning
- Push protection
- Code scanning

Also add, later:

```text
.github/
  workflows/
    ci.yml
  ISSUE_TEMPLATE/
  pull_request_template.md
```

## 8. First production milestone

Do not add accounts or PostgreSQL yet.

First make this flow rock solid:

```text
PGN
 ↓
Parser
 ↓
Move Tree
 ↓
Board
 ↓
Trainer
 ↓
Training result
```

Then persistence, statistics and spaced repetition can be added without rewriting the chess core.
