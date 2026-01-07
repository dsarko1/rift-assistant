window.testSummoner = async () => {
  const data = await window.riotAPI.getSummoner("EJEMPLO#TAG");
  console.log(data);
};

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

    console.log("1. Obteniendo cuenta...");
    const account = await window.riotAPI.getSummoner(`${gameName}#${tag}`);
    const puuid = account.puuid;
    console.log("PUUID obtenido:", puuid);

    console.log("2. Obteniendo summoner info...");
    const summoner = await window.riotAPI.getSummonerV4(puuid, region);
    console.log("Summoner obtenido:", summoner);

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
    const ranked = await window.riotAPI.getRanked(puuid, region);
    console.log("Ranked recibido:", ranked);

    let rankText = "Unranked";

    if (Array.isArray(ranked) && ranked.length > 0) {
      const soloQ = ranked.find((q) => q.queueType === "RANKED_SOLO_5x5");

      if (soloQ) {
        rankText = `${soloQ.tier} ${soloQ.rank} (${soloQ.leaguePoints} LP)`;
        console.log("Rank encontrado:", rankText);
      } else {
        rankText = "No tiene ranked solo/duo";
        console.log("No hay ranked solo:", ranked);
      }
    } else {
      console.log("Ranked vacío o no array:", ranked);
    }

    document.getElementById("riot-rank").textContent = rankText;
    console.log("¡Todo completado!");
  } catch (err) {
    console.error("Error completo en cargarPerfil:", err);
    document.getElementById("riot-rank").textContent = "Error al cargar ranked";
  }
}
