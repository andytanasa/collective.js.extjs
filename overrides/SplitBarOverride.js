(function(){
    var baseInit = Ext.SplitBar;
    var baseOnStartProxyDrag = Ext.SplitBar.prototype.onStartProxyDrag;
    var baseOnEndProxyDrag = Ext.SplitBar.prototype.onEndProxyDrag;

    // Patch the constructor to add ARIA and keyboard support
    var origConstructor = Ext.SplitBar;
    Ext.SplitBar = function(dragElement, resizingElement, orientation, placement, existingProxy) {
        origConstructor.apply(this, arguments);
        // Set ARIA role and attributes for splitter
        if (this.el && this.el.dom) {
            this.el.dom.setAttribute('role', 'separator');
            this.el.dom.setAttribute('aria-orientation', (orientation === Ext.SplitBar.VERTICAL) ? 'vertical' : 'horizontal');
            this.el.dom.setAttribute('aria-label', 'Resize panel');
            this.el.dom.setAttribute('tabindex', '0');
            this.el.dom.setAttribute('aria-valuenow', '0'); // Will be updated on drag
            this.el.dom.setAttribute('aria-valuemin', this.minSize);
            this.el.dom.setAttribute('aria-valuemax', this.maxSize);
            // Add focus/blur for visible focus indicator
            this.el.on('focus', function() { this.el.addClass('x-splitbar-focus-accessible'); }, this);
            this.el.on('blur', function() { this.el.removeClass('x-splitbar-focus-accessible'); }, this);
            // Keyboard accessibility for splitter
            this.el.on('keydown', function(e) {
                var step = 10;
                var size = this.adapter.getElementSize(this);
                var newSize = size;
                if (e.getKey() === e.LEFT || e.getKey() === e.UP) {
                    e.preventDefault();
                    newSize = Math.max(size - step, this.minSize);
                } else if (e.getKey() === e.RIGHT || e.getKey() === e.DOWN) {
                    e.preventDefault();
                    newSize = Math.min(size + step, this.maxSize);
                } else if (e.getKey() === e.HOME) {
                    e.preventDefault();
                    newSize = this.minSize;
                } else if (e.getKey() === e.END) {
                    e.preventDefault();
                    newSize = this.maxSize;
                }
                if (newSize !== size) {
                    this.adapter.setElementSize(this, newSize, false, true);
                    this.el.dom.setAttribute('aria-valuenow', newSize);
                    this.fireEvent('resize', this, newSize);
                    this.fireEvent('moved', this, newSize);
                }
            }, this);
        }
    };
    Ext.SplitBar.prototype = origConstructor.prototype;
    Ext.SplitBar.prototype.constructor = Ext.SplitBar;

    // Patch drag events to update ARIA value
    Ext.override(Ext.SplitBar, {
        onStartProxyDrag: function(x, y) {
            baseOnStartProxyDrag.call(this, x, y);
            if (this.el && this.el.dom) {
                var size = this.adapter.getElementSize(this);
                this.el.dom.setAttribute('aria-valuenow', size);
            }
        },
        onEndProxyDrag: function(e) {
            baseOnEndProxyDrag.call(this, e);
            if (this.el && this.el.dom) {
                var size = this.adapter.getElementSize(this);
                this.el.dom.setAttribute('aria-valuenow', size);
            }
        }
    });

    // Add CSS for high-contrast focus indicator
    var style = document.createElement('style');
    style.innerHTML = '.x-splitbar-focus-accessible:focus { outline: 3px solid #0288d1 !important; outline-offset: 2px !important; }';
    document.head.appendChild(style);
})(); 