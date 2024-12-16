document.addEventListener("DOMContentLoaded", () => {
  const themeSelector = document.getElementById("themeSelector");

  const savedTheme = localStorage.getItem("theme") || "light-theme";
  document.body.classList.add(savedTheme);
  themeSelector.value = savedTheme;

  themeSelector.addEventListener("change", (e) => {
    const selectedTheme = e.target.value;

    document.body.classList.remove("light-theme", "dark-theme", "spooky-theme");
      if (selectedTheme === "replit-light") {
      document.body.classList.add("light-theme");
      localStorage.setItem("theme", "light-theme");
    } else if (selectedTheme === "replit-dark") {
      document.body.classList.add("dark-theme");
      localStorage.setItem("theme", "dark-theme");
    } else if (selectedTheme === "replit-spooky") {
      document.body.classList.add("spooky-theme");
      localStorage.setItem("theme", "spooky-theme");
    }
  });
});
