(function(){
    var baseShow = Ext.Layer.prototype.show;
    Ext.override(Ext.Layer, {
        show: function() {
            baseShow.apply(this, arguments);
            if (this.dom) {
                this.dom.setAttribute('role', 'region');
                this.dom.setAttribute('aria-label', 'Layer');
                this.dom.setAttribute('tabindex', '0');
            }
        }
    });
    var style = document.createElement('style');
    style.innerHTML = '.x-layer-focus-accessible:focus { outline: 3px solid #1976d2 !important; outline-offset: 2px !important; }';
    document.head.appendChild(style);
})(); 