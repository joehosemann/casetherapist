using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace hapiservice.Models
{
    public class QueueActivityModel
    {
        public string Name { get; set; }
        public string AgentState { get; set; }
        public string Reason { get; set; }
        public string TimeInStatus { get; set; }
        public string Extension { get; set; }
        public string IsPrimary { get; set; }
    }
}