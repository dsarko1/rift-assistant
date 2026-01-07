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
        <div class="profile-icon">
          <img id="riot-icon" alt="Profile Icon" />
        </div>

        <div class="profile-info">
          <h2 id="riot-name">Invocador</h2>
          <p id="riot-tag">#tag</p>
          <p id="riot-level">Nivel</p>
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
  if (!views[key]) return;

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
