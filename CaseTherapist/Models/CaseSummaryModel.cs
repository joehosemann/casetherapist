using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace hapiservice.Models
{
    public class CaseSummaryModel
    {
        public string Analyst { get; set; }
        public int AllCases {get; set;}
        public int Workable { get; set; }
        public int DownCritical { get; set; }
        public int Resolved { get; set; }
        public int AcceptedToday { get; set; }
        public int CreatedToday { get; set; }
        public int YankedToday { get; set; }
        public int ReopenToday { get; set; }
    }
}