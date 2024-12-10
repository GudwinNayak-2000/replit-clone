document.addEventListener("DOMContentLoaded", () => {
    const themeSelector = document.getElementById("themeSelector");
  
    // Check for saved theme in localStorage
    const savedTheme = localStorage.getItem("theme") || "light-theme"; // Default to light theme
    document.body.classList.add(savedTheme);
    themeSelector.value = savedTheme; // Set dropdown to match the saved theme
  
    // Change theme when the user selects a new option
    themeSelector.addEventListener("change", (e) => {
      const selectedTheme = e.target.value;
  
      // Remove all existing theme classes
      document.body.classList.remove("light-theme", "dark-theme", "spooky-theme");
  
      // Add the selected theme class
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
  