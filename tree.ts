import { Chess } from "chess.js";
import pgnParser from "pgn-parser";

export type StudyNode = {
  id: string;
  parentId: string | null;
  fen: string;
  san: string | null;
  side: "w" | "b";
  moveNumber: number;
  comment: string;
  nags: string[];
  children: StudyNode[];
  expectedMove?: {
    nodeId: string;
    san: string;
    side: "w" | "b";
  };
  path: string;
};

export type StudyTree = {
  title: string;
  games: Array<{ headers: Record<string, string> }>;
  nodes: StudyNode[];
  nodesById: Record<string, StudyNode>;
};

type ParsedMove = {
  move: string;
  move_number?: number;
  ravs?: ParsedMove[][];
  comments?: Array<{ text?: string }>;
  nags?: string[];
};

type ParsedGame = {
  headers?: Array<{ name: string; value: string }>;
  moves?: ParsedMove[];
};

function makeId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function headersToRecord(headers: ParsedGame["headers"] = []) {
  return Object.fromEntries(headers.map((h) => [h.name, h.value]));
}

function cleanMove(move: string) {
  return move.replace(/^\\d+\\.{2,3}/, "").trim();
}

export function buildStudyTree(input: string): StudyTree {
  if (!input.trim()) throw new Error("PGN is empty.");

  const parsed = pgnParser.parse(input) as ParsedGame[];
  if (!parsed?.length) throw new Error("No PGN games found.");

  const root: StudyNode = {
    id: "root",
    parentId: null,
    fen: new Chess().fen(),
    san: null,
    side: "w",
    moveNumber: 0,
    comment: "",
    nags: [],
    children: [],
    path: ""
  };

  const nodes: StudyNode[] = [root];
  const nodesById: Record<string, StudyNode> = { root };

  function addLine(
    parent: StudyNode,
    moves: ParsedMove[],
    startingFen: string,
    pathPrefix: string
  ) {
    const chess = new Chess(startingFen);
    let current = parent;

    for (const item of moves) {
      const sanInput = cleanMove(item.move);
      if (!sanInput || sanInput === "*" || /^[0-1]$/.test(sanInput)) continue;

      // Variations branch from the position BEFORE this move.
      if (item.ravs?.length) {
        for (const variation of item.ravs) {
          addLine(current, variation, chess.fen(), pathPrefix);
        }
      }

      const beforeFen = chess.fen();
      let move;
      try {
        move = chess.move(sanInput);
      } catch {
        throw new Error(`Invalid move "${sanInput}" near "${pathPrefix}".`);
      }

      const node: StudyNode = {
        id: makeId(),
        parentId: current.id,
        fen: chess.fen(),
        san: move.san,
        side: move.color,
        moveNumber: move.moveNumber,
        comment: (item.comments ?? []).map((c) => c.text ?? "").join(" ").trim(),
        nags: item.nags ?? [],
        children: [],
        path: pathPrefix ? `${pathPrefix} ${move.san}` : move.san
      };

      // Avoid duplicate exact continuations under the same position.
      const duplicate = current.children.find((x) => x.san === node.san);
      if (duplicate) {
        current = duplicate;
      } else {
        current.children.push(node);
        nodes.push(node);
        nodesById[node.id] = node;
        current = node;
      }

      void beforeFen;
    }
  }

  const games = parsed.map((game) => {
    const headers = headersToRecord(game.headers);
    addLine(root, game.moves ?? [], root.fen, "");
    return { headers };
  });

  // Each node's first child is the default expected repertoire continuation.
  for (const node of nodes) {
    if (node.children[0]) {
      node.expectedMove = {
        nodeId: node.children[0].id,
        san: node.children[0].san ?? "",
        side: node.children[0].side
      };
    }
  }

  const title =
    games[0]?.headers["Event"] ||
    games[0]?.headers["Opening"] ||
    games[0]?.headers["White"] ||
    "ChessLab Study";

  return { title, games, nodes, nodesById };
}

export function flattenTree(root: StudyNode) {
  const result: StudyNode[] = [];
  const visit = (node: StudyNode) => {
    result.push(node);
    node.children.forEach(visit);
  };
  visit(root);
  return result;
}
