(function(){
    var baseOnRender = Ext.DataView.prototype.onRender;
    var baseAfterRender = Ext.DataView.prototype.afterRender;
    var baseSelect = Ext.DataView.prototype.select;
    var baseDeselect = Ext.DataView.prototype.deselect;

    Ext.override(Ext.DataView, {
        onRender: function(ct, position) {
            baseOnRender.call(this, ct, position);

            // Set ARIA role for list
            this.el.dom.setAttribute('role', 'list');
            this.el.dom.setAttribute('aria-label', this.title || 'Data View');

            // Ensure DataView is keyboard focusable
            if (!Ext.isDefined(this.tabIndex)) {
                this.el.dom.setAttribute('tabindex', '0');
            }
        },

        afterRender: function() {
            baseAfterRender.call(this);
            // Add keyboard event listeners for accessibility
            this.mon(this.el, {
                scope: this,
                keydown: this.onDataViewKeyDown
            });
            // Add focus/blur for visible focus indicator
            this.mon(this.el, {
                scope: this,
                focus: function() { this.el.addClass('x-dataview-focus-accessible'); },
                blur: function() { this.el.removeClass('x-dataview-focus-accessible'); }
            });
            // Set ARIA roles for items
            this.updateItemAriaRoles();
        },

        updateItemAriaRoles: function() {
            var nodes = this.getNodes();
            for (var i = 0; i < nodes.length; i++) {
                nodes[i].setAttribute('role', 'listitem');
                nodes[i].setAttribute('aria-selected', this.isSelected(i) ? 'true' : 'false');
            }
        },

        select: function(records, keepExisting, suppressEvent) {
            baseSelect.call(this, records, keepExisting, suppressEvent);
            this.updateItemAriaRoles();
        },

        deselect: function(records, suppressEvent) {
            baseDeselect.call(this, records, suppressEvent);
            this.updateItemAriaRoles();
        },

        onDataViewKeyDown: function(e) {
            var key = e.getKey();
            var nodes = this.getNodes();
            var selectedIndexes = this.getSelectedIndexes ? this.getSelectedIndexes() : [];
            var currentIndex = selectedIndexes.length ? selectedIndexes[0] : -1;
            // Up/Down arrow navigation
            if (key === e.UP || key === e.DOWN) {
                e.preventDefault();
                var nextIndex = key === e.DOWN ? Math.min(currentIndex + 1, nodes.length - 1) : Math.max(currentIndex - 1, 0);
                if (nodes[nextIndex]) {
                    this.select(nextIndex, false, false);
                    nodes[nextIndex].focus && nodes[nextIndex].focus();
                }
            }
            // Enter/Space to select
            if ((key === e.ENTER || key === e.SPACE) && currentIndex !== -1) {
                e.preventDefault();
                this.select(currentIndex, false, false);
            }
        }
    });

    // Add CSS for high-contrast focus indicator
    var style = document.createElement('style');
    style.innerHTML = '.x-dataview-focus-accessible:focus { outline: 3px solid #1976d2 !important; outline-offset: 2px !important; }';
    document.head.appendChild(style);
})(); 