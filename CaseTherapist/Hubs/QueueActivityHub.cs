using Dapper;
using hapiservice.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace hapiservice.Hubs
{
    public class QueueActivityHub
    {
        public void GetQueueActivity(string username)
        {
            IEnumerable<QueueActivityModel> list;
            var extension = new hapiservice.Controllers.MapClarifyUserToCiscoExtension().GetExtension(username.ToLower());
            var query = @"SELECT DISTINCT tP.FirstName + ' ' + tP.LastName AS NAME
	                        ,CASE tART.AgentState
		                        WHEN 2
			                        THEN 'Not Ready'
		                        WHEN 3
			                        THEN 'Ready'
		                        WHEN 4
			                        THEN 'Talking'
		                        WHEN 5
			                        THEN 'Work Not Ready'
		                        WHEN 6
			                        THEN 'Work Ready'
		                        WHEN 10
			                        THEN 'Hold'
		                        ELSE 'Unknown'
		                        END AS AgentState
	                        ,CASE tRC.ReasonText
		                        WHEN 'Undefined'
			                        THEN ''
		                        ELSE tRC.ReasonText
		                        END AS Reason
	                        ,convert(VARCHAR, DATEADD(s, datediff(s, tART.DateTimeLastStateChange, getdate()), 0), 108) AS TimeInStatus
                            ,tART.Extension AS Extension
                            ,CASE WHEN tART.Extension = @extension THEN 'true' ELSE 'false' END as IsPrimary
                        FROM t_Agent_Real_Time tART WITH (NOLOCK)
                        JOIN t_Person tP WITH (NOLOCK) ON tART.Extension = tP.LoginName
                        JOIN t_Agent_Skill_Group_Real_Time tASGRT WITH (NOLOCK) ON tASGRT.SkillTargetID = tART.SkillTargetID
                        LEFT JOIN t_Reason_Code tRC WITH (NOLOCK) ON tRC.ReasonCode = tART.ReasonCode
                        JOIN (
	                        SELECT tASGRTind.SkillGroupSkillTargetID
	                        FROM t_Agent_Skill_Group_Real_Time tASGRTind WITH (NOLOCK)
	                        JOIN t_Agent_Real_Time tARTind WITH (NOLOCK) ON tARTind.SkillTargetID = tASGRTind.SkillTargetID
	                        WHERE tASGRTind.SkillGroupSkillTargetID NOT IN ('5000','5124','6213','6214')
		                        AND tARTind.Extension = @extension
	                        ) bla ON bla.SkillGroupSkillTargetID = tASGRT.SkillGroupSkillTargetID";

            using (var connection = Helpers.SqlHelper.GetOpenConnectionEZView())
            {
                if (connection.State == System.Data.ConnectionState.Open)
                    list = connection.Query<QueueActivityModel>(query.ToString(), new { extension = extension });
                else
                    list = new List<QueueActivityModel>();
            }

        }

    }
}