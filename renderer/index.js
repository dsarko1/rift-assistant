window.testSummoner = async () => {
  const data = await window.riotAPI.getSummoner("EJEMPLO#TAG");
  console.log(data);
};

let cachedMatches = [];
let cachedPuuid = "";
let currentFilter = "all"; // 'all', 'ranked', 'aram', 'arena', 'normal'
let currentPuuid = "";
let currentRegion = "";
let matchesLoaded = 0;
const matchesPerLoad = 5;
const buttons = document.querySelectorAll(".nav-item");
const view = document.getElementById("view");

const views = {
  profile: `
    <section class="profile-layout">
      <div class="profile-card">
        <div class="profile-icon">
          <img id="riot-icon" alt="Profile Icon" />
        </div>

        <div class="profile-info">
          <h2 id="riot-name">Invocador</h2>
          <p id="riot-tag">#tag</p>
          <p id="riot-level">Nivel</p>
          <p id="riot-rank">Sin rank</p> <!-- AÑADIDO: elemento faltante -->
        </div>
      </div>

      <div class="match-history">
        <h3>Historial de partidas</h3>
        <div class="matches"></div>
      </div>
    </section>
  `,
};

function loadView(key) {
  view.classList.remove("active");

  setTimeout(() => {
    view.innerHTML = views[key];
    view.classList.add("active");

    if (key === "profile") {
      cargarPerfil();
    }
  }, 200);
}

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    if (button.classList.contains("active")) return;

    buttons.forEach((b) => b.classList.remove("active"));
    button.classList.add("active");

    loadView(button.dataset.view);
  });
});

loadView("profile");

async function cargarPerfil() {
  try {
    const gameName = "matiasbarraza777";
    const tag = "darko";
    const region = "la2";

    currentRegion = region;

    console.log("1. Obteniendo cuenta...");
    const account = await window.riotAPI.getSummoner(`${gameName}#${tag}`);
    currentPuuid = account.puuid;

    // VERIFICAR CACHE: Si ya tenemos datos para este PUUID, usarlos
    if (cachedPuuid === currentPuuid && cachedMatches.length > 0) {
      console.log("Usando partidas cacheadas");
      mostrarPartidasCache();
      return; // No cargar de nuevo
    }

    // Si no hay cache, cargar normalmente
    console.log("2. Obteniendo summoner info...");
    const summoner = await window.riotAPI.getSummonerV4(currentPuuid, region);

    // Mostrar datos básicos
    document.getElementById("riot-name").textContent = gameName;
    document.getElementById("riot-tag").textContent = `#${tag}`;
    document.getElementById("riot-level").textContent = `Nivel ${
      summoner.summonerLevel || "?"
    }`;

    if (summoner.profileIconId) {
      document.getElementById(
        "riot-icon"
      ).src = `https://ddragon.leagueoflegends.com/cdn/14.4.1/img/profileicon/${summoner.profileIconId}.png`;
    }

    console.log("3. Obteniendo ranked data...");
    const ranked = await window.riotAPI.getRanked(currentPuuid, region);

    let rankText = "Unranked";
    if (Array.isArray(ranked) && ranked.length > 0) {
      const soloQ = ranked.find((q) => q.queueType === "RANKED_SOLO_5x5");
      if (soloQ) {
        rankText = `${soloQ.tier} ${soloQ.rank} (${soloQ.leaguePoints} LP)`;
      }
    }

    document.getElementById("riot-rank").textContent = rankText;

    // 4. CARGAR HISTORIAL DE PARTIDAS (solo si no hay cache)
    console.log("4. Cargando historial de partidas...");
    matchesLoaded = 0; // Reset solo si es nuevo PUUID
    cachedMatches = []; // Limpiar cache viejo
    cachedPuuid = currentPuuid; // Guardar para cache

    await cargarMasPartidas();
  } catch (err) {
    console.error("Error completo en cargarPerfil:", err);
  }
}

function mostrarPartidasCache() {
  const matchesContainer = document.querySelector(".matches");
  if (!matchesContainer) return;

  // Limpiar contenedor
  matchesContainer.innerHTML = "";

  // Agregar partidas cacheadas
  cachedMatches.forEach((matchData) => {
    const matchElement = crearElementoPartida(matchData, currentPuuid);
    matchesContainer.appendChild(matchElement);
  });

  // Actualizar contador
  matchesLoaded = cachedMatches.length;

  // Mostrar botón ver más si es necesario
  actualizarBotonVerMas();
}

async function cargarMasPartidas() {
  try {
    if (!currentPuuid) return;

    console.log(
      `Cargando partidas ${matchesLoaded} a ${
        matchesLoaded + matchesPerLoad
      }...`
    );

    const matchIds = await window.riotAPI.getMatchHistory(
      currentPuuid,
      currentRegion,
      matchesPerLoad,
      matchesLoaded
    );

    if (!matchIds || matchIds.length === 0) {
      console.log("No hay más partidas");
      return;
    }

    const matchesContainer = document.querySelector(".matches");
    if (!matchesContainer) return;

    for (const matchId of matchIds) {
      try {
        const matchData = await window.riotAPI.getMatchDetails(
          matchId,
          currentRegion
        );

        if (!matchData || !matchData.info) continue;

        // GUARDAR EN CACHE
        cachedMatches.push(matchData);

        const matchElement = crearElementoPartida(matchData, currentPuuid);
        matchesContainer.appendChild(matchElement);
        matchesLoaded++;
      } catch (matchError) {
        console.error(`Error cargando match ${matchId}:`, matchError);
      }
    }

    actualizarBotonVerMas();
  } catch (err) {
    console.error("Error cargando partidas:", err);
  }
}

function crearElementoPartida(matchData, playerPuuid) {
  // Encontrar al jugador en la partida
  const playerIndex = matchData.metadata.participants.indexOf(playerPuuid);
  const player = matchData.info.participants[playerIndex];

  // Determinar resultado
  const victory = player.win;
  const championName = player.championName;

  // Obtener información del modo usando queueId
  const queueInfo = traducirQueueId(matchData.info.queueId);

  // KDA
  const kills = player.kills;
  const deaths = player.deaths;
  const assists = player.assists;
  const kda =
    deaths === 0
      ? (kills + assists).toFixed(1)
      : ((kills + assists) / deaths).toFixed(2);

  // Duración
  const durationMinutes = Math.floor(matchData.info.gameDuration / 60);
  const durationSeconds = matchData.info.gameDuration % 60;

  // Fecha
  const gameDate = new Date(matchData.info.gameCreation);
  const timeAgo = getTimeAgo(gameDate);

  // Crear elemento HTML
  const div = document.createElement("div");
  div.className = `match ${victory ? "victory" : "defeat"}`;
  // Dentro del innerHTML, asegúrate de que no haya saltos de línea innecesarios
  div.innerHTML = `
  <div class="match-champion">
    <img src="https://ddragon.leagueoflegends.com/cdn/14.4.1/img/champion/${championName}.png" 
         alt="${championName}" 
         title="${championName}">
    <span class="champion-level">${player.champLevel}</span>
  </div>
  <div class="match-result">
    <span class="result-text">${victory ? "VICTORIA" : "DERROTA"}</span>
    <span class="match-mode" title="${queueInfo.mode} - ${queueInfo.map}">
      ${queueInfo.short}
    </span>
  </div>
  <div class="match-stats">
    <div class="kda">${kills}/${deaths}/${assists}</div>
    <div class="kda-ratio">${kda} KDA</div>
    <div class="cs">${
      player.totalMinionsKilled + player.neutralMinionsKilled
    } CS</div>
  </div>
  <div class="match-items">
    ${[0, 1, 2, 3, 4, 5, 6]
      .map((i) => {
        const itemId = player[`item${i}`];
        if (itemId > 0) {
          const ddragonUrl = `https://ddragon.leagueoflegends.com/cdn/14.4.1/img/item/${itemId}.png`;
          const cdragonUrl = `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/items-icons2d/${itemId}.png`;

          return `
      <div class="item-container">
        <img src="${ddragonUrl}"
             class="item-icon"
             title="Item ${i + 1}"
             onerror="
               this.onerror=null;
               if(this.src !== '${cdragonUrl}') {
                 this.src='${cdragonUrl}';
               } else {
                 this.style.display='none';
                 this.nextElementSibling.style.display='block';
               }">
        <div class="item-placeholder" style="display: none;">${itemId}</div>
      </div>
    `;
        }
        return '<div class="item-empty"></div>';
      })
      .join("")}
  </div>
  <div class="match-duration">
    ${durationMinutes}:${durationSeconds.toString().padStart(2, "0")}
  </div>
  <div class="match-time">${timeAgo}</div>
`;

  console.log(
    "Items del jugador:",
    [0, 1, 2, 3, 4, 5, 6].map((i) => player[`item${i}`])
  );
  return div;
}

function filtrarPartidas(tipo) {
  currentFilter = tipo;
  const matches = document.querySelectorAll(".match");

  matches.forEach((match) => {
    const modeElement = match.querySelector(".match-mode");
    const modeText = modeElement.textContent.toLowerCase();

    let mostrar = true;

    switch (tipo) {
      case "ranked":
        mostrar =
          modeText.includes("solo") ||
          modeText.includes("flex") ||
          modeText.includes("clash");
        break;
      case "aram":
        mostrar = modeText.includes("aram") || modeText.includes("poro");
        break;
      case "arena":
        mostrar = modeText.includes("arena");
        break;
      case "normal":
        mostrar = modeText.includes("normal") || modeText.includes("quickplay");
        break;
      // 'all' muestra todo
    }

    match.style.display = mostrar ? "flex" : "none";
  });
}

function añadirFiltros() {
  const matchHistory = document.querySelector(".match-history h3");

  const filterContainer = document.createElement("div");
  filterContainer.className = "match-filters";
  filterContainer.innerHTML = `
    <button class="filter-btn active" data-filter="all">Todas</button>
    <button class="filter-btn" data-filter="ranked">Ranked</button>
    <button class="filter-btn" data-filter="aram">ARAM</button>
    <button class="filter-btn" data-filter="arena">Arena</button>
    <button class="filter-btn" data-filter="normal">Normal</button>
  `;

  matchHistory.parentNode.insertBefore(
    filterContainer,
    matchHistory.nextSibling
  );

  // Event listeners
  filterContainer.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      filterContainer
        .querySelectorAll(".filter-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      filtrarPartidas(btn.dataset.filter);
    });
  });
}

function actualizarBotonVerMas() {
  const matchesContainer = document.querySelector(".matches");

  if (!matchesContainer) {
    console.error("Contenedor .matches no encontrado");
    return;
  }

  let verMasBtn = document.querySelector(".ver-mas-btn");

  if (!verMasBtn) {
    verMasBtn = document.createElement("button");
    verMasBtn.className = "ver-mas-btn";
    verMasBtn.textContent = "Ver más partidas";
    verMasBtn.onclick = cargarMasPartidas;

    const matchHistorySection = matchesContainer.closest(".match-history");
    if (matchHistorySection) {
      matchHistorySection.appendChild(verMasBtn);
    } else {
      matchesContainer.parentNode.appendChild(verMasBtn);
    }

    console.log("Botón 'Ver más' creado");
  }

  if (matchesLoaded < matchesPerLoad) {
    verMasBtn.style.display = "none";
  } else {
    verMasBtn.style.display = "block";
  }
}

function traducirQueueId(queueId) {
  const queueData = {
    420: { map: "Summoner's Rift", mode: "Ranked Solo/Duo", short: "Solo/Duo" },
    430: { map: "Summoner's Rift", mode: "Normal Blind", short: "Normal" },
    440: { map: "Summoner's Rift", mode: "Ranked Flex", short: "Flex" },
    450: { map: "Howling Abyss", mode: "ARAM", short: "ARAM" },
    490: {
      map: "Summoner's Rift",
      mode: "Normal (Quickplay)",
      short: "Partida rápida",
    },
    700: { map: "Summoner's Rift", mode: "Clash", short: "Clash" },
    720: { map: "Howling Abyss", mode: "ARAM Clash", short: "ARAM Clash" },
    830: { map: "Summoner's Rift", mode: "Co-op vs AI", short: "Co-op" },
    840: { map: "Summoner's Rift", mode: "Co-op vs AI", short: "Co-op" },
    850: { map: "Summoner's Rift", mode: "Co-op vs AI", short: "Co-op" },
    900: { map: "Summoner's Rift", mode: "ARURF", short: "ARURF" },
    910: { map: "Crystal Scar", mode: "Ascension", short: "Ascension" },
    920: { map: "Howling Abyss", mode: "Poro King", short: "Poro King" },
    940: { map: "Summoner's Rift", mode: "Nexus Siege", short: "Siege" },
    950: { map: "Summoner's Rift", mode: "Doom Bots", short: "Doom Bots" },
    960: { map: "Summoner's Rift", mode: "Doom Bots", short: "Doom Bots" },
    980: {
      map: "Valoran City Park",
      mode: "Star Guardian",
      short: "Star Guardian",
    },
    990: {
      map: "Valoran City Park",
      mode: "Star Guardian",
      short: "Star Guardian",
    },
    1000: { map: "Overcharge", mode: "PROJECT Hunters", short: "PROJECT" },
    1010: { map: "Summoner's Rift", mode: "Snow ARURF", short: "Snow ARURF" },
    1020: { map: "Summoner's Rift", mode: "One for All", short: "One for All" },
    1030: { map: "Crash Site", mode: "Odyssey", short: "Odyssey" },
    1040: { map: "Crash Site", mode: "Odyssey", short: "Odyssey" },
    1050: { map: "Crash Site", mode: "Odyssey", short: "Odyssey" },
    1060: { map: "Crash Site", mode: "Odyssey", short: "Odyssey" },
    1070: { map: "Crash Site", mode: "Odyssey", short: "Odyssey" },
    1090: { map: "Convergence", mode: "TFT Normal", short: "TFT" },
    1100: { map: "Convergence", mode: "TFT Ranked", short: "TFT Ranked" },
    1200: { map: "Nexus Blitz", mode: "Nexus Blitz", short: "Blitz" },
    1300: { map: "Nexus Blitz", mode: "Nexus Blitz", short: "Blitz" },
    1400: {
      map: "Summoner's Rift",
      mode: "Ultimate Spellbook",
      short: "Spellbook",
    },
    1700: { map: "Rings of Wrath", mode: "Arena", short: "Arena" },
    1710: { map: "Rings of Wrath", mode: "Arena (16p)", short: "Arena 16p" },
    1810: { map: "Swarm", mode: "Swarm (1p)", short: "Swarm" },
    1820: { map: "Swarm", mode: "Swarm (2p)", short: "Swarm" },
    1830: { map: "Swarm", mode: "Swarm (3p)", short: "Swarm" },
    1840: { map: "Swarm", mode: "Swarm (4p)", short: "Swarm" },
    1900: { map: "Summoner's Rift", mode: "Pick URF", short: "URF" },
    2000: { map: "Summoner's Rift", mode: "Tutorial", short: "Tutorial" },
    2010: { map: "Summoner's Rift", mode: "Tutorial", short: "Tutorial" },
    2020: { map: "Summoner's Rift", mode: "Tutorial", short: "Tutorial" },
    2300: { map: "The Bandlewood", mode: "Brawl", short: "Brawl" },
    2400: { map: "Howling Abyss", mode: "ARAM: Mayhem", short: "ARAM Mayhem" },
  };

  return (
    queueData[queueId] || {
      map: "Desconocido",
      mode: `Queue ${queueId}`,
      short: `Q${queueId}`,
    }
  );
}

function getTimeAgo(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) return `hace ${diffMins} minutos`;
  if (diffHours < 24) return `hace ${diffHours} horas`;
  if (diffDays < 7) return `hace ${diffDays} días`;
  return `hace ${Math.floor(diffDays / 7)} semanas`;
}

function actualizarBotonVerMas() {
  let matchesContainer = document.querySelector(".matches");
  let verMasBtn = document.querySelector(".ver-mas-btn");

  if (!verMasBtn) {
    verMasBtn = document.createElement("button");
    verMasBtn.className = "ver-mas-btn";
    verMasBtn.textContent = "Ver más partidas";
    verMasBtn.onclick = cargarMasPartidas;

    matchesContainer.parentNode.appendChild(verMasBtn);
  }
}
