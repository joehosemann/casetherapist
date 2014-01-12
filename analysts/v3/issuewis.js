var initIssueWI = function() {
    //var theme = getDemoTheme();
    var url = "http://bbecweb:8012/hapi/IssueWI/?type=analyst&param="+_param;
    //console.log(url);
    var grid = $("#jqxgridIssueWI");
	var cellsrenderer = function (row, columnfield, value, defaulthtml, columnproperties, rowData) {				
	 	// set which highlighting class this row will use
	 	/*
	 	var highlightClass;
	 	if (rowData["Updated"] == 2) {
			highlightClass = 'contact2'
		}
		else if (rowData["Updated"] == 3) {
			highlightClass = 'contact3'
		}
		else if (rowData["Updated"] == 4) {
			highlightClass = 'contact4'
		}
		else if (rowData["Updated"] == 5) {
			highlightClass = 'contact5'
		}
		else if (rowData["Updated"] >= 6) {
			highlightClass = 'contact6'
		}			 	

	 	// clear all existing styling and apply default cell styling			 	
	 	defaulthtml = defaulthtml.toString().replace(/\sstyle="[\w\d\;\-\:\s]+"/i, "");
	 	defaulthtml = [defaulthtml.slice(0, 4), ' style="height:100%;padding-top:5px;"', defaulthtml.slice(4)].join('');
	 	
		if (columnproperties.classname == "colheaderIcons") {
			if (rowData["Contacted"] >= 2) {
				var res = '<div class=\"'+highlightClass +'\" style=\"height:100%;padding-top:5px;text-align:right; padding-right: 5px;\"><img src="../inc/images/icon_important.png" style=""></div>';
				return res;
			}
		}
		else if (columnproperties.classname == "colheaderCaseNum") {
			defaulthtml = modifyString(defaulthtml, 'text-align: center; ', parseInt(defaulthtml.toString().indexOf("style=")+7));
			return modifyString(defaulthtml, 'class=\"'+highlightClass +'\" ', parseInt(defaulthtml.toString().indexOf("style=")));			
		}
		else if (columnproperties.classname == "colheaderSeverity") {	
			defaulthtml = modifyString(defaulthtml, 'text-align: center; ', parseInt(defaulthtml.toString().indexOf("style=")+7));
			return modifyString(defaulthtml, 'class=\"'+highlightClass +'\" ', parseInt(defaulthtml.toString().indexOf("style=")));	
		}
		else if (columnproperties.classname == "colheaderCaseTitle") {	
			var res = '<div class=\"'+highlightClass +'\" style=\"padding-left:5px;height:100%;padding-top:5px;\"><a class="various fancybox.iframe" href=\"http://bbecweb/reporter/casedetails.php?id=' + rowData["id_number"] + '\">' + value + '</a></div>';
			return res;					
		}
		else if (columnproperties.classname == "colheaderCustomer") {
			defaulthtml = modifyString(defaulthtml, 'padding-left: 5px; ', parseInt(defaulthtml.toString().indexOf("style=")+7));
			return modifyString(defaulthtml, 'class=\"'+highlightClass +'\" ', parseInt(defaulthtml.toString().indexOf("style=")));			
		}	
		else if (columnproperties.classname == "colheaderUpdated") {	
			defaulthtml = modifyString(defaulthtml, 'text-align: center; ', parseInt(defaulthtml.toString().indexOf("style=")+7));
			return modifyString(defaulthtml, 'class=\"'+highlightClass +'\" ', parseInt(defaulthtml.toString().indexOf("style=")));		
		}
		else if (columnproperties.classname == "colheaderContacted") {	
			if (value == 2) {
				defaulthtml = modifyString(defaulthtml, 'class="contactOrange" ', parseInt(defaulthtml.toString().indexOf("style=")));				
				return modifyString(defaulthtml, 'text-align: center; ', parseInt(defaulthtml.toString().indexOf("style=")+7));				
			}
			else if (value > 2) {
				defaulthtml = modifyString(defaulthtml, 'class="contactRed" ', parseInt(defaulthtml.toString().indexOf("style=")));
				
				return modifyString(defaulthtml, 'text-align: center; ', parseInt(defaulthtml.toString().indexOf("style=")+7));
			}
			else {				
				return modifyString(defaulthtml, 'text-align: center; ', parseInt(defaulthtml.toString().indexOf("style=")+7));
			}
		}
		else if (columnproperties.classname == "colheaderProduct") {	
			defaulthtml = modifyString(defaulthtml, 'text-align: center; ', parseInt(defaulthtml.toString().indexOf("style=")+7));
			return modifyString(defaulthtml, 'class=\"'+highlightClass +'\" ', parseInt(defaulthtml.toString().indexOf("style=")));	
		}
		else if (columnproperties.classname == "colheaderCaseOwner") {			
			defaulthtml = modifyString(defaulthtml, 'padding-left: 5px; ', parseInt(defaulthtml.toString().indexOf("style=")+7));
			return modifyString(defaulthtml, 'class=\"'+highlightClass +'\" ', parseInt(defaulthtml.toString().indexOf("style=")));
		}
		else if (columnproperties.classname == "colheaderStatus") {			
			defaulthtml = modifyString(defaulthtml, 'padding-left: 5px; ', parseInt(defaulthtml.toString().indexOf("style=")+7));
			return modifyString(defaulthtml, 'class=\"'+highlightClass +'\" ', parseInt(defaulthtml.toString().indexOf("style=")));
		}
		else if (columnproperties.classname == "colheaderWIPBin") {			
			defaulthtml = modifyString(defaulthtml, 'padding-left: 5px; ', parseInt(defaulthtml.toString().indexOf("style=")+7));
			var res = defaulthtml.toString().replace(/\d+\s/i, "");					
			return modifyString(res, 'class=\"'+highlightClass +'\" ', parseInt(res.toString().indexOf("style=")));
		}
		else if (columnproperties.classname == "colheaderCreatedOn") {	
			defaulthtml = modifyString(defaulthtml, 'text-align: center; ', parseInt(defaulthtml.toString().indexOf("style=")+7));
			return modifyString(defaulthtml, 'class=\"'+highlightClass +'\" ', parseInt(defaulthtml.toString().indexOf("style=")));	
		}
		else
			return modifyString(defaulthtml, 'class=\"'+highlightClass +'\" ', parseInt(defaulthtml.toString().indexOf("style=")));
		*/
    }
	
    // prepare the data
    var source =
    {
        datatype: "json",
        datafields: [
			{ name: 'WI', type: 'string' },
			{ name: 'CASEID', type: 'string' },
			{ name: 'TITLE', type: 'string' },
			{ name: 'CLIENTNAME', type: 'string' },
			{ name: 'WISTATE', type: 'string' },
			{ name: 'WICLOSEREASON', type: 'string' },
			{ name: 'WIASSIGNTO', type: 'string' },
			{ name: 'CASESTATUS', type: 'string' },
			{ name: 'WICLOSEDATE', type: 'string' },
			{ name: 'ANALYST', type: 'string' }
        ],
        id: 'CASEID',
        url: url,
        pagesize: 50                
	};
    var dataAdapter = new $.jqx.dataAdapter(source);
    // Create Grid
    grid.jqxGrid(
    {
       	width: '100%',
       	height: '100%',
        source: dataAdapter,
        theme: "metro-lime",
        columnsresize: true,
		enabletooltips: true,
		altrows: false,
		enablebrowserselection: true,
        selectionmode: 'none',
		filterable: true,
        showfilterrow: true,
        columnsmenu: false,
		pageable: true,
        sortable: true,
        pagesizeoptions: ['15', '30', '50', '100', '1000'],
        columns: [
        	{ text: 'WI', width: '50px', datafield: 'WI', classname: 'colheaderWI', filterable: true },
			{ text: 'CaseID', width: '100px',datafield: 'CASEID', classname: 'colheaderCaseId' },
			{ text: 'Case Title', width: '400px', datafield: 'TITLE', classname: 'colheaderTitle' },
			{ text: 'Client', width: '200px', datafield: 'CLIENTNAME', classname: 'colheaderClient', filtertype: 'checkedlist' },
			{ text: 'WI State', width: '70px', datafield: 'WISTATE', classname: 'colheaderWIState', filtertype: 'checkedlist' },
			{ text: 'WI Close Reason', width: '100px', datafield: 'WICLOSEREASON', classname: 'colheaderWICloseReason', filtertype: 'checkedlist' },
			{ text: 'WI Assigned To', width: '70px', datafield: 'WIASSIGNEDTO', classname: 'colheaderWIAssignedTo', filtertype: 'checkedlist' },
			{ text: 'Case Status', datafield: 'CASESTATUS', classname: 'colheaderCaseStatus', filtertype: 'checkedlist' },
			{ text: 'WI Close Date', datafield: 'WICLOSEDATE', classname: 'colheaderCloseDate', filterable: false },
			{ text: 'Analyst', datafield: 'ANALYST', classname: 'colheaderAnalyst', filtertype: 'checkedlist' }
        ],
		rendered: function() {
			//console.log("rendered");		
			$('.various').fancybox({Width: 800,Height: 600,fitToView: true,autoSize: false,closeClick: false,openEffect: 'none',closeEffect: 'none'});
		},
		ready: function() {
			//console.log("ready");
			$('div[id^=dropdownlistContent]').text("Filter");
			
			$('#pagerjqxgridIssueWI>div').append('<input style="float: left; margin-left: 5px; padding: 1px 5px; font-size: .9em;" type="button" value="Export to CSV" id="csvExportIssueWI" />')
			$("#csvExportIssueWI").jqxButton({ theme: "metro-lime" });
			$("#csvExportIssueWI").click(function () {
        		grid.jqxGrid('exportdata', 'csv', 'CaseTherapist');           
    		});
		}
    });			
}