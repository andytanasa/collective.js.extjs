(function(){
    var baseOnRender = Ext.CycleButton.prototype.onRender;
    var baseAfterRender = Ext.CycleButton.prototype.afterRender;
    var baseSetActiveItem = Ext.CycleButton.prototype.setActiveItem;

    Ext.override(Ext.CycleButton, {
        onRender: function() {
            baseOnRender.apply(this, arguments);
            // Set ARIA role for cycle button
            this.el.dom.setAttribute('role', 'button');
            this.el.dom.setAttribute('aria-label', this.text || 'Cycle Button');
            if (this.menu && this.menu.el && this.menu.el.dom) {
                this.menu.el.dom.setAttribute('role', 'menu');
                this.menu.el.dom.setAttribute('aria-label', 'Cycle options');
            }
            // Ensure button is keyboard focusable
            if (!Ext.isDefined(this.tabIndex)) {
                this.el.dom.setAttribute('tabindex', '0');
            }
        },
        afterRender: function() {
            baseAfterRender.call(this);
            // Add focus/blur for visible focus indicator
            this.mon(this.el, {
                scope: this,
                focus: function() { this.el.addClass('x-cyclebtn-focus-accessible'); },
                blur: function() { this.el.removeClass('x-cyclebtn-focus-accessible'); }
            });
            this.updateMenuAriaRoles();
        },
        setActiveItem: function(item, suppressEvent) {
            baseSetActiveItem.call(this, item, suppressEvent);
            this.updateMenuAriaRoles();
        },
        updateMenuAriaRoles: function() {
            if (this.menu && this.menu.items && this.menu.items.items) {
                var items = this.menu.items.items;
                for (var i = 0; i < items.length; i++) {
                    if (items[i].el && items[i].el.dom) {
                        items[i].el.dom.setAttribute('role', 'menuitemradio');
                        items[i].el.dom.setAttribute('aria-checked', items[i].checked ? 'true' : 'false');
                        items[i].el.dom.setAttribute('tabindex', items[i].checked ? '0' : '-1');
                        items[i].el.dom.setAttribute('aria-label', items[i].text || 'Option');
                    }
                }
            }
        }
    });
    // Add CSS for high-contrast focus indicator
    var style = document.createElement('style');
    style.innerHTML = '.x-cyclebtn-focus-accessible:focus { outline: 3px solid #1976d2 !important; outline-offset: 2px !important; }';
    document.head.appendChild(style);
})(); 