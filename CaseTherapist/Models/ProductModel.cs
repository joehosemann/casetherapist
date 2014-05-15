using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Data.Entity;
using System.Linq;
using System.Web;

namespace hapiservice.Models
{
    public class ProductModel
    {
        [Key]
        public string LongName { get; set; }
        public string ShortName { get; set; }
        public int IsDisabled { get; set; }
        public ICollection<QueueMonitorModel> Queues { get; set; }      
       
    }
}