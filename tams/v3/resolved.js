var initResolved = function () {
    //var theme = getDemoTheme();
    var url = "http://bbecweb:8012/hapi/Cases/?type=tam&workable=-1&resolved=1&param=" + _param;
    //console.log(url);
    var grid = $("#jqxgridResolved");
    // Checks if case is workable and Contact is greater than or equal to 2 days.
    var cellsrenderer = function (row, columnfield, value, defaulthtml, columnproperties, rowData) {
        // set which highlighting class this row will use
        var highlightClass;       

        // clear all existing styling and apply default cell styling			 	
        defaulthtml = defaulthtml.toString().replace(/\sstyle="[\w\d\;\-\:\s]+"/i, "");
        defaulthtml = [defaulthtml.slice(0, 4), ' style="height:100%;padding-top:5px;"', defaulthtml.slice(4)].join('');

        switch (columnproperties.classname) {
            case "colheaderIcons":
                if (rowData["Contacted"] >= 2) {
                    var res = '<div class=\"' + highlightClass + '\" style=\"height:100%;padding-top:5px;text-align:right; padding-right: 5px;\"><img src="../inc/images/icon_important.png" style=""></div>';
                    return res;
                }
                break;
            case "colheaderWI":
                var res = '<div class=\"' + highlightClass + '\" style=\"text-align:center;height:100%;padding-top:5px;\"><a target=\"_blank\" href=\"https://tfs.blackbaud.com/tfs/DefaultCollection/Infinity/_workitems#_a=edit&id=' + rowData["WI"] + '\">' + value + '</a></div>';
                return res;
                break;
            case "colheaderCaseTitle":
                var res = '<div class=\"' + highlightClass + '\" style=\"padding-left:5px;height:100%;padding-top:5px;\"><a class="various fancybox.iframe" href=\"http://bbecweb/reporter/casedetails.php?id=' + rowData["id_number"] + '\">' + value + '</a></div>';
                return res;
                break;          
            case "colheaderWIPBin":
                defaulthtml = modifyString(defaulthtml, 'padding-left: 5px; ', parseInt(defaulthtml.toString().indexOf("style=") + 7));
                var res = defaulthtml.toString().replace(/\d+\s/i, "");
                return modifyString(res, 'class=\"' + highlightClass + '\" ', parseInt(res.toString().indexOf("style=")));
                break;
            default:
                // columns to be centered
                var centeredColumns = ["colheaderCreatedDate", "colheaderCaseNum", "colheaderSeverity", "colheaderUpdated", "colheaderProduct", "colheaderCaseAge", "colheaderDaysOwned"];
                // columns to be offset by 5 pixels to the left.
                var offsetColumns = ["colheaderCaseCentralLink", "colheaderCaseContact", "colheaderStatus", "colheaderCaseOwner", "colheaderCustomer"];
                if ($.inArray(columnproperties.classname, centeredColumns) > -1) {
                    defaulthtml = modifyString(defaulthtml, 'text-align: center; ', parseInt(defaulthtml.toString().indexOf("style=") + 7));
                }
                else if ($.inArray(columnproperties.classname, offsetColumns) > -1) {
                    defaulthtml = modifyString(defaulthtml, 'padding-left: 5px; ', parseInt(defaulthtml.toString().indexOf("style=") + 7));
                }

                return modifyString(defaulthtml, 'class=\"' + highlightClass + '\" ', parseInt(defaulthtml.toString().indexOf("style=")));
                break;
        }
    }

    // prepare the data
    /* id_number
     * WI
     * Severity
     * CaseContact
     * CaseTitle
     * Customer
     * Updated
     * Contacted
     * ProductLine
     * CaseOwnerLogin
     * CaseOwner
     * Status
     * WIPBin
     * CreatedDate
     * CaseAge
     * CaseCentralLink
     */
    var source =
    {
        datatype: "json",
        datafields: [
			{ name: 'id_number', type: 'string' },
			{ name: 'WI', type: 'string' },
			{ name: 'Severity', type: 'string' },
            { name: 'CaseContact', type: 'string' },
            { name: 'CaseTitle', type: 'string' },
			//{ name: 'Customer', type: 'string' },
			{ name: 'Updated', type: 'string' },
			{ name: 'Contacted', type: 'string' },
			{ name: 'ProductLine', type: 'string' },
			//{ name: 'CaseOwnerLogin', type: 'string' },
            { name: 'CaseOwner', type: 'string' },
			{ name: 'Status', type: 'string' },
			//{ name: 'WIPBin', type: 'string' },
            { name: 'CreatedDate', type: 'string' },
			{ name: 'CaseAge', type: 'string' },
            { name: 'DaysOwned', type: 'string' },
            { name: 'CaseCentralLink', type: 'string' }
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
			{ text: 'Case Num', datafield: 'id_number', width: '80px', classname: 'colheaderCaseNum', cellsrenderer: cellsrenderer, cellsalign: 'center' },
			{ text: 'WI', datafield: 'WI', width: '80px', classname: 'colheaderWI', cellsrenderer: cellsrenderer },
			{ text: 'Severity', datafield: 'Severity', width: '65px', classname: 'colheaderSeverity', cellsrenderer: cellsrenderer, filtertype: 'checkedlist', cellsalign: 'center' },
            { text: 'Case Contact', datafield: 'CaseContact', width: '100px', classname: 'colheaderCaseContact', cellsrenderer: cellsrenderer, filtertype: 'checkedlist' },
            { text: 'Case Title', datafield: 'CaseTitle', classname: 'colheaderCaseTitle', cellsrenderer: cellsrenderer },
			//{ text: 'Customer', datafield: 'Customer', classname: 'colheaderCustomer', cellsrenderer: cellsrenderer, filtertype: 'checkedlist' },
			{ text: 'Updated', datafield: 'Updated', width: '35px', classname: 'colheaderUpdated', filterable: false, cellsrenderer: cellsrenderer, cellsalign: 'center', cellsformat: 'n' },
			{ text: 'Contacted', datafield: 'Contacted', width: '30px', classname: 'colheaderContacted', filterable: false, cellsrenderer: cellsrenderer, cellsalign: 'center', cellsformat: 'n' },
			{ text: 'Product', datafield: 'ProductLine', width: '75px', classname: 'colheaderProduct', cellsrenderer: cellsrenderer, filtertype: 'checkedlist', cellsalign: 'center' },
            //{ text: 'Case Owner', datafield: 'CaseOwnerLogin', width: '87px', classname: 'colheaderCaseOwner', cellsrenderer: cellsrenderer, filtertype: 'checkedlist' },
            { text: 'Case Owner', datafield: 'CaseOwner', width: '87px', classname: 'colheaderCaseOwner', cellsrenderer: cellsrenderer, filtertype: 'checkedlist' },
			{ text: 'Status', datafield: 'Status', width: '100px', classname: 'colheaderStatus', cellsrenderer: cellsrenderer, filtertype: 'checkedlist', cellsalign: 'center' },
			//{ text: 'WIPBin', datafield: 'WIPBin', width: '75px', classname: 'colheaderWIPBin', cellsrenderer: cellsrenderer },
			{ text: 'Created On', datafield: 'CreatedDate', width: '75px', classname: 'colheaderCreatedDate', filterable: false, cellsrenderer: cellsrenderer, cellsalign: 'center', cellsformat: 'n' },
            { text: 'Age', datafield: 'CaseAge', width: '35px', classname: 'colheaderCaseAge', filterable: false, cellsrenderer: cellsrenderer, cellsalign: 'center', cellsformat: 'n' },
            { text: 'DaysOwned', datafield: 'DaysOwned', width: '35px', classname: 'colheaderDaysOwned', filterable: false, cellsrenderer: cellsrenderer, cellsalign: 'center', cellsformat: 'n' },
            { text: 'CaseCentralLink', datafield: 'CaseCentralLink', width: '200px', classname: 'colheaderCaseCentralLink', filterable: false, cellsrenderer: cellsrenderer, cellsformat: 'n' }
        ],
		rendered: function() {
			//console.log("rendered");
			$('.colheaderCreatedOn>div:first-child>div:first-child>span').html('<img src="../inc/v3/images/createdon.png" alt="Created On">');
			$('.colheaderUpdated>div:first-child>div:first-child>span').html('<img src="../inc/v3/images/activity.png" alt="Activity">');
			$('.colheaderContacted>div:first-child>div:first-child>span').html('<img src="../inc/v3/images/contacted.png" alt="Contacted">');
			$('.various').fancybox({Width: 800,Height: 600,fitToView: true,autoSize: false,closeClick: false,openEffect: 'none',closeEffect: 'none'});
		},
		ready: function() {
			//console.log("ready");
			$('div[id^=dropdownlistContent]').text("Filter");
			
			$('#pagerjqxgridResolved>div').append('<input style="float: left; margin-left: 5px; padding: 1px 5px; font-size: .9em;" type="button" value="Export to CSV" id="csvExportResolved" />')
			$("#csvExportResolved").jqxButton({ theme: "metro-lime" });
			$("#csvExportResolved").click(function () {
        		grid.jqxGrid('exportdata', 'csv', 'CaseTherapist');           
    		});
		}
    });			
}