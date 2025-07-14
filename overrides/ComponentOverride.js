(function(){
    var baseOnRender = Ext.Component.prototype.onRender;
    var baseAfterRender = Ext.Component.prototype.afterRender;

    Ext.override(Ext.Component, {
        onRender: function(ct, position) {
            baseOnRender.call(this, ct, position);
            this.el.dom.setAttribute('role', 'region');
            this.el.dom.setAttribute('aria-label', this.title || this.name || 'Component');
            if (!Ext.isDefined(this.tabIndex)) {
                this.el.dom.setAttribute('tabindex', '0');
            }
        },
        afterRender: function() {
            baseAfterRender.call(this);
            this.mon(this.el, {
                scope: this,
                focus: function() { this.el.addClass('x-component-focus-accessible'); },
                blur: function() { this.el.removeClass('x-component-focus-accessible'); }
            });
        }
    });
    var style = document.createElement('style');
    style.innerHTML = '.x-component-focus-accessible:focus { outline: 3px solid #1976d2 !important; outline-offset: 2px !important; }';
    document.head.appendChild(style);
})(); 