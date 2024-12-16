// settings/js/account.js
const contentDiv = document.querySelector('.account-content');
const sidebarLinks = document.querySelectorAll('.account-sidebar-links li');

async function loadContent(page) {
    try {
        // Load HTML content
        const response = await fetch(`../../settings/pages/${page}.html`);
        const content = await response.text();
        contentDiv.innerHTML = content;

        // Try to load and initialize the associated script
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

sidebarLinks.forEach(link => {
    link.addEventListener('click', function() {
        sidebarLinks.forEach(l => l.classList.remove('active'));
        this.classList.add('active');
        
        const page = this.getAttribute('data-page');
        loadContent(page);
    });
});

export function initialize() {
    loadContent('profile');
    console.log("Account page initialized");
}