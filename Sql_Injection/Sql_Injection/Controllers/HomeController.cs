using Sql_Injection.Models;
using System.Web.Mvc;

namespace Sql_Injection.Controllers
{
    public class HomeController : Controller
    {
        /// <summary>
        /// Function gets id to check with database
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public ActionResult Index(string id)
        {
            var model = new SqlViewModel();
            model.ID = id;
            if (id != null)
            {
                // TODO: make more secure
                if (id.Contains("&"))
                {
                    model.isValid = false;
                }
                else
                {
                    model.isValid = true;
                }
            }
            else
            {
                model.isValid = null;
            }
            return View(model);
        }

        [HttpPost]
        public ActionResult Index(SqlViewModel model)
        {
            if(model?.sqlQuery != null)
            {
                if(model.sqlQuery.Contains("&"))
                {
                    model.isValid = false;
                }
            }
            return View(model);
        }
    }
}