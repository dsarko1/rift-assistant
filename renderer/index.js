const buttons = document.querySelectorAll(".nav-item");
const view = document.getElementById("view");

const views = {
  profile: `
    <section class="profile-layout">
      <div class="profile-card">
        <div class="avatar"></div>
        <div class="profile-info">
          <h2>matiasbarraza777#LAS</h2>
          <p>Nivel 371</p>
          <span class="rank">Esmeralda III</span>
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
      <p>matchup analysis y demás.</p>
    </section>
  `,

  pool: `
    <section class="placeholder">
      <h2>Champion Pool</h2>
      <p>champion pool para recomendaciones, etc.</p>
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
