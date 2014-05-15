using hapiservice.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Net.Http;
using System.Web.Http;
using Dapper;
using System.Text;
using System.Web.Mvc;

namespace hapiservice.Controllers
{
    public class IssueWIController : ApiController //EntitySetController<CaseModel, int>
    {
        public IEnumerable<IssueWIModel> Get([FromUri] string type, string param)
        {
            bool validParamters = true;

            var sbQuery = new StringBuilder();

            sbQuery.Append(@"SELECT DISTINCT ");
            sbQuery.Append(@"wi.workitemid AS WI, ");
            sbQuery.Append(@"clarify.CaseNumber AS CASEID, ");
            sbQuery.Append(@"clarify.Title as TITLE, ");
            sbQuery.Append(@"client.Name as CLIENTNAME, ");
            sbQuery.Append(@"REPLACE(wi.state, 'Opportunity Assessment', 'OA') AS WISTATE, ");
            sbQuery.Append(@"wi.REASON AS WICLOSEREASON, ");
            sbQuery.Append(@"tfs.ASSIGNEDTO as WIASSIGNEDTO, ");
            sbQuery.Append(@"casestatus.status as CASESTATUS, ");
            sbQuery.Append(@"LEFT(tfs.closeddate,11) as WICLOSEDATE, ");
            sbQuery.Append(@"dim_user.LogIn as ANALYST ");
            sbQuery.Append(@"FROM [BBEC_SUPPORT].[dbo].[usr_tfs_currentworkitem] AS tfs ");
            sbQuery.Append(@"INNER JOIN (SELECT workitemid, MAX(tfs_id) AS tfsid FROM [BBEC_SUPPORT].[dbo].[usr_tfs_workitem] GROUP BY workitemid) AS tfswi ON tfswi.workitemid = tfs.workitemid ");
            sbQuery.Append(@"INNER JOIN (SELECT reason, workitemid, title, state, type, tfs_id FROM [BBEC_SUPPORT].[dbo].[usr_tfs_workitem]) AS wi ON tfswi.tfsid = wi.tfs_id ");
            sbQuery.Append(@"INNER JOIN [CLARIFYDW].[DBO].[fact_case] AS clarify ON REPLACE(REPLACE(clarify.cqticket, 'http://chs-tfsapp1:8090/wi.aspx?id=', ''), 'WI ', '') = CAST(tfs.workitemid AS VARCHAR(50)) ");
            sbQuery.Append(@"INNER JOIN [CLARIFYDW].[dbo].[dim_product] AS prod ON clarify.productid = prod.id ");
            sbQuery.Append(@"INNER JOIN [CLARIFYDW].[DBO].[DIM_USER] AS dim_user on dim_user.id = clarify.owneruserid ");
            sbQuery.Append(@"INNER JOIN [CLARIFYDW].[DBO].[DIM_CASESTATUS] as casestatus on casestatus.id = clarify.casestatusid ");
            sbQuery.Append(@"INNER JOIN [CLARIFYDW].[DBO].[DIM_CONTACT] as casecontact on casecontact.id = clarify.contactid ");
            sbQuery.Append(@"INNER JOIN [CLARIFYDW].[DBO].[DIM_SITE] as client on casecontact.primarysiteid = client.id ");
            sbQuery.Append(@"INNER JOIN [CLARIFYDW].[dbo].[DIM_USER] as super on super.FullName = dim_user.Supervisor ");            
            sbQuery.Append(@"WHERE ");    

            switch (type)
            {
                case "supervisor":
                    sbQuery.Append(@"super.LogIn = @param ");
                    break;
                case "analyst":
                    sbQuery.Append(@"dim_user.LogIn = @param ");
                    break;
                case "site":
                    sbQuery.Append(@"client.SiteID = @param ");
                    break;
                default:
                    validParamters = false;
                    break;
            }

            sbQuery.Append(@"AND wi.state IN ( 'Deleted', 'Closed' )  ");
            sbQuery.Append(@"AND casestatus.status NOT IN ('Closed') ");
            sbQuery.Append(@"AND clarify.cqticket IS NOT NULL ");
            sbQuery.Append(@"AND clarify.cqticket NOT LIKE 'KDEV%' ");
            sbQuery.Append(@"AND clarify.cqticket NOT LIKE 'Track%' ");
            sbQuery.Append(@"AND clarify.cqticket NOT IN ( '' ) ");
            sbQuery.Append(@"AND clarify.ResolvedFlag != '1' ");
            sbQuery.Append(@"order by client.Name");   

            if (validParamters == false)
            {
                return null;
            }
            else
            {
                using (var connection = Helpers.SqlHelper.GetOpenConnectionBBECDB())
                {
                    return connection.Query<IssueWIModel>(sbQuery.ToString(), new { param = param });
                }               
            }
        }


        //http://mvcjquerydatatables.apphb.com/
        //public DataTablesResult<IEnumerable<CaseModel>> GetUsers(string type, int workable, int resolved, string param)
        //{
        //    var result = Get(type, workable, resolved, param).AsQueryable();

        //    return DataTablesResult.Create(result,

        //}
    }
}