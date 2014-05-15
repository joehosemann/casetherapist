using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Web;

namespace hapiservice.Models
{
    public class CaseModel
    {
        public string id_number { get; set; }
        public string WI { get; set; }
        public string Severity { get; set; }
        public string CaseTitle { get; set; }
        public string Customer { get; set; }
        public string CaseContact { get; set; }
        public int Updated { get; set; }
        public int Contacted { get; set; }
        public string ProductLine { get; set; }
        public string CaseOwnerLogin { get; set; }
        public string CaseOwner { get; set; }
        public string Status { get; set; }
        public string WIPBin { get; set; }  
        public string CreatedDate { get; set; }
        public int CaseAge { get; set; }
        public int DaysOwned { get; set; }
        public string CaseCentralLink { get; set; }
    }
    
}