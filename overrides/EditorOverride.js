(function(){
    var baseOnRender = Ext.Editor.prototype.onRender;
    var baseAfterRender = Ext.Editor.prototype.afterRender;
    var baseStartEdit = Ext.Editor.prototype.startEdit;
    var baseCompleteEdit = Ext.Editor.prototype.completeEdit;
    var baseCancelEdit = Ext.Editor.prototype.cancelEdit;

    Ext.override(Ext.Editor, {
        onRender: function(ct, position) {
            baseOnRender.call(this, ct, position);
            if (this.field && this.field.getEl && this.field.getEl().dom) {
                var fieldEl = this.field.getEl().dom;
                // Set ARIA role and attributes for the field
                fieldEl.setAttribute('role', 'textbox');
                fieldEl.setAttribute('aria-label', this.field.fieldLabel || this.field.name || 'Editor');
                if (this.field.allowBlank === false) {
                    fieldEl.setAttribute('aria-required', 'true');
                }
                if (this.field.invalid) {
                    fieldEl.setAttribute('aria-invalid', 'true');
                }
                // Ensure editor field is keyboard focusable
                if (!Ext.isDefined(this.field.tabIndex)) {
                    fieldEl.setAttribute('tabindex', '0');
                }
            }
        },

        afterRender: function() {
            baseAfterRender.call(this);
            if (this.field && this.field.getEl) {
                var fieldEl = this.field.getEl();
                // Add focus/blur for visible focus indicator
                this.mon(fieldEl, {
                    scope: this,
                    focus: function() { fieldEl.addClass('x-editor-focus-accessible'); },
                    blur: function() { fieldEl.removeClass('x-editor-focus-accessible'); }
                });
            }
        },

        startEdit: function(el, value) {
            baseStartEdit.call(this, el, value);
            if (this.field && this.field.getEl && this.field.getEl().dom) {
                var fieldEl = this.field.getEl().dom;
                fieldEl.setAttribute('aria-invalid', this.field.invalid ? 'true' : 'false');
                fieldEl.focus();
            }
        },

        completeEdit: function(remainVisible) {
            baseCompleteEdit.call(this, remainVisible);
            if (this.field && this.field.getEl && this.field.getEl().dom) {
                var fieldEl = this.field.getEl().dom;
                fieldEl.setAttribute('aria-invalid', this.field.invalid ? 'true' : 'false');
            }
        },

        cancelEdit: function(remainVisible) {
            baseCancelEdit.call(this, remainVisible);
            if (this.field && this.field.getEl && this.field.getEl().dom) {
                var fieldEl = this.field.getEl().dom;
                fieldEl.setAttribute('aria-invalid', this.field.invalid ? 'true' : 'false');
            }
        }
    });

    // Add CSS for high-contrast focus indicator
    var style = document.createElement('style');
    style.innerHTML = '.x-editor-focus-accessible:focus { outline: 3px solid #512da8 !important; outline-offset: 2px !important; }';
    document.head.appendChild(style);
})(); 