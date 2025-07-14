(function(){
    if (!Ext.MessageBox) return;
    var origGetDialog = Ext.MessageBox.getDialog;
    Ext.MessageBox.getDialog = function(titleText) {
        var dlg = origGetDialog.call(this, titleText);
        if (dlg && dlg.el && dlg.el.dom) {
            dlg.el.dom.setAttribute('role', 'dialog');
            dlg.el.dom.setAttribute('aria-modal', 'true');
            dlg.el.dom.setAttribute('aria-label', dlg.title || 'Dialog');
            dlg.el.dom.setAttribute('tabindex', '0');
            dlg.el.on('focus', function() { dlg.el.addClass('x-messagebox-focus-accessible'); });
            dlg.el.on('blur', function() { dlg.el.removeClass('x-messagebox-focus-accessible'); });
        }
        // Set ARIA roles for buttons
        if (dlg && dlg.fbar && dlg.fbar.items && dlg.fbar.items.items) {
            var btns = dlg.fbar.items.items;
            for (var i = 0; i < btns.length; i++) {
                if (btns[i].el && btns[i].el.dom) {
                    btns[i].el.dom.setAttribute('role', 'button');
                    btns[i].el.dom.setAttribute('aria-label', btns[i].text || 'Button');
                }
            }
        }
        return dlg;
    };
    // Add CSS for high-contrast focus indicator
    var style = document.createElement('style');
    style.innerHTML = '.x-messagebox-focus-accessible:focus { outline: 3px solid #1976d2 !important; outline-offset: 2px !important; }';
    document.head.appendChild(style);
})(); 