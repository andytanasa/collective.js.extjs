(function(){
    var baseOnRender = Ext.Button.prototype.onRender;
    var baseAfterRender = Ext.Button.prototype.afterRender;
    var baseOnClick = Ext.Button.prototype.onClick;
    var baseOnFocus = Ext.Button.prototype.onFocus;
    var baseOnBlur = Ext.Button.prototype.onBlur;
    var baseSetText = Ext.Button.prototype.setText;
    var baseSetIconClass = Ext.Button.prototype.setIconClass;
    var baseDisable = Ext.Button.prototype.disable;
    var baseEnable = Ext.Button.prototype.enable;
    var baseSetPressed = Ext.Button.prototype.setPressed;
    
    Ext.override(Ext.Button, {
        onRender: function(ct, position){
            baseOnRender.call(this, ct, position);
            
            // Set proper ARIA role
            this.btnEl.dom.setAttribute('role', 'button');
            
            // Set ARIA label or accessible name
            this.updateAriaLabel();
            
            // Set ARIA pressed state for toggle buttons
            if(this.enableToggle){
                this.btnEl.dom.setAttribute('aria-pressed', this.pressed ? 'true' : 'false');
            }
            
            // Set ARIA expanded for menu buttons
            if(this.menu){
                this.btnEl.dom.setAttribute('aria-haspopup', 'true');
                this.btnEl.dom.setAttribute('aria-expanded', 'false');
            }
            
            // Set ARIA disabled state
            if(this.disabled){
                this.btnEl.dom.setAttribute('aria-disabled', 'true');
            }
            
            // Ensure button is keyboard focusable
            if(!Ext.isDefined(this.tabIndex)){
                this.btnEl.dom.setAttribute('tabindex', '0');
            }
            
            // Set table role to presentation if using table layout
            if(this.el && this.el.dom.tagName === 'TABLE'){
                this.el.dom.setAttribute('role', 'presentation');
            }
        },
        
        afterRender: function(){
            baseAfterRender.call(this);
            
            // Add keyboard event listeners for accessibility
            this.mon(this.btnEl, {
                scope: this,
                keydown: this.onKeyDown,
                keyup: this.onKeyUp
            });
            
            // Monitor menu show/hide events for ARIA expanded
            if(this.menu){
                this.mon(this.menu, {
                    scope: this,
                    show: this.onMenuShowAccessibility,
                    hide: this.onMenuHideAccessibility
                });
            }
        },
        
        // Enhanced click handler with keyboard support
        onClick: function(e){
            baseOnClick.call(this, e);
        },
        
        // Keyboard navigation support
        onKeyDown: function(e){
            var key = e.getKey();
            
            // Space or Enter key activation
            if(key === e.SPACE || key === e.ENTER){
                e.stopEvent();
                if(!this.disabled){
                    // Prevent double activation on space key
                    if(key === e.SPACE){
                        this.keyPressActivated = true;
                    }
                    this.onClick(e);
                }
            }
            // Arrow down for menu buttons
            else if(key === e.DOWN && this.menu && !this.disabled){
                e.stopEvent();
                this.showMenu();
                // Focus first menu item
                if(this.menu.items && this.menu.items.getCount() > 0){
                    var firstItem = this.menu.items.first();
                    if(firstItem && firstItem.focus){
                        firstItem.focus.defer(10, firstItem);
                    }
                }
            }
            // Escape key to close menu
            else if(key === e.ESC && this.menu && this.menu.isVisible()){
                e.stopEvent();
                this.hideMenu();
                this.focus();
            }
        },
        
        // Prevent double activation on space key release
        onKeyUp: function(e){
            if(e.getKey() === e.SPACE && this.keyPressActivated){
                e.stopEvent();
                this.keyPressActivated = false;
            }
        },
        
        // Enhanced focus handling
        onFocus: function(e){
            baseOnFocus.call(this, e);
            
            // Add high contrast focus indicator
            this.el.addClass('x-btn-focus-accessible');
            
            // Announce button state to screen readers
            if(this.enableToggle && this.pressed){
                this.btnEl.dom.setAttribute('aria-describedby', this.id + '-pressed-desc');
                if(!Ext.get(this.id + '-pressed-desc')){
                    Ext.DomHelper.append(document.body, {
                        id: this.id + '-pressed-desc',
                        tag: 'div',
                        cls: 'x-hide-offsets',
                        html: 'pressed'
                    });
                }
            }
        },
        
        // Enhanced blur handling
        onBlur: function(e){
            baseOnBlur.call(this, e);
            this.el.removeClass('x-btn-focus-accessible');
            
            // Remove temporary screen reader descriptions
            var desc = Ext.get(this.id + '-pressed-desc');
            if(desc){
                desc.remove();
            }
        },
        
        // Update ARIA label when text changes
        setText: function(text){
            baseSetText.call(this, text);
            if(this.rendered){
                this.updateAriaLabel();
            }
            return this;
        },
        
        // Update ARIA label when icon changes
        setIconClass: function(cls){
            baseSetIconClass.call(this, cls);
            if(this.rendered){
                this.updateAriaLabel();
            }
            return this;
        },
        
        // Update ARIA states when disabled
        disable: function(){
            baseDisable.call(this);
            if(this.rendered){
                this.btnEl.dom.setAttribute('aria-disabled', 'true');
            }
            return this;
        },
        
        // Update ARIA states when enabled
        enable: function(){
            baseEnable.call(this);
            if(this.rendered){
                this.btnEl.dom.removeAttribute('aria-disabled');
            }
            return this;
        },
        
        // Update ARIA pressed state for toggle buttons
        setPressed: function(pressed){
            baseSetPressed.call(this, pressed);
            if(this.rendered && this.enableToggle){
                this.btnEl.dom.setAttribute('aria-pressed', pressed ? 'true' : 'false');
            }
            return this;
        },
        
        // Menu accessibility handlers
        onMenuShowAccessibility: function(){
            if(this.rendered){
                this.btnEl.dom.setAttribute('aria-expanded', 'true');
            }
        },
        
        onMenuHideAccessibility: function(){
            if(this.rendered){
                this.btnEl.dom.setAttribute('aria-expanded', 'false');
            }
        },
        
        // Helper method to update ARIA label
        updateAriaLabel: function(){
            if(!this.rendered) return;
            
            var label = this.text || 
                       (this.tooltip && (typeof this.tooltip === 'string' ? this.tooltip : 
                        (this.tooltip.text || this.tooltip.title))) ||
                       (this.iconCls && this.ariaLabel) ||
                       'Button';
            
            // For icon-only buttons, provide meaningful labels
            if(!this.text && this.iconCls){
                var iconLabel = this.getIconAriaLabel(this.iconCls);
                if(iconLabel){
                    label = iconLabel;
                }
            }
            
            this.btnEl.dom.setAttribute('aria-label', label);
            
            // Set accessible description if tooltip exists and is different from label
            if(this.tooltip && typeof this.tooltip === 'object' && this.tooltip.text && 
               this.tooltip.text !== label){
                this.btnEl.dom.setAttribute('aria-describedby', this.id + '-tooltip-desc');
                if(!Ext.get(this.id + '-tooltip-desc')){
                    Ext.DomHelper.append(document.body, {
                        id: this.id + '-tooltip-desc',
                        tag: 'div',
                        cls: 'x-hide-offsets',
                        html: this.tooltip.text
                    });
                }
            }
        },
        
        // Helper method to provide meaningful labels for common icons
        getIconAriaLabel: function(iconCls){
            var iconLabels = {
                'add': 'Add',
                'add16': 'Add',
                'add24': 'Add',
                'delete': 'Delete',
                'edit': 'Edit',
                'save': 'Save',
                'cancel': 'Cancel',
                'search': 'Search',
                'refresh': 'Refresh',
                'close': 'Close',
                'help': 'Help',
                'info': 'Information',
                'warning': 'Warning',
                'error': 'Error',
                'success': 'Success',
                'settings': 'Settings',
                'config': 'Configuration',
                'menu': 'Menu',
                'home': 'Home',
                'back': 'Back',
                'forward': 'Forward',
                'up': 'Up',
                'down': 'Down',
                'left': 'Left',
                'right': 'Right'
            };
            
            // Try exact match first
            if(iconLabels[iconCls]){
                return iconLabels[iconCls];
            }
            
            // Try partial matches
            for(var key in iconLabels){
                if(iconCls.indexOf(key) !== -1){
                    return iconLabels[key];
                }
            }
            
            return null;
        }
    });
    
    // Add CSS for high contrast focus indicators
    if(typeof Ext.util.CSS !== 'undefined'){
        Ext.util.CSS.createStyleSheet(
            '.x-btn-focus-accessible { ' +
                'outline: 2px solid #005fcc !important; ' +
                'outline-offset: 2px !important; ' +
            '} ' +
            '.x-hide-offsets { ' +
                'position: absolute !important; ' +
                'left: -10000px !important; ' +
                'width: 1px !important; ' +
                'height: 1px !important; ' +
                'overflow: hidden !important; ' +
            '}', 
            'button-accessibility'
        );
    }
})();
