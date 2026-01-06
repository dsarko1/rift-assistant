window.testSummoner = async () => {
  const data = await window.riotAPI.getSummoner();
  console.log(data);
};

const buttons = document.querySelectorAll(".nav-item");
const view = document.getElementById("view");

const views = {
  profile: `
    <section class="profile-layout">
      <div class="profile-card">
        <div class="avatar"></div>
        <div class="profile-info">
          <h2>Nombre del Invocador</h2>
          <p>Nivel 123</p>
          <span class="rank">Oro IV</span>
        </div>
      </div>

      <div class="match-history">
        <h3>Historial de partidas</h3>

        <div class="match-card"></div>
        <div class="match-card"></div>
        <div class="match-card"></div>
      </div>
    </section>
  `,

  matchups: `
    <section class="placeholder">
      <h2>Matchups</h2>
      <p>Acá va el análisis de enfrentamientos.</p>
    </section>
  `,

  pool: `
    <section class="placeholder">
      <h2>Champion Pool</h2>
      <p>Acá vas a gestionar tus campeones.</p>
    </section>
  `,
};

function loadView(key) {
  view.classList.remove("active");

  setTimeout(() => {
    view.innerHTML = views[key];
    view.classList.add("active");
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

// Vista inicial
loadView("profile");

async function cargarPerfil() {
  try {
    const account = await window.riotAPI.getSummoner("matiasbarraza777#darko");
    const summoner = await window.riotAPI.getSummonerV4(account.puuid);

    document.getElementById("riot-name").textContent = account.gameName;
    document.getElementById("riot-tag").textContent = `#${account.tagLine}`;
    document.getElementById("riot-level").textContent =
      "Nivel " + summoner.summonerLevel;
    document.getElementById(
      "riot-icon"
    ).src = `https://ddragon.leagueoflegends.com/cdn/13.14.1/img/profileicon/${summoner.profileIconId}.png`;
  } catch (error) {
    console.error(error);
  }
}

cargarPerfil();
