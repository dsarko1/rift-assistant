const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.loadFile("index.html");
}

const { RIOT_API_KEY } = require("./config");

ipcMain.handle("get-summoner", async (_, riotId) => {
  const [gameName, tagLine] = riotId.split("#");

  const url = `https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(
    gameName
  )}/${encodeURIComponent(tagLine)}`;

  const response = await fetch(url, {
    headers: {
      "X-Riot-Token": RIOT_API_KEY,
    },
  });

  if (!response.ok) {
    throw new Error("Error al obtener la cuenta");
  }

  return await response.json();
});

ipcMain.handle("get-summoner-v4", async (_, puuid) => {
  const url = `https://la2.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`;

  const response = await fetch(url, {
    headers: {
      "X-Riot-Token": RIOT_API_KEY,
    },
  });

  if (!response.ok) {
    throw new Error("Error al obtener summoner-v4");
  }

  return await response.json();
});

app.whenReady().then(createWindow);
