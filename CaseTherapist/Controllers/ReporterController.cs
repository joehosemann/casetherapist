using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace hapiservice.Controllers
{
    public class ReporterController : Controller
    {
        public ActionResult Index()
        {
            ViewBag.Title = "CaseTherapist - Individual View";

            return View();
        }
        public ActionResult Team()
        {
            ViewBag.Title = "CaseTherapist - Team View";

            return View();
        }
        public ActionResult Site()
        {
            ViewBag.Title = "CaseTherapist - Site View";

            return View();
        }
        public ActionResult Tams()
        {
            ViewBag.Title = "CaseTherapist - TAM View";

            return View();
        }
    }

}
