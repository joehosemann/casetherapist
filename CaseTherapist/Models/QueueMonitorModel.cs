using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Data.Entity;
using System.Linq;
using System.Web;

namespace hapiservice.Models
{
    public class QueueMonitorModel
    {
        public int CallTypeID { get; set; }
        public int ServiceLevelCallsToday { get; set; }
        public int ServiceLevelCallsOfferedToday { get; set; }
        public int RouterCallsQNow { get; set; }
        public string RouterLongestCallQ { get; set; }
    }
}