(function(){
    var baseOnRender = Ext.ToolTip.prototype.onRender;
    var baseAfterRender = Ext.ToolTip.prototype.afterRender;
    var baseShow = Ext.ToolTip.prototype.show;
    var baseHide = Ext.ToolTip.prototype.hide;

    Ext.override(Ext.ToolTip, {
        onRender: function(ct, position) {
            baseOnRender.call(this, ct, position);
            // Set ARIA role and attributes for tooltip
            this.el.dom.setAttribute('role', 'tooltip');
            this.el.dom.setAttribute('aria-live', 'polite');
            this.el.dom.setAttribute('aria-hidden', 'true');
        },
        afterRender: function() {
            baseAfterRender.call(this);
            // Add focus/blur for visible focus indicator
            this.mon(this.el, {
                scope: this,
                focus: function() { this.el.addClass('x-tooltip-focus-accessible'); },
                blur: function() { this.el.removeClass('x-tooltip-focus-accessible'); }
            });
        },
        show: function() {
            baseShow.apply(this, arguments);
            if (this.el && this.el.dom) {
                this.el.dom.setAttribute('aria-hidden', 'false');
                // Set aria-describedby on the target
                if (this.target && this.target.dom) {
                    this.target.dom.setAttribute('aria-describedby', this.el.dom.id);
                }
            }
        },
        hide: function() {
            baseHide.apply(this, arguments);
            if (this.el && this.el.dom) {
                this.el.dom.setAttribute('aria-hidden', 'true');
                // Remove aria-describedby from the target
                if (this.target && this.target.dom) {
                    this.target.dom.removeAttribute('aria-describedby');
                }
            }
        }
    });
    // Add CSS for high-contrast focus indicator
    var style = document.createElement('style');
    style.innerHTML = '.x-tooltip-focus-accessible:focus { outline: 3px solid #ff9800 !important; outline-offset: 2px !important; }';
    document.head.appendChild(style);
})(); 