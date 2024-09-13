import {Chess, Color, Move, PieceSymbol, Square} from 'chess.js';
import {useCallback, useEffect, useRef, useState} from 'react';
import Board from './components/Board';
import {EvalResults, MoveHistory, PieceInfo, Variation} from '../../types';
import styled from 'styled-components';
import EvalBar from './components/EvalBar';
import Engine from './components/Engine';
import Moves from './components/Moves';
import LoadPos from './components/LoadPos';
import Menu from './components/Menu';
import { useSquareSize } from './hooks/useSquareSize';

const numFormat = new Intl.NumberFormat('en-US', {
  signDisplay: 'exceptZero',
  minimumFractionDigits: 2,
});
//const startPos = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

function App(): JSX.Element {
  const chess = useRef(new Chess());
  const [board, setBoard] = useState<(PieceInfo | null)[][]>(
    chess.current.board()
  );
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Map<Square, Move>>(new Map());
  const [highlightedSquares, setHighlightedSquares] = useState<Set<Square>>(
    new Set()
  );
  const [evaluation, setEvaluation] = useState<number>(0);
  const [evalText, setEvalText] = useState<string>('0.00');
  const [variations, setVariations] = useState<Variation[]>([]);
  const [moveSquare, setMoveSquare] = useState<{
    to: Square | null;
    from: Square | null;
  }>({to: null, from: null});
  const [flippedBoard, setFlippedBoard] = useState<boolean>(false);
  const startPos = useRef<string>(chess.current.fen());
  const [history, setHistory] = useState<MoveHistory[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [bestMoves, setBestMoves] = useState<Map<Square, Square[]>>(new Map());
  const [promoInfo, setPromoInfo] = useState<{
    to: Square;
    from: Square;
    color: Color;
  } | null>(null);
  const [showArrows, setShowArrows] = useState<boolean>(true);
  const [showSetup, setShowSetup] = useState<boolean>(false);
  const squareSize = useSquareSize();
  const handleRightClick = (id) => {
    if (highlightedSquares.has(id)) {
      setHighlightedSquares((prev) => {
        const copy = new Set(prev);
        copy.delete(id);
        return copy;
      });
    } else {
      setHighlightedSquares((prev) => new Set(prev).add(id));
    }
  };
  const handleSelect = (id: Square) => {
    const squareInfo = chess.current.get(id);
    if (!selectedSquare) {
      //this is the first click
      if (squareInfo && chess.current.turn() === squareInfo.color) {
        setSelectedSquare(id);
        setLegalMoves(
          new Map(
            chess.current.moves({square: id, verbose: true}).map((x) => {
              const {to} = x;
              return [to, x];
            })
          )
        );
      }
    } else {
      //this is the second click
      if (legalMoves.has(id)) {
        //this is a legal move
        const getMove = legalMoves.get(id)!;
        if (getMove.promotion) {
          setPromoInfo({
            to: getMove.to,
            from: getMove.from,
            color: getMove.color,
          });
          console.log('clicked');
        } else {
          movePiece(selectedSquare, id);
        }
      } else if (id === selectedSquare) {
        //re-clicking the selected square unselects it
        setSelectedSquare(null);
        setLegalMoves(new Map());
      } else if (squareInfo && squareInfo.color === chess.current.turn()) {
        //clicking on another piece of the same color should switch the selection to that piece
        setSelectedSquare(id);
        setLegalMoves(
          new Map(
            chess.current.moves({square: id, verbose: true}).map((x) => {
              const {to} = x;
              return [to, x];
            })
          )
        );
      } else {
        //clicking on a non-legal move should unselect the piece
        setSelectedSquare(null);
        setLegalMoves(new Map());
      }
    }
    setHighlightedSquares(new Set());
  };

  const movePiece = (
    from: Square,
    to: Square,
    promo: Exclude<PieceSymbol, 'p' | 'k'> = 'q'
  ) => {
    const move = chess.current.move({from: from, to: to, promotion: promo});
    //replace moves if this is not the last move in the history
    const newIndex = historyIndex + 1;
    let newHistory = [...history];
    if (newIndex !== history.length) {
      //we need to replace the history after this move
      newHistory = newHistory.slice(0, newIndex);
    }
    newHistory.push({...move, comments: ''});
    setHistory(newHistory);
    setHistoryIndex(newIndex);
    setSelectedSquare(null);
    setLegalMoves(new Map());
    setBoard(chess.current.board());
    setMoveSquare({to: move.to, from: move.from});
    setPromoInfo(null);
    setBestMoves(new Map());
    if (chess.current.isGameOver()) {
      if (
        chess.current.isStalemate() ||
        chess.current.isDraw() ||
        chess.current.isInsufficientMaterial() ||
        chess.current.isThreefoldRepetition()
      ) {
        setEvaluation(0);
        setEvalText('1/2');
      } else if (chess.current.isCheckmate()) {
        setEvaluation(chess.current.turn() === 'w' ? -20 : 20);
        setEvalText(chess.current.turn() === 'w' ? '0-1' : '1-0');
      }
    } else {
      window.api.getEval(chess.current.fen(), chess.current.turn());
    }
  };

  const keyUpHandler = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      window.api.getEval(chess.current.fen(), chess.current.turn());
    }
  };
  const cancelPromo = () => {
    setPromoInfo(null);
    setSelectedSquare(null);
    setLegalMoves(new Map());
  };
  const flipBoard = () => {
    setFlippedBoard(!flippedBoard);
  };
  const addComment = (index: number, newComment: string) => {
    console.log(index);
    const fen = history[index].after;
    setHistory((prev) =>
      prev.map((move, i) =>
        i === index ? {...move, comments: newComment} : move
      )
    );
    chess.current.setComment(newComment, fen);
  };
  const deleteComment = (index: number) => {
    const fen = history[index].after;
    chess.current.deleteComment(fen);
    setHistory((prev) =>
      prev.map((move, i) =>
        index === i ? {...move, comments: undefined} : move
      )
    );
  };
  const jump = useCallback(
    (index: number, getEval: boolean) => {
      const {after, to, from} =
        index >= 0
          ? history[index]
          : {after: startPos.current, to: null, from: null};
      chess.current.load(after);
      setHistoryIndex(index);
      setBoard(chess.current.board());
      setMoveSquare({to, from});
      setSelectedSquare(null);
      setLegalMoves(new Map());
      if (getEval) {
        window.api.getEval(chess.current.fen(), chess.current.turn());
      }
    },
    [history]
  );
  const toggleArrows = () => {
    setShowArrows(!showArrows);
  };
  const loadPosition = (pos: string, type: 'fen' | 'pgn') => {
    if (type === 'pgn') {
      try {
        chess.current.loadPgn(pos);
        console.log(chess.current.pgn());
        const newHistory: MoveHistory[] = chess.current.history({
          verbose: true,
        });
        const comments = [...chess.current.getComments()];
        console.log(comments);
        //attach comments to the move in the history
        for (
          let i = newHistory.length - 1;
          i >= 0 && comments.length > 0;
          i--
        ) {
          if (newHistory[i].after === comments[comments.length - 1].fen) {
            newHistory[i].comments = comments.pop()!.comment;
          }
        }
        setHistoryIndex(newHistory.length - 1);
        setHistory(newHistory);
        setMoveSquare({
          to: newHistory[newHistory.length - 1].to,
          from: newHistory[newHistory.length - 1].from,
        });

      } catch (e) {
        console.log(e);
      }
    } else {
      //fen
      try {
        chess.current.load(pos);
        setHistory([]);
        setHistoryIndex(-1);
        setMoveSquare({to: null, from: null})
        startPos.current = chess.current.fen();
      } catch (e) {
        console.log(e);
      }
    }
    window.api.getEval(chess.current.fen(), chess.current.turn());
    setPromoInfo(null);
    setBestMoves(new Map());
    setShowSetup(false);
    setSelectedSquare(null);
    setLegalMoves(new Map());
    setHighlightedSquares(new Set())
    setBoard(chess.current.board());
  };

  //engine listener
  useEffect(() => {
    window.api.onEvalResults((data: EvalResults[]) => {
      const {mate, score} = data[0];
      if (mate !== null) {
        setEvaluation((prev) => (mate > 0 ? 20 : mate < 0 ? -20 : prev));
        setEvalText(`M${mate}`);
      } else if (score !== null) {
        setEvaluation(score / 100);
        setEvalText(numFormat.format(score / 100));
      }
      //top 3 variations
      const variations = data.map((x) => {
        const chess = new Chess(x.fen);
        const color = chess.turn();
        x.variation.forEach((move) => {
          chess.move(move);
        });
        const pgnArr = chess
          .pgn()
          .replace(/\[.+\]/g, '')
          .match(/(\d+\. )?[.a-hxO\-1-8QKRBNP+=#]+/g);

        const history = chess.history({verbose: true});
        const lines =
          color === 'b'
            ? [{after: null, to: null, from: null}, ...history]
            : history;
        return {
          line: !pgnArr
            ? []
            : pgnArr.map((move, i) => ({
                move: move,
                fen: lines[i].after,
                to: lines[i].to,
                from: lines[i].from,
              })),
          score: x.mate
            ? `M${x.mate}`
            : x.score
              ? numFormat.format(x.score / 100)
              : '0',
        };
      });
      const bestMoveMap: Map<Square, Square[]> = new Map();
      variations.forEach((variation) => {
        const to = variation.line[0].to
          ? variation.line[0].to
          : variation.line[1].to
            ? variation.line[1].to
            : null;
        const from = variation.line[0].from
          ? variation.line[0].from
          : variation.line[1].from
            ? variation.line[1].from
            : null;
        if (to && from) {
          if (bestMoveMap.has(from)) {
            bestMoveMap.get(from)!.push(to);
          } else bestMoveMap.set(from, [to]);
        }
      });
      setBestMoves(bestMoveMap);
      setVariations(variations);
    });
    return () => window.api.removeEvalListener();
  }, []);
  useEffect(() => {
    window.api.getEval(chess.current.fen(), chess.current.turn());
  }, []);
  useEffect(() => {
    const keyDownHandler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && historyIndex >= 0) {
        jump(historyIndex - 1, false);
      } else if (e.key === 'ArrowRight' && historyIndex < history.length - 1) {
        jump(historyIndex + 1, false);
      }
    };
    //set up listeners for arrow keys down
    window.addEventListener('keydown', keyDownHandler);
    return () => {
      window.removeEventListener('keydown', keyDownHandler);
    };
  }, [historyIndex, history, jump]);
  useEffect(() => {
    //set up listeners for arrow keys up
    //this is so when the users hold down the arrow key
    //to skip back really far, we aren't evaluating every position skipped over
    window.addEventListener('keyup', keyUpHandler);
    return () => {
      window.removeEventListener('keyup', keyUpHandler);
    };
  }, []);
  useEffect(() => {
    //console.log(history, historyIndex);
  }, [history, historyIndex]);
  return (
    <Container>
      <EvalBar height={squareSize*8} score={evaluation} />
      <BoardContainer>
        {showSetup && (
          <LoadDiv>
            <LoadPos load={loadPosition} cancel={() => setShowSetup(false)} />
          </LoadDiv>
        )}
        <Board
          squareHeight={squareSize}
          onClickSquare={handleSelect}
          board={board}
          selectedSquare={selectedSquare}
          highlightedSquares={highlightedSquares}
          handleRightClick={handleRightClick}
          legalMoves={legalMoves}
          prevMove={moveSquare}
          promoInfo={promoInfo}
          flipped={flippedBoard}
          cancelPromo={cancelPromo}
          promote={movePiece}
          bestMoves={bestMoves}
          showArrows={showArrows}
        />
      </BoardContainer>
      <GameInfo $height = {squareSize*8}>
        <Engine
          value={evalText}
          variations={variations}
          flipped={flippedBoard}
        />
        <Moves
          currentMove={historyIndex}
          moveList={history}
          jump={jump}
          addComment={addComment}
          deleteComment={deleteComment}
        />
        <Menu
          flipBoard={flipBoard}
          setupGame={() => setShowSetup(true)}
          showArrows={showArrows}
          toggleShowArrows={toggleArrows}
        />
      </GameInfo>
    </Container>
  );
}
const Container = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: center;
  background-color: #000000;
  min-width: 650px;
`;

const GameInfo = styled.div<{$height: number}>`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  background-color: blue;
  height: ${(props)=>props.$height}px;
  width: 300px;
`;
const BoardContainer = styled.div`
  display: flex;
  position: relative;
  flex-flow: column nowrap;
  align-items: center;
`;

const LoadDiv = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 75%;
  z-index: 5;
`;
export default App;
