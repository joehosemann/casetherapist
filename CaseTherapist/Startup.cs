using System;
using System.Threading.Tasks;
using Microsoft.Owin;
using Owin;
using System.Collections.Generic;
using System.Linq;
using Dapper;
using hapiservice.Models;
using System.Timers;
using hapiservice.Hubs;
using System.Threading;
using Microsoft.AspNet.SignalR;


[assembly: OwinStartup(typeof(hapiservice.Startup))]

namespace hapiservice
{
    public class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            var hubConfiguration = new HubConfiguration();
            hubConfiguration.EnableDetailedErrors = true;
            app.MapSignalR(hubConfiguration);

            var queueBroadcastHub = new QueueBroadcastHub();
        }


    }
}