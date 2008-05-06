/*
* FancyForm 0.91
* By Vacuous Virtuoso, lipidity.com
* ---
* Checkbox and radio input replacement script.
* Toggles defined class when input is selected.
*/

var FancyForm = {
	start: function(elements, options){
		FancyForm.runningInit = 1;
		if($type(elements)!='array') elements = $$('input');
		if(!options) options = [];
		FancyForm.onclasses = ($type(options['onClasses']) == 'object') ? options['onClasses'] : {
			checkbox: 'checked',
			radio: 'selected'
		}
		FancyForm.offclasses = ($type(options['offClasses']) == 'object') ? options['offClasses'] : {
			checkbox: 'unchecked',
			radio: 'unselected'
		}
		if($type(options['extraClasses']) == 'object'){
			FancyForm.extra = options['extraClasses'];
		} else if(options['extraClasses']){
			FancyForm.extra = {
				checkbox: 'f_checkbox',
				radio: 'f_radio',
				on: 'f_on',
				off: 'f_off',
				all: 'fancy'
			}
		} else {
			FancyForm.extra = {};
		}
		FancyForm.onSelect = $pick(options['onSelect'], function(el){});
		FancyForm.onDeselect = $pick(options['onDeselect'], function(el){});
		var keeps = [];
		FancyForm.chks = elements.filter(function(chk){
			if( $type(chk) != 'element' ) return false;
			if( chk.getTag() == 'input' && (FancyForm.onclasses[chk.getProperty('type')]) ){
				var el = chk.getParent();
				if(el.getElement('input')==chk){
					el.type = chk.getProperty('type');
					el.inputElement = chk;
					this.push(el);
				} else {
					chk.addEvent('click',function(ev){ev.stopPropagation();})
				//	el = (new Element('div',{class:'hi'}).adopt(chk)).injectInside(el);
				}
			} else if( (chk.inputElement = chk.getElement('input')) && (FancyForm.onclasses[(chk.type = chk.inputElement.getProperty('type'))]) ){
				return true;
			}
			return false;
		}.bind(keeps));
		FancyForm.chks = FancyForm.chks.merge(keeps);
		keeps = null;
		FancyForm.chks.each(function(chk){
			chk.inputElement.setStyle('position', 'absolute');
			chk.inputElement.setStyle('left', '-9999px');
			chk.addEvent('selectStart', function(){})
			chk.name = chk.inputElement.getProperty('name');
			if(chk.inputElement.checked) FancyForm.select(chk);
			else FancyForm.deselect(chk);
			chk.addEvent('click', function(e){
				var e = new Event(e);
				if(chk.inputElement.getProperty('disabled')) return;
				if ($type(e.preventDefault) == 'function')
					e.preventDefault(true);
				else if ($type(e.returnValue) == 'function')
					e.returnValue(true);
				if (!chk.hasClass(FancyForm.onclasses[chk.type]))
						FancyForm.select(chk);
				else /* if(chk.type != 'radio')     - Kommenterars bort för att göra radioknappar urkryssbara. */
					FancyForm.deselect(chk);
				FancyForm.focusing = 1;
				chk.inputElement.focus();
				FancyForm.focusing = 0;
			});
			chk.addEvent('mousedown', function(e){
				if ($type(e.preventDefault) == 'function')
					e.preventDefault(true);
				else if ($type(e.returnValue) == 'function')
					e.returnValue(true);
			});
			chk.inputElement.addEvent('focus', function(e){
				if(!FancyForm.focusing) chk.setStyle('outline', '1px dotted');
			});
			chk.inputElement.addEvent('blur', function(e){chk.setStyle('outline', '0')});
			if(extraclass = FancyForm.extra[chk.type])
				chk.addClass(extraclass);
			if(extraclass = FancyForm.extra['all'])
				chk.addClass(extraclass);
		});
		FancyForm.runningInit = 0;
	},
	select: function(chk){
		chk.inputElement.checked = 'checked';
		chk.removeClass(FancyForm.offclasses[chk.type]);
		chk.addClass(FancyForm.onclasses[chk.type]);
		if (chk.type == 'radio'){
			FancyForm.chks.each(function(other){
				if (other.name != chk.name || other == chk) return;
				FancyForm.deselect(other);
			});
		}
		if(extraclass = FancyForm.extra['on'])
			chk.addClass(extraclass);
		if(extraclass = FancyForm.extra['off'])
			chk.removeClass(extraclass);
		if(!FancyForm.runningInit)
			FancyForm.onSelect(chk);
	},
	deselect: function(chk){
		chk.inputElement.checked = false;
		chk.removeClass(FancyForm.onclasses[chk.type]);
		chk.addClass(FancyForm.offclasses[chk.type]);
		if(extraclass = FancyForm.extra['off'])
			chk.addClass(extraclass);
		if(extraclass = FancyForm.extra['on'])
			chk.removeClass(extraclass);
		if(!FancyForm.runningInit)
			FancyForm.onDeselect(chk);
	},
	all: function(){
		FancyForm.chks.each(function(chk){
			FancyForm.select(chk);
		});
	},
	none: function(){
		FancyForm.chks.each(function(chk){
			FancyForm.deselect(chk);
		});
	}
};

window.addEvent('domready', function(){
	FancyForm.start();
});