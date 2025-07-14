(function(){
    var baseRenderItem = Ext.layout.AccordionLayout.prototype.renderItem;
    var baseSetActive = Ext.layout.AccordionLayout.prototype.setActive;

    Ext.override(Ext.layout.AccordionLayout, {
        renderItem: function(c) {
            baseRenderItem.call(this, c);
            // Set ARIA roles and attributes for accordion panels
            if (c.header && c.header.dom) {
                c.header.dom.setAttribute('role', 'tab');
                c.header.dom.setAttribute('tabindex', '0');
                c.header.dom.setAttribute('aria-controls', c.id + '-body');
                c.header.dom.setAttribute('aria-expanded', c.collapsed ? 'false' : 'true');
                c.header.dom.setAttribute('aria-label', c.title || 'Accordion Panel');
            }
            if (c.body && c.body.dom) {
                c.body.dom.setAttribute('role', 'region');
                c.body.dom.setAttribute('id', c.id + '-body');
                c.body.dom.setAttribute('aria-labelledby', c.header && c.header.dom ? c.header.dom.id : '');
            }
            // Add focus/blur for visible focus indicator
            if (c.header) {
                c.header.on('focus', function() { c.header.addClass('x-accordion-focus-accessible'); });
                c.header.on('blur', function() { c.header.removeClass('x-accordion-focus-accessible'); });
                c.header.on('keydown', function(e) {
                    var panels = c.ownerCt.items.items;
                    var idx = panels.indexOf(c);
                    // Up/Down arrow navigation
                    if (e.getKey() === e.UP || e.getKey() === e.DOWN) {
                        e.preventDefault();
                        var nextIdx = e.getKey() === e.DOWN ? (idx + 1) % panels.length : (idx - 1 + panels.length) % panels.length;
                        var nextPanel = panels[nextIdx];
                        if (nextPanel && nextPanel.header) {
                            nextPanel.header.focus();
                        }
                    }
                    // Enter/Space to expand/collapse
                    if (e.getKey() === e.ENTER || e.getKey() === e.SPACE) {
                        e.preventDefault();
                        if (c.collapsed) {
                            c.expand();
                        } else {
                            c.collapse();
                        }
                    }
                });
            }
        },
        setActive: function(item, expand) {
            baseSetActive.call(this, item, expand);
            // Update ARIA attributes for expanded/collapsed state
            var panels = this.container.items.items;
            for (var i = 0; i < panels.length; i++) {
                var p = panels[i];
                if (p.header && p.header.dom) {
                    p.header.dom.setAttribute('aria-expanded', p.collapsed ? 'false' : 'true');
                }
            }
        }
    });
    // Add CSS for high-contrast focus indicator
    var style = document.createElement('style');
    style.innerHTML = '.x-accordion-focus-accessible:focus { outline: 3px solid #6a1b9a !important; outline-offset: 2px !important; }';
    document.head.appendChild(style);
})(); 