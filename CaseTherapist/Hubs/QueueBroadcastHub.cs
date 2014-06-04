using hapiservice.Models;
using Dapper;
using Microsoft.AspNet.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Timers;
using System.Web;
using hapiservice.Helpers;

namespace hapiservice.Hubs
{
    public class QueueBroadcastHub : Hub
    {
        public static readonly System.Timers.Timer _Timer = new System.Timers.Timer();
        private static IEnumerable<CallTypeDetailModel> CallTypeDetails { get; set; }
        private static IEnumerable<DistinctProductsCallTypesModel> DistinctProductsCallTypes { get; set; }
        private const string query = "SELECT RouterCallsQNow as Quantity, ISNULL(DATEDIFF(second, RouterLongestCallQ, GETDATE()),'') as WaitTime, CallTypeID, CallsOfferedToday as Offered, CallsHandledToday as Handled, TotalCallsAbandToday as SLAbandoned, cast(isnull(cast(CallsHandledToday + CallsAtAgentNow as float)/nullif(cast(CallsOfferedToday as float),0)*100,100)as int) as PercentLive, convert(varchar,DATEADD(s,isnull(cast(AnswerWaitTimeToday/nullif(CallsAnsweredToday,0) as int),0),0),108) as AverageAnswer, convert(varchar,DATEADD(s,ISNULL(HandleTimeToday/nullif(CallsHandledToday,0),0),0),108) as HandleTime, convert(varchar,DATEADD(s,ISNULL(TalkTimeToday/nullif(CallsHandledToday,0),0),0),108) as TalkTime, str(ISNULL(ServiceLevelToday,1)*100,3,0) as ServiceLevel FROM t_Call_Type_Real_Time with (NOLOCK)";

        static QueueBroadcastHub()
        {
            var nquery = "select cts.CallTypeID, prods.ID as ProductID, prods.Name as Product, cts.Name as CallType from casetherapist_Products prods inner join casetherapist_CallTypes cts on prods.ID = cts.ProductID";
            using (var connection = SqlHelper.GetOpenConnectionBBApps())
            {
                CallTypeDetails = connection.Query<CallTypeDetailModel>(nquery);
                DistinctProductsCallTypes = (from a in CallTypeDetails select new DistinctProductsCallTypesModel { Product = a.Product, ProductID = a.ProductID, CallType = a.CallType }).Distinct();
            }

            _Timer.Interval = 1000;
            _Timer.Elapsed += TimerElapsed;
            _Timer.Start();
        }

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

        static void TimerElapsed(object sender, System.Timers.ElapsedEventArgs e)
        {
            var hub = GlobalHost.ConnectionManager.GetHubContext<QueueBroadcastHub>();

            IEnumerable<CallTypeDetailModel> queueData;
            using (var connection = SqlHelper.GetOpenConnectionEZView())
            {
                if (connection.State == System.Data.ConnectionState.Open)
                    queueData = connection.Query<CallTypeDetailModel>(query);
                else
                    queueData = new List<CallTypeDetailModel>();
            }
       
            var results = from a in queueData
                          join b in CallTypeDetails on a.CallTypeID equals b.CallTypeID
                          select new CallTypeDetailModel { CallTypeID = a.CallTypeID, CallType = b.CallType, ProductID = b.ProductID, Product = b.Product, Quantity = a.Quantity, WaitTime = a.WaitTime };

            var resultList = new List<CallTypeDetailModel>();

            foreach (var item in DistinctProductsCallTypes)
            {
                var temp = from a in results where a.Product == item.Product && a.CallType == item.CallType select a;
                if (temp.Count() > 1)
                {
                    TimeSpan waitTime = new TimeSpan();
                    int quantity = 0;
                    string callTypeID = "";

                    foreach (var tempitem in temp)
                    {
                       
                            

                        var tempCallTypeDetailModel = new CallTypeDetailModel();
                        
                        tempCallTypeDetailModel.Product = item.Product;
                        tempCallTypeDetailModel.ProductID = item.ProductID;
                        tempCallTypeDetailModel.CallType = item.CallType;
                        tempCallTypeDetailModel.AverageAnswer = "-";
                        tempCallTypeDetailModel.Handled = "-";
                        tempCallTypeDetailModel.HandleTime = "-";
                        tempCallTypeDetailModel.Offered = "-";
                        tempCallTypeDetailModel.PercentLive = "-";
                        tempCallTypeDetailModel.ServiceLevel = "-";
                        tempCallTypeDetailModel.SLAbandoned = "-";
                        tempCallTypeDetailModel.TalkTime = "-";

                        callTypeID += tempitem.CallTypeID;

                        TimeSpan thisWaitTime;
                        TimeSpan.TryParse(tempitem.WaitTime, out thisWaitTime);
                        if (waitTime < thisWaitTime)
                            waitTime = thisWaitTime;                       

                        int thisQuantity;
                        int.TryParse(tempitem.Quantity, out thisQuantity);
                        quantity += thisQuantity;

                        tempCallTypeDetailModel.CallTypeID = callTypeID;
                        tempCallTypeDetailModel.Quantity = quantity.ToString();
                        tempCallTypeDetailModel.WaitTime = waitTime.ToString(@"h\:mm\:ss");

                         var index = resultList.FindIndex(x=>x.Product == item.Product);
                        if (index > 0)
                        {
                            if (resultList[index].CallTypeID.IndexOf(tempitem.CallTypeID.ToString()) == -1)
                            {
                                resultList[index].CallTypeID += tempitem.CallTypeID;
                            }
                            
                            resultList[index].WaitTime = waitTime.ToString(@"h\:mm\:ss");
                            resultList[index].Quantity = quantity.ToString();
                        }
                        else
                        {
                            resultList.Add(tempCallTypeDetailModel);
                        }
                        
                    }
                   
                }
                else
                    resultList.AddRange(temp);
            }

            try
            {
                hub.Clients.Group("all").updateAllProductQueue(resultList);

                foreach (var item in resultList)
                {
                    hub.Clients.Group(item.ProductID).updateProductQueue(item.Product, item.ProductID, item.CallType, item.Quantity, item.WaitTime);
                }
            }
            catch (Exception)
            {               
            }
            

        }      

        public void JoinRoom(string roomName)
        {
            Groups.Add(Context.ConnectionId, roomName);
        }

        public void LeaveAllRooms()
        {
            foreach (var item in CallTypeDetails)
            {
                Groups.Remove(Context.ConnectionId, item.CallTypeID);
            }
        }
    }
}