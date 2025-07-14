/*!
 * Ext JS Library 3.4.0 - TextField Accessibility Override
 * Copyright(c) 2006-2011 Sencha Inc.
 * Accessibility Enhancement for WCAG AA Compliance
 * 
 * This override provides comprehensive accessibility features for Ext.form.TextField
 * including proper ARIA attributes, keyboard navigation, screen reader support,
 * and input validation announcements.
 */

Ext.onReady(function() {
    
    // ====================================
    // TextField Accessibility Enhancement
    // ====================================
    
    Ext.override(Ext.form.TextField, {
        
        // Accessibility configuration
        accessibilityConfig: {
            ariaDescribedBy: true,
            announceValidation: true,
            announceChanges: false, // Usually too verbose for text fields
            screenReaderSupport: true,
            keyboardNavigation: true,
            highContrast: true
        },
        
        initComponent: function() {
            // Call original initComponent
            Ext.form.TextField.superclass.initComponent.call(this);
            
            // Initialize accessibility features
            this.initTextFieldAccessibility();
        },
        
        initTextFieldAccessibility: function() {
            // Add accessibility event listeners
            this.on('render', this.setupTextFieldAccessibility, this);
            this.on('focus', this.onTextFieldFocus, this);
            this.on('blur', this.onTextFieldBlur, this);
            this.on('change', this.onTextFieldChange, this);
            this.on('invalid', this.onTextFieldInvalid, this);
            this.on('valid', this.onTextFieldValid, this);
        },
        
        setupTextFieldAccessibility: function() {
            if (!this.rendered || !this.el) return;
            
            try {
                // Set up basic ARIA attributes
                this.setupTextFieldARIA();
                
                // Set up descriptions and help text
                this.setupTextFieldDescriptions();
                
                // Set up validation messages
                this.setupValidationAccessibility();
                
                // Set up high contrast support
                if (this.accessibilityConfig.highContrast) {
                    this.setupTextFieldHighContrastSupport();
                }
                
                // Set up keyboard navigation enhancements
                if (this.accessibilityConfig.keyboardNavigation) {
                    this.setupTextFieldKeyboardSupport();
                }
                
            } catch (e) {
                console.warn('TextFieldOverride: Error setting up TextField accessibility:', e);
            }
        },
        
        setupTextFieldARIA: function() {
            if (!this.el) return;
            
            var inputEl = this.el;
            
            // Set basic ARIA attributes
            inputEl.set({
                'role': 'textbox',
                'aria-required': this.allowBlank === false ? 'true' : 'false'
            });
            
            // Set aria-label or aria-labelledby
            if (this.fieldLabel) {
                inputEl.set({'aria-label': this.fieldLabel});
            }
            
            // Set input type specific attributes
            if (this.inputType) {
                switch (this.inputType) {
                    case 'email':
                        inputEl.set({'aria-describedby': (inputEl.getAttribute('aria-describedby') || '') + ' email-format-hint'});
                        break;
                    case 'url':
                        inputEl.set({'aria-describedby': (inputEl.getAttribute('aria-describedby') || '') + ' url-format-hint'});
                        break;
                    case 'tel':
                        inputEl.set({'aria-describedby': (inputEl.getAttribute('aria-describedby') || '') + ' phone-format-hint'});
                        break;
                }
            }
            
            // Set maxlength information
            if (this.maxLength && this.maxLength > 0) {
                var currentLength = this.getValue() ? this.getValue().length : 0;
                inputEl.set({
                    'aria-describedby': (inputEl.getAttribute('aria-describedby') || '') + ' char-count-info',
                    'aria-label': (inputEl.getAttribute('aria-label') || this.fieldLabel || 'Text field') + 
                                  '. Maximum ' + this.maxLength + ' characters, ' + currentLength + ' entered.'
                });
            }
            
            // Set placeholder as description if present
            if (this.emptyText) {
                inputEl.set({'aria-placeholder': this.emptyText});
            }
        },
        
        setupTextFieldDescriptions: function() {
            if (!this.accessibilityConfig.ariaDescribedBy) return;
            
            var descriptions = [];
            var inputEl = this.el;
            
            // Add help text description
            if (this.helpText) {
                var helpId = this.id + '-help';
                descriptions.push(helpId);
                
                // Create help text element
                var helpEl = Ext.DomHelper.insertAfter(inputEl, {
                    tag: 'div',
                    id: helpId,
                    cls: 'x-form-help-text x-hidden-accessibility',
                    html: this.helpText
                });
            }
            
            // Add format hints for special input types
            if (this.inputType) {
                var hintId = this.id + '-format-hint';
                var hintText = this.getFormatHint();
                if (hintText) {
                    descriptions.push(hintId);
                    
                    var hintEl = Ext.DomHelper.insertAfter(inputEl, {
                        tag: 'div',
                        id: hintId,
                        cls: 'x-form-format-hint x-hidden-accessibility',
                        html: hintText
                    });
                }
            }
            
            // Set aria-describedby
            if (descriptions.length > 0) {
                var existingDescribedBy = inputEl.getAttribute('aria-describedby') || '';
                var newDescribedBy = (existingDescribedBy + ' ' + descriptions.join(' ')).trim();
                inputEl.set({'aria-describedby': newDescribedBy});
            }
        },
        
        getFormatHint: function() {
            switch (this.inputType) {
                case 'email':
                    return 'Enter a valid email address like user@example.com';
                case 'url':
                    return 'Enter a valid URL like https://example.com';
                case 'tel':
                    return 'Enter a phone number';
                case 'password':
                    return 'Password field. Text will be hidden for security.';
                default:
                    return null;
            }
        },
        
        setupValidationAccessibility: function() {
            // Create validation message container
            this.validationMessageId = this.id + '-validation';
            
            var validationEl = Ext.DomHelper.insertAfter(this.el, {
                tag: 'div',
                id: this.validationMessageId,
                cls: 'x-form-validation-message',
                'aria-live': 'polite',
                'aria-atomic': 'true',
                style: 'display: none;'
            });
            
            // Add to aria-describedby
            var existingDescribedBy = this.el.getAttribute('aria-describedby') || '';
            var newDescribedBy = (existingDescribedBy + ' ' + this.validationMessageId).trim();
            this.el.set({'aria-describedby': newDescribedBy});
        },
        
        setupTextFieldHighContrastSupport: function() {
            if (!this.el) return;
            
            this.el.addClass('x-accessibility-form-field');
            
            // Add focus indicator
            this.el.addClass('x-accessibility-focus-indicator');
        },
        
        setupTextFieldKeyboardSupport: function() {
            if (!this.el) return;
            
            // Add enhanced keyboard event handling
            this.mon(this.el, {
                scope: this,
                keydown: this.onTextFieldKeyDown,
                keyup: this.onTextFieldKeyUp
            });
        },
        
        onTextFieldKeyDown: function(e) {
            var key = e.getKey();
            
            // Handle Escape key to clear field
            if (key === e.ESC && this.getValue()) {
                this.setValue('');
                this.fireEvent('change', this, '', this.startValue);
                e.stopEvent();
            }
        },
        
        onTextFieldKeyUp: function(e) {
            // Update character count for maxLength fields
            if (this.maxLength && this.maxLength > 0) {
                this.updateCharacterCount();
            }
        },
        
        updateCharacterCount: function() {
            if (!this.maxLength || !this.el) return;
            
            var currentLength = this.getValue() ? this.getValue().length : 0;
            var remaining = this.maxLength - currentLength;
            
            // Create or update character count announcement
            var countId = this.id + '-char-count';
            var countEl = Ext.get(countId);
            
            if (!countEl) {
                countEl = Ext.DomHelper.insertAfter(this.el, {
                    tag: 'div',
                    id: countId,
                    cls: 'x-form-char-count x-hidden-accessibility',
                    'aria-live': 'polite'
                });
            }
            
            var message = remaining >= 0 ? 
                remaining + ' characters remaining' : 
                Math.abs(remaining) + ' characters over limit';
                
            countEl.update(message);
            
            // Update ARIA attributes
            this.el.set({
                'aria-invalid': remaining < 0 ? 'true' : 'false'
            });
        },
        
        onTextFieldFocus: function() {
            if (!this.accessibilityConfig.screenReaderSupport) return;
            
            // Announce field information on focus
            var announcement = this.getFieldAnnouncement();
            if (announcement) {
                this.announceToScreenReader(announcement, 'polite');
            }
        },
        
        onTextFieldBlur: function() {
            // Validation will be announced by invalid/valid events
        },
        
        onTextFieldChange: function(field, newValue, oldValue) {
            if (!this.accessibilityConfig.announceChanges) return;
            
            // Announce significant changes (usually disabled for text fields)
            if (this.announceChanges) {
                var announcement = 'Text changed to: ' + (newValue || 'empty');
                this.announceToScreenReader(announcement, 'polite');
            }
        },
        
        onTextFieldInvalid: function(field, msg) {
            if (!this.accessibilityConfig.announceValidation) return;
            
            // Update validation message
            this.updateValidationMessage(msg, 'error');
            
            // Set ARIA invalid
            if (this.el) {
                this.el.set({'aria-invalid': 'true'});
            }
            
            // Announce validation error
            var announcement = 'Validation error: ' + msg;
            this.announceToScreenReader(announcement, 'assertive');
        },
        
        onTextFieldValid: function(field) {
            if (!this.accessibilityConfig.announceValidation) return;
            
            // Clear validation message
            this.updateValidationMessage('', 'valid');
            
            // Remove ARIA invalid
            if (this.el) {
                this.el.set({'aria-invalid': 'false'});
            }
            
            // Announce validation success (less verbose)
            if (this.hasHadValidationError) {
                this.announceToScreenReader('Input is now valid', 'polite');
                this.hasHadValidationError = false;
            }
        },
        
        updateValidationMessage: function(message, type) {
            var validationEl = Ext.get(this.validationMessageId);
            if (!validationEl) return;
            
            if (message) {
                validationEl.update(message);
                validationEl.show();
                validationEl.removeClass(['x-form-validation-valid', 'x-form-validation-error']);
                validationEl.addClass('x-form-validation-' + type);
                this.hasHadValidationError = true;
            } else {
                validationEl.hide();
                validationEl.update('');
            }
        },
        
        getFieldAnnouncement: function() {
            var parts = [];
            
            // Field label
            if (this.fieldLabel) {
                parts.push(this.fieldLabel);
            }
            
            // Field type
            parts.push('text field');
            
            // Required status
            if (this.allowBlank === false) {
                parts.push('required');
            }
            
            // Current value
            var value = this.getValue();
            if (value) {
                parts.push('current value: ' + value);
            } else {
                parts.push('empty');
            }
            
            // Character limit
            if (this.maxLength && this.maxLength > 0) {
                var currentLength = value ? value.length : 0;
                parts.push('maximum ' + this.maxLength + ' characters');
                parts.push(currentLength + ' entered');
            }
            
            return parts.join(', ');
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
        
        // Override setValue to update accessibility attributes
        setValue: function(value) {
            var result = Ext.form.TextField.superclass.setValue.call(this, value);
            
            // Update character count if applicable
            if (this.rendered && this.maxLength && this.maxLength > 0) {
                this.updateCharacterCount();
            }
            
            return result;
        },
        
        // Override setDisabled to update ARIA attributes
        setDisabled: function(disabled) {
            var result = Ext.form.TextField.superclass.setDisabled.call(this, disabled);
            
            if (this.rendered && this.el) {
                this.el.set({'aria-disabled': disabled ? 'true' : 'false'});
            }
            
            return result;
        }
    });
    
    // ====================================
    // TextField Accessibility Styles
    // ====================================
    
    var textFieldAccessibilityStyles = [
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
        '.x-accessibility-form-field:focus {',
        '    outline: 3px solid #0078d4 !important;',
        '    outline-offset: 2px !important;',
        '}',
        '',
        '.x-form-validation-message {',
        '    color: #d83b01;',
        '    font-size: 12px;',
        '    margin-top: 2px;',
        '}',
        '',
        '.x-form-validation-error {',
        '    color: #d83b01 !important;',
        '}',
        '',
        '.x-form-validation-valid {',
        '    color: #107c10 !important;',
        '}',
        '',
        '.x-form-help-text {',
        '    color: #666;',
        '    font-size: 12px;',
        '    margin-top: 2px;',
        '}',
        '',
        '.x-form-char-count {',
        '    color: #666;',
        '    font-size: 11px;',
        '    margin-top: 2px;',
        '}',
        '',
        '@media (prefers-contrast: high) {',
        '    .x-accessibility-form-field {',
        '        border: 2px solid ButtonText !important;',
        '        background: Field !important;',
        '        color: FieldText !important;',
        '    }',
        '    .x-accessibility-form-field:focus {',
        '        outline: 3px solid Highlight !important;',
        '        background: Field !important;',
        '    }',
        '    .x-form-validation-error {',
        '        color: #ff0000 !important;',
        '        font-weight: bold !important;',
        '    }',
        '}'
    ].join('\n');
    
    // Inject styles
    var styleSheet = document.createElement('style');
    styleSheet.type = 'text/css';
    styleSheet.innerHTML = textFieldAccessibilityStyles;
    document.getElementsByTagName('head')[0].appendChild(styleSheet);
    
    console.log('TextFieldOverride: TextField accessibility features loaded successfully');
});
