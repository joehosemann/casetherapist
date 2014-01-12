<?php
/*
Input: Parameter value
*/
function managers_team_summary($param) {	
		
	echo '<div id=\'container\' style="font-size: 13px; font-family: Verdana;"></div>';
	
	echo '<script type="text/javascript">';
	echo '$.support.cors = true;';
	echo '$(document).ready(function() {';
	echo '$.ajax({';
	echo 'type: "GET",';
	echo "url: \"http://bbecweb:8012/hapi/CasesSummary/?param=$param\",";
	echo 'contentType: "application/json; charset=utf-8",';
	echo 'dataType: "json",';
	echo 'success: function(res) {';
	echo '$(\'#container\').append(CreateTableView(res)).fadeIn();';
	echo '}';
	echo '});';
	echo '});';
	echo '</script>';
	
	return;
	
}


// Check to make sure the phpbase is loaded.
if (!isset($value)) {
	include_once('base.php');
}

if (!is_null($value)) {		
		managers_team_summary($value);		
	}
	
?>

<script>

</script>