(function(){
    var baseOnRender = Ext.grid.GridPanel.prototype.onRender;
    var baseAfterRender = Ext.grid.GridPanel.prototype.afterRender;
    var baseSelectRow = Ext.grid.GridPanel.prototype.getSelectionModel && Ext.grid.GridPanel.prototype.getSelectionModel().selectRow;
    var baseDeselectRow = Ext.grid.GridPanel.prototype.getSelectionModel && Ext.grid.GridPanel.prototype.getSelectionModel().deselectRow;

    Ext.override(Ext.grid.GridPanel, {
        onRender: function(ct, position) {
            baseOnRender.call(this, ct, position);
            // Set ARIA role for grid
            this.el.dom.setAttribute('role', 'grid');
            this.el.dom.setAttribute('aria-label', this.title || 'Data Grid');
            // Ensure grid is keyboard focusable
            if (!Ext.isDefined(this.tabIndex)) {
                this.el.dom.setAttribute('tabindex', '0');
            }
        },
        afterRender: function() {
            baseAfterRender.call(this);
            // Add keyboard event listeners for accessibility
            this.mon(this.el, {
                scope: this,
                keydown: this.onGridKeyDown
            });
            // Add focus/blur for visible focus indicator
            this.mon(this.el, {
                scope: this,
                focus: function() { this.el.addClass('x-grid-focus-accessible'); },
                blur: function() { this.el.removeClass('x-grid-focus-accessible'); }
            });
            // Set ARIA roles for rows and cells
            this.updateGridAriaRoles();
        },
        updateGridAriaRoles: function() {
            var rows = this.getView().getRows();
            for (var i = 0; i < rows.length; i++) {
                rows[i].setAttribute('role', 'row');
                var cells = rows[i].getElementsByTagName('td');
                for (var j = 0; j < cells.length; j++) {
                    cells[j].setAttribute('role', 'gridcell');
                }
                rows[i].setAttribute('aria-selected', this.getSelectionModel().isSelected(i) ? 'true' : 'false');
            }
        },
        onGridKeyDown: function(e) {
            var key = e.getKey();
            var sm = this.getSelectionModel();
            var view = this.getView();
            var rows = view.getRows();
            var selectedIndexes = sm.getSelectedIndexes ? sm.getSelectedIndexes() : (sm.getSelected ? [sm.getSelected()] : []);
            var currentIndex = selectedIndexes.length ? selectedIndexes[0] : -1;
            // Up/Down arrow navigation
            if (key === e.UP || key === e.DOWN) {
                e.preventDefault();
                var nextIndex = key === e.DOWN ? Math.min(currentIndex + 1, rows.length - 1) : Math.max(currentIndex - 1, 0);
                if (rows[nextIndex]) {
                    sm.selectRow(nextIndex);
                    rows[nextIndex].focus && rows[nextIndex].focus();
                }
            }
            // Home/End navigation
            if (key === e.HOME) {
                e.preventDefault();
                sm.selectRow(0);
                rows[0].focus && rows[0].focus();
            }
            if (key === e.END) {
                e.preventDefault();
                sm.selectRow(rows.length - 1);
                rows[rows.length - 1].focus && rows[rows.length - 1].focus();
            }
            // Enter/Space to select
            if ((key === e.ENTER || key === e.SPACE) && currentIndex !== -1) {
                e.preventDefault();
                sm.selectRow(currentIndex);
            }
        }
    });
    // Add CSS for high-contrast focus indicator
    var style = document.createElement('style');
    style.innerHTML = '.x-grid-focus-accessible:focus { outline: 3px solid #0288d1 !important; outline-offset: 2px !important; }';
    document.head.appendChild(style);
})(); 