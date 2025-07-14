(function(){
    var baseOnRender = Ext.SplitButton.prototype.onRender;
    var baseOnClick = Ext.SplitButton.prototype.onClick;

    Ext.override(Ext.SplitButton, {
        onRender: function() {
            baseOnRender.apply(this, arguments);
            // Set ARIA role for button
            this.el.dom.setAttribute('role', 'button');
            this.el.dom.setAttribute('aria-label', this.text || 'Split Button');
            // Set ARIA for menu trigger
            var arrowEl = this.el.child(this.arrowSelector);
            if (arrowEl && arrowEl.dom) {
                arrowEl.dom.setAttribute('role', 'button');
                arrowEl.dom.setAttribute('tabindex', '0');
                arrowEl.dom.setAttribute('aria-haspopup', !!this.menu ? 'true' : 'false');
                arrowEl.dom.setAttribute('aria-expanded', this.menu && this.menu.isVisible() ? 'true' : 'false');
                arrowEl.dom.setAttribute('aria-label', this.arrowTooltip || 'Show options');
                // Add focus/blur for visible focus indicator
                arrowEl.on('focus', function() { arrowEl.addClass('x-splitbtn-arrow-focus-accessible'); });
                arrowEl.on('blur', function() { arrowEl.removeClass('x-splitbtn-arrow-focus-accessible'); });
                // Keyboard accessibility for arrow
                arrowEl.on('keydown', function(e) {
                    if (e.getKey() === e.ENTER || e.getKey() === e.SPACE) {
                        e.preventDefault();
                        if (!this.disabled) {
                            if (this.menu && !this.menu.isVisible() && !this.ignoreNextClick) {
                                this.showMenu();
                            }
                            this.fireEvent('arrowclick', this, e);
                            if (this.arrowHandler) {
                                this.arrowHandler.call(this.scope || this, this, e);
                            }
                        }
                    }
                }, this);
            }
        },
        onClick: function(e, t) {
            baseOnClick.call(this, e, t);
            // Update ARIA expanded state for arrow
            var arrowEl = this.el.child(this.arrowSelector);
            if (arrowEl && arrowEl.dom && this.menu) {
                arrowEl.dom.setAttribute('aria-expanded', this.menu.isVisible() ? 'true' : 'false');
            }
        }
    });
    // Add CSS for high-contrast focus indicator
    var style = document.createElement('style');
    style.innerHTML = '.x-splitbtn-arrow-focus-accessible:focus { outline: 3px solid #1976d2 !important; outline-offset: 2px !important; }';
    document.head.appendChild(style);
})(); 