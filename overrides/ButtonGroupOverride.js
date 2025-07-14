(function(){
    var baseOnRender = Ext.ButtonGroup.prototype.onRender;
    var baseAfterRender = Ext.ButtonGroup.prototype.afterRender;

    Ext.override(Ext.ButtonGroup, {
        onRender: function(ct, position) {
            baseOnRender.call(this, ct, position);
            // Set ARIA role for button group
            this.el.dom.setAttribute('role', 'group');
            this.el.dom.setAttribute('aria-label', this.title || 'Button group');
            // Ensure group is keyboard focusable
            if (!Ext.isDefined(this.tabIndex)) {
                this.el.dom.setAttribute('tabindex', '0');
            }
        },
        afterRender: function() {
            baseAfterRender.call(this);
            // Add focus/blur for visible focus indicator
            this.mon(this.el, {
                scope: this,
                focus: function() { this.el.addClass('x-buttongroup-focus-accessible'); },
                blur: function() { this.el.removeClass('x-buttongroup-focus-accessible'); }
            });
            // Set ARIA roles for child buttons
            this.updateButtonAriaRoles();
        },
        updateButtonAriaRoles: function() {
            var buttons = this.findByType('button');
            for (var i = 0; i < buttons.length; i++) {
                if (buttons[i].el && buttons[i].el.dom) {
                    buttons[i].el.dom.setAttribute('role', 'button');
                    buttons[i].el.dom.setAttribute('aria-label', buttons[i].text || 'Button');
                }
            }
        }
    });
    // Add CSS for high-contrast focus indicator
    var style = document.createElement('style');
    style.innerHTML = '.x-buttongroup-focus-accessible:focus { outline: 3px solid #1976d2 !important; outline-offset: 2px !important; }';
    document.head.appendChild(style);
})(); 