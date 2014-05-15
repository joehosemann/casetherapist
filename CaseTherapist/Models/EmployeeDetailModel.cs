using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Web;

namespace hapiservice.Models
{
    public class EmployeeDetailModel
    {
        public string BusinessUnit { get; set; }
        public string FullName { get; set; }
        public string Username { get; set; }
        public string FullNameNoSpaces { get { return Regex.Replace(FullName, "[^a-zA-Z0-9]+", "", RegexOptions.Compiled); } }
    }

    
}