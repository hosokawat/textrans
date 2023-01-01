const { contextBridge, ipcRenderer } = require('electron')

// renderされる前に実行されるjs
// nodeとrenderどちらも操作できる
window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }
  
  replaceText(`info`,ipcRenderer.invoke('isMac') ? '⌘ + Shift + C で変換後のテキストをコピーします。ESCで閉じる' :'Ctrl + Shift + C で変換後のテキストをコピーします。ESCで閉じる');
})


contextBridge.exposeInMainWorld('electronAPI', {
  getClipboard: () => ipcRenderer.invoke('getClipboard'),
  convert: (commands) => ipcRenderer.invoke('convert', commands),
  getCommandDefines: () => ipcRenderer.invoke('getCommandDefines'),
})