import {app, shell, BrowserWindow, ipcMain} from 'electron';
import {join} from 'path';
import {electronApp, optimizer, is} from '@electron-toolkit/utils';
import icon from '../../resources/atomicLogo.png?asset';
const stockfish = require('stockfish.wasm');
import {Game} from '../types'
import fs from 'fs';
import electronUpdater, {AppUpdater} from 'electron-updater';
import log from 'electron-log/main'


export function getAutoUpdater(): AppUpdater {
  // Using destructuring to access autoUpdater due to the CommonJS module of 'electron-updater'.
  // It is a workaround for ESM compatibility issues, see https://github.com/electron-userland/electron-builder/issues/7976.
  const { autoUpdater } = electronUpdater;
  //autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = false;
  autoUpdater.logger = log;
  //autoUpdater.logger.info('Checking for update')
  //autoUpdater.checkForUpdatesAndNotify();
  return autoUpdater;
}

const updater = getAutoUpdater();



global.nextPos = null;
global.engineWorking = false;
global.color = 'w';

const getEval = (pos: string, color: 'b' | 'w', depth: number) => {
  global.engineWorking = true;
  global.pos = pos;
  global.color = color;
  global.depth = depth;
  global.engine.postMessage(`position fen ${pos}`);
  global.engine.postMessage(`go depth ${depth}`);
};

function createWindow(): BrowserWindow {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 600,
    show: false,
    title: 'Atom Chess',
    backgroundColor: '#000000',
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? {icon} : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
    },
  });
  

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return {action: 'deny'};
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }
  return mainWindow;
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
// app.on('ready', ()=>{
//   console.log('test')
// })
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron');

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });
  
  // IPC test
  ipcMain.on('ping', () => console.log('pong'));

  const mainWindow = createWindow();
  //set up the engine
  stockfish().then((sf) => {
    let res: string[] = [];
    sf.addMessageListener((line) => {
      if (line.includes('bestmove')) {
        //we want to pass the top 3 moves and variations back to the renderer
        //console.log(res)
        const data = res.slice(-3).map((evaluation) => {
          const scoreLine = evaluation.match(/cp -?[\d]+/);
          const mateLine = evaluation.match(/mate -?[\d]+/);
          const variationLine = evaluation.match(/(([a-h][\d]){2} ?)+[qkrb]?/);
          if(mateLine && !variationLine && !scoreLine){
            //this game is over
            return {
              score: null,
              mate: 0,
              variation: [],
              fen: global.pos
            }
          }
          else if ((scoreLine || mateLine) && variationLine) {
            const mod = global.color === 'w' ? 1 : -1;
            return {
              score: scoreLine
                ? +scoreLine[0].split(' ')[1] * mod : null,
              mate: mateLine
                  ? +mateLine[0].split(' ')[1] * mod : null,
              variation: variationLine[0].split(' '),
              fen: global.pos
            };
          }
          return null;
        });
        mainWindow.webContents.send('evalResults', data);
        res = [];
        global.engineWorking = false;
        if (global.nextPos) {
          const nextPos = global.nextPos.pos;
          const nextColor = global.nextPos.color;
          const nextDepth = global.nextPos.depth;
          getEval(nextPos, nextColor, nextDepth);
          global.nextPos = null;
        }
      } else if(line.includes(` depth ${global.depth}`) || line.includes('mate 0')) {
        res.push(line);
      }
    });
    sf.postMessage('uci');
    sf.postMessage('setoption name multipv value 3');
    global.engine = sf;
  });

  //set up the updater 
    updater.checkForUpdates();
    updater.on('checking-for-update',()=>{
      updater.logger?.info('Checking for Update')
    })
    updater.on('update-available',(info)=>{
      updater.logger?.info(`There is an update available (${info.version})`)
      updater.downloadUpdate();
      
    })
    updater.on('update-downloaded',(info)=>{
      updater.logger?.info(`Update Ready (${info.version})`)
      mainWindow.webContents.send('updateStatus', info)
    })

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
ipcMain.on('updateApp', (_,now:boolean)=>{
  if(now) updater.quitAndInstall();
  else updater.autoInstallOnAppQuit = true;
})
ipcMain.on('getEval', (_, pos: string, color: 'w' | 'b', depth: number) => {
  if (global.engineWorking) {
    global.nextPos = {pos, color, depth}
  } else {
    getEval(pos, color, depth);
  }
});
ipcMain.handle('saveList', (_, data: Game[])=>{
  try{
    const path = app.getPath('userData');
    const userData = JSON.stringify(data);
    fs.writeFileSync(`${path}/myGames.json`, userData);
    return true

  }catch(e){
    console.log(e);
    return false
  }
})
ipcMain.handle('loadList', (_, name:string)=>{
  try{
    const path = app.getPath('userData');
    const gamesList = fs.readFileSync(`${path}/${name}.json`, 'utf-8');
    return {data: JSON.parse(gamesList)}
  }catch(e){
    console.log(e);
    return {data:[]}
  }
})
ipcMain.handle('saveUsernames', (_, names:string[])=>{
  try{
    const path = app.getPath('userData');
    const data = JSON.stringify(names);
    fs.writeFileSync(`${path}/usernames.json`, data);
    return true
  }catch(e){
    console.log(e);
    return false;
  }
})
ipcMain.handle('loadUsernames', (_)=>{
  try{
    const path = app.getPath('userData');
    const data = fs.readFileSync(`${path}/usernames.json`,'utf-8');
    return {data: JSON.parse(data)}
  }
  catch(e){
    console.log(e);
    return null;
  }
})
