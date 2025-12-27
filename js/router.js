// Client-side Router
class Router {
    constructor() {
        this.routes = {
            '/home': 'home',
            '/escorts': 'escort-selection',
            '/massage': 'massage-parlours',
            '/about': 'about',
            '/escort-login': 'escort-login',
            '/escort-signup': 'escort-signup',
            '/escort-dashboard': 'escort-dashboard',
            '/client-request-board': 'client-request-board'
        };
        
        this.currentPage = null;
        this.init();
    }
    
    init() {
        // Listen for hash changes
        window.addEventListener('hashchange', () => this.handleRoute());
        
        // Handle initial route
        this.handleRoute();
    }
    
    async handleRoute() {
        const hash = window.location.hash.substring(1) || '/home';
        const pageName = this.routes[hash] || 'home';
        
        // Prevent same page reload
        if (this.currentPage === pageName) return;
        
        this.currentPage = pageName;
        
        // Show loading
        if (window.appUtils) window.appUtils.showLoading();
        
        try {
            // Load page module
            await this.loadPage(pageName);
            
            // Update active nav
            this.updateActiveNav(hash);
            
            // Update page title
            this.updatePageTitle(pageName);
            
            // Dispatch route change event
            document.dispatchEvent(new CustomEvent('route-change', {
                detail: { page: pageName, hash }
            }));
            
        } catch (error) {
            console.error('Route loading error:', error);
            window.appUtils.showToast('Error loading page. Please try again.', 'error');
        } finally {
            // Hide loading
            if (window.appUtils) window.appUtils.hideLoading();
        }
    }
    
    async loadPage(pageName) {
        const container = document.getElementById('page-container');
        if (!container) return;
        
        // Clear current content
        container.innerHTML = '';
        
        // Load page HTML
        const htmlPath = `/pages/${pageName}/${pageName}.html`;
        const cssPath = `/pages/${pageName}/${pageName}.css`;
        const jsPath = `/pages/${pageName}/${pageName}.js`;
        
        try {
            // Load HTML
            const htmlResponse = await fetch(htmlPath);
            if (!htmlResponse.ok) throw new Error('Page not found');
            
            const html = await htmlResponse.text();
            container.innerHTML = html;
            
            // Load CSS dynamically
            if (!document.querySelector(`link[href="${cssPath}"]`)) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = cssPath;
                document.head.appendChild(link);
            }
            
            // Load JS dynamically
            if (!document.querySelector(`script[src="${jsPath}"]`)) {
                const script = document.createElement('script');
                script.src = jsPath;
                script.type = 'module';
                document.body.appendChild(script);
            } else {
                // If already loaded, dispatch init event
                document.dispatchEvent(new CustomEvent(`page-${pageName}-init`));
            }
            
        } catch (error) {
            // Fallback to home page
            console.warn(`Page ${pageName} not found, redirecting to home`);
            window.location.hash = '/home';
        }
    }
    
    updateActiveNav(hash) {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.classList.remove('active');
            const page = item.getAttribute('data-page');
            if (page && this.routes[`/${page}`] === this.currentPage) {
                item.classList.add('active');
            }
        });
    }
    
    updatePageTitle(pageName) {
        const titles = {
            'home': 'Marmaid.com | Book Escorts',
            'escort-selection': 'Marmaid.com | Available Escorts',
            'massage-parlours': 'Marmaid.com | Massage Parlours',
            'about': 'Marmaid.com | About & Contact',
            'escort-login': 'Marmaid.com | Escort Login',
            'escort-signup': 'Marmaid.com | Escort Sign Up',
            'escort-dashboard': 'Marmaid.com | Escort Dashboard',
            'client-request-board': 'Marmaid.com | Client Request Board'
        };
        
        document.title = titles[pageName] || 'Marmaid.com';
    }
    
    navigateTo(path) {
        window.location.hash = path;
    }
    
    getCurrentPage() {
        return this.currentPage;
    }
    
    getCurrentHash() {
        return window.location.hash.substring(1) || '/home';
    }
}

// Initialize router
function initRouter() {
    window.router = new Router();
}

// Export router instance
window.Router = Router;