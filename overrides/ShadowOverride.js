(function(){
    var baseShow = Ext.Shadow.prototype.show;
    Ext.override(Ext.Shadow, {
        show: function() {
            baseShow.apply(this, arguments);
            if (this.el && this.el.dom) {
                this.el.dom.setAttribute('role', 'presentation');
                this.el.dom.setAttribute('aria-label', 'Shadow');
                this.el.dom.setAttribute('tabindex', '-1');
            }
        }
    });
    var style = document.createElement('style');
    style.innerHTML = '.x-shadow-focus-accessible:focus { outline: 3px solid #1976d2 !important; outline-offset: 2px !important; }';
    document.head.appendChild(style);
})(); 