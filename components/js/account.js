let contentDiv;
let sidebarLinks;
let mobileDropdown;

import { getEnvironmentConfig } from '../../config/path.js';

const config = getEnvironmentConfig();
const { basePath, paths } = config;

async function loadContent(page) {
    try {
        const htmlPath = `${basePath}/settings/pages/${page}.html`;
        const jsPath = `${basePath}/settings/js/${page}.js`;

        console.log('Attempting to fetch:', htmlPath);

        const response = await fetch(htmlPath);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const content = await response.text();
        contentDiv.innerHTML = content;
        updateActiveStates(page);

        try {
            console.log('Attempting to load JS:', jsPath);
            
            const module = await import(jsPath);
            if (module.initialize) {
                await module.initialize();
            }
        } catch (error) {
            console.warn(`No script found for ${page}:`, error);
        }
    } catch (error) {
        console.error('Error loading content:', error);
        contentDiv.innerHTML = `
            <div class="error-container">
                <h2>Error Loading Content</h2>
                <p>Failed to load: ${page}</p>
                <p>Error: ${error.message}</p>
                <p>Path attempted: ${basePath}/settings/pages/${page}.html</p>
            </div>
        `;
    }
}

function updateActiveStates(page) {
    sidebarLinks.forEach(link => {
        if (link.getAttribute('data-page') === page) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    if (mobileDropdown) {
        const selectedOption = mobileDropdown.querySelector('.selected-display');
        const matchingLink = Array.from(sidebarLinks).find(link => 
            link.getAttribute('data-page') === page
        );
        
        if (matchingLink && selectedOption) {
            selectedOption.innerHTML = matchingLink.innerHTML;
        }
    }
}

function attachNavigationListeners() {
    sidebarLinks.forEach(link => {
        const newLink = link.cloneNode(true);
        link.parentNode.replaceChild(newLink, link);
        
        newLink.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            if (page) loadContent(page);
        });
    });
}

function createMobileDropdown() {
    const dropdownWrapper = document.createElement('div');
    dropdownWrapper.className = 'mobile-nav-wrapper';

    const customSelect = document.createElement('div');
    customSelect.className = 'custom-select';

    const selectedDisplay = document.createElement('div');
    selectedDisplay.className = 'selected-display';
    
    const firstLink = sidebarLinks[0];
    selectedDisplay.innerHTML = `
        <div class="selected-item">
            ${firstLink.innerHTML}
        </div>
        <svg class="dropdown-arrow" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 15.25l-8.5-8.5 1.5-1.5 7 7 7-7 1.5 1.5z"/>
        </svg>
    `;

    // Create options list
    const optionsList = document.createElement('div');
    optionsList.className = 'select-options';

    sidebarLinks.forEach(link => {
        const option = document.createElement('div');
        option.className = 'select-option';
        option.innerHTML = link.innerHTML; 
        option.setAttribute('data-page', link.getAttribute('data-page') || '');
        
        option.addEventListener('click', () => {
            const page = option.getAttribute('data-page');
            if (page) {
                loadContent(page);
                selectedDisplay.querySelector('.selected-item').innerHTML = option.innerHTML;
                optionsList.classList.remove('show');
            }
        });

        optionsList.appendChild(option);
    });

    // Toggle dropdown
    selectedDisplay.addEventListener('click', (e) => {
        e.stopPropagation();
        optionsList.classList.toggle('show');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
        optionsList.classList.remove('show');
    });

    customSelect.appendChild(selectedDisplay);
    customSelect.appendChild(optionsList);
    dropdownWrapper.appendChild(customSelect);

    contentDiv.parentNode.insertBefore(dropdownWrapper, contentDiv);
    return dropdownWrapper;
}

export function initialize() {
    contentDiv = document.querySelector('.account-content');
    sidebarLinks = document.querySelectorAll('.account-sidebar-links li');
    
    mobileDropdown = createMobileDropdown();
    
    attachNavigationListeners();
    
    loadContent('profile');
    console.log("Account page initialized");
}