using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace hapiservice.Helpers
{
    public static class Utilities
    {
        public static int TryIntParse(string value)
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
    }
}