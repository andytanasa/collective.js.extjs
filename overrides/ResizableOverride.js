(function(){
    var baseConstructor = Ext.Resizable.prototype.constructor;
    var baseResizeTo = Ext.Resizable.prototype.resizeTo;

    Ext.override(Ext.Resizable, {
        constructor: function(el, config) {
            baseConstructor.call(this, el, config);
            // Set ARIA role for resizable container
            if (this.el && this.el.dom) {
                this.el.dom.setAttribute('role', 'group');
                this.el.dom.setAttribute('aria-label', 'Resizable region');
            }
            // Set ARIA roles and attributes for handles
            var ps = Ext.Resizable.positions;
            for (var pos in ps) {
                if (this[pos] && this[pos].el && this[pos].el.dom) {
                    var handle = this[pos].el.dom;
                    handle.setAttribute('role', 'separator');
                    handle.setAttribute('tabindex', '0');
                    handle.setAttribute('aria-orientation', (pos === 'e' || pos === 'w') ? 'vertical' : 'horizontal');
                    handle.setAttribute('aria-label', 'Resize ' + pos.toUpperCase());
                    // Add focus/blur for visible focus indicator
                    this[pos].el.on('focus', function() { this.addClass('x-resizable-handle-focus-accessible'); });
                    this[pos].el.on('blur', function() { this.removeClass('x-resizable-handle-focus-accessible'); });
                    // Keyboard accessibility for handle
                    this[pos].el.on('keydown', function(e) {
                        var step = 10;
                        var size = this.owner.el.getSize();
                        var newWidth = size.width, newHeight = size.height;
                        if (e.getKey() === e.LEFT && (pos === 'w' || pos === 'e')) {
                            e.preventDefault();
                            newWidth = Math.max(size.width - step, this.owner.minWidth);
                        } else if (e.getKey() === e.RIGHT && (pos === 'w' || pos === 'e')) {
                            e.preventDefault();
                            newWidth = Math.min(size.width + step, this.owner.maxWidth);
                        } else if (e.getKey() === e.UP && (pos === 'n' || pos === 's')) {
                            e.preventDefault();
                            newHeight = Math.max(size.height - step, this.owner.minHeight);
                        } else if (e.getKey() === e.DOWN && (pos === 'n' || pos === 's')) {
                            e.preventDefault();
                            newHeight = Math.min(size.height + step, this.owner.maxHeight);
                        } else if (e.getKey() === e.HOME) {
                            e.preventDefault();
                            newWidth = this.owner.minWidth;
                            newHeight = this.owner.minHeight;
                        } else if (e.getKey() === e.END) {
                            e.preventDefault();
                            newWidth = this.owner.maxWidth;
                            newHeight = this.owner.maxHeight;
                        }
                        if (newWidth !== size.width || newHeight !== size.height) {
                            this.owner.resizeTo(newWidth, newHeight);
                        }
                    }, this[pos].el);
                }
            }
        },
        resizeTo: function(width, height) {
            baseResizeTo.call(this, width, height);
            // Update ARIA values for all handles
            var ps = Ext.Resizable.positions;
            for (var pos in ps) {
                if (this[pos] && this[pos].el && this[pos].el.dom) {
                    var handle = this[pos].el.dom;
                    handle.setAttribute('aria-valuenow', (pos === 'e' || pos === 'w') ? width : height);
                    handle.setAttribute('aria-valuemin', (pos === 'e' || pos === 'w') ? this.minWidth : this.minHeight);
                    handle.setAttribute('aria-valuemax', (pos === 'e' || pos === 'w') ? this.maxWidth : this.maxHeight);
                }
            }
        }
    });
    // Add CSS for high-contrast focus indicator
    var style = document.createElement('style');
    style.innerHTML = '.x-resizable-handle-focus-accessible:focus { outline: 3px solid #512da8 !important; outline-offset: 2px !important; }';
    document.head.appendChild(style);
})(); 