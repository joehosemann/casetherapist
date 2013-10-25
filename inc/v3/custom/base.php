<?php
/*
Output: The current page URL
Todo: Integrate this function into url_get_param
*/
function curPageURL() {
 $pageURL = 'http';
 if ($_SERVER["HTTPS"] == "on") {$pageURL .= "s";}
 $pageURL .= "://";
 if ($_SERVER["SERVER_PORT"] != "80") {
  $pageURL .= $_SERVER["SERVER_NAME"].":".$_SERVER["SERVER_PORT"].$_SERVER["REQUEST_URI"];
 } else {
  $pageURL .= $_SERVER["SERVER_NAME"].$_SERVER["REQUEST_URI"];
 }
 return $pageURL;
}

/*
Input: Name of the parameter
Output: Value of parameter or null if none exists
Credit: http://stackoverflow.com/questions/5360014/check-if-parameters-exist-in-an-url
*/
function url_get_param($name) {
	parse_str(parse_url(curPageURL(), PHP_URL_QUERY), $vars);		
	return isset($vars[$name]) ? $vars[$name] : null;	
}

//Global Variable for parameter
$value = url_get_param('param');

if (is_null(url_get_param('param')) && is_null(url_get_param('user'))) {
	echo "<script>$(document).ready(function() {";
	echo "$('#dialog-form').dialog('open');});</script>";
}
?>
<script>
// This function creates a standard table with column/rows
// Parameter Information
// objArray = Anytype of object array, like JSON results
// theme (optional) = A css class to add to the table (e.g. <table class="<theme>">
// enableHeader (optional) = Controls if you want to hide/show, default is show
function CreateTableView(objArray, theme, enableHeader) {
	// set optional theme parameter
	if (theme === undefined) {
		theme = 'mediumTable'; //default theme
	}
 
	if (enableHeader === undefined) {
		enableHeader = true; //default enable headers
	}
 
	// If the returned data is an object do nothing, else try to parse
	var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
 
	var str = '<table class="' + theme + '">';
	 
	// table head
	if (enableHeader) {
		str += '<thead><tr>';
		for (var index in array[0]) {
			str += '<th scope="col">' + index + '</th>';
		}
		str += '</tr></thead>';
	}
	 
	// table body
	str += '<tbody>';
	for (var i = 0; i < array.length; i++) {
		str += (i % 2 == 0) ? '<tr class="alt">' : '<tr>';
		for (var index in array[i]) {
			str += '<td>' + array[i][index] + '</td>';
		}
		str += '</tr>';
	}
	str += '</tbody>'
	str += '</table>';
	return str;
}
</script>
