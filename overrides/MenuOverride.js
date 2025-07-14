(function(){
    var baseOnRender = Ext.menu.Menu.prototype.onRender;
    var baseAfterRender = Ext.menu.Menu.prototype.afterRender;

    Ext.override(Ext.menu.Menu, {
        onRender: function(ct, position) {
            baseOnRender.call(this, ct, position);
            // Set ARIA role for menu
            this.el.dom.setAttribute('role', 'menu');
            this.el.dom.setAttribute('aria-label', this.title || 'Menu');
            // Ensure menu is keyboard focusable
            if (!Ext.isDefined(this.tabIndex)) {
                this.el.dom.setAttribute('tabindex', '0');
            }
        },
        afterRender: function() {
            baseAfterRender.call(this);
            // Add keyboard event listeners for accessibility
            this.mon(this.el, {
                scope: this,
                keydown: this.onMenuKeyDown
            });
            // Add focus/blur for visible focus indicator
            this.mon(this.el, {
                scope: this,
                focus: function() { this.el.addClass('x-menu-focus-accessible'); },
                blur: function() { this.el.removeClass('x-menu-focus-accessible'); }
            });
            // Set ARIA roles for menu items
            this.updateMenuAriaRoles();
        },
        updateMenuAriaRoles: function() {
            var items = this.items && this.items.items ? this.items.items : [];
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                if (item && item.el && item.el.dom) {
                    item.el.dom.setAttribute('role', 'menuitem');
                    if (item.menu) {
                        item.el.dom.setAttribute('aria-haspopup', 'true');
                    }
                    if (item.checked !== undefined) {
                        item.el.dom.setAttribute('aria-checked', item.checked ? 'true' : 'false');
                    }
                    if (item.disabled) {
                        item.el.dom.setAttribute('aria-disabled', 'true');
                    }
                }
            }
        },
        onMenuKeyDown: function(e) {
            var key = e.getKey();
            var items = this.items && this.items.items ? this.items.items : [];
            var focusable = items.filter(function(item){
                return item && item.el && !item.disabled && item.el.isVisible();
            });
            var currentIndex = focusable.findIndex(function(item){
                return item.el && item.el.dom === document.activeElement;
            });
            // Up/Down arrow navigation
            if (key === e.UP || key === e.DOWN) {
                e.preventDefault();
                if (focusable.length > 0) {
                    var nextIndex = key === e.DOWN ? (currentIndex + 1) % focusable.length : (currentIndex - 1 + focusable.length) % focusable.length;
                    focusable[nextIndex].el.focus();
                }
            }
            // Home/End navigation
            if (key === e.HOME && focusable.length > 0) {
                e.preventDefault();
                focusable[0].el.focus();
            }
            if (key === e.END && focusable.length > 0) {
                e.preventDefault();
                focusable[focusable.length - 1].el.focus();
            }
            // Enter/Space to activate
            if ((key === e.ENTER || key === e.SPACE) && currentIndex !== -1) {
                e.preventDefault();
                focusable[currentIndex].onClick && focusable[currentIndex].onClick(e);
            }
            // ESC to close menu
            if (key === e.ESC) {
                e.preventDefault();
                this.hide();
            }
        }
    });
    // Add CSS for high-contrast focus indicator
    var style = document.createElement('style');
    style.innerHTML = '.x-menu-focus-accessible:focus { outline: 3px solid #c62828 !important; outline-offset: 2px !important; }';
    document.head.appendChild(style);
})(); 