class SwiperController {
    static updateNavigationVisibility(swiper) {
        const { isBeginning, isEnd } = swiper;
        const prevButton = document.querySelector('.swiper-button-prev');
        const nextButton = document.querySelector('.swiper-button-next');

        if (prevButton) {
            prevButton.style.display = isBeginning ? 'none' : 'flex';
        }
        if (nextButton) {
            nextButton.style.display = isEnd ? 'none' : 'flex';
        }

        if (swiper.slides.length <= swiper.params.slidesPerView) {
            if (prevButton) prevButton.style.display = 'none';
            if (nextButton) nextButton.style.display = 'none';
        }
    }

    static get config() {
        return {
            slidesPerView: 1,
            spaceBetween: 20,
            loop: false,
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            breakpoints: {
                640: { slidesPerView: 2 },
                968: { slidesPerView: 3 },
                1200: { slidesPerView: 3 }
            },
            watchOverflow: true,
            observer: true,
            observeParents: true,
            on: {
                init: (swiper) => SwiperController.updateNavigationVisibility(swiper),
                slideChange: (swiper) => SwiperController.updateNavigationVisibility(swiper),
                resize: (swiper) => SwiperController.updateNavigationVisibility(swiper)
            }
        };
    }
}


function initializeTabs() {
    try {
        const tabs = document.querySelectorAll('.tab');
        const contents = document.querySelectorAll('.tab-content');

        if (!tabs.length || !contents.length) {
            console.warn('Tabs or content elements not found');
            return;
        }

        setActiveTab(tabs[0], contents[0]);

        tabs.forEach(tab => {
            tab.addEventListener('click', () => handleTabClick(tab, tabs, contents));
        });

    } catch (error) {
        console.error('Error initializing tabs:', error);
    }
}

function setActiveTab(activeTab, activeContent) {
    if (!activeTab || !activeContent) return;
    
    activeTab.classList.add('active');
    activeContent.classList.remove('hidden');
}
function toggleServicesContent() {
    try {
        const servicesHeader = document.querySelector('.services-header');
        const servicesContent = document.querySelector('.services-content');
        const dropdownArrow = document.querySelector('.dropdown-arrow');

        if (!servicesHeader || !servicesContent || !dropdownArrow) {
            console.warn('Required elements for services toggle not found');
            return;
        }

        servicesContent.style.display = 'block';
        dropdownArrow.style.transform = 'rotate(180deg)';

        servicesHeader.addEventListener('click', function() {
            const isHidden = servicesContent.style.display === 'block';
            
            servicesContent.style.display = isHidden ? 'none' : 'block';
            dropdownArrow.style.transform = isHidden ? 'rotate(0deg)' : 'rotate(180deg)';
        });

    } catch (error) {
        console.error('Error in toggleServicesContent:', error);
    }
}

document.addEventListener('DOMContentLoaded', toggleServicesContent);
function handleTabClick(clickedTab, allTabs, allContents) {
    try {
        allTabs.forEach(tab => tab.classList.remove('active'));
        allContents.forEach(content => content.classList.add('hidden'));

        clickedTab.classList.add('active');

        const activeTabId = clickedTab.getAttribute('data-tab');
        const activeContent = document.getElementById(activeTabId);
        
        if (!activeContent) {
            throw new Error(`Content not found for tab: ${activeTabId}`);
        }

        activeContent.classList.remove('hidden');

    } catch (error) {
        console.error('Error handling tab click:', error);
    }
}


function loadSwiperScript() {
    return new Promise((resolve, reject) => {
        if (window.Swiper) {
            resolve(window.Swiper);
            return;
        }

        const linkElement = document.createElement('link');
        linkElement.rel = 'stylesheet';
        linkElement.href = 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css';
        document.head.appendChild(linkElement);

        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js';
        script.async = true;
        
        script.onload = () => resolve(window.Swiper);
        script.onerror = () => reject(new Error('Failed to load Swiper'));
        
        document.body.appendChild(script);
    });
}


async function initializeSwiper() {
    try {
        const swiperElement = document.querySelector('.swiper');
        if (!swiperElement) {
            console.warn('Swiper element not found');
            return null;
        }

        await loadSwiperScript();

        return new window.Swiper('.swiper', SwiperController.config);

    } catch (error) {
        console.error('Error initializing Swiper:', error);
        return null;
    }
}


async function initialize() {
    try {
        initializeTabs();
        toggleServicesContent()

        const swiper = await initializeSwiper();
        
        
        window.dispatchEvent(new CustomEvent('bountiesInitialized'));

    } catch (error) {
        console.error('Error during initialization:', error);
    }
}

async function loadBountiesData() {
    try {
        const response = await fetch('/data/bounties.json');
        const data = await response.json();
        renderServices(data.services);
        renderBounties(data.bounties);
    } catch (error) {
        console.error('Error loading bounties data:', error);
    }
}

function renderServices(services) {
    const wrapper = document.getElementById('servicesWrapper');
    
    wrapper.innerHTML = services.map(service => `
        <div class="swiper-slide">
            <div class="service-card">
                <div class="service-image">
                    <img src="${service.image}" alt="${service.title}">
                </div>
                <div class="service-content">
                    <div class="service-price">
                        <span class="price">$${service.price.min} - $${service.price.max}</span>
                        <span class="views">${formatNumber(service.views.min)} - ${formatNumber(service.views.max)}</span>
                    </div>
                    <h3>${service.title}</h3>
                    <p>${service.description}</p>
                    <div class="service-provider">
                        <img src="${service.provider.image}" alt="${service.provider.name}">
                        <span>${service.provider.name}</span>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function renderBounties(bounties) {
    const container = document.getElementById('bountyCards');
    
    container.innerHTML = bounties.map(bounty => `
        <div class="bounty-history-card">
            <div class="bounty-history-top">
                <div class="bounty-history-top-left">
                    <h2>$${bounty.reward.toFixed(2)}</h2>
                    <p>
                        <svg>...</svg>
                        ${formatNumber(bounty.views)}
                    </p>
                </div>
                <div class="bounty-history-top-right">
                    <p>
                        <svg>...</svg>
                        due ${bounty.dueDate}
                    </p>
                    <label for="">${bounty.status}</label>
                </div>
            </div>
            <div class="bounty-history-center">
                <p class="bounty-title">${bounty.title}</p>
                <p class="bounty-desc">${bounty.description}</p>
            </div>
            <div class="bounty-history-end">
                <div>
                    <span>${bounty.author.initials}</span>
                    <span>${bounty.author.name}</span>
                    <span>.</span>
                    <span>${bounty.author.postedTime}</span>
                </div>
                <div>
                    <p>
                        <svg>...</svg>
                        ${bounty.applicants} Applicants
                    </p>
                </div>
            </div>
        </div>
    `).join('');
}

function formatNumber(num) {
    return num >= 1000 ? (num/1000).toFixed(0) + 'K' : num;
}

// Load data when page loads
document.addEventListener('DOMContentLoaded', loadBountiesData);

export { 
    initialize,
    initializeTabs,
    initializeSwiper,
};