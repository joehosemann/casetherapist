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

        /// <summary>
        /// Returns true if not null and contains at least 1 object.
        /// </summary>
        /// <typeparam name="T">Type for the argument</typeparam>
        /// <param name="ienumerable">input ienumerable</param>
        /// <returns>True/false</returns>
        public static bool IsAny<T>(this IEnumerable<T> ienumerable)
        {
            return ienumerable != null && ienumerable.Any();
        }
    }
}