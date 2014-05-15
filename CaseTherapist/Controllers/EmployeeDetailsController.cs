using hapiservice.Helpers;
using hapiservice.Models;
using System.Web.Http;
namespace hapiservice.Controllers
{
    public class EmployeeDetailsController : ApiController
    {
        public EmployeeDetailModel Get([FromUri] string param)
        {
            return new EmployeeDetails().GetEmployeeDetails(param.ToLower());
        }      
    }
}
