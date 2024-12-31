

import { getEnvironmentConfig, resolvePath } from '../config/path.js';

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

document.addEventListener('DOMContentLoaded', () => {
    window.pageLoader = new PageLoader();
});

window.addEventListener('error', (event) => {
    console.error('Resource loading error:', event.target);
    if (window.pageLoader) {
        window.pageLoader.hideLoader();
    }
});

async function loadCSS(page, isComponent = false) {
    try {
        const existingStyle = document.getElementById(`style-${page}`);
        if (existingStyle) {
            existingStyle.remove();
        }

        const cssPath = resolvePath(`css/${page}.css`);
        
        const response = await fetch(cssPath);
        if (response.ok) {
            const cssText = await response.text();
            const style = document.createElement('style');
            style.id = `style-${page}`;
            style.textContent = cssText;
            document.head.appendChild(style);
        }
    } catch (error) {
        console.warn(`CSS not found for ${page}:`, error);
    }
}

async function loadPage() {
    const links = document.querySelectorAll(".nav-link");
    const contentArea = document.getElementById("content-area");

    await Promise.all([
        loadCSS('home'),
        loadCSS('style'),
        loadCSS('repls'),
        loadCSS('deployments'),
        loadCSS('usage'),
        loadCSS('teams'),
        loadCSS('bounties'),
        loadCSS('learn'),
        loadCSS('documentation'),
        loadCSS('create-repl'),
        loadCSS('settings'),
        loadCSS('account'),
        loadCSS('profile'),
        loadCSS('compiler'),
        loadCSS('landing-page')

    ])
    dropdownMenuItems.forEach(item => {
        item.addEventListener('click', async (e) => {
            const pageName = item.textContent.trim().toLowerCase();
            const dropdownMenu = document.getElementById('dropdown-menu-settings');
            const dropdownList = document.getElementById('dropdown-list');
            
            if (dropdownMenu) dropdownMenu.classList.add('hidden');
            if (dropdownList) dropdownList.style.display = 'none';

            if (pageName === 'logout') {
                window.location.href = 'replit.html';
                return;
            }
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
                const response = await fetch(resolvePath(`../components/${page}.html`));
                if (!response.ok) throw new Error(`Failed to load ${page} component`);
                const content = await response.text();
                contentArea.innerHTML = content;

                            
                if (page === 'compiler') {
                    const { initialize: compilerInitialize } = await import(resolvePath(`/components/js/compiler.js`));
                    if (compilerInitialize) await compilerInitialize();
                } 
                else {
                    const { initialize } = await import(resolvePath(`/components/js/${page}.js`));
                    await loadCSS(`components/${page}`)
                    if (initialize) await initialize();
                }
            } else {
                const pagePath = getPagePath(page);
                const scriptPath = getScriptPath(page);
                const response = await fetch(resolvePath(pagePath));
                await loadCSS(page)
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
        if (!page) return resolvePath(`/pages/404.html`); 
        
        const segments = page.split('/').filter(Boolean); 
        const basePath = window.location.protocol === 'file:' ? '.' : BASE_PATH;
        
        switch(segments[0]) {
            case 'settings':
                return window.location.protocol === 'file:' 
                    ? `./settings/pages/${segments[1] || 'index'}.html`
                    : resolvePath(`/settings/pages/${segments[1] || 'index'}.html`);
            case 'account':
                return window.location.protocol === 'file:' 
                    ? './components/account.html'
                    : resolvePath(`/components/account.html`);
            case 'profile':
                return window.location.protocol === 'file:' 
                    ? './components/profile.html'
                    : resolvePath(`/components/profile.html`);
            default:
                return resolvePath(`/pages/${page}.html`);
        }
    }
    
    function getScriptPath(page) {
        if (!page) return null;
        
        const segments = page.split('/').filter(Boolean);

        switch(segments[0]) {
            case 'settings':
           return resolvePath(`/settings/js/${segments[1] || 'index'}.js`);
       case 'account':
           return resolvePath(`/components/js/account.js`);
       case 'profile':
            return resolvePath(`/components/js/profile.js`);
       default:
           return resolvePath(`/js/${page}.js`);
        }
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
            
            links.forEach(l => {
                l.classList.remove("active");
                l.style.backgroundColor = '';
            });
            link.classList.add("active");
            link.style.backgroundColor = 'var(--active-link-bg)'; 

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
const searchInput = document.getElementById('search-input');
const searchResults = document.querySelector('.search-results');

const items = [
    {
        title: 'BonyWastefulInstitutes',
        subtitle: 'edited 2 days ago',
        path: 'gudwinnayak4320/BonyWastefulInstitutes'
    },
    {
        title: 'PositiveCheerfulTaskscheduling',
        subtitle: 'edited 7 days ago',
        path: 'gudwinnayak4320/PositiveCheerfulTaskscheduling'
    }
];

searchInput.addEventListener('focus', () => {
    searchResults.classList.add('active');
    displayResults(items);
});

searchInput.addEventListener('input', (e) => {
    const value = e.target.value.toLowerCase();
    
    const filteredItems = items.filter(item => 
        item.title.toLowerCase().includes(value) || 
        item.path.toLowerCase().includes(value)
    );
    
    displayResults(filteredItems);
});

document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
        searchResults.classList.remove('active');
    }
});

document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === '.') {
        e.preventDefault();
        searchInput.focus();
    }
});

function displayResults(items) {
    if (items.length === 0) {
        searchResults.innerHTML = '<div class="search-item">No results found</div>';
        return;
    }

    searchResults.innerHTML = searchResults.innerHTML = `
    <div class="search-item">
        <div class="new-btn-container">
            <button class="new-btn">
                <svg preserveAspectRatio="xMidYMin" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" 
                    style="--size:12px;--rotate:0deg;width:12px;height:12px" aria-hidden="true" class="css-492dz9">
                    <path fill-rule="evenodd" 
                        d="M12 3.25a.75.75 0 0 1 .75.75v7.25H20a.75.75 0 0 1 0 1.5h-7.25V20a.75.75 0 0 1-1.5 0v-7.25H4a.75.75 0 0 1 0-1.5h7.25V4a.75.75 0 0 1 .75-.75Z" 
                        clip-rule="evenodd">
                    </path>
                </svg>
                New
            </button>
            <span class="new-btn-text">Create a new repl</span>
        </div>

        <div class="my-repls-container">
            <button class="my-repls-btn">
                <svg preserveAspectRatio="xMidYMin" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" 
                    aria-hidden="true" class="css-492dz9" style="--size: 16px; --rotate: 0deg; width: 16px; height: 16px;">
                    <path fill-rule="evenodd" 
                        d="M4 3.75A1.25 1.25 0 0 0 2.75 5v14A1.25 1.25 0 0 0 4 20.25h16A1.25 1.25 0 0 0 21.25 19V8A1.25 1.25 0 0 0 20 6.75h-9a.75.75 0 0 1-.624-.334L8.599 3.75H4Zm-1.945-.695A2.75 2.75 0 0 1 4 2.25h5a.75.75 0 0 1 .624.334l1.777 2.666H20A2.75 2.75 0 0 1 22.75 8v11A2.75 2.75 0 0 1 20 21.75H4A2.75 2.75 0 0 1 1.25 19V5c0-.73.29-1.429.805-1.945Z" 
                        clip-rule="evenodd">
                    </path>
                </svg>
                My Repls
            </button>
            <div class="my-repls-list">
                <div class="my-repls-item">
                    <div class="my-repls-item-title">
                        BonyWastefulInstitutes
                    </div>
                </div>
            </div>
        </div>
    </div>
`;
    
    searchResults.classList.add('active');
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


// Function to handle dropdown toggles
function setupDropdown(iconSelector, wrapperSelector) {
    const icon = document.querySelector(iconSelector);
    const wrapper = document.querySelector(wrapperSelector);

    if (!icon || !wrapper) return; // Guard clause if elements don't exist

    // Toggle dropdown on icon click
    icon.addEventListener('click', (e) => {
        e.stopPropagation();
        
        // Close all other dropdowns first
        document.querySelectorAll('.notification-wrapper, .help-wrapper').forEach(el => {
            if (el !== wrapper && !el.classList.contains('hidden')) {
                el.classList.add('hidden');
            }
        });

        wrapper.classList.toggle('hidden');
    });

    document.addEventListener('click', (e) => {
        if (!wrapper.contains(e.target) && !icon.contains(e.target)) {
            wrapper.classList.add('hidden');
        }
    });
}
setupDropdown('.notification-icon', '.notification-wrapper');
setupDropdown('.help-icon', '.help-wrapper');



class SnowEffect {
    constructor() {
        this.snowflakes = [];
        this.isSnowing = false;
        this.container = null;
        this.statusIndicator = null;
        this.statusTimeout = null;
        
        this.setupSnowToggle();
    }

    setupSnowToggle() {
        const snowButton = document.querySelector('.snow-button');
        snowButton.addEventListener('click', () => this.toggleSnow());
    }

    createSnowContainer() {
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.className = 'snow';
            document.body.appendChild(this.container);
        }
    }

    createSnowflake() {
        const snowflake = document.createElement('div');
        snowflake.className = 'snowflake';
        
        // Random properties
        const size = Math.random() * 4 + 2;
        const startX = Math.random() * window.innerWidth;
        const startY = -10;
        const speed = Math.random() * 2 + 1;
        const swing = Math.random() * 2 - 1;
        
        // Set initial position and size
        snowflake.style.width = `${size}px`;
        snowflake.style.height = `${size}px`;
        snowflake.style.left = `${startX}px`;
        snowflake.style.top = `${startY}px`;
        
        return { element: snowflake, x: startX, y: startY, speed, swing };
    }

    animateSnowflakes() {
        if (!this.isSnowing) return;

        this.snowflakes.forEach((snowflake, index) => {
            snowflake.y += snowflake.speed;
            snowflake.x += Math.sin(snowflake.y * 0.02) * snowflake.swing;
            
            snowflake.element.style.transform = `translate(${snowflake.x}px, ${snowflake.y}px)`;
            
            if (snowflake.y > window.innerHeight) {
                snowflake.element.remove();
                this.snowflakes.splice(index, 1);
            }
        });

        if (this.snowflakes.length < 100 && Math.random() > 0.8) {
            const newSnowflake = this.createSnowflake();
            this.container.appendChild(newSnowflake.element);
            this.snowflakes.push(newSnowflake);
        }

        requestAnimationFrame(() => this.animateSnowflakes());
    }

    createStatusIndicator(isActive = true) {
        if (this.statusTimeout) {
            clearTimeout(this.statusTimeout);
            this.statusTimeout = null;
        }

        if (this.statusIndicator) {
            this.statusIndicator.remove();
            this.statusIndicator = null;
        }

        this.statusIndicator = document.createElement('div');
        this.statusIndicator.className = `snow-status-indicator ${isActive ? 'active' : 'close'}`;
        this.statusIndicator.innerHTML = `
            <div class="status-content">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 1.5a.75.75 0 0 1 .75.75v1.697l1.241-.712a.75.75 0 0 1 .75 1.3L9.5 5.247V6.75h1.503l.712-1.241a.75.75 0 0 1 1.3.75L12.303 7.5H14a.75.75 0 0 1 0 1.5h-1.697l.712 1.241a.75.75 0 0 1-1.3.75L10.003 9.75H8.5v1.503l1.241.712a.75.75 0 0 1-.75 1.3L7.75 12.553V14a.75.75 0 0 1-1.5 0v-1.697l-1.241.712a.75.75 0 0 1-.75-1.3L5.5 10.503V9H3.997l-.712 1.241a.75.75 0 0 1-1.3-.75L2.697 8.5H1a.75.75 0 0 1 0-1.5h1.697l-.712-1.241a.75.75 0 0 1 1.3-.75L4.997 6.25H6.5V4.747L5.259 4.035a.75.75 0 0 1 .75-1.3L7.25 3.447V1.75A.75.75 0 0 1 8 1.5Z"/>
                </svg>
                <span>${isActive ? 'Snow Mode Active' : 'Snow Mode Disabled'}</span>
            </div>
        `;
        document.body.appendChild(this.statusIndicator);

        this.statusTimeout = setTimeout(() => {
            this.statusIndicator.classList.add('fade-out');
            setTimeout(() => {
                if (this.statusIndicator) {
                    this.statusIndicator.remove();
                    this.statusIndicator = null;
                }
            }, 500);
        }, 3000);
    }

    toggleSnow() {
        this.isSnowing = !this.isSnowing;
        
        if (this.isSnowing) {
            this.createSnowContainer();
            this.animateSnowflakes();
            this.createStatusIndicator(true);
        } else {
            if (this.container) {
                this.container.remove();
                this.container = null;
                this.snowflakes = [];
            }
            this.createStatusIndicator(false);
        }
        document.querySelector('.snow-button').classList.toggle('active');
    }
}

const snowEffect = new SnowEffect();