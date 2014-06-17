using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace hapiservice.Helpers
{
    public class Utilities
    {
        public int TryIntParse(string value)
        {
            int number;
            bool result = Int32.TryParse(value, out number);

            if (result)
            {
                return number;
            }
            else
            {
                return 0;
            }
        }

        ///// <summary>
        ///// Returns true if not null and contains at least 1 object.
        ///// </summary>
        ///// <typeparam name="T">Type for the argument</typeparam>
        ///// <param name="ienumerable">input ienumerable</param>
        ///// <returns>True/false</returns>
        //public bool IsAny<T>(this IEnumerable<T> ienumerable)
        //{
        //    return ienumerable != null && ienumerable.Any();
        //}

        public TimeSpan CombineTimeSpan(string input, TimeSpan existingTimeSpan)
        {
            TimeSpan thisWaitTime;
            TimeSpan.TryParse(input, out thisWaitTime);
            return existingTimeSpan + thisWaitTime;
        }

        public TimeSpan MaxTimeSpan(string input, TimeSpan existingTimeSpan)
        {
            TimeSpan thisWaitTime;
            TimeSpan.TryParse(input, out thisWaitTime);
            if (existingTimeSpan < thisWaitTime)
                return thisWaitTime;
            else
                return existingTimeSpan;
        }

        public int CombineInt(object input, int existingInt)
        {
            int thisQuantity;
            int.TryParse(input.ToString(), out thisQuantity);
            return existingInt + thisQuantity;
        }

        public TimeSpan AverageTimeSpanArray(List<TimeSpan> input)
        {
            //credit: http://stackoverflow.com/questions/8847679/find-average-of-collection-of-timespans
            var averageTicks = Convert.ToInt64(input.Average(timespan => timespan.Ticks));
            return new TimeSpan(averageTicks);
        }

       

        public TimeSpan StringToTimeSpan(string input)
        {
            var result = new TimeSpan();
            TimeSpan.TryParse(input, out result);
            return result;
        }
                

    }
}