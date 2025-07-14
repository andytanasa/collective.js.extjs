(function(){
    var baseOnRender = Ext.DatePicker.prototype.onRender;
    var baseAfterRender = Ext.DatePicker.prototype.afterRender;
    var baseCreateMonthPicker = Ext.DatePicker.prototype.createMonthPicker;
    var baseUpdate = Ext.DatePicker.prototype.update;
    var baseSetValue = Ext.DatePicker.prototype.setValue;
    var baseSelectToday = Ext.DatePicker.prototype.selectToday;

    Ext.override(Ext.DatePicker, {
        onRender: function(container, position){
            baseOnRender.call(this, container, position);
            this.el.dom.setAttribute('role', 'application');
            this.el.dom.setAttribute('aria-label', 'Date picker');
        },
        afterRender: function(){
            baseAfterRender.call(this);
            this.setupTodayButtonAccessibility();
            this.setupNavigationAccessibility();
            this.updateDateCellsTabindex();
        },
        setupNavigationAccessibility: function(){
               // Previous month button
    var prevBtn = this.el.down('td.x-date-left a');
    if(prevBtn){
        prevBtn.dom.setAttribute('role', 'button');
        prevBtn.dom.setAttribute('aria-label', 'Previous month');
        prevBtn.dom.setAttribute('tabindex', '0');
        prevBtn.dom.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                prevBtn.dom.click();
            }
        });
    }
    // Next month button
    var nextBtn = this.el.down('td.x-date-right a');
    if(nextBtn){
        nextBtn.dom.setAttribute('role', 'button');
        nextBtn.dom.setAttribute('aria-label', 'Next month');
        nextBtn.dom.setAttribute('tabindex', '0');
        nextBtn.dom.addEventListener('keydown', function(e) {
            console.log('keydown', e.key);  
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                nextBtn.dom.click();
            }
        });
    }
            if(this.mbtn && this.mbtn.btnEl){
                this.mbtn.btnEl.dom.setAttribute('role', 'button');
                this.mbtn.btnEl.dom.setAttribute('aria-label', 'Choose month and year');
                this.mbtn.btnEl.dom.setAttribute('tabindex', '0');
                this.mbtn.btnEl.dom.setAttribute('aria-haspopup', 'true');
                this.mbtn.btnEl.dom.setAttribute('aria-expanded', 'false');
            }
        },
        setupTodayButtonAccessibility: function(){
            if(this.todayBtn && this.todayBtn.btnEl){
                this.todayBtn.btnEl.dom.setAttribute('aria-label', 'Go to today: ' + new Date().format(this.format));
                this.todayBtn.btnEl.dom.setAttribute('role', 'button');
                this.todayBtn.btnEl.dom.setAttribute('tabindex', '0');
            }
        },
        updateDateCellsTabindex: function(){
            if(this.cells){
                var found = false;
                this.cells.each(function(cell){
                    var link = cell.down('a');
                    if(link){
                        if(!found && (Ext.fly(cell).hasClass('x-date-selected') || Ext.fly(cell).hasClass('x-date-today'))){
                            link.dom.setAttribute('tabindex', '0');
                            found = true;
                        } else {
                            link.dom.setAttribute('tabindex', '-1');
                        }
                    }
                });
            }
        },
        update: function(date, forceRefresh){
            var result = baseUpdate.apply(this, arguments);
            this.updateDateCellsTabindex();
            return result;
        },
        setValue: function(value){
            var result = baseSetValue.apply(this, arguments);
            this.updateDateCellsTabindex();
            return result;
        },
        selectToday: function(){
            baseSelectToday.apply(this, arguments);
            this.updateDateCellsTabindex();
        },
        createMonthPicker: function(){
            baseCreateMonthPicker.call(this);
        }
    });
    if(typeof Ext.util.CSS !== 'undefined'){
        Ext.util.CSS.createStyleSheet(
            '.x-date-picker .x-date-inner td a:focus,\
            .x-date-picker .x-date-inner td a[tabindex="0"]:focus,\
            .x-date-picker .x-date-mp-btns button:focus,\
            .x-date-picker .x-date-mp-btns button[tabindex="0"]:focus,\
            .x-date-picker .x-date-left a:focus,\
            .x-date-picker .x-date-right a:focus,\
            .x-date-picker .x-date-mp-btns a:focus,\
            .x-date-picker .x-date-mp-btns a[tabindex="0"]:focus,\
            .x-date-picker .x-date-mp-btns button:focus,\
            .x-date-picker .x-date-mp-btns button[tabindex="0"]:focus,\
            .x-date-picker .x-date-mp-btns .x-date-mp-ok:focus,\
            .x-date-picker .x-date-mp-btns .x-date-mp-cancel:focus {\
                outline: 2px solid #005fcc !important;\
                outline-offset: 1px !important;\
                z-index: 100 !important;\
                position: relative !important;\
            }',
            'datepicker-accessibility-focus'
        );
    }
})();
