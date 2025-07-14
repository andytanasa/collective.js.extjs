/*!
 * Ext JS Library 3.4.0 - Form Panel Accessibility Override
 * Copyright(c) 2006-2011 Sencha Inc.
 * Accessibility Enhancement for WCAG AA Compliance
 * 
 * This override provides comprehensive accessibility features for Ext.form.FormPanel
 * including proper ARIA attributes, keyboard navigation, screen reader support,
 * validation announcements, and form submission accessibility.
 */

Ext.onReady(function() {
    
    // ====================================
    // FormPanel Accessibility Enhancement
    // ====================================
    
    Ext.override(Ext.form.FormPanel, {
        
        // Accessibility configuration
        accessibilityConfig: {
            ariaForm: true,
            announceValidation: true,
            announceSubmission: true,
            screenReaderSupport: true,
            keyboardNavigation: true,
            highContrast: true,
            formInstructions: true,
            errorSummary: true
        },
        
        initComponent: function() {
            // Call original initComponent
            Ext.form.FormPanel.superclass.initComponent.call(this);
            
            // Initialize accessibility features
            this.initFormAccessibility();
        },
        
        initFormAccessibility: function() {
            // Add accessibility event listeners
            this.on('render', this.setupFormAccessibility, this);
            this.on('clientvalidation', this.onFormValidation, this);
            this.on('beforesubmit', this.onBeforeFormSubmit, this);
            this.on('actioncomplete', this.onFormActionComplete, this);
            this.on('actionfailed', this.onFormActionFailed, this);
        },
        
        setupFormAccessibility: function() {
            if (!this.rendered || !this.el) return;
            
            try {
                // Set up form ARIA attributes
                this.setupFormARIA();
                
                // Set up form instructions
                if (this.accessibilityConfig.formInstructions) {
                    this.setupFormInstructions();
                }
                
                // Set up error summary region
                if (this.accessibilityConfig.errorSummary) {
                    this.setupErrorSummary();
                }
                
                // Set up form submission accessibility
                this.setupFormSubmissionAccessibility();
                
                // Set up keyboard navigation
                if (this.accessibilityConfig.keyboardNavigation) {
                    this.setupFormKeyboardSupport();
                }
                
                // Set up high contrast support
                if (this.accessibilityConfig.highContrast) {
                    this.setupFormHighContrastSupport();
                }
                
            } catch (e) {
                console.warn('FormOverride: Error setting up FormPanel accessibility:', e);
            }
        },
        
        setupFormARIA: function() {
            if (!this.el) return;
            
            // Set form role and attributes
            this.el.set({
                'role': 'form',
                'aria-label': this.title || this.formTitle || 'Form'
            });
            
            // Set novalidate to handle validation ourselves
            var formEl = this.el.child('form');
            if (formEl) {
                formEl.set({'novalidate': 'novalidate'});
            }
        },
        
        setupFormInstructions: function() {
            var instructionsId = this.id + '-instructions';
            var instructions = this.formInstructions || this.getDefaultFormInstructions();
            
            if (instructions) {
                // Create instructions element
                var instructionsEl = Ext.DomHelper.insertFirst(this.el, {
                    tag: 'div',
                    id: instructionsId,
                    cls: 'x-form-instructions',
                    html: instructions
                });
                
                // Link instructions to form
                this.el.set({'aria-describedby': instructionsId});
            }
        },
        
        getDefaultFormInstructions: function() {
            var parts = [];
            
            // Basic instructions
            parts.push('Fill out this form and submit when complete.');
            
            // Required field instructions
            var hasRequiredFields = this.hasRequiredFields();
            if (hasRequiredFields) {
                parts.push('Fields marked as required must be filled out.');
            }
            
            // Keyboard instructions
            parts.push('Use Tab to navigate between fields.');
            
            return parts.join(' ');
        },
        
        hasRequiredFields: function() {
            var hasRequired = false;
            
            if (this.items) {
                this.items.each(function(item) {
                    if (item.allowBlank === false) {
                        hasRequired = true;
                        return false; // Stop iteration
                    }
                });
            }
            
            return hasRequired;
        },
        
        setupErrorSummary: function() {
            // Create error summary container
            this.errorSummaryId = this.id + '-error-summary';
            
            var errorSummaryEl = Ext.DomHelper.insertFirst(this.el, {
                tag: 'div',
                id: this.errorSummaryId,
                cls: 'x-form-error-summary',
                'aria-live': 'assertive',
                'aria-atomic': 'true',
                'role': 'alert',
                style: 'display: none;'
            });
        },
        
        setupFormSubmissionAccessibility: function() {
            // Set up submit button accessibility
            this.setupSubmitButtonAccessibility();
            
            // Set up loading state accessibility
            this.setupLoadingStateAccessibility();
        },
        
        setupSubmitButtonAccessibility: function() {
            // Find submit buttons and enhance them
            if (this.buttons) {
                for (var i = 0; i < this.buttons.length; i++) {
                    var button = this.buttons[i];
                    if (button && (button.formBind || button.type === 'submit')) {
                        this.enhanceSubmitButton(button);
                    }
                }
            }
            
            // Also check for buttons in footer bar
            if (this.fbar && this.fbar.items) {
                this.fbar.items.each(function(button) {
                    if (button.formBind || button.type === 'submit') {
                        this.enhanceSubmitButton(button);
                    }
                }, this);
            }
        },
        
        enhanceSubmitButton: function(button) {
            if (!button || !button.el) return;
            
            // Add form submission attributes
            button.el.set({
                'aria-describedby': this.id + '-submit-instructions'
            });
            
            // Create submit instructions if they don't exist
            if (!Ext.get(this.id + '-submit-instructions')) {
                Ext.DomHelper.insertAfter(button.el, {
                    tag: 'div',
                    id: this.id + '-submit-instructions',
                    cls: 'x-form-submit-instructions x-hidden-accessibility',
                    html: 'Submit the form. The form will be validated before submission.'
                });
            }
        },
        
        setupLoadingStateAccessibility: function() {
            // Create loading announcement container
            this.loadingAnnouncementId = this.id + '-loading-announcement';
            
            Ext.DomHelper.append(document.body, {
                tag: 'div',
                id: this.loadingAnnouncementId,
                cls: 'x-hidden-accessibility',
                'aria-live': 'assertive',
                'aria-atomic': 'true'
            });
        },
        
        setupFormKeyboardSupport: function() {
            if (!this.el) return;
            
            // Enhanced keyboard navigation for form
            this.mon(this.el, {
                scope: this,
                keydown: this.onFormKeyDown
            });
        },
        
        onFormKeyDown: function(e) {
            var key = e.getKey();
            
            // Handle Ctrl+Enter for form submission
            if (e.ctrlKey && key === e.ENTER) {
                var activeElement = document.activeElement;
                
                // Only submit if not in a textarea (where Ctrl+Enter might be used for new lines)
                if (activeElement && activeElement.tagName.toLowerCase() !== 'textarea') {
                    this.submitForm();
                    e.stopEvent();
                }
            }
            
            // Handle Escape to reset form focus
            if (key === e.ESC) {
                this.resetFormFocus();
            }
        },
        
        submitForm: function() {
            // Find and trigger the submit button
            var submitButton = this.findSubmitButton();
            if (submitButton && submitButton.handler) {
                submitButton.handler.call(submitButton.scope || submitButton, submitButton);
            } else if (this.getForm && this.getForm()) {
                this.getForm().submit();
            }
        },
        
        findSubmitButton: function() {
            var submitButton = null;
            
            // Check buttons array
            if (this.buttons) {
                for (var i = 0; i < this.buttons.length; i++) {
                    var button = this.buttons[i];
                    if (button.formBind || button.type === 'submit') {
                        submitButton = button;
                        break;
                    }
                }
            }
            
            // Check footer bar
            if (!submitButton && this.fbar && this.fbar.items) {
                this.fbar.items.each(function(button) {
                    if (button.formBind || button.type === 'submit') {
                        submitButton = button;
                        return false; // Stop iteration
                    }
                });
            }
            
            return submitButton;
        },
        
        resetFormFocus: function() {
            // Move focus to the first focusable field in the form
            var firstField = this.findFirstFocusableField();
            if (firstField && firstField.focus) {
                firstField.focus();
            }
        },
        
        findFirstFocusableField: function() {
            var firstField = null;
            
            if (this.items) {
                this.items.each(function(item) {
                    if (item.focus && !item.disabled && !item.hidden) {
                        firstField = item;
                        return false; // Stop iteration
                    }
                });
            }
            
            return firstField;
        },
        
        setupFormHighContrastSupport: function() {
            if (!this.el) return;
            
            this.el.addClass('x-accessibility-form');
            
            // Add focus indicators for form sections
            this.el.addClass('x-accessibility-focus-indicator');
        },
        
        onFormValidation: function(form, valid) {
            if (!this.accessibilityConfig) return;
            
            // Update error summary
            this.updateErrorSummary(form, valid);
            
            // Announce validation result
            if (this.accessibilityConfig.announceValidation && this.accessibilityConfig.screenReaderSupport) {
                var announcement = valid ? 
                    'Form validation passed' : 
                    'Form validation failed. Please check the errors and try again.';
                this.announceToScreenReader(announcement, 'assertive');
            }
        },
        
        updateErrorSummary: function(form, valid) {
            var errorSummaryEl = Ext.get(this.errorSummaryId);
            if (!errorSummaryEl) return;
            
            if (!valid) {
                // Collect all validation errors
                var errors = this.collectFormErrors();
                
                if (errors.length > 0) {
                    var errorHtml = this.buildErrorSummaryHTML(errors);
                    errorSummaryEl.update(errorHtml);
                    errorSummaryEl.show();
                    
                    // Focus the error summary
                    errorSummaryEl.focus();
                }
            } else {
                // Hide error summary when form is valid
                errorSummaryEl.hide();
                errorSummaryEl.update('');
            }
        },
        
        collectFormErrors: function() {
            var errors = [];
            
            if (this.items) {
                this.items.each(function(item) {
                    if (item.isFormField && item.isValid && !item.isValid()) {
                        var error = {
                            field: item,
                            label: item.fieldLabel || item.name || 'Field',
                            message: item.getActiveError ? item.getActiveError() : 'Invalid value'
                        };
                        errors.push(error);
                    }
                });
            }
            
            return errors;
        },
        
        buildErrorSummaryHTML: function(errors) {
            var html = ['<h3>Form Errors</h3>'];
            html.push('<p>The following fields have errors that need to be corrected:</p>');
            html.push('<ul>');
            
            for (var i = 0; i < errors.length; i++) {
                var error = errors[i];
                html.push('<li>');
                html.push('<strong>' + Ext.util.Format.htmlEncode(error.label) + ':</strong> ');
                html.push(Ext.util.Format.htmlEncode(error.message));
                html.push('</li>');
            }
            
            html.push('</ul>');
            return html.join('');
        },
        
        onBeforeFormSubmit: function(form, action) {
            if (!this.accessibilityConfig.announceSubmission) return;
            
            // Announce form submission start
            this.announceToScreenReader('Submitting form, please wait...', 'assertive');
            
            // Update loading state
            this.updateLoadingState(true);
        },
        
        onFormActionComplete: function(form, action) {
            if (!this.accessibilityConfig.announceSubmission) return;
            
            // Announce successful submission
            var message = 'Form submitted successfully';
            if (action.result && action.result.msg) {
                message = action.result.msg;
            }
            
            this.announceToScreenReader(message, 'assertive');
            
            // Update loading state
            this.updateLoadingState(false);
        },
        
        onFormActionFailed: function(form, action) {
            if (!this.accessibilityConfig.announceSubmission) return;
            
            // Announce submission failure
            var message = 'Form submission failed';
            if (action.result && action.result.msg) {
                message = action.result.msg;
            } else if (action.failureType) {
                switch (action.failureType) {
                    case Ext.form.Action.CLIENT_INVALID:
                        message = 'Form contains invalid data. Please correct errors and try again.';
                        break;
                    case Ext.form.Action.SERVER_INVALID:
                        message = 'Server rejected the form data. Please check your input.';
                        break;
                    case Ext.form.Action.CONNECT_FAILURE:
                        message = 'Connection error. Please check your network and try again.';
                        break;
                }
            }
            
            this.announceToScreenReader(message, 'assertive');
            
            // Update loading state
            this.updateLoadingState(false);
        },
        
        updateLoadingState: function(loading) {
            var loadingEl = Ext.get(this.loadingAnnouncementId);
            if (!loadingEl) return;
            
            if (loading) {
                loadingEl.update('Form is being submitted...');
                
                // Disable form elements to prevent changes during submission
                this.setFormDisabled(true);
            } else {
                loadingEl.update('');
                
                // Re-enable form elements
                this.setFormDisabled(false);
            }
        },
        
        setFormDisabled: function(disabled) {
            if (this.items) {
                this.items.each(function(item) {
                    if (item.setDisabled) {
                        item.setDisabled(disabled);
                    }
                });
            }
            
            // Also disable buttons
            if (this.buttons) {
                for (var i = 0; i < this.buttons.length; i++) {
                    if (this.buttons[i].setDisabled) {
                        this.buttons[i].setDisabled(disabled);
                    }
                }
            }
        },
        
        // Override add method to ensure new fields have accessibility setup
        add: function(component) {
            var result = Ext.form.FormPanel.superclass.add.apply(this, arguments);
            
            // Set up accessibility for newly added field
            if (component && component.isFormField && this.rendered) {
                this.setupFieldAccessibility(component);
            }
            
            return result;
        },
        
        setupFieldAccessibility: function(field) {
            // Basic accessibility setup for dynamically added fields
            if (!field.rendered) {
                field.on('render', function() {
                    this.enhanceFieldAccessibility(field);
                }, this, {single: true});
            } else {
                this.enhanceFieldAccessibility(field);
            }
        },
        
        enhanceFieldAccessibility: function(field) {
            if (!field.el) return;
            
            // Ensure field has proper ARIA attributes
            if (field.allowBlank === false) {
                field.el.set({'aria-required': 'true'});
            }
            
            // Set up field validation announcements
            field.on('invalid', function(f, msg) {
                if (this.accessibilityConfig.announceValidation) {
                    this.announceToScreenReader('Field error: ' + msg, 'assertive');
                }
            }, this);
        },
        
        announceToScreenReader: function(message, priority) {
            if (!message) return;
            
            priority = priority || 'polite';
            
            var announcement = Ext.DomHelper.append(document.body, {
                tag: 'div',
                cls: 'x-hidden-accessibility',
                'aria-live': priority,
                'aria-atomic': 'true',
                html: message
            });
            
            // Remove announcement after a short delay
            setTimeout(function() {
                if (announcement && announcement.parentNode) {
                    announcement.parentNode.removeChild(announcement);
                }
            }, 1000);
        },
        
        // Override destroy to clean up accessibility resources
        beforeDestroy: function() {
            // Clean up loading announcement element
            var loadingEl = Ext.get(this.loadingAnnouncementId);
            if (loadingEl) {
                loadingEl.remove();
            }
            
            // Call original method
            Ext.form.FormPanel.superclass.beforeDestroy.apply(this, arguments);
        }
    });
    
    // ====================================
    // FormPanel Accessibility Styles
    // ====================================
    
    var formAccessibilityStyles = [
        '.x-hidden-accessibility {',
        '    position: absolute !important;',
        '    clip: rect(1px, 1px, 1px, 1px) !important;',
        '    width: 1px !important;',
        '    height: 1px !important;',
        '    overflow: hidden !important;',
        '    border: 0 !important;',
        '    padding: 0 !important;',
        '    margin: 0 !important;',
        '}',
        '',
        '.x-accessibility-form:focus-within {',
        '    outline: 2px solid #0078d4 !important;',
        '    outline-offset: 2px !important;',
        '}',
        '',
        '.x-form-instructions {',
        '    background: #f3f2f1;',
        '    border: 1px solid #8a8886;',
        '    padding: 12px;',
        '    margin-bottom: 16px;',
        '    border-radius: 4px;',
        '    font-size: 14px;',
        '    color: #323130;',
        '}',
        '',
        '.x-form-error-summary {',
        '    background: #fdf2f2;',
        '    border: 2px solid #d83b01;',
        '    padding: 12px;',
        '    margin-bottom: 16px;',
        '    border-radius: 4px;',
        '    color: #a4262c;',
        '}',
        '',
        '.x-form-error-summary h3 {',
        '    margin: 0 0 8px 0;',
        '    color: #a4262c;',
        '    font-size: 16px;',
        '    font-weight: bold;',
        '}',
        '',
        '.x-form-error-summary ul {',
        '    margin: 8px 0 0 0;',
        '    padding-left: 20px;',
        '}',
        '',
        '.x-form-error-summary li {',
        '    margin-bottom: 4px;',
        '}',
        '',
        '.x-form-submit-instructions {',
        '    font-size: 12px;',
        '    color: #666;',
        '    margin-top: 4px;',
        '}',
        '',
        '@media (prefers-contrast: high) {',
        '    .x-accessibility-form {',
        '        border: 2px solid ButtonText !important;',
        '        background: Field !important;',
        '        color: FieldText !important;',
        '    }',
        '    .x-accessibility-form:focus-within {',
        '        outline: 3px solid Highlight !important;',
        '    }',
        '    .x-form-instructions {',
        '        background: Field !important;',
        '        border: 2px solid ButtonText !important;',
        '        color: FieldText !important;',
        '    }',
        '    .x-form-error-summary {',
        '        background: Field !important;',
        '        border: 3px solid #ff0000 !important;',
        '        color: #ff0000 !important;',
        '    }',
        '    .x-form-error-summary h3 {',
        '        color: #ff0000 !important;',
        '    }',
        '}',
        '',
        '@media (prefers-reduced-motion: reduce) {',
        '    .x-accessibility-form * {',
        '        transition: none !important;',
        '    }',
        '}'
    ].join('\n');
    
    // Inject styles
    var styleSheet = document.createElement('style');
    styleSheet.type = 'text/css';
    styleSheet.innerHTML = formAccessibilityStyles;
    document.getElementsByTagName('head')[0].appendChild(styleSheet);
    
    console.log('FormOverride: FormPanel accessibility features loaded successfully');
});
