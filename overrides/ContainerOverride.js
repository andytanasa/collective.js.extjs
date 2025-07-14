(function(){
    var baseOnRender = Ext.Container.prototype.onRender;
    var baseAfterRender = Ext.Container.prototype.afterRender;

    Ext.override(Ext.Container, {
        onRender: function(ct, position) {
            baseOnRender.call(this, ct, position);
            this.el.dom.setAttribute('role', 'group');
            this.el.dom.setAttribute('aria-label', this.title || this.name || 'Container');
            if (!Ext.isDefined(this.tabIndex)) {
                this.el.dom.setAttribute('tabindex', '0');
            }
        },
        afterRender: function() {
            baseAfterRender.call(this);
            this.mon(this.el, {
                scope: this,
                focus: function() { this.el.addClass('x-container-focus-accessible'); },
                blur: function() { this.el.removeClass('x-container-focus-accessible'); }
            });
        }
    });
    var style = document.createElement('style');
    style.innerHTML = '.x-container-focus-accessible:focus { outline: 3px solid #1976d2 !important; outline-offset: 2px !important; }';
    document.head.appendChild(style);
})(); 