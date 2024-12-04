import { ElectronAPI } from '@electron-toolkit/preload'
import { Color } from 'chess.js';
import { EvalResults, Game } from 'src/types';

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      getEval: (pos: string, color: Color, depth: number)=>void;
      onEvalResults: (callback: (data:EvalResults[])=>void) =>void,
      removeEvalListener: ()=>void;
      saveList: (data: Game[])=> Promise<boolean>;
      loadList: (name: string)=>Promise<{data:Game[]}>;
      loadUsernames: ()=>Promise<{data:string[]| null}>;
      saveUsernames: (names:string[])=>Promise<boolean>;
    }
  }
}
