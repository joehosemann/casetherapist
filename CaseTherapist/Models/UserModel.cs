using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace hapiservice.Models
{
    public class UserModel
    {
        public string ClarifyUsername { get; set; }
        public string CiscoExtension { get; set; }
        public string BusinessUnit { get; set; }
        public string ChangedByIP { get; set; }
        public string BluePumpkinUsername { get; set; }
        public string InactiveQueueBG { get; set; }
        public string InactiveQueueFG { get; set; }
        public string InactiveCallTypeBG { get; set; }
        public string InactiveCallTypeFG { get; set; }
        public string ActiveQueueBG { get; set; }
        public string ActiveQueueFG { get; set; }
        public string ActiveCallTypeBG { get; set; }
        public string ActiveCallTypeFG { get; set; }

    }
}