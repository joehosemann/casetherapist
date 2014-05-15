using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Dapper;
using hapiservice.Models;

namespace hapiservice.Helpers
{
    public class EmployeeDetails
    {
        public static List<EmployeeDetailModel> ListEmployeeDetails { get; set; }

        public EmployeeDetailModel GetEmployeeDetails(string username)
        {
            if (object.ReferenceEquals(null, ListEmployeeDetails))
            {
                ListEmployeeDetails = new List<EmployeeDetailModel>();
                PopulateList();
            }
            return ListEmployeeDetails.First(x => x.Username.ToLower() == username.ToLower());
        }

        public string GetBusinessUnit(string username)
        {
            if (object.ReferenceEquals(null, ListEmployeeDetails))
            {
                ListEmployeeDetails = new List<EmployeeDetailModel>();
                PopulateList();
            }
            return ListEmployeeDetails.First(x => x.Username.ToLower() == username.ToLower()).BusinessUnit;
        }
       
        public string GetFullName(string username)
        {
            if (object.ReferenceEquals(null, ListEmployeeDetails))
            {
                ListEmployeeDetails = new List<EmployeeDetailModel>();
                PopulateList();
            }
            return ListEmployeeDetails.First(x => x.Username.ToLower() == username.ToLower()).FullName;
        }

        private void PopulateList()
        {
            var newList = new List<EmployeeDetailModel>();

            var query = (@" WITH CTE
                            AS (
	                            SELECT DIMORGANIZATION.ID
		                            ,DIMORGANIZATION.ORGANIZATIONID
		                            ,DIMORGANIZATION.ORGANIZATIONNAME
		                            ,DIMORGANIZATION.PARENTORGID
		                            ,DIMORGANIZATION.ISACTIVE
		                            ,DIMORGANIZATION.ENDPERIODID
		                            ,DIMEMPLOYEE.ID AS EMPLOYEEID
		                            ,DIMEMPLOYEE.FIRSTNAME
		                            ,DIMEMPLOYEE.LASTNAME
									,(select EXTERNALEMPIDENT FROM [BPMAINDB].[dbo].EMPLOYEEDATASOURCE WITH (NOLOCK) WHERE DATASOURCEID = 2 AND EMPLOYEEDATASOURCE.EMPLOYEEID = DIMEMPLOYEE.EMPLOYEEID) as USERNAME
	                            FROM [BPWAREHOUSEDB].[dbo].DIMORGANIZATION WITH (NOLOCK)
	                            INNER JOIN [BPWAREHOUSEDB].[dbo].DIMEMPLOYEEORG WITH (NOLOCK) ON DIMORGANIZATION.ID = DIMEMPLOYEEORG.DIMORGANIZATIONID
	                            INNER JOIN [BPWAREHOUSEDB].[dbo].DIMEMPLOYEE WITH (NOLOCK) ON DIMEMPLOYEE.ID = DIMEMPLOYEEORG.DIMEMPLOYEEID
	                            WHERE DIMEMPLOYEEORG.ENDPERIODID IS NULL
		                            AND DIMEMPLOYEE.ENDPERIODID IS NULL
	
	                            UNION ALL
	
	                            SELECT parent.ID
		                            ,parent.ORGANIZATIONID
		                            ,parent.ORGANIZATIONNAME
		                            ,parent.PARENTORGID
		                            ,parent.ISACTIVE
		                            ,parent.ENDPERIODID
		                            ,child.EMPLOYEEID
		                            ,child.FIRSTNAME
		                            ,child.LASTNAME
		                            ,child.USERNAME
	                            FROM CTE AS child
	                            INNER JOIN [BPWAREHOUSEDB].[dbo].DIMORGANIZATION AS parent WITH (NOLOCK) ON child.PARENTORGID = parent.ID
	                            )
                            SELECT ORGANIZATIONNAME as BusinessUnit
	                            ,FIRSTNAME + ' ' + LASTNAME AS FullName
	                            ,USERNAME as Username
								,EMPLOYEEID
                            FROM CTE
                            WHERE PARENTORGID = 1001"
                );

            using (var connection = Helpers.SqlHelper.GetOpenConnectionBluePumpkin())
            {
                newList.AddRange(connection.Query<EmployeeDetailModel>(query.ToString()));
            }

            ListEmployeeDetails = newList;
        }
    }
}
