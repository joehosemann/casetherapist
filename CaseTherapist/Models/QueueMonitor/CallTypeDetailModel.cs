using System;
namespace hapiservice.Models
{
    public class CallTypeDetailModel
    {       
        public string CallTypeID { get; set; }
        public string ProductID { get; set; }
        public string Product { get; set; }
        public string CallType { get; set; }
        public string Quantity { get; set; }
        public string Offered { get; set; }
        public string Handled { get; set; }
        public string SLAbandoned { get; set; }
        public string PercentLive { get; set; }
        public string AverageAnswer { get; set; }
        public string HandleTime { get; set; }
        public string TalkTime { get; set; }
        public string ServiceLevel { get; set; }

        private string _waitTime = "0:00:00";
        public string WaitTime
        {
            get
            {                
                double dbl;
                if (double.TryParse(_waitTime, out dbl))
                    return TimeSpan.FromSeconds(dbl).ToString(@"h\:mm\:ss");
                else if (_waitTime.Contains(":"))
                    return _waitTime;
                return "0:00:00";
            }
            set
            {
                _waitTime = value;
            }
        }
    }
}