using Dapper;
using hapiservice.Helpers;
using hapiservice.Models;
using System.Collections.Generic;
using System.Web.Http;

namespace hapiservice.Controllers
{
    public class CasesNotesController : ApiController
    {
        // Required
        public string OptionsCaseNotes()
        {
            return null;
        }

        public IEnumerable<CaseNotesModel> Get([FromUri] string param)
        {
            var strQuery = @"SELECT table_case.id_number
	                            ,tae.focus_strid AS entry_type
	                            ,tae.entry_time
	                            ,(CONVERT(VARCHAR(max), ISNULL(table_email_log.message, '')) + CONVERT(VARCHAR(max), ISNULL(table_notes_log.description, '')) + CONVERT(VARCHAR(max), ISNULL(table_notes_log.internal, '')) + CONVERT(VARCHAR(max), ISNULL(table_notes_log.x_external, '')) + CONVERT(VARCHAR(max), ISNULL(table_phone_log.internal, '')) + CONVERT(VARCHAR(max), ISNULL(table_phone_log.x_external, ''))) AS notes
                            FROM table_act_entry AS tae WITH (NOLOCK)
                            INNER JOIN table_case WITH (NOLOCK) ON table_case.objid = tae.act_entry2case
                            LEFT JOIN table_email_log WITH (NOLOCK) ON table_email_log.objid = tae.act_entry2email_log
                            LEFT JOIN table_notes_log WITH (NOLOCK) ON table_notes_log.objid = tae.act_entry2notes_log
                            LEFT JOIN table_phone_log WITH (NOLOCK) ON table_phone_log.objid = tae.act_entry2phone_log
                            WHERE table_case.id_number = @param
	                            AND ISNULL(tae.focus_strid, '') != ('')
	                            AND tae.addnl_info != ''";

            using (var connection = Helpers.SqlHelper.GetOpenConnectionClarify())
            {
                return connection.Query<CaseNotesModel>(strQuery, new { param = param });
            }

        }


    }
}