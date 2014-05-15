using System;
using System.Collections.Generic;
using System.Linq;
using hapiservice.Models;
using System.Net;
using Dapper;
using System.Net.Http;
using System.Web.Http;
using Newtonsoft.Json.Linq;



//  NO LONGER USED.  REPLACED WITH USER OPTIONS.



namespace hapiservice.Controllers
{
    public class UsersController : ApiController
    {
        // GET hapi/user
        public IEnumerable<UserModel> Get()
        {
            using (var connection = Helpers.SqlHelper.GetOpenConnectionBBApps())
            {                
                return connection.Query<UserModel>("select * from casetherapist_UserDetails");
            }
        }

        // GET hapi/user/josephho
        public UserModel Get(string param)
        {
            using (var connection = Helpers.SqlHelper.GetOpenConnectionBBApps())
            {
                var result = connection.Query<UserModel>("select * from casetherapist_UserDetails");

                if (result.Count() > 0)
                {
                    return connection.Query<UserModel>("select * from casetherapist_UserDetails where clarifyusername = @param", new { param = param }).FirstOrDefault();
                }
                else
                {
                    return new UserModel { ClarifyUsername = "-1", CiscoExtension = "-1", BusinessUnit = "-1", ChangedByIP = "-1", BluePumpkinUsername = "-1" };
                }
            }
        }

        // POST api/values
        // Posting multiple parameters is not inheriently supported in WebAPI.
        // http://weblog.west-wind.com/posts/2012/May/08/Passing-multiple-POST-parameters-to-Web-API-Controller-Methods

        //$.ajax(
        //{
        //    url: "http://bbecweb:8014/hapi/Users",
        //    type: "POST",
        //    contentType: "application/json",
        //    data: JSON.stringify('{"UserDetails":{"ClarifyUsername":"josephho","CiscoExtension":"1234","BusinessUnit":"ECBU","ChangedByIP":"127.0.0.1","BluePumpkinUsername":"josephho"}}'),
        //     success: function (result) {
        //        alert(result);
        //    }
        //});

//        [HttpPost]
//        public string Post(JObject jsonData)
//        {
            
//                dynamic json = jsonData;
//                JObject juserdetails = json.UserDetails;
//                var userdetails = juserdetails.ToObject<UserModel>();
           
          
//            if (string.IsNullOrEmpty(userdetails.ClarifyUsername) || 
//                string.IsNullOrEmpty(userdetails.CiscoExtension) || 
//                string.IsNullOrEmpty(userdetails.BusinessUnit) || 
//                string.IsNullOrEmpty(userdetails.ChangedByIP) || 
//                string.IsNullOrEmpty(userdetails.BluePumpkinUsername))
//            {
//                return "Error: Null inputs";
//            }
           

//            using (var connection = Helpers.SqlHelper.GetOpenConnectionHapiLocalDB())
//            {
//                var userExists = connection.Query<UserModel>("select ClarifyUsername from userdetails where ClarifyUsername = @param", new { param = userdetails.ClarifyUsername });
//                if (userExists.Count() > 0)
//                {
//                    connection.Execute(@"UPDATE UserDetails 
//                                            SET CiscoExtension = @ciscoextension
//                                                , BusinessUnit = @businessunit
//                                                , ChangedByIP = @changedbyip
//                                                , BluePumpkinUsername = @bluepumpkinusername
//                                            WHERE clarifyusername = @param", new
//                                                                           {
//                                                                               param = userdetails.ClarifyUsername,
//                                                                               ciscoextension = userdetails.CiscoExtension,
//                                                                               businessunit = userdetails.BusinessUnit,
//                                                                               changedbyip = userdetails.ChangedByIP,
//                                                                               bluepumpkinusername = userdetails.BluePumpkinUsername
//                                                                           });
//                }
//                else
//                {
//                    connection.Execute(@"INSERT INTO UserDetails (
//                                        [ClarifyUsername],[CiscoExtension],[BusinessUnit],[ChangedByIP],[BluePumpkinUsername])
//                                        VALUES (@param,@ciscoextension,@businessunit,@changedbyip,@bluepumpkinusername)", 
//                                        new
//                                          {
//                                              param = userdetails.ClarifyUsername,
//                                              ciscoextension = userdetails.CiscoExtension,
//                                              businessunit = userdetails.BusinessUnit,
//                                              changedbyip = userdetails.ChangedByIP,
//                                              bluepumpkinusername = userdetails.BluePumpkinUsername
//                                          });


//                }


//            }

//            return "updated user: " + userdetails.ClarifyUsername;

//        }
    }
}
