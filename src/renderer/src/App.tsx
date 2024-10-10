import {Chess, Color, Move, PieceSymbol, Square} from 'chess.js';
import {useCallback, useEffect, useRef, useState} from 'react';
import moment from 'moment';
import Board from './components/Board';
import {
  EvalResults,
  Game,
  GameDetails,
  MoveHistory,
  PieceInfo,
  Variation,
} from '../../types';
import styled from 'styled-components';
import EvalBar from './components/EvalBar';
import Engine from './components/Engine';
import Moves from './components/Moves';
import LoadPos from './components/LoadPos';
import Menu from './components/Menu';
import {useSquareSize} from './hooks/useSquareSize';
import GameList from './components/GameList';
import {v6 as uuidv6} from 'uuid';
import GameHeaders from './components/GameHeaders';
import Save from './components/Save';
import {ResultType} from '../../types';

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
  const [gameList, setGameList] = useState<Game[]>([]);
  const [whitePlayer, setWhitePlayer] = useState<string>('');
  const [blackPlayer, setBlackPlayer] = useState<string>('');
  const [whiteElo, setWhiteElo] = useState<string>('');
  const [blackElo, setBlackElo] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [event, setEvent] = useState<string>('');
  const [restInfo, setRestInfo] = useState<{[key: string]: string}>({});
  const [result, setResult] = useState<ResultType>('*');
  const [showGameList, setShowGameList] = useState<boolean>(false);
  const [playBackMode, setPlayBackMode] = useState<boolean>(false);
  const [showGameInfo, setShowGameInfo] = useState<boolean>(true);
  const [showSaveAlert, setshowSaveAlert] = useState<boolean>(false);
  const squareSize = useSquareSize();
  const storedIndex = useRef<number | null>(null);
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
    if (newIndex !== history.length && !playBackMode) {
      //we need to replace the history after this move
      newHistory = newHistory.slice(0, newIndex);
    }
    if (!playBackMode) {
      newHistory.push({...move, comments: ''});
      setHistory(newHistory);
      setHistoryIndex(newIndex);
    } else {
      //add a new variation to the comments of the current move?
      if (storedIndex.current === null) storedIndex.current = historyIndex;
    }

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
        setBestMoves(new Map());
        setVariations([]);
      }
    } else {
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
      if (chess.current.isCheckmate() || chess.current.isDraw()) {
        setBestMoves(new Map());
        getEval = false;
      }
      setHistoryIndex(index);
      setBoard(chess.current.board());
      setMoveSquare({to, from});
      setSelectedSquare(null);
      setLegalMoves(new Map());
    },
    [history]
  );
  const toggleArrows = () => {
    setShowArrows(!showArrows);
  };
  const loadPosition = (pos: string, type: 'fen' | 'pgn') => {
    if (type === 'pgn') {
      try {
        //load the game
        chess.current.loadPgn(pos);
        const newHistory: MoveHistory[] = chess.current.history({
          verbose: true,
        });
        //add the comments to the game
        const comments = [...chess.current.getComments()];
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
        //get the headers
        const {White, Black, WhiteElo, BlackElo, Date, Event, Result, additional} =
          chess.current.header();
          const arr = additional.split(',');
          const rest = {}
          while(arr.length > 1){
            const value = arr.pop() || '';
            const key = arr.pop() || ''
            rest[key] = value;
          }
        setWhitePlayer(White || '');
        setBlackPlayer(Black || '');
        setWhiteElo(WhiteElo || '');
        setBlackElo(BlackElo || '');
        setRestInfo(rest);
        setDate(Date || moment(new window.Date()).format('YYYY.mm.dd'));
        setEvent(Event || '');
        setResult((Result as ResultType) || '*');
        //set the history
        setHistoryIndex(newHistory.length - 1);
        setHistory(newHistory);
        setPlayBackMode(true);
        setMoveSquare({
          to: newHistory[newHistory.length - 1].to,
          from: newHistory[newHistory.length - 1].from,
        });
      } catch (e) {
        console.log('there was an error' + e);
      }
    } else {
      //fen
      try {
        chess.current.load(pos);
        setHistory([]);
        setHistoryIndex(-1);
        setMoveSquare({to: null, from: null});
        startPos.current = chess.current.fen();
        setPlayBackMode(false);
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
    setHighlightedSquares(new Set());
    setShowGameList(false);
    setBoard(chess.current.board());
  };
  const loadGames = async (database: string) => {
    const {data} = await window.api.loadList(database);
    setGameList(data);
  };
  const deleteGame = async (key: string) => {
    const fullGames = [...gameList];
    const filtered = fullGames.filter((x) => x.key !== key);
    //save the list as the new list
    const res = await window.api.saveList(filtered);
    if (res) {
      setGameList(filtered);
    }
  };
  const saveGame = async (gameInfo: GameDetails) => {
    //in order to get an accurate pgn with our added comments
    //we have to go through every move in the history and build
    //the complete pgn. This is because the chess object loses
    //track of the complete pgn when we jump around the history
    if (history.length >= 1) {
      //don't save a game with no moves
      const chessGame = new Chess(startPos.current);
      for (const {comments, ...move} of history) {
        chessGame.move(move);
        if (comments) chessGame.setComment(comments);
      }
      Object.keys(gameInfo).forEach((key) => {
        if (key === 'additional') {
          chessGame.header(gameInfo.additional);
        } else {
          chessGame.header(key, gameInfo[key]);
        }
      });
      console.log(chessGame.header());
      const data: Game = {
        white: gameInfo.White,
        black: gameInfo.Black,
        result: gameInfo.Result,
        pgn: chessGame.pgn(),
        date: new Date(gameInfo.Date),
        dateAdded: new Date(),
        key: uuidv6(),
      };
      const load = await window.api.loadList('myGames');
      const oldList = load.data;
      //if this game already exists, update it;
      const prevIndex = oldList.findIndex((x) => x.key === data.key);
      if (prevIndex !== -1) {
        //this game already exists
        oldList[prevIndex] = data;
      } else {
        oldList.push(data);
      }
      const res = await window.api.saveList(oldList);
      if (res) {
        console.log('save successful');
        await loadGames('myGames');
        setshowSaveAlert(false);
      }
    }
  };

  //engine listener
  useEffect(() => {
    window.api.onEvalResults((data: EvalResults[]) => {
      const {mate, score} = data[0];
      //console.log(mate, score);
      if (mate !== null) {
        setEvaluation(
          mate > 0
            ? 20
            : mate < 0
              ? -20
              : chess.current.turn() === 'w'
                ? -20
                : 20
        );
        setEvalText(`M${mate === 0 ? '' : Math.abs(mate)}`);
      } else if (score !== null) {
        setEvaluation(score / 100);
        setEvalText(numFormat.format(score / 100));
      }
      //top 3 variations
      if (mate !== 0) {
        const variations = data.map((x) => {
          const chess = new Chess(x.fen);
          const color = chess.turn();
          try {
            x.variation.forEach((move) => {
              chess.move(move);
            });
          } catch (e) {
            console.log(e);
          }
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
              ? `M${Math.abs(x.mate)}`
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
      } else {
        setVariations([]);
        setBestMoves(new Map());
      }
    });
    return () => window.api.removeEvalListener();
  }, []);
  useEffect(() => {
    window.api.getEval(chess.current.fen(), chess.current.turn());
  }, []);
  useEffect(() => {
    const keyDownHandler = (e: KeyboardEvent) => {
      if (!showGameInfo && !showGameList && !showSaveAlert && !showSetup) {
        if (e.key === 'ArrowLeft' && historyIndex >= 0) {
          const jumpPoint =
            storedIndex.current !== null
              ? storedIndex.current
              : historyIndex - 1;
          jump(jumpPoint, false);
          storedIndex.current = null;
          setBestMoves(new Map());
        } else if (
          e.key === 'ArrowRight' &&
          historyIndex < history.length - 1 &&
          storedIndex.current === null
        ) {
          jump(historyIndex + 1, false);
          setBestMoves(new Map());
        }
      }
    };
    //set up listeners for arrow keys down
    window.addEventListener('keydown', keyDownHandler);
    return () => {
      window.removeEventListener('keydown', keyDownHandler);
    };
  }, [
    historyIndex,
    history,
    jump,
    showGameInfo,
    showGameList,
    showSaveAlert,
    showSetup,
  ]);
  useEffect(() => {
    //set up listeners for arrow keys up
    //this is so when the users hold down the arrow key
    //to skip back really far, we aren't evaluating every position skipped over
    const keyUpHandler = (e: KeyboardEvent) => {
      if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && !showGameInfo && !showGameList && !showSaveAlert && !showSetup) {
        // if (!chess.current.isCheckmate() && !chess.current.isDraw()) {
        window.api.getEval(chess.current.fen(), chess.current.turn());
        // } else {
        //   //the game is ended
        //   setVariations([]);
        //   setBestMoves(new Map());
        // }
      }
    };
    window.addEventListener('keyup', keyUpHandler);
    return () => {
      window.removeEventListener('keyup', keyUpHandler);
    };
  }, [showGameInfo, showGameList, showSaveAlert, showSetup]);
  useEffect(() => {
    //load the games from the list
    loadGames('myGames');
  }, []);
  useEffect(() => {
    //console.log(history, historyIndex);
  }, [history, historyIndex]);
  return (
    <Container>
      <GameContainer>
        <EvalBar height={squareSize * 8} score={evaluation} />
        <BoardContainer>
          {showGameList && (
            <GameList
              list={gameList}
              close={() => setShowGameList(false)}
              open={(pgn: string) => loadPosition(pgn, 'pgn')}
              deleteGame={deleteGame}
            />
          )}
          {showSetup && (
            <LoadDiv>
              <LoadPos load={loadPosition} cancel={() => setShowSetup(false)} />
            </LoadDiv>
          )}
          {showGameInfo && (
            <GameHeaders
              white={whitePlayer || 'White'}
              black={blackPlayer || 'Black'}
              whiteElo={whiteElo || '0'}
              blackElo={blackElo || '0'}
              rest={restInfo}
              close={() => setShowGameInfo(false)}
            ></GameHeaders>
          )}
          {showSaveAlert && (
            <Save
              accept={saveGame}
              cancel={() => setshowSaveAlert(false)}
              white={whitePlayer || 'White'}
              black={blackPlayer || 'Black'}
              whiteElo={whiteElo || '0'}
              blackElo={blackElo || '0'}
              date={date}
              event={event}
              additional={Object.entries(restInfo)
                .map((x) => x.join(','))
                .join(',')}
              result={result}
            />
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
            white={whitePlayer || 'White'}
            black={blackPlayer || 'Black'}
            whiteElo={whiteElo || '0'}
            blackElo={blackElo || '0'}
          />
        </BoardContainer>
        <GameInfo $height={squareSize * 8}>
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
            saveGame={() => setshowSaveAlert(true)}
            showGameList={() => setShowGameList(true)}
            showGameInfo={() => setShowGameInfo(true)}
          />
        </GameInfo>
      </GameContainer>
    </Container>
  );
}
const Container = styled.div`
  display: flex;
  flex-flow: column;
  align-items: center;
  justify-content: center;
  background-color: #000000;
  min-width: 650px;
  font-family: Arial, Helvetica, sans-serif;
`;

const GameContainer = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background-color: #000000;
  min-width: 650px;
`;

const GameInfo = styled.div<{$height: number}>`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  background-color: blue;
  height: ${(props) => props.$height}px;
  width: 300px;
  position: relative;
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
