(function(){
    var baseOnRender = Ext.Button.prototype.onRender;
    Ext.override(Ext.Button, {
        onRender: function(ct, position){
            baseOnRender.call(this, ct, position);
            var label = this.text || (this.tooltip && (this.tooltip.text || this.tooltip.title || this.tooltip));
            if(label){
                this.btnEl.dom.setAttribute('aria-label', label);
            }
            if(this.el && this.el.dom.tagName === 'TABLE'){
                this.el.dom.setAttribute('role', 'presentation');
            }
        }
    });
})();
