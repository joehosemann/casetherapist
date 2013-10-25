<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">
    <head id="Head1" runat="server">
        <title>Case Details</title>
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />   
		<!--<script type="text/javascript" src="inc/jqueryui/js/jquery-1.8.2.min.js"></script> -->
		<script type="text/javascript" src="http://codeorigin.jquery.com/jquery-1.10.2.min.js"></script>
		<script>
			function nl2br (str, is_xhtml) {   
				var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br />' : '<br>';    
				return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1'+ breakTag +'$2');
			}
		</script>
		<style>
		body {
			font-family: Verdana,Arial,sans-serif;	
		}
		#casedetails-top {
			padding: 3px;
			font-size: .9em;
		}
		#container > div {
			width: 33%;
			float: left;
		}
		#casehistory {
			overflow-x: auto;
			top: 50px;
			left: 10px;
			right: 0;
			bottom: 0;
			position: absolute;
		}

		</style>
		
    </head>
    <body>
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

			/*
			Input: Parameter value
			*/
			function analysts_case_workable($param) {	
				include 'App_Data/db.php';

				/* Set up and execute the query. */ 
				$tsql = "select top 1 table_case.id_number, table_case.title, REPLACE(REPLACE(REPLACE(REPLACE(CAST(table_case.case_history as varchar(max)),'’',''''),'‘',''''),'…','...'),CHAR(10), '<br>') as case_history, table_contact.phone, table_contact.e_mail, table_contact.salutation, table_contact.first_name + ' ' + table_contact.last_name as fullname from [chsclysql].ClarifyMain.dbo.table_case with (NOLOCK) left join [chsclysql].ClarifyMain.dbo.table_contact with (NOLOCK) on table_contact.objid = table_case.case_reporter2contact where table_case.id_number = '$param'";
				$stmt = sqlsrv_query($conn, $tsql);
				if ($stmt === false) {
					echo "Error in query preparation/execution.\n";
					die(print_r(sqlsrv_errors(), true));
				}

				/* Retrieve each row as an associative array and display the results. */
				while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
					echo '<div id="casedetails-top">';
					echo '<div id="container">';
					echo '<div><div>Case Contact: <span style="font-weight: bold;">' . $row['fullname'] . '</span></div></div>';
					echo '<div><div id="phone" style="text-align: center;">' . $row['phone'] . '</div></div>';
					echo '<div><div style="text-align: right;"><a href="mailto:' . $row['e_mail'] . '?subject=Blackbaud%20case%20' . $row['id_number'] . '">' . $row['e_mail'] . '</a></div></div>';
					/*echo '<span style="float: right;"><a href="mailto:' . $row['e_mail'] . '?subject=Blackbaud%20case%20' . $row['id_number'] . '">' . $row['e_mail'] . '</a></span>';
					echo '<span>Case Contact: </span><span style="font-weight: bold;">' . $row['fullname'] . '</span>';*/
					echo '</div>';
					echo '<div style="text-align:center; font-weight: bold;">' . $row['id_number'] . ' -- ' . $row['title'] . '</div>';
					echo '</div>';
					echo '<br /><span style="font-size:.8em" id="casehistory">' . $row['case_history'] . '</span>';
					
				}

				/* Free statement and connection resources. */
				sqlsrv_free_stmt($stmt);
				sqlsrv_close($conn);
				
				return;
			}

			// Main procedure
			$value = url_get_param('id');			
				analysts_case_workable($value);		
		?>
		
</body>
</html>