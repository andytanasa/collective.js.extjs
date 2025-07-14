/*!
 * Ext JS Library 3.4.0 - Checkbox Accessibility Override
 * Copyright(c) 2006-2011 Sencha Inc.
 * Accessibility Enhancement for WCAG AA Compliance
 * 
 * This override provides comprehensive accessibility features for Ext.form.Checkbox
 * including proper ARIA attributes, keyboard navigation, screen reader support,
 * and state change announcements.
 */

Ext.onReady(function() {
    
    // ====================================
    // Checkbox Accessibility Enhancement
    // ====================================
    
    Ext.override(Ext.form.Checkbox, {
        
        // Accessibility configuration
        accessibilityConfig: {
            ariaChecked: true,
            announceStateChanges: true,
            screenReaderSupport: true,
            keyboardNavigation: true,
            highContrast: true,
            enhancedLabeling: true
        },
        
        initComponent: function() {
            // Call original initComponent
            Ext.form.Checkbox.superclass.initComponent.call(this);
            
            // Initialize accessibility features
            this.initCheckboxAccessibility();
        },
        
        initCheckboxAccessibility: function() {
            // Add accessibility event listeners
            this.on('render', this.setupCheckboxAccessibility, this);
            this.on('check', this.onCheckboxCheck, this);
            this.on('focus', this.onCheckboxFocus, this);
            this.on('blur', this.onCheckboxBlur, this);
        },
        
        setupCheckboxAccessibility: function() {
            if (!this.rendered || !this.el) return;
            
            try {
                // Set up checkbox ARIA attributes
                this.setupCheckboxARIA();
                
                // Set up enhanced labeling
                if (this.accessibilityConfig.enhancedLabeling) {
                    this.setupCheckboxLabeling();
                }
                
                // Set up keyboard navigation
                if (this.accessibilityConfig.keyboardNavigation) {
                    this.setupCheckboxKeyboardSupport();
                }
                
                // Set up high contrast support
                if (this.accessibilityConfig.highContrast) {
                    this.setupCheckboxHighContrastSupport();
                }
                
            } catch (e) {
                console.warn('CheckboxOverride: Error setting up Checkbox accessibility:', e);
            }
        },
        
        setupCheckboxARIA: function() {
            if (!this.el) return;
            
            // Find the actual checkbox input element
            var checkboxEl = this.el.child('input[type=checkbox]') || this.el;
            
            // Set checkbox role and attributes
            checkboxEl.set({
                'role': 'checkbox',
                'aria-checked': this.getValue() ? 'true' : 'false',
                'aria-required': this.allowBlank === false ? 'true' : 'false'
            });
            
            // Set aria-label if we have a field label
            if (this.fieldLabel) {
                checkboxEl.set({'aria-label': this.fieldLabel});
            } else if (this.boxLabel) {
                checkboxEl.set({'aria-label': this.boxLabel});
            }
            
            // Store reference to checkbox element for easier access
            this.checkboxEl = checkboxEl;
        },
        
        setupCheckboxLabeling: function() {
            if (!this.el) return;
            
            // Set up label association
            var labelId = this.id + '-label';
            var descriptions = [];
            
            // Create or enhance the label
            if (this.boxLabel) {
                var labelEl = this.el.child('.x-form-cb-label');
                if (labelEl) {
                    labelEl.set({'id': labelId});
                    if (this.checkboxEl) {
                        this.checkboxEl.set({'aria-labelledby': labelId});
                    }
                }
            }
            
            // Add description if we have additional help text
            if (this.helpText) {
                var helpId = this.id + '-help';
                descriptions.push(helpId);
                
                // Create help text element
                var helpEl = Ext.DomHelper.insertAfter(this.el, {
                    tag: 'div',
                    id: helpId,
                    cls: 'x-form-help-text x-hidden-accessibility',
                    html: this.helpText
                });
            }
            
            // Set up grouped checkbox context
            if (this.group) {
                var groupId = this.group + '-group-desc';
                descriptions.push(groupId);
                
                // Create group description if it doesn't exist
                if (!Ext.get(groupId)) {
                    var groupEl = Ext.DomHelper.insertBefore(this.el, {
                        tag: 'div',
                        id: groupId,
                        cls: 'x-form-group-desc x-hidden-accessibility',
                        html: 'Checkbox group: ' + this.group
                    });
                }
            }
            
            // Set aria-describedby if we have descriptions
            if (descriptions.length > 0 && this.checkboxEl) {
                this.checkboxEl.set({'aria-describedby': descriptions.join(' ')});
            }
        },
        
        setupCheckboxKeyboardSupport: function() {
            if (!this.el) return;
            
            // Enhanced keyboard event handling
            this.mon(this.el, {
                scope: this,
                keydown: this.onCheckboxKeyDown,
                keypress: this.onCheckboxKeyPress
            });
        },
        
        onCheckboxKeyDown: function(e) {
            var key = e.getKey();
            
            // Handle space key to toggle checkbox
            if (key === e.SPACE) {
                e.preventDefault(); // Prevent page scroll
                this.toggleValue();
            }
            
            // Handle arrow keys for group navigation
            if (this.group && (key === e.UP || key === e.DOWN || key === e.LEFT || key === e.RIGHT)) {
                this.navigateGroup(key);
                e.stopEvent();
            }
        },
        
        onCheckboxKeyPress: function(e) {
            // Additional key handling if needed
            var key = e.getKey();
            
            if (key === e.SPACE) {
                e.preventDefault(); // Prevent double-triggering
            }
        },
        
        toggleValue: function() {
            // Toggle the checkbox value
            var newValue = !this.getValue();
            this.setValue(newValue);
            
            // Fire the check event
            this.fireEvent('check', this, newValue);
        },
        
        navigateGroup: function(key) {
            if (!this.group) return;
            
            // Find all checkboxes in the same group
            var groupCheckboxes = Ext.ComponentMgr.all.filterBy(function(comp) {
                return comp instanceof Ext.form.Checkbox && comp.group === this.group && comp.rendered;
            }, this);
            
            if (groupCheckboxes.getCount() <= 1) return;
            
            // Sort by DOM position
            var sortedCheckboxes = groupCheckboxes.items.sort(function(a, b) {
                return a.el.dom.compareDocumentPosition(b.el.dom) & 4 ? -1 : 1;
            });
            
            // Find current index
            var currentIndex = sortedCheckboxes.indexOf(this);
            var nextIndex;
            
            // Determine next checkbox based on key
            switch (key) {
                case Ext.EventObject.UP:
                case Ext.EventObject.LEFT:
                    nextIndex = currentIndex > 0 ? currentIndex - 1 : sortedCheckboxes.length - 1;
                    break;
                case Ext.EventObject.DOWN:
                case Ext.EventObject.RIGHT:
                    nextIndex = currentIndex < sortedCheckboxes.length - 1 ? currentIndex + 1 : 0;
                    break;
            }
            
            // Focus the next checkbox
            if (nextIndex !== undefined && sortedCheckboxes[nextIndex]) {
                sortedCheckboxes[nextIndex].focus();
            }
        },
        
        setupCheckboxHighContrastSupport: function() {
            if (!this.el) return;
            
            this.el.addClass('x-accessibility-checkbox');
            
            // Add focus indicator
            this.el.addClass('x-accessibility-focus-indicator');
        },
        
        onCheckboxCheck: function(checkbox, checked) {
            if (!this.accessibilityConfig) return;
            
            // Update aria-checked
            if (this.accessibilityConfig.ariaChecked && this.checkboxEl) {
                this.checkboxEl.set({'aria-checked': checked ? 'true' : 'false'});
            }
            
            // Announce state change
            if (this.accessibilityConfig.announceStateChanges && this.accessibilityConfig.screenReaderSupport) {
                var label = this.getCheckboxLabel();
                var state = checked ? 'checked' : 'unchecked';
                var announcement = label + ' ' + state;
                this.announceToScreenReader(announcement, 'polite');
            }
        },
        
        onCheckboxFocus: function() {
            if (!this.accessibilityConfig.screenReaderSupport) return;
            
            // Announce checkbox information on focus
            var announcement = this.getCheckboxAnnouncement();
            if (announcement) {
                this.announceToScreenReader(announcement, 'polite');
            }
        },
        
        onCheckboxBlur: function() {
            // Additional blur handling if needed
        },
        
        getCheckboxLabel: function() {
            return this.fieldLabel || this.boxLabel || 'Checkbox';
        },
        
        getCheckboxAnnouncement: function() {
            var parts = [];
            
            // Label
            parts.push(this.getCheckboxLabel());
            
            // Type
            parts.push('checkbox');
            
            // Current state
            parts.push(this.getValue() ? 'checked' : 'unchecked');
            
            // Required status
            if (this.allowBlank === false) {
                parts.push('required');
            }
            
            // Group information
            if (this.group) {
                parts.push('in group: ' + this.group);
            }
            
            return parts.join(', ');
        },
        
        // Override setValue to update accessibility attributes
        setValue: function(value) {
            var result = Ext.form.Checkbox.superclass.setValue.call(this, value);
            
            // Update aria-checked state
            if (this.rendered && this.checkboxEl && this.accessibilityConfig.ariaChecked) {
                this.checkboxEl.set({'aria-checked': value ? 'true' : 'false'});
            }
            
            return result;
        },
        
        // Override setDisabled to update ARIA attributes
        setDisabled: function(disabled) {
            var result = Ext.form.Checkbox.superclass.setDisabled.call(this, disabled);
            
            if (this.rendered && this.checkboxEl) {
                this.checkboxEl.set({'aria-disabled': disabled ? 'true' : 'false'});
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
    // Checkbox Accessibility Styles
    // ====================================
    
    var checkboxAccessibilityStyles = [
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
        '.x-accessibility-checkbox:focus-within {',
        '    outline: 3px solid #0078d4 !important;',
        '    outline-offset: 2px !important;',
        '}',
        '',
        '.x-accessibility-checkbox input[type="checkbox"]:focus {',
        '    outline: 3px solid #0078d4 !important;',
        '    outline-offset: 2px !important;',
        '}',
        '',
        '.x-form-cb-label {',
        '    cursor: pointer !important;',
        '}',
        '',
        '.x-form-cb-label:hover {',
        '    text-decoration: underline !important;',
        '}',
        '',
        '.x-form-help-text {',
        '    color: #666;',
        '    font-size: 12px;',
        '    margin-top: 2px;',
        '}',
        '',
        '.x-form-group-desc {',
        '    font-weight: bold;',
        '    color: #333;',
        '    margin-bottom: 5px;',
        '}',
        '',
        '@media (prefers-contrast: high) {',
        '    .x-accessibility-checkbox {',
        '        border: 2px solid ButtonText !important;',
        '    }',
        '    .x-accessibility-checkbox:focus-within {',
        '        outline: 3px solid Highlight !important;',
        '    }',
        '    .x-accessibility-checkbox input[type="checkbox"] {',
        '        border: 2px solid ButtonText !important;',
        '        background: Field !important;',
        '    }',
        '    .x-accessibility-checkbox input[type="checkbox"]:checked {',
        '        background: Highlight !important;',
        '        border-color: Highlight !important;',
        '    }',
        '    .x-accessibility-checkbox input[type="checkbox"]:focus {',
        '        outline: 3px solid Highlight !important;',
        '    }',
        '    .x-form-cb-label {',
        '        color: FieldText !important;',
        '        font-weight: bold !important;',
        '    }',
        '}',
        '',
        '@media (prefers-reduced-motion: reduce) {',
        '    .x-accessibility-checkbox * {',
        '        transition: none !important;',
        '    }',
        '}'
    ].join('\n');
    
    // Inject styles
    var styleSheet = document.createElement('style');
    styleSheet.type = 'text/css';
    styleSheet.innerHTML = checkboxAccessibilityStyles;
    document.getElementsByTagName('head')[0].appendChild(styleSheet);
    
    console.log('CheckboxOverride: Checkbox accessibility features loaded successfully');
});
