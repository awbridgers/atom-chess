import {Chess, Color, Move, PieceSymbol, Square} from 'chess.js';
import {useCallback, useEffect, useRef, useState} from 'react';
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
import {useScreenSize} from './hooks/useScreenSize';
import GameList from './components/GameList';
import {v6 as uuidv6} from 'uuid';
import GameHeaders from './components/GameHeaders';
import Save from './components/Save';
import {ResultType} from '../../types';
import EngineOptions from './components/EngineOptions';
import {clr} from './assets/palette';
import Banner from './components/Banner';
import Alert from './components/Alert';
import { UpdateInfo } from 'electron-updater';

const numFormat = new Intl.NumberFormat('en-US', {
  signDisplay: 'exceptZero',
  minimumFractionDigits: 2,
});
//const startPos = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const initGameInfo: GameDetails = {
  white: 'White',
  black: 'Black',
  whiteElo: '0',
  blackElo: '0',
  result: '*',
  date: '',
  event: '',
  additional: [],
};

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
  const [gameInfo, setGameInfo] = useState<GameDetails>({
    ...initGameInfo,
    additional: [],
  });
  const [showGameList, setShowGameList] = useState<boolean>(false);
  const [playBackMode, setPlayBackMode] = useState<boolean>(false);
  const [showGameInfo, setShowGameInfo] = useState<boolean>(false);
  const [showSaveAlert, setshowSaveAlert] = useState<boolean>(false);
  const [engineOn, setEngineOn] = useState<boolean>(true);
  const [depth, setDepth] = useState<number>(16);
  const [showEngineOptions, setShowEngineOptions] = useState<boolean>(false);
  const [canUpdate, setCanUpdate] = useState<boolean>(false);
  const [showUpdateAlert, setShowUpdateAlert] = useState<boolean>(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo|undefined>(undefined)
  const screenSize = useScreenSize();
  const squareSize = Math.max(
    Math.min((screenSize.height - 51) / 8, screenSize.width / 13),
    60
  );
  const storedIndex = useRef<number | null>(null);
  const gameKey = useRef<string | null>(null);
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
  const fetchEvaluation = useCallback(
    (fen: string, turn: 'w' | 'b') => {
      if (engineOn) {
        window.api.getEval(fen, turn, depth);
      }
    },
    [engineOn, depth]
  );
  const update = (now: boolean) => {
    window.api.updateApp(now);
    setShowUpdateAlert(false);

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
      fetchEvaluation(chess.current.fen(), chess.current.turn());
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
      setBestMoves(new Map());
      setHistoryIndex(index);
      setBoard(chess.current.board());
      setMoveSquare({to, from});
      setSelectedSquare(null);
      setLegalMoves(new Map());
      if (getEval) {
        fetchEvaluation(chess.current.fen(), chess.current.turn());
      }
    },
    [history, fetchEvaluation]
  );
  const toggleArrows = () => {
    setShowArrows(!showArrows);
  };
  const loadPosition = (
    pos: string,
    type: 'fen' | 'pgn',
    key: string,
    moveNumber?: number
  ) => {
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
        const {
          White,
          Black,
          WhiteElo,
          BlackElo,
          Date,
          Event,
          Result,
          ...additional
        } = chess.current.header();
        const newGameDetails: GameDetails = {
          white: White || 'White',
          black: Black || 'Black',
          whiteElo: WhiteElo || '0',
          blackElo: BlackElo || '0',
          date: Date || '',
          event: Event || '',
          result: (Result as ResultType) || '*',
          additional: Object.keys(additional).map((x) => [x, additional[x]]),
        };
        setGameInfo(newGameDetails);

        //set the history
        if (moveNumber !== undefined) {
          jump(moveNumber, true);
        } else {
          setHistoryIndex(newHistory.length - 1);
          setHistory(newHistory);
          setPlayBackMode(true);
          setMoveSquare({
            to: newHistory[newHistory.length - 1].to,
            from: newHistory[newHistory.length - 1].from,
          });
        }
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
        setGameInfo({...initGameInfo, additional: []});
        startPos.current = chess.current.fen();
        gameKey.current = null;
        setPlayBackMode(false);
      } catch (e) {
        console.log(e);
      }
    }
    if (key) gameKey.current = key;
    else gameKey.current = null;
    fetchEvaluation(chess.current.fen(), chess.current.turn());
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
    const games = data.map((x) => ({...x, dateAdded: new Date(x.dateAdded)}));
    games.sort((a, b) => a.dateAdded.getTime() - b.dateAdded.getTime());
    setGameList(games);
    return true;
  };
  const deleteGame = async (key: string) => {
    const fullGames = [...gameList];
    const filtered = fullGames.filter((x) => x.key !== key);
    //save the list as the new list
    const res = await window.api.saveList(filtered);
    console.log(res);
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
      const chessGame = new Chess(startPos.current);
      //add the comments to the pgn
      for (const {comments, ...move} of history) {
        chessGame.move(move);
        if (comments) chessGame.setComment(comments);
      }
      //add the headers to the pgn
      Object.keys(gameInfo).forEach((key) => {
        if (key === 'additional') {
          //console.log(gameInfo[key])
          for (const [key, value] of gameInfo.additional) {
            const newKey = key[0].toUpperCase() + key.slice(1);
            chessGame.header(newKey, value);
          }
        } else {
          const newKey = key[0].toUpperCase() + key.slice(1);
          chessGame.header(newKey, gameInfo[key]);
        }
      });
      //add the game to the list, or update an old game.
      //first determine if this game is alrady stored
      const oldList = [...gameList];
      const dataKey = gameKey.current ? gameKey.current : uuidv6();
      const prevIndex = oldList.findIndex((x) => x.key === dataKey);

      const data: Game = {
        white: gameInfo.white,
        black: gameInfo.black,
        result: gameInfo.result,
        pgn: chessGame.pgn(),
        date: new Date(gameInfo.date),
        dateAdded: prevIndex === -1 ? new Date() : oldList[prevIndex].dateAdded,
        key: dataKey,
      };
      //if this game already exists, update it;
      if (prevIndex !== -1) {
        //this game already exists
        oldList[prevIndex] = data;
      } else {
        oldList.push(data);
      }
      //save the list
      const res = await window.api.saveList(oldList);
      //now load the changes made to this game
      if (res) {
        console.log('save successful');
        await loadGames('myGames');
        setshowSaveAlert(false);
        gameKey.current = data.key;
        loadPosition(data.pgn, 'pgn', data.key, historyIndex);
      }
    }
  };
  //update listener
  useEffect(()=>{
    const removeListener = window.api.onUpdateStatus((info)=>{
      console.log(info)
      if(info){
        setCanUpdate(true);
        setUpdateInfo(info)
      }
    })
    return ()=> removeListener();
  },[])
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
  //listen for engine on/off changes
  useEffect(() => {
    if (engineOn) {
      fetchEvaluation(chess.current.fen(), chess.current.turn());
      setShowArrows(true);
    } else {
      setEvalText('Off');
      setVariations([]);
      setBestMoves(new Map());
      setShowArrows(false);
      setEvaluation(0);
    }
  }, [engineOn, fetchEvaluation]);
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
  // useEffect(()=>{
  //   const loadNames = async () =>{
  //     const {data} = await window.api.loadUsernames();
  //     if(data){
  //       setUsernames(data)
  //     }
  //   }
  //   loadNames();
  // },[])
  useEffect(() => {
    //set up listeners for arrow keys up
    //this is so when the users hold down the arrow key
    //to skip back really far, we aren't evaluating every position skipped over
    const keyUpHandler = (e: KeyboardEvent) => {
      if (
        (e.key === 'ArrowLeft' || e.key === 'ArrowRight') &&
        !showGameInfo &&
        !showGameList &&
        !showSaveAlert &&
        !showSetup
      ) {
        // if (!chess.current.isCheckmate() && !chess.current.isDraw()) {
        fetchEvaluation(chess.current.fen(), chess.current.turn());
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
  }, [showGameInfo, showGameList, showSaveAlert, showSetup, fetchEvaluation]);
  useEffect(() => {
    //load the games from the list
    loadGames('myGames');
  }, []);
  return (
    <Container>
      <Banner
        white={gameInfo.white}
        black={gameInfo.black}
        whiteElo={gameInfo.whiteElo}
        blackElo={gameInfo.blackElo}
        result={gameInfo.result}
        squareSize={squareSize}
        canUpdate={canUpdate}
        showUpdateAlert={setShowUpdateAlert}
        hideUpdate={()=>setCanUpdate(false)}
      />
      <GameContainer>
        <EvalBar height={squareSize * 8} score={evaluation} />
        <BoardContainer>
          {showGameList && (
            <GameList
              list={gameList}
              close={() => setShowGameList(false)}
              open={(pos: string, key: string) => loadPosition(pos, 'pgn', key)}
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
              white={gameInfo.white}
              black={gameInfo.black}
              whiteElo={gameInfo.whiteElo}
              blackElo={gameInfo.blackElo}
              rest={gameInfo.additional}
              event={gameInfo.event}
              date={gameInfo.date}
              result={gameInfo.result}
              close={() => setShowGameInfo(false)}
            ></GameHeaders>
          )}
          {showSaveAlert && (
            <Save
              accept={saveGame}
              cancel={() => setshowSaveAlert(false)}
              white={gameInfo.white}
              black={gameInfo.black}
              whiteElo={gameInfo.whiteElo}
              blackElo={gameInfo.blackElo}
              event={gameInfo.event}
              date={gameInfo.date}
              result={gameInfo.result}
              additional={gameInfo.additional
                .map(([header, info]) => `[${header} ${info}]`)
                .join('')}
            />
          )}
          {showEngineOptions && (
            <EngineOptions
              active={engineOn}
              setActive={setEngineOn}
              depth={depth}
              setDepth={setDepth}
              exit={() => setShowEngineOptions(false)}
            />
          )}
          {showUpdateAlert && (
            <Alert
              title="Update Available"
              body={`Update to version ${updateInfo? updateInfo.version : ''} is available. Would you like to install it?`}
              onCancel={() => setShowUpdateAlert(false)}
              buttons={[
                {text: 'Install Now', onClick: () => update(true), width:125, height: 50},
                {text: 'Install on Exit', onClick: () => update(false), width:125, height: 50},
                {text: 'Ignore', onClick: () => setShowUpdateAlert(false), width:125, height: 50},
              ]}
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
          />
        </BoardContainer>
        <GameInfo $height={squareSize * 8}>
          <Engine
            value={evalText}
            variations={variations}
            flipped={flippedBoard}
            openOptions={() => setShowEngineOptions(true)}
            depth={depth}
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
  justify-content: center;
  background-color: ${clr.background};
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
