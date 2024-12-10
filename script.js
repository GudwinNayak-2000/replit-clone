import modal from "./js/modal.js";

async function loadComponent(url, placeholderId) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load ${url}: ${response.status}`);
    }
    const content = await response.text();
    document.getElementById(placeholderId).innerHTML = content;

    if (placeholderId === "modal-container") {
      modal("modal-container");
    }
    if (placeholderId === "navbar-container") {
      navbar("navbar-container");
    }
  } catch (error) {
    console.error(error);
  }
}
async function loadPage() {
  const links = document.querySelectorAll('.nav-link');
  const contentArea = document.getElementById('content-area');
  links.forEach(link=>{
    link.addEventListener('click',async(e)=>{
      e.preventDefault();
      const page = link.getAttribute('data-page');
      const url = `/pages/${page}.html`;
      try {
        const response = await fetch(url);
        if(response.ok){
          const content = await response.text();
          contentArea.innerHTML = content;
        }else{
          contentArea.innerHTML = '<p>Error loading content. Please try again later.</p>';
        }
      } catch (error) {
        console.error('Error fetching content:', error);
        contentArea.innerHTML = '<p>Error loading content. Please try again later.</p>';
      }
      links.forEach(link => link.classList.remove('active'));
      link.classList.add('active');
    })
  })

}
const toggleButton = document.getElementById("toggleButton");
const sidebar = document.getElementById("sidebar-container");
const profileContainer = document.getElementById("profile-container");
const navbar = document.getElementById("navbar");
const mainLayout = document.getElementById("main-layout");

function updateLayout() {
  const isClosed = sidebar.classList.contains("closed");
  const isMobile = window.innerWidth <= 768;

  mainLayout.style.gridTemplateColumns = isClosed ? "0 1fr" : "240px 1fr";
  toggleButton.setAttribute("aria-expanded", !isClosed);
  toggleButton.classList.toggle("open", !isClosed);

  if (isMobile) {
    navbar.classList.toggle("open", !isClosed);
    profileContainer.classList.add("hidden");

    const navbarCenter = navbar.querySelector(".navbar-center");
    const navbarRight = navbar.querySelector(".navbar-right");

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

    const navbarCenter = navbar.querySelector(".navbar-center");
    const navbarRight = navbar.querySelector(".navbar-right");
    navbarCenter.style.display = "";
    navbarRight.style.display = "";
  }
}


window.addEventListener("resize", updateLayout);

updateLayout();

toggleButton.addEventListener("click", () => {
  sidebar.classList.toggle("closed");
  updateLayout();
});

document.addEventListener("DOMContentLoaded", () => {
  loadComponent("components/modal.html", "modal-container");
  loadComponent("components/navbar.html", "navbar-container");
  loadPage();
});
