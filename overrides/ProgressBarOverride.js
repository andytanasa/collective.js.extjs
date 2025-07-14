(function(){
    var baseOnRender = Ext.ProgressBar.prototype.onRender;
    var baseAfterRender = Ext.ProgressBar.prototype.afterRender;
    var baseUpdateProgress = Ext.ProgressBar.prototype.updateProgress;
    var baseSetDisabled = Ext.ProgressBar.prototype.setDisabled;

    Ext.override(Ext.ProgressBar, {
        onRender: function(ct, position) {
            baseOnRender.call(this, ct, position);

            // Set ARIA role and attributes for progressbar
            this.el.dom.setAttribute('role', 'progressbar');
            this.el.dom.setAttribute('aria-valuemin', '0');
            this.el.dom.setAttribute('aria-valuemax', '1');
            this.el.dom.setAttribute('aria-valuenow', this.value || 0);
            this.el.dom.setAttribute('aria-label', this.text || 'Progress');

            // Ensure progressbar is keyboard focusable
            if (!Ext.isDefined(this.tabIndex)) {
                this.el.dom.setAttribute('tabindex', '0');
            }
        },

        afterRender: function() {
            baseAfterRender.call(this);
            // Add focus class for visible focus indicator
            this.mon(this.el, {
                scope: this,
                focus: function() { this.el.addClass('x-progressbar-focus-accessible'); },
                blur: function() { this.el.removeClass('x-progressbar-focus-accessible'); }
            });
        },

        updateProgress: function(value, text, animate) {
            baseUpdateProgress.call(this, value, text, animate);
            if (this.rendered) {
                this.el.dom.setAttribute('aria-valuenow', value || 0);
                if (text) {
                    this.el.dom.setAttribute('aria-label', text);
                }
            }
            return this;
        },

        setDisabled: function(disabled) {
            baseSetDisabled.call(this, disabled);
            if (this.rendered) {
                if (disabled) {
                    this.el.dom.setAttribute('aria-disabled', 'true');
                } else {
                    this.el.dom.removeAttribute('aria-disabled');
                }
            }
            return this;
        }
    });

    // Add CSS for high-contrast focus indicator
    var style = document.createElement('style');
    style.innerHTML = '.x-progressbar-focus-accessible:focus { outline: 3px solid #fbc02d !important; outline-offset: 2px !important; }';
    document.head.appendChild(style);
})(); 