(function(){
    var baseOnRender = Ext.tree.TreePanel.prototype.onRender;
    var baseAfterRender = Ext.tree.TreePanel.prototype.afterRender;
    var baseSelectPath = Ext.tree.TreePanel.prototype.selectPath;
    var baseExpandPath = Ext.tree.TreePanel.prototype.expandPath;

    Ext.override(Ext.tree.TreePanel, {
        onRender: function(ct, position) {
            baseOnRender.call(this, ct, position);
            // Set ARIA role for tree
            this.el.dom.setAttribute('role', 'tree');
            this.el.dom.setAttribute('aria-label', this.title || 'Tree View');
            // Ensure tree is keyboard focusable
            if (!Ext.isDefined(this.tabIndex)) {
                this.el.dom.setAttribute('tabindex', '0');
            }
        },
        afterRender: function() {
            baseAfterRender.call(this);
            // Add keyboard event listeners for accessibility
            this.mon(this.el, {
                scope: this,
                keydown: this.onTreeKeyDown
            });
            // Add focus/blur for visible focus indicator
            this.mon(this.el, {
                scope: this,
                focus: function() { this.el.addClass('x-tree-focus-accessible'); },
                blur: function() { this.el.removeClass('x-tree-focus-accessible'); }
            });
            // Set ARIA roles for nodes
            this.updateTreeAriaRoles();
        },
        updateTreeAriaRoles: function() {
            var nodes = this.getRootNode().childNodes;
            function setNodeAria(node) {
                if (node.ui && node.ui.getEl()) {
                    var el = node.ui.getEl();
                    el.setAttribute('role', 'treeitem');
                    el.setAttribute('aria-expanded', node.expanded ? 'true' : 'false');
                    el.setAttribute('aria-selected', node.isSelected ? 'true' : 'false');
                }
                if (node.childNodes && node.childNodes.length) {
                    for (var i = 0; i < node.childNodes.length; i++) {
                        setNodeAria(node.childNodes[i]);
                    }
                }
            }
            setNodeAria(this.getRootNode());
        },
        onTreeKeyDown: function(e) {
            var key = e.getKey();
            var sm = this.getSelectionModel();
            var node = sm.getSelectedNode && sm.getSelectedNode();
            // Up/Down arrow navigation
            if (key === e.UP || key === e.DOWN) {
                e.preventDefault();
                var nextNode = (key === e.DOWN) ? node.nextSibling : node.previousSibling;
                if (nextNode) {
                    sm.select(nextNode);
                    nextNode.ui.focus && nextNode.ui.focus();
                }
            }
            // Right arrow to expand, Left arrow to collapse
            if (key === e.RIGHT && node && !node.expanded && node.hasChildNodes()) {
                e.preventDefault();
                node.expand();
            }
            if (key === e.LEFT && node && node.expanded) {
                e.preventDefault();
                node.collapse();
            }
            // Enter/Space to select
            if ((key === e.ENTER || key === e.SPACE) && node) {
                e.preventDefault();
                sm.select(node);
            }
            // Home/End navigation
            if (key === e.HOME) {
                e.preventDefault();
                var root = this.getRootNode();
                if (root) {
                    sm.select(root);
                    root.ui.focus && root.ui.focus();
                }
            }
            if (key === e.END) {
                e.preventDefault();
                var last = this.getRootNode();
                while (last.lastChild) last = last.lastChild;
                sm.select(last);
                last.ui.focus && last.ui.focus();
            }
        },
        selectPath: function(path, attr, separator, callback, scope) {
            baseSelectPath.call(this, path, attr, separator, callback, scope);
            this.updateTreeAriaRoles();
        },
        expandPath: function(path, attr, separator, callback, scope) {
            baseExpandPath.call(this, path, attr, separator, callback, scope);
            this.updateTreeAriaRoles();
        }
    });
    // Add CSS for high-contrast focus indicator
    var style = document.createElement('style');
    style.innerHTML = '.x-tree-focus-accessible:focus { outline: 3px solid #388e3c !important; outline-offset: 2px !important; }';
    document.head.appendChild(style);
})(); 