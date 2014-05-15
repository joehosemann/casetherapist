using Dapper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.AspNet.SignalR;
using hapiservice.Models;
using System.Data.SqlClient;
using System.IO;
using hapiservice.Helpers;

namespace hapiservice.Hubs
{
    public class UserOptionsHub : Hub
    {
        public void GetData(string clarifyUsername)
        {
            IEnumerable<ProductsModel> products;
            IEnumerable<UserDetailsModel> userDetails;
            IEnumerable<GetSubscriptionsModel> subscriptions;

            using (var connection = SqlHelper.GetOpenConnectionBBApps())
            {
                products = connection.Query<ProductsModel>(@"select ID, Name from casetherapist_Products with (nolock) where IsDisabled = 0 order by Name");
            }

            using (var connection = SqlHelper.GetOpenConnectionBBApps())
            {
                userDetails = connection.Query<UserDetailsModel>("select * from casetherapist_UserDetails with (nolock) where ClarifyUsername = @clarifyUsername", new { clarifyUsername = clarifyUsername });
            }

            var sqlQuery = @"select cts.CallTypeID, cts.ProductID from casetherapist_Subscriptions as subs with (NOLOCK) 
                                inner join casetherapist_CallTypes as cts with (NOLOCK) on subs.ProductID = cts.ProductID
                                where subs.ClarifyUsername = @clarifyusername";

            using (var connection = SqlHelper.GetOpenConnectionBBApps())
            {
                subscriptions = connection.Query<GetSubscriptionsModel>(sqlQuery, new { clarifyusername = clarifyUsername });
            }

            Clients.Client(Context.ConnectionId).getData(products, userDetails.DefaultIfEmpty(new UserDetailsModel()).FirstOrDefault(), subscriptions.DefaultIfEmpty(new GetSubscriptionsModel()));

        }

        public void SetData(UserDetailsModel userDetails, IEnumerable<string> subscriptions, string clarifyPassword)
        {
            var successfulLogin = false;
            var sbSubscriptions = new System.Text.StringBuilder();

            if (clarifyPassword.Count() > 30)
                Clients.Client(Context.ConnectionId).statusMessage("Clarify Password Failed!");

            if (Properties.Settings.Default.ClarifyAuth)
            {
                var connectionString = string.Format(@"Data Source=chsclysql;Initial Catalog=ClarifyMain;Persist Security Info=True;User ID={0};Password={1}", userDetails.ClarifyUsername, clarifyPassword);
                var clyconnection = new SqlConnection(connectionString.ToString());
                clyconnection.Open();

                using (clyconnection)
                {
                    clyconnection.FireInfoMessageEventOnUserErrors = true;
                    clyconnection.InfoMessage += bbappsconnection_InfoMessage;
                    successfulLogin = clyconnection.Query<int>("select top 1 'success' from table_case").First().Equals("success");
                }

            }
            if (successfulLogin || Properties.Settings.Default.ClarifyAuth == false)
            {                
                var sql = @"IF (SELECT COUNT(*) FROM casetherapist_UserDetails WHERE ClarifyUsername = @ClarifyUsername) > 0
                            update casetherapist_UserDetails set [CiscoExtension] = @CiscoExtension,[BusinessUnit] = @BusinessUnit,[BluePumpkinUsername] = @BluePumpkinUsername,[ApplicationBG] = @ApplicationBG,[QueueBG] = @QueueBG,[QueueFG] = @QueueFG,[InactiveCallTypeBG] = @InactiveCallTypeBG,[InactiveCallTypeFG] = @InactiveCallTypeFG,[ActiveCallTypeBG] = @ActiveCallTypeBG,[ActiveCallTypeFG] = @ActiveCallTypeFG,[ExtendedCallTypeBG] = @ExtendedCallTypeBG,[ExtendedCallTypeFG] = @ExtendedCallTypeFG WHERE ClarifyUsername = @ClarifyUsername
                            else 
                            insert into casetherapist_UserDetails ([ClarifyUsername],[CiscoExtension],[BusinessUnit],[BluePumpkinUsername],[ApplicationBG],[QueueBG],[QueueFG],[InactiveCallTypeBG],[InactiveCallTypeFG],[ActiveCallTypeBG],[ActiveCallTypeFG],[ExtendedCallTypeBG],[ExtendedCallTypeFG]) VALUES (@ClarifyUsername,@CiscoExtension,@BusinessUnit,@BluePumpkinUsername,@ApplicationBG,@QueueBG,@QueueFG,@InactiveCallTypeBG,@InactiveCallTypeFG,@ActiveCallTypeBG,@ActiveCallTypeFG,@ExtendedCallTypeBG,@ExtendedCallTypeFG)
                            ";

                using (var bbappsconnection = SqlHelper.GetOpenConnectionBBApps())
                {
                    bbappsconnection.FireInfoMessageEventOnUserErrors = true;
                    bbappsconnection.InfoMessage += bbappsconnection_InfoMessage;
                    bbappsconnection.Execute(sql, new { ClarifyUsername = userDetails.ClarifyUsername, CiscoExtension = userDetails.CiscoExtension, BusinessUnit = userDetails.BusinessUnit, BluePumpkinUsername = userDetails.BluePumpkinUsername, ApplicationBG = userDetails.ApplicationBG, QueueBG = userDetails.QueueBG, QueueFG = userDetails.QueueFG, InactiveCallTypeBG = userDetails.InactiveCallTypeBG, InactiveCallTypeFG = userDetails.InactiveCallTypeFG, ActiveCallTypeBG = userDetails.ActiveCallTypeBG, ActiveCallTypeFG = userDetails.ActiveCallTypeFG, ExtendedCallTypeBG = userDetails.ExtendedCallTypeBG, ExtendedCallTypeFG = userDetails.ExtendedCallTypeFG });
                  
                }

                Clients.Client(Context.ConnectionId).statusMessage("Successfully Updated Details.");
            }
            else if (!successfulLogin)
            {
                Clients.Client(Context.ConnectionId).statusMessage("Clarify Password Failed!");
            }


            using (var bbappsconnection = SqlHelper.GetOpenConnectionBBApps())
            {
                bbappsconnection.FireInfoMessageEventOnUserErrors = true;
                bbappsconnection.InfoMessage += bbappsconnection_InfoMessage;
                bbappsconnection.Execute("delete from casetherapist_Subscriptions where ClarifyUsername = @ClarifyUsername", new { ClarifyUsername = userDetails.ClarifyUsername });
                foreach (var sub in subscriptions)
                {
                    bbappsconnection.Execute("INSERT INTO [dbo].[casetherapist_Subscriptions] ([ClarifyUsername], [ProductID]) VALUES (@ClarifyUsername, @ProductID) ", new { ClarifyUsername = userDetails.ClarifyUsername, ProductID = sub });
                }
            }
        }

        void bbappsconnection_InfoMessage(object sender, SqlInfoMessageEventArgs e)
        {
            Clients.Client(Context.ConnectionId).clientConsole(e.Message);
            Clients.Client(Context.ConnectionId).clientConsole(e.Errors);
        }

        public void Test(string test)
        {
            Clients.Client(Context.ConnectionId).status("server responds: " + test);
        }

    }
}