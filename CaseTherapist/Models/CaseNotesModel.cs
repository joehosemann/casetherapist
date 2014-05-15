using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace hapiservice.Models
{
    public class CaseNotesModel
    {
        public string id_number { get; set; }
        public string entry_time { get; set; }
        public string entry_type { get; set; }
        public string notes { get; set; }
    }
}