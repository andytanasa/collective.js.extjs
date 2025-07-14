(function(){
    if (!Ext.WindowManager) return;
    var origBringToFront = Ext.WindowManager.bringToFront;
    Ext.WindowManager.bringToFront = function(win) {
        origBringToFront.apply(this, arguments);
        if (win && win.el && win.el.dom) {
            win.el.dom.setAttribute('role', 'dialog');
            win.el.dom.setAttribute('aria-modal', 'true');
            win.el.dom.setAttribute('aria-label', win.title || 'Window');
            win.el.dom.setAttribute('tabindex', '0');
            win.el.on('focus', function() { win.el.addClass('x-windowmanager-focus-accessible'); });
            win.el.on('blur', function() { win.el.removeClass('x-windowmanager-focus-accessible'); });
        }
    };
    var style = document.createElement('style');
    style.innerHTML = '.x-windowmanager-focus-accessible:focus { outline: 3px solid #1976d2 !important; outline-offset: 2px !important; }';
    document.head.appendChild(style);
})(); 