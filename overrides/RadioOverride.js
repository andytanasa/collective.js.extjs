/*!
 * Ext JS Library 3.4.0 - Radio Accessibility Override
 * Copyright(c) 2006-2011 Sencha Inc.
 * Accessibility Enhancement for WCAG AA Compliance
 * 
 * This override provides comprehensive accessibility features for Ext.form.Radio
 * including proper ARIA attributes, keyboard navigation, screen reader support,
 * and radio group management.
 */

Ext.onReady(function() {
    
    // ====================================
    // Radio Accessibility Enhancement
    // ====================================
    
    Ext.override(Ext.form.Radio, {
        
        // Accessibility configuration
        accessibilityConfig: {
            ariaChecked: true,
            announceSelection: true,
            screenReaderSupport: true,
            keyboardNavigation: true,
            highContrast: true,
            radioGroupSupport: true
        },
        
        initComponent: function() {
            // Call original initComponent
            Ext.form.Radio.superclass.initComponent.call(this);
            
            // Initialize accessibility features
            this.initRadioAccessibility();
        },
        
        initRadioAccessibility: function() {
            // Add accessibility event listeners
            this.on('render', this.setupRadioAccessibility, this);
            this.on('check', this.onRadioCheck, this);
            this.on('focus', this.onRadioFocus, this);
            this.on('blur', this.onRadioBlur, this);
        },
        
        setupRadioAccessibility: function() {
            if (!this.rendered || !this.el) return;
            
            try {
                // Set up radio ARIA attributes
                this.setupRadioARIA();
                
                // Set up radio group accessibility
                if (this.accessibilityConfig.radioGroupSupport) {
                    this.setupRadioGroupAccessibility();
                }
                
                // Set up keyboard navigation
                if (this.accessibilityConfig.keyboardNavigation) {
                    this.setupRadioKeyboardSupport();
                }
                
                // Set up high contrast support
                if (this.accessibilityConfig.highContrast) {
                    this.setupRadioHighContrastSupport();
                }
                
            } catch (e) {
                console.warn('RadioOverride: Error setting up Radio accessibility:', e);
            }
        },
        
        setupRadioARIA: function() {
            if (!this.el) return;
            
            // Find the actual radio input element
            var radioEl = this.el.child('input[type=radio]') || this.el;
            
            // Set radio role and attributes
            radioEl.set({
                'role': 'radio',
                'aria-checked': this.getValue() ? 'true' : 'false',
                'aria-required': this.allowBlank === false ? 'true' : 'false'
            });
            
            // Set aria-label if we have a field label
            if (this.fieldLabel) {
                radioEl.set({'aria-label': this.fieldLabel});
            } else if (this.boxLabel) {
                radioEl.set({'aria-label': this.boxLabel});
            }
            
            // Store reference to radio element for easier access
            this.radioEl = radioEl;
        },
        
        setupRadioGroupAccessibility: function() {
            if (!this.name) return; // Radio groups are identified by name
            
            var groupRadios = this.getGroupRadios();
            var isFirstInGroup = this.isFirstRadioInGroup(groupRadios);
            
            // Set up radio group attributes
            if (isFirstInGroup) {
                this.setupRadioGroupContainer(groupRadios);
            }
            
            // Set up individual radio in group context
            this.setupRadioInGroup(groupRadios);
        },
        
        getGroupRadios: function() {
            // Find all radios with the same name
            return Ext.ComponentMgr.all.filterBy(function(comp) {
                return comp instanceof Ext.form.Radio && 
                       comp.name === this.name && 
                       comp.rendered;
            }, this);
        },
        
        isFirstRadioInGroup: function(groupRadios) {
            var sortedRadios = this.sortRadiosByDOMPosition(groupRadios.items);
            return sortedRadios[0] === this;
        },
        
        sortRadiosByDOMPosition: function(radios) {
            return radios.sort(function(a, b) {
                if (!a.el || !b.el) return 0;
                return a.el.dom.compareDocumentPosition(b.el.dom) & 4 ? -1 : 1;
            });
        },
        
        setupRadioGroupContainer: function(groupRadios) {
            // Create a conceptual radio group for screen readers
            var groupId = this.name + '-radiogroup';
            var groupLabel = this.getRadioGroupLabel();
            
            // Add group information to the first radio
            if (this.radioEl) {
                this.radioEl.set({
                    'aria-describedby': (this.radioEl.getAttribute('aria-describedby') || '') + ' ' + groupId
                });
            }
            
            // Create hidden group description
            var groupDesc = Ext.DomHelper.insertBefore(this.el, {
                tag: 'div',
                id: groupId,
                cls: 'x-radio-group-desc x-hidden-accessibility',
                html: 'Radio group: ' + groupLabel + '. Use arrow keys to navigate options.'
            });
        },
        
        setupRadioInGroup: function(groupRadios) {
            var sortedRadios = this.sortRadiosByDOMPosition(groupRadios.items);
            var position = sortedRadios.indexOf(this) + 1;
            var total = sortedRadios.length;
            
            // Set position in set
            if (this.radioEl) {
                this.radioEl.set({
                    'aria-setsize': total,
                    'aria-posinset': position
                });
            }
            
            // Set up tab index management for roving tabindex
            this.updateGroupTabIndex(sortedRadios);
        },
        
        updateGroupTabIndex: function(groupRadios) {
            var checkedRadio = null;
            var firstRadio = null;
            
            // Find checked radio or use first radio
            for (var i = 0; i < groupRadios.length; i++) {
                var radio = groupRadios[i];
                if (!firstRadio) firstRadio = radio;
                if (radio.getValue()) {
                    checkedRadio = radio;
                    break;
                }
            }
            
            var focusableRadio = checkedRadio || firstRadio;
            
            // Set tabindex for roving tabindex pattern
            for (var i = 0; i < groupRadios.length; i++) {
                var radio = groupRadios[i];
                if (radio.radioEl) {
                    radio.radioEl.set({
                        'tabindex': radio === focusableRadio ? '0' : '-1'
                    });
                }
            }
        },
        
        getRadioGroupLabel: function() {
            // Try to find a common label for the radio group
            if (this.fieldLabel) {
                return this.fieldLabel;
            }
            
            // Use the name as fallback
            return this.name || 'Options';
        },
        
        setupRadioKeyboardSupport: function() {
            if (!this.el) return;
            
            // Enhanced keyboard event handling for radio groups
            this.mon(this.el, {
                scope: this,
                keydown: this.onRadioKeyDown
            });
        },
        
        onRadioKeyDown: function(e) {
            var key = e.getKey();
            
            // Handle arrow keys for radio group navigation
            if (key === e.UP || key === e.DOWN || key === e.LEFT || key === e.RIGHT) {
                this.navigateRadioGroup(key);
                e.stopEvent();
            }
            
            // Handle space to select radio
            if (key === e.SPACE) {
                this.setValue(true);
                e.stopEvent();
            }
        },
        
        navigateRadioGroup: function(key) {
            var groupRadios = this.getGroupRadios();
            if (groupRadios.getCount() <= 1) return;
            
            var sortedRadios = this.sortRadiosByDOMPosition(groupRadios.items);
            var currentIndex = sortedRadios.indexOf(this);
            var nextIndex;
            
            // Determine next radio based on key
            switch (key) {
                case Ext.EventObject.UP:
                case Ext.EventObject.LEFT:
                    nextIndex = currentIndex > 0 ? currentIndex - 1 : sortedRadios.length - 1;
                    break;
                case Ext.EventObject.DOWN:
                case Ext.EventObject.RIGHT:
                    nextIndex = currentIndex < sortedRadios.length - 1 ? currentIndex + 1 : 0;
                    break;
            }
            
            // Select and focus the next radio
            if (nextIndex !== undefined && sortedRadios[nextIndex]) {
                var nextRadio = sortedRadios[nextIndex];
                nextRadio.setValue(true);
                nextRadio.focus();
            }
        },
        
        setupRadioHighContrastSupport: function() {
            if (!this.el) return;
            
            this.el.addClass('x-accessibility-radio');
            this.el.addClass('x-accessibility-focus-indicator');
        },
        
        onRadioCheck: function(radio, checked) {
            if (!this.accessibilityConfig) return;
            
            // Update aria-checked for all radios in group
            if (this.accessibilityConfig.ariaChecked) {
                this.updateGroupAriaStates();
            }
            
            // Update tab index for group
            if (checked) {
                var groupRadios = this.getGroupRadios();
                this.updateGroupTabIndex(groupRadios.items);
            }
            
            // Announce selection
            if (this.accessibilityConfig.announceSelection && 
                this.accessibilityConfig.screenReaderSupport && checked) {
                var label = this.getRadioLabel();
                var announcement = label + ' selected';
                this.announceToScreenReader(announcement, 'polite');
            }
        },
        
        updateGroupAriaStates: function() {
            var groupRadios = this.getGroupRadios();
            
            groupRadios.each(function(radio) {
                if (radio.radioEl) {
                    radio.radioEl.set({
                        'aria-checked': radio.getValue() ? 'true' : 'false'
                    });
                }
            });
        },
        
        onRadioFocus: function() {
            if (!this.accessibilityConfig.screenReaderSupport) return;
            
            // Announce radio information on focus
            var announcement = this.getRadioAnnouncement();
            if (announcement) {
                this.announceToScreenReader(announcement, 'polite');
            }
        },
        
        onRadioBlur: function() {
            // Additional blur handling if needed
        },
        
        getRadioLabel: function() {
            return this.fieldLabel || this.boxLabel || 'Radio option';
        },
        
        getRadioAnnouncement: function() {
            var parts = [];
            
            // Label
            parts.push(this.getRadioLabel());
            
            // Type and state
            parts.push('radio button');
            parts.push(this.getValue() ? 'selected' : 'not selected');
            
            // Group context
            var groupRadios = this.getGroupRadios();
            if (groupRadios.getCount() > 1) {
                var sortedRadios = this.sortRadiosByDOMPosition(groupRadios.items);
                var position = sortedRadios.indexOf(this) + 1;
                parts.push(position + ' of ' + groupRadios.getCount());
            }
            
            // Required status
            if (this.allowBlank === false) {
                parts.push('required');
            }
            
            return parts.join(', ');
        },
        
        // Override setValue to update accessibility attributes
        setValue: function(value) {
            var result = Ext.form.Radio.superclass.setValue.call(this, value);
            
            // Update ARIA states for the group
            if (this.rendered && this.accessibilityConfig.ariaChecked) {
                this.updateGroupAriaStates();
                
                // Update tab index if this radio was selected
                if (value) {
                    var groupRadios = this.getGroupRadios();
                    this.updateGroupTabIndex(groupRadios.items);
                }
            }
            
            return result;
        },
        
        // Override setDisabled to update ARIA attributes
        setDisabled: function(disabled) {
            var result = Ext.form.Radio.superclass.setDisabled.call(this, disabled);
            
            if (this.rendered && this.radioEl) {
                this.radioEl.set({'aria-disabled': disabled ? 'true' : 'false'});
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
    // Radio Accessibility Styles
    // ====================================
    
    var radioAccessibilityStyles = [
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
        '.x-accessibility-radio:focus-within {',
        '    outline: 3px solid #0078d4 !important;',
        '    outline-offset: 2px !important;',
        '}',
        '',
        '.x-accessibility-radio input[type="radio"]:focus {',
        '    outline: 3px solid #0078d4 !important;',
        '    outline-offset: 2px !important;',
        '}',
        '',
        '.x-form-radio .x-form-cb-label {',
        '    cursor: pointer !important;',
        '}',
        '',
        '.x-form-radio .x-form-cb-label:hover {',
        '    text-decoration: underline !important;',
        '}',
        '',
        '.x-radio-group-desc {',
        '    font-weight: bold;',
        '    color: #333;',
        '    margin-bottom: 5px;',
        '}',
        '',
        '@media (prefers-contrast: high) {',
        '    .x-accessibility-radio {',
        '        border: 2px solid ButtonText !important;',
        '    }',
        '    .x-accessibility-radio:focus-within {',
        '        outline: 3px solid Highlight !important;',
        '    }',
        '    .x-accessibility-radio input[type="radio"] {',
        '        border: 2px solid ButtonText !important;',
        '        background: Field !important;',
        '    }',
        '    .x-accessibility-radio input[type="radio"]:checked {',
        '        background: Highlight !important;',
        '        border-color: Highlight !important;',
        '    }',
        '    .x-accessibility-radio input[type="radio"]:focus {',
        '        outline: 3px solid Highlight !important;',
        '    }',
        '    .x-form-radio .x-form-cb-label {',
        '        color: FieldText !important;',
        '        font-weight: bold !important;',
        '    }',
        '}',
        '',
        '@media (prefers-reduced-motion: reduce) {',
        '    .x-accessibility-radio * {',
        '        transition: none !important;',
        '    }',
        '}'
    ].join('\n');
    
    // Inject styles
    var styleSheet = document.createElement('style');
    styleSheet.type = 'text/css';
    styleSheet.innerHTML = radioAccessibilityStyles;
    document.getElementsByTagName('head')[0].appendChild(styleSheet);
    
    console.log('RadioOverride: Radio accessibility features loaded successfully');
});
