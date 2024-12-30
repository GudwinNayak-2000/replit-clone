async function loadLearnData(){
    try {
        const res = await fetch('/data/data.json');
        const data = await res.json();
        const learnData = data?.categories?.learn_page;

        if(!learnData){
            console.error('Learn page data not found');
            return;
        }
        updateLearnHeader(learnData);
        const cardSections=[
            {
                data: learnData.courses_section.courses,
                container: '.coding-courses-cards-container',
                renderer: codingCourses
            }
        ]
        cardSections.forEach(section => loadCardSection(section));
    } catch (error) {
        console.error('Error during initialization:', error);
    }
}

const codingCourses = course => `
    <div class="coding-course-card">
        <img src="${course.imageUrl}" alt="${course.title}" class="coding-course-img">
        <div class="coding-course-info">
            <h3 class="coding-course-title">${course.title}</h3>
            <p class="coding-course-desc">${course.description}</p>
            <div class="coding-course-metadata">
                <p class="coding-course-metadata-item">
                <span class="time-icon">${course.metadata.timePerDay ? '<svg preserveAspectRatio="xMidYMin" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" class="css-492dz9" style="--size: 16px; --rotate: 0deg; width: 16px; height: 16px;"><path fill-rule="evenodd" d="M12 2.75a9.25 9.25 0 1 0 0 18.5 9.25 9.25 0 0 0 0-18.5ZM1.25 12C1.25 6.063 6.063 1.25 12 1.25S22.75 6.063 22.75 12 17.937 22.75 12 22.75 1.25 17.937 1.25 12ZM12 6.25a.75.75 0 0 1 .75.75v4.932l3.666 2.444a.75.75 0 1 1-.832 1.248l-4-2.667a.75.75 0 0 1-.334-.624V7a.75.75 0 0 1 .75-.75Z" clip-rule="evenodd"></path></svg>' 
                : '<svg preserveAspectRatio="xMidYMin" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" class="css-492dz9" style="--size: 16px; --rotate: 0deg; width: 16px; height: 16px;"><path fill-rule="evenodd" d="M4.596 1.804C5.32 1.514 6.416 1.25 8 1.25c1.645 0 3.01.546 4.235 1.036l.043.018c1.264.505 2.387.946 3.722.946 1.416 0 2.32-.236 2.846-.446.264-.106.437-.207.535-.272a.996.996 0 0 0 .101-.074A.75.75 0 0 1 20.75 3v12a.75.75 0 0 1-.22.53 1.424 1.424 0 0 1-.102.092 2.664 2.664 0 0 1-.215.158 4.412 4.412 0 0 1-.81.416c-.723.29-1.819.554-3.403.554-1.645 0-3.01-.546-4.235-1.036l-.043-.018c-1.264-.505-2.386-.946-3.722-.946-1.415 0-2.32.236-2.846.446a3.322 3.322 0 0 0-.404.192V22a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .22-.53c.094-.095.205-.176.317-.25.184-.123.449-.272.81-.416Zm.154 1.584v10.357c.722-.265 1.774-.495 3.25-.495 1.645 0 3.01.546 4.235 1.036l.043.018c1.264.505 2.387.946 3.722.946 1.416 0 2.32-.236 2.846-.446.172-.069.305-.136.404-.192V4.255c-.722.266-1.774.495-3.25.495-1.645 0-3.01-.546-4.235-1.036l-.043-.018C10.458 3.191 9.336 2.75 8 2.75c-1.415 0-2.32.236-2.846.446a3.317 3.317 0 0 0-.404.192Z" clip-rule="evenodd"></path></svg>'}
                </span>
                ${course.metadata.timePerDay ? course.metadata.timePerDay : course.metadata.language}</p>
                <p class="coding-course-metadata-item">
                <span class="level-icon"><svg preserveAspectRatio="xMidYMin" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" class="css-492dz9" style="--size: 16px; --rotate: 0deg; width: 16px; height: 16px;"><path fill-rule="evenodd" d="M12 1.25a.75.75 0 0 1 .673.418l2.915 5.907 6.52.953a.75.75 0 0 1 .415 1.28l-4.717 4.594 1.113 6.491a.75.75 0 0 1-1.088.79L12 18.618l-5.83 3.067a.75.75 0 0 1-1.09-.79l1.114-6.492-4.717-4.595a.75.75 0 0 1 .415-1.28l6.52-.952 2.915-5.907A.75.75 0 0 1 12 1.25Z" clip-rule="evenodd"></path></svg></span>
                ${course.metadata.level}</p>
            </div>
        </div>
    </div>
`;

function updateLearnHeader(learnData) {

    const elements = {
        '.learn-header-title': learnData.pageTitle || '',
        '.repls-count': learnData.repls_count || '',
        '.learn-header-desc': learnData.subtitle || '',
        '.coding-courses-title': learnData.courses_section.title || '',
        '.coding-courses-desc': learnData.courses_section.description || ''

    };

    Object.entries(elements).forEach(([selector, content]) => {
        const element = document.querySelector(selector);
        console.log(`Element for ${selector}:`, element);
        if(element) element.innerHTML = content || '';
    });
}


async function loadCardSection({ data, container, renderer, title }) {
    const containerElement = document.querySelector(container);
    if (!containerElement) {
        console.error(`Container ${container} not found`);
        return;
       }

    if(title){
        const titleElement = document.querySelector(title.element);
        if(titleElement) titleElement.innerHTML = title.text || '';
    }

    containerElement.innerHTML = '';
    if(Array.isArray(data)){
        data.forEach(item => {
            containerElement.innerHTML += renderer(item);
        });
    }

}

export async function initialize(){
    try {
        await loadLearnData();
    } catch (error) {
        console.error('Error during initialization:', error);
    }
}


