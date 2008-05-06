function addLoadEvent(func) {
	var oldonload = window.onload;
	if(typeof window.onload != 'function') {
		window.onload = func;
	} else {
		window.onload = function() {
			oldonload();
			func();
		}
	}
}

function hasClassName(tempClassNames, wantedClassName) {
	var classNames = tempClassNames.split(" ");
	for (var i=0; i < classNames.length; i++) {
		if( classNames[i] == wantedClassName) {
			return true;
		}
	}
	return false;
}