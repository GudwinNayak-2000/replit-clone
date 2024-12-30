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

async function loadTemplateData() {
    try {
        const res = await fetch('/data/data.json');
        const data = await res.json();
        const templateData = data?.categories?.template_page;

        if (!templateData) {
            console.error('Template page data not found');
            return;
        }

        updateHeaderContent(templateData);
        
        const cardSections = [
            {
                data: templateData.build_carousel_cards,
                container: '#build-swiper-wrapper',
                renderer: renderBuildCard
            },
            {
                data: templateData.languages_cards,
                container: '.language-card-container',
                renderer: renderLanguageCard,
                title: {
                    element: '.languages-title',
                    text: templateData.languages_title
                }
            },
            {
                data: templateData.ai_cards,
                container: '.ai-card-container',
                renderer: renderAiCard,
                title: {
                    element: '.ai-title',
                    text: templateData.ai_title
                }
            },
            {
                data: templateData.websites_cards,
                container: '.website-card-container',
                renderer: renderWebsiteCard,
                title: {
                    element: '.website-title',
                    text: templateData.websites_title
                }
            }
        ];

        cardSections.forEach(section => loadCardSection(section));

    } catch (error) {
        console.error('Error loading template data:', error);
    }
}

function updateHeaderContent(templateData) {
    const elements = {
        '.templates-header-title': templateData.title,
        '.templates-desc': templateData.description,
        '.how-to-publish': templateData.how_to_publish,
        '.build-template-title': templateData['build-title']
    };

    Object.entries(elements).forEach(([selector, content]) => {
        const element = document.querySelector(selector);
        if (element) element.innerHTML = content || '';
    });
}

function loadCardSection({ data, container, renderer, title }) {
    const containerElement = document.querySelector(container);
    if (!containerElement) {
        console.error(`Container ${container} not found`);
        return;
    }

    if (title) {
        const titleElement = document.querySelector(title.element);
        if (titleElement) titleElement.innerHTML = title.text || '';
    }

    containerElement.innerHTML = '';
    if (Array.isArray(data)) {
        data.forEach(item => {
            containerElement.innerHTML += renderer(item);
        });
    }
}

const renderBuildCard = card => `
    <div class="swiper-slide">
        <div class="build-card" style="background: url('${card.background}')">
            <div class="build-card-content">
                <h3 class="build-card-title">${card.title}</h3>
                <p class="build-card-desc">${card.description}</p>
            </div>
        </div>
    </div>
`;

const renderLanguageCard = lang => `
    <div class="language-card">
        <img src="${lang.icon}" alt="${lang.title}" class="language-img">
        <div class="language-content">
            <p class="language-name">${lang.title}</p>
            ${lang.official ? `<svg preserveAspectRatio="xMidYMin" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" aria-label="Official" class="css-492dz9" style="--size: 12px; --rotate: 0deg; width: 12px; height: 12px;"><path fill-rule="evenodd" d="M20.53 5.47a.75.75 0 0 1 0 1.06l-11 11a.75.75 0 0 1-1.06 0l-5-5a.75.75 0 1 1 1.06-1.06L9 15.94 19.47 5.47a.75.75 0 0 1 1.06 0Z" clip-rule="evenodd"></path></svg>` : ''}
        </div>
        <div class="language-stats">
            <p class="stats-likes-content">
                <i class="language-like-icon"><svg preserveAspectRatio="xMidYMin" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" class="css-492dz9" style="--size: 16px; --rotate: 0deg; width: 16px; height: 16px;"><path fill-rule="evenodd" d="M14.558 2.724A6.25 6.25 0 0 1 23.202 8.5a6.249 6.249 0 0 1-1.832 4.42l-8.84 8.84a.75.75 0 0 1-1.06 0l-8.84-8.84a6.251 6.251 0 1 1 8.84-8.84l.53.53.53-.53a6.25 6.25 0 0 1 2.028-1.356ZM20.31 5.14a4.75 4.75 0 0 0-6.72 0L12.53 6.2a.75.75 0 0 1-1.06 0l-1.06-1.06a4.751 4.751 0 0 0-6.72 6.72L12 20.17l8.31-8.31a4.752 4.752 0 0 0 0-6.72Z" clip-rule="evenodd"></path></svg></i>
                <span class="language-like">${lang?.stats.likes}</span>
            </p>
            <p class="stats-runs-content">
                <i class="language-runs-icon"><svg preserveAspectRatio="xMidYMin" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" class="css-492dz9" style="--size: 16px; --rotate: 0deg; width: 16px; height: 16px;"><path fill-rule="evenodd" d="M12 3.25a.75.75 0 0 1 .75.75v7.25H20a.75.75 0 0 1 0 1.5h-7.25V20a.75.75 0 0 1-1.5 0v-7.25H4a.75.75 0 0 1 0-1.5h7.25V4a.75.75 0 0 1 .75-.75Z" clip-rule="evenodd"></path></svg></i>
                <span class="language-used">${lang?.stats.runs}</span>
            </p>
        </div>
    </div>
`;

const renderAiCard = card => `
    <div class="ai-card">
        <div class="ai-card-header">
            <img src="${card.icon}" alt="${card.title}" class="ai-img">
            <button class="ai-card-template-button">
                <svg preserveAspectRatio="xMidYMin" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" class="css-492dz9" style="--size: 16px; --rotate: 0deg; width: 16px; height: 16px;"><path fill-rule="evenodd" d="M21.25 6a2.25 2.25 0 1 0-4.5 0 2.25 2.25 0 0 0 4.5 0ZM19 2.25a3.75 3.75 0 1 1-3.675 4.5H12c-.69 0-1.25.56-1.25 1.25v8c0 .69.56 1.25 1.25 1.25h3.325a3.751 3.751 0 0 1 7.425.75 3.75 3.75 0 0 1-7.425.75H12A2.75 2.75 0 0 1 9.25 16v-3.25H2a.75.75 0 0 1 0-1.5h7.25V8A2.75 2.75 0 0 1 12 5.25h3.325c.348-1.712 1.86-3 3.675-3ZM21.25 18a2.25 2.25 0 1 0-4.5 0 2.25 2.25 0 0 0 4.5 0Z" clip-rule="evenodd"></path></svg>
                Use Template
            </button>
        </div>
        <div class="ai-card-body">
            <h3 class="ai-card-title">${card.title}</h3>
            <p class="ai-card-desc">${card.description}</p>
        </div>
        <div class="ai-card-stats-container">
            <p class="ai-card-publisher">
                <img src="${card.publisherIcon}" alt="${card.publisherIcon}" class="ai-card-publisher-icon">
                <span class="ai-card-publisher-name">${card.publisher}</span>
            </p>
            <p class="ai-card-stats">
                <span class="ai-card-stats-likes">
                    <i class="language-like-icon"><svg preserveAspectRatio="xMidYMin" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" class="css-492dz9" style="--size: 16px; --rotate: 0deg; width: 16px; height: 16px;"><path fill-rule="evenodd" d="M14.558 2.724A6.25 6.25 0 0 1 23.202 8.5a6.249 6.249 0 0 1-1.832 4.42l-8.84 8.84a.75.75 0 0 1-1.06 0l-8.84-8.84a6.251 6.251 0 1 1 8.84-8.84l.53.53.53-.53a6.25 6.25 0 0 1 2.028-1.356ZM20.31 5.14a4.75 4.75 0 0 0-6.72 0L12.53 6.2a.75.75 0 0 1-1.06 0l-1.06-1.06a4.751 4.751 0 0 0-6.72 6.72L12 20.17l8.31-8.31a4.752 4.752 0 0 0 0-6.72Z" clip-rule="evenodd"></path></svg></i>
                    ${card.stats.likes}
                </span>
                <span class="ai-card-stats-forks">
                <i class="language-runs-icon"><svg preserveAspectRatio="xMidYMin" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" class="css-492dz9" style="--size: 16px; --rotate: 0deg; width: 16px; height: 16px;"><path fill-rule="evenodd" d="M12 3.25a.75.75 0 0 1 .75.75v7.25H20a.75.75 0 0 1 0 1.5h-7.25V20a.75.75 0 0 1-1.5 0v-7.25H4a.75.75 0 0 1 0-1.5h7.25V4a.75.75 0 0 1 .75-.75Z" clip-rule="evenodd"></path></svg></i>
                ${card.stats.forks}</span>
            </p>
        </div>
    </div>
`;

const renderWebsiteCard = card => `
   <div class="website-card">
        <div class="website-card-header">
            <img src="${card.icon}" alt="${card.title}" class="website-img">
            <button class="website-card-template-button">
                <svg preserveAspectRatio="xMidYMin" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" class="css-492dz9" style="--size: 16px; --rotate: 0deg; width: 16px; height: 16px;"><path fill-rule="evenodd" d="M21.25 6a2.25 2.25 0 1 0-4.5 0 2.25 2.25 0 0 0 4.5 0ZM19 2.25a3.75 3.75 0 1 1-3.675 4.5H12c-.69 0-1.25.56-1.25 1.25v8c0 .69.56 1.25 1.25 1.25h3.325a3.751 3.751 0 0 1 7.425.75 3.75 3.75 0 0 1-7.425.75H12A2.75 2.75 0 0 1 9.25 16v-3.25H2a.75.75 0 0 1 0-1.5h7.25V8A2.75 2.75 0 0 1 12 5.25h3.325c.348-1.712 1.86-3 3.675-3ZM21.25 18a2.25 2.25 0 1 0-4.5 0 2.25 2.25 0 0 0 4.5 0Z" clip-rule="evenodd"></path></svg>
                Use Template
            </button>
        </div>
        <div class="website-card-body">
            <h3 class="website-card-title">${card.title}</h3>
            <p class="website-card-desc">${card.description}</p>
        </div>
        <div class="website-card-stats-container">
            <p class="website-card-publisher">
                <img src="${card.publisherIcon}" alt="${card.publisherIcon}" class="website-card-publisher-icon">
                <span class="website-card-publisher-name">${card.publisher}</span>
            </p>
            <p class="website-card-stats">
                <span class="website-card-stats-likes">
                    <i class="language-like-icon"><svg preserveAspectRatio="xMidYMin" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" class="css-492dz9" style="--size: 16px; --rotate: 0deg; width: 16px; height: 16px;"><path fill-rule="evenodd" d="M14.558 2.724A6.25 6.25 0 0 1 23.202 8.5a6.249 6.249 0 0 1-1.832 4.42l-8.84 8.84a.75.75 0 0 1-1.06 0l-8.84-8.84a6.251 6.251 0 1 1 8.84-8.84l.53.53.53-.53a6.25 6.25 0 0 1 2.028-1.356ZM20.31 5.14a4.75 4.75 0 0 0-6.72 0L12.53 6.2a.75.75 0 0 1-1.06 0l-1.06-1.06a4.751 4.751 0 0 0-6.72 6.72L12 20.17l8.31-8.31a4.752 4.752 0 0 0 0-6.72Z" clip-rule="evenodd"></path></svg></i>
                    ${card.stats.likes}
                </span>
                <span class="website-card-stats-forks">
                <i class="language-runs-icon"><svg preserveAspectRatio="xMidYMin" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" class="css-492dz9" style="--size: 16px; --rotate: 0deg; width: 16px; height: 16px;"><path fill-rule="evenodd" d="M12 3.25a.75.75 0 0 1 .75.75v7.25H20a.75.75 0 0 1 0 1.5h-7.25V20a.75.75 0 0 1-1.5 0v-7.25H4a.75.75 0 0 1 0-1.5h7.25V4a.75.75 0 0 1 .75-.75Z" clip-rule="evenodd"></path></svg></i>
                ${card.stats.forks}</span>
            </p>
        </div>
    </div>
`;

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

export async function initialize() {
    try {
        await initializeSwiper();
        await loadTemplateData();
    } catch (error) {
        console.error('Error during initialization:', error);
    }
}

