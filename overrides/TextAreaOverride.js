/*!
 * Ext JS Library 3.4.0 - TextArea Accessibility Override
 * Copyright(c) 2006-2011 Sencha Inc.
 * Accessibility Enhancement for WCAG AA Compliance
 * 
 * This override provides comprehensive accessibility features for Ext.form.TextArea
 * including proper ARIA attributes, keyboard navigation, screen reader support,
 * and character count announcements.
 */

Ext.onReady(function() {
    
    // ====================================
    // TextArea Accessibility Enhancement
    // ====================================
    
    Ext.override(Ext.form.TextArea, {
        
        // Accessibility configuration
        accessibilityConfig: {
            ariaMultiline: true,
            announceCharacterCount: true,
            announceValidation: true,
            screenReaderSupport: true,
            keyboardNavigation: true,
            highContrast: true,
            resizeAnnouncements: true
        },
        
        initComponent: function() {
            // Call original initComponent
            Ext.form.TextArea.superclass.initComponent.call(this);
            
            // Initialize accessibility features
            this.initTextAreaAccessibility();
        },
        
        initTextAreaAccessibility: function() {
            // Add accessibility event listeners
            this.on('render', this.setupTextAreaAccessibility, this);
            this.on('focus', this.onTextAreaFocus, this);
            this.on('blur', this.onTextAreaBlur, this);
            this.on('change', this.onTextAreaChange, this);
            this.on('invalid', this.onTextAreaInvalid, this);
            this.on('valid', this.onTextAreaValid, this);
            this.on('resize', this.onTextAreaResize, this);
        },
        
        setupTextAreaAccessibility: function() {
            if (!this.rendered || !this.el) return;
            
            try {
                // Set up textarea ARIA attributes
                this.setupTextAreaARIA();
                
                // Set up descriptions and help text
                this.setupTextAreaDescriptions();
                
                // Set up validation accessibility
                this.setupValidationAccessibility();
                
                // Set up character counting
                if (this.accessibilityConfig.announceCharacterCount) {
                    this.setupCharacterCounting();
                }
                
                // Set up keyboard navigation
                if (this.accessibilityConfig.keyboardNavigation) {
                    this.setupTextAreaKeyboardSupport();
                }
                
                // Set up high contrast support
                if (this.accessibilityConfig.highContrast) {
                    this.setupTextAreaHighContrastSupport();
                }
                
            } catch (e) {
                console.warn('TextAreaOverride: Error setting up TextArea accessibility:', e);
            }
        },
        
        setupTextAreaARIA: function() {
            if (!this.el) return;
            
            // Set textarea role and attributes
            this.el.set({
                'role': 'textbox',
                'aria-multiline': 'true',
                'aria-required': this.allowBlank === false ? 'true' : 'false'
            });
            
            // Set aria-label
            if (this.fieldLabel) {
                this.el.set({'aria-label': this.fieldLabel + ' text area'});
            }
            
            // Set rows and cols information
            if (this.height || this.width) {
                var sizeInfo = [];
                if (this.height) sizeInfo.push('height: ' + this.height);
                if (this.width) sizeInfo.push('width: ' + this.width);
                
                var sizeDesc = sizeInfo.join(', ');
                this.el.set({'aria-description': sizeDesc});
            }
        },
        
        setupTextAreaDescriptions: function() {
            var descriptions = [];
            
            // Add help text description
            if (this.helpText) {
                var helpId = this.id + '-help';
                descriptions.push(helpId);
                
                Ext.DomHelper.insertAfter(this.el, {
                    tag: 'div',
                    id: helpId,
                    cls: 'x-form-help-text x-hidden-accessibility',
                    html: this.helpText
                });
            }
            
            // Add usage instructions
            var instructionsId = this.id + '-instructions';
            descriptions.push(instructionsId);
            
            var instructions = 'Multi-line text area. ';
            if (this.maxLength) {
                instructions += 'Maximum ' + this.maxLength + ' characters. ';
            }
            instructions += 'Use Tab to navigate to next field.';
            
            Ext.DomHelper.insertAfter(this.el, {
                tag: 'div',
                id: instructionsId,
                cls: 'x-form-instructions x-hidden-accessibility',
                html: instructions
            });
            
            // Set aria-describedby
            if (descriptions.length > 0) {
                this.el.set({'aria-describedby': descriptions.join(' ')});
            }
        },
        
        setupValidationAccessibility: function() {
            // Create validation message container
            this.validationMessageId = this.id + '-validation';
            
            Ext.DomHelper.insertAfter(this.el, {
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
        
        setupCharacterCounting: function() {
            if (!this.maxLength) return;
            
            // Create character count container
            this.charCountId = this.id + '-char-count';
            
            var charCountEl = Ext.DomHelper.insertAfter(this.el, {
                tag: 'div',
                id: this.charCountId,
                cls: 'x-form-char-count',
                'aria-live': 'polite',
                'aria-atomic': 'true'
            });
            
            // Update character count
            this.updateCharacterCount();
            
            // Add to aria-describedby
            var existingDescribedBy = this.el.getAttribute('aria-describedby') || '';
            var newDescribedBy = (existingDescribedBy + ' ' + this.charCountId).trim();
            this.el.set({'aria-describedby': newDescribedBy});
        },
        
        setupTextAreaKeyboardSupport: function() {
            if (!this.el) return;
            
            // Enhanced keyboard event handling
            this.mon(this.el, {
                scope: this,
                keydown: this.onTextAreaKeyDown,
                keyup: this.onTextAreaKeyUp,
                input: this.onTextAreaInput
            });
        },
        
        onTextAreaKeyDown: function(e) {
            var key = e.getKey();
            
            // Handle Ctrl+A for select all
            if (e.ctrlKey && key === e.A) {
                // Let it proceed naturally
                return;
            }
            
            // Handle Escape to clear
            if (key === e.ESC && this.getValue()) {
                this.setValue('');
                this.fireEvent('change', this, '', this.startValue);
                e.stopEvent();
            }
            
            // Handle Ctrl+Enter for form submission (if configured)
            if (e.ctrlKey && key === e.ENTER && this.submitOnCtrlEnter) {
                var form = this.findParentByType('form');
                if (form && form.getForm) {
                    form.getForm().submit();
                    e.stopEvent();
                }
            }
        },
        
        onTextAreaKeyUp: function(e) {
            // Update character count on key up
            if (this.maxLength) {
                this.updateCharacterCount();
            }
        },
        
        onTextAreaInput: function(e) {
            // Update character count on input
            if (this.maxLength) {
                this.updateCharacterCount();
            }
        },
        
        updateCharacterCount: function() {
            if (!this.maxLength || !this.charCountId) return;
            
            var charCountEl = Ext.get(this.charCountId);
            if (!charCountEl) return;
            
            var currentLength = this.getValue() ? this.getValue().length : 0;
            var remaining = this.maxLength - currentLength;
            
            var message;
            var className = 'x-form-char-count';
            
            if (remaining >= 0) {
                message = remaining + ' characters remaining';
                this.el.set({'aria-invalid': 'false'});
            } else {
                message = Math.abs(remaining) + ' characters over limit';
                className += ' x-form-char-count-over';
                this.el.set({'aria-invalid': 'true'});
            }
            
            charCountEl.update(message);
            charCountEl.set({'class': className});
            
            // Announce critical thresholds
            if (this.accessibilityConfig.announceCharacterCount) {
                if (remaining === 0) {
                    this.announceToScreenReader('Character limit reached', 'assertive');
                } else if (remaining === 10 && currentLength > 0) {
                    this.announceToScreenReader('10 characters remaining', 'polite');
                } else if (remaining < 0 && remaining % 10 === 0) {
                    this.announceToScreenReader(Math.abs(remaining) + ' characters over limit', 'assertive');
                }
            }
        },
        
        setupTextAreaHighContrastSupport: function() {
            if (!this.el) return;
            
            this.el.addClass('x-accessibility-textarea');
            this.el.addClass('x-accessibility-focus-indicator');
        },
        
        onTextAreaFocus: function() {
            if (!this.accessibilityConfig.screenReaderSupport) return;
            
            // Announce textarea information on focus
            var announcement = this.getTextAreaAnnouncement();
            if (announcement) {
                this.announceToScreenReader(announcement, 'polite');
            }
        },
        
        onTextAreaBlur: function() {
            // Validation will be announced by invalid/valid events
        },
        
        onTextAreaChange: function(field, newValue, oldValue) {
            // Update character count
            if (this.maxLength) {
                this.updateCharacterCount();
            }
        },
        
        onTextAreaInvalid: function(field, msg) {
            if (!this.accessibilityConfig.announceValidation) return;
            
            // Update validation message
            this.updateValidationMessage(msg, 'error');
            
            // Set ARIA invalid
            this.el.set({'aria-invalid': 'true'});
            
            // Announce validation error
            var announcement = 'Validation error: ' + msg;
            this.announceToScreenReader(announcement, 'assertive');
        },
        
        onTextAreaValid: function(field) {
            if (!this.accessibilityConfig.announceValidation) return;
            
            // Clear validation message
            this.updateValidationMessage('', 'valid');
            
            // Remove ARIA invalid
            this.el.set({'aria-invalid': 'false'});
            
            // Announce validation success (less verbose)
            if (this.hasHadValidationError) {
                this.announceToScreenReader('Text area content is now valid', 'polite');
                this.hasHadValidationError = false;
            }
        },
        
        onTextAreaResize: function(component, width, height) {
            if (!this.accessibilityConfig.resizeAnnouncements) return;
            
            // Announce resize for screen readers
            var announcement = 'Text area resized to ' + width + ' by ' + height + ' pixels';
            this.announceToScreenReader(announcement, 'polite');
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
        
        getTextAreaAnnouncement: function() {
            var parts = [];
            
            // Field label
            if (this.fieldLabel) {
                parts.push(this.fieldLabel);
            }
            
            // Field type
            parts.push('multi-line text area');
            
            // Required status
            if (this.allowBlank === false) {
                parts.push('required');
            }
            
            // Current content
            var value = this.getValue();
            if (value) {
                var wordCount = value.split(/\s+/).filter(function(word) {
                    return word.length > 0;
                }).length;
                parts.push(wordCount + ' words, ' + value.length + ' characters');
            } else {
                parts.push('empty');
            }
            
            // Character limit
            if (this.maxLength) {
                var currentLength = value ? value.length : 0;
                var remaining = this.maxLength - currentLength;
                parts.push('maximum ' + this.maxLength + ' characters');
                parts.push(remaining + ' remaining');
            }
            
            return parts.join(', ');
        },
        
        // Override setValue to update accessibility attributes
        setValue: function(value) {
            var result = Ext.form.TextArea.superclass.setValue.call(this, value);
            
            // Update character count if applicable
            if (this.rendered && this.maxLength) {
                this.updateCharacterCount();
            }
            
            return result;
        },
        
        // Override setDisabled to update ARIA attributes
        setDisabled: function(disabled) {
            var result = Ext.form.TextArea.superclass.setDisabled.call(this, disabled);
            
            if (this.rendered && this.el) {
                this.el.set({'aria-disabled': disabled ? 'true' : 'false'});
            }
            
            return result;
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
        }
    });
    
    // ====================================
    // TextArea Accessibility Styles
    // ====================================
    
    var textAreaAccessibilityStyles = [
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
        '.x-accessibility-textarea:focus {',
        '    outline: 3px solid #0078d4 !important;',
        '    outline-offset: 2px !important;',
        '}',
        '',
        '.x-form-char-count {',
        '    color: #666;',
        '    font-size: 12px;',
        '    margin-top: 2px;',
        '    text-align: right;',
        '}',
        '',
        '.x-form-char-count-over {',
        '    color: #d83b01 !important;',
        '    font-weight: bold !important;',
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
        '.x-form-help-text,',
        '.x-form-instructions {',
        '    color: #666;',
        '    font-size: 12px;',
        '    margin-top: 2px;',
        '}',
        '',
        '@media (prefers-contrast: high) {',
        '    .x-accessibility-textarea {',
        '        border: 2px solid ButtonText !important;',
        '        background: Field !important;',
        '        color: FieldText !important;',
        '    }',
        '    .x-accessibility-textarea:focus {',
        '        outline: 3px solid Highlight !important;',
        '        background: Field !important;',
        '    }',
        '    .x-form-char-count-over {',
        '        color: #ff0000 !important;',
        '        background: #ffff00 !important;',
        '    }',
        '    .x-form-validation-error {',
        '        color: #ff0000 !important;',
        '        font-weight: bold !important;',
        '    }',
        '}',
        '',
        '@media (prefers-reduced-motion: reduce) {',
        '    .x-accessibility-textarea {',
        '        transition: none !important;',
        '    }',
        '}'
    ].join('\n');
    
    // Inject styles
    var styleSheet = document.createElement('style');
    styleSheet.type = 'text/css';
    styleSheet.innerHTML = textAreaAccessibilityStyles;
    document.getElementsByTagName('head')[0].appendChild(styleSheet);
    
    console.log('TextAreaOverride: TextArea accessibility features loaded successfully');
});
