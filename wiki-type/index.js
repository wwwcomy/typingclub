const LINE_WIDTH = 35;
const ARTICLE_LENGTH = 340;
var IGNORE_CASE = true;
var IGNORE_PUNCTUATION_MARK = true;
var KEEP_PERIOD_COMMA_QUESTION = true;
startDate = new Date();

function tokenize(str) {
    // This regular expression uses a positive lookbehind to split on
    // whitespace without consuming the whitespace, i.e. trailing whitespace is
    // maintained in the resulting elements.
    var reg = new RegExp("([ \t\n\r]+)", 'g')
    return str.split(reg);
}

function tokenToTokenElement(token) {
    return "<span class='token'>" +
        Array.prototype.map.call(token, (tu) =>
            "<span class='token-unit'>" + (" " === tu ? "&nbsp;" : tu) + "</span>"
        ).join("") +
        "</span>";
}

function tokenElementsToLine(elems) {
    return "<span class='line'>" + elems + "</span>";
}

function appendLineToArticleContent(line) {
    $("#article-content").append("<span class='line'>" + line + "</span>");
}

function setArticleTitle(title, url) {
    var page_title = $("title").text(); // title with HTML tags stripped out
    page_title = page_title === "" ? title : page_title;
    $("title").text(page_title + " - WikiType");

    if (url !== undefined) {
        title = "<a href='" + url + "'>" + title + "</a>";
    }
    var article_title = $("#article-title");
    article_title.empty();
    article_title.append(title);
}

function displayResults() {
    var currentDate = new Date();
    var timeDiff = currentDate.getTime() - startDate.getTime();
    var timeDiffMin = timeDiff / 1000 / 60
    var tokenUnitCount = $(".token-unit").length;
    var accuracy = $(".correct,.fixed").length / $(".token-unit").length * 100;
    var real_accuracy = $(".correct").length / $(".token-unit").length * 100;
    if (isNaN(accuracy)) {
        accuracy = 0;
    }
    if (isNaN(real_accuracy)) {
        real_accuracy = 0;
    }
    accuracy = accuracy.toFixed(2);
    real_accuracy = real_accuracy.toFixed(2);
    var articleTitle = $("#article-title").text();
    $("#resultDiv").append("<h3>" + articleTitle + "</h3>" + tokenUnitCount + " words")
    $("#resultDiv").append("<li><b>Accuracy</b>:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + accuracy + '%</li>');
    $("#resultDiv").append("<li><b>Real accuracy</b>: " + real_accuracy + "%</li>");
    $("#resultDiv").append("<li><b>Time Used</b>: " + parseInt(timeDiffMin) + "min " + (timeDiff / 1000) % 60 + "s</li>");
    $("#resultDiv").append("<li><b>Speed</b>: " + parseInt(tokenUnitCount / timeDiffMin) + " KMP</li>");

}

function initializeExercise(title, url) {
    // define actions to perform on completion
    var onCompletion = () => {
        $("#article-content").off("keydown"); // disable additional input
        displayResults();
    };
    var cursor = new Cursor(onCompletion);
    // disable the event registered by the last cursor object
	$("#article-content").off("keydown");
    $("#article-content").keydown(cursor.processKeyDown);
    startDate = new Date();
    setArticleTitle(title, "#");
}

function initializeExerciseFromJSON(data) {
    if (data.type === "disambiguation") {
        // TODO
        console.log("Disambiguation:");
        console.log(data);
    }

    // clear any existing article content
    $("#article-content").empty();

    // take the first roughly ARTICLE_LENGTH characters worth of sentences from
    // the article data
    console.assert(data.extract.length > 0, "Article content fetched has length 0.");
    var rawExtract = IGNORE_CASE ? data.extract.toLowerCase() : data.extract;
    var regExp = ''
    if (IGNORE_PUNCTUATION_MARK) {
		regExp = KEEP_PERIOD_COMMA_QUESTION ? "[^a-zA-Z0-9\\s,\.\?]" : "[^a-zA-Z0-9\\s]"
		rawExtract = IGNORE_PUNCTUATION_MARK ? rawExtract.replace(new RegExp(regExp, 'g'), '') : rawExtract;
	}
    reg = new RegExp("([ \t\n\r]+)", 'g')
    var extract = rawExtract.split(reg)
    var num_sentences = 1;
    var article_length = extract[0].length;
    for (; num_sentences < extract.length && article_length < rawExtract.length; num_sentences++) {
        article_length += extract[num_sentences].length;
    }
    var tokens = tokenize(extract.slice(0, num_sentences).join("").trim());

    var curr_line = tokenToTokenElement(tokens[0]);
    var curr_line_width = tokens[0].length;
    for (var i = 1; i < tokens.length; i++) {
        if (curr_line_width + tokens[i].length < LINE_WIDTH) {
            // We haven't exceeded the maximum line width. Append a new token
            // to the current line.
            curr_line += tokenToTokenElement(tokens[i]);
            curr_line_width += tokens[i].length;
        } else {
            appendLineToArticleContent(curr_line);
            curr_line = tokenToTokenElement(tokens[i]);
            curr_line_width = tokens[i].length;
        }
    }
    appendLineToArticleContent(curr_line);

    //initializeExercise(data.titles.display, data.content_urls.desktop.page);
    initializeExercise(data.titles.display, null);
    $("#article-content").focus();
}

// handle settings
$("#IGNORE_CASE")[0].checked = IGNORE_CASE
$("#IGNORE_PUNCTUATION_MARK")[0].checked=IGNORE_PUNCTUATION_MARK
$("#KEEP_PERIOD_COMMA_QUESTION")[0].checked=KEEP_PERIOD_COMMA_QUESTION
$('#IGNORE_CASE').change(function () {
    IGNORE_CASE=$("#IGNORE_CASE")[0].checked
});
$('#IGNORE_PUNCTUATION_MARK').change(function () {
    IGNORE_PUNCTUATION_MARK=$("#IGNORE_PUNCTUATION_MARK")[0].checked
});
$('#KEEP_PERIOD_COMMA_QUESTION').change(function () {
    KEEP_PERIOD_COMMA_QUESTION=$("#KEEP_PERIOD_COMMA_QUESTION")[0].checked
});


// load a sample extract and convert it into an exercise
// Page.getJSONRandomSummary((data) => initializeExerciseFromJSON(data));
var data = {
    "titles": {
        "canonical": "Traditional_medicine",
        "normalized": "Traditional medicine",
        "display": "Traditional medicine"
    },
    "extract": "Traditional medicine comprises medical aspects of traditional knowledge that developed over generations within various societies before the era of modern medicine. The World Health Organization (WHO) defines traditional medicine as \"the sum total of the knowledge, skills, and practices based on the theories, beliefs, and experiences indigenous to different cultures, whether explicable or not, used in the maintenance of health as well as in the prevention, diagnosis, improvement or treatment of physical and mental illness\". Traditional medicine is contrasted with scientific medicine."
}
data.titles.display = "A-Z testing"
data.extract = "1abcdefghijklmnopqrstuvwxyz 2abcdefghijklmnopqrstuvwxyz 3abcdefghijklmnopqrstuvwxyz 4abcdefghijklmnopqrstuvwxyz 5abcdefghijklmnopqrstuvwxyz 6abcdefghijklmnopqrstuvwxyz 7abcdefghijklmnopqrstuvwxyz 8abcdefghijklmnopqrstuvwxyz 9abcdefghijklmnopqrstuvwxyz 10abcdefghijklmnopqrstuvwxyz abcdefghijklmnopqrstuvwxyz"
initializeExerciseFromJSON(data)

$("#requested-article").keyup((event) => {
    if (event.key === "Enter") {
        var requested_article = $("#requested-article").val();
        (new Page(requested_article)).getJSONSummary((data) => initializeExerciseFromJSON(data));
        $("#article-content").focus();
    }
});
$(document).keydown(function(event) {
    if (event.target.nodeName == 'TEXTAREA' || event.target.nodeName == 'INPUT') {
        return;
    };
    /* Act on the event */
    if (event.keyCode == 32) {
        event.preventDefault();
    };
});

$(function() {
    var findContentByTitle = function(t) {
        for (var category in articles) {
            var itemData = articles[category];
            for (var item in itemData) {
                if (t === itemData[item].title) {
                    return itemData[item].content;
                }
            }
        }
        return "";
    }
    var getMenuItem = function(category) {
        var itemData = articles[category]
        var items = $("<ul class=\"dropdown-menu\">");
        for (var item in itemData) {
            var eachLi = $("<li>")
                .append(
                    $("<a>", {
                        html: itemData[item].title
                    }));
            items.append(eachLi);

        }
        return items;
    };

    var $menu = $("#menu");
    for (var category in articles) {
        $menu.append(
            $("<li class=\"dropdown-submenu\">")
            .append($("<a>", {
                html: category
            }))
            .append(getMenuItem(category))
        );
    }
    $('#menuWrapper li ul li').on('click', function() {
        var title = $(this).text();
        var content = findContentByTitle(title);
        var data = {
            "titles": {
                "canonical": title,
                "normalized": title,
                "display": title
            },
            "extract": content
        }
        initializeExerciseFromJSON(data);
        $("#article-content").focus();
    });

    $('#reset').on('click', function() {
        $("#resultDiv").html("")
    });
});