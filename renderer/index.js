const buttons = document.querySelectorAll(".nav-item");
const title = document.getElementById("view-title");

const titles = {
  profile: "Perfil",
  matchups: "Matchups",
  pool: "Champion Pool",
};

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    buttons.forEach((b) => b.classList.remove("active"));
    button.classList.add("active");

    const view = button.dataset.view;
    title.textContent = titles[view];
  });
});
