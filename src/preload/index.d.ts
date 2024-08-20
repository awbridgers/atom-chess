import { ElectronAPI } from '@electron-toolkit/preload'
import { Color } from 'chess.js';
import { EvalResults } from 'src/types';

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      getEval: (pos: string, color: Color)=>void;
      onEvalResults: (callback: (data:EvalResults[])=>void) =>void,
      removeEvalListener: ()=>void
    }
  }
}
