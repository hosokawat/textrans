const { app, BrowserWindow, ipcMain, clipboard, Tray,Menu , globalShortcut} = require('electron')
const path = require('path')
const fs = require('fs')

let tray = null

// コマンド管理系
const commandStore = {}
class Command {
  constructor(name, description ,action) {
    this.name = name
    this.description = description
    this.action = action

    commandStore[name] = this
  }

  toString() {
    return this.name
  }

}

function isMac() {
  return process.platform == 'darwin';
}
ipcMain.handle('isMac',  async (event) => {
  return isMac();
});

function registerCommand(name, description, action) {
  new Command(name, description, action)
}

// commands自動ロード
fs.readdir(__dirname + '/commands',(err, files) => {
  files.forEach(file=>
    {
      if(file.endsWith(".js")) {
        const cmd = require(__dirname + '/commands/' + file)
        registerCommand(file.slice(0,-3), cmd['description'], cmd['action'])
      }
    })
})

ipcMain.handle('getCommandDefines',  async (event) => {

  const names = Object.keys(commandStore)
  const nameDesc = {}

  for(const name of names) {
    nameDesc[name] = commandStore[name].description
  }

  return nameDesc
});

ipcMain.handle('getClipboard',  async (event) => {
  return clipboard.readText()
});

ipcMain.handle('convert',  async (event, commands) => {
  let _src = clipboard.readText()
  const commands_split = `${commands}`.split("|")
  for(let part of commands_split) {
    part = part.trim()
    if(commandStore[part]) {
      _src = commandStore[part].action(_src)
    }
  }

  return _src
})

const createWindow = () => {

  const { screen } = require('electron')
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;
  const ajust_height = Math.round(height/3);
  const ajust_width =Math.round( width/2);

  const win = new BrowserWindow({
    frame: false,
    width: ajust_width,
    height: ajust_height,
    alwaysOnTop: true,
    title: app.name,
    skipTaskbar:true,
    backgroundColor: "#000",
    icon: __dirname + '/icons/app/shimaenaga_512x512.icns',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    },
  })

  win.setSkipTaskbar(true)
  win.loadFile('index.html')

  win.on('blur' , (e)=>{
    win.close()
  })
  win.webContents.on('before-input-event', (event, input) => {
    if (input.shift && input.meta && input.key.toLowerCase() === 'c') {
      win.webContents.executeJavaScript(`document.getElementById('dst').value`).then(function (value) {
        clipboard.writeText(value)
        win.webContents.executeJavaScript(`window.close()`)
      })
    }
  })

}
if (process.platform === 'darwin') {
  app.dock.hide()
}

function menuGroupCheck(menu, groupIds , enableId) {
  for(const groupId of groupIds) {
    const item = menu.getMenuItemById(groupId);
    if(enableId == groupId) {
      item.checked = true;
    } else {
      item.checked = false;
    }
  }
}
const createTray = () => {
  console.log(`darwin ${isMac()}`)
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'ショートカットキー',
      submenu: [ // 要リファクタリング
        {id: 'a',  label: isMac() ? '⌘ + B' : 'Ctrl + B', shourtcutKey: 'CommandOrControl+B' ,type: 'checkbox', checked: loadHotkey()=='CommandOrControl+B', click: (e)=>{//任意のデータを入れてeで拾うことができる
          menuGroupCheck(contextMenu, ['a','b','c'] , e.id);
          updateOpenHotKey(e.shourtcutKey);
        } },
        {id: 'b',  label: isMac() ? '⌘ + Shift + B' : 'Ctrl + Shift + B', shourtcutKey: 'CommandOrControl+Shift+B', type: 'checkbox', checked: loadHotkey()=='CommandOrControl+Shift+B', click: (e)=>{
          menuGroupCheck(contextMenu, ['a','b','c'] , e.id);
          updateOpenHotKey(e.shourtcutKey);
        } },
        {id: 'c',  label: isMac() ? '⌘ + Shift + T' : 'Ctrl + Shift + T', shourtcutKey: 'CommandOrControl+Shift+T', type: 'checkbox', checked: loadHotkey()=='CommandOrControl+Shift+T', click: (e)=>{
          menuGroupCheck(contextMenu, ['a','b','c'] , e.id);
          updateOpenHotKey(e.shourtcutKey);
        } },
      ]
    },{label:'終了', role: 'quit'}
    ,
  ])
  tray = new Tray(__dirname + '/icons/tray/macos/32x32@2x.png')
  tray.setToolTip(app.name)
  tray.setContextMenu(contextMenu)
}

function loadHotkey() {
  const config = JSON.parse(fs.readFileSync(__dirname + '/config.json', 'utf8'));
  return config.hotkey
}

function saveHotkey(hotkey) {
  const config = JSON.parse(fs.readFileSync(__dirname + '/config.json', 'utf8'));
  config.hotkey = hotkey
  const configStr = JSON.stringify(config)
  fs.writeFileSync(__dirname + '/config.json',configStr)

}

let beforeOpenHotKey = loadHotkey();

function updateOpenHotKey(key) {
  if(beforeOpenHotKey) {
    globalShortcut.unregister(beforeOpenHotKey);
  }
  globalShortcut.register(key, () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  });
  beforeOpenHotKey = key;
  saveHotkey(key)
}
app.on('window-all-closed', () => {
  // ウィンドウをすべて閉じた時の動きをオーバーライド
  //  if (process.platform !== 'darwin') app.quit()
})

app.whenReady().then(() => {
  updateOpenHotKey(loadHotkey());
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
  createTray()
  createWindow()

})

