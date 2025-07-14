(function(){
    var baseOnRender = Ext.list.ListView.prototype.onRender;
    var baseAfterRender = Ext.list.ListView.prototype.afterRender;
    var baseSelect = Ext.list.ListView.prototype.select;
    var baseDeselect = Ext.list.ListView.prototype.deselect;

    Ext.override(Ext.list.ListView, {
        onRender: function(ct, position) {
            baseOnRender.call(this, ct, position);
            // Set ARIA role for list
            this.el.dom.setAttribute('role', 'list');
            this.el.dom.setAttribute('aria-label', this.title || 'List View');
            // Ensure ListView is keyboard focusable
            if (!Ext.isDefined(this.tabIndex)) {
                this.el.dom.setAttribute('tabindex', '0');
            }
        },
        afterRender: function() {
            baseAfterRender.call(this);
            // Add keyboard event listeners for accessibility
            this.mon(this.el, {
                scope: this,
                keydown: this.onListViewKeyDown
            });
            // Add focus/blur for visible focus indicator
            this.mon(this.el, {
                scope: this,
                focus: function() { this.el.addClass('x-listview-focus-accessible'); },
                blur: function() { this.el.removeClass('x-listview-focus-accessible'); }
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
        onListViewKeyDown: function(e) {
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
            // Home/End navigation
            if (key === e.HOME) {
                e.preventDefault();
                this.select(0, false, false);
                nodes[0].focus && nodes[0].focus();
            }
            if (key === e.END) {
                e.preventDefault();
                this.select(nodes.length - 1, false, false);
                nodes[nodes.length - 1].focus && nodes[nodes.length - 1].focus();
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
    style.innerHTML = '.x-listview-focus-accessible:focus { outline: 3px solid #009688 !important; outline-offset: 2px !important; }';
    document.head.appendChild(style);
})(); 