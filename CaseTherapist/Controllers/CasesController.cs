using Dapper;
using hapiservice.Helpers;
using hapiservice.Models;
using System.Collections.Generic;
using System.Text;
using System.Web.Http;

namespace hapiservice.Controllers
{
    public class CasesController : ApiController //EntitySetController<CaseModel, int>
    {
        public IEnumerable<CaseModel> Get([FromUri] string type, int workable, int resolved, string param, string businessUnit = "ecbu")
        {
            bool validParamters = true;
            var ecbuNonWorkableStatuses = Properties.Settings.Default.caseStatusNonWorkableECBU;
            var gmbuNonWorkableStatuses = Properties.Settings.Default.caseStatusNonWorkableGMBU;

            var sbQuery = new StringBuilder();
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
             * STATUS
             * WIPBin
             * CreatedDate
             * CaseAge
             * CaseCentralLink
             */

            sbQuery.Append(@"SELECT DISTINCT tc.id_number
	                        ,ISNULL(replace(tc.x_CQticket, 'http://chs-tfsapp1:8090/wi.aspx?id=', ''), '') AS WI
	                        ,replace(replace(severity.ref_id, ' - ANF', ''), 'Non-Critical/Quest', 'Quest') AS Severity
                            ,(table_contact.first_name + ' ' + table_contact.last_name) AS CaseContact
	                        ,replace(tc.title, ',','') AS CaseTitle
	                        ,tc.x_customer as Customer
	                        ,(
		                        SELECT datediff(dd, tae.entry_time, GETDATE()) - (datediff(wk, tae.entry_time, GETDATE()) * 2) - CASE 
				                        WHEN datepart(dw, tae.entry_time) = 1
					                        THEN 1
				                        ELSE 0
				                        END + CASE 
				                        WHEN datepart(dw, GETDATE()) = 1
					                        THEN 1
				                        ELSE 0
				                        END
		                        ) AS Updated
	                        ,(
		                        SELECT min(Days)
		                        FROM (
			                        (
				                        SELECT isnull((
							                        SELECT datediff(dd, max(TEL.stop_time), GETDATE()) - (datediff(wk, max(TEL.stop_time), GETDATE()) * 2) - CASE 
									                        WHEN datepart(dw, max(TEL.stop_time)) = 1
										                        THEN 1
									                        ELSE 0
									                        END + CASE 
									                        WHEN datepart(dw, GETDATE()) = 1
										                        THEN 1
									                        ELSE 0
									                        END
							                        ), 999) AS Days
				                        FROM table_email_log AS TEL WITH (NOLOCK)
				                        WHERE TEL.case_email2case = TC.objid
					                        AND TEL.action_type = 'External email'
				                        )
			
			                        UNION
			
			                        (
				                        SELECT isnull((
							                        SELECT datediff(dd, max(TPL.x_time_end), GETDATE()) - (datediff(wk, max(TPL.x_time_end), GETDATE()) * 2) - CASE 
									                        WHEN datepart(dw, max(TPL.x_time_end)) = 1
										                        THEN 1
									                        ELSE 0
									                        END + CASE 
									                        WHEN datepart(dw, GETDATE()) = 1
										                        THEN 1
									                        ELSE 0
									                        END
							                        ), 999)
				                        FROM table_phone_log AS TPL WITH (NOLOCK)
				                        WHERE TPL.case_phone2case = TC.objid
					                        AND TPL.action_type IN (");
            switch (businessUnit.ToLower())
            {
                case "gmbu":
                    sbQuery.Append(Properties.Settings.Default.caseProactiveContact);
                    break;
                default:
                    sbQuery.Append(Properties.Settings.Default.caseProactiveContact);
                    break;
            }
            sbQuery.Append(@"))
			
			                        UNION
			
			                        (
				                        SELECT isnull((
							                        SELECT datediff(dd, max(TNL.creation_time), GETDATE()) - (datediff(wk, max(TNL.creation_time), GETDATE()) * 2) - CASE 
									                        WHEN datepart(dw, max(TNL.creation_time)) = 1
										                        THEN 1
									                        ELSE 0
									                        END + CASE 
									                        WHEN datepart(dw, GETDATE()) = 1
										                        THEN 1
									                        ELSE 0
									                        END
							                        ), 999)
				                        FROM table_notes_log AS TNL WITH (NOLOCK)
				                        WHERE TNL.case_notes2case = TC.objid
					                        AND TNL.action_type = 'Outgoing Email'
				                        )
			                        ) AS LastContact
		                        ) AS Contacted
	                        ,tc.x_line AS ProductLine
	                        ,caseowner.login_name AS CaseOwnerLogin
                            ,(employee.first_name + ' ' + employee.last_name) AS CaseOwner
	                        ,STATUS.title AS Status
	                        ,wip.title AS WIPBin
                            ,convert(char(10), tc.creation_time, 101) as CreatedDate
	                        ,datediff(day, tc.creation_time, GETDATE()) AS CaseAge
                            ,DATEDIFF(day,tae.entry_time,getdate()) as DaysOwned
                            ,('http://www.blackbaud.com/casecentral/Default.aspx/CID=' + tc.id_number ) AS CaseCentralLink
                        FROM table_case AS tc WITH (NOLOCK)
                        CROSS APPLY (
	                        SELECT TOP 1 *
	                        FROM table_act_entry WITH (NOLOCK)
	                        WHERE table_act_entry.act_entry2case = tc.[objid]
	                        ORDER BY table_act_entry.entry_time DESC
	                        ) tae
                        LEFT JOIN table_contact WITH (NOLOCK) ON tc.case_reporter2contact = table_contact.[objid]
                        LEFT JOIN table_user AS caseowner WITH (NOLOCK) ON tc.case_owner2user = caseowner.[objid]
                        LEFT JOIN table_user AS originator WITH (NOLOCK) ON tc.case_originator2user = originator.[objid]
                        LEFT JOIN table_condition WITH (NOLOCK) ON tc.case_state2condition = table_condition.[objid]
                        LEFT JOIN table_gbst_elm AS severity WITH (NOLOCK) ON tc.respsvrty2gbst_elm = severity.[objid]
                        LEFT JOIN table_gbst_elm AS STATUS WITH (NOLOCK) ON tc.casests2gbst_elm = [status].[objid]
                        LEFT JOIN table_site WITH (NOLOCK) ON tc.case_reporter2site = table_site.[objid]
                        LEFT JOIN table_address WITH (NOLOCK) ON tc.case2address = table_address.[objid]
                        LEFT JOIN table_x_site_em_tam WITH (NOLOCK) ON table_x_site_em_tam.x_site_em_tam2site = table_site.[objid]
                        LEFT JOIN table_employee AS employee WITH (NOLOCK) ON caseowner.[objid] = employee.employee2user
                        LEFT JOIN table_employee AS supervisoremp WITH (NOLOCK) ON employee.emp_supvr2employee = supervisoremp.[objid]
						LEFT JOIN table_user as supervisor with (NOLOCK) ON supervisoremp.employee2user = supervisor.[objid]
                        LEFT JOIN table_status_chg WITH (NOLOCK) ON tc.[objid] = table_status_chg.case_status_chg2case
                        LEFT JOIN table_wipbin wip WITH (NOLOCK) ON wip.objid = tc.case_wip2wipbin
                        WHERE ");

            switch (type.ToLower())
            {
                case "supervisor":
                    sbQuery.Append(@"supervisor.login_name = @param ");
                    break;
                case "analyst":
                    sbQuery.Append(@"caseowner.login_name = @param ");
                    break;
                case "site":
                    sbQuery.Append(@"table_site.site_id = @param AND (employee.work_group like 'team%' OR employee.work_group like '%lead%' OR employee.work_group like '%support%') ");
                    break;
                case "witocase":
                    sbQuery.Append(@"ISNULL(replace(tc.x_CQticket,'http://chs-tfsapp1:8090/wi.aspx?id=',''),'') = @param ");
                    break;
                case "tam":
                    sbQuery.Append(@"table_site.site_id = @param AND (employee.work_group like 'team%' OR employee.work_group like '%lead%' OR employee.work_group like '%support%') ");
                    break;
                case "tamclosed":
                    // figure its better to add this as an exception than to add another parameter to the endpoint.
                    sbQuery.Append(@"table_site.site_id = @param AND (employee.work_group like 'team%' OR employee.work_group like '%lead%' OR employee.work_group like '%support%') 
                                     -- Last 30 days of closed cases
                                     AND table_condition.title = 'Closed'                                      
                                     AND datediff(dd, table_condition.queue_time, getdate()) < 30 ");
                    break;
                default:
                    validParamters = false;
                    break;
            }


            if (type == "tamclosed")
            {
                sbQuery.Append(@"AND (table_condition.title NOT IN ('','Closed-Admin Pending') ");
            }
            else
            {
                sbQuery.Append(@"AND (table_condition.title NOT IN ('','Closed','Closed-Admin Pending') ");
            }

            switch (resolved)
            {
                case 0:
                    sbQuery.Append(@"AND (tc.x_resolved_flag != 1 OR tc.x_resolved_flag is NULL) ");
                    break;
                case 1:
                    sbQuery.Append(@"AND (tc.x_resolved_flag = 1) ");
                    break;
                default:
                    break;
            }

            switch (workable)
            {
                case 0:
                    if (businessUnit.ToLower() == "gmbu")
                        sbQuery.Append(@"AND [status].title IN (" + gmbuNonWorkableStatuses + ")) ");
                    else //ECBU
                        sbQuery.Append(@"AND ([status].title IN (" + ecbuNonWorkableStatuses + ") OR [status].title ='Awaiting Hosting Services' AND dateadd(day, 3,table_status_chg.creation_time) < getdate())) ");
                    break;
                case 1:
                    if (businessUnit.ToLower() == "gmbu")
                        sbQuery.Append(@"AND [status].title NOT IN (" + gmbuNonWorkableStatuses + ")) ");
                    else //ECBU
                        sbQuery.Append(@"AND ([status].title NOT IN (" + ecbuNonWorkableStatuses + ") OR [status].title ='Awaiting Hosting Services' AND dateadd(day, 3,table_status_chg.creation_time) > getdate()))  ");
                    break;
                default:
                    sbQuery.Append(@") ");
                    break;
            }

            // 11/13 JH- Removing case types Customized Software to accomidate DSS requests.
            if (type != "tam")
            {
                sbQuery.Append(@"AND tc.x_casetype != 'Customized Software' ");
            }

            sbQuery.Append(@"AND caseowner.[status] = 1 ORDER BY Severity asc, Contacted desc");


            if (validParamters == false)
            {
                return null;
            }
            else
            {
                using (var connection = Helpers.SqlHelper.GetOpenConnectionClarify())
                {
                    return connection.Query<CaseModel>(sbQuery.ToString(), new { param = param });
                }
            }


        }
    }
}