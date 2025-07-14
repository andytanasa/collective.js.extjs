(function(){
    var baseOnRender = Ext.BoxComponent.prototype.onRender;
    var baseAfterRender = Ext.BoxComponent.prototype.afterRender;

    Ext.override(Ext.BoxComponent, {
        onRender: function(ct, position) {
            baseOnRender.call(this, ct, position);
            // Set ARIA role and label for box component
            this.el.dom.setAttribute('role', 'region');
            this.el.dom.setAttribute('aria-label', this.title || this.name || 'Section');
            // Ensure box component is keyboard focusable if interactive
            if (!Ext.isDefined(this.tabIndex)) {
                this.el.dom.setAttribute('tabindex', '0');
            }
        },
        afterRender: function() {
            baseAfterRender.call(this);
            // Add focus/blur for visible focus indicator
            this.mon(this.el, {
                scope: this,
                focus: function() { this.el.addClass('x-boxcomponent-focus-accessible'); },
                blur: function() { this.el.removeClass('x-boxcomponent-focus-accessible'); }
            });
        }
    });
    // Add CSS for high-contrast focus indicator
    var style = document.createElement('style');
    style.innerHTML = '.x-boxcomponent-focus-accessible:focus { outline: 3px solid #009688 !important; outline-offset: 2px !important; }';
    document.head.appendChild(style);
})(); 