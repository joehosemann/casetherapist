using Dapper;
using hapiservice.Helpers;
using hapiservice.Models;
using Microsoft.AspNet.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace hapiservice.Hubs
{
    public class QueueMonitorHub : Hub
    {

        public void GetSubscriptions(string clarifyUsername)
        {
            IEnumerable<GetSubscriptionsModel> result;

            var sqlQuery = @"select cts.CallTypeID, cts.ProductID from casetherapist_Subscriptions as subs with (NOLOCK) 
                                inner join casetherapist_CallTypes as cts with (NOLOCK) on subs.ProductID = cts.ProductID
                                where subs.ClarifyUsername = @clarifyusername";

            using (var connection = SqlHelper.GetOpenConnectionBBApps())
            {
                result = connection.Query<GetSubscriptionsModel>(sqlQuery, new { clarifyusername = clarifyUsername });
            }

            Clients.Client(Context.ConnectionId).mySubscriptions(result);
        }

    }
}