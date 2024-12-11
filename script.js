async function loadPage() {
  const links = document.querySelectorAll(".nav-link");
  const contentArea = document.getElementById("content-area");

  async function loadContent(page) {
    const url = `/pages/${page}.html`;
    const scriptUrl = `/js/${page}.js`;
    try {
        const response = await fetch(url);
        if (response.ok) {
            const content = await response.text();
            contentArea.innerHTML = content;
            await loadScript(scriptUrl);
        } else {
            contentArea.innerHTML = '<p>Error loading content. Please try again later.</p>';
        }
    } catch (error) {
        console.error("Error fetching content:", error);
        contentArea.innerHTML = '<p>Error loading content. Please try again later.</p>';
    }
  }

  async function loadScript(scriptUrl) {
    try {
        const existingScript = document.querySelector(`script[src="${scriptUrl}"]`);
        if (existingScript) {
            existingScript.remove();
        }
        const module = await import(scriptUrl);
        if (module.initialize) {
            module.initialize();
        }
    } catch (error) {
        console.error(`Error loading ${scriptUrl}:`, error);
    }
  }

  const defaultPage = "home";
  await loadContent(defaultPage);

  links.forEach(link => {
    const page = link.getAttribute("data-page");
    if (page === defaultPage) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });

  links.forEach(link => {
    link.addEventListener("click", async (e) => {
      e.preventDefault();
      const page = link.getAttribute("data-page");
      await loadContent(page);

      links.forEach(link => link.classList.remove("active"));
      link.classList.add("active");
    });
  });
}

const toggleButton = document.getElementById("toggleButton");
const sidebar = document.getElementById("sidebar-container");
const profileContainer = document.getElementById("profile-container");
const navbar = document.getElementById("navbar");
const mainLayout = document.getElementById("main-layout");

profileContainer.addEventListener("click", () => {
  const dropdownList = document.getElementById("dropdown-list");

  if (dropdownList.style.display === "block") {
    dropdownList.style.display = "none";
  } else {
    dropdownList.style.display = "block";
  }
});

document.addEventListener("click", (event) => {
  const dropdownList = document.getElementById("dropdown-list");
  if (!profileContainer.contains(event.target) && !dropdownList.contains(event.target)) {
    dropdownList.style.display = "none";
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const profileIconRight = document.querySelector('.profile-icon-right');
  const dropdownMenu = document.getElementById('dropdown-menu-settings');

  profileIconRight.addEventListener('click', () => {
    dropdownMenu.classList.toggle('hidden');
  });

  document.addEventListener('click', (event) => {
    if (!profileIconRight.contains(event.target) && !dropdownMenu.contains(event.target)) {
      dropdownMenu.classList.add('hidden');
    }
  });
});

function updateLayout() {
  const isClosed = sidebar.classList.contains("closed");
  const isMobile = window.innerWidth <= 768;

  mainLayout.style.gridTemplateColumns = isClosed ? "0 1fr" : "240px 1fr";
  toggleButton.setAttribute("aria-expanded", !isClosed);
  toggleButton.classList.toggle("open", !isClosed);

  const navbarCenter = navbar.querySelector(".navbar-center");
  const navbarRight = navbar.querySelector(".navbar-right");

  if (isMobile) {
    navbar.classList.toggle("open", !isClosed);
    profileContainer.classList.add("hidden");

    if (isClosed) {
      navbarCenter.style.display = "flex";
      navbarRight.style.display = "flex";
    } else {
      navbarCenter.style.display = "none";
      navbarRight.style.display = "none";
    }
  } else {
    navbar.classList.remove("open");
    profileContainer.classList.toggle("hidden", isClosed);

    navbarCenter.style.display = "";
    navbarRight.style.display = "";
  }
}

toggleButton.addEventListener("click", () => {
  sidebar.classList.toggle("closed");
  updateLayout();
});

document.addEventListener("DOMContentLoaded", async () => {
  await loadPage();
  updateLayout();
});
