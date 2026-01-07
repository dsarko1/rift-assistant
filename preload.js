console.log("Preload cargado");

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("riotAPI", {
  getSummoner: (name) => ipcRenderer.invoke("get-summoner", name),
  getSummonerV4: (puuid, region) =>
    ipcRenderer.invoke("get-summoner-v4", puuid, region),
  getRanked: (puuid, region) => ipcRenderer.invoke("get-ranked", puuid, region),
  getMatchHistory: (puuid, region, count = 5, start = 0) =>
    ipcRenderer.invoke("get-match-history", puuid, region, count, start),
  getMatchDetails: (matchId, region) =>
    ipcRenderer.invoke("get-match-details", matchId, region),
});
