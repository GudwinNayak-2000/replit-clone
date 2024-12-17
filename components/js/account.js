let contentDiv;
let sidebarLinks;
let mobileDropdown;

async function loadContent(page) {
    try {
        const response = await fetch(`../../settings/pages/${page}.html`);
        const content = await response.text();
        contentDiv.innerHTML = content;
        updateActiveStates(page);

        try {
            const module = await import(`../../settings/js/${page}.js`);
            if (module.initialize) {
                await module.initialize();
            }
        } catch (error) {
            console.warn(`No script found for ${page}:`, error);
        }
    } catch (error) {
        contentDiv.innerHTML = '<h2>Error loading content</h2>';
        console.error('Error loading content:', error);
    }
}

function updateActiveStates(page) {
    // Update sidebar active state
    sidebarLinks.forEach(link => {
        if (link.getAttribute('data-page') === page) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // Update mobile dropdown
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
    // Sidebar links
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
    // Create wrapper
    const dropdownWrapper = document.createElement('div');
    dropdownWrapper.className = 'mobile-nav-wrapper';

    // Create custom select
    const customSelect = document.createElement('div');
    customSelect.className = 'custom-select';

    // Create selected display
    const selectedDisplay = document.createElement('div');
    selectedDisplay.className = 'selected-display';
    
    // Get first link's content for initial display
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

    // Create options from sidebar links
    sidebarLinks.forEach(link => {
        const option = document.createElement('div');
        option.className = 'select-option';
        option.innerHTML = link.innerHTML; // This preserves both SVG and text
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

    // Insert dropdown before content div
    contentDiv.parentNode.insertBefore(dropdownWrapper, contentDiv);
    return dropdownWrapper;
}

export function initialize() {
    contentDiv = document.querySelector('.account-content');
    sidebarLinks = document.querySelectorAll('.account-sidebar-links li');
    
    // Create and initialize mobile dropdown
    mobileDropdown = createMobileDropdown();
    
    // Attach all navigation listeners
    attachNavigationListeners();
    
    // Load initial content
    loadContent('profile');
    console.log("Account page initialized");
}