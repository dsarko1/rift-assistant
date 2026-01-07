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

ipcMain.handle(
  "get-match-history",
  async (_, puuid, region = "la2", count = 5, start = 0) => {
    console.log("=== GET MATCH HISTORY ===");
    console.log("PUUID:", puuid, "Count:", count, "Start:", start);

    let routingRegion = "americas";
    if (region.startsWith("euw") || region.startsWith("eun")) {
      routingRegion = "europe";
    } else if (region.startsWith("kr") || region.startsWith("jp")) {
      routingRegion = "asia";
    }

    const url = `https://${routingRegion}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=${start}&count=${count}`;
    console.log("Match history URL:", url);

    const response = await fetch(url, {
      headers: {
        "X-Riot-Token": RIOT_API_KEY,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error match history:", errorText);
      throw new Error(
        `Error ${response.status}: No se pudo obtener el historial de partidas`
      );
    }

    const matchIds = await response.json();
    console.log("Match IDs obtenidos:", matchIds);
    return matchIds;
  }
);

ipcMain.handle("get-match-details", async (_, matchId, region = "la2") => {
  console.log("=== GET MATCH DETAILS ===");
  console.log("Match ID:", matchId);
  console.log("Region parameter:", region);

  // Determinar routing region (IMPORTANTE)
  let routingRegion = "americas"; // Para LAS/LA1/NA

  if (
    region.startsWith("euw") ||
    region.startsWith("eun") ||
    region.startsWith("tr") ||
    region.startsWith("ru")
  ) {
    routingRegion = "europe";
  } else if (region.startsWith("kr") || region.startsWith("jp")) {
    routingRegion = "asia";
  }

  console.log("Routing region calculada:", routingRegion);

  const url = `https://${routingRegion}.api.riotgames.com/lol/match/v5/matches/${matchId}`;
  console.log("URL completa:", url);

  const response = await fetch(url, {
    headers: {
      "X-Riot-Token": RIOT_API_KEY,
    },
  });

  console.log("Status:", response.status, response.statusText);

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Error body:", errorText);
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }

  const matchData = await response.json();
  console.log("Match details obtenidos exitosamente");
  return matchData;
});

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
