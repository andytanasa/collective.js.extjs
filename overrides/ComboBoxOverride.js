/*!
 * Ext JS Library 3.4.0 - ComboBox Accessibility Override
 * Copyright(c) 2006-2011 Sencha Inc.
 * Accessibility Enhancement for WCAG AA Compliance
 * 
 * This override provides comprehensive accessibility features for Ext.form.ComboBox
 * including proper ARIA combobox attributes, keyboard navigation, screen reader support,
 * and dropdown list accessibility.
 */

Ext.onReady(function() {
    
    // ====================================
    // ComboBox Accessibility Enhancement
    // ====================================
    
    Ext.override(Ext.form.ComboBox, {
        
        // Accessibility configuration
        accessibilityConfig: {
            ariaCombobox: true,
            announceSelection: true,
            announceListChanges: true,
            screenReaderSupport: true,
            keyboardNavigation: true,
            highContrast: true,
            announceFiltering: false // Can be verbose
        },
        
        initComponent: function() {
            // Call original initComponent
            Ext.form.ComboBox.superclass.initComponent.call(this);
            
            // Initialize accessibility features
            this.initComboBoxAccessibility();
        },
        
        initComboBoxAccessibility: function() {
            // Add accessibility event listeners
            this.on('render', this.setupComboBoxAccessibility, this);
            this.on('expand', this.onComboExpand, this);
            this.on('collapse', this.onComboCollapse, this);
            this.on('select', this.onComboSelect, this);
            this.on('beforequery', this.onComboBeforeQuery, this);
        },
        
        setupComboBoxAccessibility: function() {
            if (!this.rendered || !this.el) return;
            
            try {
                // Set up combobox ARIA attributes
                this.setupComboBoxARIA();
                
                // Set up trigger button accessibility
                this.setupTriggerAccessibility();
                
                // Set up keyboard navigation
                if (this.accessibilityConfig.keyboardNavigation) {
                    this.setupComboKeyboardSupport();
                }
                
                // Set up high contrast support
                if (this.accessibilityConfig.highContrast) {
                    this.setupComboHighContrastSupport();
                }
                
            } catch (e) {
                console.warn('ComboBoxOverride: Error setting up ComboBox accessibility:', e);
            }
        },
        
        setupComboBoxARIA: function() {
            if (!this.el) return;
            
            var inputEl = this.el;
            
            // Set combobox role and attributes
            inputEl.set({
                'role': 'combobox',
                'aria-autocomplete': this.typeAhead ? 'both' : 'list',
                'aria-expanded': 'false',
                'aria-haspopup': 'listbox',
                'aria-required': this.allowBlank === false ? 'true' : 'false'
            });
            
            // Set aria-label
            if (this.fieldLabel) {
                inputEl.set({'aria-label': this.fieldLabel + ' combobox'});
            }
            
            // Create unique IDs for list and active option
            this.listboxId = this.id + '-listbox';
            this.activeOptionId = this.id + '-active-option';
            
            // Set aria-owns to reference the dropdown list
            inputEl.set({'aria-owns': this.listboxId});
        },
        
        setupTriggerAccessibility: function() {
            if (!this.trigger) return;
            
            // Set trigger button attributes
            this.trigger.set({
                'role': 'button',
                'aria-label': 'Open ' + (this.fieldLabel || 'options') + ' dropdown',
                'tabindex': '-1', // Trigger should not be focusable via tab
                'aria-hidden': 'false'
            });
            
            // Add keyboard support for trigger
            this.mon(this.trigger, {
                scope: this,
                keydown: function(e) {
                    var key = e.getKey();
                    if (key === e.ENTER || key === e.SPACE) {
                        e.stopEvent();
                        if (this.isExpanded()) {
                            this.collapse();
                        } else {
                            this.expand();
                        }
                    }
                }
            });
        },
        
        setupComboKeyboardSupport: function() {
            if (!this.el) return;
            
            // Enhanced keyboard navigation
            this.mon(this.el, {
                scope: this,
                keydown: this.onComboKeyDown
            });
        },
        
        onComboKeyDown: function(e) {
            var key = e.getKey();
            
            switch (key) {
                case e.DOWN:
                    if (!this.isExpanded()) {
                        this.expand();
                        e.stopEvent();
                    }
                    break;
                    
                case e.UP:
                    if (this.isExpanded() && this.list) {
                        // Navigate to last item when pressing up on collapsed combo
                        var lastIndex = this.store.getCount() - 1;
                        if (lastIndex >= 0) {
                            this.selectByIndex(lastIndex);
                        }
                        e.stopEvent();
                    }
                    break;
                    
                case e.ESC:
                    if (this.isExpanded()) {
                        this.collapse();
                        e.stopEvent();
                    }
                    break;
                    
                case e.ENTER:
                    if (this.isExpanded() && this.selectedIndex >= 0) {
                        this.onViewClick(false);
                        e.stopEvent();
                    }
                    break;
                    
                case e.TAB:
                    if (this.isExpanded()) {
                        this.collapse();
                    }
                    break;
            }
        },
        
        setupComboHighContrastSupport: function() {
            if (!this.el) return;
            
            this.el.addClass('x-accessibility-combobox');
            
            if (this.trigger) {
                this.trigger.addClass('x-accessibility-trigger');
            }
        },
        
        onComboExpand: function() {
            if (!this.accessibilityConfig) return;
            
            // Update aria-expanded
            if (this.el) {
                this.el.set({'aria-expanded': 'true'});
            }
            
            // Set up list accessibility when it's created
            if (this.list) {
                this.setupListAccessibility();
            }
            
            // Announce expansion
            if (this.accessibilityConfig.screenReaderSupport) {
                var itemCount = this.store ? this.store.getCount() : 0;
                var announcement = 'Dropdown opened with ' + itemCount + ' options';
                this.announceToScreenReader(announcement, 'polite');
            }
        },
        
        onComboCollapse: function() {
            if (!this.accessibilityConfig) return;
            
            // Update aria-expanded
            if (this.el) {
                this.el.set({'aria-expanded': 'false'});
                this.el.set({'aria-activedescendant': ''}); // Clear active descendant
            }
            
            // Announce collapse
            if (this.accessibilityConfig.screenReaderSupport) {
                this.announceToScreenReader('Dropdown closed', 'polite');
            }
        },
        
        setupListAccessibility: function() {
            if (!this.list || !this.list.el) return;
            
            // Set listbox role and attributes on the list container
            this.list.el.set({
                'role': 'listbox',
                'id': this.listboxId,
                'aria-label': (this.fieldLabel || 'Options') + ' list'
            });
            
            // Set up list items
            this.setupListItemsAccessibility();
            
            // Monitor list for updates
            if (this.view) {
                this.mon(this.view, {
                    scope: this,
                    refresh: this.setupListItemsAccessibility,
                    beforeclick: this.onBeforeListItemClick
                });
            }
        },
        
        setupListItemsAccessibility: function() {
            if (!this.view || !this.view.getNodes) return;
            
            var nodes = this.view.getNodes();
            for (var i = 0; i < nodes.length; i++) {
                var node = Ext.get(nodes[i]);
                if (node) {
                    node.set({
                        'role': 'option',
                        'id': this.id + '-option-' + i,
                        'aria-selected': 'false'
                    });
                }
            }
        },
        
        onBeforeListItemClick: function(view, index, node, e) {
            // Update aria-activedescendant before selection
            if (this.el && node) {
                this.el.set({'aria-activedescendant': node.id});
            }
        },
        
        onComboSelect: function(combo, record, index) {
            if (!this.accessibilityConfig) return;
            
            // Update aria-activedescendant
            if (this.el) {
                var optionId = this.id + '-option-' + index;
                this.el.set({'aria-activedescendant': optionId});
            }
            
            // Update selected state on list items
            if (this.view && this.view.getNodes) {
                var nodes = this.view.getNodes();
                for (var i = 0; i < nodes.length; i++) {
                    var node = Ext.get(nodes[i]);
                    if (node) {
                        node.set({'aria-selected': i === index ? 'true' : 'false'});
                    }
                }
            }
            
            // Announce selection
            if (this.accessibilityConfig.announceSelection && this.accessibilityConfig.screenReaderSupport) {
                var displayText = record.get(this.displayField);
                var announcement = 'Selected: ' + displayText;
                this.announceToScreenReader(announcement, 'polite');
            }
        },
        
        onComboBeforeQuery: function(queryEvent) {
            if (!this.accessibilityConfig.announceFiltering) return;
            
            // Announce filtering action
            if (this.accessibilityConfig.screenReaderSupport && queryEvent.query) {
                var announcement = 'Filtering options for: ' + queryEvent.query;
                this.announceToScreenReader(announcement, 'polite');
            }
        },
        
        // Override selectByIndex to update accessibility attributes
        selectByIndex: function(index, scrollIntoView) {
            // Call original method
            var result = Ext.form.ComboBox.superclass.selectByIndex?.call(this, index, scrollIntoView);
            
            // Update aria-activedescendant
            if (this.el && index >= 0) {
                var optionId = this.id + '-option-' + index;
                this.el.set({'aria-activedescendant': optionId});
            }
            
            return result;
        },
        
        // Override setValue to announce changes
        setValue: function(value) {
            var oldValue = this.getValue();
            var result = Ext.form.ComboBox.superclass.setValue.call(this, value);
            
            // Announce value change if different
            if (this.rendered && this.accessibilityConfig.announceSelection && 
                this.accessibilityConfig.screenReaderSupport && value !== oldValue) {
                
                var displayValue = this.getDisplayValue();
                if (displayValue) {
                    var announcement = 'Value changed to: ' + displayValue;
                    this.announceToScreenReader(announcement, 'polite');
                }
            }
            
            return result;
        },
        
        getDisplayValue: function() {
            var value = this.getValue();
            if (!value) return '';
            
            // If we have a store and display field, get the display value
            if (this.store && this.displayField) {
                var record = this.findRecord(this.valueField || this.displayField, value);
                if (record) {
                    return record.get(this.displayField);
                }
            }
            
            return value;
        },
        
        // Override onFocus to announce field information
        onFocus: function() {
            // Call original method
            Ext.form.ComboBox.superclass.onFocus.apply(this, arguments);
            
            // Announce field information
            if (this.accessibilityConfig.screenReaderSupport) {
                var announcement = this.getComboAnnouncement();
                if (announcement) {
                    this.announceToScreenReader(announcement, 'polite');
                }
            }
        },
        
        getComboAnnouncement: function() {
            var parts = [];
            
            // Field label
            if (this.fieldLabel) {
                parts.push(this.fieldLabel);
            }
            
            // Field type
            parts.push('combobox');
            
            // Required status
            if (this.allowBlank === false) {
                parts.push('required');
            }
            
            // Current value
            var displayValue = this.getDisplayValue();
            if (displayValue) {
                parts.push('current value: ' + displayValue);
            } else {
                parts.push('no selection');
            }
            
            // Instructions
            parts.push('Use arrow keys to navigate options');
            
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
        
        // Override setDisabled to update ARIA attributes
        setDisabled: function(disabled) {
            var result = Ext.form.ComboBox.superclass.setDisabled.call(this, disabled);
            
            if (this.rendered && this.el) {
                this.el.set({'aria-disabled': disabled ? 'true' : 'false'});
            }
            
            if (this.trigger) {
                this.trigger.set({'aria-disabled': disabled ? 'true' : 'false'});
            }
            
            return result;
        }
    });
    
    // ====================================
    // ComboBox Accessibility Styles
    // ====================================
    
    var comboBoxAccessibilityStyles = [
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
        '.x-accessibility-combobox:focus {',
        '    outline: 3px solid #0078d4 !important;',
        '    outline-offset: 2px !important;',
        '}',
        '',
        '.x-accessibility-trigger:focus {',
        '    outline: 2px solid #0078d4 !important;',
        '    outline-offset: 1px !important;',
        '}',
        '',
        '.x-combo-list[role="listbox"] {',
        '    border: 2px solid #0078d4 !important;',
        '}',
        '',
        '.x-combo-list-item[role="option"]:focus,',
        '.x-combo-list-item[role="option"]:hover {',
        '    outline: 2px solid #0078d4 !important;',
        '    outline-offset: -2px !important;',
        '}',
        '',
        '.x-combo-list-item[role="option"][aria-selected="true"] {',
        '    background-color: #0078d4 !important;',
        '    color: white !important;',
        '    font-weight: bold !important;',
        '}',
        '',
        '@media (prefers-contrast: high) {',
        '    .x-accessibility-combobox {',
        '        border: 2px solid ButtonText !important;',
        '        background: Field !important;',
        '        color: FieldText !important;',
        '    }',
        '    .x-accessibility-combobox:focus {',
        '        outline: 3px solid Highlight !important;',
        '    }',
        '    .x-accessibility-trigger {',
        '        border: 2px solid ButtonText !important;',
        '        background: ButtonFace !important;',
        '        color: ButtonText !important;',
        '    }',
        '    .x-combo-list[role="listbox"] {',
        '        border: 3px solid ButtonText !important;',
        '        background: Field !important;',
        '    }',
        '    .x-combo-list-item[role="option"][aria-selected="true"] {',
        '        background: Highlight !important;',
        '        color: HighlightText !important;',
        '    }',
        '}'
    ].join('\n');
    
    // Inject styles
    var styleSheet = document.createElement('style');
    styleSheet.type = 'text/css';
    styleSheet.innerHTML = comboBoxAccessibilityStyles;
    document.getElementsByTagName('head')[0].appendChild(styleSheet);
    
    console.log('ComboBoxOverride: ComboBox accessibility features loaded successfully');
});
