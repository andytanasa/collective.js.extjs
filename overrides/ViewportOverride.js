(function(){
    var baseOnRender = Ext.Viewport.prototype.onRender;
    var baseAfterRender = Ext.Viewport.prototype.afterRender;
    Ext.override(Ext.Viewport, {
        onRender: function(ct, position) {
            baseOnRender.call(this, ct, position);
            this.el.dom.setAttribute('role', 'main');
            this.el.dom.setAttribute('aria-label', 'Application viewport');
            this.el.dom.setAttribute('tabindex', '0');
        },
        afterRender: function() {
            baseAfterRender.call(this);
            this.mon(this.el, {
                scope: this,
                focus: function() { this.el.addClass('x-viewport-focus-accessible'); },
                blur: function() { this.el.removeClass('x-viewport-focus-accessible'); }
            });
        }
    });
    var style = document.createElement('style');
    style.innerHTML = '.x-viewport-focus-accessible:focus { outline: 3px solid #1976d2 !important; outline-offset: 2px !important; }';
    document.head.appendChild(style);
})(); 