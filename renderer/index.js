const buttons = document.querySelectorAll(".nav-item");
const title = document.getElementById("view-title");
const view = document.getElementById("view");

const titles = {
  profile: "Perfil",
  matchups: "Matchups",
  pool: "Champion Pool",
};

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    if (button.classList.contains("active")) return;

    buttons.forEach((b) => b.classList.remove("active"));
    button.classList.add("active");

    const viewKey = button.dataset.view;

    // Fade out
    view.classList.remove("active");

    setTimeout(() => {
      title.textContent = titles[viewKey];

      // Fade in
      view.classList.add("active");
    }, 200);
  });
});
