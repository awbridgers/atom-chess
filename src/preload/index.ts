import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { Color } from 'chess.js'
import { Game } from '../types'

// Custom APIs for renderer
const api = {
  getEval: (pos: string, color: Color, depth: number)=>ipcRenderer.send('getEval', pos, color, depth),
  onEvalResults: (callback)=>ipcRenderer.on('evalResults', (_, data)=>{callback(data)}),
  removeEvalListener: ()=>ipcRenderer.removeListener('evalResults',()=> console.log('listener removed')),
  saveList: (data: Game[])=>ipcRenderer.invoke('saveList', data),
  loadList: (name: string)=>ipcRenderer.invoke('loadList', name)
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
