(function(){
    var baseOnRender = Ext.Slider.prototype.onRender;
    var baseSetValue = Ext.Slider.prototype.setValue;
    var baseAfterRender = Ext.Slider.prototype.afterRender;

    Ext.override(Ext.Slider, {
        onRender: function(ct, position) {
            baseOnRender.call(this, ct, position);
            // Set ARIA role and attributes for slider
            this.el.dom.setAttribute('role', 'slider');
            this.el.dom.setAttribute('aria-valuemin', this.minValue);
            this.el.dom.setAttribute('aria-valuemax', this.maxValue);
            this.el.dom.setAttribute('aria-valuenow', this.getValue());
            this.el.dom.setAttribute('aria-orientation', this.vertical ? 'vertical' : 'horizontal');
            this.el.dom.setAttribute('aria-label', this.fieldLabel || this.name || 'Slider');
            // Ensure slider is keyboard focusable
            if (!Ext.isDefined(this.tabIndex)) {
                this.el.dom.setAttribute('tabindex', '0');
            }
        },
        afterRender: function() {
            baseAfterRender.call(this);
            // Add focus/blur for visible focus indicator
            this.mon(this.el, {
                scope: this,
                focus: function() { this.el.addClass('x-slider-focus-accessible'); },
                blur: function() { this.el.removeClass('x-slider-focus-accessible'); }
            });
        },
        setValue: function(v, animate) {
            baseSetValue.call(this, v, animate);
            if (this.rendered) {
                this.el.dom.setAttribute('aria-valuenow', this.getValue());
            }
        }
    });

    // Enhance slider thumbs for accessibility
    if (Ext.slider && Ext.slider.Thumb) {
        var baseThumbRender = Ext.slider.Thumb.prototype.render;
        Ext.override(Ext.slider.Thumb, {
            render: function() {
                baseThumbRender.call(this);
                if (this.el && this.el.dom) {
                    this.el.dom.setAttribute('role', 'slider');
                    this.el.dom.setAttribute('aria-valuenow', this.value);
                    this.el.dom.setAttribute('aria-valuemin', this.slider.minValue);
                    this.el.dom.setAttribute('aria-valuemax', this.slider.maxValue);
                    this.el.dom.setAttribute('aria-orientation', this.slider.vertical ? 'vertical' : 'horizontal');
                    this.el.dom.setAttribute('tabindex', '0');
                    this.el.dom.setAttribute('aria-label', 'Slider Thumb');
                    // Add focus/blur for visible focus indicator
                    this.el.on('focus', function() { this.el.addClass('x-slider-thumb-focus-accessible'); }, this);
                    this.el.on('blur', function() { this.el.removeClass('x-slider-thumb-focus-accessible'); }, this);
                    // Keyboard accessibility for thumb
                    this.el.on('keydown', function(e) {
                        var slider = this.slider;
                        var step = slider.increment || 1;
                        var value = this.value;
                        if (e.getKey() === e.LEFT || e.getKey() === e.DOWN) {
                            e.preventDefault();
                            slider.setValue(this.index, value - step, false);
                        } else if (e.getKey() === e.RIGHT || e.getKey() === e.UP) {
                            e.preventDefault();
                            slider.setValue(this.index, value + step, false);
                        } else if (e.getKey() === e.HOME) {
                            e.preventDefault();
                            slider.setValue(this.index, slider.minValue, false);
                        } else if (e.getKey() === e.END) {
                            e.preventDefault();
                            slider.setValue(this.index, slider.maxValue, false);
                        } else if (e.getKey() === e.PAGE_UP) {
                            e.preventDefault();
                            slider.setValue(this.index, value + step * 10, false);
                        } else if (e.getKey() === e.PAGE_DOWN) {
                            e.preventDefault();
                            slider.setValue(this.index, value - step * 10, false);
                        }
                    }, this);
                }
            }
        });
    }

    // Add CSS for high-contrast focus indicator
    var style = document.createElement('style');
    style.innerHTML = '.x-slider-focus-accessible:focus { outline: 3px solid #388e3c !important; outline-offset: 2px !important; } .x-slider-thumb-focus-accessible:focus { outline: 3px solid #fbc02d !important; outline-offset: 2px !important; }';
    document.head.appendChild(style);
})(); 