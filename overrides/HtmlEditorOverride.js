/*!
 * Ext JS Library 3.4.0 - HTML Editor Accessibility Override
 * Copyright(c) 2006-2011 Sencha Inc.
 * Accessibility Enhancement for WCAG AA Compliance
 * 
 * This override provides comprehensive accessibility features for Ext.form.HtmlEditor
 * including proper ARIA attributes, keyboard navigation, screen reader support,
 * toolbar accessibility, and content editing accessibility.
 */

Ext.onReady(function() {
    
    // ====================================
    // HTML Editor Accessibility Enhancement
    // ====================================
    
    Ext.override(Ext.form.HtmlEditor, {
        
        // Accessibility configuration
        accessibilityConfig: {
            ariaTextbox: true,
            announceEditorModes: true,
            toolbarAccessibility: true,
            screenReaderSupport: true,
            keyboardNavigation: true,
            contentAccessibility: true,
            announceFormatting: false // Can be verbose
        },
        
        initComponent: function() {
            // Call original initComponent
            Ext.form.HtmlEditor.superclass.initComponent.call(this);
            
            // Initialize accessibility features
            this.initHtmlEditorAccessibility();
        },
        
        initHtmlEditorAccessibility: function() {
            // Add accessibility event listeners
            this.on('render', this.setupHtmlEditorAccessibility, this);
            this.on('initialize', this.onHtmlEditorInitialize, this);
            this.on('activate', this.onHtmlEditorActivate, this);
            this.on('editmodechange', this.onEditModeChange, this);
            this.on('push', this.onContentPush, this);
            this.on('sync', this.onContentSync, this);
        },
        
        setupHtmlEditorAccessibility: function() {
            if (!this.rendered || !this.el) return;
            
            try {
                // Set up basic HTML editor ARIA attributes
                this.setupHtmlEditorARIA();
                
                // Set up editor descriptions
                this.setupHtmlEditorDescriptions();
                
                // Set up keyboard navigation for the editor container
                if (this.accessibilityConfig.keyboardNavigation) {
                    this.setupHtmlEditorKeyboardSupport();
                }
                
            } catch (e) {
                console.warn('HtmlEditorOverride: Error setting up HtmlEditor accessibility:', e);
            }
        },
        
        setupHtmlEditorARIA: function() {
            if (!this.el) return;
            
            // Set main container attributes
            this.el.set({
                'role': 'region',
                'aria-label': this.fieldLabel ? this.fieldLabel + ' rich text editor' : 'Rich text editor'
            });
            
            // Set textarea (source mode) attributes
            if (this.el.dom.tagName.toLowerCase() === 'textarea') {
                this.el.set({
                    'role': 'textbox',
                    'aria-multiline': 'true',
                    'aria-label': 'HTML source code editor'
                });
            }
        },
        
        setupHtmlEditorDescriptions: function() {
            var descriptionsId = this.id + '-editor-descriptions';
            var instructionsId = this.id + '-editor-instructions';
            
            // Create editor instructions
            var instructions = this.getEditorInstructions();
            if (instructions) {
                var instructionsEl = Ext.DomHelper.insertFirst(this.el, {
                    tag: 'div',
                    id: instructionsId,
                    cls: 'x-hidden-accessibility',
                    html: instructions
                });
                
                // Link instructions to editor
                this.instructionsId = instructionsId;
            }
            
            // Create live region for announcements
            this.liveRegionId = this.id + '-live-region';
            Ext.DomHelper.append(document.body, {
                tag: 'div',
                id: this.liveRegionId,
                cls: 'x-hidden-accessibility',
                'aria-live': 'polite',
                'aria-atomic': 'true'
            });
        },
        
        setupHtmlEditorKeyboardSupport: function() {
            if (!this.el) return;
            
            // Add container-level keyboard handling
            this.mon(this.el, {
                scope: this,
                keydown: this.onHtmlEditorKeyDown
            });
        },
        
        onHtmlEditorKeyDown: function(e) {
            var key = e.getKey();
            
            // F11 for source edit toggle (if enabled)
            if (key === e.F11 && this.enableSourceEdit) {
                e.preventDefault();
                this.toggleSourceEdit(!this.sourceEditMode);
                return;
            }
            
            // Ctrl+B for bold (when in WYSIWYG mode)
            if (e.ctrlKey && key === e.B && !this.sourceEditMode && this.enableFormat) {
                e.preventDefault();
                this.relayBtnCmd('bold');
                return;
            }
            
            // Ctrl+I for italic (when in WYSIWYG mode)
            if (e.ctrlKey && key === e.I && !this.sourceEditMode && this.enableFormat) {
                e.preventDefault();
                this.relayBtnCmd('italic');
                return;
            }
            
            // Ctrl+U for underline (when in WYSIWYG mode)
            if (e.ctrlKey && key === e.U && !this.sourceEditMode && this.enableFormat) {
                e.preventDefault();
                this.relayBtnCmd('underline');
                return;
            }
        },
        
        onHtmlEditorInitialize: function() {
            if (!this.accessibilityConfig) return;
            
            // Set up iframe accessibility after initialization
            this.setupIframeAccessibility();
            
            // Set up toolbar accessibility
            if (this.accessibilityConfig.toolbarAccessibility) {
                this.setupToolbarAccessibility();
            }
            
            // Announce initialization
            if (this.accessibilityConfig.announceEditorModes && this.accessibilityConfig.screenReaderSupport) {
                this.announceToScreenReader('Rich text editor initialized and ready for editing', 'polite');
            }
        },
        
        setupIframeAccessibility: function() {
            var iframe = this.getFrame();
            var doc = this.getDoc();
            var body = this.getEditorBody();
            
            if (iframe) {
                // Set iframe attributes
                iframe.setAttribute('title', 'Rich text editing area');
                iframe.setAttribute('role', 'textbox');
                iframe.setAttribute('aria-multiline', 'true');
                iframe.setAttribute('aria-label', 'Rich text content');
                
                // Link to instructions if available
                if (this.instructionsId) {
                    iframe.setAttribute('aria-describedby', this.instructionsId);
                }
            }
            
            if (doc && body) {
                // Set body role for screen readers
                try {
                    body.setAttribute('role', 'textbox');
                    body.setAttribute('aria-multiline', 'true');
                    body.setAttribute('contenteditable', 'true');
                    
                    // Add keyboard event handling to iframe content
                    this.mon(Ext.get(doc), {
                        scope: this,
                        keydown: this.onIframeKeyDown,
                        focus: this.onIframeFocus,
                        blur: this.onIframeBlur
                    });
                    
                } catch (e) {
                    console.warn('HtmlEditorOverride: Could not set iframe body accessibility attributes:', e);
                }
            }
        },
        
        setupToolbarAccessibility: function() {
            if (!this.tb || !this.tb.items) return;
            
            try {
                // Set toolbar role
                if (this.tb.el) {
                    this.tb.el.set({
                        'role': 'toolbar',
                        'aria-label': 'Text formatting toolbar'
                    });
                }
                
                // Enhance individual toolbar items
                this.tb.items.each(function(item) {
                    this.enhanceToolbarItem(item);
                }, this);
                
                // Set up font selector accessibility
                if (this.fontSelect) {
                    this.fontSelect.set({
                        'role': 'combobox',
                        'aria-label': 'Font family selector',
                        'aria-expanded': 'false'
                    });
                }
                
            } catch (e) {
                console.warn('HtmlEditorOverride: Error setting up toolbar accessibility:', e);
            }
        },
        
        enhanceToolbarItem: function(item) {
            if (!item || !item.el) return;
            
            var el = item.el;
            var itemId = item.itemId;
            
            // Skip separators and non-interactive items
            if (!itemId || item.xtype === 'tbseparator') return;
            
            try {
                // Set button role and attributes
                el.set({
                    'role': 'button',
                    'tabindex': '0'
                });
                
                // Set accessible names for common buttons
                var accessibleNames = {
                    'bold': 'Bold',
                    'italic': 'Italic',
                    'underline': 'Underline',
                    'increasefontsize': 'Increase font size',
                    'decreasefontsize': 'Decrease font size',
                    'forecolor': 'Text color',
                    'backcolor': 'Background color',
                    'justifyleft': 'Align left',
                    'justifycenter': 'Align center',
                    'justifyright': 'Align right',
                    'createlink': 'Create link',
                    'insertorderedlist': 'Insert numbered list',
                    'insertunorderedlist': 'Insert bulleted list',
                    'sourceedit': 'Toggle source edit'
                };
                
                var accessibleName = accessibleNames[itemId] || item.tooltip || itemId;
                el.set({'aria-label': accessibleName});
                
                // Set pressed state for toggle buttons
                if (item.enableToggle) {
                    el.set({'aria-pressed': item.pressed ? 'true' : 'false'});
                    
                    // Monitor toggle state changes
                    item.on('toggle', function(btn, pressed) {
                        if (btn.el) {
                            btn.el.set({'aria-pressed': pressed ? 'true' : 'false'});
                        }
                    });
                }
                
                // Add keyboard support
                this.mon(el, {
                    scope: this,
                    keydown: function(e) {
                        var key = e.getKey();
                        if (key === e.ENTER || key === e.SPACE) {
                            e.preventDefault();
                            item.handler.call(item.scope || this, item);
                        }
                    }
                });
                
            } catch (e) {
                console.warn('HtmlEditorOverride: Error enhancing toolbar item:', itemId, e);
            }
        },
        
        onIframeKeyDown: function(e) {
            // Handle special keys in iframe content
            var key = e.getKey();
            
            // Announce formatting changes for screen readers
            if (this.accessibilityConfig.announceFormatting && this.accessibilityConfig.screenReaderSupport) {
                if (e.ctrlKey) {
                    switch (key) {
                        case e.B:
                            setTimeout(() => this.announceFormattingChange('Bold formatting applied'), 100);
                            break;
                        case e.I:
                            setTimeout(() => this.announceFormattingChange('Italic formatting applied'), 100);
                            break;
                        case e.U:
                            setTimeout(() => this.announceFormattingChange('Underline formatting applied'), 100);
                            break;
                    }
                }
            }
        },
        
        onIframeFocus: function() {
            if (!this.accessibilityConfig.screenReaderSupport) return;
            
            // Announce focus on iframe content
            var announcement = 'Rich text editor content. Use formatting toolbar buttons or keyboard shortcuts to format text.';
            this.announceToScreenReader(announcement, 'polite');
        },
        
        onIframeBlur: function() {
            // Sync content when focus leaves iframe
            if (this.initialized) {
                this.syncValue();
            }
        },
        
        onHtmlEditorActivate: function() {
            if (!this.accessibilityConfig.announceEditorModes || !this.accessibilityConfig.screenReaderSupport) return;
            
            var mode = this.sourceEditMode ? 'source code' : 'visual editing';
            this.announceToScreenReader('HTML editor activated in ' + mode + ' mode', 'polite');
        },
        
        onEditModeChange: function(editor, sourceEdit) {
            if (!this.accessibilityConfig.announceEditorModes || !this.accessibilityConfig.screenReaderSupport) return;
            
            var mode = sourceEdit ? 'source code editing' : 'visual editing';
            var announcement = 'Switched to ' + mode + ' mode';
            
            this.announceToScreenReader(announcement, 'assertive');
            
            // Update iframe accessibility based on mode
            if (this.initialized) {
                setTimeout(() => {
                    if (sourceEdit) {
                        // In source mode, ensure textarea is accessible
                        if (this.el && this.el.dom.tagName.toLowerCase() === 'textarea') {
                            this.el.set({
                                'aria-label': 'HTML source code editor',
                                'role': 'textbox',
                                'aria-multiline': 'true'
                            });
                        }
                    } else {
                        // In WYSIWYG mode, ensure iframe is accessible
                        this.setupIframeAccessibility();
                    }
                }, 100);
            }
        },
        
        onContentPush: function(editor, html) {
            // Announce significant content changes if enabled
            if (this.accessibilityConfig.announceFormatting && this.accessibilityConfig.screenReaderSupport) {
                // Only announce if this seems like a significant change
                if (html && html.length > 50 && html !== this.lastAnnouncedContent) {
                    this.announceToScreenReader('Content updated in editor', 'polite');
                    this.lastAnnouncedContent = html;
                }
            }
        },
        
        onContentSync: function(editor, html) {
            // Update any content-related accessibility attributes
            if (this.initialized && this.getEditorBody()) {
                try {
                    var body = this.getEditorBody();
                    var hasContent = html && html.trim().length > 0;
                    
                    // Update empty state for screen readers
                    if (hasContent) {
                        body.removeAttribute('aria-placeholder');
                    } else {
                        body.setAttribute('aria-placeholder', 'Enter your content here');
                    }
                } catch (e) {
                    // Ignore errors accessing iframe content
                }
            }
        },
        
        announceFormattingChange: function(message) {
            if (!message || !this.accessibilityConfig.screenReaderSupport) return;
            
            this.announceToScreenReader(message, 'assertive');
        },
        
        getEditorInstructions: function() {
            var instructions = [];
            
            instructions.push('Rich text editor with formatting toolbar.');
            
            if (this.enableSourceEdit) {
                instructions.push('Press F11 to toggle between visual and source code editing.');
            }
            
            if (this.enableFormat) {
                instructions.push('Use Ctrl+B for bold, Ctrl+I for italic, Ctrl+U for underline.');
            }
            
            instructions.push('Use the toolbar buttons or keyboard shortcuts to format your content.');
            
            return instructions.join(' ');
        },
        
        announceToScreenReader: function(message, priority) {
            if (!message) return;
            
            priority = priority || 'polite';
            
            var liveRegion = Ext.get(this.liveRegionId);
            if (liveRegion) {
                liveRegion.set({'aria-live': priority});
                liveRegion.update(message);
                
                // Clear the message after a delay
                setTimeout(function() {
                    if (liveRegion.dom) {
                        liveRegion.update('');
                    }
                }, 1000);
            }
        },
        
        // Override setDisabled to update accessibility attributes
        setDisabled: function(disabled) {
            var result = Ext.form.HtmlEditor.superclass.setDisabled.call(this, disabled);
            
            // Update ARIA attributes
            if (this.rendered) {
                if (this.el) {
                    this.el.set({'aria-disabled': disabled ? 'true' : 'false'});
                }
                
                // Update iframe if initialized
                if (this.initialized) {
                    var iframe = this.getFrame();
                    if (iframe) {
                        iframe.setAttribute('aria-disabled', disabled ? 'true' : 'false');
                    }
                    
                    var body = this.getEditorBody();
                    if (body) {
                        body.setAttribute('contenteditable', disabled ? 'false' : 'true');
                    }
                }
            }
            
            return result;
        },
        
        // Override setReadOnly to update accessibility attributes
        setReadOnly: function(readOnly) {
            var result = Ext.form.HtmlEditor.superclass.setReadOnly.call(this, readOnly);
            
            // Update ARIA attributes
            if (this.rendered && this.initialized) {
                var iframe = this.getFrame();
                if (iframe) {
                    iframe.setAttribute('aria-readonly', readOnly ? 'true' : 'false');
                }
                
                var body = this.getEditorBody();
                if (body) {
                    body.setAttribute('aria-readonly', readOnly ? 'true' : 'false');
                }
            }
            
            return result;
        },
        
        // Override destroy to clean up accessibility resources
        beforeDestroy: function() {
            // Clean up live region
            var liveRegion = Ext.get(this.liveRegionId);
            if (liveRegion) {
                liveRegion.remove();
            }
            
            // Clean up instructions
            var instructions = Ext.get(this.instructionsId);
            if (instructions) {
                instructions.remove();
            }
            
            // Call original method
            Ext.form.HtmlEditor.superclass.beforeDestroy.apply(this, arguments);
        }
    });
    
    // ====================================
    // Hidden Accessibility Helper Styles
    // ====================================
    
    var htmlEditorAccessibilityStyles = [
        '.x-hidden-accessibility {',
        '    position: absolute !important;',
        '    clip: rect(1px, 1px, 1px, 1px) !important;',
        '    width: 1px !important;',
        '    height: 1px !important;',
        '    overflow: hidden !important;',
        '    border: 0 !important;',
        '    padding: 0 !important;',
        '    margin: 0 !important;',
        '}'
    ].join('\n');
    
    // Inject styles for screen reader only content
    var styleSheet = document.createElement('style');
    styleSheet.type = 'text/css';
    styleSheet.innerHTML = htmlEditorAccessibilityStyles;
    document.getElementsByTagName('head')[0].appendChild(styleSheet);
});
