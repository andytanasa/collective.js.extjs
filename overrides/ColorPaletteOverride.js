(function(){
    var baseOnRender = Ext.ColorPalette.prototype.onRender;
    var baseAfterRender = Ext.ColorPalette.prototype.afterRender;
    var baseSelect = Ext.ColorPalette.prototype.select;

    Ext.override(Ext.ColorPalette, {
        onRender: function(container, position) {
            baseOnRender.call(this, container, position);
            // Set ARIA role for palette
            this.el.dom.setAttribute('role', 'listbox');
            this.el.dom.setAttribute('aria-label', 'Color palette');
            // Ensure palette is keyboard focusable
            this.el.dom.setAttribute('tabindex', '0');
        },
        afterRender: function() {
            baseAfterRender.call(this);
            // Add keyboard event listeners for accessibility
            this.mon(this.el, {
                scope: this,
                keydown: this.onPaletteKeyDown
            });
            // Set ARIA roles for color swatches
            this.updateSwatchAriaRoles();
        },
        updateSwatchAriaRoles: function() {
            var swatches = this.el.query('a');
            for (var i = 0; i < swatches.length; i++) {
                swatches[i].setAttribute('role', 'option');
                swatches[i].setAttribute('aria-selected', swatches[i].classList.contains('x-color-palette-sel') ? 'true' : 'false');
                swatches[i].setAttribute('aria-label', swatches[i].className.match(/color-([0-9A-Fa-f]{6})/) ? '#' + swatches[i].className.match(/color-([0-9A-Fa-f]{6})/)[1] : 'Color');
                swatches[i].setAttribute('tabindex', '-1');
            }
            // Set tabindex=0 for selected or first swatch
            var selected = this.el.query('a.x-color-palette-sel')[0] || swatches[0];
            if (selected) selected.setAttribute('tabindex', '0');
        },
        select: function(color, suppressEvent) {
            baseSelect.call(this, color, suppressEvent);
            this.updateSwatchAriaRoles();
        },
        onPaletteKeyDown: function(e) {
            var swatches = this.el.query('a');
            var selected = this.el.query('a.x-color-palette-sel')[0] || swatches[0];
            var idx = Array.prototype.indexOf.call(swatches, selected);
            var cols = 8; // default palette is 8 columns wide
            var nextIdx = idx;
            if (e.getKey() === e.LEFT) {
                nextIdx = (idx - 1 + swatches.length) % swatches.length;
            } else if (e.getKey() === e.RIGHT) {
                nextIdx = (idx + 1) % swatches.length;
            } else if (e.getKey() === e.UP) {
                nextIdx = (idx - cols + swatches.length) % swatches.length;
            } else if (e.getKey() === e.DOWN) {
                nextIdx = (idx + cols) % swatches.length;
            } else if (e.getKey() === e.ENTER || e.getKey() === e.SPACE) {
                e.preventDefault();
                if (selected) selected.click();
                return;
            }
            if (nextIdx !== idx) {
                e.preventDefault();
                swatches[nextIdx].focus();
            }
        }
    });
    // Add CSS for high-contrast focus indicator
    var style = document.createElement('style');
    style.innerHTML = '.x-color-palette a:focus { outline: 3px solid #1976d2 !important; outline-offset: 2px !important; }';
    document.head.appendChild(style);
})(); 