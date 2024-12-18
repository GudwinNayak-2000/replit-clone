
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
                1200: { slidesPerView: 4 }
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

        const swiper = await initializeSwiper();
        
        
        window.dispatchEvent(new CustomEvent('bountiesInitialized'));

    } catch (error) {
        console.error('Error during initialization:', error);
    }
}

export { 
    initialize,
    initializeTabs,
    initializeSwiper
};