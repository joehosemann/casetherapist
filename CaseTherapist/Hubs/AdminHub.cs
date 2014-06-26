using Dapper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.AspNet.SignalR;
using System.Data.SqlClient;
using System.IO;
using hapiservice.Helpers;

namespace hapiservice.Hubs
{
    public class AdminHub : Hub
    {
        private string pwd { get { return Properties.Settings.Default.password; } }
        private static List<string> _adminUsers;

        private List<string> adminUsers()
        {

            if (_adminUsers == null)
            {
                var list = new List<string>();
                var temp = Properties.Settings.Default.adminUsers;
                var array = temp.Split(',');
                foreach (var item in array)
                {
                    list.Add(item.ToLower());
                }
                _adminUsers = list;
            }
            return _adminUsers;
        }

        public void Server_ValidatePassword(string password)
        {
            if (password == pwd)
                Clients.Client(Context.ConnectionId).response_ValidatePassword(true);
            else
                Clients.Client(Context.ConnectionId).response_ValidatePassword(false);
        }

        public void Server_IsUserAdmin(string username)
        {
            var x = adminUsers();
            var y = x;


            foreach (var item in adminUsers())
            {
                if (item == username.ToLower())
                    Clients.Client(Context.ConnectionId).response_AdminUser("true");
            }


        }

        public void Server_GetProductData()
        {
            IEnumerable<ProductsModel> products;
            using (var connection = SqlHelper.GetOpenConnectionBBApps())
            {
                products = connection.Query<ProductsModel>(@"select ID, Name, MarketID, ISNULL(IsDisabled,0) as IsDisabled from casetherapist_Products with (nolock)");
            }

            Clients.Client(Context.ConnectionId).response_GetProductData(products);
        }

        public void Server_GetCallTypeData()
        {
            IEnumerable<CallTypesModel> callTypes;
            using (var connection = SqlHelper.GetOpenConnectionBBApps())
            {
                callTypes = connection.Query<CallTypesModel>(@"select ID, Name, CallTypeID, ProductID, ISNULL(IsDisabled,0) as IsDisabled from casetherapist_CallTypes with (nolock)");
            }

            Clients.Client(Context.ConnectionId).response_GetCallTypeData(callTypes);
        }

        public void Server_InsertProduct(string name, string marketID, string password)
        {
            if (password == pwd)
            {
                
                using (var connection = SqlHelper.GetOpenConnectionBBApps())
                {
                    connection.Execute(@"insert into casetherapist_Products (Name, MarketID, IsDisabled) VALUES (@Name, @MarketID, 0)",
                        new { Name = name, MarketID = marketID });
                }
                using (var connection = SqlHelper.GetOpenConnectionBBApps())
                {                    
                    var query = connection.Query(@"select top 1 ID from casetherapist_Products where Name = @Name", new { Name = name });
                    var results = query.DefaultIfEmpty("").FirstOrDefault();
                    Clients.Client(Context.ConnectionId).response_InsertProduct(results, name);
                }
                          
            }
        }

        public void Server_InsertCallType(string callType, string callTypeID, string productID, string password)
        {
            if (password == pwd)
            {                
                using (var connection = SqlHelper.GetOpenConnectionBBApps())
                {
                    connection.Execute(@"insert into casetherapist_CallTypes (Name, CallTypeID, ProductID, IsDisabled) VALUES (@Name, @CallTypeID, @ProductID, 0)",
                        new { Name = callType, CallTypeID = callTypeID, ProductID = productID });                   
                }
                using (var connection = SqlHelper.GetOpenConnectionBBApps())
                {
                    var query = connection.Query<CallTypesModel>(@"select top 1 ID, Name, CallTypeID, ProductID from casetherapist_CallTypes where CallTypeID = @CallTypeID and ProductID = @ProductID", new { CallTypeID = callTypeID, ProductID = productID });
                    var results = query.DefaultIfEmpty(new CallTypesModel()).FirstOrDefault();
                    Clients.Client(Context.ConnectionId).response_InsertCallType(results);
                }               
            }
        }

        public void Server_UpdateProduct(ProductsModel productData, string password)
        {
            if (password == pwd)
            {
                using (var connection = SqlHelper.GetOpenConnectionBBApps())
                {
                    connection.Execute(@"update casetherapist_Products set Name = @Name, MarketID = @MarketID",
                        new { Name = productData.Name, MarketID = productData.MarketID });
                }
                Clients.Client(Context.ConnectionId).response_UpdateProduct("Success");
            }
        }

        public void Server_UpdateCallType(CallTypesModel callTypeData, string password)
        {
            if (password == pwd)
            {
                using (var connection = SqlHelper.GetOpenConnectionBBApps())
                {
                    connection.Execute(@"update casetherapist_CallTypes set CallTypeID = @CallTypeID, ProductID = @ProductID, Name = @Name, IsDisabled = @IsDisabled",
                        new { CallTypeID = callTypeData.CallTypeID, ProductID = callTypeData.ProductID, Name = callTypeData.Name, IsDisabled = callTypeData.IsDisabled });
                }
                Clients.Client(Context.ConnectionId).response_UpdateCallType("Success");
            }
            Clients.Client(Context.ConnectionId).failure_Password("Wrong Password. Instance Logged.");
        }

        public void Server_RemoveProduct(int productID, string password)
        {
            if (password == pwd)
            {
                try
                {
                    using (var connection = SqlHelper.GetOpenConnectionBBApps())
                    {
                        connection.Execute(@"delete casetherapist_CallTypes where ProductID = @ProductID", new { ProductID = productID });
                    }
                    using (var connection = SqlHelper.GetOpenConnectionBBApps())
                    {
                        connection.Execute(@"delete casetherapist_Subscriptions where ProductID = @ProductID", new { ProductID = productID });
                    }
                    using (var connection = SqlHelper.GetOpenConnectionBBApps())
                    {
                        connection.Execute(@"delete casetherapist_Products where ID = @ProductID", new { ProductID = productID });
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine(ex);
                }
               
                Clients.Client(Context.ConnectionId).response_RemoveProduct(productID);
            }
            Clients.Client(Context.ConnectionId).failure_Password("Wrong Password. Instance Logged.");
        }

        public void Server_RemoveCallType(int ID, string password)
        {
            if (password == pwd)
            {
                using (var connection = SqlHelper.GetOpenConnectionBBApps())
                {
                    connection.Execute(@"delete casetherapist_CallTypes where ID = @ID", new { ID = ID });
                }
                Clients.Client(Context.ConnectionId).response_RemoveCallType(ID);
            }
            Clients.Client(Context.ConnectionId).failure_Password("Wrong Password. Instance Logged.");
        }

    }
    public class ProductsModel
    {
        public int ID { get; set; }
        public string Name { get; set; }
        public int MarketID { get; set; }
        public int IsDisabled { get; set; }
        //public List<CallTypesModel> CallTypes { get; set; }

    }
    public class CallTypesModel
    {
        public int ID { get; set; }
        public int CallTypeID { get; set; }
        public int ProductID { get; set; }
        public string Name { get; set; }
        public int IsDisabled { get; set; }
    }

}