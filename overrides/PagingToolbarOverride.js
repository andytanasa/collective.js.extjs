(function(){
    var baseOnRender = Ext.PagingToolbar.prototype.onRender;
    var baseAfterRender = Ext.PagingToolbar.prototype.afterRender;

    Ext.override(Ext.PagingToolbar, {
        onRender: function(ct, position) {
            baseOnRender.call(this, ct, position);
            // Set ARIA role for paging toolbar
            this.el.dom.setAttribute('role', 'navigation');
            this.el.dom.setAttribute('aria-label', 'Pagination');
            // Ensure toolbar is keyboard focusable
            if (!Ext.isDefined(this.tabIndex)) {
                this.el.dom.setAttribute('tabindex', '0');
            }
        },
        afterRender: function() {
            baseAfterRender.call(this);
            // Add focus/blur for visible focus indicator
            this.mon(this.el, {
                scope: this,
                focus: function() { this.el.addClass('x-pagingtoolbar-focus-accessible'); },
                blur: function() { this.el.removeClass('x-pagingtoolbar-focus-accessible'); }
            });
            // Set ARIA roles for navigation buttons
            this.updatePagingButtonAriaRoles();
        },
        updatePagingButtonAriaRoles: function() {
            var btns = ['first', 'prev', 'next', 'last', 'refresh'];
            for (var i = 0; i < btns.length; i++) {
                var btn = this[btns[i]];
                if (btn && btn.el && btn.el.dom) {
                    btn.el.dom.setAttribute('role', 'button');
                    btn.el.dom.setAttribute('aria-label', btn.tooltip || btn.text || btns[i]);
                }
            }
        }
    });
    // Add CSS for high-contrast focus indicator
    var style = document.createElement('style');
    style.innerHTML = '.x-pagingtoolbar-focus-accessible:focus { outline: 3px solid #1976d2 !important; outline-offset: 2px !important; }';
    document.head.appendChild(style);
})(); 