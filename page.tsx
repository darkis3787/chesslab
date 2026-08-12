"use client";

import { useMemo, useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { buildStudyTree, flattenTree, type StudyTree } from "../lib/pgn/tree";

const SAMPLE_PGN = `[Event "Sicilian Demo"]
[White "Repertoire"]
[Black "Opponent"]
[Result "*"]

1. e4 c5 2. Nf3 d6 3. d4 cxd4
4. Nxd4 Nf6 5. Nc3 a6
(5... e5 6. Nb3)
6. Be3 e5 7. Ndb5 axb5
(7... Be6 8. Qd2)
*`;

export default function HomePage() {
  const [pgn, setPgn] = useState(SAMPLE_PGN);
  const [study, setStudy] = useState<StudyTree | null>(null);
  const [selectedId, setSelectedId] = useState("root");
  const [trainerId, setTrainerId] = useState("root");
  const [message, setMessage] = useState("Import a PGN to begin.");
  const [orientation, setOrientation] = useState<"white" | "black">("white");
  const [mistakes, setMistakes] = useState(0);

  const selected = useMemo(
    () => study?.nodesById[selectedId] ?? null,
    [study, selectedId]
  );

  const trainer = useMemo(
    () => study?.nodesById[trainerId] ?? null,
    [study, trainerId]
  );

  function importPgn() {
    try {
      const result = buildStudyTree(pgn);
      setStudy(result);
      setSelectedId("root");
      setTrainerId(result.nodesById.root.children[0]?.id ?? "root");
      setMistakes(0);
      setMessage(`Imported ${result.games.length} game(s). ${result.nodes.length - 1} positions in the study tree.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "PGN import failed.");
    }
  }

  function resetTrainer() {
    setTrainerId("root");
    setMistakes(0);
    setMessage("Trainer reset.");
  }

  function onDrop(source: string, target: string) {
    if (!study || !trainer || !trainer.expectedMove) return false;

    const game = new Chess(trainer.fen);
    let move;
    try {
      move = game.move({ from: source, to: target, promotion: "q" });
    } catch {
      setMessage("Illegal move.");
      setMistakes((x) => x + 1);
      return false;
    }

    if (move.san !== trainer.expectedMove.san) {
      setMessage(`Wrong move. Expected ${trainer.expectedMove.san}. Try again.`);
      setMistakes((x) => x + 1);
      return false;
    }

    const next = trainer.expectedMove.nodeId;
    setTrainerId(next);
    setSelectedId(next);
    setMessage(`Correct: ${move.san}`);
    return true;
  }

  const boardFen = trainer?.fen ?? selected?.fen ?? new Chess().fen();

  return (
    <main className="shell">
      <header className="topbar">
        <div>
          <div className="brand">♟ ChessLab</div>
          <div className="subtitle">PGN study · repertoire · active training</div>
        </div>
        <div className="top-actions">
          <button onClick={() => setOrientation((x) => x === "white" ? "black" : "white")}>
            Flip board
          </button>
          <button onClick={resetTrainer}>Reset trainer</button>
        </div>
      </header>

      <section className="workspace">
        <aside className="sidebar">
          <h2>Study</h2>
          <label className="label">PGN</label>
          <textarea
            value={pgn}
            onChange={(e) => setPgn(e.target.value)}
            spellCheck={false}
          />
          <div className="row">
            <button className="primary" onClick={importPgn}>Import PGN</button>
            <label className="file-button">
              Upload
              <input
                type="file"
                accept=".pgn,text/plain"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) setPgn(await file.text());
                }}
              />
            </label>
          </div>

          <div className="status">{message}</div>

          <h3>Move tree</h3>
          <div className="tree">
            {study ? (
              <MoveList
                node={study.nodesById.root}
                depth={0}
                selectedId={selectedId}
                onSelect={(id) => setSelectedId(id)}
              />
            ) : (
              <div className="muted">Import a PGN to see variations.</div>
            )}
          </div>
        </aside>

        <section className="board-panel">
          <div className="panel-heading">
            <div>
              <h1>{study?.title ?? "ChessLab"}</h1>
              <p>{trainer?.path ?? "Import your repertoire to start training."}</p>
            </div>
            <span className="badge">MVP</span>
          </div>

          <div className="board-wrap">
            <Chessboard
              options={{
                position: boardFen,
                boardOrientation: orientation,
                allowDragging: Boolean(trainer?.expectedMove),
                onPieceDrop: onDrop,
                animationDurationInMs: 180,
                boardStyle: { borderRadius: "4px" },
                darkSquareStyle: { backgroundColor: "#779556" },
                lightSquareStyle: { backgroundColor: "#ebecd0" }
              }}
            />
          </div>

          <div className="trainer-card">
            <div>
              <div className="eyebrow">ACTIVE TRAINING</div>
              <strong>{trainer?.expectedMove ? `Play ${trainer.expectedMove.side === "w" ? "White" : "Black"}` : "End of line"}</strong>
              <div className="muted">
                {trainer?.expectedMove
                  ? `Find the repertoire move from this position. Errors: ${mistakes}`
                  : "Choose a variation in the tree or reset the trainer."}
              </div>
            </div>
            {trainer?.expectedMove && (
              <button onClick={() => {
                setMessage(`Hint: ${trainer.expectedMove.san}`);
              }}>
                Hint
              </button>
            )}
          </div>
        </section>

        <aside className="moves-panel">
          <h2>Position</h2>
          <div className="fen">{boardFen}</div>
          <h3>Continuation</h3>
          {selected ? (
            <div className="continuations">
              {selected.children.length === 0 ? (
                <span className="muted">End of variation</span>
              ) : (
                selected.children.map((child) => (
                  <button key={child.id} onClick={() => {
                    setSelectedId(child.id);
                    setTrainerId(child.id);
                    setMessage(`Training from ${child.san}.`);
                  }}>
                    {child.san}
                  </button>
                ))
              )}
            </div>
          ) : null}
          <h3>Roadmap</h3>
          <ul className="roadmap">
            <li>✓ PGN import</li>
            <li>✓ Variations / comments / NAGs</li>
            <li>✓ Move tree</li>
            <li>✓ Active move training</li>
            <li>○ Persistence</li>
            <li>○ Spaced repetition</li>
            <li>○ Stockfish analysis</li>
            <li>○ Database / cloud accounts</li>
          </ul>
        </aside>
      </section>
    </main>
  );
}

function MoveList({
  node,
  depth,
  selectedId,
  onSelect
}: {
  node: StudyTree["nodesById"]["root"];
  depth: number;
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <>
      {node.children.map((child) => (
        <div key={child.id}>
          <button
            className={`tree-node ${selectedId === child.id ? "selected" : ""}`}
            style={{ paddingLeft: `${12 + depth * 16}px` }}
            onClick={() => onSelect(child.id)}
          >
            <span>{child.moveNumber}{child.side === "w" ? "." : "..."} {child.san}</span>
            {child.comment ? <span className="comment-dot">●</span> : null}
            {child.nags.length ? <span className="nag">!{child.nags.length}</span> : null}
          </button>
          <MoveList node={child} depth={depth + 1} selectedId={selectedId} onSelect={onSelect} />
        </div>
      ))}
    </>
  );
}
