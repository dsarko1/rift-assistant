console.log("Preload cargado");

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("riotAPI", {
  getSummoner: (name) => ipcRenderer.invoke("get-summoner", name),
  getSummonerV4: (puuid, region) =>
    ipcRenderer.invoke("get-summoner-v4", puuid, region),
  getRanked: (puuid, region) => ipcRenderer.invoke("get-ranked", puuid, region),
});
