(function(){
    var baseShow = Ext.LoadMask.prototype.show;
    var baseHide = Ext.LoadMask.prototype.hide;
    Ext.override(Ext.LoadMask, {
        show: function() {
            baseShow.apply(this, arguments);
            if (this.el && this.el.dom) {
                this.el.dom.setAttribute('role', 'status');
                this.el.dom.setAttribute('aria-live', 'polite');
                this.el.dom.setAttribute('aria-label', 'Loading');
                this.el.dom.setAttribute('tabindex', '0');
                this.el.addClass('x-loadmask-focus-accessible');
            }
        },
        hide: function() {
            baseHide.apply(this, arguments);
            if (this.el && this.el.dom) {
                this.el.removeClass('x-loadmask-focus-accessible');
            }
        }
    });
    var style = document.createElement('style');
    style.innerHTML = '.x-loadmask-focus-accessible:focus { outline: 3px solid #1976d2 !important; outline-offset: 2px !important; }';
    document.head.appendChild(style);
})(); 