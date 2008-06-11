function switchStyleSheet(name) {
	if(!window.ie) {
		var linkTag, linkTitle = "t_" + name;
		var linksArray = document.getElementsByTagName("link");

		for(var linkNum=0; linkNum<linksArray.length; linkNum++) {
			linkTag = linksArray[linkNum];
			if(linkTag.getAttribute("rel") != null) {
				if(linkTag.getAttribute("rel").match(/^sty|^alt/i)) {

					if (linkTag.getAttribute("title") == linkTitle) {
						linkTag.disabled = false;
					} else if (linkTag.getAttribute("title")) {
						linkTag.disabled = true;
					}

				}
			}
		}
	}
	else {
		alert("Hej IE : " + name);
		if (document.styleSheets[0].href != null) {
			document.styleSheets[0].href = "style/t_" + name + ".css";
		}
	}
}
