using Sql_Injection.Models;
using System.Web.Mvc;
using System;

namespace Sql_Injection.Controllers
{
    public class HomeController : Controller
    {
        /// <summary>
        /// Function gets id to check with database
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public ActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public ActionResult Index(SqlViewModel model)
        {
            if(model?.sqlQuery != null)
            {
                model.isValidQuery = validateSqlQuery(model.sqlQuery);
            }
            return View(model);
        }

        private bool? validateSqlQuery(string sqlQuery)
        {
            // TODO: more validation tests (use regex?)
            if (sqlQuery.Contains("&"))
            {
                return false;
            }
            else
            {
                return true;
            }
        }
    }
}