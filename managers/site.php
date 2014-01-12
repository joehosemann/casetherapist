<!DOCTYPE html>
<html lang="en">
<head>
    <title id='Description'>Case Therapist -- Team View</title>
    <!-- Begin Library Includes -->
    <link rel="stylesheet" href="../inc/v3/jqwidgets/styles/jqx.base.css" type="text/css" />
	<link rel="stylesheet" href="../inc/v3/jqwidgets/styles/jqx.metro-lime.css" type="text/css" />
	<link rel="stylesheet" type="text/css" href="../inc/v3/fancybox/jquery.fancybox.css">
	<link rel="stylesheet" type="text/css" href="http://code.jquery.com/ui/1.10.3/themes/smoothness/jquery-ui.css">
    <script type="text/javascript" src="http://codeorigin.jquery.com/jquery-1.10.2.min.js"></script>
    <script type="text/javascript" src="http://code.jquery.com/ui/1.10.3/jquery-ui.js"></script>    
    <script type="text/javascript" src="../inc/v3/fancybox/jquery.fancybox.js"></script>
    <script type="text/javascript" src="../inc/v3/selectivizr/selectivizr-min.js"></script>
	<script type="text/javascript" src="../inc/v3/jqwidgets/jqxcore.js"></script>	
    <script type="text/javascript" src="../inc/v3/jqwidgets/jqxtabs.js"></script>
	<script type="text/javascript" src="../inc/v3/jqwidgets/jqxdata.js"></script> 
	<script type="text/javascript" src="../inc/v3/jqwidgets/jqxbuttons.js"></script>
	<script type="text/javascript" src="../inc/v3/jqwidgets/jqxscrollbar.js"></script>
	<script type="text/javascript" src="../inc/v3/jqwidgets/jqxlistbox.js"></script> 
	<script type="text/javascript" src="../inc/v3/jqwidgets/jqxmenu.js"></script>
	<script type="text/javascript" src="../inc/v3/jqwidgets/jqxdropdownlist.js"></script> 
	<script type="text/javascript" src="../inc/v3/jqwidgets/jqxgrid.js"></script>
	<script type="text/javascript" src="../inc/v3/jqwidgets/jqxgrid.filter.js"></script> 
	<script type="text/javascript" src="../inc/v3/jqwidgets/jqxgrid.selection.js"></script> 
	<script type="text/javascript" src="../inc/v3/jqwidgets/jqxgrid.sort.js"></script> 
	<script type="text/javascript" src="../inc/v3/jqwidgets/jqxgrid.columnsresize.js"></script> 
	<script type="text/javascript" src="../inc/v3/jqwidgets/jqxcheckbox.js"></script> 
	<script type="text/javascript" src="../inc/v3/jqwidgets/jqxtree.js"></script>
	<script type="text/javascript" src="../inc/v3/jqwidgets/jqxpanel.js"></script>
    <script type="text/javascript" src="../inc/v3/jqwidgets/jqxdata.export.js"></script> 
    <script type="text/javascript" src="../inc/v3/jqwidgets/jqxgrid.export.js"></script>
	<script type="text/javascript" src="../inc/v3/jqwidgets/jqxlistbox.js"></script>
	<script type="text/javascript" src="../inc/v3/jqwidgets/jqxexpander.js"></script>
	<script type="text/javascript" src="../inc/v3/jqwidgets/jqxsplitter.js"></script>
	<script type="text/javascript" src="../inc/v3/jqwidgets/jqxgrid.pager.js"></script>
	<script type="text/javascript" src="../inc/v3/custom/tracker.js"></script>
	<!-- End Library Includes -->

	<script type="text/javascript" src="v3site/hosemann.js"></script>
	<script type="text/javascript" src="v3site/workable.js"></script>	
	<script type="text/javascript" src="v3site/nonworkable.js"></script>
	<script type="text/javascript" src="v3site/resolved.js"></script>
	<script type="text/javascript" src="v3site/issuewis.js"></script>
	<style>
		html, body {
            height: 100%;
            width: 100%;
            margin: 0px auto;
            overflow: hidden;
        }
        #jqxTabs {margin-left: auto; margin-right: auto;}
		.contactRed {background-color: #FFA59C;}
		.contactOrange {background-color: #FFDB9B;}
		.contact2 {background-color: #FBFFCC;}
		.contact3 {background-color: #F8FF99;}
		.contact4 {background-color: #F4FF66;}
		.contact5 {background-color: #FFE57F;}
		.contact6 {background-color: #FFD53F;}
		a:hover {text-decoration: underline;}
		a {text-decoration: none; color:black;}
	</style>
	
	<!--TODO: convert this into js file-->
    <script type="text/javascript">
		$.support.cors = true;		

		$(document).ready(function () {
			function modifyString (str, addition, position) {
				return [str.slice(0, position), addition, str.slice(position)].join('');
			}

		 	// init widgets.
	        var initWidgets = function (tab) {
	            switch (tab) {
	                case 0:
	                    initWorkable();
	                    break;
	                case 1:
	                    initResolved();
	                    break;
	                case 2:
	                    initNonWorkable();
	                    break;
	                case 3:
	                	initIssueWI();
	                	break;
	            }
	        }
	        $('#jqxTabs').jqxTabs({ width: '95%', height: '95%', theme: "metro-lime", initTabContent: initWidgets });	
			
			//Reporter Legend Fancybox.
			$(document).ready(function () {
				$("a#aLegend").fancybox({
					maxWidth: 310,
					maxHeight: 200,
					fitToView: false,
					autoSize: false,
					closeClick: false,
					openEffect: 'none',
					closeEffect: 'none'
				});
			});
    	});
    </script>
</head>
<body class='default' style="">
<?php include_once('../inc/v3/custom/dialog.php') ?>
<?php include_once('../inc/v3/custom/base.php') ?>

 	<div id='jqxTabs'>
        <ul>
            <li>Workable</li>
            <li>Resolved</li>
            <li>Non-Workable</li>
            <li>WI Issues</li>
            <li>Analyst Summary</li>
        </ul>
        <div style="overflow: hidden;">
            <div id="jqxgridWorkable"></div>            
        </div>
        <div style="overflow: hidden;">
            <div id='jqxgridResolved'></div>
        </div>
        <div style="overflow: hidden;">
            <div id='jqxgridNonWorkable'></div>
        </div>
        <div style="overflow: hidden;">
            <div id='jqxgridIssueWI'></div>
        </div>
        <div style="overflow: hidden;">
        	<div id="containerSummary"></div>
        	<script type="text/javascript">
				$('#containerSummary').ready(function() {
					$.ajax({
					type: "GET",
					url: 'http://bbecweb:8012/hapi/CasesSummary/?param='+_param,
					contentType: "application/json; charset=utf-8",
					dataType: "json",
					success: function(res) {
					$('#containerSummary').append(CreateTableView(res)).fadeIn();
					}
					});
				});
				</script>
        </div>
    </div>

<div id="version" style="font-family: Segoe UI; text-align: center; font-size: .75em;">Developed and maintained by <a href="mailto:joseph.hosemann@blackbaud.com?subject=Reporter">Joseph Hosemann</a> - version 3 - <a id="aLegend" data-fancybox-type="iframe" href="http://bbecweb/reporter/legend.htm">Reporter Legend</a></div>
</body>
</html>