var initNonWorkable = function() {
    //var theme = getDemoTheme();
    var url = "http://bbecweb:8012/hapi/Cases/?type=supervisor&workable=0&resolved=0&param="+_param;
    //console.log(url);
    var grid = $("#jqxgridNonWorkable");	
	// Checks if case is workable and Contact is greater than or equal to 2 days.
	var cellsrenderer = function (row, columnfield, value, defaulthtml, columnproperties, rowData) {				
	 	// set which highlighting class this row will use
	 	var highlightClass;
	 	if (rowData["Updated"] >= 14 && rowData["status"] == "Pending ClientAction") {
			highlightClass = 'contactOrange'
		}
		else if (rowData["status"] == "File CR" && rowData["WI"] == "")	
		{
			highlightClass = 'contactRed'
		}	

	 	// clear all existing styling and apply default cell styling			 	
	 	defaulthtml = defaulthtml.toString().replace(/\sstyle="[\w\d\;\-\:\s]+"/i, "");
	 	defaulthtml = [defaulthtml.slice(0, 4), ' style="height:100%;padding-top:5px;"', defaulthtml.slice(4)].join('');
	 	
		//if (columnproperties.classname == "colheaderIcons") {
		//	if (rowData["Contacted"] >= 14 && rowData["Status"] == "Pending ClientAction") {
		//		var res = '<div class=\"'+highlightClass +'\" style=\"height:100%;padding-top:5px;text-align:right; padding-right: 5px;\"><img src="../inc/images/icon_important.png" style=""></div>';
		//		return res;
		//	}
		//}
		if (columnproperties.classname == "colheaderWI") {
			var res = '<div class=\"'+highlightClass +'\" style=\"text-align:center;height:100%;padding-top:5px;\"><a target=\"_blank\" href=\"https://tfs.blackbaud.com/tfs/DefaultCollection/Infinity/_workitems#_a=edit&id=' + rowData["WI"] + '\">' + value + '</a></div>';
			return res;		
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
			defaulthtml = modifyString(defaulthtml, 'text-align: center; ', parseInt(defaulthtml.toString().indexOf("style=")+7));
			return modifyString(defaulthtml, 'class=\"'+highlightClass +'\" ', parseInt(defaulthtml.toString().indexOf("style=")));		
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
    }
	
    // prepare the data
    var source =
    {
        datatype: "json",
        datafields: [
			{ name: 'id_number', type: 'string' },
			{ name: 'WI', type: 'string' },
			{ name: 'Severity', type: 'string' },
			{ name: 'atitle', type: 'string' },
			{ name: 'x_customer', type: 'string' },
			{ name: 'Updated', type: 'string' },
			{ name: 'Contacted', type: 'string' },
			{ name: 'x_product', type: 'string' },
			{ name: 'login_name', type: 'string' },
			{ name: 'status', type: 'string' },
			{ name: 'WIPBin', type: 'string' },
			{ name: 'CreatedOn', type: 'string' }
        ],
        id: 'id_number',
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
			//{ text: '', classname: 'colheaderIcons', filterable: false, cellsrenderer: cellsrenderer},
			{ text: 'Case Num', datafield: 'id_number', width: '80px', classname: 'colheaderCaseNum', cellsrenderer: cellsrenderer},
			{ text: 'WI', datafield: 'WI', width: '80px', classname: 'colheaderWI', cellsrenderer: cellsrenderer},
			{ text: 'Severity', datafield: 'Severity', width: '65px', classname: 'colheaderSeverity', cellsrenderer: cellsrenderer, filtertype: 'checkedlist'},
			{ text: 'Case Title', datafield: 'atitle', classname: 'colheaderCaseTitle', cellsrenderer: cellsrenderer },
			{ text: 'Customer', datafield: 'x_customer', classname: 'colheaderCustomer', cellsrenderer: cellsrenderer, filtertype: 'checkedlist' },
			{ text: 'Updated', datafield: 'Updated', width:'35px', classname: 'colheaderUpdated', filterable: false, cellsrenderer: cellsrenderer },
			{ text: 'Contacted', datafield: 'Contacted', width: '30px', classname: 'colheaderContacted', filterable: false, cellsrenderer: cellsrenderer},
			{ text: 'Product', datafield: 'x_product', width: '75px', classname: 'colheaderProduct', cellsrenderer: cellsrenderer, filtertype: 'checkedlist'},
			{ text: 'Case Owner', datafield: 'login_name', width: '87px', classname: 'colheaderCaseOwner', cellsrenderer: cellsrenderer, filtertype: 'checkedlist' },
			{ text: 'Status', datafield: 'status', width: '100px', classname: 'colheaderStatus', cellsrenderer: cellsrenderer, filtertype: 'checkedlist'},
			{ text: 'WIPBin', datafield: 'WIPBin', width: '75px', classname: 'colheaderWIPBin', cellsrenderer: cellsrenderer },
			{ text: 'Created On', datafield: 'CreatedOn', width: '35px', classname: 'colheaderCreatedOn', filterable: false, cellsrenderer: cellsrenderer}
        ],
		rendered: function() {
			console.log("rendered");
			$('.colheaderCreatedOn>div:first-child>div:first-child>span').html('<img src="../inc/v3/images/createdon.png" alt="Created On">');
			$('.colheaderUpdated>div:first-child>div:first-child>span').html('<img src="../inc/v3/images/activity.png" alt="Activity">');
			$('.colheaderContacted>div:first-child>div:first-child>span').html('<img src="../inc/v3/images/contacted.png" alt="Contacted">');
			$('.various').fancybox({Width: 800,Height: 600,fitToView: true,autoSize: false,closeClick: false,openEffect: 'none',closeEffect: 'none'});
		},
		ready: function() {
			console.log("ready");
			$('div[id^=dropdownlistContent]').text("Filter");
			
			$('#pagerjqxgridNonWorkable>div').append('<input style="float: left; margin-left: 5px; padding: 1px 5px; font-size: .9em;" type="button" value="Export to CSV" id="csvExportNonWorkable" />')
			$("#csvExportNonWorkable").jqxButton({ theme: "metro-lime" });
			$("#csvExportNonWorkable").click(function () {
        		grid.jqxGrid('exportdata', 'csv', 'CaseTherapist');           
    		});
		}
    });			
}