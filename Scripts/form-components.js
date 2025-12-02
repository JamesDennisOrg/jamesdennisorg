// Form Components Loader
class FormComponentLoader {
    constructor() {
        this.components = {};
        this.init();
    }
    
    init() {
        // Register available form components
        this.registerComponents();
        
        // Auto-load components with data-form-component attribute
        this.autoLoadComponents();
    }
    
    registerComponents() {
        this.components = {
            'bot-defense-audit': {
                template: '/components/forms/bot-defense-audit.html',
                config: {
                    totalSteps: 3,
                    serviceType: 'bot-defense'
                }
            },
            'performance-assessment': {
                template: '/components/forms/performance-assessment.html',
                config: {
                    totalSteps: 3,
                    serviceType: 'performance'
                }
            },
            'seo-audit': {
                template: '/components/forms/seo-audit.html',
                config: {
                    totalSteps: 3,
                    serviceType: 'seo'
                }
            },
            'contact-general': {
                template: '/components/forms/contact-general.html',
                config: {
                    totalSteps: 2,
                    serviceType: 'general'
                }
            }
        };
    }
    
    autoLoadComponents() {
        document.querySelectorAll('[data-form-component]').forEach(container => {
            const componentName = container.getAttribute('data-form-component');
            this.loadComponent(componentName, container);
        });
    }
    
    async loadComponent(componentName, container) {
        if (!this.components[componentName]) {
            console.error(`Form component "${componentName}" not found`);
            return;
        }
        
        const component = this.components[componentName];
        
        try {
            // Fetch HTML template
            const response = await fetch(component.template);
            const html = await response.text();
            
            // Inject into container
            container.innerHTML = html;
            
            // Auto-initialize the form
            setTimeout(() => {
                const formId = container.querySelector('form')?.id;
                if (formId) {
                    window.initMultiStepForm(formId, component.config);
                }
            }, 100);
            
            console.log(`Loaded form component: ${componentName}`);
            
        } catch (error) {
            console.error(`Failed to load form component "${componentName}":`, error);
            container.innerHTML = `
                <div class="form-error">
                    <p>Unable to load form. Please try again or <a href="/contact/">contact me directly</a>.</p>
                </div>
            `;
        }
    }
    
    // Public API
    loadComponentTo(componentName, targetSelector) {
        const container = document.querySelector(targetSelector);
        if (container) {
            this.loadComponent(componentName, container);
        }
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.formComponentLoader = new FormComponentLoader();
});