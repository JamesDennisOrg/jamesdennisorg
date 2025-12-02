// Multi-step Form Handler
class MultiStepForm {
    constructor(formId, options = {}) {
        this.config = {
            totalSteps: 3,
            autoValidate: true,
            scrollToTop: true,
            scrollOffset: 100,
            successRedirect: null,
            successDelay: 3000,
            web3formsKey: '096b2d6f-de61-436d-9ab7-280d6a71396e', // Your key
            ...options
        };
        
        this.formId = formId;
        this.form = document.getElementById(formId);
        if (!this.form) {
            console.error(`Form with ID "${formId}" not found`);
            return;
        }
        
        this.currentStep = 1;
        this.formData = {};
        this.init();
    }
    
    init() {
        this.cacheElements();
        this.setupEventListeners();
        this.preventFormSubmission();
        this.updateUI();
    }
    
    preventFormSubmission() {
        // Prevent any accidental form submissions via Enter key
        this.form.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const target = e.target;
                // Only prevent Enter if it's not in a textarea and not the submit button
                if (target.tagName !== 'TEXTAREA' && target.type !== 'submit') {
                    e.preventDefault();
                }
            }
        });
        
        // Double-check all navigation buttons have type="button"
        this.form.querySelectorAll('.btn-next, .btn-prev').forEach(btn => {
            if (btn.type !== 'button') {
                console.warn(`Fixing button type for:`, btn);
                btn.type = 'button';
            }
        });
    }

    cacheElements() {
        this.steps = this.form.querySelectorAll('[data-step]');
        this.nextButtons = this.form.querySelectorAll('.btn-next');
        this.prevButtons = this.form.querySelectorAll('.btn-prev');
        this.submitButton = this.form.querySelector('.btn-submit');
        this.stepDots = this.form.querySelectorAll('.step-dot');
        this.stepText = this.form.querySelector('.step-text');
    }
    
    setupEventListeners() {
        // Next buttons
        this.nextButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.nextStep(e);
            });

            if (btn.type !== 'button') {
                btn.type = 'button';
            }
        });

        // Previous buttons
        this.prevButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                // e.stopPropagation();
                this.prevStep(e);
            });
        });
        
        // Form submission
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Real-time validation
        this.form.querySelectorAll('input, select, textarea').forEach(field => {
            if (field.name) {
                field.addEventListener('blur', () => this.validateField(field));
                field.addEventListener('input', () => this.clearFieldError(field));
            }
        });
        
        // Checkbox/radio groups
        this.form.querySelectorAll('input[type="checkbox"], input[type="radio"]').forEach(field => {
            field.addEventListener('change', () => this.updateFormData(field));
        });
    }
    
    nextStep(e) {        
        if (!this.validateStep(this.currentStep)) {
            return;
        }
        
        // Store current scroll position BEFORE any DOM changes
        const scrollY = window.scrollY;
        
        // Hide current step
        const currentStepEl = this.getStepElement(this.currentStep);
        if (currentStepEl) {
            currentStepEl.classList.remove('active');
            currentStepEl.classList.add('completed');
        }
        
        // Show next step
        this.currentStep++;
        const nextStepEl = this.getStepElement(this.currentStep);
        if (nextStepEl) {
            nextStepEl.classList.add('active');
        }
        
        this.updateUI();
        
        // RESTORE original scroll position immediately
        window.scrollTo(0, scrollY);
        
        // Then do a controlled scroll if needed (with small delay)
        setTimeout(() => {
            this.smartScrollToForm();
        }, 50);
        
        // Focus first input
        setTimeout(() => {
            const firstInput = nextStepEl?.querySelector('input, select, textarea');
            if (firstInput) {
                firstInput.focus();
            }
        }, 350);
    }

    prevStep(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        // Store current scroll position
        const scrollY = window.scrollY;
        
        // Hide current step
        const currentStepEl = this.getStepElement(this.currentStep);
        if (currentStepEl) {
            currentStepEl.classList.remove('active');
        }
        
        // Show previous step
        this.currentStep--;
        const prevStepEl = this.getStepElement(this.currentStep);
        if (prevStepEl) {
            prevStepEl.classList.add('active');
            prevStepEl.classList.remove('completed');
        }
        
        this.updateUI();
        
        // Restore scroll position
        window.scrollTo(0, scrollY);
        
        // Smart scroll after a delay
        setTimeout(() => {
            this.smartScrollToForm();
        }, 50);
    }
    
    validateStep(step) {
        const stepEl = this.getStepElement(step);
        let isValid = true;
        
        // Validate required fields
        const requiredFields = stepEl.querySelectorAll('[required]');
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                this.showFieldError(field, 'This field is required');
            } else {
                this.clearFieldError(field);
                
                // Additional validations
                if (field.type === 'email' && !this.isValidEmail(field.value)) {
                    isValid = false;
                    this.showFieldError(field, 'Please enter a valid email');
                }
                
                if (field.type === 'url' && !this.isValidUrl(field.value)) {
                    isValid = false;
                    this.showFieldError(field, 'Please enter a valid URL');
                }
            }
        });
        
        return isValid;
    }
    
    validateField(field) {
        if (!field.value.trim() && field.hasAttribute('required')) {
            this.showFieldError(field, 'This field is required');
            return false;
        }
        
        if (field.type === 'email' && field.value && !this.isValidEmail(field.value)) {
            this.showFieldError(field, 'Please enter a valid email');
            return false;
        }
        
        if (field.type === 'url' && field.value && !this.isValidUrl(field.value)) {
            this.showFieldError(field, 'Please enter a valid URL');
            return false;
        }
        
        this.clearFieldError(field);
        return true;
    }
    
    showFieldError(field, message) {
        this.clearFieldError(field);
        field.classList.add('error');
        
        const errorEl = document.createElement('div');
        errorEl.className = 'field-error';
        errorEl.textContent = message;
        field.parentNode.appendChild(errorEl);
    }
    
    clearFieldError(field) {
        field.classList.remove('error');
        const errorEl = field.parentNode.querySelector('.field-error');
        if (errorEl) errorEl.remove();
    }
    
    updateFormData(field) {
        const name = field.name;
        if (!name) return;
        
        if (field.type === 'checkbox' && name.endsWith('[]')) {
            // Handle checkbox arrays
            const key = name.replace('[]', '');
            if (!Array.isArray(this.formData[key])) {
                this.formData[key] = [];
            }
            
            if (field.checked) {
                if (!this.formData[key].includes(field.value)) {
                    this.formData[key].push(field.value);
                }
            } else {
                this.formData[key] = this.formData[key].filter(v => v !== field.value);
            }
        } else if (field.type === 'checkbox') {
            this.formData[name] = field.checked;
        } else if (field.type === 'radio') {
            if (field.checked) {
                this.formData[name] = field.value;
            }
        } else {
            this.formData[name] = field.value;
        }
    }
    
    updateUI() {
        // Update step dots
        this.stepDots.forEach((dot, index) => {
            const stepNumber = index + 1;
            dot.classList.toggle('active', stepNumber === this.currentStep);
            dot.classList.toggle('completed', stepNumber < this.currentStep);
        });
        
        // Update step text
        if (this.stepText) {
            this.stepText.textContent = `Step ${this.currentStep} of ${this.config.totalSteps}`;
        }
        
        // Update button visibility
        this.prevButtons.forEach(btn => {
            btn.style.display = this.currentStep > 1 ? 'block' : 'none';
        });
        
        this.nextButtons.forEach(btn => {
            btn.style.display = this.currentStep < this.config.totalSteps ? 'block' : 'none';
        });
        
        if (this.submitButton) {
            this.submitButton.style.display = this.currentStep === this.config.totalSteps ? 'block' : 'none';
        }
    }
    
    smartScrollToForm() {
        if (!this.config.scrollToTop) {
            return;
        }
        
        const formContainer = this.form.closest('.form-container');
        if (!formContainer) {
            return;
        }
        
        // Get current viewport information
        const containerRect = formContainer.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const currentScroll = window.scrollY;
        
        // Check if form is already in view
        const isFullyVisible = (
            containerRect.top >= 100 && // 100px from top for breathing room
            containerRect.bottom <= (viewportHeight - 100) // 100px from bottom
        );
        
        if (isFullyVisible) {
            return;
        }
        
        // Check if form is partially visible
        const isPartiallyVisible = (
            containerRect.top < viewportHeight && 
            containerRect.bottom > 0
        );
        
        if (isPartiallyVisible) {
            // Form is partially visible, just scroll a bit to center it
            const targetScroll = currentScroll + containerRect.top - 150; // 150px from top
            
            window.scrollTo({
                top: targetScroll,
                behavior: 'smooth'
            });
        } else {
            // Form is not visible at all, scroll to it
            const targetScroll = formContainer.offsetTop - this.config.scrollOffset;
            
            window.scrollTo({
                top: targetScroll,
                behavior: 'smooth'
            });
        }
    }
    
    getStepElement(stepNumber) {
        return this.form.querySelector(`[data-step="${stepNumber}"]`);
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        if (!this.validateStep(this.currentStep)) return;
        
        // Collect all form data
        this.form.querySelectorAll('input, select, textarea').forEach(field => {
            this.updateFormData(field);
        });
        
        // Prepare submission
        const submissionData = {
            ...this.formData,
            form_id: this.formId,
            page_url: window.location.href,
            timestamp: new Date().toISOString()
        };
        
        // Show loading
        this.setLoading(true);
        
        try {
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    access_key: this.config.web3formsKey,
                    ...submissionData,
                    subject: `Form Submission - ${this.formId}`,
                    from_name: 'James Dennis Website'
                })
            });
            
            const result = await response.json();
            
            if (response.ok && result.success) {
                this.showSuccess();
                this.trackConversion();
            } else {
                throw new Error(result.message || 'Submission failed');
            }
        } catch (error) {
            console.error('Submission error:', error);
            this.showError();
            this.setLoading(false);
        }
    }
    
    setLoading(isLoading) {
        const buttons = [...this.nextButtons, ...this.prevButtons, this.submitButton].filter(Boolean);
        
        buttons.forEach(btn => {
            btn.disabled = isLoading;
            if (btn === this.submitButton && isLoading) {
                const originalText = btn.innerHTML;
                btn.setAttribute('data-original-text', originalText);
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            } else if (btn === this.submitButton && !isLoading) {
                const originalText = btn.getAttribute('data-original-text');
                if (originalText) btn.innerHTML = originalText;
            }
        });
    }
    
    showSuccess() {
        const formContainer = this.form.closest('.form-container');
        if (!formContainer) return;
        
        const userName = this.formData.name || this.formData.user_name || '';
        
        formContainer.innerHTML = `
            <div class="form-success">
                <div class="success-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h3>Thank You${userName ? ', ' + userName.split(' ')[0] : ''}!</h3>
                <p>Your bot defense audit request has been received.</p>
                
                <div class="success-details">
                    <p><strong>What happens next:</strong></p>
                    <ul>
                        <li>✓ Confirmation email sent to ${this.formData.email || 'you'}</li>
                        <li>✓ Site analysis begins immediately</li>
                        <li>✓ Audit report delivered within 24 hours</li>
                        <li>✓ 15-minute consultation scheduled</li>
                    </ul>
                </div>
                
                <div class="success-actions">
                    <a href="/services/" class="btn btn-secondary">Back to Services</a>
                    <a href="/contact/" class="btn btn-primary">Contact Me</a>
                </div>
            </div>
        `;
        
        formContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    showError() {
        const errorMsg = document.createElement('div');
        errorMsg.className = 'form-error-alert';
        errorMsg.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <div>
                <strong>Submission Error</strong>
                <p>Please try again or contact me directly.</p>
            </div>
        `;
        
        this.form.insertBefore(errorMsg, this.form.firstChild);
        
        if (this.submitButton) {
            this.submitButton.classList.add('error');
            setTimeout(() => {
                this.submitButton.classList.remove('error');
            }, 3000);
        }
    }
    
    trackConversion() {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'conversion', {
                'send_to': 'AW-XXXXXXX/YYYYYYYY',
                'transaction_id': `${this.formId}-${Date.now()}`
            });
        }
    }
    
    // Utility functions
    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    
    isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }
}

// Factory function
window.initMultiStepForm = function(formId, options = {}) {
    return new MultiStepForm(formId, options);
};

// Auto-initialize forms
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('form[data-multistep]').forEach(form => {
        const formId = form.id;
        const totalSteps = form.getAttribute('data-total-steps') || 3;
        
        if (formId) {
            new MultiStepForm(formId, {
                totalSteps: parseInt(totalSteps)
            });
        }
    });
});