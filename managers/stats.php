<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">
    <head id="Head1" runat="server">
        <title>Case Details</title>
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
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
		.trhead {
			background-color: lightgray;
		}
		</style>
		
    </head>
    <body>
	<table style="text-align: left;" border="0" cellpadding="5" cellspacing="0">
  <tbody>
    <tr class="trhead">
      <td></td>
      <td>Day</td>
      <td>Week</td>
      <td>Month</td>
      <td>Quarter</td>
    </tr>
    
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
				include '../App_Data/clarifydwdb.php';

				/* Set up and execute the query. */ 
        	$tsql = "SELECT ISNULL(CONVERT(INT, ( CONVERT(FLOAT, ( SELECT COUNT(ID) FROM fact_case WHERE DATEDIFF(dd, dateadded, resolvedtime) <= 2 AND owneruserid IN ( SELECT id FROM dim_user WHERE Supervisor = ( SELECT FullName FROM dim_user WHERE LOGIN = '$param' ) ) AND resolvedflag IS NOT NULL AND resolvedtime >= GETDATE() - 1 )) / NULLIF(CONVERT(FLOAT, ( SELECT COUNT(ID) FROM fact_case WHERE owneruserid IN ( SELECT id FROM dim_user WHERE Supervisor = ( SELECT FullName FROM dim_user WHERE LOGIN = '$param' ) ) AND resolvedflag IS NOT NULL AND resolvedtime >= GETDATE() - 1 )), 0) * 100 )), 0) AS R2Day ,( ISNULL(CONVERT(INT, ( CONVERT(FLOAT, ( SELECT COUNT(ID) FROM fact_case WHERE DATEDIFF(dd, dateadded, resolvedtime) <= 2 AND owneruserid IN ( SELECT id FROM dim_user WHERE Supervisor = ( SELECT FullName FROM dim_user WHERE LOGIN = '$param' ) ) AND resolvedflag IS NOT NULL AND resolvedtime >= DATEADD(week, - 1, GETDATE()) )) / NULLIF(CONVERT(FLOAT, ( SELECT COUNT(ID) FROM fact_case WHERE owneruserid IN ( SELECT id FROM dim_user WHERE Supervisor = ( SELECT FullName FROM dim_user WHERE LOGIN = '$param' ) ) AND resolvedflag IS NOT NULL AND resolvedtime >= DATEADD(week, - 1, GETDATE()) )),0) * 100 )),0) ) AS R2Week ,( ISNULL(CONVERT(INT, ( CONVERT(FLOAT, ( SELECT COUNT(ID) FROM fact_case WHERE DATEDIFF(dd, dateadded, resolvedtime) <= 2 AND owneruserid IN ( SELECT id FROM dim_user WHERE Supervisor = ( SELECT FullName FROM dim_user WHERE LOGIN = '$param' ) ) AND resolvedflag IS NOT NULL AND resolvedtime >= DATEADD(month, - 1, GETDATE()) )) / NULLIF(CONVERT(FLOAT, ( SELECT COUNT(ID) FROM fact_case WHERE owneruserid IN ( SELECT id FROM dim_user WHERE Supervisor = ( SELECT FullName FROM dim_user WHERE LOGIN = '$param' ) ) AND resolvedflag IS NOT NULL AND resolvedtime >= DATEADD(month, - 1, GETDATE()) )),0) * 100 )),0) ) AS R2Month ,( ISNULL(CONVERT(INT, ( CONVERT(FLOAT, ( SELECT COUNT(ID) FROM fact_case WHERE DATEDIFF(dd, dateadded, resolvedtime) <= 2 AND owneruserid IN ( SELECT id FROM dim_user WHERE Supervisor = ( SELECT FullName FROM dim_user WHERE LOGIN = '$param' ) ) AND resolvedflag IS NOT NULL AND resolvedtime >= DATEADD(month, - 3, GETDATE()) )) / NULLIF(CONVERT(FLOAT, ( SELECT COUNT(ID) FROM fact_case WHERE owneruserid IN ( SELECT id FROM dim_user WHERE Supervisor = ( SELECT FullName FROM dim_user WHERE LOGIN = '$param' ) ) AND resolvedflag IS NOT NULL AND resolvedtime >= DATEADD(month, - 3, GETDATE()) )),0) * 100 )),0) ) AS R2Quarter, ISNULL(CONVERT(INT, ( CONVERT(FLOAT, ( SELECT COUNT(ID) FROM fact_case WHERE DATEDIFF(dd, dateadded, resolvedtime) <= 5 AND owneruserid IN ( SELECT id FROM dim_user WHERE Supervisor = ( SELECT FullName FROM dim_user WHERE LOGIN = '$param' ) ) AND resolvedflag IS NOT NULL AND resolvedtime >= GETDATE() - 1 )) / NULLIF(CONVERT(FLOAT, ( SELECT COUNT(ID) FROM fact_case WHERE owneruserid IN ( SELECT id FROM dim_user WHERE Supervisor = ( SELECT FullName FROM dim_user WHERE LOGIN = '$param' ) ) AND resolvedflag IS NOT NULL AND resolvedtime >= GETDATE() - 1 )), 0) * 100 )), 0) AS R5Day ,( ISNULL(CONVERT(INT, ( CONVERT(FLOAT, ( SELECT COUNT(ID) FROM fact_case WHERE DATEDIFF(dd, dateadded, resolvedtime) <= 5 AND owneruserid IN ( SELECT id FROM dim_user WHERE Supervisor = ( SELECT FullName FROM dim_user WHERE LOGIN = '$param' ) ) AND resolvedflag IS NOT NULL AND resolvedtime >= DATEADD(week, - 1, GETDATE()) )) / NULLIF(CONVERT(FLOAT, ( SELECT COUNT(ID) FROM fact_case WHERE owneruserid IN ( SELECT id FROM dim_user WHERE Supervisor = ( SELECT FullName FROM dim_user WHERE LOGIN = '$param' ) ) AND resolvedflag IS NOT NULL AND resolvedtime >= DATEADD(week, - 1, GETDATE()) )),0) * 100 )),0) ) AS R5Week ,( ISNULL(CONVERT(INT, ( CONVERT(FLOAT, ( SELECT COUNT(ID) FROM fact_case WHERE DATEDIFF(dd, dateadded, resolvedtime) <= 5 AND owneruserid IN ( SELECT id FROM dim_user WHERE Supervisor = ( SELECT FullName FROM dim_user WHERE LOGIN = '$param' ) ) AND resolvedflag IS NOT NULL AND resolvedtime >= DATEADD(month, - 1, GETDATE()) )) / NULLIF(CONVERT(FLOAT, ( SELECT COUNT(ID) FROM fact_case WHERE owneruserid IN ( SELECT id FROM dim_user WHERE Supervisor = ( SELECT FullName FROM dim_user WHERE LOGIN = '$param' ) ) AND resolvedflag IS NOT NULL AND resolvedtime >= DATEADD(month, - 1, GETDATE()) )),0) * 100 )),0) ) AS R5Month ,( ISNULL(CONVERT(INT, ( CONVERT(FLOAT, ( SELECT COUNT(ID) FROM fact_case WHERE DATEDIFF(dd, dateadded, resolvedtime) <= 5 AND owneruserid IN ( SELECT id FROM dim_user WHERE Supervisor = ( SELECT FullName FROM dim_user WHERE LOGIN = '$param' ) ) AND resolvedflag IS NOT NULL AND resolvedtime >= DATEADD(month, - 3, GETDATE()) )) / NULLIF(CONVERT(FLOAT, ( SELECT COUNT(ID) FROM fact_case WHERE owneruserid IN ( SELECT id FROM dim_user WHERE Supervisor = ( SELECT FullName FROM dim_user WHERE LOGIN = '$param' ) ) AND resolvedflag IS NOT NULL AND resolvedtime >= DATEADD(month, - 3, GETDATE()) )),0) * 100 )),0) ) AS R5Quarter";
				$stmt = sqlsrv_query($conn, $tsql);
				if ($stmt === false) {
					echo "Error in query preparation/execution.\n";
					die(print_r(sqlsrv_errors(), true));
				}

				/* Retrieve each row as an associative array and display the results. */
				while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
        			echo '<tr>';
        			echo '<td style="padding-right: 20px;">Resolved 2 Days</td>';
        			echo '<td>' . $row['R2Day'] . '%</td>';
        			echo '<td>' . $row['R2Week'] . '%</td>';
        			echo '<td>' . $row['R2Month'] . '%</td>';
        			echo '<td>' . $row['R2Quarter'] . '%</td>';
        			echo '</tr>';
					echo '<tr>';
        			echo '<td style="padding-right: 20px;">Resolved 5 Days</td>';
					echo '<td>' . $row['R5Day'] . '%</td>';
					echo '<td>' . $row['R5Week'] . '%</td>';
					echo '<td>' . $row['R5Month'] . '%</td>';
					echo '<td>' . $row['R5Quarter'] . '%</td>';
					echo '</tr>';
					
				}

				/* Free statement and connection resources. */
				sqlsrv_free_stmt($stmt);
				sqlsrv_close($conn);
				
				return;
			}
			
        // Main procedure
        $value = url_get_param('param');			
        analysts_case_workable($value);		
		?>
		
  </tbody>
</table>

</body>
</html>