using Dapper;
using hapiservice.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using WebApi.OutputCache.V2;

namespace hapiservice.Controllers
{
    public class QueueMonitorController : ApiController
    {
        const string queryString = @"SELECT CallTypeID, ServiceLevelCallsToday, ServiceLevelCallsOfferedToday, RouterCallsQNow, ISNULL(CONVERT(VARCHAR(10), RouterLongestCallQ, 8), '00:00') as RouterLongestCallQ FROM t_Call_Type_Real_Time";

        //[CacheOutput(ServerTimeSpan = 5)]
        //public IEnumerable<QueueMonitorModel> Get()
        //{            
        //    //using (var connection = Helpers.SqlHelper.GetOpenConnectionEZView())
        //    //{                
        //    //    return connection.Query<QueueMonitorModel>(queryString);
        //    //}
        //}
    }

    
}
