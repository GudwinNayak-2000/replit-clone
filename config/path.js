// config/path.js
export const CONFIG = {
    development: {
        basePath: '',
        apiUrl: 'http://localhost:3000',
        paths: {
            components: './components',
            settings: './settings',
            pages: './pages',
            js: './js',
            css: './css'
        }
    },
    staging: {
        basePath: '/replit-clone',
        apiUrl: 'https://gudwinnayak-2000.github.io/replit-clone',
        paths: {
            components: '/replit-clone/components',
            settings: '/replit-clone/settings',
            pages: '/replit-clone/pages',
            js: '/replit-clone/js',
            css: '/replit-clone/css'
        }
    },
    production: {
        basePath: '',
        apiUrl: '',
        paths: {
            components: '/components',
            settings: '/settings',
            pages: '/pages',
            js: '/js',
            css: '/css'
        }
    }
};

export const getEnvironmentConfig = () => {
    const hostname = window.location.hostname;
    
    // Local development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return CONFIG.development;
    }
    
    // GitHub Pages
    if (hostname.includes('github.io')) {
        return CONFIG.staging;
    }
    
    // Production/Custom domain
    return CONFIG.production;
};