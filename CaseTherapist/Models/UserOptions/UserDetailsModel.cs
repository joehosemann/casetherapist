using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace hapiservice.Models
{
    public class UserDetailsModel
    {
        public string ClarifyUsername { get; set; }
        public string CiscoExtension { get; set; }
        public string BusinessUnit { get; set; }
        public string BluePumpkinUsername { get; set; }
        public string ApplicationBG { get; set; }
        public string QueueBG { get; set; }
        public string QueueFG { get; set; }
        public string InactiveCallTypeBG { get; set; }
        public string InactiveCallTypeFG { get; set; }
        public string ActiveCallTypeBG { get; set; }
        public string ActiveCallTypeFG { get; set; }
        public string ExtendedCallTypeBG { get; set; }
        public string ExtendedCallTypeFG { get; set; }
    }
}