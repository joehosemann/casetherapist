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
    public class QueueBroadcastData
    {
        private static IEnumerable<CallTypeDetailModel> CallTypeDetails { get; set; }
        private static IEnumerable<DistinctProductsCallTypesModel> DistinctProductsCallTypes { get; set; }
        private const string clarifyQuery = "SELECT RouterCallsQNow as Quantity, ISNULL(DATEDIFF(second, RouterLongestCallQ, GETDATE()),'') as WaitTime, CallTypeID, CallsOfferedToday as Offered, CallsHandledToday as Handled, TotalCallsAbandToday as SLAbandoned, cast(isnull(cast(CallsHandledToday + CallsAtAgentNow as float)/nullif(cast(CallsOfferedToday as float),0)*100,100)as int) as PercentLive, convert(varchar,DATEADD(s,isnull(cast(AnswerWaitTimeToday/nullif(CallsAnsweredToday,0) as int),0),0),108) as AverageAnswer, convert(varchar,DATEADD(s,ISNULL(HandleTimeToday/nullif(CallsHandledToday,0),0),0),108) as HandleTime, convert(varchar,DATEADD(s,ISNULL(TalkTimeToday/nullif(CallsHandledToday,0),0),0),108) as TalkTime, str(ISNULL(ServiceLevelToday,1)*100,3,0) as ServiceLevel FROM t_Call_Type_Real_Time with (NOLOCK)";
        private const string ctProducts = @"select distinct prods.ID as ProductID, prods.Name as Product, cts.Name as CallType, CallTypeID = STUFF((SELECT ',' + CAST(CallTypeID as VARCHAR(10)) FROM casetherapist_CallTypes as cts2 where (cts2.IsDisabled is null OR cts2.IsDisabled = 0) AND prods.ID = cts2.ProductID AND cts2.Name = cts.Name FOR XML PATH('')), 1, 1, '') from casetherapist_Products prods inner join casetherapist_CallTypes cts on prods.ID = cts.ProductID order by prods.Name";

        public QueueBroadcastData()
        {
            // Pull products from CT database
            if (CallTypeDetails == null)
            {
                using (var connection = SqlHelper.GetOpenConnectionBBApps())
                {
                    CallTypeDetails = connection.Query<CallTypeDetailModel>(ctProducts);
                    //DistinctProductsCallTypes = (from a in CallTypeDetails select new DistinctProductsCallTypesModel { Product = a.Product, ProductID = a.ProductID, CallType = a.CallType }).Distinct();
                }
            }
        }


        public IEnumerable<CallTypeDetailModel> ParseQueueResults()
        {
        
            var resultList = new List<CallTypeDetailModel>();

            var myUtilities = new Utilities();

            IEnumerable<CallTypeDetailModel> queueData;
            // create connection
            using (var connection = SqlHelper.GetOpenConnectionEZView())
            {
                // get open connection
                if (connection.State == System.Data.ConnectionState.Open)
                {
                    queueData = (IEnumerable<CallTypeDetailModel>) connection.Query<CallTypeDetailModel>(clarifyQuery);
                }
                else
                {
                    // if no connection exist, return blank list
                    queueData = new List<CallTypeDetailModel>();
                }
            }

            foreach (var queue in CallTypeDetails)
            {               
                    var myQueue = new CallTypeDetailModel();
                    var queueIndex = 0;
                    var waitTime = new TimeSpan();
                    var quantity = 0;
                    var averageAnswerArray = new List<TimeSpan>();
                    var averageAnswer = new TimeSpan();
                    var handledTime = new TimeSpan();
                    var talkTime = new TimeSpan();
                    var handled = 0;
                    var offered = 0;
                    var percentLiveArray = new List<int>();
                    double percentLive;
                    var serviceLevelArray = new List<int>();
                    double serviceLevel;
                    var slabandonedArray = new List<int>();
                    double slabandoned;
                  
                    String[] arrayCallTypeID = queue.CallTypeID.Split(',');
                
                    foreach (var ctID in arrayCallTypeID)
                    {
                        var item = queueData.DefaultIfEmpty(null).FirstOrDefault(x => x.CallTypeID == ctID);
                        if (item != null)
                        {
                            TimeSpan _averageAnswer = myUtilities.StringToTimeSpan(item.AverageAnswer);
                            int _percentLive = 0;
                            int _serviceLevel = 0;
                            int _slabandoned = 0;
                            int.TryParse(item.PercentLive, out _percentLive);
                            int.TryParse(item.ServiceLevel, out _serviceLevel);
                            int.TryParse(item.SLAbandoned, out _slabandoned);

                            waitTime = myUtilities.MaxTimeSpan(item.WaitTime, waitTime);
                            quantity = myUtilities.CombineInt(item.Quantity, quantity);
                            averageAnswerArray.Add(_averageAnswer);
                            handled = myUtilities.CombineInt(item.Handled, handled);
                            handledTime = myUtilities.CombineTimeSpan(item.HandleTime, handledTime);
                            offered = myUtilities.CombineInt(item.Offered, offered);
                            percentLiveArray.Add(_percentLive);
                            serviceLevelArray.Add(_serviceLevel);
                            slabandonedArray.Add(_slabandoned);
                            talkTime = myUtilities.CombineTimeSpan(item.TalkTime, talkTime);

                            queueIndex++;
                        }
                    }

                    averageAnswer = myUtilities.AverageTimeSpanArray(averageAnswerArray);
                    percentLive = percentLiveArray.Average();
                    serviceLevel = serviceLevelArray.Average();
                    slabandoned = slabandonedArray.Average();

                    myQueue.CallTypeID = queue.CallTypeID.Replace(",","");
                    myQueue.Product = queue.Product;
                    myQueue.ProductID = queue.ProductID;
                    myQueue.CallType = queue.CallType;

                    myQueue.Quantity = quantity.ToString();
                    myQueue.WaitTime = waitTime.ToString(@"h\:mm\:ss");
                    myQueue.Offered = offered.ToString();
                    myQueue.Handled = handled.ToString();
                    myQueue.SLAbandoned = slabandoned.ToString();
                    myQueue.PercentLive = percentLive.ToString();
                    myQueue.AverageAnswer = averageAnswer.ToString(@"h\:mm\:ss");
                    myQueue.HandleTime = handledTime.ToString(@"h\:mm\:ss");
                    myQueue.TalkTime = talkTime.ToString(@"h\:mm\:ss");
                    myQueue.ServiceLevel = serviceLevel.ToString();

                    resultList.Add(myQueue);             
         
            }           
            return resultList;
        }
    }

    public class QueueBroadcastHub : Hub
    {
        public static readonly System.Timers.Timer _Timer = new System.Timers.Timer();

        static QueueBroadcastHub()
        {
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



            try
            {
                var data = new QueueBroadcastData().ParseQueueResults();

                hub.Clients.Group("all").updateAllProductQueue(data);

                foreach (var item in data)
                {
                    hub.Clients.Group(item.ProductID).updateProductQueue(item.Product, item.ProductID, item.CallType, item.Quantity, item.WaitTime);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
            }


        }

        public void JoinRoom(string roomName)
        {
            Groups.Add(Context.ConnectionId, roomName);
        }

        public void LeaveRoom(string roomName)
        {
            Groups.Remove(Context.ConnectionId, roomName);
        }

    }
}