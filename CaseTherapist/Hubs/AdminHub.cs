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
        public void GetProductCallTypes()
        {
            IEnumerable<ProductsModel> products;
            using (var connection = SqlHelper.GetOpenConnectionBBApps())
            {
                products = connection.Query<ProductsModel>(@"select * from casetherapist_Products with (nolock) where IsDisabled = 0 order by Name");
            }

            Clients.Client(Context.ConnectionId).receiveProductCallTypes(products);
        }

        public void GetCallTypeByProduct(int productID)
        {
            IEnumerable<CallTypesModel> callTypes;
            using (var connection = SqlHelper.GetOpenConnectionBBApps())
            {
                callTypes = connection.Query<CallTypesModel>(@"select * from casetherapist_CallTypes with (nolock) where IsDisabled = 0 and ID = @ID order by Name", new { ID = productID });
            }

            Clients.Client(Context.ConnectionId).receiveCallTypeByProduct(callTypes);
        }

        public void UpdateProduct(ProductsModel productData, string password)
        {
            if (password == "hosema")
            {
                using (var connection = SqlHelper.GetOpenConnectionBBApps())
                {
                    connection.Execute(@"update casetherapist_Products set Name = @Name, MarketID = @MarketID, IsDisabled = @IsDisabled",
                        new { Name = productData.Name, MarketID = productData.MarketID, IsDisabled = productData.IsDisabled });
                }
            }

        }

        public void UpdateCallType(CallTypesModel callTypeData, string password)
        {
            if (password == "hosema")
            {
                using (var connection = SqlHelper.GetOpenConnectionBBApps())
                {
                    connection.Execute(@"update casetherapist_CallTypeData set CallTypeID = @CallTypeID, ProductID = @ProductID, Name = @Name, IsDisabled = @IsDisabled",
                        new { CallTypeID = callTypeData.CallTypeID, ProductID = callTypeData.ProductID, Name = callTypeData.Name, IsDisabled = callTypeData.IsDisabled });
                }
            }

        }

    }
    public class ProductsModel
    {
        public int ID { get; set; }
        public string Name { get; set; }
        public int MarketID { get; set; }
        public int IsDisabled { get; set; }
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