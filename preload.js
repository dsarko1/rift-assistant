console.log("Preload cargado");

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("riotAPI", {
  getSummoner: (name) => ipcRenderer.invoke("get-summoner", name),
  getSummonerV4: (puuid) => ipcRenderer.invoke("get-summoner-v4", puuid),
});
