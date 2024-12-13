import { getEnvironmentConfig } from '../../config/path.js';
const config = getEnvironmentConfig();

async function loadHomeContent() {
    try {
        const response = await fetch(`${config.basePath}/pages/home.html`);
        if (response.ok) {
            const content = await response.text();
            const homeContent = document.getElementById('home-page');
            if (homeContent) {
                homeContent.innerHTML = content;
                await import(`${config.basePath}/js/home.js`)
                    .then(module => {
                        if (module.initialize) {
                            module.initialize();
                        }
                    });
            }
        }
    } catch (error) {
        console.error('Error loading home content:', error);
    }
}

function switchTabs() {
    const tabs = document.querySelectorAll('.tab');
    const contents = document.querySelectorAll('.tab-content');

    tabs[0]?.classList.add('active');
    contents[0]?.classList.remove('hidden');
    
    loadHomeContent();

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(content => content.classList.add('hidden'));
            tab.classList.add('active');
            const activeTab = tab.getAttribute('data-tab');
            document.getElementById(activeTab).classList.remove('hidden');
            if (activeTab === 'tab1') {
                loadHomeContent();
            }
        });
    });
}

function switchGithubTabs(){
    const githubTabs = document.querySelectorAll('.import-github-tab');
    const githubTabContents = document.querySelectorAll('.import-github-tab-content');

    githubTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            githubTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const tabId = tab.getAttribute('data-tab');
            githubTabContents.forEach(content => {
                content.classList.add('hidden');
            });
            document.getElementById(tabId).classList.remove('hidden');
        });
    });
}
async function searchTemplates() {
    let data;
    try {
        const response = await fetch(`${config.basePath}/data/templates.json`);
        const jsonData = await response.json();
        data = jsonData.templates;
    } catch (error) {
        console.error('Error loading templates:', error);
        data = [];
    }

    const searchInput = document.getElementById('template-search');
    const resultsContainer = document.getElementById('template-results');

    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase();
        resultsContainer.innerHTML = '';

        if (query) {
            const filteredData = data.filter(item => 
                item.name.toLowerCase().includes(query)
            );

            filteredData.forEach(item => {
                const div = document.createElement('div');
                div.classList.add('template-result-item');

                const img = document.createElement('img');
                img.src = item.icon;
                img.alt = item.name;

                const span = document.createElement('span');
                span.textContent = item.name;

                div.appendChild(img);
                div.appendChild(span);

                div.addEventListener('click', () => {
                    resultsContainer.innerHTML = '';
                    searchInput.value = item.name;
                    searchInput.style.paddingLeft = '30px';
                    searchInput.style.backgroundImage = `url(${item.icon})`;
                    searchInput.style.backgroundRepeat = 'no-repeat';
                    searchInput.style.backgroundPosition = '5px center';
                    searchInput.style.backgroundSize = '20px 20px';
                });

                resultsContainer.appendChild(div);
            });
        }
        
        if (!query) {
            searchInput.style.backgroundImage = '';
            searchInput.style.paddingLeft = '';
        }
    });
}

async function initialize() {
    try {
        switchTabs();
        switchGithubTabs();
        searchTemplates();
    } catch (error) {
        console.error('Error initializing repls:', error);
    }
}

export { initialize };