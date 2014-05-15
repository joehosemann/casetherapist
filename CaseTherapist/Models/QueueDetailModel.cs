using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Web;

namespace hapiservice.Models
{
    public class QueueDetailModel
    {
        public int CallTypeID { get; set; } // CallTypeID: ID of the Queue
        public string ProductName { get; set; }
        public string ProductShortName { get; set; }
        public string QueueType { get; set; } // QueueType: CL, PH, CB, DN
        public string TeamName { get; set; } // ECBU, GMBU, GMAP, ECAP
        public int IsDisabled { get; set; }
    }
    //public class QueueDetailModelContext : DbContext
    //{
    //    public DbSet<QueueDetailModel> QueueDetails { get; set; }
    //}
}