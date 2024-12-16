import { getEnvironmentConfig } from './config/path.js';

const config = getEnvironmentConfig();
const BASE_PATH = config.basePath;
const loader = document.querySelector('.loader-container');
const toggleButton = document.getElementById("toggleButton");
const sidebar = document.getElementById("sidebar-container");
const profileContainer = document.getElementById("profile-container");
const navbar = document.getElementById("navbar");
const mainLayout = document.getElementById("main-layout");
const dropdownMenuItems = document.querySelectorAll('.account-container li');

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

    dropdownMenuItems.forEach(item => {
        item.addEventListener('click', async (e) => {
            const pageName = item.textContent.trim().toLowerCase();
            const dropdownMenu = document.getElementById('dropdown-menu-settings');
            const dropdownList = document.getElementById('dropdown-list');
            
            if (dropdownMenu) dropdownMenu.classList.add('hidden');
            if (dropdownList) dropdownList.style.display = 'none';

            sidebar.classList.add("closed");
            updateLayout();
            
            hideLoader();
            void loader.offsetWidth;
            showLoader();
            
            await loadContent(pageName);
            links.forEach(link => link.classList.remove("active"));
        });
    });

    async function loadContent(page, isComponent = false) {
        hideLoader();
        void loader.offsetWidth;
        showLoader();

        try {
            if (isComponent) {
                const response = await fetch(`${BASE_PATH}/components/${page}.html`);
                if (!response.ok) throw new Error(`Failed to load ${page} component`);
                
                const content = await response.text();
                contentArea.innerHTML = content;
                
                if (page === 'compiler') {
                    const { initialize: compilerInitialize } = await import(`${BASE_PATH}/components/js/compiler.js`);
                    if (compilerInitialize) await compilerInitialize();
                } else {
                    const { initialize } = await import(`${BASE_PATH}/components/js/${page}.js`);
                    if (initialize) await initialize();
                }
            } else {
                const pagePath = getPagePath(page);
                const scriptPath = getScriptPath(page);
                const response = await fetch(pagePath);
                
                if (response.ok) {
                    const content = await response.text();
                    contentArea.innerHTML = content;
                    
                    try {
                        const module = await import(scriptPath);
                        if (module.initialize) await module.initialize();
                    } catch (error) {
                        console.warn(`No script found for ${page}:`, error);
                    }
                } else {
                    contentArea.innerHTML = '<p>Error loading content. Please try again later.</p>';
                }
            }
            setupEventListeners();
        } catch (error) {
            console.error("Error fetching content:", error);
            contentArea.innerHTML = '<p>Error loading content. Please try again later.</p>';
        } finally {
            setTimeout(() => hideLoader(), 1000);
        }
    }

    function getPagePath(page) {
        const segments = page.split('/');
        if (segments[0] === 'settings') return `${BASE_PATH}/settings/pages/${segments[1]}.html`;
        if (page === 'account') return `${BASE_PATH}/components/account.html`;
        return `${BASE_PATH}/pages/${page}.html`;
    }

    function getScriptPath(page) {
        const segments = page.split('/');
        if (segments[0] === 'settings') return `${BASE_PATH}/settings/js/${segments[1]}.js`;
        if (page === 'account') return `${BASE_PATH}/components/js/account.js`;
        return `${BASE_PATH}/js/${page}.js`;
    }

    function setupEventListeners() {
        const createReplButtons = document.querySelectorAll('.create-repl-btn,.action-icons[data-page="create-repl"]');
        createReplButtons.forEach(button => {
            button.removeEventListener('click', handleCreateReplClick);
            button.addEventListener('click', handleCreateReplClick);
        });
    }

    async function handleCreateReplClick(e) {
        e.preventDefault();
        sidebar.classList.add("closed");
        updateLayout();
        
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
            
            sidebar.classList.add("closed");
            updateLayout();
            
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
    const navbarCenter = navbar.querySelector(".navbar-center");
    const navbarRight = navbar.querySelector(".navbar-right");

    mainLayout.classList.toggle('sidebar-closed', isClosed);
    toggleButton.setAttribute("aria-expanded", !isClosed);
    toggleButton.classList.toggle("open", !isClosed);

    if (isMobile) {
        navbar.classList.toggle("open", !isClosed);
        profileContainer.classList.add("hidden");

        if (isClosed) {
            navbarCenter.style.display = "flex";
            navbarRight.style.display = "flex";
            profileContainer.style.display = "none";
        } else {
            navbarCenter.style.display = "none";
            navbarRight.style.display = "none";
            profileContainer.style.display = "flex";
        }
    } else {
        navbar.classList.remove("open");
        profileContainer.style.display = "";
        navbarCenter.style.display = "";
        navbarRight.style.display = "";
    }
}

toggleButton.addEventListener("click", () => {
    sidebar.classList.toggle("closed");
    updateLayout();
});

window.addEventListener('resize', () => updateLayout());

document.addEventListener("DOMContentLoaded", async () => {
    showLoader();
    try {
        await loadPage();
        updateLayout();
    } catch (error) {
        console.error("Error initializing application:", error);
    }
});

window.addEventListener('load', () => hideLoader());