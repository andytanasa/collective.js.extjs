(function(){
    var baseOnRender = Ext.Toolbar.prototype.onRender;
    var baseAfterRender = Ext.Toolbar.prototype.afterRender;
    var baseSetDisabled = Ext.Toolbar.prototype.setDisabled;

    Ext.override(Ext.Toolbar, {
        onRender: function(ct, position) {
            baseOnRender.call(this, ct, position);

            // Set ARIA role for toolbar
            this.el.dom.setAttribute('role', 'toolbar');
            this.el.dom.setAttribute('aria-label', this.title || 'Toolbar');

            // Set ARIA disabled state
            if (this.disabled) {
                this.el.dom.setAttribute('aria-disabled', 'true');
            }

            // Ensure toolbar is keyboard focusable
            if (!Ext.isDefined(this.tabIndex)) {
                this.el.dom.setAttribute('tabindex', '0');
            }
        },

        afterRender: function() {
            baseAfterRender.call(this);
            // Add keyboard event listeners for accessibility
            this.mon(this.el, {
                scope: this,
                keydown: this.onToolbarKeyDown
            });
        },

        onToolbarKeyDown: function(e) {
            var key = e.getKey();
            var items = this.items && this.items.items ? this.items.items : [];
            var focusable = items.filter(function(item){
                return item && item.el && !item.disabled && item.el.isVisible();
            });
            var currentIndex = focusable.findIndex(function(item){
                return item.el && item.el.dom === document.activeElement;
            });
            // Left/Right arrow navigation
            if (key === e.LEFT || key === e.RIGHT) {
                e.preventDefault();
                if (focusable.length > 0 && currentIndex !== -1) {
                    var nextIndex = key === e.RIGHT ? (currentIndex + 1) % focusable.length : (currentIndex - 1 + focusable.length) % focusable.length;
                    focusable[nextIndex].el.focus();
                }
            }
        },

        setDisabled: function(disabled) {
            baseSetDisabled.call(this, disabled);
            if (this.rendered) {
                if (disabled) {
                    this.el.dom.setAttribute('aria-disabled', 'true');
                } else {
                    this.el.dom.removeAttribute('aria-disabled');
                }
            }
            return this;
        }
    });

    // Add CSS for high-contrast focus indicator
    var style = document.createElement('style');
    style.innerHTML = '.x-toolbar-focus-accessible:focus { outline: 3px solid #388e3c !important; outline-offset: 2px !important; }';
    document.head.appendChild(style);
})(); 