/*!
 * Ext JS Library 3.4.0 - TabPanel Accessibility Override
 * Copyright(c) 2006-2011 Sencha Inc.
 * Accessibility Enhancement for WCAG AA Compliance
 * 
 * This override provides comprehensive accessibility features for Ext.TabPanel
 * including proper ARIA attributes, keyboard navigation, screen reader support,
 * and focus management.
 */

Ext.onReady(function() {
    
    // ====================================
    // TabPanel Accessibility Enhancement
    // ====================================
    
    Ext.override(Ext.TabPanel, {
        
        // Accessibility configuration
        accessibilityConfig: {
            ariaTabList: true,
            announceTabChanges: true,
            keyboardNavigation: true,
            screenReaderSupport: true,
            highContrast: true,
            focusManagement: true
        },
        
        initComponent: function() {
            // Call original initComponent
            Ext.TabPanel.superclass.initComponent.call(this);
            
            // Initialize accessibility features
            this.initTabAccessibility();
        },
        
        initTabAccessibility: function() {
            // Add accessibility event listeners
            this.on('render', this.setupTabAccessibility, this);
            this.on('tabchange', this.onTabChange, this);
            this.on('beforetabchange', this.onBeforeTabChange, this);
            this.on('add', this.onTabAdd, this);
            this.on('remove', this.onTabRemove, this);
        },
        
        setupTabAccessibility: function() {
            if (!this.rendered || !this.accessibilityConfig) return;
            
            try {
                // Set up main TabPanel ARIA attributes
                this.setupTabPanelARIA();
                
                // Set up tab strip accessibility
                this.setupTabStripAccessibility();
                
                // Set up keyboard navigation
                if (this.accessibilityConfig.keyboardNavigation) {
                    this.setupTabKeyboardNavigation();
                }
                
                // Set up individual tabs
                this.setupTabsAccessibility();
                
                // Set up scroll buttons accessibility
                this.setupScrollButtonsAccessibility();
                
                // Set up high contrast support
                if (this.accessibilityConfig.highContrast) {
                    this.setupTabHighContrastSupport();
                }
                
            } catch (e) {
                console.warn('TabPanelOverride: Error setting up TabPanel accessibility:', e);
            }
        },
        
        setupTabPanelARIA: function() {
            if (!this.el) return;
            
            // Set main container role
            this.el.set({
                'role': 'tabpanel',
                'aria-label': this.title || 'Tab panel'
            });
            
            // Set up tab content area
            if (this.body) {
                this.body.set({
                    'role': 'tabpanel',
                    'aria-live': 'polite'
                });
            }
        },
        
        setupTabStripAccessibility: function() {
            if (!this.strip) return;
            
            // Set tablist role on the tab strip
            this.strip.set({
                'role': 'tablist',
                'aria-label': 'Tabs',
                'aria-orientation': this.tabPosition === 'left' || this.tabPosition === 'right' ? 'vertical' : 'horizontal'
            });
            
            // Make strip focusable for keyboard navigation
            this.strip.set({'tabindex': '0'});
            
            // Add keyboard event listeners to the strip
            this.mon(this.strip, {
                scope: this,
                keydown: this.onStripKeyDown,
                focus: this.onStripFocus,
                blur: this.onStripBlur
            });
        },
        
        setupTabsAccessibility: function() {
            // Set up existing tabs
            this.items.each(function(item) {
                this.setupTabItemAccessibility(item);
            }, this);
        },
        
        setupTabItemAccessibility: function(item) {
            if (!item || !item.tabEl) return;
            
            var tabEl = Ext.get(item.tabEl);
            var linkEl = tabEl.child('a');
            
            if (linkEl) {
                // Set tab role and attributes
                linkEl.set({
                    'role': 'tab',
                    'aria-selected': item === this.activeTab ? 'true' : 'false',
                    'aria-controls': item.id || Ext.id(),
                    'tabindex': item === this.activeTab ? '0' : '-1',
                    'id': 'tab-' + (item.id || Ext.id())
                });
                
                // Remove href to prevent default navigation
                linkEl.set({'href': 'javascript:void(0)'});
                
                // Set accessible name
                var tabText = this.getTabAccessibleName(item);
                linkEl.set({'aria-label': tabText});
                
                // Set up disabled state
                if (item.disabled) {
                    linkEl.set({
                        'aria-disabled': 'true',
                        'tabindex': '-1'
                    });
                }
                
                // Set up closable tab accessibility
                this.setupCloseButtonAccessibility(item, tabEl);
            }
            
            // Set up tab panel content
            if (item.el) {
                item.el.set({
                    'role': 'tabpanel',
                    'aria-labelledby': 'tab-' + (item.id || Ext.id()),
                    'tabindex': '0'
                });
                
                // Hide inactive tab panels from screen readers
                if (item !== this.activeTab) {
                    item.el.set({'aria-hidden': 'true'});
                } else {
                    item.el.set({'aria-hidden': 'false'});
                }
            }
        },
        
        setupCloseButtonAccessibility: function(item, tabEl) {
            if (!item.closable) return;
            
            var closeEl = tabEl.child('.x-tab-strip-close');
            if (closeEl) {
                closeEl.set({
                    'role': 'button',
                    'aria-label': 'Close ' + this.getTabAccessibleName(item),
                    'tabindex': '-1'
                });
                
                // Add keyboard support for close button
                this.mon(closeEl, {
                    scope: this,
                    keydown: function(e) {
                        var key = e.getKey();
                        if (key === e.ENTER || key === e.SPACE) {
                            e.stopEvent();
                            if (item.fireEvent('beforeclose', item) !== false) {
                                item.fireEvent('close', item);
                                this.remove(item);
                            }
                        }
                    }
                });
            }
        },
        
        getTabAccessibleName: function(item) {
            var name = item.title || item.tabTip || 'Tab';
            
            // Clean up HTML tags
            name = name.replace(/<[^>]*>/g, '');
            
            // Add additional context
            if (item.disabled) {
                name += ' (disabled)';
            }
            if (item.closable) {
                name += ' (closable)';
            }
            
            return name.trim();
        },
        
        setupTabKeyboardNavigation: function() {
            // Create KeyNav for arrow key navigation
            this.tabKeyNav = new Ext.KeyNav(this.strip, {
                scope: this,
                left: this.onTabNavLeft,
                right: this.onTabNavRight,
                up: this.onTabNavUp,
                down: this.onTabNavDown,
                home: this.onTabNavHome,
                end: this.onTabNavEnd,
                enter: this.onTabNavEnter,
                space: this.onTabNavEnter
            });
        },
        
        onStripKeyDown: function(e) {
            var key = e.getKey();
            
            // Handle tab key for close button navigation
            if (key === e.TAB && !e.shiftKey) {
                var activeTab = this.getActiveTab();
                if (activeTab && activeTab.closable) {
                    var tabEl = Ext.get(activeTab.tabEl);
                    var closeEl = tabEl.child('.x-tab-strip-close');
                    if (closeEl) {
                        e.stopEvent();
                        closeEl.focus();
                        return;
                    }
                }
            }
        },
        
        onTabNavLeft: function() {
            this.navigateTab(-1);
        },
        
        onTabNavRight: function() {
            this.navigateTab(1);
        },
        
        onTabNavUp: function() {
            if (this.tabPosition === 'left' || this.tabPosition === 'right') {
                this.navigateTab(-1);
            }
        },
        
        onTabNavDown: function() {
            if (this.tabPosition === 'left' || this.tabPosition === 'right') {
                this.navigateTab(1);
            }
        },
        
        onTabNavHome: function() {
            this.navigateToTab(0);
        },
        
        onTabNavEnd: function() {
            this.navigateToTab(this.items.getCount() - 1);
        },
        
        onTabNavEnter: function() {
            // Activate the currently focused tab
            var focusedTab = this.getFocusedTab();
            if (focusedTab && focusedTab !== this.activeTab) {
                this.setActiveTab(focusedTab);
            }
        },
        
        navigateTab: function(direction) {
            var currentIndex = this.getFocusedTabIndex();
            var newIndex = currentIndex + direction;
            
            // Wrap around if needed
            if (newIndex < 0) {
                newIndex = this.items.getCount() - 1;
            } else if (newIndex >= this.items.getCount()) {
                newIndex = 0;
            }
            
            this.navigateToTab(newIndex);
        },
        
        navigateToTab: function(index) {
            var tab = this.items.get(index);
            if (tab && !tab.disabled) {
                this.setTabFocus(tab);
            } else if (tab && tab.disabled) {
                // Skip disabled tabs
                var direction = index > this.getFocusedTabIndex() ? 1 : -1;
                this.navigateTab(direction);
            }
        },
        
        getFocusedTabIndex: function() {
            var focusedTab = this.getFocusedTab();
            return focusedTab ? this.items.indexOf(focusedTab) : 0;
        },
        
        getFocusedTab: function() {
            // Find the tab that currently has focus
            var focused = null;
            this.items.each(function(item) {
                if (item.tabEl) {
                    var linkEl = Ext.get(item.tabEl).child('a');
                    if (linkEl && linkEl.getAttribute('tabindex') === '0') {
                        focused = item;
                        return false; // Stop iteration
                    }
                }
            });
            return focused || this.activeTab;
        },
        
        setTabFocus: function(tab) {
            if (!tab || !tab.tabEl) return;
            
            // Remove focus from all tabs
            this.items.each(function(item) {
                if (item.tabEl) {
                    var linkEl = Ext.get(item.tabEl).child('a');
                    if (linkEl) {
                        linkEl.set({'tabindex': '-1'});
                    }
                }
            });
            
            // Set focus on target tab
            var linkEl = Ext.get(tab.tabEl).child('a');
            if (linkEl) {
                linkEl.set({'tabindex': '0'});
                linkEl.focus();
            }
        },
        
        onStripFocus: function() {
            // When strip gets focus, focus the active tab
            var activeTab = this.getActiveTab();
            if (activeTab) {
                this.setTabFocus(activeTab);
            }
        },
        
        onStripBlur: function() {
            // Announce when leaving the tab strip
            if (this.accessibilityConfig.screenReaderSupport) {
                this.announceToScreenReader('Left tab navigation', 'polite');
            }
        },
        
        setupScrollButtonsAccessibility: function() {
            // Set up left scroll button
            if (this.scrollLeft) {
                this.scrollLeft.set({
                    'role': 'button',
                    'aria-label': 'Scroll tabs left',
                    'tabindex': '0'
                });
                
                this.mon(this.scrollLeft, {
                    scope: this,
                    keydown: function(e) {
                        var key = e.getKey();
                        if (key === e.ENTER || key === e.SPACE) {
                            e.stopEvent();
                            this.onScrollLeft();
                        }
                    }
                });
            }
            
            // Set up right scroll button
            if (this.scrollRight) {
                this.scrollRight.set({
                    'role': 'button',
                    'aria-label': 'Scroll tabs right',
                    'tabindex': '0'
                });
                
                this.mon(this.scrollRight, {
                    scope: this,
                    keydown: function(e) {
                        var key = e.getKey();
                        if (key === e.ENTER || key === e.SPACE) {
                            e.stopEvent();
                            this.onScrollRight();
                        }
                    }
                });
            }
        },
        
        setupTabHighContrastSupport: function() {
            if (!this.strip) return;
            
            // Add high contrast class to tab strip
            this.strip.addClass('x-accessibility-focus-indicator');
            
            // Enhance tab focus indicators
            this.items.each(function(item) {
                if (item.tabEl) {
                    var tabEl = Ext.get(item.tabEl);
                    tabEl.addClass('x-accessibility-focus-indicator');
                }
            }, this);
        },
        
        onTabChange: function(tabPanel, newTab, oldTab) {
            if (!this.accessibilityConfig) return;
            
            // Update ARIA selected states
            this.updateTabARIAStates(newTab, oldTab);
            
            // Announce tab change to screen readers
            if (this.accessibilityConfig.announceTabChanges && this.accessibilityConfig.screenReaderSupport) {
                var announcement = 'Switched to ' + this.getTabAccessibleName(newTab);
                this.announceToScreenReader(announcement, 'polite');
            }
            
            // Update focus management
            if (this.accessibilityConfig.focusManagement) {
                this.setTabFocus(newTab);
            }
        },
        
        onBeforeTabChange: function(tabPanel, newTab, oldTab) {
            // Additional accessibility setup before tab change
            if (newTab && newTab.el) {
                newTab.el.set({'aria-hidden': 'false'});
            }
            if (oldTab && oldTab.el) {
                oldTab.el.set({'aria-hidden': 'true'});
            }
        },
        
        updateTabARIAStates: function(newTab, oldTab) {
            // Update aria-selected states
            if (oldTab && oldTab.tabEl) {
                var oldLinkEl = Ext.get(oldTab.tabEl).child('a');
                if (oldLinkEl) {
                    oldLinkEl.set({'aria-selected': 'false'});
                }
            }
            
            if (newTab && newTab.tabEl) {
                var newLinkEl = Ext.get(newTab.tabEl).child('a');
                if (newLinkEl) {
                    newLinkEl.set({'aria-selected': 'true'});
                }
            }
        },
        
        onTabAdd: function(tabPanel, tab, index) {
            // Set up accessibility for newly added tab
            if (this.rendered) {
                // Delay to ensure tab rendering is complete
                (function() {
                    this.setupTabItemAccessibility(tab);
                }).defer(10, this);
            }
        },
        
        onTabRemove: function(tabPanel, tab) {
            // Clean up accessibility resources if needed
            if (this.accessibilityConfig.screenReaderSupport) {
                var announcement = this.getTabAccessibleName(tab) + ' tab removed';
                this.announceToScreenReader(announcement, 'polite');
            }
        },
        
        // Override the original initTab method to add accessibility
        initTab: function(item, index) {
            // Call original method
            Ext.TabPanel.superclass.initTab?.call(this, item, index) || 
            this.constructor.superclass.initTab?.call(this, item, index);
            
            // Add accessibility features after tab is initialized
            if (this.rendered) {
                this.setupTabItemAccessibility(item);
            }
        },
        
        // Override setActiveTab to maintain accessibility
        setActiveTab: function(item) {
            var oldTab = this.activeTab;
            var result = Ext.TabPanel.superclass.setActiveTab.call(this, item);
            
            // Update accessibility states if tab actually changed
            if (result && this.activeTab !== oldTab) {
                this.updateTabARIAStates(this.activeTab, oldTab);
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
        },
        
        // Override beforeDestroy to clean up accessibility resources
        beforeDestroy: function() {
            // Clean up KeyNav
            if (this.tabKeyNav) {
                this.tabKeyNav.disable();
                delete this.tabKeyNav;
            }
            
            // Call original method
            Ext.TabPanel.superclass.beforeDestroy.apply(this, arguments);
        }
    });
    
    // ====================================
    // TabPanel Accessibility Styles
    // ====================================
    
    // Add CSS for TabPanel accessibility features
    var tabPanelAccessibilityStyles = [
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
        '.x-accessibility-focus-indicator:focus {',
        '    outline: 3px solid #0078d4 !important;',
        '    outline-offset: 2px !important;',
        '}',
        '',
        '/* TabPanel Accessibility Styles */',
        '.x-tab-strip[role="tablist"] {',
        '    outline: none;',
        '}',
        '',
        '.x-tab-strip a[role="tab"]:focus {',
        '    outline: 3px solid #0078d4 !important;',
        '    outline-offset: -2px !important;',
        '    z-index: 10 !important;',
        '    position: relative !important;',
        '}',
        '',
        '.x-tab-strip a[role="tab"][aria-selected="true"] {',
        '    font-weight: bold !important;',
        '}',
        '',
        '.x-tab-strip a[role="tab"][aria-disabled="true"] {',
        '    opacity: 0.5 !important;',
        '    cursor: not-allowed !important;',
        '}',
        '',
        '.x-tab-strip-close[role="button"]:focus {',
        '    outline: 2px solid #d83b01 !important;',
        '    outline-offset: 1px !important;',
        '}',
        '',
        '.x-tab-scroller-left[role="button"]:focus,',
        '.x-tab-scroller-right[role="button"]:focus {',
        '    outline: 2px solid #0078d4 !important;',
        '    outline-offset: 1px !important;',
        '}',
        '',
        '.x-tab-panel-body[role="tabpanel"] {',
        '    outline: none;',
        '}',
        '',
        '.x-tab-panel-body[role="tabpanel"]:focus-within {',
        '    outline: 1px solid #0078d4 !important;',
        '    outline-offset: -1px !important;',
        '}',
        '',
        '@media (prefers-reduced-motion: reduce) {',
        '    .x-tab-strip, .x-tab-panel {',
        '        transition: none !important;',
        '    }',
        '}',
        '',
        '@media (prefers-contrast: high) {',
        '    .x-tab-strip a[role="tab"] {',
        '        border: 2px solid ButtonText !important;',
        '        background: ButtonFace !important;',
        '        color: ButtonText !important;',
        '    }',
        '    .x-tab-strip a[role="tab"][aria-selected="true"] {',
        '        background: Highlight !important;',
        '        color: HighlightText !important;',
        '    }',
        '    .x-tab-strip a[role="tab"]:focus {',
        '        outline: 3px solid Highlight !important;',
        '    }',
        '}'
    ].join('\n');
    
    // Inject styles
    var styleSheet = document.createElement('style');
    styleSheet.type = 'text/css';
    styleSheet.innerHTML = tabPanelAccessibilityStyles;
    document.getElementsByTagName('head')[0].appendChild(styleSheet);
    
    console.log('TabPanelOverride: TabPanel accessibility features loaded successfully');
});
