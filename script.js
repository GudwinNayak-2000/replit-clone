const loader = document.querySelector('.loader-container');
const toggleButton = document.getElementById("toggleButton");
const sidebar = document.getElementById("sidebar-container");
const profileContainer = document.getElementById("profile-container");
const navbar = document.getElementById("navbar");
const mainLayout = document.getElementById("main-layout");

function showLoader() {
  if (loader) {
    loader.classList.remove('hidden');
    void loader.offsetWidth;
  }
}

function hideLoader() {
  if (loader) {
    loader.classList.add('hidden');
  }
}

async function loadPage() {
  const links = document.querySelectorAll(".nav-link");
  const contentArea = document.getElementById("content-area");

  async function loadContent(page, isComponent = false) {
    hideLoader();
    void loader.offsetWidth;
    showLoader();

    try {
      if (isComponent) {
        const response = await fetch(`/components/${page}.html`);
        if (!response.ok) {
          throw new Error(`Failed to load ${page} component`);
        }
        const content = await response.text();
        contentArea.innerHTML = content;
        
        const { initialize } = await import(`/components/js/${page}.js`);
        if (initialize) {
          await initialize();
        }
      } else {
        const url = `/pages/${page}.html`;
        const scriptUrl = `/js/${page}.js`;
        const response = await fetch(url);
        
        if (response.ok) {
          const content = await response.text();
          contentArea.innerHTML = content;
          await loadScript(scriptUrl);
        } else {
          contentArea.innerHTML = '<p>Error loading content. Please try again later.</p>';
        }
      }
      setupEventListeners();
    } catch (error) {
      console.error("Error fetching content:", error);
      contentArea.innerHTML = '<p>Error loading content. Please try again later.</p>';
    } finally {
      setTimeout(() => {
        hideLoader();
      },1000);
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
        await module.initialize();
      }
    } catch (error) {
      console.error(`Error loading ${scriptUrl}:`, error);
    }
  }

  function setupEventListeners() {
    const createReplButtons = document.querySelectorAll('.create-repl-btn');
    createReplButtons.forEach(button => {
      button.removeEventListener('click', handleCreateReplClick);
      button.addEventListener('click', handleCreateReplClick);
    });
  }

  async function handleCreateReplClick(e) {
    e.preventDefault();
    hideLoader();
    void loader.offsetWidth;
    showLoader();
    
    await loadContent('create-repl', true);
    
    links.forEach(link => {
      link.classList.toggle("active", link.getAttribute("data-page") === "create-repl");
    });
  }

  const defaultPage = "home";
  await loadContent(defaultPage);

  links.forEach(link => {
    const page = link.getAttribute("data-page");
    link.classList.toggle("active", page === defaultPage);
    
    link.addEventListener("click", async (e) => {
      e.preventDefault();
      const page = link.getAttribute("data-page");
      
      hideLoader();
      void loader.offsetWidth;
      showLoader();
      
      await loadContent(page);
      
      links.forEach(l => l.classList.toggle("active", l === link));
    });
  });

  setupEventListeners();
}

profileContainer.addEventListener("click", () => {
  const dropdownList = document.getElementById("dropdown-list");
  dropdownList.style.display = dropdownList.style.display === "block" ? "none" : "block";
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

  mainLayout.classList.toggle('sidebar-closed', isClosed);
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

window.addEventListener('resize', () => {
  updateLayout();
});

document.addEventListener("DOMContentLoaded", async () => {
  showLoader();
  try {
    await loadPage();
    updateLayout();
  } catch (error) {
    console.error("Error initializing application:", error);
  }
});

window.addEventListener('load', () => {
  hideLoader();
});