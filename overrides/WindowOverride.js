(function(){
    var baseOnRender = Ext.Window.prototype.onRender;
    var baseAfterRender = Ext.Window.prototype.afterRender;
    var baseShow = Ext.Window.prototype.show;
    var baseHide = Ext.Window.prototype.hide;
    var baseSetTitle = Ext.Window.prototype.setTitle;
    var baseSetDisabled = Ext.Window.prototype.setDisabled;

    Ext.override(Ext.Window, {
        onRender: function(ct, position) {
            baseOnRender.call(this, ct, position);

            // Set ARIA role for dialog
            this.el.dom.setAttribute('role', this.modal ? 'dialog' : 'region');
            this.el.dom.setAttribute('aria-label', this.title || 'Window');
            this.el.dom.setAttribute('aria-modal', this.modal ? 'true' : 'false');

            // Set ARIA disabled state
            if (this.disabled) {
                this.el.dom.setAttribute('aria-disabled', 'true');
            }

            // Ensure window is keyboard focusable
            if (!Ext.isDefined(this.tabIndex)) {
                this.el.dom.setAttribute('tabindex', '0');
            }

            // Add ARIA roles to header, body, toolbars if present
            if (this.header) {
                this.header.dom.setAttribute('role', 'heading');
                this.header.dom.setAttribute('aria-level', '1');
            }
            if (this.body) {
                this.body.dom.setAttribute('role', 'document');
            }
            if (this.topToolbar && this.topToolbar.el) {
                this.topToolbar.el.dom.setAttribute('role', 'toolbar');
            }
            if (this.bottomToolbar && this.bottomToolbar.el) {
                this.bottomToolbar.el.dom.setAttribute('role', 'toolbar');
            }
        },

        afterRender: function() {
            baseAfterRender.call(this);
            // Add keyboard event listeners for accessibility
            this.mon(this.el, {
                scope: this,
                keydown: this.onWindowKeyDown
            });
        },

        onWindowKeyDown: function(e) {
            var key = e.getKey();
            // ESC closes the window if closable
            if (key === e.ESC && this.closable && !this.disabled) {
                e.stopEvent();
                this.close();
            }
            // Trap focus inside modal window
            if (this.modal && key === e.TAB) {
                var focusableEls = this.el.querySelectorAll('a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])');
                if (focusableEls.length > 0) {
                    var first = focusableEls[0];
                    var last = focusableEls[focusableEls.length - 1];
                    if (e.shiftKey && document.activeElement === first) {
                        e.preventDefault();
                        last.focus();
                    } else if (!e.shiftKey && document.activeElement === last) {
                        e.preventDefault();
                        first.focus();
                    }
                }
            }
        },

        show: function() {
            baseShow.apply(this, arguments);
            if (this.rendered) {
                this.el.dom.setAttribute('aria-hidden', 'false');
                this.el.addClass('x-window-focus-accessible');
                this.el.focus();
            }
            return this;
        },

        hide: function() {
            baseHide.apply(this, arguments);
            if (this.rendered) {
                this.el.dom.setAttribute('aria-hidden', 'true');
                this.el.removeClass('x-window-focus-accessible');
            }
            return this;
        },

        setTitle: function(title) {
            baseSetTitle.call(this, title);
            if (this.rendered) {
                this.el.dom.setAttribute('aria-label', title);
            }
            return this;
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
    style.innerHTML = '.x-window-focus-accessible:focus { outline: 3px solid #d32f2f !important; outline-offset: 2px !important; }';
    document.head.appendChild(style);
})(); 