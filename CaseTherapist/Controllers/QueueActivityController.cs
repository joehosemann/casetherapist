using Dapper;
using hapiservice.Helpers;
using hapiservice.Models;
using System.Collections.Generic;
using System.Web.Http;
using System.Linq;
using System.Text;

namespace hapiservice.Controllers
{
    public class QueueActivityController : ApiController
    {
        public IEnumerable<QueueActivityModel> Get([FromUri] string username)
        {
                var extension = new MapClarifyUserToCiscoExtension().GetExtension(username.ToLower());
                var sbQuery = new StringBuilder();

                sbQuery.Append(@"SELECT DISTINCT tP.FirstName + ' ' + tP.LastName AS NAME
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
	                        ) bla ON bla.SkillGroupSkillTargetID = tASGRT.SkillGroupSkillTargetID");

                using (var connection = Helpers.SqlHelper.GetOpenConnectionEZView())
                {
                    if (connection.State == System.Data.ConnectionState.Open)
                        return connection.Query<QueueActivityModel>(sbQuery.ToString(), new { extension = extension });
                    else
                        return new List<QueueActivityModel>();
                }

        }
    }
    public class MapClarifyUserToCiscoExtension
    {
        private static List<MapClarifyUserToCiscoExtensionModel> clarifyUserToExtension { get; set; }

        /// <summary>
        /// Returns EZView extension from Clarify username
        /// </summary>
        /// <param name="clarifyUsername">Clarify username</param>
        /// <returns>EZView extension</returns>
        public string GetExtension(string clarifyUsername)
        {
            if (object.ReferenceEquals(null, clarifyUserToExtension))
            {
                clarifyUserToExtension = new List<MapClarifyUserToCiscoExtensionModel>();
                PopulateList();
            }
            return clarifyUserToExtension.First(x => x.ClarifyUsername.ToLower() == clarifyUsername).CiscoExtension;
        }

        /// <summary>
        /// Returns Clarify username from EZView extension
        /// </summary>
        /// <param name="ciscoExtension">EZView extension</param>
        /// <returns>Clarify username</returns>
        public string GetUsername(string ciscoExtension)
        {
            if (object.ReferenceEquals(null, clarifyUserToExtension))
            {
                clarifyUserToExtension = new List<MapClarifyUserToCiscoExtensionModel>();
                PopulateList();
            }
            return clarifyUserToExtension.First(x => x.CiscoExtension == ciscoExtension).ClarifyUsername.ToLower();
        }

        private void PopulateList()
        {
            var query = (@"SELECT table_user.login_name as ClarifyUsername, table_employee.phone as CiscoExtension
                                FROM table_employee with (nolock)
                                inner join table_user with (nolock) on table_user.objid = table_employee.employee2user
                                where table_employee.phone != ''");

            using (var connection = Helpers.SqlHelper.GetOpenConnectionClarify())
            {
                clarifyUserToExtension.AddRange(connection.Query<MapClarifyUserToCiscoExtensionModel>(query.ToString()));
            }
        }
    }

    public class MapClarifyUserToCiscoExtensionModel
    {
        public string ClarifyUsername { get; set; }
        public string CiscoExtension { get; set; }
    }
}
