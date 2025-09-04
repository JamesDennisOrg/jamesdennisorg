document.addEventListener('DOMContentLoaded', function() {
  const Quiz = {
    // State variables
    currentModal: null,
    siteUrl: null,
    selectedIssues: [],
    userPurpose: null,
    brandMaterials: null,

    // Initialize the quiz
    init: function() {
      this.setupTriggers();
      this.setupNavigation();
      this.setupSubmission();
    },

    isSubmitting: false, // Preventing duplicate form submissions - see "submitQuiz()"

    // 1. Setup Functions
    setupTriggers: function() {
      document.getElementById('new-site-btn')?.addEventListener('click', () => {
        this.openModal('new-site-quiz');
      });
      
      document.getElementById('existing-site-btn')?.addEventListener('click', () => {
        this.openModal('existing-site-quiz');
      });

      document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', () => this.closeModal());
      });

      document.querySelectorAll('input[name="brandMaterials"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
          const uploadSection = e.target.closest('.quiz-step').querySelector('.brand-upload');
          const quizContent = e.target.closest('.quiz-content');
          const contentGroup = Array.from(document.querySelectorAll('.upload-group'));

          if (e.target.value === 'yes') {
            uploadSection.style.display = 'block';
            setTimeout(() => {
              contentGroup.forEach(group => {group.classList.add('visible');});
            }, "100");
            
            quizContent.style.height = "90vh";
          } else {
            
            contentGroup.forEach(group => {group.classList.remove('visible');});
            setTimeout(() => {
              quizContent.style.height = '';
              uploadSection.style.display = 'none';
            }, "200");
            
          }
            
        });
      });
    },

    setupNavigation: function() {
      document.querySelectorAll('.quiz-next').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          this.goToNextStep();
        });
      });

      document.querySelectorAll('.quiz-prev').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          this.goToPrevStep();
        });
      });
    },

    setupSubmission: function() {
      document.querySelectorAll('.quiz-submit').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          this.submitQuiz();
        });
      });
    },

    // 2. Core Quiz Functionality
    openModal: function(modalId) {
      this.currentModal = document.getElementById(modalId);
      if (this.currentModal) {
        this.currentModal.classList.add('active');
        // this.currentModal.style.display = 'flex';
        // this.currentModal.style.visibility = 'visible';
        // this.currentModal.style.opacity = '1';
        // document.body.style.overflow = 'hidden';
        
        const firstStep = this.currentModal.querySelector('.quiz-step');
        if (firstStep) {
          this.currentModal.querySelectorAll('.quiz-step').forEach(step => {
            step.classList.remove('active');
          });
          firstStep.classList.add('active');
          this.updateProgress();
        }
      }
    },

    closeModal: function() {
      if (this.currentModal) {
        this.currentModal.classList.remove('active');
        // this.currentModal.style.opacity = '0';
        // this.currentModal.style.visibility = 'hidden';
        // this.currentModal.style.display = 'none';
        // document.body.style.overflow = '';
        this.currentModal = null;
      }
      // Reset submission flag when any modal closes
      this.isSubmitting = false; 
    },

    goToNextStep: function() {
      if (!this.currentModal) {
        console.error('No modal active');
        return;
      }

      const currentStep = this.currentModal.querySelector('.quiz-step.active');

      if (!currentStep) {
        console.error('No active step found in modal');
        return;
      }

      if (!this.validateStep(currentStep)) return;

      const nextStep = currentStep.nextElementSibling;
      if (!nextStep?.classList.contains('quiz-step')) return;

      currentStep.classList.remove('active');
      currentStep.style.opacity = '0';
      nextStep.classList.add('active');
      this.updateProgress();
    },

    goToPrevStep: function() {
      if (!this.currentModal) return;

      const currentStep = this.currentModal.querySelector('.quiz-step.active');
      if (!currentStep) return;

      const prevStep = currentStep.previousElementSibling;
      if (!prevStep?.classList.contains('quiz-step')) return;

      currentStep.classList.remove('active');
      prevStep.classList.add('active');
      this.updateProgress();
    },

    updateProgress: function() {
      if (!this.currentModal) return;

      const currentStep = this.currentModal.querySelector('.quiz-step.active');
      if (!currentStep) return;

      const allSteps = this.currentModal.querySelectorAll('.quiz-step');
      const currentStepNum = parseInt(currentStep.dataset.step);
      const totalSteps = allSteps.length;
      const isLastStep = currentStepNum === totalSteps;

      const progressEl = this.currentModal.querySelector('.quiz-progress');
      if (progressEl) {
        progressEl.textContent = `Step ${currentStepNum} of ${totalSteps}`;
      }

      const nextBtn = this.currentModal.querySelector('.quiz-next');
      const prevBtn = this.currentModal.querySelector('.quiz-prev');
      const submitBtn = this.currentModal.querySelector('.quiz-submit');

      if (nextBtn) nextBtn.style.display = isLastStep ? 'none' : 'block';
      if (submitBtn) submitBtn.style.display = isLastStep ? 'block' : 'none';
      if (prevBtn) prevBtn.disabled = currentStepNum === 1;
    },

    prepareSubmissionData: function() {
      const currentStep3 = this.currentModal.querySelector('[data-step="3"]');
      const email = currentStep3.querySelector('input[type="email"]').value;

      // Common data for both quizzes
      const baseData = {
        email: email,
        quizType: this.currentModal.id === 'new-site-quiz' ? 
          'New Site Consultation' : 'Existing Site Audit',
        timestamp: new Date().toISOString()
      };

      // Quiz-specific data
      if (this.currentModal.id === 'new-site-quiz') {
        return {
          ...baseData,
          purpose: this.userPurpose,
          brandMaterials: this.getBrandMaterials(),
          referralSource: document.querySelector('#referral-source')?.value // Add if you have this field
        };
      } else {
        return {
          ...baseData,
          siteUrl: this.siteUrl,
          issues: this.selectedIssues,
          urgency: document.querySelector('#urgency-level')?.value // Add if needed
        };
      }
    },

    // Helper method for brand materials
    getBrandMaterials: function() {
      const step2 = this.currentModal.querySelector('[data-step="2"]');
      const hasBranding = step2.querySelector('input[name="brandMaterials"]:checked')?.value === 'yes';
      
      if (!hasBranding) return { hasBranding: false };

      const materials = {
        hasBranding: true,
        colors: {
          primary: step2.querySelector('.brand-color-primary')?.value || '',
          secondary: step2.querySelector('.brand-color-secondary')?.value || ''
        },
        files: {}
      };

      // Get logo file if uploaded
      const logoFile = step2.querySelector('.brand-logo')?.files[0];
      if (logoFile) materials.files.logo = logoFile.name;

      // Get font file or URL
      const fontFile = step2.querySelector('.brand-font-file')?.files[0];
      const fontUrl = step2.querySelector('.brand-font-url')?.value;
      if (fontFile) materials.files.font = fontFile.name;
      if (fontUrl) materials.fontUrl = fontUrl;

      return materials;
    },

    /* =====================================
   FILE UPLOAD FUNCTIONALITY (PAID TIER)
   =====================================
   
    // handleFileUploads: function(submission) {
    //   // Future implementation for paid tier
    //   // Will handle direct file uploads to your server
    // },

    // Future submitQuiz() with file uploads:
    // submitQuiz: function() {
    //   // ... existing validation ...
    //
    //   this.handleFileUploads(submission)
    //     .then(() => this.sendNotifications(submission))
    //     .then(/* ... *\/)
    // }
    ===================================== */

    // Add this new method for file handling ( for non paid subscription that does not allow file uploads )
    handleFileUploads: function(submission) {
      return new Promise((resolve) => {
        const step2 = this.currentModal.querySelector('[data-step="2"]');
        const fileInfo = {
          logo: null,
          font: null
        };
    
        // Get file info without uploading
        if (step2) {
          const logoFile = step2.querySelector('.brand-logo')?.files[0];
          const fontFile = step2.querySelector('.brand-font-file')?.files[0];
          
          if (logoFile) {
            fileInfo.logo = {
              name: logoFile.name,
              size: (logoFile.size / 1024 / 1024).toFixed(2) + 'MB',
              type: logoFile.type
            };
          }
          
          if (fontFile) {
            fileInfo.font = {
              name: fontFile.name,
              size: (fontFile.size / 1024 / 1024).toFixed(2) + 'MB',
              type: fontFile.type
            };
          }
        }
    
        // Include file info in main submission
        submission.fileInfo = fileInfo;
        resolve(true);
      });
    },
    
    // Then modify sendNotifications():
    sendNotifications: async function(data) {
      const payload = {
        access_key: "ef80d7ef-9501-4189-add2-0530ffcaf0c0",
        subject: `New ${data.quizType} Submission`,
        email: data.email,
        // Format file info for email
        message: `
          ${JSON.stringify(data, null, 2)}
          ${data.fileInfo?.logo ? `\nLogo: ${data.fileInfo.logo.name} (${data.fileInfo.logo.size})` : ''}
          ${data.fileInfo?.font ? `\nFont: ${data.fileInfo.font.name} (${data.fileInfo.font.size})` : ''}
        `,
        // Important for formatting:
        reply_to: data.email,
        from_name: "Your Website Form"
      };
    
      try {
        const response = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        
        const result = await response.json();
        return result.success;
      } catch (error) {
        console.error('Submission error:', error);
        return false;
      }
    },
    // 3. Validation & Submission (Web3Forms Version)
    validateStep: function(step) {
      if (step.dataset.step === "2" && this.currentModal.id === 'new-site-quiz') {
        const hasBrandMaterials = step.querySelector('input[name="brandMaterials"]:checked')?.value === 'yes';
        
        if (hasBrandMaterials) {
          const logoFile = step.querySelector('.brand-logo').files[0];
          if (logoFile && logoFile.size > 2 * 1024 * 1024) {
            this.showError(step, 'Logo file must be under 2MB');
            return false;
          }
        }
      }

      const stepNum = step.dataset.step;
      
      if (this.currentModal.id === 'new-site-quiz') {
        if (stepNum === "1") {
          const select = step.querySelector('select');
          if (!select?.value) {
            this.showError(step, 'Please select an option');
            return false;
          }
          this.userPurpose = select.value;
        }
        else if (stepNum === "2") {
          const radio = step.querySelector('input[type="radio"]:checked');
          if (!radio) {
            this.showError(step, 'Please select an option');
            return false;
          }
          this.brandMaterials = radio.value;
        }
      }
      else if (this.currentModal.id === 'existing-site-quiz') {
        if (stepNum === "1") {
          const url = step.querySelector('input[type="url"]');
          if (!url?.value || !this.validateUrl(url.value)) {
            this.showError(step, 'Please enter a valid URL');
            return false;
          }
          this.siteUrl = url.value;
        }
        else if (stepNum === "2") {
          const checkboxes = step.querySelectorAll('input[type="checkbox"]:checked');
          if (checkboxes.length === 0) {
            this.showError(step, 'Please select at least one issue');
            return false;
          }
          this.selectedIssues = Array.from(checkboxes).map(cb => cb.value);
        }
      }

      this.clearError(step);
      return true;
    },

    validateUrl: function(url) {
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    },

    showError: function(container, message) {
      this.clearError(container);
      const errorEl = document.createElement('div');
      errorEl.className = 'quiz-error';
      errorEl.textContent = message;
      container.appendChild(errorEl);
    },

    clearError: function(container) {
      const existingError = container.querySelector('.quiz-error');
      if (existingError) existingError.remove();
    },

    // generateSummaryHTML: function(data) {
    //   let html = `<h3>Your ${data.quizType} Request</h3>`;
      
    //   // Common fields
    //   html += `<p><strong>Email:</strong> ${data.email}</p>`;
      
    //   // Quiz-specific fields
    //   if (data.quizType === 'New Site Consultation') {
    //     html += `<p><strong>Purpose:</strong> ${data.purpose}</p>`;
        
    //     if (data.brandMaterials.hasBranding) {
    //       html += `<div class="branding-summary">
    //         <p><strong>Brand Materials:</strong></p>
    //         <ul>`;
          
    //       if (data.brandMaterials.files.logo) {
    //         html += `<li>Logo: ${data.brandMaterials.files.logo}</li>`;
    //       }
          
    //       html += `<li>Colors: 
    //         <span style="color:${data.brandMaterials.colors.primary}">■</span> Primary,
    //         <span style="color:${data.brandMaterials.colors.secondary}">■</span> Secondary
    //       </li>`;
          
    //       if (data.brandMaterials.files.font) {
    //         html += `<li>Font File: ${data.brandMaterials.files.font}</li>`;
    //       }
          
    //       if (data.brandMaterials.fontUrl) {
    //         html += `<li>Font Reference: <a href="${data.brandMaterials.fontUrl}" target="_blank">View</a></li>`;
    //       }
          
    //       html += `</ul></div>`;
    //     }
    //   } else {
    //     // Existing site summary
    //     html += `<p><strong>Site URL:</strong> ${data.siteUrl}</p>
    //              <p><strong>Issues:</strong> ${data.issues.join(', ')}</p>`;
    //   }
      
    //   return html;
    // },
    // Add this to your Quiz object
    generateSummaryHTML: function(data) {
      let html = `
        <h3>Your ${data.quizType} Request</h3>
        <p><strong>Email:</strong> ${data.email}</p>
      `;

      if (data.quizType.includes('New Site')) {
        html += `
          <p><strong>Purpose:</strong> ${data.details.purpose || 'Not specified'}</p>
          <p><strong>Brand Materials:</strong> ${data.details.brandMaterials || 'Not specified'}</p>
        `;
      } else {
        html += `
          <p><strong>Site URL:</strong> ${data.details.siteUrl || 'Not provided'}</p>
          <p><strong>Issues:</strong> ${data.details.issues?.join(', ') || 'None specified'}</p>
        `;
      }

      return html;
    },
    
    formatSubmissionEmail: function(data) {
      let message = `
        <h2>New ${data.quizType} Submission</h2>
        <p><strong>Email:</strong> ${data.email}</p>
      `;
    
      // New Site Quiz
      if (data.quizType.includes('New Site')) {
        message += `
          <p><strong>Purpose:</strong> ${data.purpose}</p>
          <p><strong>Brand Materials:</strong> ${data.brandMaterials.hasBranding ? 'Yes' : 'No'}</p>
        `;
        
        if (data.fileInfo?.logo) {
          message += `<p><strong>Logo File:</strong> ${data.fileInfo.logo.name} (${data.fileInfo.logo.size})</p>`;
        }
        if (data.brandMaterials?.colors) {
          message += `
            <p><strong>Brand Colors:</strong></p>
            <ul>
              <li>Primary: ${data.brandMaterials.colors.primary}</li>
              <li>Secondary: ${data.brandMaterials.colors.secondary}</li>
            </ul>
          `;
        }
      } 
      // Existing Site Quiz
      else {
        message += `
          <p><strong>Site URL:</strong> ${data.siteUrl}</p>
          <p><strong>Reported Issues:</strong> ${data.issues.join(', ')}</p>
        `;
      }
    
      return message;
    },

    // Thank you modal
        
    
    // Current working version (no file uploads)
    submitQuiz: function() {
      if (!this.currentModal) return;
      
      const currentStep = this.currentModal.querySelector('.quiz-step.active');
      if (!currentStep || currentStep.dataset.step !== "3") return;

      // Validate
      if (!this.validateStep(currentStep)) return;

      // Prepare data
      const emailInput = currentStep.querySelector('input[type="email"]');
      const submission = {
        email: emailInput.value,
        quizType: this.currentModal.id === 'new-site-quiz' ? 
          'New Site Consultation' : 'Existing Site Audit',
        details: {
          purpose: this.userPurpose,
          brandMaterials: this.brandMaterials,
          siteUrl: this.siteUrl,
          issues: this.selectedIssues
        }
      };

      const summaryHTML = this.generateSummaryHTML(submission);

      // Simple submission without file handling
      this.sendNotifications(submission)
        .then(success => {
          this.showThankYou(summaryHTML, submission.email, success);
        })
        .catch(error => {
          console.error('Submission error:', error);
          this.showThankYou(summaryHTML, submission.email, false);
        });
    },

    // sendNotifications: async function(data) {
    //     // Temporary local testing solution
    //     const isLocalhost = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost';

    //     // 1. Prepare Web3Forms payload (PROVEN WORKING VERSION)
    //     const payload = {
    //       access_key: "ef80d7ef-9501-4189-add2-0530ffcaf0c0", // Your actual key
    //       subject: `New ${data.quizType} Submission`,
    //       email: data.email,
    //       quiz_type: data.quizType,
    //       details: JSON.stringify(data.details, null, 2),
    //       from_name: "jamesdennis.org", // Critical for deliverability
    //       reply_to: data.email, // So you can reply directly
    //       ...(isLocalhost && { redirect: false }) // Disable redirect on localhost
    //       // demo: true, // Test mode (disable in production)
    //       // redirect: "https://yourdomain.com/thank-you" // Optional
    //     };
    
    //     // 2. Submit to Web3Forms
    //     try {
    //       const response = await fetch("https://api.web3forms.com/submit", {
    //         method: "POST",
    //         headers: { "Content-Type": "application/json" },
    //         body: JSON.stringify(payload)
    //       });
      
    //       const result = await response.json();
    //       return result.success;
    //     } catch (error) {
    //       console.error('Submission error:', error);
    //       return false;
    //     }
    // },
    
    showThankYou: function(summaryHTML, userEmail, emailSuccess) {
      document.querySelectorAll('.thank-you-modal').forEach(modal => modal.remove());
      
      const modalHTML = `
          <div class="thank-you-modal">
          <div class="thank-you-content">
              ${summaryHTML}
              <div class="confirmation-message">
              <p>We've sent a confirmation to <strong>${userEmail}</strong>.</p>
              ${emailSuccess ? 
                  '' : 
                  '<p class="error-note">(Email delivery failed - but we received your request!)</p>'
              }
              <p>You'll receive your report within 48 hours.</p>
              </div>
              <button class="close-thank-you">Done</button>
          </div>
          </div>
      `;
      
    // Inject into DOM
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.body.style.overflow = 'hidden';
    
    // Close handler
    document.querySelector('.close-thank-you').addEventListener('click', () => {
          document.querySelector('.thank-you-modal').remove();
          document.body.style.overflow = '';
          this.closeModal();
      });
    },

    // showNotification: function(message) {
    //   // Remove existing notifications
    //   document.querySelector('.quiz-notification')?.remove();
      
    //   const notification = document.createElement('div');
    //   notification.className = 'quiz-notification';
    //   notification.innerHTML = `
    //     <p>${message}</p>
    //     <button class="close-notification">&times;</button>
    //   `;
      
    //   document.body.appendChild(notification);
      
    //   // Auto-hide after 5 seconds
    //   setTimeout(() => {
    //     notification.style.opacity = '0';
    //     setTimeout(() => notification.remove(), 300);
    //   }, 5000);
      
    //   // Manual close
    //   notification.querySelector('.close-notification').addEventListener('click', () => {
    //     notification.remove();
    //   });
    // },
  };

  Quiz.init();
});