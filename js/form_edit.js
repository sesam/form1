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
		var size = document.styleSheets.length;
		if (document.styleSheets[3].href != null) {
			document.styleSheets[3].href = "style/t_" + name + ".css";
		}
	}
}
// 
function new_question(what) {
	/*var div_question = document.createElement("div");
	div_question = Element(div_question);
	div_question.addClass("question");
	div_question.innerHTML = what;
	*/
	
	var div_question = new Element('div', {
	    'class': 'question'
	});
	
	div_question.innerHTML = what;
	
	var addQuestion = document.getElementById("addQuestion");
	var previous_element = $(addQuestion).getPrevious();
	//for (var i=0; !previous_element.className.match(/(question|group)/) && i<10 ;i++) previous_element = addQuestion.getPrevious();
	
	if (previous_element.hasClass("group")) {
		var is_odd = previous_element.getLast("div.question").hasClass("odd");
		if (!is_odd) {
			div_question.addClass("odd");
		}
	}
	else {
		if(previous_element.hasClass("question")) {
			if(!previous_element.hasClass("odd")) {
				div_question.addClass("odd");
			}
		}
	}
	
	addQuestion.parentNode.insertBefore(div_question, addQuestion);
	
}

function create_question(what) {
	
}

function delete_question(question) {
	
}
