(function(){
    var baseOnRender = Ext.Panel.prototype.onRender;
    var baseAfterRender = Ext.Panel.prototype.afterRender;
    var baseSetTitle = Ext.Panel.prototype.setTitle;
    var baseExpand = Ext.Panel.prototype.expand;
    var baseCollapse = Ext.Panel.prototype.collapse;
    var baseSetDisabled = Ext.Panel.prototype.setDisabled;

    Ext.override(Ext.Panel, {
        onRender: function(ct, position) {
            baseOnRender.call(this, ct, position);

            // Set ARIA role for panel
            this.el.dom.setAttribute('role', 'region');
            this.el.dom.setAttribute('aria-label', this.title || 'Panel');

            // Set ARIA attributes for collapsible panels
            if (this.collapsible) {
                this.el.dom.setAttribute('aria-expanded', this.collapsed ? 'false' : 'true');
                this.el.dom.setAttribute('aria-controls', this.body && this.body.id ? this.body.id : '');
            }

            // Set ARIA disabled state
            if (this.disabled) {
                this.el.dom.setAttribute('aria-disabled', 'true');
            }

            // Ensure panel is keyboard focusable
            if (!Ext.isDefined(this.tabIndex)) {
                this.el.dom.setAttribute('tabindex', '0');
            }

            // Add ARIA roles to header, body, toolbars if present
            if (this.header) {
                this.header.dom.setAttribute('role', 'heading');
                this.header.dom.setAttribute('aria-level', '2');
            }
            if (this.body) {
                this.body.dom.setAttribute('role', 'region');
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
                keydown: this.onPanelKeyDown
            });
        },

        onPanelKeyDown: function(e) {
            var key = e.getKey();
            // Space or Enter toggles collapse/expand if collapsible
            if ((key === e.SPACE || key === e.ENTER) && this.collapsible && !this.disabled) {
                e.stopEvent();
                if (this.collapsed) {
                    this.expand();
                } else {
                    this.collapse();
                }
            }
        },

        setTitle: function(title) {
            baseSetTitle.call(this, title);
            if (this.rendered) {
                this.el.dom.setAttribute('aria-label', title);
            }
            return this;
        },

        expand: function(animate) {
            baseExpand.call(this, animate);
            if (this.rendered && this.collapsible) {
                this.el.dom.setAttribute('aria-expanded', 'true');
            }
            return this;
        },

        collapse: function(animate) {
            baseCollapse.call(this, animate);
            if (this.rendered && this.collapsible) {
                this.el.dom.setAttribute('aria-expanded', 'false');
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
    style.innerHTML = '.x-panel-focus-accessible:focus { outline: 3px solid #1976d2 !important; outline-offset: 2px !important; }';
    document.head.appendChild(style);
})(); 