using System;
using Sql_Injection.Models;
using System.Collections.Generic;
using System.Web.Mvc;

namespace Sql_Injection.Controllers
{
    public class HomeController : Controller
    {
        /// <summary>
        /// Function gets id to check with database
        /// </summary>
        /// <returns></returns>
        public ActionResult Index()
        {
            return View(new SqlViewModel());
        }

        [HttpPost]
        public ActionResult Index(SqlViewModel model)
        {
            if (model?.sqlQuery != null)
            {
                // TODO: change method naming convention
                model.isValidQuery = ValidateSqlQuery(model.sqlQuery);
            }
            return View(model);
        }

        private bool? ValidateSqlQuery(string sqlQuery)
        {
            // equalize string for parsing
            sqlQuery = sqlQuery.ToLower();

            var indexOfWhereClause = sqlQuery.IndexOf("where", StringComparison.Ordinal); // reduce the amount tested
            if (indexOfWhereClause == -1) // if no where clause the query must be logically secure
                return true;

            indexOfWhereClause += "where".Length;

            // get everything after "where" clause
            sqlQuery = sqlQuery.Substring(indexOfWhereClause, sqlQuery.Length - indexOfWhereClause);

            // resolve issues that may occur between the parser and the query
            sqlQuery = sqlQuery
                .Replace(";", "")
                .Replace("\"", "'");
            return IsValidExpression(sqlQuery);
        }

        private bool? IsValidExpression(string sqlQuery)
        {
            List<string> expressionList = sqlQuery.MultiSplit(new string[] { "and", "or" });

            string[] stdOperaterToken = { "=", "like","not like", "<>", "!=", ">", "<", ">=", "<=" };
            foreach (var item in expressionList)
            {
                var expressionHasOnlyConst = false;
                foreach (var operand in item.MultiSplit(stdOperaterToken))
                {
                    if(!HasSqlConstants(operand))
                        expressionHasOnlyConst = true;
                }
                if (!expressionHasOnlyConst)
                    return false;
            }
            return true;
        }

        private bool HasSqlConstants(string value)
        {
            const string quoteMark = "'";

            /*
             * if both have quote marks then they are strings
             * if no quote marks they must be integers
             * if function then will have () function(3 * function(3)) must be either function or constant to fail
             */

            // TODO: add arithmetic operations (e.g. 3 * 3) Hint: recursion may be required
            if (value.Contains("(")) //function fragment 
            {
                // TODO: add functions (e.g. fun(value * fun(3))) Hint: recursion may be needed
                    // function seen as constant
            }
            else if (value.Contains(quoteMark))
            { // then is string => constant
                return true;
            }
            else
            {
                double placeHold; // only used to satisfy function parameter
                if (double.TryParse(value, out placeHold))
                    return true; // if integer => constant
            }
            return false; // couldn't find constant
        }
    }
}