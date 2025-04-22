// script.js (Updated to handle FormSubmit responses better)

document.addEventListener('DOMContentLoaded', function() {

    // --- Mobile Navigation Toggle ---
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const closeMenuButton = document.querySelector('.close-menu-btn');
    const mobileNavLinks = document.querySelectorAll('.nav-list-mobile a');
    const bodyElement = document.body;

    if (menuToggle && mobileMenu && closeMenuButton) {
        menuToggle.addEventListener('click', () => {
            mobileMenu.classList.add('active');
            bodyElement.classList.add('mobile-menu-active');
        });
        closeMenuButton.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            bodyElement.classList.remove('mobile-menu-active');
        });
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (link.getAttribute('href').startsWith('#')) {
                    mobileMenu.classList.remove('active');
                    bodyElement.classList.remove('mobile-menu-active');
                }
            });
        });
    }

    // --- Experience Accordion ---
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    accordionHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const accordionItem = this.parentElement;
            const accordionContent = this.nextElementSibling;
            const icon = this.querySelector('.icon');
            const isActive = this.classList.contains('active');

            accordionHeaders.forEach(otherHeader => {
                if (otherHeader !== this && otherHeader.classList.contains('active')) {
                    otherHeader.classList.remove('active');
                    const otherContent = otherHeader.nextElementSibling;
                    otherContent.style.maxHeight = null;
                    otherContent.style.paddingTop = '0';
                    otherContent.style.paddingBottom = '0';
                    const otherIcon = otherHeader.querySelector('.icon');
                    if (otherIcon) otherIcon.textContent = '+';
                }
            });

            if (!isActive) {
                this.classList.add('active');
                accordionContent.style.maxHeight = accordionContent.scrollHeight + "px";
                accordionContent.style.paddingTop = '20px';
                accordionContent.style.paddingBottom = '20px';
                 if (icon) icon.textContent = '-';
            } else {
                 this.classList.remove('active');
                 accordionContent.style.maxHeight = null;
                 accordionContent.style.paddingTop = '0';
                 accordionContent.style.paddingBottom = '0';
                 if (icon) icon.textContent = '+';
            }
        });
    });

    // --- "Let's Talk/Chat" Button Scroll ---
    const ctaButton = document.querySelector('.cta-button[href="#contact"]');
    const contactSection = document.getElementById('contact');
    if (ctaButton && contactSection) {
        ctaButton.addEventListener('click', (event) => {
            event.preventDefault();
            contactSection.scrollIntoView({ behavior: 'smooth' });
        });
    }

    // --- Contact Form Tag Selection ---
    const tags = document.querySelectorAll('.tag');
    const selectedInterestsInput = document.getElementById('selected-interests');
    let selectedInterests = [];
    if (tags.length > 0 && selectedInterestsInput) {
        tags.forEach(tag => {
            tag.addEventListener('click', () => {
                tag.classList.toggle('active');
                const interest = tag.getAttribute('data-interest');
                if (tag.classList.contains('active')) {
                    if (!selectedInterests.includes(interest)) {
                        selectedInterests.push(interest);
                    }
                } else {
                    selectedInterests = selectedInterests.filter(item => item !== interest);
                }
                selectedInterestsInput.value = selectedInterests.join(', ');
            });
        });
    }

    // --- Contact Form Validation & AJAX Submission ---
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status'); // Message area below button

    if (contactForm && formStatus) { // Ensure both form and status area exist
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevent default form submission
            formStatus.textContent = ''; // Clear previous status
            formStatus.className = ''; // Reset status class
            let isValid = true;

            // Get form fields
            const nameInput = document.getElementById('name');
            const emailInput = document.getElementById('email');
            const messageInput = document.getElementById('message');
            const phoneInput = document.getElementById('phone');
            const subjectInput = document.getElementById('subject');
            // Hidden input for selected interests is handled via selectedInterestsInput

            // Clear previous errors
            clearError(nameInput);
            clearError(emailInput);
            clearError(messageInput);

            // Validate Required Fields
            if (!nameInput || nameInput.value.trim() === '') {
                showError(nameInput, 'Name is required.');
                isValid = false;
            }
            if (!emailInput || emailInput.value.trim() === '') {
                showError(emailInput, 'Email is required.');
                isValid = false;
            } else if (!isValidEmail(emailInput.value.trim())) {
                showError(emailInput, 'Please enter a valid email address.');
                isValid = false;
            }
            if (!messageInput || messageInput.value.trim() === '') {
                 showError(messageInput, 'Please write a message!');
                 isValid = false;
            }

            // If validation passes, proceed with AJAX submission
            if (isValid) {
                // --- Form Submission using Fetch to FormSubmit (Improved Handling) ---
                const formData = new FormData(contactForm);
                const formAction = contactForm.getAttribute('action');
                const submitButton = contactForm.querySelector('button[type="submit"]');
                const originalButtonText = submitButton.innerHTML;

                // Disable button and show sending state
                submitButton.disabled = true;
                submitButton.innerHTML = 'Sending... <i class="fas fa-spinner fa-spin"></i>';
                formStatus.textContent = '';
                formStatus.className = '';

                fetch(formAction, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json' // Signal preference for JSON
                    }
                })
                .then(response => {
                    // Check if the response status is OK (2xx)
                    if (response.ok) {
                        // Treat OK response as success, even if it's HTML (like captcha success)
                        return Promise.resolve('Success');
                    } else {
                        // If status is not OK, try to get error details as JSON
                        return response.json().then(errData => {
                            // Throw an error with message from FormSubmit if possible
                            throw new Error(errData.error || `Form submission failed. Status: ${response.status}`);
                        }).catch(() => {
                            // If no JSON error body, throw generic error based on status
                            throw new Error(`Form submission failed. Status: ${response.status}`);
                        });
                    }
                })
                .then(status => {
                    // This block runs if the fetch resolved successfully (status is 'Success')
                    console.log('FormSubmit status:', status);
                    formStatus.textContent = 'Message sent successfully! Thank you.';
                    formStatus.className = 'success';
                    contactForm.reset(); // Clear the form fields

                    // Reset tags visually and clear the hidden input value
                    tags.forEach(tag => tag.classList.remove('active'));
                    selectedInterests = []; // Clear the JS array
                    if (selectedInterestsInput) selectedInterestsInput.value = ''; // Clear hidden input

                    // Clear any potential validation errors that might have been missed
                    clearError(nameInput);
                    clearError(emailInput);
                    clearError(messageInput);
                })
                .catch(error => {
                    // This block catches network errors or errors thrown above
                    console.error('Error submitting form:', error);
                    formStatus.textContent = `Oops! Error: ${error.message || 'Please try again.'}`;
                    formStatus.className = 'error';
                })
                .finally(() => {
                    // Re-enable button and restore text regardless of outcome
                    submitButton.disabled = false;
                    submitButton.innerHTML = originalButtonText;

                    // Hide status message after a delay (only if it's a success message)
                    setTimeout(() => {
                        if (formStatus.classList.contains('success')) {
                           formStatus.textContent = '';
                           formStatus.className = '';
                        }
                    }, 6000);
                });
                // --- End Fetch Submission ---

            } else {
                 // If validation failed
                 formStatus.textContent = 'Oops! Please check the fields above.';
                 formStatus.className = 'error';
            }
        });
    } // End if(contactForm && formStatus)

    // --- Helper functions for validation ---
    function showError(inputElement, message) {
        if (!inputElement) { console.warn("showError called with null inputElement."); return; }
        const formGroup = inputElement.closest('.form-group');
        if (!formGroup) { console.warn("Could not find .form-group ancestor for", inputElement); return; }
        const errorElement = formGroup.querySelector('.error-message');
        if (errorElement) { formGroup.classList.add('error'); errorElement.textContent = message; errorElement.style.visibility = 'visible'; }
        else { console.warn("Could not find .error-message element within", formGroup); }
    }

    function clearError(inputElement) {
         if (!inputElement) { console.warn("clearError called with null inputElement."); return; }
         const formGroup = inputElement.closest('.form-group');
         if (!formGroup) { console.warn("Could not find .form-group ancestor for", inputElement); return; }
         const errorElement = formGroup.querySelector('.error-message');
         if (errorElement) { formGroup.classList.remove('error'); errorElement.textContent = ''; errorElement.style.visibility = 'hidden'; }
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

}); // End DOMContentLoaded