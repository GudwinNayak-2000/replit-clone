
export const CONFIG={
    development:{
        basePath:'',
        apiUrl:'http://localhost:3000'
    },
    staging:{
        basePath:'/replit-clone',
        apiUrl:'https://gudwinnayak-2000.github.io/replit-clone'
    },
    production:{
        basePath:'',
        apiUrl:''
    }
}

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