using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace hapiservice.Models
{
    public class IssueWIModel
    {
        public string WI { get; set; }
        public string CASEID { get; set; }
        public string TITLE { get; set; }
        public string CLIENTNAME { get; set; }
        public string WISTATE { get; set; }
        public string WICLOSEREASON { get; set; }
        public string WIASSIGNEDTO { get; set; }
        public string CASESTATUS { get; set; }
        public string WICLOSEDATE { get; set; }
        public string ANALYST { get; set; }
    }
}