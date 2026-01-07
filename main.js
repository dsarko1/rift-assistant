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
  console.log("Buscando summoner:", riotId);

  const [gameName, tagLine] = riotId.split("#");

  console.log("GameName:", gameName, "TagLine:", tagLine);

  const url = `https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(
    gameName
  )}/${encodeURIComponent(tagLine)}`;

  console.log("URL:", url);

  const response = await fetch(url, {
    headers: {
      "X-Riot-Token": RIOT_API_KEY,
    },
  });

  console.log("Response status:", response.status, response.statusText);

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Error response:", errorText);
    throw new Error(
      `Error al obtener la cuenta: ${response.status} ${response.statusText}`
    );
  }

  return await response.json();
});

ipcMain.handle("get-summoner-v4", async (_, puuid, region = "la2") => {
  console.log("Buscando summoner-v4 con PUUID:", puuid);

  const url = `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`;

  console.log("URL summoner-v4:", url);

  const response = await fetch(url, {
    headers: {
      "X-Riot-Token": RIOT_API_KEY,
    },
  });

  console.log(
    "Response status summoner-v4:",
    response.status,
    response.statusText
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Error response summoner-v4:", errorText);
    throw new Error(
      `Error al obtener summoner-v4: ${response.status} ${response.statusText}`
    );
  }

  return await response.json();
});

ipcMain.handle("get-ranked", async (_, puuid, region = "la2") => {
  console.log("=== GET-RANKED ===");
  console.log("PUUID:", puuid);
  console.log("Region:", region);

  const url = `https://${region}.api.riotgames.com/lol/league/v4/entries/by-puuid/${puuid}`;
  console.log("URL:", url);

  const response = await fetch(url, {
    headers: {
      "X-Riot-Token": RIOT_API_KEY,
    },
  });

  console.log("Status:", response.status, response.statusText);

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Error:", errorText);
    throw new Error(`Error ${response.status}: No se pudo obtener ranked`);
  }

  const data = await response.json();
  console.log("Ranked data recibido:", data);
  return data;
});

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
