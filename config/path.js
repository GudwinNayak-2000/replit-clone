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
    local: {
       basePath: './',
       apiUrl: '',
       paths: {
           components: './components',
           settings: './settings',
           pages: './pages',
           js: './js',
           css: './css'
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
            css: './css'
        }
    }
};

export const getEnvironmentConfig = () => {
    const protocol = window.location.protocol;

    const hostname = window.location.hostname;
    if (protocol === 'file:') {
        return CONFIG.local;
    }
    // Local development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return CONFIG.development;
    }
    
    // Production/Custom domain
    return CONFIG.production;
};

export const resolvePath = (path) => {
    if(window.location.protocol === 'file:') {
        return `./${path}`;
    }
    
    const environmentConfig = getEnvironmentConfig();
    return `${environmentConfig.basePath}${path}`;
};
