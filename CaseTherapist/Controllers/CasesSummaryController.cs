using Dapper;   
using hapiservice.Helpers;
using hapiservice.Models;
using System.Collections.Generic;
using System.Web.Http;

namespace hapiservice.Controllers
{
    public class CasesSummaryController : ApiController
    {
        // Required
        public string OptionsCaseSummary()
        {
            return null;
        }

        private static string casesStatusNonWorkableGMBU = Properties.Settings.Default.caseStatusNonWorkableGMBU;
        private static string casesStatusNonWorkableECBU = Properties.Settings.Default.caseStatusNonWorkableECBU;
       
        public IEnumerable<CaseSummaryModel> Get([FromUri] string param, string businessUnit)
        {
            string status = "";
            string titleproblem = "";
            string titlecritical = "";

            if (businessUnit.ToLower() == "gmbu")
            {
                status = casesStatusNonWorkableGMBU;
            }
            else
            {
                status = casesStatusNonWorkableECBU;
                titleproblem = " OR (TGE2.title ='Awaiting Hosting Services' AND dateadd(day, 3,TSC2.creation_time) > getdate()) ";
                titlecritical = " OR (TGE3.title ='Awaiting Hosting Services' AND dateadd(day, 3,TSC3.creation_time) > getdate()) ";
            }
            
            
            var strQuery = string.Format(@"DECLARE @getdate DATETIME
                            SET @getdate = getdate()
                            SELECT TU.login_name AS Analyst
	                            ,(
		                            SELECT count(1)
		                            FROM table_case TC1 WITH (NOLOCK)
		                            INNER JOIN table_user TU1 WITH (NOLOCK) ON TU1.objid = TC1.case_owner2user
		                            INNER JOIN table_gbst_elm TGE1 WITH (NOLOCK) ON TGE1.objid = TC1.casests2gbst_elm
		                            WHERE TC1.case_wip2wipbin IS NOT NULL
			                            AND TC1.x_casetype NOT IN (
				                            'Esc- Support'
				                            ,'CRel - Wellness'
				                            ,'BB Analytics'
				                            ,'Training Registration'
				                            ,'Training'
				                            ,'Customized Software'
				                            )
			                            AND TU1.login_name = TU.login_name
			                            AND TGE1.title NOT IN ('File CR')
		                            ) AS AllCases
	                            ,(
		                            SELECT count(DISTINCT TC2.id_number)
		                            FROM table_case TC2 WITH (NOLOCK)
		                            INNER JOIN table_user TU2 WITH (NOLOCK) ON TU2.objid = TC2.case_owner2user
		                            INNER JOIN table_gbst_elm TGE2 WITH (NOLOCK) ON TGE2.objid = TC2.casests2gbst_elm
		                            INNER JOIN table_status_chg TSC2 WITH (NOLOCK) ON TC2.objid = TSC2.case_status_chg2case
		                            WHERE TC2.case_wip2wipbin IS NOT NULL
			                            AND TC2.x_casetype NOT IN (
				                            'Esc- Support'
				                            ,'CRel - Wellness'
				                            ,'BB Analytics'
				                            ,'Training Registration'
				                            ,'Training'
				                            ,'Customized Software'
				                            )
			                            AND (
				                            TGE2.title NOT IN (
                                                    {0}
                                                )
                                               {1}
				                            )
			                            AND TU2.login_name = TU.login_name
			                            AND (
				                            TC2.x_resolved_flag != 1
				                            OR TC2.x_resolved_flag IS NULL
				                            )
		                            ) AS Workable
	                            ,(
		                            SELECT count(DISTINCT tc3.id_number)
		                            FROM table_case TC3 WITH (NOLOCK)
		                            INNER JOIN table_user TU3 WITH (NOLOCK) ON TU3.objid = TC3.case_owner2user
		                            INNER JOIN table_gbst_elm TGE3 WITH (NOLOCK) ON TGE3.objid = TC3.casests2gbst_elm
		                            INNER JOIN table_gbst_elm SEVERITY3 WITH (NOLOCK) ON TC3.respsvrty2gbst_elm = SEVERITY3.objid
		                            INNER JOIN table_status_chg TSC3 WITH (NOLOCK) ON TC3.objid = TSC3.case_status_chg2case
		                            WHERE TC3.case_wip2wipbin IS NOT NULL
			                            AND TC3.x_casetype NOT IN (
				                            'Esc- Support'
				                            ,'CRel - Wellness'
				                            ,'BB Analytics'
				                            ,'Training Registration'
				                            ,'Training'
				                            ,'Customized Software'
				                            )
			                            AND SEVERITY3.title IN (
				                            'Down'
				                            ,'Critical - ANF'
				                            )
			                            AND (
				                            TGE3.title NOT IN (
                                                    {0}
                                                )
                                                {2}
				                            )
			                            AND TU3.login_name = TU.login_name
			                            AND (
				                            TC3.x_resolved_flag != 1
				                            OR TC3.x_resolved_flag IS NULL
				                            )
		                            ) AS DownCritical
	                            ,(
		                            SELECT count(1)
		                            FROM table_case TC4 WITH (NOLOCK)
		                            INNER JOIN table_user TU1 WITH (NOLOCK) ON TU1.objid = TC4.case_owner2user
		                            INNER JOIN table_gbst_elm TGE1 WITH (NOLOCK) ON TGE1.objid = TC4.casests2gbst_elm
		                            WHERE TC4.case_wip2wipbin IS NOT NULL
			                            AND TC4.x_casetype NOT IN (
				                            'Esc- Support'
				                            ,'CRel - Wellness'
				                            ,'BB Analytics'
				                            ,'Training Registration'
				                            ,'Training'
				                            ,'Customized Software'
				                            )
			                            AND TU1.login_name = TU.login_name
			                            AND TC4.x_resolved_flag = 1
		                            ) AS Resolved
	                            ,(
		                            SELECT count(1)
		                            FROM table_case TC5 WITH (NOLOCK)
		                            INNER JOIN table_act_entry TAE5 WITH (NOLOCK) ON TAE5.act_entry2case = TC5.objid
			                            AND TAE5.act_code = 100
		                            INNER JOIN table_user CSAACCEPT5 WITH (NOLOCK) ON TAE5.act_entry2user = CSAACCEPT5.objid
			                            AND CSAACCEPT5.STATUS = 1
		                            WHERE TAE5.entry_time > CAST(FLOOR(CAST(@GETDATE AS FLOAT)) AS DATETIME)
			                            AND CSAACCEPT5.login_name = TU.login_name
		                            ) AS AcceptedToday
	                            ,(
		                            SELECT count(1)
		                            FROM table_case TC6 WITH (NOLOCK)
		                            INNER JOIN table_user TU6 WITH (NOLOCK) ON TU6.objid = TC6.case_originator2user
		                            WHERE TC6.creation_time > CAST(FLOOR(CAST(@GETDATE AS FLOAT)) AS DATETIME)
			                            AND TU6.login_name = TU.login_name
		                            ) AS CreatedToday
	                            ,(
		                            SELECT count(DISTINCT (TC7.id_number))
		                            FROM table_case TC7 WITH (NOLOCK)
		                            INNER JOIN table_act_entry TAE7 WITH (NOLOCK) ON TAE7.act_entry2case = TC7.objid
			                            AND TAE7.act_code = 4100
		                            INNER JOIN table_user CSAYANK7 WITH (NOLOCK) ON TAE7.act_entry2user = CSAYANK7.objid
			                            AND CSAYANK7.STATUS = 1
		                            WHERE TAE7.entry_time > CAST(FLOOR(CAST(@GETDATE AS FLOAT)) AS DATETIME)
			                            AND CSAYANK7.login_name = TU.login_name
		                            ) AS YankedToday
	                            ,(
		                            SELECT count(1)
		                            FROM table_case TC8 WITH (NOLOCK)
		                            INNER JOIN table_act_entry TAE8 WITH (NOLOCK) ON TAE8.act_entry2case = TC8.objid
			                            AND TAE8.act_code = 2400
		                            INNER JOIN table_user CSAREOPEN8 WITH (NOLOCK) ON TAE8.act_entry2user = CSAREOPEN8.objid
			                            AND CSAREOPEN8.STATUS = 1
		                            WHERE TAE8.entry_time > CAST(FLOOR(CAST(@GETDATE AS FLOAT)) AS DATETIME)
			                            AND CSAREOPEN8.login_name = TU.login_name
		                            ) AS ReopenToday
                            FROM table_user TU WITH (NOLOCK)
                            WHERE TU.login_name IN (
		                            SELECT TU.login_name
		                            FROM table_employee TE WITH (NOLOCK)
		                            INNER JOIN table_user TU WITH (NOLOCK) ON TE.employee2user = TU.objid
			                            AND TU.STATUS = 1
		                            INNER JOIN table_employee SUPER WITH (NOLOCK) ON TE.emp_supvr2employee = SUPER.objid
		                            INNER JOIN table_user TUSUPER WITH (NOLOCK) ON TUSUPER.objid = SUPER.employee2user
		                            WHERE TUSUPER.login_name = @param
		                            )
                            ORDER BY 1 ", status, titleproblem, titlecritical);

            using (var connection = Helpers.SqlHelper.GetOpenConnectionClarify())
            {
                return connection.Query<CaseSummaryModel>(strQuery, new { param = param });
            }

        }
    }
}